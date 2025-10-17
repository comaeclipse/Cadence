"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { Incident } from "@/types/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Visualize behavioral patterns and trends</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {incidents.length} Total
        </Badge>
      </div>

      <Tabs defaultValue="time" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="time">By Hour</TabsTrigger>
          <TabsTrigger value="intensity">By Intensity</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-4">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Incidents by Hour of Day</CardTitle>
              <CardDescription>Distribution of incidents across 24-hour period</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byHour}>
                  <XAxis dataKey="hour" tickFormatter={(v) => `${v}:00`} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intensity" className="space-y-4">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Incidents by Intensity Level</CardTitle>
              <CardDescription>Breakdown of severity ratings (1=low, 5=high)</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byIntensity}>
                  <XAxis dataKey="intensity" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

