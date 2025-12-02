'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Calendar, Mic, Smartphone, Play, X } from 'lucide-react';

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left flex flex-col items-start">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Planifiez vos chantiers <br />
                <span className="text-blue-400">simplement</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                La solution tout-en-un pour gérer vos équipes et vos interventions.
                Pensé pour le terrain, optimisé pour le bureau.
              </p>

              <div className="flex flex-col items-start gap-6 w-full">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto"
                >
                  Essayer gratuitement
                  <ArrowRight className="ml-2" size={20} />
                </Link>

                <div className="flex flex-col gap-3">
                  {/* Video Thumbnail */}
                  <div
                    className="relative w-72 aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-800 cursor-pointer group"
                    onClick={() => setIsVideoOpen(true)}
                  >
                    <img
                      src="https://img.youtube.com/vi/Eg8SmWXO5Tw/maxresdefault.jpg"
                      alt="Demo Video Thumbnail"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-600/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-white fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="flex items-center text-slate-300 hover:text-white transition-colors font-medium text-sm ml-1 group"
                  >
                    <Play size={16} className="mr-2 group-hover:fill-current" />
                    Voir la démo
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
                <img
                  src="/hero-illustration.png"
                  alt="Illustration Planning Artisan"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">

            {/* Feature 1: Planning */}
            <div className="group h-72 perspective-1000 cursor-pointer">
              <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center backface-hidden shadow-sm">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Planning Intuitif</h3>
                  <p className="text-slate-600">
                    Visualisez et modifiez les emplois du temps de vos équipes en un clin d'œil.
                  </p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Gestion Simplifiée</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Glisser-déposer intuitif, vue mensuelle ou hebdomadaire. Assignez les tâches en un clic et évitez les conflits d'emploi du temps grâce à notre algorithme intelligent.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Voice Command */}
            <div className="group h-72 perspective-1000 cursor-pointer">
              <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center backface-hidden shadow-sm">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Mic size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Commande Vocale</h3>
                  <p className="text-slate-600">
                    Ajoutez des interventions simplement en parlant. L'IA s'occupe du reste.
                  </p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Assistant IA</h3>
                  <p className="text-purple-100 leading-relaxed">
                    Dictez vos comptes-rendus, créez des rendez-vous ou notez des rappels. Notre IA comprend le contexte et classe automatiquement les informations.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: Mobile */}
            <div className="group h-72 perspective-1000 cursor-pointer">
              <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center backface-hidden shadow-sm">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">100% Mobile</h3>
                  <p className="text-slate-600">
                    Accédez à toutes les fonctionnalités depuis votre smartphone, où que vous soyez.
                  </p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 p-8 rounded-2xl bg-green-600 text-white flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Toujours Connecté</h3>
                  <p className="text-green-100 leading-relaxed">
                    Mode hors-ligne, signature électronique et GPS intégré. Vos techniciens peuvent valider leurs interventions et prendre des photos directement depuis le chantier.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; 2025 EurekIA. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Eg8SmWXO5Tw?autoplay=1"
              title="EurekIA Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
