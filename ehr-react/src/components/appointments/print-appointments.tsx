'use client';

import React from 'react';
import type { Appointment } from '@/types/appointment';

interface PrintAppointmentsProps {
  appointments: Appointment[];
  date: Date;
  view: 'day' | 'week' | 'month';
  facilityName?: string;
}

export function PrintAppointments({ appointments, date, view, facilityName }: PrintAppointmentsProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100%;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .print-header h1 {
            font-size: 24px;
            margin: 0 0 5px 0;
            font-weight: bold;
          }
          .print-header p {
            font-size: 14px;
            margin: 0;
            color: #666;
          }
          .appointment-list {
            margin-top: 20px;
          }
          .appointment-item {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .appointment-time {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .appointment-patient {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .appointment-practitioner {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
          }
          .appointment-type {
            display: inline-block;
            font-size: 10px;
            padding: 2px 8px;
            background-color: #f0f0f0;
            border-radius: 3px;
            margin-right: 5px;
          }
          .appointment-status {
            display: inline-block;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 3px;
          }
          .status-scheduled {
            background-color: #e3f2fd;
            color: #1976d2;
          }
          .status-in-progress {
            background-color: #fff3e0;
            color: #f57c00;
          }
          .status-completed {
            background-color: #e8f5e9;
            color: #388e3c;
          }
          .status-cancelled {
            background-color: #ffebee;
            color: #d32f2f;
          }
          .appointment-location {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
          }
          .appointment-notes {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
          }
          .summary-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .summary-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .summary-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .summary-stat {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
          }
          .summary-stat-value {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .summary-stat-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
          }
          .print-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          .no-appointments {
            text-align: center;
            padding: 40px;
            color: #999;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointments - ${date.toLocaleDateString()}</title>
          ${styles}
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              // Uncomment to close after printing
              // window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Schedule
      </button>

      {/* Hidden print content */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="print-container">
            <div className="print-header">
              <h1>{facilityName || 'Healthcare Facility'}</h1>
              <p>
                {view === 'day' && `Daily Schedule - ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                {view === 'week' && `Weekly Schedule - Week of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                {view === 'month' && `Monthly Schedule - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </p>
              <p style={{ marginTop: '5px', fontSize: '12px' }}>
                Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>

            {appointments.length === 0 ? (
              <div className="no-appointments">
                <p>No appointments scheduled for this period.</p>
              </div>
            ) : (
              <>
                <div className="appointment-list">
                  {appointments
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((apt) => (
                      <div key={apt.id} className="appointment-item">
                        <div className="appointment-time">
                          {new Date(apt.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          {' - '}
                          {new Date(apt.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          {' '}({apt.duration} min)
                        </div>
                        <div className="appointment-patient">
                          {apt.patientName}
                        </div>
                        <div className="appointment-practitioner">
                          Provider: {apt.practitionerName}
                        </div>
                        <div style={{ marginTop: '5px' }}>
                          {apt.appointmentType && (
                            <span className="appointment-type">
                              {apt.appointmentType}
                            </span>
                          )}
                          <span className={`appointment-status status-${apt.status}`}>
                            {apt.status.toUpperCase()}
                          </span>
                        </div>
                        {apt.location && (
                          <div className="appointment-location">
                            Location: {apt.location}
                          </div>
                        )}
                        {apt.reason && (
                          <div className="appointment-notes">
                            Reason: {apt.reason}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <div className="summary-section">
                  <div className="summary-title">Summary</div>
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <div className="summary-stat-value">{appointments.length}</div>
                      <div className="summary-stat-label">Total</div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-stat-value">
                        {appointments.filter(a => a.status === 'scheduled').length}
                      </div>
                      <div className="summary-stat-label">Scheduled</div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-stat-value">
                        {appointments.filter(a => a.status === 'in-progress').length}
                      </div>
                      <div className="summary-stat-label">In Progress</div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-stat-value">
                        {appointments.filter(a => a.status === 'completed').length}
                      </div>
                      <div className="summary-stat-label">Completed</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="print-footer">
              <p>This is a system-generated document. For internal use only.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
