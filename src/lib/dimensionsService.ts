// src/lib/dimensionsService.ts
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { DimensionKey, Observacion, getObservationsByStudent } from './observationsService';
import { getSessionsByStudent } from './sessionsService';

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface DimensionData {
  summary: string;
  baseRecommendation: string;
  progress?: number; // 0-100, solo aprendizajeYDesempeno y regulacionEmocional
  evidenceRefs: string[]; // "observations/{id}" | "sessions/{id}"
  evidenceProcessedThrough: number; // millis del evento más reciente ya incorporado
  updatedAt: number;
}

export interface NeuroeducationalProfile {
  studentId: string;
  dimensions: Partial<Record<DimensionKey, DimensionData>>;
}

type EvidenciaObservacion = Pick<Observacion, 'id' | 'authorRole' | 'freeText' | 'classifiedDimensions' | 'createdAt'>;

interface EvidenciaSesion {
  id: string;
  aciertosPct: number;
  deltaEmocional: number;
  emocionFin: number;
  createdAt: Timestamp | null;
}

interface ResumenSesiones {
  totalSesiones: number;
  promedioAciertos?: number;
  promedioDeltaEmocional?: number;
}

interface EvidenciaDimension {
  dimension: DimensionKey;
  observacionesTexto: { authorRole: ActorRole; texto: string }[];
  resumenSesiones?: ResumenSesiones;
}

type SintesisPorDimension = Partial<Record<DimensionKey, { summary: string; baseRecommendation: string }>>;

const DIMENSION_KEYS: DimensionKey[] = [
  'aprendizajeYDesempeno',
  'comunicacionSocial',
  'regulacionEmocional',
  'autonomiaCotidiana',
  'saludDesarrollo',
  'interesesFortalezas',
];

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  aprendizajeYDesempeno: 'Aprendizaje y desempeño',
  comunicacionSocial: 'Comunicación social',
  regulacionEmocional: 'Regulación emocional',
  autonomiaCotidiana: 'Autonomía cotidiana',
  saludDesarrollo: 'Salud y desarrollo',
  interesesFortalezas: 'Intereses y fortalezas',
};

// Únicas dimensiones con métrica cuantitativa real (sección 21 del documento
// de visión): las sesiones alimentan evidencia y progreso solo para estas dos.
const DIMENSIONES_CON_PROGRESO: DimensionKey[] = ['aprendizajeYDesempeno', 'regulacionEmocional'];

function toMillis(ts: Timestamp | null | undefined): number {
  return ts?.toMillis ? ts.toMillis() : 0;
}

// ── Agregación de sesiones (para evidencia del prompt, no para progress) ─────

function resumirSesiones(dim: DimensionKey, sesiones: EvidenciaSesion[]): ResumenSesiones {
  const base: ResumenSesiones = { totalSesiones: sesiones.length };
  if (dim === 'aprendizajeYDesempeno') {
    base.promedioAciertos = Math.round(
      sesiones.reduce((acc, s) => acc + (s.aciertosPct || 0), 0) / sesiones.length
    );
  } else if (dim === 'regulacionEmocional') {
    base.promedioDeltaEmocional = Math.round(
      (sesiones.reduce((acc, s) => acc + (s.deltaEmocional || 0), 0) / sesiones.length) * 10
    ) / 10;
  }
  return base;
}

// ── Cálculo de progress — determinístico, sin IA, usa TODAS las sesiones ────
// (refleja el estado actual acumulado, no solo la evidencia nueva).

function calcularProgreso(dim: DimensionKey, todasLasSesiones: EvidenciaSesion[]): number {
  if (todasLasSesiones.length === 0) return 0;

  if (dim === 'aprendizajeYDesempeno') {
    const promedio = todasLasSesiones.reduce((acc, s) => acc + (s.aciertosPct || 0), 0) / todasLasSesiones.length;
    return Math.round(Math.min(100, Math.max(0, promedio)));
  }

  // regulacionEmocional: promedio del estado emocional AL CIERRE de cada
  // sesión (emocionFin), escalado según EMOCIONES en types/index.ts: 2→0, 3→50, 4→100.
  const promedioEmocionFin = todasLasSesiones.reduce((acc, s) => acc + (s.emocionFin || 0), 0) / todasLasSesiones.length;
  const normalizado = ((promedioEmocionFin - 2) / 2) * 100;
  return Math.round(Math.min(100, Math.max(0, normalizado)));
}

// ── Prompt de síntesis ────────────────────────────────────────────────────────

