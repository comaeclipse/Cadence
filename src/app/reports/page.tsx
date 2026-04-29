"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

interface Incident {
  id: string;
  timestamp: string;
}

export default function ReportsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.ok ? res.json() : [])
      .then(setIncidents)
      .catch(() => {});
  }, []);

  const byHour = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    for (const i of incidents) {
      const h = new Date(i.timestamp).getHours();
      buckets[h].count += 1;
    }
    return buckets;
  }, [incidents]);

  return (
    <MobileLayout title="Insights" subtitle="Visualize behavioral patterns and trends">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          <span className="text-sm text-gray-600">{incidents.length} Total</span>
        </div>

        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <h3 className="font-semibold text-gray-900 mb-2">Incidents by Hour of Day</h3>
          <p className="text-xs text-gray-600 mb-4">Distribution across 24-hour period</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byHour}>
                <XAxis dataKey="hour" tickFormatter={(v) => `${v}:00`} fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
