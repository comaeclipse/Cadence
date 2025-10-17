"use client";

import { IncidentForm } from "@/components/incident-form";
import { MobileLayout } from "@/components/mobile-layout";

export default function LogPage() {
  return (
    <MobileLayout title="Log Incident" subtitle="Record a new behavioral incident">
      <div className="p-4">
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h2>
          <IncidentForm />
        </div>
      </div>
    </MobileLayout>
  );
}

