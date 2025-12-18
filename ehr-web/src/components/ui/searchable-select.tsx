'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
  color?: string; // Background color for the option
  textColor?: string; // Text color for the option
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  showColorInButton?: boolean; // Show color in the selected button
  onAddNew?: () => void; // Callback for "Add New" button
  addNewLabel?: string; // Label for "Add New" button
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  disabled = false,
  className = '',
  required = false,
  showColorInButton = false,
  onAddNew,
  addNewLabel = 'Add New'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Get selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      // Scroll selected item into view with a longer delay to ensure rendering
      setTimeout(() => {
        if (selectedItemRef.current) {
          selectedItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 200);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value]); // Added value dependency to re-scroll when selection changes

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full px-4 py-2.5 text-left border rounded-lg
          transition-all duration-200
          ${disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
          }
          ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'}
          ${!selectedOption ? 'text-gray-400' : ''}
        `}
        style={
          showColorInButton && selectedOption?.color
            ? {
              backgroundColor: selectedOption.color,
              color: selectedOption.textColor || '#000000'
            }
            : { backgroundColor: '#ffffff', color: !selectedOption ? '#9ca3af' : '#111827' }
        }
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && !disabled && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Add New Button - Always visible at top */}
          {onAddNew && (
            <button
              type="button"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-2 border-b-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium sticky top-[60px] z-10"
            >
              <span className="text-lg">+</span>
              <span>{addNewLabel}</span>
            </button>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-72">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    ref={isSelected ? selectedItemRef : null}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2.5 text-left transition-colors
                      flex items-center justify-between gap-2 border-b border-gray-100 last:border-0
                      ${isSelected ? 'ring-2 ring-primary ring-inset' : 'hover:ring-1 hover:ring-gray-300 hover:ring-inset'}
                    `}
                    style={{
                      backgroundColor: option.color || (isSelected ? 'var(--theme-primary-10)' : '#ffffff'),
                      color: option.textColor || (isSelected ? 'var(--theme-primary)' : '#111827')
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{option.label}</div>
                      {option.subtitle && (
                        <div className="text-xs opacity-70 truncate mt-0.5">
                          {option.subtitle}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: option.textColor || 'var(--theme-primary)' }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
