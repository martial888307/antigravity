'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Send } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

interface VoiceRecorderProps {
    onSuccess?: () => void;
    chantiers?: any[];
    collaborateurs?: any[];
}

export default function VoiceRecorder({ onSuccess, chantiers = [], collaborateurs = [] }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [responseModal, setResponseModal] = useState<{ isOpen: boolean, content: string } | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Generate or retrieve session ID on mount
    useEffect(() => {
        let id = localStorage.getItem('voiceSessionId');
        if (!id) {
            // Generate a new session ID (timestamp + random)
            id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('voiceSessionId', id);
        }
        setSessionId(id);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await sendAudio(blob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setResponseModal({ isOpen: true, content: "### Erreur\n\nImpossible d'accéder au microphone" });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsSending(true);
        }
    };

    const sendAudio = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        // Add timestamp or other metadata if needed
        formData.append('timestamp', new Date().toISOString());
        formData.append('sessionId', sessionId); // Add session ID
        formData.append('messageCount', (parseInt(localStorage.getItem('voiceMessageCount') || '0') + 1).toString());

        // Add context data
        try {
            const chantiersContext = Array.isArray(chantiers) ? chantiers.map(c => ({
                id: c?.id || 'unknown',
                nom: c?.description || 'Sans nom'
            })) : [];

            const collaborateursContext = Array.isArray(collaborateurs) ? collaborateurs.map(c => ({
                id: c?.id || 'unknown',
                nom: c ? `${c.prenom || ''} ${c.nom || ''}`.trim() : 'Inconnu'
            })) : [];

            formData.append('chantiers', JSON.stringify(chantiersContext));
            formData.append('collaborateurs', JSON.stringify(collaborateursContext));
        } catch (e) {
            console.error('Erreur lors de la préparation des données contextuelles:', e);
            // Continue without context if it fails
            formData.append('chantiers', '[]');
            formData.append('collaborateurs', '[]');
        }

        // Increment message count for this session
        const currentCount = parseInt(localStorage.getItem('voiceMessageCount') || '0');
        localStorage.setItem('voiceMessageCount', (currentCount + 1).toString());

        console.log('📤 Envoi du vocal...', {
            sessionId,
            messageCount: currentCount + 1,
            size: blob.size,
            type: blob.type,
            timestamp: new Date().toISOString()
        });

        try {
            const response = await fetch('https://n8n.eurekia-solutions.com/webhook/8cd1ec96-b262-4641-a9bf-d8eb3d2643a3', {
                method: 'POST',
                body: formData,
            });

            console.log('📬 Réponse du webhook:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur webhook:', errorText);

                let displayError = errorText;
                try {
                    // Try to parse JSON error to show something cleaner
                    const errorJson = JSON.parse(errorText);

                    // Build a nice markdown message
                    let message = errorJson.message || errorJson.error?.message || 'Erreur inconnue';

                    displayError = `**Message :** ${message}\n\n`;

                    if (errorJson.details) {
                        displayError += `**Détails :**\n\`\`\`\n${typeof errorJson.details === 'object' ? JSON.stringify(errorJson.details, null, 2) : errorJson.details}\n\`\`\`\n`;
                    }

                    if (errorJson.code) {
                        displayError += `**Code :** \`${errorJson.code}\`\n`;
                    }

                    // If we have a raw full object that might be useful
                    if (!errorJson.message && !errorJson.error?.message) {
                        displayError += `**Réponse brute :**\n\`\`\`json\n${JSON.stringify(errorJson, null, 2)}\n\`\`\``;
                    }

                } catch (e) {
                    // Not JSON, keep raw text but wrap in code block if it looks like code/html
                    if (errorText.includes('<html') || errorText.includes('{')) {
                        displayError = `\`\`\`\n${errorText}\n\`\`\``;
                    }
                }

                setResponseModal({ isOpen: true, content: `### ❌ Erreur ${response.status}\n\n${displayError}` });
                throw new Error(`Webhook error: ${response.status}`);
            }

            const responseData = await response.text();
            console.log('✅ Vocal envoyé avec succès!', responseData);

            // Only show modal if there's an error or specific instruction from webhook
            // For now, we assume 200 OK means success and no need to interrupt user

            // Refresh planning if response seems correct
            if (response.ok && onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de l\'envoi:', error);
            let errorMessage = error.message || error.toString();

            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = "Impossible de contacter le serveur (Erreur réseau ou CORS). Vérifiez que le webhook n8n autorise les requêtes.";
            }

            setResponseModal({ isOpen: true, content: `### Erreur lors de l'envoi\n\n${errorMessage}` });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div className="relative">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSending}
                    className={`
                    flex items-center justify-center p-2 rounded-full transition-all duration-300
                    ${isRecording
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse ring-2 ring-red-400'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'
                        }
                    ${isSending ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                    title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
                >
                    {isSending ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : isRecording ? (
                        <Square size={20} fill="currentColor" />
                    ) : (
                        <Mic size={20} />
                    )}
                </button>
            </div>

            {/* Response Modal */}
            {responseModal && responseModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800">Réponse de l'assistant</h3>
                            <button
                                onClick={() => setResponseModal(null)}
                                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto prose prose-slate prose-sm max-w-none">
                            <ReactMarkdown>{responseModal.content}</ReactMarkdown>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setResponseModal(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
