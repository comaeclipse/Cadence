"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Clock, TrendingUp, ChevronRight, X } from 'lucide-react';

export default function CalendarPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [incidents, setIncidents] = useState([
    {
      id: 1,
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
    type: '',
    severity: '',
    duration: '',
    trigger: '',
    notes: ''
  });

  const behaviorTypes = ['Meltdown', 'Sensory Overload', 'Anxiety', 'Aggression', 'Self-Stimulation', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High'];

  const handleSubmit = () => {
    if (formData.type && formData.severity) {
      const now = new Date();
      const newIncident = {
        id: incidents.length + 1,
        ...formData,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5)
      };
      setIncidents([newIncident, ...incidents]);
      setFormData({ type: '', severity: '', duration: '', trigger: '', notes: '' });
      setIsExpanded(false);
    }
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
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* iOS Status Bar */}
      <div className="bg-stone-50 pt-3 pb-2 px-6">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-3 border border-black rounded-sm relative">
              <div className="absolute inset-0.5 bg-black rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Behavior Tracker</h1>
        <p className="text-sm text-gray-600 mt-1">Understanding patterns together</p>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
            <div className="text-2xl font-bold text-gray-900">{incidents.length}</div>
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

        {/* Expandable Log Incident Section */}
        <div 
          className={`bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl shadow-lg transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'p-6' : 'p-4'
          }`}
          style={{
            maxHeight: isExpanded ? '2000px' : '70px',
          }}
        >
          {/* Button State */}
          {!isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-full bg-stone-50 text-emerald-800 rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 active:bg-stone-100 transition"
            >
              <Plus className="w-5 h-5" />
              Log New Incident
            </button>
          )}

          {/* Expanded Form State */}
          {isExpanded && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-50">Log Incident</h3>
                <button 
                  onClick={() => {
                    setIsExpanded(false);
                    setFormData({ type: '', severity: '', duration: '', trigger: '', notes: '' });
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
                      onClick={() => setFormData({...formData, type})}
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
        </div>

        {/* Recent Incidents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
            <button className="text-sm text-emerald-700 font-medium">View All</button>
          </div>

          {incidents.map((incident) => (
            <div key={incident.id} className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{incident.type}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {incident.date}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {incident.time}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-16">Trigger:</span>
                  <span className="text-gray-900 font-medium">{incident.trigger}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-16">Duration:</span>
                  <span className="text-gray-900 font-medium">{incident.duration}</span>
                </div>
                {incident.notes && (
                  <div className="pt-2 border-t border-stone-200">
                    <p className="text-gray-700 text-xs">{incident.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* iOS Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-1 px-4 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600">
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center justify-center py-2 text-emerald-700">
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Calendar</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600">
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs">Insights</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-6 h-6 mb-1" />
            <span className="text-xs">More</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
