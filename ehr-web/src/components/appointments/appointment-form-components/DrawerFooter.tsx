import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/client';

interface DrawerFooterProps {
  loading: boolean;
  onCancel: () => void;
}

export function DrawerFooter({ loading, onCancel }: DrawerFooterProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        {t('common.cancel')}
      </Button>
      <Button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground hover:opacity-90"
      >
        {loading ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  );
}
