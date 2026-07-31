// src/lib/apoyoVisualIAService.ts
import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { normalizarTexto } from '@/utils/wikimediaQueryDictionary';
import type { ConceptoClave } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Piloto: generación de apoyo visual por IA (gpt-image-1) — SOLO ciencias.
// Precedencia y alcance decididos en sesión: ver ConceptosClaveBlock en
// Phase2Lesson.tsx para las 3 condiciones que activan esta ruta.
// ─────────────────────────────────────────────────────────────────────────────

const LIMITE_DIARIO = 40;
const TIMEOUT_MS = 25000;

type ConceptoParaPrompt = Pick<ConceptoClave, 'nombre' | 'explicacionSimple'>;

// ── Clave de caché ──────────────────────────────────────────────────────────
// Determinística por asignatura+tema+concepto normalizado, compartida entre
// todos los niños (nunca incluye perfil individual ni condición).

function construirClaveCache(asignatura: string, tema: string, concepto: string): string {
    const partes = [asignatura, tema, concepto].map(normalizarTexto);
    return partes
        .join('__')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ── Caché en Firestore ──────────────────────────────────────────────────────

async function obtenerApoyoVisualCacheado(clave: string): Promise<string | null> {
    const refDoc = doc(db, 'apoyoVisualIA', clave);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return null;
    const url = snap.data()?.url;
    return typeof url === 'string' ? url : null;
}

async function guardarApoyoVisualCache(
    clave: string,
    datos: { url: string; prompt: string; asignatura: string; tema: string; concepto: string }
): Promise<void> {
    const refDoc = doc(db, 'apoyoVisualIA', clave);
    await setDoc(refDoc, {
        ...datos,
        modelo: 'gpt-image-1',
        createdAt: serverTimestamp(),
    });
}

// ── Tope de costo diario ────────────────────────────────────────────────────
// Doc limitesGeneracion/ciencias-{YYYY-MM-DD} (UTC). Transacción para evitar
// condiciones de carrera entre generaciones concurrentes. Ante cualquier error
// de la transacción, se asume "sin cupo" (fail-safe hacia el respaldo).

async function reservarCupoGeneracion(): Promise<boolean> {
    const fecha = new Date().toISOString().slice(0, 10);
    const refDoc = doc(db, 'limitesGeneracion', `ciencias-${fecha}`);

    try {
        return await runTransaction(db, async (tx) => {
            const snap = await tx.get(refDoc);
            const actual = snap.exists() ? (snap.data().count ?? 0) : 0;

            if (actual >= LIMITE_DIARIO) return false;

            tx.set(refDoc, { count: actual + 1, fecha, asignatura: 'ciencias' }, { merge: true });
            return true;
        });
    } catch (err) {
        console.error('Error verificando límite diario de generación IA:', err);
        return false;
    }
}

// ── Prompt ───────────────────────────────────────────────────────────────────

function construirPrompt(tema: string, objetivo: string, concepto: ConceptoParaPrompt): string {
    return [
        'Ilustración educativa infantil de ciencias naturales, estilo diagrama plano y simple,',
        'para material didáctico de una plataforma de aprendizaje inclusivo para niños con',
        'neurodiversidad (TEA, TDAH, síndrome de Down, dislexia).',
        '',
        `TEMA DE LA LECCIÓN: "${tema}"`,
        `OBJETIVO DE APRENDIZAJE: "${objetivo}"`,
        `CONCEPTO A ILUSTRAR: "${concepto.nombre}"`,
        `CONTEXTO DEL CONCEPTO (solo para que la imagen sea precisa, NO para copiar texto`,
        `dentro de la imagen): "${concepto.explicacionSimple}"`,
        '',
        'ESTILO OBLIGATORIO:',
        '- Diagrama educativo plano (flat design), como una ilustración de libro de texto',
        '  escolar o infografía científica, no como dibujo animado.',
        '- Colores sólidos y suaves, paleta limitada (máximo 4-5 colores), buen contraste',
        '  entre formas pero sin colores estridentes, neón ni saturación agresiva.',
        '- Líneas limpias, formas simples y claras, sin texturas realistas.',
        '- Composición centrada en un solo elemento o escena principal; fondo liso o con un',
        '  patrón muy simple. Sin elementos decorativos que no aporten al concepto.',
        '- Amigable pero NO infantilizado: nada de personajes "kawaii", ojos gigantes,',
        '  mascotas antropomorfizadas ni estética de bebé. Apunta a un libro de ciencias',
        '  de colegio, no a una caricatura.',
        '',
        'PROHIBICIONES ESTRICTAS:',
        '- NUNCA fotorrealista ni fotografía real: solo ilustración/diagrama vectorial.',
        '- NUNCA personas reales, rostros reconocibles ni figuras históricas o públicas.',
        '- NUNCA texto, letras, números ni etiquetas dentro de la imagen, en ningún idioma',
        '  — la explicación va aparte, fuera de la imagen.',
        '- NUNCA contenido médico/clínico gráfico (sangre visible, cirugía, heridas,',
        '  fluidos corporales) ni nada que pueda resultar perturbador o generar ansiedad',
        '  en un niño.',
        '- NUNCA distorsión, glitch, proporciones imposibles ni elementos surrealistas —',
        '  el diagrama debe ser correcto de forma simplificada, no artístico ni abstracto.',
        '- NUNCA patrones repetitivos densos, parpadeo visual ni alto contraste',
        '  estroboscópico (sensibilidad sensorial / fotosensibilidad).',
        '- Sin violencia, sin armas, sin contenido bélico aunque el tema lo mencione.',
        '',
        'FORMATO: imagen cuadrada, fondo no transparente.',
    ].join('\n');
}

// ── Llamada al backend (proxy existente /api/image) ────────────────────────

async function generarImagenGptImage1(prompt: string): Promise<string> {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(`${API_URL}/api/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-image-1',
                prompt,
                size: '1024x1024',
                quality: 'medium',
                n: 1,
            }),
            signal: controller.signal,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Error generando imagen (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const b64 = data?.data?.[0]?.b64_json;
        if (!b64) throw new Error('Respuesta de gpt-image-1 sin b64_json');
        return b64;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ── Subida a Firebase Storage ───────────────────────────────────────────────

async function subirImagenAStorage(base64: string, clave: string): Promise<string> {
    const storageRef = ref(storage, `apoyoVisualIA/${clave}.png`);
    await uploadString(storageRef, base64, 'base64', { contentType: 'image/png' });
    return getDownloadURL(storageRef);
}

// ── Orquestador ──────────────────────────────────────────────────────────────

export async function obtenerOGenerarApoyoVisualCiencias(
    asignatura: string,
    tema: string,
    concepto: ConceptoParaPrompt,
    objetivo: string
): Promise<string | null> {
    const clave = construirClaveCache(asignatura, tema, concepto.nombre);

    try {
        const cacheada = await obtenerApoyoVisualCacheado(clave);
        if (cacheada) return cacheada;

        const hayCupo = await reservarCupoGeneracion();
        if (!hayCupo) return null;

        const prompt = construirPrompt(tema, objetivo, concepto);
        const base64 = await generarImagenGptImage1(prompt);
        const url = await subirImagenAStorage(base64, clave);

        await guardarApoyoVisualCache(clave, {
            url,
            prompt,
            asignatura,
            tema,
            concepto: concepto.nombre,
        });

        return url;
    } catch (err) {
        console.error('Error en obtenerOGenerarApoyoVisualCiencias:', err);
        return null;
    }
}
