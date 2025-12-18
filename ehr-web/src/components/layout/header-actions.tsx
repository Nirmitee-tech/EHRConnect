'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function HeaderActions({
    children,
    target = 'header'
}: {
    children: React.ReactNode;
    target?: 'header' | 'tabbar';
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const rootId = target === 'header' ? 'header-actions-root' : 'layout-actions-root';
    const root = document.getElementById(rootId);
    if (!root) return null;

    return createPortal(children, root);
}
