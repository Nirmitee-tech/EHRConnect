import React from 'react';

interface EyeExamData {
  visualAcuityOD: string;
  visualAcuityOS: string;
  intraocularPressureOD: string;
  intraocularPressureOS: string;
  pupilsOD: string;
  pupilsOS: string;
  externalExam: string;
  anteriorSegment: string;
  posteriorSegment: string;
  fundusOD: string;
  fundusOS: string;
  notes: string;
}

/**
 * EyeExamRenderer - Displays saved eye examination data
 */
export function EyeExamRenderer({ data }: { data: any }) {
  const eyeData = data as EyeExamData;

  return (
    <div className="space-y-3 text-sm">
      {/* Visual Acuity */}
      {(eyeData.visualAcuityOD || eyeData.visualAcuityOS) && (
        <div className="grid grid-cols-2 gap-4">
          {eyeData.visualAcuityOD && (
            <div>
              <span className="font-semibold text-gray-700">Visual Acuity OD:</span>
              <p className="text-gray-900 mt-1">{eyeData.visualAcuityOD}</p>
            </div>
          )}
          {eyeData.visualAcuityOS && (
            <div>
              <span className="font-semibold text-gray-700">Visual Acuity OS:</span>
              <p className="text-gray-900 mt-1">{eyeData.visualAcuityOS}</p>
            </div>
          )}
        </div>
      )}

      {/* IOP */}
      {(eyeData.intraocularPressureOD || eyeData.intraocularPressureOS) && (
        <div className="grid grid-cols-2 gap-4">
          {eyeData.intraocularPressureOD && (
            <div>
              <span className="font-semibold text-gray-700">IOP OD:</span>
              <p className="text-gray-900 mt-1">{eyeData.intraocularPressureOD} mmHg</p>
            </div>
          )}
          {eyeData.intraocularPressureOS && (
            <div>
              <span className="font-semibold text-gray-700">IOP OS:</span>
              <p className="text-gray-900 mt-1">{eyeData.intraocularPressureOS} mmHg</p>
            </div>
          )}
        </div>
      )}

      {/* Pupils */}
      {(eyeData.pupilsOD || eyeData.pupilsOS) && (
        <div className="grid grid-cols-2 gap-4">
          {eyeData.pupilsOD && (
            <div>
              <span className="font-semibold text-gray-700">Pupils OD:</span>
              <p className="text-gray-900 mt-1">{eyeData.pupilsOD}</p>
            </div>
          )}
          {eyeData.pupilsOS && (
            <div>
              <span className="font-semibold text-gray-700">Pupils OS:</span>
              <p className="text-gray-900 mt-1">{eyeData.pupilsOS}</p>
            </div>
          )}
        </div>
      )}

      {/* External Exam */}
      {eyeData.externalExam && (
        <div>
          <span className="font-semibold text-gray-700">External Examination:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.externalExam}</p>
        </div>
      )}

      {/* Anterior Segment */}
      {eyeData.anteriorSegment && (
        <div>
          <span className="font-semibold text-gray-700">Anterior Segment:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.anteriorSegment}</p>
        </div>
      )}

      {/* Posterior Segment */}
      {eyeData.posteriorSegment && (
        <div>
          <span className="font-semibold text-gray-700">Posterior Segment:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.posteriorSegment}</p>
        </div>
      )}

      {/* Fundus */}
      {(eyeData.fundusOD || eyeData.fundusOS) && (
        <div className="grid grid-cols-2 gap-4">
          {eyeData.fundusOD && (
            <div>
              <span className="font-semibold text-gray-700">Fundus OD:</span>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.fundusOD}</p>
            </div>
          )}
          {eyeData.fundusOS && (
            <div>
              <span className="font-semibold text-gray-700">Fundus OS:</span>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.fundusOS}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {eyeData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Additional Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{eyeData.notes}</p>
        </div>
      )}
    </div>
  );
}
