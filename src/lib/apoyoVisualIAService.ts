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
// Generación de apoyo visual por IA (gpt-image-1) — pipeline compartido entre
// el piloto de ciencias y el de pictogramas gramaticales (idiomas).
// "contexto" separa SOLO el cupo diario (limitesGeneracion) entre ambos
// pilotos — la clave de caché y la ruta de Storage NO llevan contexto, para
// preservar exactamente el esquema y la caché ya generada por el piloto de
// ciencias (asignatura/tema/concepto ya evitan colisión por sí solos: la
// asignatura de ciencias nunca coincide con un idioma real).
// Precedencia y alcance de ciencias decididos en sesión: ver ConceptosClaveBlock
// en Phase2Lesson.tsx para las 3 condiciones que activan esa ruta.
// ─────────────────────────────────────────────────────────────────────────────

type Contexto = 'ciencias' | 'gramatica' | 'matematicas';

const LIMITE_DIARIO = 40;
const TIMEOUT_MS = 60000;

type ConceptoParaPrompt = Pick<ConceptoClave, 'nombre' | 'explicacionSimple'>;

// ── Clave de caché ──────────────────────────────────────────────────────────
// Determinística por partes normalizadas, compartida entre todos los niños
// (nunca incluye perfil individual ni condición). Mismo esquema para ambos
// pilotos — sin prefijo de contexto, para no invalidar la caché ya generada.

function construirClaveCache(partes: string[]): string {
    return partes
        .map(normalizarTexto)
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
    datos: { url: string; prompt: string; contexto: Contexto; asignatura: string; tema: string; concepto: string }
): Promise<void> {
    const refDoc = doc(db, 'apoyoVisualIA', clave);
    await setDoc(refDoc, {
        ...datos,
        modelo: 'gpt-image-1',
        createdAt: serverTimestamp(),
    });
}

// ── Tope de costo diario ────────────────────────────────────────────────────
// Doc limitesGeneracion/{contexto}-{YYYY-MM-DD} (UTC). Transacción para evitar
// condiciones de carrera entre generaciones concurrentes. Ante cualquier error
// de la transacción, se asume "sin cupo" (fail-safe hacia el respaldo).
// Cada contexto tiene su propio contador — ciencias y gramática no comparten
// presupuesto diario. Para ciencias, contexto='ciencias' produce el mismo doc
// id de siempre (ciencias-{fecha}).

async function reservarCupoGeneracion(contexto: Contexto): Promise<boolean> {
    const fecha = new Date().toISOString().slice(0, 10);
    const refDoc = doc(db, 'limitesGeneracion', `${contexto}-${fecha}`);

    try {
        return await runTransaction(db, async (tx) => {
            const snap = await tx.get(refDoc);
            const actual = snap.exists() ? (snap.data().count ?? 0) : 0;

            if (actual >= LIMITE_DIARIO) return false;

            tx.set(refDoc, { count: actual + 1, fecha, contexto }, { merge: true });
            return true;
        });
    } catch (err) {
        console.error('Error verificando límite diario de generación IA:', err);
        return false;
    }
}

// ── Prompts ──────────────────────────────────────────────────────────────────