function buildSintesisPrompt(evidencias: EvidenciaDimension[]): string {
  const bloques = evidencias.map(ev => {
    const partes: string[] = [];

    if (ev.observacionesTexto.length > 0) {
      partes.push(
        'Observaciones nuevas:\n' +
        ev.observacionesTexto.map(o => `  - (${o.authorRole}) "${o.texto}"`).join('\n')
      );
    }

    if (ev.resumenSesiones) {
      const r = ev.resumenSesiones;
      const detalle = [
        `${r.totalSesiones} sesión(es) nueva(s)`,
        r.promedioAciertos !== undefined ? `promedio de aciertos: ${r.promedioAciertos}%` : null,
        r.promedioDeltaEmocional !== undefined
          ? `variación emocional promedio inicio→fin: ${r.promedioDeltaEmocional > 0 ? '+' : ''}${r.promedioDeltaEmocional}`
          : null,
      ].filter(Boolean).join(', ');
      partes.push(`Datos agregados de sesiones: ${detalle}`);
    }

    return `### ${ev.dimension} — ${DIMENSION_LABELS[ev.dimension]}\n${partes.join('\n')}`;
  }).join('\n\n');

  const clavesJson = evidencias
    .map(ev => `  "${ev.dimension}": { "summary": "...", "baseRecommendation": "..." }`)
    .join(',\n');

  return `Eres un Consultor Senior en Neuropsicología y Neuroeducación Aplicada especializado en tecnología asistiva educativa.
Tu tarea es actualizar el Perfil Neuroeducativo de un estudiante, sintetizando ÚNICAMENTE la evidencia nueva recibida a continuación para cada dimensión indicada. No inventes información fuera de la evidencia entregada.

REGLA DE ENCUADRE (obligatoria): nunca describas al estudiante en términos evaluativos o de déficit ("le va mal", "bajo rendimiento", "problema de conducta"). Encuadra siempre como evolución y ajuste de estrategia ("conviene ajustar la estrategia de...", "se observa una oportunidad para reforzar...", "esta evidencia sugiere probar..."). El summary y la recomendación deben poder leerse en voz alta frente a la familia sin sonar como un diagnóstico o una calificación.

EVIDENCIA NUEVA POR DIMENSIÓN:

${bloques}

Para CADA una de las dimensiones listadas arriba, genera:
- "summary": resumen narrativo breve (2-3 oraciones) que sintetiza lo que dice la evidencia nueva sobre esa dimensión.
- "baseRecommendation": UNA recomendación puntual y accionable derivada de esa evidencia (no una lista, una sola sugerencia concreta).

Responde SOLO con este JSON (sin texto fuera, sin markdown), con una clave por cada dimensión listada arriba:
{
${clavesJson}
}`;
}

// ── Llamada a IA — nunca lanza, retorna null si falla ─────────────────────────
// Mismo endpoint/modelo/patrón de limpieza de fences que observationsService.ts.

async function sintetizarDimensiones(evidencias: EvidenciaDimension[]): Promise<SintesisPorDimension | null> {
  try {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1200,
        messages: [{ role: 'user', content: buildSintesisPrompt(evidencias) }],
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

// ── Cálculo bajo demanda del perfil de dimensiones ────────────────────────────

export async function calcularPerfilDimensiones(studentId: string): Promise<void> {
  const perfilRef = doc(db, 'neuroeducationalProfiles', studentId);
  const perfilSnap = await getDoc(perfilRef);
  const perfilActual: NeuroeducationalProfile = perfilSnap.exists()
    ? (perfilSnap.data() as NeuroeducationalProfile)
    : { studentId, dimensions: {} };

  const [observaciones, sesiones]: [EvidenciaObservacion[], EvidenciaSesion[]] = await Promise.all([
    getObservationsByStudent(studentId),
    getSessionsByStudent(studentId) as Promise<EvidenciaSesion[]>,
  ]);

  const dirtyEvidencia: EvidenciaDimension[] = [];
  const nuevoProcessedThrough: Partial<Record<DimensionKey, number>> = {};
  const nuevosEvidenceRefs: Partial<Record<DimensionKey, string[]>> = {};

  for (const dim of DIMENSION_KEYS) {
    const processedThrough = perfilActual.dimensions[dim]?.evidenceProcessedThrough ?? 0;

    const observacionesNuevas = observaciones.filter(
      o => Array.isArray(o.classifiedDimensions)
        && o.classifiedDimensions.includes(dim)
        && toMillis(o.createdAt) > processedThrough
    );

    const sesionesNuevas = DIMENSIONES_CON_PROGRESO.includes(dim)
      ? sesiones.filter(s => toMillis(s.createdAt) > processedThrough)
      : [];

    if (observacionesNuevas.length === 0 && sesionesNuevas.length === 0) continue;

    const timestamps = [
      ...observacionesNuevas.map(o => toMillis(o.createdAt)),
      ...sesionesNuevas.map(s => toMillis(s.createdAt)),
    ];
    nuevoProcessedThrough[dim] = Math.max(...timestamps);

    nuevosEvidenceRefs[dim] = [
      ...(perfilActual.dimensions[dim]?.evidenceRefs ?? []),
      ...observacionesNuevas.map(o => `observations/${o.id}`),
      ...sesionesNuevas.map(s => `sessions/${s.id}`),
    ];

    dirtyEvidencia.push({
      dimension: dim,
      observacionesTexto: observacionesNuevas.map(o => ({ authorRole: o.authorRole, texto: o.freeText })),
      resumenSesiones: sesionesNuevas.length > 0 ? resumirSesiones(dim, sesionesNuevas) : undefined,
    });
  }

  // Ninguna dimensión sucia: no se llama a IA, no se escribe nada.
  if (dirtyEvidencia.length === 0) return;

  const sintesis = await sintetizarDimensiones(dirtyEvidencia);

  const dimensionesActualizadas: Partial<Record<DimensionKey, DimensionData>> = {};
  const ahora = Date.now();

  for (const ev of dirtyEvidencia) {
    const dim = ev.dimension;
    const resultado = sintesis?.[dim];
    // Si la IA falla en general o en esta dimensión puntual, no se sobreescribe:
    // evidenceProcessedThrough queda igual y se reintentará en la próxima llamada.
    if (!resultado) continue;

    dimensionesActualizadas[dim] = {
      summary: resultado.summary,
      baseRecommendation: resultado.baseRecommendation,
      evidenceRefs: nuevosEvidenceRefs[dim]!,
      evidenceProcessedThrough: nuevoProcessedThrough[dim]!,
      updatedAt: ahora,
      ...(DIMENSIONES_CON_PROGRESO.includes(dim)
        ? { progress: calcularProgreso(dim, sesiones) }
        : {}),
    };
  }

  if (Object.keys(dimensionesActualizadas).length === 0) return;

  await setDoc(
    perfilRef,
    { studentId, dimensions: dimensionesActualizadas },
    { merge: true }
  );
}
