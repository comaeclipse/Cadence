"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Clock, X, Trash2, Pencil } from 'lucide-react';
import { MobileLayout } from '@/components/mobile-layout';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { DurationPicker } from '@/components/ui/duration-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ExpansionLevel = 'collapsed' | 'category' | 'incident' | 'poop' | 'food';
type EntryType = 'incident' | 'poop' | 'food';

interface Entry {
  id: string;
  entryType: EntryType;
  date: string;
  time: string;
  // Incident fields
  type?: string[];
  duration?: string;
  trigger?: string;
  notes?: string;
  consequence?: string[];
  customConsequence?: string;
  // Poop fields
  consistency?: string;
  // Food fields
  foodItem?: string;
  amountConsumed?: string;
}

interface ApiIncident {
  id: string;
  childId: string;
  timestamp: string | Date;
  type?: string[];
  intensity: number;
  duration?: number | null;
  trigger?: string;
  notes?: string;
  consequence?: string[];
  customConsequence?: string;
  behaviorText?: string;
  durationSec?: number | null;
  [key: string]: unknown;
}

interface ApiPoop {
  id: string;
  childId: string;
  timestamp: string | Date;
  consistency: string;
  notes?: string;
  [key: string]: unknown;
}

interface ApiFood {
  id: string;
  childId: string;
  timestamp: string | Date;
  foodItem: string;
  amountConsumed: string;
  notes?: string;
  [key: string]: unknown;
}

