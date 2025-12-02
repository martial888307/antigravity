'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user with metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nom: formData.nom,
                        prenom: formData.prenom,
                        telephone: formData.telephone,
                        company_name: formData.companyName,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Check if session exists (auto sign-in)
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // User is signed in immediately (email confirmation disabled)
                    router.push('/planning');
                } else {
                    // Email confirmation required case
                    alert('Veuillez vérifier vos emails pour confirmer votre inscription.');
                }
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        <span className="text-sm font-medium">Retour</span>
                    </Link>
                </div>
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
                        Créer votre compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Commencez votre essai gratuit de 2 mois
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSignup}>

                    {/* Identité */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="prenom" className="block text-sm font-medium text-slate-700">Prénom</label>
                            <input
                                id="prenom"
                                name="prenom"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.prenom}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-slate-700">Nom</label>
                            <input
                                id="nom"
                                name="nom"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.nom}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-slate-700">Téléphone</label>
                        <input
                            id="telephone"
                            name="telephone"
                            type="tel"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.telephone}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Nom de l'entreprise</label>
                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "S'inscrire"}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Déjà un compte ? Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}
