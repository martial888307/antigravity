'use client';

import Sidebar from './Sidebar';
import { clsx } from 'clsx';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    // Note: We can't easily share state between Sidebar and Layout without context,
    // but for now we'll assume the sidebar width is handled by CSS classes in the Sidebar component
    // and we'll add a margin to the main content.
    // A better approach would be a LayoutContext, but let's keep it simple first.

    // Actually, to handle the margin transition correctly with the collapsed state, 
    // we might need to lift the state up or use a context. 
    // For this version, let's use a fixed margin for desktop that accommodates the expanded sidebar,
    // or we can make the sidebar position absolute/fixed and push content.

    // Let's stick to a simple responsive layout where on desktop the sidebar is fixed.
    // We will add a left margin to the main content.

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />
            <main className="transition-all duration-300 ease-in-out md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
                {children}
            </main>
        </div>
    );
}
