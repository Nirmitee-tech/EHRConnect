'use client';

import { useState } from 'react';
import { User, Bed as BedIcon, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Bed, Room, Hospitalization } from '@/types/bed-management';

interface RoomBedVisualizationProps {
  beds: Bed[];
  rooms?: Room[];
  hospitalizations: Hospitalization[];
  onBedClick?: (bed: Bed) => void;
  onPatientClick?: (hospitalization: Hospitalization) => void;
}

interface BedWithPatient extends Bed {
  hospitalization?: Hospitalization;
}

export function RoomBedVisualization({
  beds,
  rooms = [],
  hospitalizations,
  onBedClick,
  onPatientClick,
}: RoomBedVisualizationProps) {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  // Create a map of beds with their current patient info
  const bedsWithPatients: BedWithPatient[] = beds.map(bed => {
    const hospitalization = hospitalizations.find(
      h => h.currentBedId === bed.id && h.status === 'admitted'
    );
    return { ...bed, hospitalization };
  });

  // Group beds by room, or create a "no room" group
  const bedsByRoom = bedsWithPatients.reduce((acc, bed) => {
    const roomId = bed.roomId || 'no-room';
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(bed);
    return acc;
  }, {} as Record<string, BedWithPatient[]>);

  const getBedStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 border-green-300',
      occupied: 'bg-red-100 border-red-300',
      reserved: 'bg-yellow-100 border-yellow-300',
      cleaning: 'bg-blue-100 border-blue-300',
      maintenance: 'bg-orange-100 border-orange-300',
      out_of_service: 'bg-gray-100 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 border-gray-300';
  };

  const renderBed = (bed: BedWithPatient) => {
    const hasPatient = !!bed.hospitalization;
    const isHovered = hoveredBed === bed.id;

    return (
      <div
        key={bed.id}
        className="relative"
        onMouseEnter={() => setHoveredBed(bed.id)}
        onMouseLeave={() => setHoveredBed(null)}
      >
        <div
          className={`
            relative flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer
            ${getBedStatusColor(bed.status)}
            ${isHovered ? 'shadow-lg scale-105 z-10' : 'shadow'}
          `}
          onClick={() => onBedClick?.(bed)}
        >
          {/* Bed Icon */}
          <BedIcon className={`h-8 w-8 mb-1 ${hasPatient ? 'text-red-600' : 'text-gray-400'}`} />

          {/* Patient Icon if occupied */}
          {hasPatient && (
            <div
              className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (bed.hospitalization) onPatientClick?.(bed.hospitalization);
              }}
            >
              <User className="h-4 w-4 text-white" />
            </div>
          )}

          {/* Bed Number */}
          <div className="text-sm font-bold text-gray-700">{bed.bedNumber}</div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className="mt-1 text-xs"
          >
            {bed.status}
          </Badge>
        </div>

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-20">
            <Card className="p-3 shadow-xl bg-gray-900 text-white border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{bed.bedNumber}</span>
                  <Badge className="bg-gray-700">{bed.bedType}</Badge>
                </div>

                <div className="text-sm space-y-1 text-gray-300">
                  <div>Status: <span className="text-white">{bed.status}</span></div>
                  {bed.room && (
                    <div>Room: <span className="text-white">{bed.room.roomNumber}</span></div>
                  )}

                  {/* Features */}
                  {(bed.hasOxygen || bed.hasMonitor || bed.hasSuction) && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {bed.hasOxygen && <Badge variant="secondary" className="text-xs">O₂</Badge>}
                      {bed.hasMonitor && <Badge variant="secondary" className="text-xs">Monitor</Badge>}
                      {bed.hasSuction && <Badge variant="secondary" className="text-xs">Suction</Badge>}
                      {bed.hasIvPole && <Badge variant="secondary" className="text-xs">IV</Badge>}
                    </div>
                  )}

                  {/* Patient Info */}
                  {bed.hospitalization && (
                    <>
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <div className="font-semibold text-yellow-400">
                          {bed.hospitalization.patientName}
                        </div>
                        {bed.hospitalization.patientMrn && (
                          <div className="text-xs">MRN: {bed.hospitalization.patientMrn}</div>
                        )}
                        {bed.hospitalization.primaryDiagnosis && (
                          <div className="text-xs mt-1">
                            Dx: {bed.hospitalization.primaryDiagnosis}
                          </div>
                        )}
                        {bed.hospitalization.attendingDoctorName && (
                          <div className="text-xs">
                            Dr. {bed.hospitalization.attendingDoctorName}
                          </div>
                        )}
                        {bed.hospitalization.admissionDate && (
                          <div className="flex items-center gap-1 text-xs mt-1">
                            <Clock className="h-3 w-3" />
                            Admitted: {new Date(bed.hospitalization.admissionDate).toLocaleDateString()}
                          </div>
                        )}
                        {bed.hospitalization.isolationRequired && (
                          <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Isolation Required
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderRoom = (roomId: string, roomBeds: BedWithPatient[]) => {
    const room = rooms.find(r => r.id === roomId);
    const roomNumber = room?.roomNumber || 'Unassigned';
    const capacity = room?.capacity || roomBeds.length;
    const occupied = roomBeds.filter(b => b.status === 'occupied').length;

    return (
      <Card key={roomId} className="p-4 bg-white hover:shadow-md transition-shadow">
        {/* Room Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <div>
            <div className="font-bold text-lg">{roomNumber}</div>
            {room && (
              <div className="text-xs text-muted-foreground">
                {room.roomType && <span className="capitalize">{room.roomType}</span>}
                {room.floorNumber && <span> • Floor {room.floorNumber}</span>}
              </div>
            )}
          </div>
          <Badge variant={occupied === capacity ? 'destructive' : 'secondary'}>
            {occupied}/{capacity}
          </Badge>
        </div>

        {/* Beds Grid */}
        <div className="grid grid-cols-2 gap-3">
          {roomBeds.map(renderBed)}
        </div>

        {/* Room Features */}
        {room && (room.hasOxygen || room.hasMonitor || room.hasSuction || room.hasBathroom) && (
          <div className="mt-3 pt-2 border-t flex gap-2 flex-wrap">
            {room.hasOxygen && <Badge variant="outline" className="text-xs">O₂</Badge>}
            {room.hasMonitor && <Badge variant="outline" className="text-xs">Monitor</Badge>}
            {room.hasSuction && <Badge variant="outline" className="text-xs">Suction</Badge>}
            {room.hasVentilator && <Badge variant="outline" className="text-xs">Vent</Badge>}
            {room.hasBathroom && <Badge variant="outline" className="text-xs">Bathroom</Badge>}
            {room.isIsolationCapable && <Badge variant="outline" className="text-xs">Isolation</Badge>}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(bedsByRoom).map(([roomId, roomBeds]) =>
        renderRoom(roomId, roomBeds)
      )}
    </div>
  );
}
