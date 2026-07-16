// src/lib/observationsService.ts
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ── Tipos ───────────────────────────────────────────────────────────────────

export type DimensionKey =
  | 'aprendizajeYDesempeno'
  | 'comunicacionSocial'
  | 'regulacionEmocional'
  | 'autonomiaCotidiana'
  | 'saludDesarrollo'
  | 'interesesFortalezas';

export type ActorRole = 'familia' | 'docente' | 'terapeuta';
export type Relevancia = 'alta' | 'media' | 'baja';
export type ClassificationStatus = 'completo' | 'fallback';

const DIMENSIONES_VALIDAS: DimensionKey[] = [
  'aprendizajeYDesempeno',
  'comunicacionSocial',
  'regulacionEmocional',
  'autonomiaCotidiana',
  'saludDesarrollo',
  'interesesFortalezas',
];

// ── Prompt de clasificación (mismo motor que el perfil de onboarding) ─────────

function buildClasificacionPrompt(
  authorRole: ActorRole,
  relevancia: Relevancia,
  dimensionSugerida: DimensionKey | null,
  freeText: string
): string {
  return `Eres un Consultor Senior en Neuropsicología y Neuroeducación Aplicada.
Clasifica la siguiente observación sobre un estudiante en una o más de estas 6 dimensiones del Perfil Neuroeducativo:

1. aprendizajeYDesempeno — estilo de aprendizaje, estrategias pedagógicas, dificultades académicas, progreso
2. comunicacionSocial — comunicación, interacción con pares/adultos, participación
3. regulacionEmocional — regulación emocional, conductas, desencadenantes, autorregulación
4. autonomiaCotidiana — organización, rutinas, seguimiento de instrucciones, autonomía
5. saludDesarrollo — objetivos de intervención terapéutica, seguimiento de terapias, aspectos del desarrollo
6. interesesFortalezas — intereses, habilidades sobresalientes, motivadores

CONTEXTO:
- Autor: ${authorRole}
- Relevancia declarada: ${relevancia}
- Dimensión sugerida por el autor (no vinculante): ${dimensionSugerida || 'ninguna'}
- Observación: "${freeText}"

Responde SOLO con este JSON (sin texto fuera, sin markdown):
{ "dimensiones": ["claveDimension1", "claveDimension2"] }`;
}

// ── Clasificación vía IA — nunca lanza, retorna null si falla ────────────────
// Mismo endpoint, mismo modelo y mismo patrón de parseo que generarPerfil()
// en OnboardingWizard.tsx (el proxy a veces envuelve la respuesta en fences
// de markdown, de ahí la limpieza manual con replace en vez de response_format).

async function clasificarObservacion(
  authorRole: ActorRole,
  relevancia: Relevancia,
  dimensionSugerida: DimensionKey | null,
  freeText: string
): Promise<DimensionKey[] | null> {
  try {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: buildClasificacionPrompt(authorRole, relevancia, dimensionSugerida, freeText),
          },
        ],
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    const dimensiones = Array.isArray(parsed.dimensiones) ? parsed.dimensiones : [];

    const validas = dimensiones.filter(
      (d: unknown): d is DimensionKey =>
        typeof d === 'string' && DIMENSIONES_VALIDAS.includes(d as DimensionKey)
    );

    return validas.length > 0 ? validas : null;
  } catch {
    return null;
  }
}

// ── Crear observación (clasifica primero, escribe una sola vez, inmutable) ───

export async function crearObservacion(
  studentId: string,
  authorId: string,
  authorRole: ActorRole,
  relevancia: Relevancia,
  dimensionSugerida: DimensionKey | null,
  fecha: number,
  freeText: string
): Promise<string> {
  const clasificacion = await clasificarObservacion(authorRole, relevancia, dimensionSugerida, freeText);

  // Si la IA falla o no clasifica nada, cae a la dimensión sugerida por el autor.
  // Nunca bloquea el guardado de la observación por un fallo de OpenAI.
  const classifiedDimensions: DimensionKey[] =
    clasificacion ?? (dimensionSugerida ? [dimensionSugerida] : []);
  const classificationStatus: ClassificationStatus = clasificacion ? 'completo' : 'fallback';

  const id = crypto.randomUUID();
  const ref = doc(db, 'observations', id);

  await setDoc(ref, {
    id,
    studentId,
    authorId,
    authorRole,
    fecha,
    relevancia,
    dimensionSugerida: dimensionSugerida ?? null,
    freeText,
    classifiedDimensions,
    classificationStatus,
    createdAt: serverTimestamp(),
  });

  return id;
}
