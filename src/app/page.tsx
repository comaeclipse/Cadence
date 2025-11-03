"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Clock, X } from 'lucide-react';
import { MobileLayout } from '@/components/mobile-layout';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { DurationPicker } from '@/components/ui/duration-picker';

type ExpansionLevel = 'collapsed' | 'category' | 'incident' | 'poop';
type EntryType = 'incident' | 'poop';

interface Entry {
  id: number;
  entryType: EntryType;
  date: string;
  time: string;
  // Incident fields
  type?: string[];
  severity?: string;
  duration?: string;
  trigger?: string;
  notes?: string;
  consequence?: string[];
  customConsequence?: string;
  // Poop fields
  consistency?: string;
}

export default function Home() {
  const consequenceRef = useRef<HTMLDivElement>(null);
  const [expansionLevel, setExpansionLevel] = useState<ExpansionLevel>('collapsed');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    entryType: '' as EntryType | '',
    type: [] as string[],
    severity: '',
    duration: '',
    durationSeconds: 0,
    trigger: '',
    notes: '',
    consistency: '',
    consequence: [] as string[],
    customConsequence: '',
    timestamp: new Date()
  });

  const behaviorTypes = ['Meltdown', 'Sensory Overload', 'Anxiety', 'Aggression', 'Self-Stimulation', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High'];
  const consistencyTypes = ['Soft', 'Normal', 'Hard', 'Formed', 'Loose', 'Watery'];
  const consequenceOptions = ['Gave attention', 'Break/help', 'Preferred item', 'Redirected', 'Ignored', 'Emotion cards', 'other/custom'];

  // Load incidents from API on mount
  useEffect(() => {
    async function loadIncidents() {
      try {
        const response = await fetch('/api/incidents');
        if (response.ok) {
          const incidents = await response.json();

          // Convert API incidents to Entry format
          const convertedEntries: Entry[] = incidents.map((incident: {
            timestamp: string;
            behaviorText: string | null;
            intensity: number;
            durationSec: number | null;
            notes: string | null;
          }, index: number) => {
            const timestamp = new Date(incident.timestamp);
            const intensityToSeverity = (intensity: number): string => {
              if (intensity <= 2) return 'Low';
              if (intensity <= 3) return 'Medium';
              return 'High';
            };

            const formatDuration = (secs: number | null | undefined) => {
              if (!secs || secs === 0) return '';
              const mins = Math.floor(secs / 60);
              const remainingSecs = secs % 60;
              if (mins === 0) return `${remainingSecs}s`;
              if (remainingSecs === 0) return `${mins}m`;
              return `${mins}m ${remainingSecs}s`;
            };

            return {
              id: index + 1,
              entryType: 'incident',
              type: incident.behaviorText ? incident.behaviorText.split(', ') : [],
              severity: intensityToSeverity(incident.intensity),
              duration: formatDuration(incident.durationSec),
              trigger: '', // Extract from notes if needed
              notes: incident.notes || '',
              consequence: [],
              customConsequence: '',
              date: timestamp.toISOString().split('T')[0],
              time: timestamp.toTimeString().slice(0, 5)
            };
          });

          setEntries(convertedEntries);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadIncidents();
  }, []);

  const handleSubmit = async () => {
    if (formData.entryType === 'incident' && formData.type.length > 0 && formData.severity) {
      console.log('Starting incident save...');

      const formatDuration = (secs: number) => {
        if (secs === 0) return '';
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        if (mins === 0) return `${remainingSecs}s`;
        if (remainingSecs === 0) return `${mins}m`;
        return `${mins}m ${remainingSecs}s`;
      };

      // Convert severity to intensity (1-5)
      const severityToIntensity = (severity: string): number => {
        switch (severity) {
          case 'Low': return 2;
          case 'Medium': return 3;
          case 'High': return 5;
          default: return 3;
        }
      };

      // Create optimistic UI entry
      const newEntry: Entry = {
        id: entries.length + 1,
        entryType: 'incident',
        type: formData.type,
        severity: formData.severity,
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
        const incidentData = {
          childId,
          timestamp: formData.timestamp.toISOString(),
          behaviorText: formData.type.join(', '),
          intensity: severityToIntensity(formData.severity),
          durationSec: formData.durationSeconds || undefined,
          functionHypothesis: 'unknown',
          notes: fullNotes,
          tags: [],
        };
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

        // Reload incidents from database to stay in sync
        console.log('Reloading incidents from database...');
        const reloadResponse = await fetch('/api/incidents');
        if (reloadResponse.ok) {
          const incidents = await reloadResponse.json();
          console.log('Loaded incidents:', incidents.length);
          const convertedEntries: Entry[] = incidents.map((incident: {
            timestamp: string;
            behaviorText: string | null;
            intensity: number;
            durationSec: number | null;
            notes: string | null;
          }, index: number) => {
            const timestamp = new Date(incident.timestamp);
            const intensityToSeverity = (intensity: number): string => {
              if (intensity <= 2) return 'Low';
              if (intensity <= 3) return 'Medium';
              return 'High';
            };

            const formatDuration = (secs: number | null | undefined) => {
              if (!secs || secs === 0) return '';
              const mins = Math.floor(secs / 60);
              const remainingSecs = secs % 60;
              if (mins === 0) return `${remainingSecs}s`;
              if (remainingSecs === 0) return `${mins}m`;
              return `${mins}m ${remainingSecs}s`;
            };

            return {
              id: index + 1,
              entryType: 'incident',
              type: incident.behaviorText ? incident.behaviorText.split(', ') : [],
              severity: intensityToSeverity(incident.intensity),
              duration: formatDuration(incident.durationSec),
              trigger: '',
              notes: incident.notes || '',
              consequence: [],
              customConsequence: '',
              date: timestamp.toISOString().split('T')[0],
              time: timestamp.toTimeString().slice(0, 5)
            };
          });
          setEntries(convertedEntries);
        } else {
          console.error('Failed to reload incidents:', reloadResponse.status);
        }

        // Reset form on success
        setFormData({ entryType: '', type: [], severity: '', duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', timestamp: new Date() });
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

  const handlePoopSubmit = (consistency: string) => {
    const newEntry: Entry = {
      id: entries.length + 1,
      entryType: 'poop',
      consistency,
      date: formData.timestamp.toISOString().split('T')[0],
      time: formData.timestamp.toTimeString().slice(0, 5)
    };
    setEntries([newEntry, ...entries]);
    setFormData({ entryType: '', type: [], severity: '', duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', timestamp: new Date() });
    setExpansionLevel('collapsed');
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                    setFormData({ entryType: '', type: [], severity: '', duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', timestamp: new Date() });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

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
                    setFormData({ entryType: '', type: [], severity: '', duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', timestamp: new Date() });
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

              {/* Severity */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Severity *</label>
                <div className="grid grid-cols-3 gap-2">
                  {severityLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({...formData, severity: level})}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.severity === level
                          ? 'border-stone-50 bg-stone-50 text-emerald-800'
                          : 'border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
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
                disabled={formData.type.length === 0 || !formData.severity}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  formData.type.length > 0 && formData.severity
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
                    setFormData({ entryType: '', type: [], severity: '', duration: '', durationSeconds: 0, trigger: '', notes: '', consistency: '', consequence: [], customConsequence: '', timestamp: new Date() });
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
        </div>

        {/* Recent Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
            <button className="text-sm text-emerald-700 font-medium">View All</button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading incidents...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No incidents yet. Add your first one above!</div>
          ) : null}

          {!isLoading && entries.map((entry) => (
            <div key={entry.id} className={`rounded-xl p-4 shadow-sm border ${
              entry.entryType === 'incident'
                ? 'bg-stone-50 border-stone-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {entry.entryType === 'incident' ? entry.type?.join(', ') : `Poop - ${entry.consistency}`}
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
                {entry.entryType === 'incident' && entry.severity && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                    {entry.severity}
                  </span>
                )}
                {entry.entryType === 'poop' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Poop
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
                    <div className="pt-2 border-t border-stone-200">
                      <p className="text-gray-700 text-xs">{entry.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}

