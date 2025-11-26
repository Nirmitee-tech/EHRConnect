'use client';

import React, { useState } from 'react';
import {
  User,
  FileText,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Stethoscope,
  Heart,
  Thermometer,
  Wind
} from 'lucide-react';
import { HMSPeer } from '@100mslive/react-sdk';
import { VideoTile } from './video-tile';
import { ClinicalNotesPanel } from './clinical-notes-panel';
import { VitalsCards } from '@/app/patients/[id]/components/tabs/VitalsTab/VitalsCards';

interface ProviderMeetingLayoutProps {
  peers: HMSPeer[];
  localPeer?: HMSPeer;
  patientId: string;
  patientName: string;
  encounterId?: string;
  onSaveClinicalNotes: (note: any) => Promise<void>;
  showClinicalNotes: boolean;
  setShowClinicalNotes: (show: boolean) => void;
  showVitalsPanel: boolean;
  setShowVitalsPanel: (show: boolean) => void;
  observations?: any[];
}

export function ProviderMeetingLayout({
  peers,
  localPeer,
  patientId,
  patientName,
  encounterId,
  onSaveClinicalNotes,
  showClinicalNotes,
  setShowClinicalNotes,
  showVitalsPanel,
  setShowVitalsPanel,
  observations = []
}: ProviderMeetingLayoutProps) {
  // Start with collapsed on mobile, expanded on desktop
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // Collapse on mobile (< 768px)
    }
    return false;
  });
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'history'>('overview');

  // Extract latest vital values from observations
  const getLatestVital = (loincCode: string, componentCodes?: string[]) => {
    if (componentCodes) {
      // Blood pressure - has components
      const latestObs = observations.find((obs: any) =>
        obs.code?.coding?.some((c: any) => c.code === loincCode)
      );
      if (latestObs?.component) {
        const sys = latestObs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === componentCodes[0])
        );
        const dia = latestObs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === componentCodes[1])
        );
        return {
          value: `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`,
          time: latestObs.effectiveDateTime
        };
      }
    } else {
      const latestObs = observations.find((obs: any) =>
        obs.code?.coding?.some((c: any) => c.code === loincCode)
      );
      if (latestObs?.valueQuantity?.value) {
        return {
          value: latestObs.valueQuantity.value.toString(),
          time: latestObs.effectiveDateTime
        };
      }
    }
    return { value: '-', time: null };
  };

  const getTimeSince = (dateTime: string | null) => {
    if (!dateTime) return 'No data';
    const diff = Date.now() - new Date(dateTime).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const heartRate = getLatestVital('8867-4');
  const bloodPressure = getLatestVital('85354-9', ['8480-6', '8462-4']);
  const temperature = getLatestVital('8310-5');
  const oxygenSat = getLatestVital('59408-5');

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-gray-50">
      {/* Top Overlay - Quick Patient Controls */}
      <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <div className="bg-white border border-gray-200 rounded-lg px-2 md:px-4 py-1 md:py-1.5 shadow-sm">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-gray-700 text-xs hidden sm:inline">Active</span>
            </div>
            <div className="w-px h-3 bg-gray-200 hidden sm:block" />
            <button
              onClick={() => setShowClinicalNotes(true)}
              className="flex items-center gap-1 px-1.5 md:px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
            >
              <FileText className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 text-xs hidden sm:inline">Notes</span>
            </button>
            <button
              onClick={() => setShowVitalsPanel(true)}
              className="flex items-center gap-1 px-1.5 md:px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
            >
              <Activity className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 text-xs hidden sm:inline">Vitals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Left Panel - Patient Details & SOAP Notes */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          leftPanelCollapsed
            ? 'w-0 overflow-hidden'
            : 'w-full md:w-80 lg:w-[400px] absolute md:relative inset-0 md:inset-auto z-30 md:z-auto'
        }`}
      >
        {!leftPanelCollapsed && (
          <>
            {/* Patient Header */}
            <div className="bg-gray-50 p-3 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-semibold text-sm">{patientName}</h2>
                    <p className="text-gray-500 text-xs">ID: {patientId.substring(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLeftPanelCollapsed(true)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-gray-900 border-b-2 border-gray-700 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('vitals')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'vitals'
                    ? 'text-gray-900 border-b-2 border-gray-700 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Vitals
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-gray-900 border-b-2 border-gray-700 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                History
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {activeTab === 'overview' && (
                <div className="p-3 space-y-3">
                  {/* Encounter Info */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-gray-600" />
                      <h3 className="text-gray-900 font-medium text-xs">Current Encounter</h3>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-900">Telehealth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-700 font-medium">In Progress</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started:</span>
                        <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
                      </div>
                      {encounterId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="text-gray-900 font-mono text-xs">{encounterId.substring(0, 12)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-gray-900 font-medium text-xs mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowClinicalNotes(true)}
                        className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-gray-900 font-medium text-xs">SOAP Notes</div>
                          <div className="text-gray-600 text-xs">Document findings</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowVitalsPanel(true)}
                        className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                      >
                        <Activity className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-gray-900 font-medium text-xs">Capture Vitals</div>
                          <div className="text-gray-600 text-xs">Record vitals</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Vitals Summary */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-gray-900 font-medium text-xs mb-2">Recent Vitals</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-gray-600 text-xs">HR</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{heartRate.value} bpm</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span className="text-gray-600 text-xs">BP</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{bloodPressure.value}</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Thermometer className="w-3 h-3 text-orange-500" />
                          <span className="text-gray-600 text-xs">Temp</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{temperature.value}°C</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wind className="w-3 h-3 text-cyan-500" />
                          <span className="text-gray-600 text-xs">SpO2</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{oxygenSat.value}%</div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last: {getTimeSince(heartRate.time || bloodPressure.time || temperature.time || oxygenSat.time)}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="p-3">
                  <VitalsCards observations={observations} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="p-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-gray-900 font-medium text-xs mb-2">Patient History</h3>
                    <p className="text-gray-500 text-xs">Medical history will appear here...</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Collapse Toggle Button */}
      {leftPanelCollapsed && (
        <button
          onClick={() => setLeftPanelCollapsed(false)}
          className="fixed md:absolute left-2 md:left-0 top-16 md:top-1/2 md:-translate-y-1/2 z-20 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg md:rounded-r-lg p-2 transition-colors shadow-lg"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Right Panel - Video */}
      <div className={`flex-1 bg-gray-100 flex flex-col transition-all duration-300 ${
        videoExpanded ? 'absolute inset-0 z-20' : ''
      }`}>
        {/* Video Controls Overlay */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10 flex gap-2">
          <button
            onClick={() => setVideoExpanded(!videoExpanded)}
            className="p-1.5 md:p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg transition-colors shadow-md"
          >
            {videoExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
            )}
          </button>
        </div>

        {/* Video Grid - Unified Responsive Layout */}
        <div className="flex-1 p-2 md:p-3 overflow-hidden">
          {peers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-4">
                <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 text-base md:text-lg font-medium">Waiting for patient to join...</p>
                <p className="text-gray-500 text-sm mt-2">The consultation will start once they arrive</p>
              </div>
            </div>
          ) : (
            <div
              className={`h-full w-full grid gap-2 md:gap-3 ${(() => {
                const count = peers.length;
                if (count === 1) return 'grid-cols-1 grid-rows-1';
                if (count === 2) return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
                if (count === 3) return 'grid-cols-2 md:grid-cols-3';
                if (count === 4) return 'grid-cols-2 md:grid-cols-2';
                if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
                if (count <= 9) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
                return '';
              })()}`}
              style={peers.length > 9 ? {
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gridAutoRows: 'minmax(0, 1fr)'
              } : {
                gridAutoRows: 'minmax(0, 1fr)'
              }}
            >
              {peers.map((peer) => (
                <VideoTile
                  key={peer.id}
                  peer={peer}
                  isLocal={peer.id === localPeer?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Participant Info Bar */}
        <div className="bg-white border-t border-gray-200 px-2 md:px-4 py-1.5 md:py-2">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              <span className="text-gray-900 text-xs font-medium">
                {peers.length} {peers.length === 1 ? 'Participant' : 'Participants'}
              </span>
            </div>
            <div className="flex -space-x-2">
              {peers.slice(0, 5).map((peer) => (
                <div
                  key={peer.id}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center"
                  title={peer.name}
                >
                  <span className="text-white text-xs font-bold">
                    {peer.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              ))}
              {peers.length > 5 && (
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{peers.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Notes Panel (Overlay) */}
      {patientId && (
        <ClinicalNotesPanel
          isOpen={showClinicalNotes}
          onClose={() => setShowClinicalNotes(false)}
          onSave={onSaveClinicalNotes}
          patientName={patientName}
          patientId={patientId}
          encounterId={encounterId}
        />
      )}
    </div>
  );
}
