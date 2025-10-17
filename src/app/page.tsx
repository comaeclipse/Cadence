"use client";

import React, { useState, useRef } from 'react';
import { Plus, Calendar, Clock, X } from 'lucide-react';
import { MobileLayout } from '@/components/mobile-layout';

type ExpansionLevel = 'collapsed' | 'category' | 'incident' | 'poop';
type EntryType = 'incident' | 'poop';

interface Entry {
  id: number;
  entryType: EntryType;
  date: string;
  time: string;
  // Incident fields
  type?: string;
  severity?: string;
  duration?: string;
  trigger?: string;
  notes?: string;
  consequence?: string;
  customConsequence?: string;
  // Poop fields
  consistency?: string;
}

export default function Home() {
  const consequenceRef = useRef<HTMLDivElement>(null);
  const [expansionLevel, setExpansionLevel] = useState<ExpansionLevel>('collapsed');
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 1,
      entryType: 'incident',
      type: 'Meltdown',
      severity: 'High',
      duration: '15 min',
      trigger: 'Loud noises',
      date: '2025-10-15',
      time: '14:30',
      notes: 'Fire alarm went off during lunch'
    },
    {
      id: 2,
      entryType: 'incident',
      type: 'Sensory Overload',
      severity: 'Medium',
      duration: '8 min',
      trigger: 'Bright lights',
      date: '2025-10-14',
      time: '10:15',
      notes: 'Shopping mall fluorescent lighting'
    },
    {
      id: 3,
      entryType: 'poop',
      consistency: 'Normal',
      date: '2025-10-14',
      time: '09:30'
    },
    {
      id: 4,
      entryType: 'incident',
      type: 'Anxiety',
      severity: 'Low',
      duration: '5 min',
      trigger: 'Schedule change',
      date: '2025-10-13',
      time: '16:45',
      notes: 'Unexpected visitor'
    }
  ]);

  const [formData, setFormData] = useState({
    entryType: '' as EntryType | '',
    type: '',
    severity: '',
    duration: '',
    trigger: '',
    notes: '',
    consistency: '',
    consequence: '',
    customConsequence: ''
  });

  const behaviorTypes = ['Meltdown', 'Sensory Overload', 'Anxiety', 'Aggression', 'Self-Stimulation', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High'];
  const consistencyTypes = ['Soft', 'Normal', 'Hard', 'Formed', 'Loose', 'Watery'];
  const consequenceOptions = ['Gave attention', 'Break/help', 'Preferred item', 'Redirected', 'Ignored', 'Emotion cards', 'other/custom'];

  const handleSubmit = () => {
    if (formData.entryType === 'incident' && formData.type && formData.severity) {
      const now = new Date();
      const newEntry: Entry = {
        id: entries.length + 1,
        entryType: 'incident',
        type: formData.type,
        severity: formData.severity,
        duration: formData.duration,
        trigger: formData.trigger,
        notes: formData.notes,
        consequence: formData.consequence,
        customConsequence: formData.customConsequence,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5)
      };
      setEntries([newEntry, ...entries]);
      setFormData({ entryType: '', type: '', severity: '', duration: '', trigger: '', notes: '', consistency: '', consequence: '', customConsequence: '' });
      setExpansionLevel('collapsed');
    }
  };

  const handlePoopSubmit = (consistency: string) => {
    const now = new Date();
    const newEntry: Entry = {
      id: entries.length + 1,
      entryType: 'poop',
      consistency,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    };
    setEntries([newEntry, ...entries]);
    setFormData({ entryType: '', type: '', severity: '', duration: '', trigger: '', notes: '', consistency: '', consequence: '', customConsequence: '' });
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
              className="w-full bg-stone-50 text-emerald-800 rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 active:bg-stone-100 transition"
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
                    setFormData({ entryType: '', type: '', severity: '', duration: '', trigger: '', notes: '', consistency: '', consequence: '', customConsequence: '' });
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
                    setFormData({ entryType: '', type: '', severity: '', duration: '', trigger: '', notes: '', consistency: '', consequence: '', customConsequence: '' });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Behavior Type */}
              <div>
                <label className="text-sm font-medium text-stone-100 mb-2 block">Behavior Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {behaviorTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFormData({...formData, type});
                        setTimeout(() => {
                          consequenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.type === type
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
                      onClick={() => setFormData({...formData, consequence: option, customConsequence: option === 'other/custom' ? formData.customConsequence : ''})}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                        formData.consequence === option
                          ? 'border-stone-50 bg-stone-50 text-emerald-800'
                          : 'border-emerald-600 bg-emerald-700/30 text-stone-100 hover:bg-emerald-700/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formData.consequence === 'other/custom' && (
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
                  <input
                    type="text"
                    placeholder="10 min"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2.5 border border-emerald-600 bg-stone-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-50 text-sm"
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
                disabled={!formData.type || !formData.severity}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  formData.type && formData.severity
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
                    setFormData({ entryType: '', type: '', severity: '', duration: '', trigger: '', notes: '', consistency: '', consequence: '', customConsequence: '' });
                  }}
                  className="text-stone-50 hover:text-stone-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
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

          {entries.map((entry) => (
            <div key={entry.id} className={`rounded-xl p-4 shadow-sm border ${
              entry.entryType === 'incident'
                ? 'bg-stone-50 border-stone-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {entry.entryType === 'incident' ? entry.type : `Poop - ${entry.consistency}`}
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
                  {entry.consequence && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 w-20">Consequence:</span>
                      <span className="text-gray-900 font-medium">
                        {entry.consequence === 'other/custom' && entry.customConsequence
                          ? entry.customConsequence
                          : entry.consequence}
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