function construirPromptCiencias(tema: string, objetivo: string, concepto: ConceptoParaPrompt): string {
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
// Pictograma matemático: NUNCA foto real ni Wikimedia (decidido en sesión —
// riesgo de imagen que no corresponde exactamente al concepto). La IA decide
// qué tipo de representación es pedagógicamente coherente según tema+objetivo
// (figura geométrica con el elemento en foco resaltado / magnitud numérica con
// grupos de objetos o recta / modelo de área para fracciones / diagrama con
// medidas rotuladas / conteo o barras para estadística) — sin diccionario de
// palabras clave cableado, el universo temático de matemáticas es demasiado
// amplio para eso (decidido en sesión).
function construirPromptMatematicas(tema: string, objetivo: string, concepto: ConceptoParaPrompt): string {
    return [
        'Pictograma educativo infantil de matemáticas, estilo diagrama plano y simple,',
        'para material didáctico de una plataforma de aprendizaje inclusivo para niños con',
        'neurodiversidad (TEA, TDAH, síndrome de Down, dislexia, discalculia).',
        '',
        `TEMA DE LA LECCIÓN: "${tema}"`,
        `OBJETIVO DE APRENDIZAJE: "${objetivo}"`,
        `CONCEPTO A ILUSTRAR: "${concepto.nombre}"`,
        `CONTEXTO DEL CONCEPTO (solo para que la imagen sea precisa, NO para copiar texto`,
        `dentro de la imagen): "${concepto.explicacionSimple}"`,
        '',
        'DECIDE TÚ, según el tema y el objetivo, qué tipo de representación matemática es',
        'la correcta para este concepto específico — por ejemplo (no es una lista cerrada,',
        'usa tu criterio si el contenido no encaja exactamente en ninguna):',
        '- Figura o cuerpo geométrico, con el elemento específico del objetivo (cara, arista,',
        '  vértice, ángulo, lado) resaltado con un color distinto al resto de la figura.',
        '- Operación numérica: representa la magnitud con grupos de objetos simples',
        '  (puntos, círculos) o una recta numérica — NUNCA con dígitos ni símbolos',
        '  matemáticos dentro de la imagen.',
        '- Fracciones o decimales: modelo de área dividida (círculo o barra particionada)',
        '  mostrando exactamente la proporción del concepto.',
        '- Medición: la figura con las magnitudes representadas visualmente (longitud,',
        '  ángulo), sin números ni unidades escritas dentro de la imagen.',
        '- Estadística o datos: pictograma de conteo simple (iconos repetidos) o barras,',
        '  sin ejes rotulados ni texto.',
        '',
        'ESTILO OBLIGATORIO:',
        '- Diagrama educativo plano (flat design), como una ilustración de libro de texto',
        '  escolar o infografía matemática, no como dibujo animado.',
        '- Colores sólidos y suaves, paleta limitada (máximo 4-5 colores), buen contraste',
        '  entre formas pero sin colores estridentes, neón ni saturación agresiva.',
        '- Líneas limpias, formas simples y claras, sin texturas realistas ni sombreado',
        '  complejo — la precisión geométrica importa más que el estilo artístico.',
        '- Composición centrada en un solo elemento o escena principal; fondo liso.',
        '- Amigable pero NO infantilizado: nada de personajes "kawaii", ojos gigantes,',
        '  mascotas antropomorfizadas ni estética de bebé.',
        '',
        'PROHIBICIONES ESTRICTAS:',
        '- NUNCA fotorrealista ni fotografía real: solo ilustración/diagrama vectorial',
        '  (esto es una regla dura para matemáticas — nunca un objeto fotografiado real).',
        '- NUNCA texto, letras, números, dígitos ni símbolos matemáticos dentro de la',
        '  imagen, en ningún idioma — la explicación y las cifras van aparte, fuera de',
        '  la imagen.',
        '- NUNCA personas reales ni figuras reconocibles.',
        '- NUNCA distorsión, glitch, proporciones geométricas incorrectas ni elementos',
        '  surrealistas — la figura debe ser geométricamente correcta, no artística.',
        '- NUNCA patrones repetitivos densos, parpadeo visual ni alto contraste',
        '  estroboscópico (sensibilidad sensorial / fotosensibilidad).',
        '',
        'FORMATO: imagen cuadrada, fondo no transparente.',
    ].join('\n');
}


// Pictograma gramatical: estilo señalética pública/AAC (plano, 2 colores, sin
// fotorrealismo), con fidelidad literal a la oración exacta que se enseña —
// diseño acordado en sesión (evaluación TEA/TDAH/dislexia).
function construirPromptGramatical(tema: string, oracionEjemplo: string): string {
    return [
        'Pictograma educativo tipo señalética pública (como símbolos de aeropuerto, baño,',
        'o sistemas de comunicación aumentativa/alternativa AAC), para material didáctico de',
        'una plataforma de aprendizaje de idiomas inclusiva para niños con neurodiversidad',
        '(TEA, TDAH, dislexia).',
        '',
        `ESTRUCTURA GRAMATICAL DE LA LECCIÓN: "${tema}"`,
        `ORACIÓN EXACTA A REPRESENTAR: "${oracionEjemplo}"`,
        '',
        'FIDELIDAD DE CONTENIDO — OBLIGATORIA:',
        '- Representa LITERALMENTE la escena de la oración exacta de arriba: identifica quién',
        '  realiza la acción (edad aproximada — niño, niña o adulto — y género, según lo que',
        '  la oración indique o implique claramente por pronombre o nombre propio), qué acción',
        '  hace, y cualquier objeto o complemento que la oración mencione.',
        '- NUNCA cambies edad, género, número de personajes ni el tipo de acción respecto a lo',
        '  que dice la oración. Si la oración dice "the girl", el pictograma muestra una niña —',
        '  nunca un niño ni un adulto.',
        '- Si la oración no especifica ni implica edad/género, usa una figura humana neutra y',
        '  genérica.',
        '',
        'ESTILO OBLIGATORIO (señalética / pictograma plano):',
        '- Silueta o forma sólida simple, sin relleno de textura ni detalle interno — como un',
        '  símbolo ISO de baño/aeropuerto o un símbolo de comunicación AAC: reconocible de un',
        '  vistazo, sin ambigüedad.',
        '- Máximo 2 colores sólidos en toda la imagen (una figura de un color sobre un fondo',
        '  liso de otro color), alto contraste figura-fondo. Sin gradientes ni sombreado',
        '  realista.',
        '- Rostro esquemático como mucho (óvalo simple) — nunca rasgos faciales detallados ni',
        '  expresiones elaboradas.',
        '- Composición centrada en una sola acción/escena, sin elementos decorativos que no',
        '  aporten a identificar la acción.',
        '',
        'PROHIBICIONES ESTRICTAS:',
        '- NUNCA fotorrealista ni fotografía real: solo pictograma plano/vectorial.',
        '- NUNCA texto, letras ni números dentro de la imagen, en ningún idioma.',
        '- NUNCA rostros reconocibles ni personas reales.',
        '- NUNCA mascotas antropomorfizadas, estética "kawaii" ni personajes de caricatura.',
        '- NUNCA contenido perturbador, violento o que pueda generar ansiedad en un niño.',
        '- NUNCA patrones repetitivos densos ni alto contraste estroboscópico (sensibilidad',
        '  sensorial / fotosensibilidad).',
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

// ── Orquestador genérico (compartido por ambos contextos) ───────────────────

async function obtenerOGenerarApoyoVisual(
    contexto: Contexto,
    clavePartes: string[],
    prompt: string,
    datosCache: { asignatura: string; tema: string; concepto: string }
): Promise<string | null> {
    const clave = construirClaveCache(clavePartes);

    try {
        const cacheada = await obtenerApoyoVisualCacheado(clave);
        if (cacheada) return cacheada;

        const hayCupo = await reservarCupoGeneracion(contexto);
        if (!hayCupo) return null;

        const base64 = await generarImagenGptImage1(prompt);
        const url = await subirImagenAStorage(base64, clave);

        await guardarApoyoVisualCache(clave, { url, prompt, contexto, ...datosCache });

        return url;
    } catch (err) {
        console.error(`Error en obtenerOGenerarApoyoVisual (${contexto}):`, err);
        return null;
    }
}

// ── Orquestador: ciencias (wrapper delgado — mismo comportamiento de siempre) ─

export async function obtenerOGenerarApoyoVisualCiencias(
    asignatura: string,
    tema: string,
    concepto: ConceptoParaPrompt,
    objetivo: string
): Promise<string | null> {
    const prompt = construirPromptCiencias(tema, objetivo, concepto);
    return obtenerOGenerarApoyoVisual(
        'ciencias',
        [asignatura, tema, concepto.nombre],
        prompt,
        { asignatura, tema, concepto: concepto.nombre }
    );
}
// ── Orquestador: matemáticas (nunca Wikimedia — decidido en sesión) ─────────
// Sin banco de variantes aleatorias (a diferencia de idiomas): el pictograma
// matemático es portador del contenido exacto del concepto (ej. "arista"
// resaltada en un cubo), no una escena decorativa intercambiable — reusar
// entre conceptos distintos rompería la coherencia. Clave de caché:
// asignatura+tema+objetivo+concepto — el "+concepto" es necesario porque un
// mismo objetivo puede cubrir varios conceptos (ej. "contar caras, aristas y
// vértices" trae 3 conceptos bajo un solo objetivo) y cada uno necesita su
// propio pictograma, no uno compartido.

export async function obtenerOGenerarApoyoVisualMatematicas(
    asignatura: string,
    tema: string,
    concepto: ConceptoParaPrompt,
    objetivo: string
): Promise<string | null> {
    const prompt = construirPromptMatematicas(tema, objetivo, concepto);
    return obtenerOGenerarApoyoVisual(
        'matematicas',
        [asignatura, tema, objetivo, concepto.nombre],
        prompt,
        { asignatura, tema, concepto: concepto.nombre }
    );
}


// ── Banco de escenas por tema (solo idiomas) ────────────────────────────────
// A diferencia de ciencias (donde una sola imagen por concepto es correcta:
// "el átomo" siempre es el átomo), en idiomas conviene variedad real entre
// lecciones del mismo tema. Se mantiene un banco de hasta MAX_BANCO_ESCENAS
// imágenes por asignatura+tema, cada una con su propia descripción de escena
// — la oración de la lección se genera DESPUÉS, para calzar con la escena
// elegida (nunca al revés), garantizando coherencia imagen↔oración siempre.

const MAX_BANCO_ESCENAS = 5;

interface EscenaGramatical {
    url: string;
    descripcion: string;
}

function construirClaveTema(asignatura: string, tema: string): string {
    return construirClaveCache([asignatura, tema]);
}

async function generarDescripcionEscena(asignatura: string, tema: string): Promise<string> {
    const prompt = [
        `Estás preparando material visual para una lección de "${asignatura}" sobre "${tema}".`,
        'Describe en UNA frase corta (5-10 palabras), en español, una escena simple y cotidiana',
        'que un niño pueda reconocer fácilmente y que sirva de ejemplo para este tema',
        '(ej. "niño jugando fútbol en el parque", "niña leyendo un libro en casa").',
        'Responde SOLO con la frase, sin comillas, sin explicación.',
    ].join('\n');

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 40,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error generando descripción de escena (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || 'una escena cotidiana simple';
}

async function obtenerBancoEscenas(claveTema: string): Promise<EscenaGramatical[]> {
    const refDoc = doc(db, 'apoyoVisualIA', claveTema);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return [];
    const variantes = snap.data()?.variantes;
    return Array.isArray(variantes) ? variantes : [];
}

async function agregarEscenaABanco(
    claveTema: string,
    escena: EscenaGramatical,
    contexto: Contexto,
    asignatura: string,
    tema: string
): Promise<void> {
    const refDoc = doc(db, 'apoyoVisualIA', claveTema);
    await runTransaction(db, async (tx) => {
        const snap = await tx.get(refDoc);
        const actuales: EscenaGramatical[] = snap.exists() && Array.isArray(snap.data()?.variantes)
            ? snap.data()!.variantes
            : [];
        tx.set(refDoc, {
            variantes: [...actuales, escena],
            contexto,
            asignatura,
            tema,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
}

// ── Orquestador: banco de escenas gramaticales ──────────────────────────────
// Devuelve la escena elegida (URL + descripción) — la descripción se usa
// DESPUÉS para instruir la generación de la oración de la lección, nunca al
// revés (garantiza coherencia imagen↔oración siempre).

export async function obtenerEscenaGramatical(
    asignatura: string,
    tema: string
): Promise<EscenaGramatical | null> {
    const claveTema = construirClaveTema(asignatura, tema);

    try {
        const banco = await obtenerBancoEscenas(claveTema);

        if (banco.length >= MAX_BANCO_ESCENAS) {
            return banco[Math.floor(Math.random() * banco.length)];
        }

        const hayCupo = await reservarCupoGeneracion('gramatica');
        if (!hayCupo) {
            return banco.length > 0 ? banco[Math.floor(Math.random() * banco.length)] : null;
        }

        const descripcion = await generarDescripcionEscena(asignatura, tema);
        const prompt = construirPromptGramatical(tema, descripcion);
        const base64 = await generarImagenGptImage1(prompt);
        const claveImagen = `${claveTema}-${banco.length + 1}`;
        const url = await subirImagenAStorage(base64, claveImagen);

        const escenaNueva: EscenaGramatical = { url, descripcion };
        await agregarEscenaABanco(claveTema, escenaNueva, 'gramatica', asignatura, tema);

        return escenaNueva;
    } catch (err) {
        console.error('Error en obtenerEscenaGramatical:', err);
        return null;
    }
}
