"use client";

import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";

interface Incident {
  id: string;
  timestamp: string;
  behaviorText?: string;
  functionHypothesis?: string;
  locationText?: string;
  durationSec?: number;
  notes?: string;
}

export default function TimelinePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.ok ? res.json() : [])
      .then(setIncidents)
      .catch(() => {});
  }, []);

  return (
    <MobileLayout title="Timeline" subtitle="Chronological view of all incidents">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Incidents</h2>
          <span className="text-sm text-gray-600">{incidents.length} Total</span>
        </div>

        {incidents.length === 0 && (
          <div className="bg-stone-50 rounded-xl p-8 shadow-sm border border-stone-200 text-center">
            <p className="text-gray-600">No incidents logged yet. Start by logging your first incident.</p>
          </div>
        )}

        {incidents.map((i) => (
          <div key={i.id} className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{i.behaviorText || 'Incident'}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(i.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {i.functionHypothesis && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-20">Function:</span>
                  <span className="text-gray-900 font-medium capitalize">{i.functionHypothesis}</span>
                </div>
              )}
              {i.locationText && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-20">Location:</span>
                  <span className="text-gray-900 font-medium">{i.locationText}</span>
                </div>
              )}
              {i.durationSec && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-20">Duration:</span>
                  <span className="text-gray-900 font-medium">{Math.floor(i.durationSec / 60)}m {i.durationSec % 60}s</span>
                </div>
              )}
              {i.notes && (
                <div className="pt-2 border-t border-stone-200">
                  <p className="text-gray-700 text-xs">{i.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
