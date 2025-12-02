import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, HardHat, ChevronLeft, ChevronRight, Menu, Briefcase, Calendar, Home, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/components/AuthProvider';
import EnterpriseSettingsModal from '@/components/EnterpriseSettingsModal';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const pathname = usePathname();
    const { signOut, user, profile } = useAuth();

    const navItems = [
        { name: 'Accueil', href: '/', icon: Home },
        { name: 'Planning', href: '/planning', icon: Calendar },
        { name: 'Collaborateurs', href: '/collaborateurs', icon: Briefcase },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Chantiers', href: '/chantiers', icon: HardHat },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col',
                    isCollapsed ? 'w-20' : 'w-64',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                    {!isCollapsed && (
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 truncate">
                            EUREKIA
                        </span>
                    )}
                    {isCollapsed && (
                        <span className="text-xl font-bold text-blue-700 mx-auto">E</span>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                                title={isCollapsed ? item.name : undefined}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon
                                    size={20}
                                    className={clsx(
                                        'shrink-0',
                                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                                    )}
                                />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer (User Profile & Actions) */}
                <div className="p-4 border-t border-slate-200 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {user?.email?.substring(0, 2).toUpperCase() || 'MB'}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.email || 'Utilisateur'}</p>
                                <p className="text-xs text-slate-500 truncate">{profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className={clsx("flex gap-2", isCollapsed ? "flex-col" : "flex-row")}>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className={clsx(
                                "flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors",
                                isCollapsed ? "p-2" : "flex-1 py-2 px-3 text-sm"
                            )}
                            title="Mon Compte"
                        >
                            <Settings size={18} />
                            {!isCollapsed && <span>Compte</span>}
                        </button>
                        <button
                            onClick={() => signOut()}
                            className={clsx(
                                "flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 transition-colors",
                                isCollapsed ? "p-2" : "flex-1 py-2 px-3 text-sm"
                            )}
                            title="Déconnexion"
                        >
                            <LogOut size={18} />
                            {!isCollapsed && <span>Sortir</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Settings Modal */}
            <EnterpriseSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}
