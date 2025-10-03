'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTabs } from '@/contexts/tab-context';
import { X, MoreHorizontal, XCircle } from 'lucide-react';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeAllTabs, closeOtherTabs } = useTabs();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();

    if (draggedTabId && draggedTabId !== targetTabId) {
      const draggedIndex = tabs.findIndex((t) => t.id === draggedTabId);
      const targetIndex = tabs.findIndex((t) => t.id === targetTabId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Note: reorderTabs would need to be implemented
        // For now, we'll skip the actual reordering logic
      }
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-300 flex items-center overflow-x-auto overflow-y-hidden h-10 px-2 gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isDragging = tab.id === draggedTabId;
          const isDragOver = tab.id === dragOverTabId;

          return (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={`
                group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer
                min-w-[120px] max-w-[200px] transition-all
                ${isActive
                  ? 'bg-white border-t border-x border-gray-300 shadow-sm'
                  : 'bg-gray-200 hover:bg-gray-300 border-t border-x border-transparent'
                }
                ${isDragging ? 'opacity-50' : ''}
                ${isDragOver ? 'border-l-2 border-l-blue-500' : ''}
              `}
            >
              {tab.icon && React.isValidElement(tab.icon) && (
                <span className="flex-shrink-0">{tab.icon}</span>
              )}

              <span className="flex-1 truncate text-sm font-medium text-gray-700">
                {tab.title}
              </span>

              {tab.closeable !== false && (
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={`
                    flex-shrink-0 rounded p-0.5 transition-colors
                    ${isActive ? 'hover:bg-gray-200' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-400'}
                  `}
                  aria-label="Close tab"
                >
                  <X size={14} className="text-gray-600" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              closeTab(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <X size={14} />
            Close
          </button>
          <button
            onClick={() => {
              closeOtherTabs(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MoreHorizontal size={14} />
            Close Others
          </button>
          <button
            onClick={() => {
              closeAllTabs();
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <XCircle size={14} />
            Close All
          </button>
        </div>
      )}
    </>
  );
}
