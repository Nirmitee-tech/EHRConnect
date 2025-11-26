'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Users, Network, List, Plus, Loader2, GitBranch, Filter, Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fhirService } from '@/lib/medplum';
import type { FHIRFamilyMemberHistory } from '@/types/fhir';
import { FamilyTreeView } from './FamilyHistoryTab/FamilyTreeView';
import { FamilyFormView } from './FamilyHistoryTab/FamilyFormView';
import { FamilyTreeChart } from './FamilyHistoryTab/FamilyTreeChart';
import { FamilyMemberDrawer } from './FamilyHistoryTab/FamilyMemberDrawer';

interface FamilyHistoryTabProps {
  patientId: string;
}

type ViewMode = 'tree' | 'chart' | 'list';
type LineageFilter = 'all' | 'paternal' | 'maternal';

export function FamilyHistoryTab({ patientId }: FamilyHistoryTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [lineageFilter, setLineageFilter] = useState<LineageFilter>('all');
  const [familyHistory, setFamilyHistory] = useState<FHIRFamilyMemberHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingMember, setEditingMember] = useState<FHIRFamilyMemberHistory | null>(null);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalMembers = familyHistory.length;
    const totalConditions = familyHistory.reduce((sum, member) => sum + (member.condition?.length || 0), 0);
    const deceasedCount = familyHistory.filter(m => m.deceasedBoolean || m.deceasedDate || m.deceasedAge).length;

    // Count unique conditions
    const conditionSet = new Set<string>();
    familyHistory.forEach(member => {
      member.condition?.forEach(c => {
        const display = c.code?.coding?.[0]?.display || c.code?.text;
        if (display) conditionSet.add(display);
      });
    });

    // Most common conditions
    const conditionCounts = new Map<string, number>();
    familyHistory.forEach(member => {
      member.condition?.forEach(c => {
        const display = c.code?.coding?.[0]?.display || c.code?.text;
        if (display) {
          conditionCounts.set(display, (conditionCounts.get(display) || 0) + 1);
        }
      });
    });

    const topConditions = Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalMembers,
      totalConditions,
      deceasedCount,
      uniqueConditions: conditionSet.size,
      topConditions
    };
  }, [familyHistory]);

  useEffect(() => {
    loadFamilyHistory();
  }, [patientId]);

  const loadFamilyHistory = async () => {
    try {
      setLoading(true);
      const response = await fhirService.search<FHIRFamilyMemberHistory>('FamilyMemberHistory', {
        patient: `Patient/${patientId}`,
        _sort: '-date'
      });

      if (response.entry) {
        const histories = response.entry.map((entry: any) => entry.resource as FHIRFamilyMemberHistory);
        setFamilyHistory(histories);
      } else {
        setFamilyHistory([]);
      }
    } catch (error) {
      console.error('Error loading family history:', error);
      setFamilyHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowDrawer(true);
  };

  const handleEditMember = (member: FHIRFamilyMemberHistory) => {
    setEditingMember(member);
    setShowDrawer(true);
  };

  const handleSaveMember = async (memberData: Partial<FHIRFamilyMemberHistory>) => {
    try {
      if (editingMember?.id) {
        // Update existing
        await fhirService.update({
          ...editingMember,
          ...memberData
        });
      } else {
        // Create new
        await fhirService.create({
          resourceType: 'FamilyMemberHistory',
          status: 'completed',
          patient: {
            reference: `Patient/${patientId}`
          },
          ...memberData
        } as FHIRFamilyMemberHistory);
      }
      await loadFamilyHistory();
      setShowDrawer(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving family member:', error);
      throw error;
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await fhirService.delete('FamilyMemberHistory', memberId);
      await loadFamilyHistory();
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with View Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Family Health History</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {familyHistory.length} {familyHistory.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GitBranch className="h-4 w-4" />
                Visual Chart
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Network className="h-4 w-4" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
                List View
              </button>
            </div>

            <Button
              onClick={handleAddMember}
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Family Member
            </Button>
          </div>
        </div>

        {/* Summary and Filters */}
        {familyHistory.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            {/* Summary Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{summary.totalConditions}</span> conditions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{summary.uniqueConditions}</span> unique
                </span>
              </div>
              {summary.deceasedCount > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{summary.deceasedCount}</span> deceased
                </div>
              )}
            </div>

            {/* Lineage Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Lineage:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLineageFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    lineageFilter === 'all'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLineageFilter('paternal')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    lineageFilter === 'paternal'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Paternal
                </button>
                <button
                  onClick={() => setLineageFilter('maternal')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    lineageFilter === 'maternal'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Maternal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {familyHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Family History Recorded
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Start building a comprehensive family health history by adding family members and their health conditions.
            </p>
            <Button onClick={handleAddMember} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add First Family Member
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'chart' ? (
              <FamilyTreeChart
                familyHistory={familyHistory}
                patientId={patientId}
                lineageFilter={lineageFilter}
                onEditMember={handleEditMember}
              />
            ) : viewMode === 'tree' ? (
              <FamilyTreeView
                familyHistory={familyHistory}
                patientId={patientId}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
              />
            ) : (
              <FamilyFormView
                familyHistory={familyHistory}
                patientId={patientId}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
              />
            )}
          </>
        )}
      </div>

      {/* Drawer for Add/Edit */}
      <FamilyMemberDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
        patientId={patientId}
      />
    </div>
  );
}
