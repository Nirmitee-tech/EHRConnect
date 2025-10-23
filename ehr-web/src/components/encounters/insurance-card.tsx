'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Edit2, X } from 'lucide-react';
import { InsuranceData } from '@/types/encounter';

interface InsuranceCardProps {
  insuranceCards?: InsuranceData[];
  onUpdate?: (cards: InsuranceData[]) => Promise<void>;
}

export function InsuranceCard({ insuranceCards = [], onUpdate }: InsuranceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cards, setCards] = useState<InsuranceData[]>(insuranceCards);

  // Get the primary active insurance card
  const primaryCard = cards.find(card => card.isPrimary && card.isActive);

  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate(cards);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update insurance cards:', error);
        alert('Failed to update insurance information');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg text-white min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Insurance Card</h3>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          <input
            type="text"
            placeholder="Provider Name"
            value={primaryCard?.insuranceName || ''}
            onChange={(e) => {
              const updated = cards.map(card =>
                card.isPrimary ? { ...card, insuranceName: e.target.value } : card
              );
              if (updated.length === 0) {
                updated.push({
                  id: Date.now().toString(),
                  type: 'primary',
                  insuranceName: e.target.value,
                  planType: '',
                  memberId: '',
                  subscriberName: '',
                  subscriberId: '',
                  relationship: 'self',
                  isPrimary: true,
                  isActive: true
                } as any);
              }
              setCards(updated);
            }}
            className="w-full px-2 py-1.5 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <input
            type="text"
            placeholder="Policy Number"
            value={primaryCard?.memberId || ''}
            onChange={(e) => {
              const updated = cards.map(card =>
                card.isPrimary ? { ...card, memberId: e.target.value } : card
              );
              if (updated.length === 0) {
                updated.push({
                  id: Date.now().toString(),
                  type: 'primary',
                  insuranceName: '',
                  planType: '',
                  memberId: e.target.value,
                  subscriberName: '',
                  subscriberId: '',
                  relationship: 'self',
                  isPrimary: true,
                  isActive: true
                } as any);
              }
              setCards(updated);
            }}
            className="w-full px-2 py-1.5 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <input
            type="text"
            placeholder="Subscriber Name"
            value={primaryCard?.subscriberName || ''}
            onChange={(e) => {
              const updated = cards.map(card =>
                card.isPrimary ? { ...card, subscriberName: e.target.value } : card
              );
              if (updated.length === 0) {
                updated.push({
                  id: Date.now().toString(),
                  type: 'primary',
                  insuranceName: '',
                  planType: '',
                  memberId: '',
                  subscriberName: e.target.value,
                  subscriberId: '',
                  relationship: 'self',
                  isPrimary: true,
                  isActive: true
                } as any);
              }
              setCards(updated);
            }}
            className="w-full px-2 py-1.5 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-3 py-1.5 bg-white text-blue-700 rounded text-xs font-semibold hover:bg-blue-50 transition-colors"
        >
          Save
        </button>
      </div>
    );
  }

  if (!primaryCard) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 shadow-lg border-2 border-dashed border-gray-300 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-sm text-gray-600">Insurance Card</h3>
          </div>
        </div>
        <div className="text-center py-2">
          <p className="text-xs text-gray-500 mb-2">No insurance information</p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Insurance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg text-white min-w-[280px] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Insurance Card</h3>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-white hover:text-blue-200 transition-colors"
            title="Edit Insurance"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="text-xs text-blue-200 mb-0.5">Provider</div>
            <div className="font-semibold text-sm">{primaryCard.insuranceName}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-blue-200 mb-0.5">Policy #</div>
              <div className="font-mono text-xs font-semibold">{primaryCard.memberId}</div>
            </div>
            {primaryCard.groupId && (
              <div>
                <div className="text-xs text-blue-200 mb-0.5">Group #</div>
                <div className="font-mono text-xs font-semibold">{primaryCard.groupId}</div>
              </div>
            )}
          </div>

          <div>
            <div className="text-xs text-blue-200 mb-0.5">Subscriber</div>
            <div className="text-xs font-medium">{primaryCard.subscriberName}</div>
            <div className="text-xs text-blue-200 capitalize">({primaryCard.relationship})</div>
          </div>

          {primaryCard.effectiveEndDate && (
            <div>
              <div className="text-xs text-blue-200 mb-0.5">Valid Until</div>
              <div className="text-xs font-medium">
                {new Date(primaryCard.effectiveEndDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs text-blue-200">Primary Coverage</span>
          <div className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-xs font-semibold">
            Active
          </div>
        </div>
      </div>
    </div>
  );
}
