'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/login/reset-password&type=recovery`,
            });

            if (error) throw error;

            setMessage("Si un compte correspond à cet email, vous allez recevoir un lien de réinitialisation d'ici quelques instants.");
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                    <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors py-2">
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Retour à la connexion</span>
                    </Link>
                </div>

                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Mail size={24} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Mot de passe oublié ?
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                        {message}
                        <div className="mt-4">
                            <Link href="/login" className="font-bold underline">
                                Retourner à la page de connexion
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Envoyer le lien"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
