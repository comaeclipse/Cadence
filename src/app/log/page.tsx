"use client";

import { IncidentForm } from "@/components/incident-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Incident</h1>
        <p className="text-muted-foreground mt-1">Record a new behavioral incident</p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>Capture all relevant information about the incident</CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentForm />
        </CardContent>
      </Card>
    </div>
  );
}

