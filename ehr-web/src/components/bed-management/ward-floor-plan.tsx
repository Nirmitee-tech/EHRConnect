'use client';

import { useState } from 'react';
import { User, Bed as BedIcon, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Bed, Room, Hospitalization, Ward } from '@/types/bed-management';

interface WardFloorPlanProps {
  ward: Ward;
  beds: Bed[];
  rooms?: Room[];
  hospitalizations: Hospitalization[];
  onBedClick?: (bed: Bed) => void;
  onPatientClick?: (hospitalization: Hospitalization) => void;
}

interface BedWithPatient extends Bed {
  hospitalization?: Hospitalization;
}

export function WardFloorPlan({
  ward,
  beds,
  rooms = [],
  hospitalizations,
  onBedClick,
  onPatientClick,
}: WardFloorPlanProps) {
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  // Create a map of beds with their current patient info
  const bedsWithPatients: BedWithPatient[] = beds.map(bed => {
    const hospitalization = hospitalizations.find(
      h => h.currentBedId === bed.id && h.status === 'admitted'
    );
    return { ...bed, hospitalization };
  });

  // Group beds by room
  const bedsByRoom = bedsWithPatients.reduce((acc, bed) => {
    const roomId = bed.roomId || 'no-room';
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(bed);
    return acc;
  }, {} as Record<string, BedWithPatient[]>);

  const getBedStatusColor = (status: string, isSelected: boolean = false) => {
    if (isSelected) return 'bg-blue-500';
    const colors: Record<string, string> = {
      available: 'bg-green-400',
      occupied: 'bg-red-400',
      reserved: 'bg-yellow-400',
      cleaning: 'bg-blue-300',
      maintenance: 'bg-orange-400',
      out_of_service: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-300';
  };

  const getRoomBackgroundColor = (roomBeds: BedWithPatient[]) => {
    const hasOccupied = roomBeds.some(b => b.status === 'occupied');
    const allAvailable = roomBeds.every(b => b.status === 'available');

    if (allAvailable) return 'bg-green-50';
    if (hasOccupied) return 'bg-red-50';
    return 'bg-gray-50';
  };

  const renderBed = (bed: BedWithPatient, index: number) => {
    const hasPatient = !!bed.hospitalization;
    const isHovered = hoveredBed === bed.id;
    const isSelected = selectedBed === bed.id;

    return (
      <div
        key={bed.id}
        className="relative flex flex-col items-center"
        style={{
          gridColumn: (index % 2) + 1,
          gridRow: Math.floor(index / 2) + 1,
        }}
        onMouseEnter={() => setHoveredBed(bed.id)}
        onMouseLeave={() => setHoveredBed(null)}
        onClick={() => {
          setSelectedBed(bed.id);
          onBedClick?.(bed);
        }}
      >
        {/* Bed Frame */}
        <div className="relative flex items-center justify-center cursor-pointer">
          {/* Bed Rectangle */}
          <div
            className={`
              w-16 h-20 rounded border-2 transition-all
              ${getBedStatusColor(bed.status, isSelected)}
              ${isHovered || isSelected ? 'shadow-lg scale-110 border-gray-700' : 'border-gray-400'}
            `}
          >
            {/* Bed Number */}
            <div className="absolute -top-2 -left-2 bg-white border border-gray-400 rounded px-1 text-[10px] font-bold">
              {bed.bedNumber}
            </div>

            {/* Bed Icon inside */}
            <div className="flex items-center justify-center h-full">
              <BedIcon className="w-8 h-8 text-white opacity-70" />
            </div>
          </div>

          {/* Patient Icon - Standing next to bed */}
          {hasPatient && (
            <div
              className="absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (bed.hospitalization) onPatientClick?.(bed.hospitalization);
              }}
            >
              <div className="relative">
                {/* Patient Figure */}
                <svg width="24" height="40" viewBox="0 0 24 40" className="drop-shadow">
                  {/* Head */}
                  <circle cx="12" cy="6" r="5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                  {/* Body */}
                  <rect x="7" y="11" width="10" height="15" rx="2" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                  {/* Arms */}
                  <rect x="2" y="14" width="6" height="3" rx="1.5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                  <rect x="16" y="14" width="6" height="3" rx="1.5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                  {/* Legs */}
                  <rect x="8" y="26" width="3" height="12" rx="1.5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                  <rect x="13" y="26" width="3" height="12" rx="1.5" fill="#3b82f6" stroke="#1e40af" strokeWidth="1" />
                </svg>

                {/* Alert badge if needed */}
                {bed.hospitalization?.isolationRequired && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features badges */}
          {(bed.hasMonitor || bed.hasOxygen) && (
            <div className="absolute -bottom-3 left-0 right-0 flex justify-center gap-0.5">
              {bed.hasMonitor && (
                <div className="w-2 h-2 rounded-full bg-purple-500" title="Monitor" />
              )}
              {bed.hasOxygen && (
                <div className="w-2 h-2 rounded-full bg-cyan-500" title="Oxygen" />
              )}
            </div>
          )}
        </div>

        {/* Hover Tooltip */}
        {isHovered && bed.hospitalization && (
          <div className="absolute -top-2 left-full ml-2 w-48 z-50 bg-gray-900 text-white p-2 rounded shadow-xl text-xs">
            <div className="font-bold text-sm">{bed.hospitalization.patientName}</div>
            {bed.hospitalization.patientMrn && (
              <div className="text-gray-300 text-[10px]">MRN: {bed.hospitalization.patientMrn}</div>
            )}
            {bed.hospitalization.primaryDiagnosis && (
              <div className="text-gray-300 mt-1">{bed.hospitalization.primaryDiagnosis}</div>
            )}
            {bed.hospitalization.attendingDoctorName && (
              <div className="text-gray-300 mt-1">Dr. {bed.hospitalization.attendingDoctorName}</div>
            )}
            <div className="flex items-center gap-1 text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              {new Date(bed.hospitalization.admissionDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRoom = (roomId: string, roomBeds: BedWithPatient[]) => {
    const room = rooms.find(r => r.id === roomId);
    const roomNumber = room?.roomNumber || roomId;
    const occupied = roomBeds.filter(b => b.status === 'occupied').length;
    const capacity = roomBeds.length;

    // Calculate room size based on bed count
    const cols = 2;
    const rows = Math.ceil(roomBeds.length / cols);
    const roomWidth = cols * 80 + 60; // 80px per bed column + padding
    const roomHeight = rows * 100 + 60; // 100px per bed row + padding

    return (
      <div
        key={roomId}
        className={`
          relative border-2 border-gray-400 rounded-lg p-4 m-2 transition-all
          ${getRoomBackgroundColor(roomBeds)}
          hover:shadow-lg
        `}
        style={{
          width: `${roomWidth}px`,
          minHeight: `${roomHeight}px`,
        }}
      >
        {/* Room Number Badge */}
        <div className="absolute -top-3 left-3 bg-white border-2 border-gray-400 rounded px-2 py-0.5">
          <div className="font-bold text-sm">{roomNumber}</div>
          <div className="text-[10px] text-gray-600">
            {occupied}/{capacity}
          </div>
        </div>

        {/* Door indicator */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-12 bg-gray-600 rounded-r" />

        {/* Room Type Badge */}
        {room?.roomType && (
          <Badge variant="outline" className="absolute -top-3 right-3 text-[10px]">
            {room.roomType}
          </Badge>
        )}

        {/* Beds Grid */}
        <div
          className="grid gap-6 mt-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, 80px)`,
            gridTemplateRows: `repeat(${rows}, 100px)`,
          }}
        >
          {roomBeds.map((bed, index) => renderBed(bed, index))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Ward Header */}
      <div className="mb-4 p-3 bg-white rounded-lg border-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{ward.name}</h3>
            <div className="text-sm text-gray-600">
              {ward.wardType} • Floor {ward.floorNumber || 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {beds.filter(b => b.status === 'occupied').length}/{beds.length}
            </div>
            <div className="text-xs text-gray-600">Occupied</div>
          </div>
        </div>
      </div>

      {/* Floor Plan - Rooms arranged in a flow layout */}
      <div className="flex flex-wrap justify-start items-start bg-gray-100 p-4 rounded-lg min-h-[400px]">
        {Object.entries(bedsByRoom).map(([roomId, roomBeds]) =>
          renderRoom(roomId, roomBeds)
        )}
      </div>
    </div>
  );
}
