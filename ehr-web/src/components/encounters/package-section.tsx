'use client';

import React, { useState, useEffect } from 'react';
import { Package } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, Package as PackageIcon, CheckCircle } from 'lucide-react';

interface PackageSectionProps {
  packages?: Package[];
  onUpdate: (packages: Package[]) => void;
}

export function PackageSection({
  packages = [],
  onUpdate
}: PackageSectionProps) {
  const [items, setItems] = useState<Package[]>(packages);
  const [editingItem, setEditingItem] = useState<Package | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Sync with parent
  useEffect(() => {
    setItems(packages);
  }, [packages]);

  const handleAddItem = () => {
    const newItem: Package = {
      id: `package-${Date.now()}`,
      name: '',
      description: '',
      items: [],
      price: 0
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.name.trim()) {
      alert('Package name is required');
      return;
    }

    let updatedItems: Package[];
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
    if (confirm('Delete this package?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleAddPackageItem = () => {
    if (!editingItem) return;
    const newItem = '';
    setEditingItem({
      ...editingItem,
      items: [...editingItem.items, newItem]
    });
  };

  const handleUpdatePackageItem = (index: number, value: string) => {
    if (!editingItem) return;
    const updatedItems = [...editingItem.items];
    updatedItems[index] = value;
    setEditingItem({
      ...editingItem,
      items: updatedItems
    });
  };

  const handleRemovePackageItem = (index: number) => {
    if (!editingItem) return;
    const updatedItems = editingItem.items.filter((_, i) => i !== index);
    setEditingItem({
      ...editingItem,
      items: updatedItems
    });
  };

  // Predefined package templates
  const packageTemplates = [
    {
      name: 'Basic Dental Checkup Package',
      description: 'Comprehensive dental examination and cleaning',
      items: ['Complete oral examination', 'Professional teeth cleaning', 'Fluoride treatment', 'X-rays (if needed)'],
      price: 2500
    },
    {
      name: 'Orthodontic Consultation Package',
      description: 'Initial orthodontic assessment and treatment planning',
      items: ['Orthodontic consultation', 'Dental impressions', 'Treatment plan development', 'Cost estimation'],
      price: 1500
    },
    {
      name: 'Whitening Package',
      description: 'Professional teeth whitening treatment',
      items: ['Teeth whitening consultation', 'Professional whitening treatment', 'Take-home maintenance kit', 'Follow-up appointment'],
      price: 5000
    }
  ];

  const handleUseTemplate = (template: typeof packageTemplates[0]) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        name: template.name,
        description: template.description,
        items: [...template.items],
        price: template.price
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Package
        </button>
      </div>

      {/* Packages List */}
      <div className="space-y-3">
        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No treatment packages added. Click "Add Package" to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            <div key={item.id} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <PackageIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Editing Package</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Package Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Complete Dental Package"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Brief description of the package..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Package Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700">Package Items</label>
                  <button
                    onClick={handleAddPackageItem}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {editingItem.items.map((packageItem, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={packageItem}
                        onChange={(e) => handleUpdatePackageItem(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Item ${idx + 1}`}
                      />
                      <button
                        onClick={() => handleRemovePackageItem(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {editingItem.items.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No items added yet</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PackageIcon className="h-5 w-5 text-green-600" />
                      <h4 className="text-base font-bold text-gray-900">{item.name}</h4>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-700">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-2xl font-bold text-green-700">₹{item.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Includes:</h5>
                    <ul className="space-y-1">
                      {item.items.map((packageItem, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{packageItem}</span>
                        </li>
                      ))}
                    </ul>
                    {item.items.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No items specified</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Add new item form */}
        {isAddingItem && editingItem && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <PackageIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">New Package</span>
            </div>

            {/* Quick Templates */}
            <div className="bg-white border border-green-200 rounded-lg p-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates:</label>
              <div className="grid grid-cols-3 gap-2">
                {packageTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUseTemplate(template)}
                    className="text-left px-3 py-2 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                  >
                    <div className="text-xs font-semibold text-green-900">{template.name}</div>
                    <div className="text-xs text-green-700 mt-0.5">₹{template.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Premium Dental Care Package"
                  autoFocus
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Brief description of the package..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Package Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">Package Items</label>
                <button
                  onClick={handleAddPackageItem}
                  className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2">
                {editingItem.items.map((packageItem, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <input
                      type="text"
                      value={packageItem}
                      onChange={(e) => handleUpdatePackageItem(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Item ${idx + 1}`}
                    />
                    <button
                      onClick={() => handleRemovePackageItem(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {editingItem.items.length === 0 && (
                  <p className="text-xs text-gray-500 italic">Click "+ Add Item" to add items to this package</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Total Packages: <span className="text-lg font-bold">{items.length}</span>
              </span>
            </div>
            <div className="text-sm font-medium text-green-900">
              Combined Value: <span className="text-lg font-bold">₹{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
