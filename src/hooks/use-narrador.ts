import { useEffect, useRef, useState } from 'react';

// Rate fijo para narraciones donde el niño necesita percibir claramente la
// pronunciación (ej. audio dedicado de una oración modelo) — más lento que
// cualquier rate condicional del resto de la app (0.8 TEA / 0.9 general).
export const RATE_NARRACION_LENTA = 0.65;

// ─────────────────────────────────────────────────────────────────────────────
// Hook de narración por sección — toggle on/off, una sola voz activa
// ─────────────────────────────────────────────────────────────────────────────
export function useNarrador(idioma: string, condicion: string) {
    const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const vocesListasRef = useRef(false);

    // Precarga de voces: en Chrome, getVoices() puede devolver [] hasta que
    // el navegador termine de cargarlas de forma asíncrona (evento voiceschanged).
    useEffect(() => {
        if (!('speechSynthesis' in window)) return;
        if (window.speechSynthesis.getVoices().length > 0) {
            vocesListasRef.current = true;
            return;
        }
        const handleVoicesChanged = () => {
            vocesListasRef.current = true;
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }, []);

    const reproducir = (id: string, texto: string, langOverride?: string, rateOverride?: number) => {
        const u = new SpeechSynthesisUtterance(texto);
        utteranceRef.current = u; // referencia persistente: evita que Chrome libere el utterance antes de tiempo
        u.lang = langOverride ?? (idioma === 'es' ? 'es-ES' : 'en-US');
        u.rate = rateOverride ?? (condicion === 'tea' ? 0.8 : 0.9);
        u.onstart = () => setSeccionActiva(id);
        u.onend = () => setSeccionActiva(null);
        u.onerror = (event) => {
            console.error('Error de narración:', event.error);
            setSeccionActiva(null);
        };
        window.speechSynthesis.speak(u);
    };

    const narrar = (id: string, texto: string, langOverride?: string, rateOverride?: number) => {
        if (!('speechSynthesis' in window)) return;

        if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = null;
        }

        window.speechSynthesis.cancel();

        if (seccionActiva === id) {
            setSeccionActiva(null);
            return;
        }

        // Delay entre cancel() y speak(): evita la race condition de Chrome
        // donde un speak() inmediatamente después de cancel() se pierde.
        speakTimeoutRef.current = setTimeout(() => {
            speakTimeoutRef.current = null;
            if (vocesListasRef.current || window.speechSynthesis.getVoices().length > 0) {
                reproducir(id, texto, langOverride, rateOverride);
            } else {
                const handleVoicesChanged = () => {
                    window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
                    reproducir(id, texto, langOverride, rateOverride);
                };
                window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
            }
        }, 80);
    };

    const detener = () => {
        if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setSeccionActiva(null);
    };

    return { narrar, detener, seccionActiva };
}
