import React from 'react';
import { format } from 'date-fns';

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

interface DetailedIncidentReportProps {
  incidents: IncidentWithRelations[];
  childName?: string;
  startDate?: string;
  endDate?: string;
}

const DetailedIncidentReport = React.forwardRef<HTMLDivElement, DetailedIncidentReportProps>(
  ({ incidents, childName, startDate, endDate }, ref) => {
    const formatDuration = (seconds?: number): string => {
      if (!seconds) return 'N/A';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDateTime = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM dd, yyyy h:mm a');
    };

    const formatDate = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM dd, yyyy');
    };

    return (
      <div ref={ref} className="print-container">
        <style>{`
          @media print {
            @page {
              size: landscape;
              margin: 0.5in;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print-container {
              width: 100%;
              max-width: none;
            }
            .no-print {
              display: none !important;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
          }

          .print-container {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            background: white;
          }

          .report-header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2c3e50;
          }

          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }

          .report-meta {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
          }

          .incidents-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 10px;
          }

          .incidents-table thead {
            background-color: #2c3e50;
            color: white;
          }

          .incidents-table th {
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
          }

          .incidents-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
          }

          .incidents-table tbody tr:hover {
            background-color: #f5f5f5;
          }

          @media screen {
            .print-container {
              max-width: 1400px;
              margin: 0 auto;
            }
          }
        `}</style>

        <div className="report-header">
          <h1 className="report-title">Detailed Incident Log</h1>
          <div className="report-meta">
            {childName && <div>Child: {childName}</div>}
            {(startDate || endDate) && (
              <div>
                Date Range: {startDate ? formatDate(startDate) : 'All'} to{' '}
                {endDate ? formatDate(endDate) : 'Present'}
              </div>
            )}
            <div>Generated: {formatDateTime(new Date())}</div>
            <div>Total Incidents: {incidents.length}</div>
          </div>
        </div>

        <table className="incidents-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Date/Time</th>
              <th style={{ width: '8%' }}>Child</th>
              <th style={{ width: '12%' }}>Behavior</th>
              <th style={{ width: '6%' }}>Intensity</th>
              <th style={{ width: '7%' }}>Duration</th>
              <th style={{ width: '12%' }}>Antecedents</th>
              <th style={{ width: '12%' }}>Consequences</th>
              <th style={{ width: '12%' }}>Interventions</th>
              <th style={{ width: '8%' }}>Location</th>
              <th style={{ width: '8%' }}>Function</th>
              <th style={{ width: '13%' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{formatDateTime(incident.timestamp)}</td>
                <td>{incident.child.name}</td>
                <td>
                  {incident.behaviors.map((b) => b.label).join(', ') ||
                    incident.behaviorText ||
                    'N/A'}
                </td>
                <td>{incident.intensity}</td>
                <td>{formatDuration(incident.durationSec)}</td>
                <td>{incident.antecedents.map((a) => a.label).join(', ') || 'N/A'}</td>
                <td>{incident.consequences.map((c) => c.label).join(', ') || 'N/A'}</td>
                <td>{incident.interventions.map((i) => i.label).join(', ') || 'N/A'}</td>
                <td>{incident.location?.label || incident.locationText || 'N/A'}</td>
                <td>{incident.functionHypothesis}</td>
                <td>{incident.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

DetailedIncidentReport.displayName = 'DetailedIncidentReport';

export default DetailedIncidentReport;
