import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extended type for incidents with relations
interface IncidentWithRelations {
  id: string;
  timestamp: Date | string;
  child: { name: string };
  behaviors: Array<{ label: string }>;
  behaviorText?: string;
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

interface ReportOptions {
  childName?: string;
  startDate?: string;
  endDate?: string;
}

// Helper to format duration
function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// Helper to format date/time
function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy h:mm a');
}

// Helper to format date only
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
}

// Add report header
function addReportHeader(
  doc: jsPDF,
  title: string,
  options: ReportOptions
): number {
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  let yPos = 30;
  doc.setFontSize(10);

  if (options.childName) {
    doc.text(`Child: ${options.childName}`, 14, yPos);
    yPos += 6;
  }

  if (options.startDate || options.endDate) {
    const dateRange = `Date Range: ${
      options.startDate ? formatDate(options.startDate) : 'All'
    } to ${options.endDate ? formatDate(options.endDate) : 'Present'}`;
    doc.text(dateRange, 14, yPos);
    yPos += 6;
  }

  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, yPos);
  yPos += 10;

  return yPos;
}

// Generate Detailed Incident Log PDF
export function generateDetailedLogPDF(
  incidents: IncidentWithRelations[],
  options: ReportOptions = {}
): jsPDF {
  const doc = new jsPDF('landscape');

  const startY = addReportHeader(doc, 'Detailed Incident Log', options);

  // Prepare table data
  const tableData = incidents.map((incident) => [
    formatDateTime(incident.timestamp),
    incident.child.name,
    incident.behaviors.map((b) => b.label).join(', ') || incident.behaviorText || 'N/A',
    formatDuration(incident.durationSec),
    incident.antecedents.map((a) => a.label).join(', ') || 'N/A',
    incident.consequences.map((c) => c.label).join(', ') || 'N/A',
    incident.interventions.map((i) => i.label).join(', ') || 'N/A',
    incident.location?.label || incident.locationText || 'N/A',
    incident.functionHypothesis,
    incident.notes || '',
  ]);

  autoTable(doc, {
    head: [
      [
        'Date/Time',
        'Child',
        'Behavior',
        'Duration',
        'Antecedents',
        'Consequences',
        'Interventions',
        'Location',
        'Function',
        'Notes',
      ],
    ],
    body: tableData,
    startY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [44, 62, 80], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 20 },
      2: { cellWidth: 35 },
      3: { cellWidth: 15 },
      4: { cellWidth: 28 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 32 },
    },
    margin: { top: startY, left: 14, right: 14 },
  });

  return doc;
}

// Generate ABC Data Sheet PDF
export function generateABCDataSheetPDF(
  incidents: IncidentWithRelations[],
  options: ReportOptions = {}
): jsPDF {
  const doc = new jsPDF();

  const startY = addReportHeader(doc, 'ABC Data Sheet', options);

  // Prepare table data in ABC format
  const tableData = incidents.map((incident) => [
    formatDateTime(incident.timestamp),
    incident.child.name,
    // Antecedent column
    [
      ...incident.antecedents.map((a) => a.label),
      incident.location?.label || incident.locationText
        ? `Location: ${incident.location?.label || incident.locationText}`
        : '',
      incident.settingEvents
        ? Object.entries(incident.settingEvents)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ')
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
    // Behavior column
    [
      ...incident.behaviors.map((b) => b.label),
      incident.behaviorText || '',
      incident.durationSec ? `Duration: ${formatDuration(incident.durationSec)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    // Consequence column
    [
      ...incident.consequences.map((c) => c.label),
      ...incident.interventions.map((i) => `Intervention: ${i.label}`),
      incident.functionHypothesis ? `Function: ${incident.functionHypothesis}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    incident.notes || '',
  ]);

  autoTable(doc, {
    head: [['Date/Time', 'Child', 'Antecedent', 'Behavior', 'Consequence', 'Notes']],
    body: tableData,
    startY,
    styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [44, 62, 80], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: 30 },
    },
    margin: { top: startY, left: 10, right: 10 },
  });

  return doc;
}
