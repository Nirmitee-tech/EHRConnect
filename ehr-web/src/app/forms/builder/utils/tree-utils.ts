import { QuestionnaireItem } from '@/types/forms';

/**
 * Find an item in the questionnaire tree by linkId
 */
export const findItem = (
  items: QuestionnaireItem[],
  linkId: string
): QuestionnaireItem | null => {
  for (const item of items) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const found = findItem(item.item, linkId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Find the path (array of indices) to an item
 */
export const findItemPath = (
  items: QuestionnaireItem[],
  linkId: string,
  currentPath: number[] = []
): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.linkId === linkId) {
      return [...currentPath, i];
    }
    if (item.item) {
      const path = findItemPath(item.item, linkId, [...currentPath, i]);
      if (path) {
        return path;
      }
    }
  }
  return null;
};

/**
 * Add a new item to the tree
 * If parentLinkId is provided, adds as a child of that item
 * Otherwise adds to the root level
 */
export const addItem = (
  items: QuestionnaireItem[],
  newItem: QuestionnaireItem,
  parentLinkId?: string | null
): QuestionnaireItem[] => {
  if (!parentLinkId) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.linkId === parentLinkId) {
      return {
        ...item,
        item: [...(item.item || []), newItem],
      };
    }
    if (item.item) {
      return {
        ...item,
        item: addItem(item.item, newItem, parentLinkId),
      };
    }
    return item;
  });
};

/**
 * Update an item in the tree
 */
export const updateItem = (
  items: QuestionnaireItem[],
  linkId: string,
  updates: Partial<QuestionnaireItem>
): QuestionnaireItem[] => {
  return items.map((item) => {
    if (item.linkId === linkId) {
      return { ...item, ...updates };
    }
    if (item.item) {
      return {
        ...item,
        item: updateItem(item.item, linkId, updates),
      };
    }
    return item;
  });
};

/**
 * Delete an item from the tree
 */
export const deleteItem = (
  items: QuestionnaireItem[],
  linkId: string
): QuestionnaireItem[] => {
  return items
    .filter((item) => item.linkId !== linkId)
    .map((item) => {
      if (item.item) {
        return {
          ...item,
          item: deleteItem(item.item, linkId),
        };
      }
      return item;
    });
};
