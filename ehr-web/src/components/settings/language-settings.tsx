'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/client';
import { languages, cookieName } from '@/i18n/settings';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function LanguageSettings() {
    const { t, i18n } = useTranslation('common');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLanguageChange = async (value: string) => {
        setLoading(true);
        try {
            // Update backend
            await apiClient.patch('/auth/me', { language: value });

            // Update cookie
            Cookies.set(cookieName, value);

            // Update i18n instance
            await i18n.changeLanguage(value);

            // Refresh page to apply changes everywhere
            router.refresh();
        } catch (error) {
            console.error('Failed to update language:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('language')}</CardTitle>
                <CardDescription>{t('select_language')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Select
                        value={i18n.language}
                        onValueChange={handleLanguageChange}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('select_language')} />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lng) => (
                                <SelectItem key={lng} value={lng}>
                                    {lng === 'en' ? 'English' : lng === 'es' ? 'Español' : lng === 'hi' ? 'हिंदी (Hindi)' : lng === 'ur' ? 'اردو (Urdu)' : lng}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
