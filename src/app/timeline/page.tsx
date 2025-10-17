"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Incident } from "@/types/incident";
import { MobileLayout } from "@/components/mobile-layout";

export default function TimelinePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => {
    db.incidents.orderBy('timestamp').reverse().toArray().then(setIncidents);
  }, []);

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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(i.intensity)}`}>
                {getSeverityLabel(i.intensity)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-20">Function:</span>
                <span className="text-gray-900 font-medium capitalize">{i.functionHypothesis}</span>
              </div>
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