export default function Home() {
  const consequenceRef = useRef<HTMLDivElement>(null);

  // Helper function to convert API response to entries
  const convertApiResponseToEntries = (incidents: ApiIncident[], poops: ApiPoop[], foods: ApiFood[]): Entry[] => {
    const formatDuration = (secs: number | null | undefined) => {
      if (!secs || secs === 0) return '';
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      if (mins === 0) return `${remainingSecs}s`;
      if (remainingSecs === 0) return `${mins}m`;
      return `${mins}m ${remainingSecs}s`;
    };

    const convertedIncidents: Entry[] = incidents.map((incident) => ({
      id: incident.id,
      entryType: 'incident',
      type: incident.behaviorText ? incident.behaviorText.split(', ') : [],
      duration: formatDuration(incident.durationSec),
      trigger: '',
      notes: incident.notes || '',
      consequence: [],
      customConsequence: '',
      date: new Date(incident.timestamp).toISOString().split('T')[0],
      time: new Date(incident.timestamp).toTimeString().slice(0, 5)
    }));

    const convertedPoops: Entry[] = poops.map((poop) => ({
      id: poop.id,
      entryType: 'poop',
      consistency: poop.consistency,
      notes: poop.notes || '',
      date: new Date(poop.timestamp).toISOString().split('T')[0],
      time: new Date(poop.timestamp).toTimeString().slice(0, 5)
    }));

    const convertedFoods: Entry[] = foods.map((food) => ({
      id: food.id,
      entryType: 'food',
      foodItem: food.foodItem,
      amountConsumed: food.amountConsumed,
      notes: food.notes || '',
      date: new Date(food.timestamp).toISOString().split('T')[0],
      time: new Date(food.timestamp).toTimeString().slice(0, 5)
    }));

    const allEntries = [...convertedIncidents, ...convertedPoops, ...convertedFoods];
    allEntries.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return allEntries;
  };

  const [expansionLevel, setExpansionLevel] = useState<ExpansionLevel>('collapsed');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null);

  const [formData, setFormData] = useState({
    entryType: '' as EntryType | '',
    type: [] as string[],
    duration: '',
    durationSeconds: 0,
    trigger: '',
    notes: '',
    consistency: '',
    consequence: [] as string[],
    customConsequence: '',
    foodItem: '',
    amountConsumed: '',
    timestamp: new Date()
  });

  const behaviorTypes = ['Meltdown', 'Sensory Overload', 'Anxiety', 'Aggression', 'Self-Stimulation', 'Other'];
  const consistencyTypes = ['Soft', 'Normal', 'Hard', 'Formed', 'Loose', 'Watery'];
  const consequenceOptions = ['Gave attention', 'Break/help', 'Preferred item', 'Redirected', 'Ignored', 'Emotion cards', 'other/custom'];

  // Load entries from API on mount
  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch('/api/entries');

        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }

        const { incidents, poops, foods } = await response.json();
        const allEntries = convertApiResponseToEntries(incidents, poops, foods);
        setEntries(allEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, []);

  const handleSubmit = async () => {
    if (formData.entryType === 'incident' && formData.type.length > 0) {
      console.log('Starting incident save...');

      const formatDuration = (secs: number) => {
        if (secs === 0) return '';
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        if (mins === 0) return `${remainingSecs}s`;
        if (remainingSecs === 0) return `${mins}m`;
        return `${mins}m ${remainingSecs}s`;
      };

      // Create optimistic UI entry
      const newEntry: Entry = {
        id: `temp-${Date.now()}`,
        entryType: 'incident',
        type: formData.type,
        duration: formatDuration(formData.durationSeconds),
        trigger: formData.trigger,
        notes: formData.notes,
        consequence: formData.consequence,
        customConsequence: formData.customConsequence,
        date: formData.timestamp.toISOString().split('T')[0],
        time: formData.timestamp.toTimeString().slice(0, 5)
      };

      // Store old entries for rollback if needed
      const oldEntries = entries;

      // Add to UI immediately for responsiveness
      setEntries([newEntry, ...entries]);

      try {
        // Get or create default child
        console.log('Fetching children...');
        const childResponse = await fetch('/api/children');
        let childId = '';

        if (!childResponse.ok) {
          const errorText = await childResponse.text();
          console.error('Failed to fetch children:', childResponse.status, errorText);
          throw new Error(`Failed to fetch children: ${childResponse.status}`);
        }

        const children = await childResponse.json();
        console.log('Children found:', children.length);

        if (children.length > 0) {
          childId = children[0].id;
          console.log('Using existing child:', childId);
        } else {
          // Create default child if none exists
          console.log('Creating default child...');
          const createChildResponse = await fetch('/api/children', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Default Child' }),
          });

          if (!createChildResponse.ok) {
            const errorText = await createChildResponse.text();
            console.error('Failed to create child:', createChildResponse.status, errorText);
            throw new Error(`Failed to create child: ${createChildResponse.status}`);
          }

          const newChild = await createChildResponse.json();
          childId = newChild.id;
          console.log('Created new child:', childId);
        }

        if (!childId) {
          throw new Error('Failed to get or create child - no ID returned');
        }

        // Build notes with trigger if provided
        let fullNotes = formData.notes || '';
        if (formData.trigger) {
          fullNotes = `Trigger: ${formData.trigger}${fullNotes ? '\n' + fullNotes : ''}`;
        }

        // Build consequence text for notes
        if (formData.consequence.length > 0) {
          const consequenceText = formData.consequence.includes('other/custom') && formData.customConsequence
            ? formData.consequence.filter(c => c !== 'other/custom').concat(formData.customConsequence).join(', ')
            : formData.consequence.join(', ');
          fullNotes = fullNotes ? `${fullNotes}\nConsequence: ${consequenceText}` : `Consequence: ${consequenceText}`;
        }

        // Save to database
        console.log('Saving incident to database...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const incidentData: any = {
          childId,
          timestamp: formData.timestamp.toISOString(),
          behaviorText: formData.type.join(', '),
          functionHypothesis: 'unknown',
          tags: [],
        };

        // Only add optional fields if they have values
        if (formData.durationSeconds && formData.durationSeconds > 0) {
          incidentData.durationSec = formData.durationSeconds;
        }
        if (fullNotes) {
          incidentData.notes = fullNotes;
        }

        console.log('Incident data:', incidentData);

        const response = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incidentData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to save incident:', response.status, errorText);
          throw new Error(`Failed to save incident: ${response.status} - ${errorText}`);
        }

        const savedIncident = await response.json();
        console.log('Incident saved successfully:', savedIncident.id);

        // Reload all entries from database to stay in sync
        console.log('Reloading all entries from database...');
        const reloadResponse = await fetch('/api/entries');

        if (reloadResponse.ok) {
          const { incidents, poops, foods } = await reloadResponse.json();
          console.log('Loaded entries:', incidents.length, poops.length, foods.length);
          const allEntries = convertApiResponseToEntries(incidents, poops, foods);
          setEntries(allEntries);
        } else {
          console.error('Failed to reload entries');
        }

        // Reset form on success
        setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
        setExpansionLevel('collapsed');
        console.log('Incident save complete!');
      } catch (error) {
        console.error('Error saving incident:', error);
        // Revert to old entries on error
        setEntries(oldEntries);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to save incident: ${errorMessage}\n\nPlease check the browser console for details.`);
      }
    }
  };

  const handlePoopSubmit = async (consistency: string) => {
    console.log('Starting poop save...');

    // Create optimistic UI entry
    const newEntry: Entry = {
      id: `temp-poop-${Date.now()}`,
      entryType: 'poop',
      consistency,
      date: formData.timestamp.toISOString().split('T')[0],
      time: formData.timestamp.toTimeString().slice(0, 5)
    };

    // Store old entries for rollback if needed
    const oldEntries = entries;

    // Add to UI immediately for responsiveness
    setEntries([newEntry, ...entries]);

    try {
      // Get or create default child
      console.log('Fetching children...');
      const childResponse = await fetch('/api/children');
      let childId = '';

      if (!childResponse.ok) {
        const errorText = await childResponse.text();
        console.error('Failed to fetch children:', childResponse.status, errorText);
        throw new Error(`Failed to fetch children: ${childResponse.status}`);
      }

      const children = await childResponse.json();
      console.log('Children found:', children.length);

      if (children.length > 0) {
        childId = children[0].id;
        console.log('Using existing child:', childId);
      } else {
        // Create default child if none exists
        console.log('Creating default child...');
        const createChildResponse = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Default Child' }),
        });

        if (!createChildResponse.ok) {
          const errorText = await createChildResponse.text();
          console.error('Failed to create child:', createChildResponse.status, errorText);
          throw new Error(`Failed to create child: ${createChildResponse.status}`);
        }

        const newChild = await createChildResponse.json();
        childId = newChild.id;
        console.log('Created new child:', childId);
      }

      if (!childId) {
        throw new Error('Failed to get or create child - no ID returned');
      }

      // Save to database
      console.log('Saving poop to database...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poopData: any = {
        childId,
        timestamp: formData.timestamp.toISOString(),
        consistency,
      };

      if (formData.notes) {
        poopData.notes = formData.notes;
      }

      console.log('Poop data:', poopData);

      const response = await fetch('/api/poops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poopData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save poop:', response.status, errorText);
        throw new Error(`Failed to save poop: ${response.status} - ${errorText}`);
      }

      const savedPoop = await response.json();
      console.log('Poop saved successfully:', savedPoop.id);

      // Reload all entries from database to stay in sync
      console.log('Reloading all entries from database...');
      const reloadResponse = await fetch('/api/entries');
      if (reloadResponse.ok) {
        const { incidents, poops, foods } = await reloadResponse.json();
        console.log('Loaded entries:', incidents.length, poops.length, foods.length);
        const allEntries = convertApiResponseToEntries(incidents, poops, foods);
        setEntries(allEntries);
      } else {
        console.error('Failed to reload entries:', reloadResponse.status);
      }

      // Reset form on success
      setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
      setExpansionLevel('collapsed');
      toast.success('Poop logged successfully');
      console.log('Poop save complete!');
    } catch (error) {
      console.error('Error saving poop:', error);
      // Revert to old entries on error
      setEntries(oldEntries);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save poop: ${errorMessage}`);
    }
  };

  const handleFoodSubmit = async () => {
    if (!formData.foodItem || !formData.amountConsumed) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log('Starting food save...');

    // Create optimistic UI entry
    const newEntry: Entry = {
      id: `temp-food-${Date.now()}`,
      entryType: 'food',
      foodItem: formData.foodItem,
      amountConsumed: formData.amountConsumed,
      notes: formData.notes,
      date: formData.timestamp.toISOString().split('T')[0],
      time: formData.timestamp.toTimeString().slice(0, 5)
    };

    // Store old entries for rollback if needed
    const oldEntries = entries;

    // Add to UI immediately for responsiveness
    setEntries([newEntry, ...entries]);

    try {
      // Get or create default child
      console.log('Fetching children...');
      const childResponse = await fetch('/api/children');
      let childId = '';

      if (!childResponse.ok) {
        const errorText = await childResponse.text();
        console.error('Failed to fetch children:', childResponse.status, errorText);
        throw new Error(`Failed to fetch children: ${childResponse.status}`);
      }

      const children = await childResponse.json();
      console.log('Children found:', children.length);

      if (children.length > 0) {
        childId = children[0].id;
        console.log('Using existing child:', childId);
      } else {
        // Create default child if none exists
        console.log('Creating default child...');
        const createChildResponse = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Default Child' }),
        });

        if (!createChildResponse.ok) {
          const errorText = await createChildResponse.text();
          console.error('Failed to create child:', createChildResponse.status, errorText);
          throw new Error(`Failed to create child: ${createChildResponse.status}`);
        }

        const newChild = await createChildResponse.json();
        childId = newChild.id;
        console.log('Created new child:', childId);
      }

      if (!childId) {
        throw new Error('Failed to get or create child - no ID returned');
      }

      // Save to database
      console.log('Saving food to database...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const foodData: any = {
        childId,
        timestamp: formData.timestamp.toISOString(),
        foodItem: formData.foodItem,
        amountConsumed: formData.amountConsumed,
      };

      if (formData.notes) {
        foodData.notes = formData.notes;
      }

      console.log('Food data:', foodData);

      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save food:', response.status, errorText);
        throw new Error(`Failed to save food: ${response.status} - ${errorText}`);
      }

      const savedFood = await response.json();
      console.log('Food saved successfully:', savedFood.id);

      // Reload all entries from database to stay in sync
      console.log('Reloading all entries from database...');
      const reloadResponse = await fetch('/api/entries');
      if (reloadResponse.ok) {
        const { incidents, poops, foods } = await reloadResponse.json();
        console.log('Loaded entries:', incidents.length, poops.length, foods.length);
        const allEntries = convertApiResponseToEntries(incidents, poops, foods);
        setEntries(allEntries);
      } else {
        console.error('Failed to reload entries:', reloadResponse.status);
      }

      // Reset form on success
      setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
      setExpansionLevel('collapsed');
      toast.success('Food logged successfully');
      console.log('Food save complete!');
    } catch (error) {
      console.error('Error saving food:', error);
      // Revert to old entries on error
      setEntries(oldEntries);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save food: ${errorMessage}`);
    }
  };

  const handleEditClick = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setEntryToEdit(entry);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteClick = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      // Determine entry type based on current entries
      const entryToRemove = entries.find(e => e.id === entryToDelete);
      if (!entryToRemove) {
        throw new Error('Entry not found');
      }

      let endpoint = '';
      let entryType = '';

      if (entryToRemove.entryType === 'incident') {
        endpoint = `/api/incidents/${entryToDelete}`;
        entryType = 'Incident';
      } else if (entryToRemove.entryType === 'poop') {
        endpoint = `/api/poops/${entryToDelete}`;
        entryType = 'Poop entry';
      } else if (entryToRemove.entryType === 'food') {
        endpoint = `/api/foods/${entryToDelete}`;
        entryType = 'Food entry';
      }

      if (!endpoint) {
        throw new Error('Unknown entry type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${entryType.toLowerCase()}`);
      }

      toast.success(`${entryType} deleted successfully`);

      // Reload all entries from database
      const reloadResponse = await fetch('/api/entries');
      if (reloadResponse.ok) {
        const { incidents, poops, foods } = await reloadResponse.json();
        const allEntries = convertApiResponseToEntries(incidents, poops, foods);
        setEntries(allEntries);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete entry: ${errorMessage}`);
    } finally {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-xs text-gray-600 mt-1">This Week</div>
          </div>
          <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
            <div className="text-2xl font-bold text-gray-900">6.2</div>
            <div className="text-xs text-gray-600 mt-1">Avg Duration</div>
          </div>
          <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
            <div className="text-2xl font-bold text-emerald-700">↓ 12%</div>
            <div className="text-xs text-gray-600 mt-1">vs Last Week</div>
          </div>
        </div>

        {/* Expandable Add Section */}
        <div
          className={`bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl shadow-lg transition-all duration-500 ease-in-out overflow-hidden ${
            expansionLevel !== 'collapsed' ? 'p-6' : 'p-4'
          }`}
          style={{
            maxHeight: expansionLevel === 'collapsed' ? '70px' : '2000px',
          }}
        >
          {/* Level 0: Collapsed - "add..." Button */}
          {expansionLevel === 'collapsed' && (
            <button
              onClick={() => setExpansionLevel('category')}
              className="w-full bg-stone-50 text-emerald-800 rounded-lg py-2 px-4 font-semibold flex items-center justify-center gap-2 active:bg-stone-100 transition"
            >
              <Plus className="w-5 h-5" />
              add...
            </button>
          )}

          {/* Level 1: Category Selection */}
          {expansionLevel === 'category' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-50">What would you like to log?</h3>
                <button
                  onClick={() => {
                    setExpansionLevel('collapsed');
                    setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setFormData({...formData, entryType: 'incident'});
                      setExpansionLevel('incident');
                    }}
                    className="py-8 px-4 rounded-lg border-2 border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50 text-lg font-semibold transition"
                  >
                    Incident
                  </button>
                  <button
                    onClick={() => {
                      setFormData({...formData, entryType: 'poop'});
                      setExpansionLevel('poop');
                    }}
                    className="py-8 px-4 rounded-lg border-2 border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50 text-lg font-semibold transition"
                  >
                    Poop
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setFormData({...formData, entryType: 'food'});
                      setExpansionLevel('food');
                    }}
                    className="py-8 px-8 rounded-lg border-2 border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50 text-lg font-semibold transition"
                  >
                    Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Level 2a: Incident Form */}
          {expansionLevel === 'incident' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-50">Log Incident</h3>
                <button
                  onClick={() => {
                    setExpansionLevel('collapsed');
                    setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Date/Time Picker */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Date & Time</label>
                <DateTimePicker
                  date={formData.timestamp}
                  onChange={(date) => setFormData({...formData, timestamp: date})}
                />
              </div>

              {/* Behavior Type */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Behavior Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {behaviorTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = formData.type.includes(type)
                          ? formData.type.filter(t => t !== type)
                          : [...formData.type, type];
                        setFormData({...formData, type: newTypes});
                      }}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.type.includes(type)
                          ? 'border-stone-50 bg-stone-50 text-emerald-800'
                          : 'border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consequence */}
              <div ref={consequenceRef}>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Consequence</label>
                <div className="grid grid-cols-2 gap-2">
                  {consequenceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const newConsequences = formData.consequence.includes(option)
                          ? formData.consequence.filter(c => c !== option)
                          : [...formData.consequence, option];
                        setFormData({...formData, consequence: newConsequences});
                      }}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.consequence.includes(option)
                          ? 'border-stone-50 bg-stone-50 text-emerald-800'
                          : 'border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formData.consequence.includes('other/custom') && (
                  <div className="mt-2 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Enter custom consequence..."
                      value={formData.customConsequence}
                      onChange={(e) => setFormData({...formData, customConsequence: e.target.value})}
                      className="w-full px-3 py-2.5 border border-emerald-600 bg-stone-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-50 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Duration & Trigger in Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-stone-100 mb-2 block">Duration</label>
                  <DurationPicker
                    value={formData.durationSeconds}
                    onChange={(seconds) => setFormData({...formData, durationSeconds: seconds})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-100 mb-2 block">Trigger</label>
                  <input
                    type="text"
                    placeholder="Loud noise"
                    value={formData.trigger}
                    onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                    className="w-full px-3 py-2.5 border border-emerald-600 bg-stone-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-50 text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Notes</label>
                <textarea
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-emerald-600 bg-stone-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-50 resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={formData.type.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  formData.type.length > 0
                    ? 'bg-stone-50 text-emerald-800 hover:bg-stone-100 active:bg-stone-200'
                    : 'bg-emerald-700/30 text-stone-300 cursor-not-allowed'
                }`}
              >
                Save Incident
              </button>
            </div>
          )}

          {/* Level 2b: Poop Form */}
          {expansionLevel === 'poop' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-50">Log Poop</h3>
                <button
                  onClick={() => {
                    setExpansionLevel('collapsed');
                    setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Date/Time Picker */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Date & Time</label>
                <DateTimePicker
                  date={formData.timestamp}
                  onChange={(date) => setFormData({...formData, timestamp: date})}
                />
              </div>

              {/* Consistency Type */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Consistency *</label>
                <div className="grid grid-cols-2 gap-2">
                  {consistencyTypes.map((consistency) => (
                    <button
                      key={consistency}
                      onClick={() => handlePoopSubmit(consistency)}
                      className="py-3 px-4 rounded-lg border-2 border-amber-600 bg-amber-700/30 text-stone-100 hover:bg-amber-700/50 active:bg-stone-50 active:text-amber-800 text-sm font-medium transition"
                    >
                      {consistency}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Level 2c: Food Form */}
          {expansionLevel === 'food' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-50">Log Food</h3>
                <button
                  onClick={() => {
                    setExpansionLevel('collapsed');
                    setFormData({ entryType: '', type: [], duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', foodItem: '', amountConsumed: '', timestamp: new Date() });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Date/Time Picker */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Date & Time</label>
                <DateTimePicker
                  date={formData.timestamp}
                  onChange={(date) => setFormData({...formData, timestamp: date})}
                />
              </div>

              {/* Food Item */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Food Item *</label>
                <input
                  type="text"
                  value={formData.foodItem}
                  onChange={(e) => setFormData({...formData, foodItem: e.target.value})}
                  placeholder="e.g., Apple, Sandwich, Yogurt"
                  className="w-full px-3 py-2 rounded-lg bg-stone-700 text-stone-100 border border-stone-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Amount Consumed */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Amount Consumed *</label>
                <div className="grid grid-cols-1 gap-2">
                  {['tried it', 'ate some', 'all of it'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setFormData({...formData, amountConsumed: amount})}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.amountConsumed === amount
                          ? 'border-stone-50 bg-stone-50 text-emerald-800'
                          : 'border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50'
                      }`}
                    >
                      {amount.charAt(0).toUpperCase() + amount.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-700 text-stone-100 border border-stone-600 focus:border-emerald-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={() => handleFoodSubmit()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-stone-50 rounded-lg font-semibold transition"
              >
                Save Food
              </button>
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
            <button className="text-sm text-emerald-700 font-medium">View All</button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No entries yet. Add your first one above!</div>
          ) : null}

          {!isLoading && entries.map((entry) => (
            <div key={entry.id} className={`rounded-xl p-4 shadow-sm border ${
              entry.entryType === 'incident'
                ? 'bg-stone-50 border-stone-200'
                : entry.entryType === 'poop'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {entry.entryType === 'incident'
                      ? entry.type?.join(', ')
                      : entry.entryType === 'poop'
                      ? `Poop - ${entry.consistency}`
                      : `Food - ${entry.foodItem}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.time}
                    </span>
                  </div>
                </div>
                {entry.entryType === 'poop' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Poop
                  </span>
                )}
                {entry.entryType === 'food' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Food
                  </span>
                )}
              </div>

              {entry.entryType === 'incident' && (
                <div className="space-y-2 text-sm">
                  {entry.consequence && entry.consequence.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-20">Consequence:</span>
                      <span className="text-gray-900 font-medium">
                        {entry.consequence.includes('other/custom') && entry.customConsequence
                          ? entry.consequence.filter(c => c !== 'other/custom').concat(entry.customConsequence).join(', ')
                          : entry.consequence.join(', ')}
                      </span>
                    </div>
                  )}
                  {entry.trigger && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-20">Trigger:</span>
                      <span className="text-gray-900 font-medium">{entry.trigger}</span>
                    </div>
                  )}
                  {entry.duration && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-20">Duration:</span>
                      <span className="text-gray-900 font-medium">{entry.duration}</span>
                    </div>
                  )}
                  {entry.notes && (
                    <div className="pt-2 border-t border-stone-200 flex items-start justify-between gap-2">
                      <p className="text-gray-700 text-xs flex-1">{entry.notes}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          aria-label="Edit incident"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          aria-label="Delete incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {entry.entryType === 'poop' && (
                <div className="space-y-2 text-sm">
                  {entry.notes && (
                    <div className="pt-2 border-t border-amber-200 flex items-start justify-between gap-2">
                      <p className="text-gray-700 text-xs flex-1">{entry.notes}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          aria-label="Edit poop entry"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          aria-label="Delete poop entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {entry.entryType === 'food' && (
                <div className="space-y-2 text-sm">
                  {entry.amountConsumed && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-24">Amount:</span>
                      <span className="text-gray-900 font-medium">{entry.amountConsumed}</span>
                    </div>
                  )}
                  {entry.notes && (
                    <div className="pt-2 border-t border-emerald-200 flex items-start justify-between gap-2">
                      <p className="text-gray-700 text-xs flex-1">{entry.notes}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          aria-label="Edit food entry"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          aria-label="Delete food entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!entry.notes && (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleEditClick(entry.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        aria-label="Edit food entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        aria-label="Delete food entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {entryToEdit?.entryType === 'poop' ? 'Poop Entry' : entryToEdit?.entryType === 'food' ? 'Food Entry' : 'Incident'}
            </DialogTitle>
            <DialogDescription>
              Make changes to the entry below and click save.
            </DialogDescription>
          </DialogHeader>
          {entryToEdit && (
            <div className="space-y-4">
              {/* Incident fields */}
              {entryToEdit.entryType === 'incident' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                      type="text"
                      value={entryToEdit.type?.join(', ') || ''}
                      onChange={(e) => setEntryToEdit({ ...entryToEdit, type: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={entryToEdit.duration || ''}
                      onChange={(e) => setEntryToEdit({ ...entryToEdit, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                    <input
                      type="text"
                      value={entryToEdit.trigger || ''}
                      onChange={(e) => setEntryToEdit({ ...entryToEdit, trigger: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
              
              {/* Poop fields */}
              {entryToEdit.entryType === 'poop' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consistency</label>
                  <select
                    value={entryToEdit.consistency || ''}
                    onChange={(e) => setEntryToEdit({ ...entryToEdit, consistency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select consistency</option>
                    {consistencyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Food fields */}
              {entryToEdit.entryType === 'food' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Item</label>
                    <input
                      type="text"
                      value={entryToEdit.foodItem || ''}
                      onChange={(e) => setEntryToEdit({ ...entryToEdit, foodItem: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Consumed</label>
                    <input
                      type="text"
                      value={entryToEdit.amountConsumed || ''}
                      onChange={(e) => setEntryToEdit({ ...entryToEdit, amountConsumed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
              
              {/* Common notes field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={entryToEdit.notes || ''}
                  onChange={(e) => setEntryToEdit({ ...entryToEdit, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setEditDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!entryToEdit) return;
                
                try {
                  let endpoint = '';
                  let body = {};
                  
                  // Construct API request based on entry type
                  if (entryToEdit.entryType === 'incident') {
                    endpoint = `/api/incidents/${entryToEdit.id}`;
                    body = {
                      type: entryToEdit.type,
                      duration: entryToEdit.duration,
                      trigger: entryToEdit.trigger,
                      notes: entryToEdit.notes,
                    };
                  } else if (entryToEdit.entryType === 'poop') {
                    endpoint = `/api/poops/${entryToEdit.id}`;
                    body = {
                      consistency: entryToEdit.consistency,
                      notes: entryToEdit.notes,
                    };
                  } else if (entryToEdit.entryType === 'food') {
                    endpoint = `/api/foods/${entryToEdit.id}`;
                    body = {
                      foodItem: entryToEdit.foodItem,
                      amountConsumed: entryToEdit.amountConsumed,
                      notes: entryToEdit.notes,
                    };
                  }
                  
                  const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to update entry');
                  }
                  
                  toast.success('Entry updated successfully');
                  
                  // Reload entries
                  const reloadResponse = await fetch('/api/entries');
                  if (reloadResponse.ok) {
                    const { incidents, poops, foods } = await reloadResponse.json();
                    const allEntries = convertApiResponseToEntries(incidents, poops, foods);
                    setEntries(allEntries);
                  }
                  
                  setEditDialogOpen(false);
                  setEntryToEdit(null);
                } catch (error) {
                  console.error('Error updating entry:', error);
                  toast.error('Failed to update entry');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const entryToRemove = entries.find(e => e.id === entryToDelete);
                if (entryToRemove?.entryType === 'poop') return 'Delete Poop Entry';
                if (entryToRemove?.entryType === 'food') return 'Delete Food Entry';
                return 'Delete Incident';
              })()}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

