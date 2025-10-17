"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { MobileLayout } from '@/components/mobile-layout';
import { db } from "@/lib/db";
import type { Incident } from "@/types/incident";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    loadIncidents();
  }, [currentDate]);

  async function loadIncidents() {
    const allIncidents = await db.incidents.toArray();
    setIncidents(allIncidents);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setExpandedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setExpandedDay(null);
  };

  const getIncidentsForDate = (dateStr: string) => {
    return incidents.filter(i => {
      const incidentDate = new Date(i.timestamp);
      return incidentDate.toDateString() === new Date(dateStr).toDateString();
    });
  };

  const hasIncidents = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return getIncidentsForDate(dateStr).length > 0;
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    if (expandedDay === dateStr) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dateStr);
      setSelectedDate(dateStr);
    }
  };

  const getSeverityColor = (intensity: number) => {
    if (intensity >= 4) return 'bg-red-100 text-red-800';
    if (intensity >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeverityLabel = (intensity: number) => {
    if (intensity >= 4) return 'High';
    if (intensity >= 3) return 'Medium';
    return 'Low';
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <MobileLayout title="Calendar" subtitle="View incidents by date">
      <div className="p-4 space-y-4">
        {/* Calendar Navigation */}
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-stone-200 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-stone-200 rounded-lg transition">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (typeof day !== 'number') return day;
              
              const dateStr = new Date(year, month, day).toISOString().split('T')[0];
              const hasEvents = hasIncidents(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              const isExpanded = expandedDay === dateStr;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-lg text-sm font-medium transition ${
                    isToday 
                      ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-600' 
                      : hasEvents 
                      ? 'bg-emerald-50 text-gray-900 hover:bg-emerald-100' 
                      : 'text-gray-700 hover:bg-stone-100'
                  } ${isExpanded ? 'ring-2 ring-emerald-600' : ''}`}
                >
                  {day}
                  {hasEvents && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Day Details */}
        {expandedDay && (
          <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(expandedDay).toLocaleDateString('default', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button 
                onClick={() => setExpandedDay(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {getIncidentsForDate(expandedDay).length === 0 ? (
              <p className="text-center text-gray-600 py-4">No incidents on this day</p>
            ) : (
              getIncidentsForDate(expandedDay).map((incident) => (
                <div key={incident.id} className="bg-white rounded-lg p-3 border border-stone-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{incident.behaviorText || 'Incident'}</h4>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.intensity)}`}>
                      {getSeverityLabel(incident.intensity)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs">Function:</span>
                      <span className="text-gray-900 text-xs capitalize">{incident.functionHypothesis}</span>
                    </div>
                    {incident.durationSec && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">Duration:</span>
                        <span className="text-gray-900 text-xs">{Math.floor(incident.durationSec / 60)}m {incident.durationSec % 60}s</span>
                      </div>
                    )}
                    {incident.locationText && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">Location:</span>
                        <span className="text-gray-900 text-xs">{incident.locationText}</span>
                      </div>
                    )}
                    {incident.notes && (
                      <div className="pt-2 border-t border-stone-200 mt-2">
                        <p className="text-gray-700 text-xs">{incident.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legend */}
        <div className="bg-stone-50 rounded-xl p-3 shadow-sm border border-stone-200">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></div>
              <span>Has incidents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-100 border-2 border-emerald-600"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
