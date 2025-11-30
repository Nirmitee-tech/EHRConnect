'use client';

import { useState, useEffect } from 'react';
import { Search, Check, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CodeSystem, ValueSetOption } from './fhir-fields-enterprise.config';

interface CodeSearchInputProps {
  value: string;
  onChange: (value: string, display?: string) => void;
  codeSystem?: CodeSystem;
  placeholder?: string;
  valueSet?: ValueSetOption[];
}

/**
 * Code Search Input Component
 * Allows searching and selecting standardized medical codes (LOINC, SNOMED, RxNorm, ICD-10, CPT)
 */
export function CodeSearchInput({
  value,
  onChange,
  codeSystem,
  placeholder,
  valueSet,
}: CodeSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState<ValueSetOption[]>([]);
  const [selectedCode, setSelectedCode] = useState<ValueSetOption | null>(null);

  // Filter results based on search term
  useEffect(() => {
    if (!searchTerm || !valueSet) {
      setFilteredResults([]);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = valueSet.filter(
      (option) =>
        option.code.toLowerCase().includes(lowerSearch) ||
        option.display.toLowerCase().includes(lowerSearch) ||
        option.definition?.toLowerCase().includes(lowerSearch)
    );

    setFilteredResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, valueSet]);

  // Find selected code from value
  useEffect(() => {
    if (value && valueSet) {
      const found = valueSet.find((opt) => opt.code === value);
      if (found) {
        setSelectedCode(found);
      }
    }
  }, [value, valueSet]);

  const handleSelect = (option: ValueSetOption) => {
    setSelectedCode(option);
    onChange(option.code, option.display);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowResults(true);

    // If user types a code directly
    if (!valueSet) {
      onChange(val);
    }
  };

  return (
    <div className="relative flex-1">
      {/* Selected Code Display */}
      {selectedCode && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {selectedCode.code}
              </Badge>
              <span className="text-sm text-gray-700 truncate">{selectedCode.display}</span>
            </div>
            {selectedCode.definition && (
              <p className="text-xs text-gray-600 mt-0.5">{selectedCode.definition}</p>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedCode(null);
              onChange('');
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder={
            placeholder ||
            (codeSystem
              ? `Search ${codeSystem.system} codes...`
              : 'Search or enter code...')
          }
          className="pl-8 pr-8 text-sm font-medium"
        />
        {codeSystem && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 group">
            <Info className="h-4 w-4 text-gray-400" />
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
              <div className="font-medium">{codeSystem.display}</div>
              <div className="text-gray-300 mt-1">{codeSystem.url}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && filteredResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 shadow-lg">
          <div className="p-1">
            {filteredResults.map((option, index) => (
              <button
                key={`${option.code}-${index}`}
                onClick={() => handleSelect(option)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs font-mono flex-shrink-0 mt-0.5">
                    {option.code}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {option.display}
                    </div>
                    {option.definition && (
                      <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {option.definition}
                      </div>
                    )}
                    {option.system && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.system}</div>
                    )}
                  </div>
                  {value === option.code && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {showResults && searchTerm && filteredResults.length === 0 && valueSet && (
        <Card className="absolute top-full left-0 right-0 mt-1 p-3 z-50 shadow-lg">
          <div className="text-center text-sm text-gray-600">
            No codes found matching "{searchTerm}"
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Try a different search term or code
          </div>
        </Card>
      )}

      {/* Code System Info */}
      {!selectedCode && codeSystem && !showResults && (
        <div className="mt-1 text-xs text-gray-500">
          {codeSystem.system} codes
        </div>
      )}
    </div>
  );
}
