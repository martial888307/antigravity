'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('checking');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if we have a session (the callback route should have established it)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setStatus('error');
                setError("La session a expiré ou le lien est invalide. Veuillez refaire une demande de mot de passe oublié.");
            } else {
                setStatus('idle');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit faire au moins 6 caractères.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setStatus('success');
            setTimeout(() => {
                router.push('/planning');
            }, 2000);
        } catch (err: any) {
            console.error('Update password error:', err);
            setError(err.message || 'Une erreur est survenue lors de la mise à jour.');
            setLoading(false);
        }
    };

    if (status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Mot de passe mis à jour !</h2>
                    <p className="text-slate-600">Votre mot de passe a été modifié avec succès. Redirection vers votre espace...</p>
                    <div className="mt-6 flex justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Nouveau mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Définissez votre nouveau mot de passe sécurisé.
                    </p>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                        {status === 'error' && (
                            <div className="mt-4">
                                <button
                                    onClick={() => router.push('/login/forgot-password')}
                                    className="font-bold underline"
                                >
                                    Faire une nouvelle demande
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}

                {status !== 'error' && (
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Mettre à jour le mot de passe"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
