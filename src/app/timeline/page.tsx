"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Incident } from "@/types/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TimelinePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => {
    db.incidents.orderBy('timestamp').reverse().toArray().then(setIncidents);
  }, []);

  const getIntensityVariant = (intensity: number) => {
    if (intensity >= 4) return "destructive";
    if (intensity >= 3) return "default";
    return "secondary";
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground mt-1">Chronological view of all incidents</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {incidents.length} Total
        </Badge>
      </div>

      <div className="grid gap-4">
        {incidents.length === 0 && (
          <Card className="border-2 shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No incidents logged yet. Start by logging your first incident.</p>
            </CardContent>
          </Card>
        )}
        {incidents.map((i) => (
          <Card key={i.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{new Date(i.timestamp).toLocaleString()}</CardTitle>
                  <CardDescription className="mt-1">{i.behaviorText}</CardDescription>
                </div>
                <Badge variant={getIntensityVariant(i.intensity)}>
                  Intensity {i.intensity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-normal">
                  {i.functionHypothesis}
                </Badge>
                {i.locationText && (
                  <Badge variant="outline" className="font-normal">
                    {i.locationText}
                  </Badge>
                )}
              </div>
              {i.notes && (
                <div className="mt-3 p-3 rounded-md bg-muted/50 text-muted-foreground">
                  {i.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
