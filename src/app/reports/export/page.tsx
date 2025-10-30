"use client";

import { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { FileDown, Printer, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import DetailedIncidentReport from "@/components/reports/detailed-incident-report";
import ABCDataSheet from "@/components/reports/abc-data-sheet";
import { generateDetailedLogPDF, generateABCDataSheetPDF } from "@/lib/pdf-generator";

interface Child {
  id: string;
  name: string;
}

interface IncidentWithRelations {
  id: string;
  timestamp: Date | string;
  child: { name: string };
  behaviors: Array<{ label: string }>;
  behaviorText?: string;
  intensity: number;
  durationSec?: number;
  latencySec?: number;
  location?: { label: string };
  locationText?: string;
  functionHypothesis: string;
  antecedents: Array<{ label: string }>;
  consequences: Array<{ label: string }>;
  interventions: Array<{ label: string }>;
  notes?: string;
  tags?: string[];
  settingEvents?: Record<string, unknown>;
}

export default function ExportPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportType, setReportType] = useState<"detailed" | "abc">("detailed");
  const [incidents, setIncidents] = useState<IncidentWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch children on mount
  useEffect(() => {
    async function fetchChildren() {
      try {
        const response = await fetch("/api/children");
        if (response.ok) {
          const data = await response.json();
          setChildren(data);
        }
      } catch (error) {
        console.error("Error fetching children:", error);
        toast.error("Failed to load children");
      }
    }
    fetchChildren();
  }, []);

  // Fetch incidents with filters
  async function fetchIncidents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedChildId) params.append("childId", selectedChildId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports/data?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch incidents");
      }

      const data = await response.json();
      setIncidents(data);

      if (data.length === 0) {
        toast.info("No incidents found for the selected filters");
      } else {
        toast.success(`Loaded ${data.length} incident${data.length === 1 ? "" : "s"}`);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  // Generate PDF
  function generatePDF() {
    if (incidents.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const selectedChild = children.find((c) => c.id === selectedChildId);
      const options = {
        childName: selectedChild?.name,
        startDate,
        endDate,
      };

      const doc =
        reportType === "detailed"
          ? generateDetailedLogPDF(incidents, options)
          : generateABCDataSheetPDF(incidents, options);

      const fileName = `${reportType === "detailed" ? "detailed-log" : "abc-data-sheet"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      doc.save(fileName);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  }

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle:
      reportType === "detailed" ? "Detailed Incident Log" : "ABC Data Sheet",
    onAfterPrint: () => toast.success("Print dialog opened"),
  });

  return (
    <MobileLayout title="Export Reports" subtitle="Generate and print incident reports">
      <div className="p-4 space-y-4">
        {/* Filters Card */}
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200 space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Report Filters</h3>

          {/* Child Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Child
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportType("detailed")}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition ${
                  reportType === "detailed"
                    ? "bg-emerald-700 text-white"
                    : "bg-white border border-stone-200 text-gray-700"
                }`}
              >
                Detailed Log
              </button>
              <button
                onClick={() => setReportType("abc")}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition ${
                  reportType === "abc"
                    ? "bg-emerald-700 text-white"
                    : "bg-white border border-stone-200 text-gray-700"
                }`}
              >
                ABC Data Sheet
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="w-full bg-emerald-700 text-white rounded-lg px-4 py-3 font-semibold active:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>

        {/* Action Buttons - Only show when preview is available */}
        {showPreview && incidents.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-4 shadow-lg space-y-3">
            <h3 className="text-lg font-semibold text-stone-50 mb-2">
              Export Options
            </h3>
            <button
              onClick={generatePDF}
              className="w-full bg-stone-50 text-emerald-800 rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2 active:bg-stone-100 transition"
            >
              <FileDown className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="w-full bg-stone-50 text-emerald-800 rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2 active:bg-stone-100 transition"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          </div>
        )}

        {/* Report Description */}
        <div className="bg-stone-50 rounded-xl p-4 shadow-sm border border-stone-200">
          <h4 className="font-semibold text-gray-900 mb-2">Report Types</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">Detailed Log:</strong> Comprehensive table
              with all incident details including behaviors, antecedents, consequences,
              interventions, locations, and notes.
            </div>
            <div>
              <strong className="text-gray-900">ABC Data Sheet:</strong> Standard ABA format
              showing Antecedent-Behavior-Consequence patterns for functional analysis.
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Preview */}
      {showPreview && incidents.length > 0 && (
        <div className="hidden">
          {reportType === "detailed" ? (
            <DetailedIncidentReport
              ref={reportRef}
              incidents={incidents}
              childName={children.find((c) => c.id === selectedChildId)?.name}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <ABCDataSheet
              ref={reportRef}
              incidents={incidents}
              childName={children.find((c) => c.id === selectedChildId)?.name}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      )}
    </MobileLayout>
  );
}
