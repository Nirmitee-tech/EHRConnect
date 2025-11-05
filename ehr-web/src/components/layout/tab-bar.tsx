'use client';

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTabs } from '@/contexts/tab-context';
import { useUIPreferences } from '@/contexts/ui-preferences-context';
import { X, MoreHorizontal, XCircle, Eye, EyeOff } from 'lucide-react';

// Routes where the toggle should be shown (same as header hide routes)
const DETAIL_PAGE_ROUTES = [
  {
    pattern: /^\/patients\/[^/]+$/,
    exclude: ['/patients/new']
  },
  // Add more routes here as needed - should match HIDE_HEADER_ROUTES in healthcare-header.tsx
];

// Memoize individual tab component
const TabItem = memo(({
  tab,
  isActive,
  isDragging,
  isDragOver,
  onTabClick,
  onCloseTab,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}: {
  tab: any;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onTabClick: (tabId: string) => void;
  onCloseTab: (e: React.MouseEvent, tabId: string) => void;
  onContextMenu: (e: React.MouseEvent, tabId: string) => void;
  onDragStart: (e: React.DragEvent, tabId: string) => void;
  onDragOver: (e: React.DragEvent, tabId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, tabId: string) => void;
  onDragEnd: () => void;
}) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, tab.id)}
    onDragOver={(e) => onDragOver(e, tab.id)}
    onDragLeave={onDragLeave}
    onDrop={(e) => onDrop(e, tab.id)}
    onDragEnd={onDragEnd}
    onClick={() => onTabClick(tab.id)}
    onContextMenu={(e) => onContextMenu(e, tab.id)}
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
        onClick={(e) => onCloseTab(e, tab.id)}
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
));

TabItem.displayName = 'TabItem';

export const TabBar = memo(function TabBar() {
  const pathname = usePathname();
  const { tabs, activeTabId, setActiveTab, closeTab, closeAllTabs, closeOtherTabs } = useTabs();
  const { hideHeaderOnDetailPages, setHideHeaderOnDetailPages } = useUIPreferences();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Check if current page is a detail page where toggle should be shown
  const isDetailPage = pathname && DETAIL_PAGE_ROUTES.some(route => {
    const matchesPattern = route.pattern.test(pathname);
    const isExcluded = route.exclude?.some(exclusion => pathname.includes(exclusion));
    return matchesPattern && !isExcluded;
  });

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

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const handleCloseTab = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  }, [closeTab]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  }, [draggedTabId]);

  const handleDragLeave = useCallback(() => {
    setDragOverTabId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetTabId: string) => {
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
  }, [draggedTabId, tabs]);

  const handleDragEnd = useCallback(() => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  }, []);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-300 flex items-center overflow-x-auto overflow-y-hidden h-10 px-2 gap-1">
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isDragging = tab.id === draggedTabId;
            const isDragOver = tab.id === dragOverTabId;

            return (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={isActive}
                isDragging={isDragging}
                isDragOver={isDragOver}
                onTabClick={handleTabClick}
                onCloseTab={handleCloseTab}
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </div>

        {/* Header Toggle Switch - Only show on detail pages */}
        {isDetailPage && (
          <div className="flex items-center gap-2 ml-auto pr-2 border-l border-gray-300 pl-3">
            <button
              onClick={() => setHideHeaderOnDetailPages(!hideHeaderOnDetailPages)}
              className={`
                flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all
                ${hideHeaderOnDetailPages
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
              title={hideHeaderOnDetailPages ? 'Header hidden on detail pages' : 'Header visible on all pages'}
            >
              {hideHeaderOnDetailPages ? (
                <>
                  <EyeOff size={14} />
                  <span>Header Hidden</span>
                </>
              ) : (
                <>
                  <Eye size={14} />
                  <span>Header Visible</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={useCallback(() => {
              closeTab(contextMenu.tabId);
              setContextMenu(null);
            }, [closeTab, contextMenu.tabId])}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <X size={14} />
            Close
          </button>
          <button
            onClick={useCallback(() => {
              closeOtherTabs(contextMenu.tabId);
              setContextMenu(null);
            }, [closeOtherTabs, contextMenu.tabId])}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MoreHorizontal size={14} />
            Close Others
          </button>
          <button
            onClick={useCallback(() => {
              closeAllTabs();
              setContextMenu(null);
            }, [closeAllTabs])}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <XCircle size={14} />
            Close All
          </button>
        </div>
      )}
    </>
  );
});
