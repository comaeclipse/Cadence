import React from 'react';
import { format } from 'date-fns';

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

interface ABCDataSheetProps {
  incidents: IncidentWithRelations[];
  childName?: string;
  startDate?: string;
  endDate?: string;
}

const ABCDataSheet = React.forwardRef<HTMLDivElement, ABCDataSheetProps>(
  ({ incidents, childName, startDate, endDate }, ref) => {
    const formatDuration = (seconds?: number): string => {
      if (!seconds) return '';
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

    const formatAntecedents = (incident: IncidentWithRelations): string[] => {
      const items: string[] = [];

      items.push(...incident.antecedents.map((a) => a.label));

      if (incident.location?.label || incident.locationText) {
        items.push(`Location: ${incident.location?.label || incident.locationText}`);
      }

      if (incident.settingEvents) {
        const settings = Object.entries(incident.settingEvents)
          .filter(([, v]) => v)
          .map(([k]) => k);
        if (settings.length > 0) {
          items.push(`Setting: ${settings.join(', ')}`);
        }
      }

      return items.filter(Boolean);
    };

    const formatBehaviors = (incident: IncidentWithRelations): string[] => {
      const items: string[] = [];

      items.push(...incident.behaviors.map((b) => b.label));

      if (incident.behaviorText) {
        items.push(incident.behaviorText);
      }

      if (incident.durationSec) {
        items.push(`Duration: ${formatDuration(incident.durationSec)}`);
      }

      return items.filter(Boolean);
    };

    const formatConsequences = (incident: IncidentWithRelations): string[] => {
      const items: string[] = [];

      items.push(...incident.consequences.map((c) => c.label));

      if (incident.interventions.length > 0) {
        items.push(...incident.interventions.map((i) => `Intervention: ${i.label}`));
      }

      if (incident.functionHypothesis && incident.functionHypothesis !== 'unknown') {
        items.push(`Function: ${incident.functionHypothesis}`);
      }

      return items.filter(Boolean);
    };

    return (
      <div ref={ref} className="print-container">
        <style>{`
          @media print {
            @page {
              size: portrait;
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

          .report-subtitle {
            font-size: 14px;
            color: #666;
            font-style: italic;
            margin-bottom: 10px;
          }

          .report-meta {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
          }

          .abc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 10px;
          }

          .abc-table thead {
            background-color: #2c3e50;
            color: white;
          }

          .abc-table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #2c3e50;
          }

          .abc-table td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            vertical-align: top;
          }

          .abc-table tbody tr:hover {
            background-color: #f5f5f5;
          }

          .abc-column {
            line-height: 1.6;
          }

          .abc-column div {
            margin-bottom: 4px;
          }

          .abc-column div:last-child {
            margin-bottom: 0;
          }

          @media screen {
            .print-container {
              max-width: 1200px;
              margin: 0 auto;
            }
          }
        `}</style>

        <div className="report-header">
          <h1 className="report-title">ABC Data Sheet</h1>
          <div className="report-subtitle">
            Antecedent - Behavior - Consequence Analysis
          </div>
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

        <table className="abc-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Date/Time</th>
              <th style={{ width: '8%' }}>Child</th>
              <th style={{ width: '22%' }}>Antecedent</th>
              <th style={{ width: '22%' }}>Behavior</th>
              <th style={{ width: '22%' }}>Consequence</th>
              <th style={{ width: '14%' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => {
              const antecedents = formatAntecedents(incident);
              const behaviors = formatBehaviors(incident);
              const consequences = formatConsequences(incident);

              return (
                <tr key={incident.id}>
                  <td>{formatDateTime(incident.timestamp)}</td>
                  <td>{incident.child.name}</td>
                  <td className="abc-column">
                    {antecedents.length > 0 ? (
                      antecedents.map((item, idx) => <div key={idx}>• {item}</div>)
                    ) : (
                      <div>N/A</div>
                    )}
                  </td>
                  <td className="abc-column">
                    {behaviors.map((item, idx) => (
                      <div key={idx}>• {item}</div>
                    ))}
                  </td>
                  <td className="abc-column">
                    {consequences.length > 0 ? (
                      consequences.map((item, idx) => <div key={idx}>• {item}</div>)
                    ) : (
                      <div>N/A</div>
                    )}
                  </td>
                  <td>{incident.notes || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

ABCDataSheet.displayName = 'ABCDataSheet';

export default ABCDataSheet;
