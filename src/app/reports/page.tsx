"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { Incident } from "@/types/incident";
import { MobileLayout } from "@/components/mobile-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

export default function ReportsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => {
    db.incidents.toArray().then(setIncidents);
  }, []);

  const byHour = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    for (const i of incidents) {
      const h = new Date(i.timestamp).getHours();
      buckets[h].count += 1;
    }
    return buckets;
  }, [incidents]);

  const byIntensity = useMemo(() => {
    const buckets = Array.from({ length: 5 }, (_, idx) => ({ intensity: idx + 1, count: 0 }));
    for (const i of incidents) {
      buckets[i.intensity - 1].count += 1;
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

        <Tabs defaultValue="time" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-stone-50 border border-stone-200">
            <TabsTrigger value="time">By Hour</TabsTrigger>
            <TabsTrigger value="intensity">By Intensity</TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="intensity" className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
              <h3 className="font-semibold text-gray-900 mb-2">Incidents by Intensity Level</h3>
              <p className="text-xs text-gray-600 mb-4">Breakdown of severity ratings (1=low, 5=high)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byIntensity}>
                    <XAxis dataKey="intensity" fontSize={10} />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

