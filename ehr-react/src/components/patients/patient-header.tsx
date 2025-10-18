import { User, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PatientHeaderProps {
  patient: {
    name: string;
    mrn: string;
    age: number;
    gender: string;
    dob: string;
    phone: string;
  };
  onEdit: () => void;
  onNewVisit: () => void;
}

export function PatientHeader({ patient, onEdit, onNewVisit }: PatientHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{patient.name}</h1>
              <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>MRN: {patient.mrn}</span>
              <span>•</span>
              <span>{patient.age}y, {patient.gender}</span>
              <span>•</span>
              <span>DOB: {patient.dob}</span>
              <span>•</span>
              <span>{patient.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" className="bg-primary" onClick={onNewVisit}>
            <Calendar className="h-4 w-4 mr-1" />
            New Visit
          </Button>
        </div>
      </div>
    </div>
  );
}
