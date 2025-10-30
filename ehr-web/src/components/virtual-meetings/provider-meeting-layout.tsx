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
  Droplet,
  Thermometer,
  Wind
} from 'lucide-react';
import { HMSPeer } from '@100mslive/react-sdk';
import { VideoTile } from './video-tile';
import { ClinicalNotesPanel } from './clinical-notes-panel';

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
  setShowVitalsPanel
}: ProviderMeetingLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'history'>('overview');

  return (
    <div className="flex-1 flex overflow-hidden relative bg-gray-50">
      {/* Top Overlay - Quick Patient Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-gray-700 text-xs">Active</span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <button
              onClick={() => setShowClinicalNotes(true)}
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
            >
              <FileText className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 text-xs">Notes</span>
            </button>
            <button
              onClick={() => setShowVitalsPanel(true)}
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
            >
              <Activity className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 text-xs">Vitals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Left Panel - Patient Details & SOAP Notes */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          leftPanelCollapsed ? 'w-0 overflow-hidden' : 'w-[400px]'
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
                        <div className="text-gray-900 font-semibold text-sm">72</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span className="text-gray-600 text-xs">BP</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">120/80</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Thermometer className="w-3 h-3 text-orange-500" />
                          <span className="text-gray-600 text-xs">Temp</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">98.6°F</div>
                      </div>

                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wind className="w-3 h-3 text-cyan-500" />
                          <span className="text-gray-600 text-xs">SpO2</span>
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">98%</div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last: 2 hours ago
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="p-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h3 className="text-gray-900 font-medium text-xs mb-2">Vitals History</h3>
                    <p className="text-gray-500 text-xs">Detailed vitals tracking coming soon...</p>
                  </div>
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-r-lg p-2 transition-colors shadow-lg"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Right Panel - Video */}
      <div className={`flex-1 bg-gray-100 flex flex-col transition-all duration-300 ${
        videoExpanded ? 'absolute inset-0 z-20' : ''
      }`}>
        {/* Video Controls Overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setVideoExpanded(!videoExpanded)}
            className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg transition-colors shadow-md"
          >
            {videoExpanded ? (
              <Minimize2 className="w-4 h-4 text-gray-700" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-3">
          <div className="h-full grid gap-3" style={{
            gridTemplateColumns: peers.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gridAutoRows: peers.length === 1 ? '1fr' : 'auto'
          }}>
            {peers.map((peer) => (
              <VideoTile
                key={peer.id}
                peer={peer}
                isLocal={peer.id === localPeer?.id}
              />
            ))}
          </div>
        </div>

        {/* Participant Info Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-900 text-xs font-medium">
                {peers.length} {peers.length === 1 ? 'Participant' : 'Participants'}
              </span>
            </div>
            <div className="flex -space-x-2">
              {peers.slice(0, 5).map((peer, idx) => (
                <div
                  key={peer.id}
                  className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center"
                  title={peer.name}
                >
                  <span className="text-white text-xs font-bold">
                    {peer.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              ))}
              {peers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
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
