import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { patientService } from '@/services/patient.service';
import { PatientSummary } from '@/types/fhir';

interface PatientSearchProps {
  onSelectPatient: (patient: PatientSummary) => void;
}

export function PatientSearch({ onSelectPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await patientService.searchPatients({ name: searchQuery });
        setSearchResults(results.patients);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectPatient = (patient: PatientSummary) => {
    onSelectPatient(patient);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for existing patient"
          className="w-full h-9 pl-10 pr-3 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelectPatient(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{result.name}</p>
                  <p className="text-xs text-gray-500">
                    {result.age && `${result.age}y, `}{result.gender || 'Unknown'} {result.phone && `• ${result.phone}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
