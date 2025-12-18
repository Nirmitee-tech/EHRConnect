import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from '@/i18n/client';

interface Form {
  id: string;
  name: string;
}

interface MultiSelectFormDropdownProps {
  selectedForms: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  availableForms?: Form[];
}

const DEFAULT_FORMS: Form[] = [
  { id: '1', name: 'Medical History Form' },
  { id: '2', name: 'Consent Form' },
  { id: '3', name: 'Insurance Information' },
  { id: '4', name: 'Patient Registration' },
  { id: '5', name: 'HIPAA Authorization' },
  { id: '6', name: 'Financial Agreement' },
  { id: '7', name: 'Pre-Appointment Questionnaire' },
  { id: '8', name: 'Emergency Contact Form' },
];

export function MultiSelectFormDropdown({
  selectedForms,
  onSelectionChange,
  availableForms = DEFAULT_FORMS
}: MultiSelectFormDropdownProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        inputRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Filter forms based on search
  const filteredForms = availableForms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected form names
  const selectedFormNames = availableForms
    .filter(form => selectedForms.includes(form.id))
    .map(form => form.name);

  // Toggle form selection
  const toggleForm = (formId: string) => {
    if (selectedForms.includes(formId)) {
      onSelectionChange(selectedForms.filter(id => id !== formId));
    } else {
      onSelectionChange([...selectedForms, formId]);
    }
  };

  // Remove a selected form
  const removeForm = (formId: string) => {
    onSelectionChange(selectedForms.filter(id => id !== formId));
  };

  // Clear all selections
  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          min-h-[36px] w-full rounded-md border bg-white px-3 py-1.5 cursor-pointer transition-all
          ${isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Selected Forms or Placeholder */}
          <div className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[20px]">
            {selectedFormNames.length > 0 ? (
              selectedFormNames.map((name, index) => {
                const form = availableForms.find(f => f.name === name);
                return (
                  <span
                    key={form?.id || index}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded border border-primary/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (form) removeForm(form.id);
                      }}
                      className="hover:text-primary/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-gray-400">{t('appointment_form.search_select_forms')}</span>
            )}
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('appointment_form.search_forms_placeholder')}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Forms List */}
          <div className="overflow-y-auto max-h-48">
            {filteredForms.length > 0 ? (
              filteredForms.map((form) => {
                const isSelected = selectedForms.includes(form.id);
                return (
                  <label
                    key={form.id}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'}
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleForm(form.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-gray-700'}`}>
                      {form.name}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {t('appointment_form.no_forms_found')}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {selectedForms.length > 0 && (
            <div className="p-2 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-600">
                {t('appointment_form.forms_selected', { count: selectedForms.length })}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                {t('common.clear_all')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
