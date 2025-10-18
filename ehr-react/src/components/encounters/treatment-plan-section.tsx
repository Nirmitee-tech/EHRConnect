'use client';

import React, { useState, useEffect } from 'react';
import type { TreatmentPlanItem } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface TreatmentPlanSectionProps {
  treatmentPlan?: TreatmentPlanItem[];
  onUpdate: (treatmentPlan: TreatmentPlanItem[]) => void;
}

export function TreatmentPlanSection({
  treatmentPlan = [],
  onUpdate
}: TreatmentPlanSectionProps) {
  const [items, setItems] = useState<TreatmentPlanItem[]>(treatmentPlan);
  const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Sync with parent
  useEffect(() => {
    setItems(treatmentPlan);
  }, [treatmentPlan]);

  // Calculate totals
  const calculateTotals = () => {
    const totalCharges = items.reduce((sum, item) => sum + item.charges, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const totalNetAmount = items.reduce((sum, item) => sum + item.netAmount, 0);
    const totalGst = items.reduce((sum, item) => sum + item.gst, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    return {
      totalCharges,
      totalDiscount,
      totalNetAmount,
      totalGst,
      grandTotal
    };
  };

  // Auto-calculate amounts for a treatment item
  const calculateItemAmounts = (
    charges: number,
    discountPercent: number,
    gstPercent: number = 18
  ): Partial<TreatmentPlanItem> => {
    const grossAmount = charges;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const netAmount = grossAmount - discountAmount;
    const gst = (netAmount * gstPercent) / 100;
    const total = netAmount + gst;

    return {
      charges,
      grossAmount,
      discount: discountAmount,
      netAmount,
      gst,
      total
    };
  };

  const handleAddItem = () => {
    const newItem: TreatmentPlanItem = {
      id: `treatment-${Date.now()}`,
      treatment: '',
      charges: 0,
      grossAmount: 0,
      discount: 0,
      netAmount: 0,
      gst: 0,
      total: 0,
      note: ''
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    let updatedItems: TreatmentPlanItem[];
    if (isAddingItem) {
      updatedItems = [...items, editingItem];
    } else {
      updatedItems = items.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
    }

    setItems(updatedItems);
    onUpdate(updatedItems);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this treatment item?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleChargesChange = (charges: number, discountPercent: number = 0) => {
    if (!editingItem) return;
    const calculated = calculateItemAmounts(charges, discountPercent);
    setEditingItem({
      ...editingItem,
      ...calculated
    });
  };

  const handleDiscountPercentChange = (discountPercent: number) => {
    if (!editingItem) return;
    const calculated = calculateItemAmounts(editingItem.charges, discountPercent);
    setEditingItem({
      ...editingItem,
      ...calculated
    });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Treatment
        </button>
      </div>

      {/* Treatment Plan Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">#</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b min-w-[200px]">Treatment</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Charges</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Gross Amt</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Disc %</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Net Amt</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">GST (18%)</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Total</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Note</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !isAddingItem && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-gray-500">
                  No treatment items added. Click "Add Treatment" to add one.
                </td>
              </tr>
            )}

            {items.map((item, index) => (
              editingItem?.id === item.id && !isAddingItem ? (
                <tr key={item.id} className="bg-blue-50 border-b">
                  <td className="px-3 py-2 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={editingItem.treatment}
                      onChange={(e) => setEditingItem({ ...editingItem, treatment: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Treatment name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={editingItem.charges}
                      onChange={(e) => {
                        const charges = parseFloat(e.target.value) || 0;
                        const currentDiscountPercent = editingItem.charges > 0
                          ? (editingItem.discount / editingItem.charges) * 100
                          : 0;
                        handleChargesChange(charges, currentDiscountPercent);
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-600">
                    {editingItem.grossAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={editingItem.charges > 0 ? ((editingItem.discount / editingItem.charges) * 100).toFixed(0) : 0}
                      onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-600">
                    {editingItem.netAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-600">
                    {editingItem.gst.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-semibold text-gray-900">
                    {editingItem.total.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={editingItem.note || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Optional note"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={handleSaveItem}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="px-3 py-2 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.treatment}</td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900">₹{item.charges.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900">₹{item.grossAmount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-right text-orange-600">
                    {item.charges > 0 ? `${((item.discount / item.charges) * 100).toFixed(0)}%` : '0%'}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900">₹{item.netAmount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900">₹{item.gst.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-right font-semibold text-gray-900">₹{item.total.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.note || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}

            {/* Add new item row */}
            {isAddingItem && editingItem && (
              <tr className="bg-green-50 border-b">
                <td className="px-3 py-2 text-sm text-gray-600">{items.length + 1}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={editingItem.treatment}
                    onChange={(e) => setEditingItem({ ...editingItem, treatment: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., Root Canal Treatment"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={editingItem.charges}
                    onChange={(e) => {
                      const charges = parseFloat(e.target.value) || 0;
                      handleChargesChange(charges, 0);
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-3 py-2 text-sm text-right text-gray-600">
                  {editingItem.grossAmount.toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={editingItem.charges > 0 ? ((editingItem.discount / editingItem.charges) * 100).toFixed(0) : 0}
                    onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2 text-sm text-right text-gray-600">
                  {editingItem.netAmount.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-sm text-right text-gray-600">
                  {editingItem.gst.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-sm text-right font-semibold text-gray-900">
                  {editingItem.total.toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={editingItem.note || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, note: e.target.value })}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Optional note"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={handleSaveItem}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Totals Row */}
            {items.length > 0 && (
              <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                <td colSpan={2} className="px-3 py-3 text-sm text-right text-gray-900">
                  TOTAL
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-900">
                  ₹{totals.totalCharges.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-900">
                  ₹{totals.totalCharges.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-orange-600">
                  ₹{totals.totalDiscount.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-900">
                  ₹{totals.totalNetAmount.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-900">
                  ₹{totals.totalGst.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-green-700 text-base">
                  ₹{totals.grandTotal.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-700 font-medium">Total Charges</div>
            <div className="text-lg font-bold text-blue-900">₹{totals.totalCharges.toFixed(2)}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-xs text-orange-700 font-medium">Total Discount</div>
            <div className="text-lg font-bold text-orange-900">₹{totals.totalDiscount.toFixed(2)}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-xs text-purple-700 font-medium">Net Amount</div>
            <div className="text-lg font-bold text-purple-900">₹{totals.totalNetAmount.toFixed(2)}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xs text-yellow-700 font-medium">GST (18%)</div>
            <div className="text-lg font-bold text-yellow-900">₹{totals.totalGst.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs text-green-700 font-medium">Grand Total</div>
            <div className="text-xl font-bold text-green-900">₹{totals.grandTotal.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
