import React from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { QuestionnaireItem } from '@/types/forms';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuestionTreeItemProps {
    item: QuestionnaireItem;
    selectedId: string | null;
    expandedIds: Set<string>;
    onSelect: (linkId: string) => void;
    onToggleExpand: (linkId: string) => void;
    onAddChild: (linkId: string) => void;
    onDelete: (linkId: string) => void;
    getIcon: (type: string) => React.ReactNode;
    depth?: number;
}

export function QuestionTreeItem({
    item,
    selectedId,
    expandedIds,
    onSelect,
    onToggleExpand,
    onAddChild,
    onDelete,
    getIcon,
    depth = 0,
}: QuestionTreeItemProps) {
    const isSelected = selectedId === item.linkId;
    const isExpanded = expandedIds.has(item.linkId);
    const hasChildren = item.item && item.item.length > 0;
    const isGroup = item.type === 'group';

    return (
        <div className="w-full">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item.linkId);
                }}
                className={cn(
                    "group w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-white transition-colors cursor-pointer border border-transparent",
                    isSelected && "bg-white shadow-sm border-blue-200"
                )}
                style={{ paddingLeft: `${(depth * 12) + 8}px` }}
            >
                {/* Expand Toggle */}
                <div
                    className={cn(
                        "h-4 w-4 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer",
                        !isGroup && !hasChildren && "invisible"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(item.linkId);
                    }}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                        <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                </div>

                {/* Icon */}
                <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                )}>
                    {getIcon(item.type)}
                </span>

                {/* Label */}
                <span className={cn(
                    "flex-1 text-left truncate",
                    isSelected ? "font-medium text-gray-900" : "text-gray-600"
                )}>
                    {item.text || item.linkId}
                </span>

                {/* Required Indicator */}
                {item.required && (
                    <span className="text-xs text-red-500">*</span>
                )}

                {/* Actions */}
                <div className={cn(
                    "flex items-center opacity-0 group-hover:opacity-100 transition-opacity",
                    isSelected && "opacity-100"
                )}>
                    {isGroup && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(item.linkId);
                            }}
                            title="Add child item"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 hover:bg-gray-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => onAddChild(item.linkId)} disabled={!isGroup}>
                                <Plus className="h-3 w-3 mr-2" />
                                Add Child
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(item.linkId)} className="text-red-600">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Children */}
            {isExpanded && hasChildren && (
                <div className="w-full">
                    {item.item!.map((child) => (
                        <QuestionTreeItem
                            key={child.linkId}
                            item={child}
                            selectedId={selectedId}
                            expandedIds={expandedIds}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                            getIcon={getIcon}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
