// src/lib/dimensionsService.ts
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ActorRole, DimensionKey, Observacion, getObservationsByStudent } from './observationsService';
import { getSessionsByStudent } from './sessionsService';
import { PerfilNeuroeducativo, TipoUsuario } from '@/components/OnboardingWizard';

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface DimensionData {
  summary: string;
  fortalezas: string[];
  enDesarrollo: string[];
  recomendaciones: string[];
  evidenceRefs: string[]; // "observations/{id}" | "sessions/{id}" | "alumnos/{id}#perfilNeuroeducativo"
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
  evidenciaBase?: string[]; // frases del perfilNeuroeducativo de onboarding, solo en el primer cálculo
  analisisAnterior?: AnalisisDimension; // datos ya guardados antes de este recálculo, si la dimensión ya había sido calculada
}

interface AnalisisDimension {
  summary: string;
  fortalezas: string[];
  enDesarrollo: string[];
  recomendaciones: string[];
}

type SintesisPorDimension = Partial<Record<DimensionKey, AnalisisDimension>>;

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
// de visión): las sesiones alimentan evidencia solo para estas dos.
const DIMENSIONES_CON_PROGRESO: DimensionKey[] = ['aprendizajeYDesempeno', 'regulacionEmocional'];

// Mapeo del perfilNeuroeducativo de onboarding hacia dimensiones (inventario
// de señal real): fortalezas → interesesFortalezas; retos/estrategias →
// aprendizajeYDesempeno; retos también → comunicacionSocial (ambas comparten
// el mismo campo desde el ajuste del onboarding). Las dimensiones sin mapeo
// (saludDesarrollo, autonomiaCotidiana, regulacionEmocional) no reciben nada
// de aquí: si no tienen evidencia propia, siguen "sin evidencia suficiente".
const EVIDENCIA_BASE_ONBOARDING: Partial<Record<DimensionKey, (p: PerfilNeuroeducativo) => string[]>> = {
  interesesFortalezas: p => p.fortalezas ?? [],
  aprendizajeYDesempeno: p => [...(p.retos ?? []), ...(p.estrategias ?? [])],
  comunicacionSocial: p => p.retos ?? [],
};

// Enfoque de reformulación por rol (sección 21/22 — "lente" por rol al
// consultar): mismo dato de fondo, distinto lenguaje según quién lo va a
// aplicar.
const ROL_ENFOQUE: Record<TipoUsuario, string> = {
  padre: 'la familia, en el contexto de rutinas y apoyo en casa',
  docente: 'el docente, en el contexto de estrategias dentro del aula',
  terapeuta: 'el terapeuta, en el contexto clínico-funcional de la intervención',
};

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

// ── Evidencia base del onboarding (solo primer cálculo) ───────────────────────

function construirEvidenciaBase(dim: DimensionKey, perfil: PerfilNeuroeducativo): string[] {
  const mapper = EVIDENCIA_BASE_ONBOARDING[dim];
  const items = mapper?.(perfil) ?? [];
  if (items.length === 0) return [];

  return [
    ...(perfil.resumen ? [`Resumen del registro inicial: ${perfil.resumen}`] : []),
    ...items,
    ...(perfil.recomendaciones && perfil.recomendaciones.length > 0
      ? [`Recomendaciones del registro inicial: ${perfil.recomendaciones.join('; ')}`]
      : []),
  ];
}

// ── Prompt de síntesis ────────────────────────────────────────────────────────

function buildSintesisPrompt(evidencias: EvidenciaDimension[]): string {
  const bloques = evidencias.map(ev => {
    const partes: string[] = [];

    if (ev.evidenciaBase && ev.evidenciaBase.length > 0) {
      partes.push(
        'Evidencia del registro inicial (onboarding, primera vez que se calcula este perfil):\n' +
        ev.evidenciaBase.map(t => `  - ${t}`).join('\n')
      );
    }

    if (ev.analisisAnterior) {
      const a = ev.analisisAnterior;
      partes.push(
        'Análisis previo de esta dimensión (a integrar, no reemplazar a ciegas):\n' +
        `  Resumen anterior: "${a.summary}"\n` +
        `  Fortalezas identificadas antes: ${a.fortalezas.length > 0 ? a.fortalezas.join('; ') : '(ninguna)'}\n` +
        `  Áreas en desarrollo identificadas antes: ${a.enDesarrollo.length > 0 ? a.enDesarrollo.join('; ') : '(ninguna)'}\n` +
        `  Recomendaciones anteriores: ${a.recomendaciones.length > 0 ? a.recomendaciones.join('; ') : '(ninguna)'}`
      );
    }

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
    .map(ev => `  "${ev.dimension}": { "summary": "...", "fortalezas": ["...", "..."], "enDesarrollo": ["...", "..."], "recomendaciones": ["...", "..."] }`)
    .join(',\n');

  return `Eres un Consultor Senior en Neuropsicología y Neuroeducación Aplicada especializado en tecnología asistiva educativa.
Tu tarea es actualizar el Perfil Neuroeducativo de un estudiante, sintetizando ÚNICAMENTE la evidencia nueva recibida a continuación para cada dimensión indicada. No inventes información fuera de la evidencia entregada.

REGLA DE ENCUADRE (obligatoria): nunca describas al estudiante en términos evaluativos o de déficit ("le va mal", "bajo rendimiento", "problema de conducta"). Encuadra siempre como evolución y ajuste de estrategia ("conviene ajustar la estrategia de...", "se observa una oportunidad para reforzar...", "esta evidencia sugiere probar..."). El summary y la recomendación deben poder leerse en voz alta frente a la familia sin sonar como un diagnóstico o una calificación.

REGLA DE CONTINUIDAD (obligatoria): cuando una dimensión tenga un análisis previo, tu nuevo summary debe INTEGRAR el patrón acumulado con la evidencia nueva — no ignores ni reemplaces el análisis previo sin considerarlo. Si la evidencia nueva confirma el patrón anterior, refuerza esa conclusión. Si lo contradice o matiza, actualiza el análisis reflejando la evolución. El resultado debe leerse como una síntesis acumulada del historial completo de esa dimensión, no como un análisis aislado del último dato recibido. Esto mismo aplica a las listas de fortalezas, áreas en desarrollo y recomendaciones: intégralas con las anteriores (repite las que sigan vigentes, ajusta o descarta las que la evidencia nueva ya superó, agrega las nuevas que correspondan) en vez de generarlas desde cero ignorando lo ya identificado.

REGLA DE SÍNTESIS (obligatoria): el summary NUNCA debe citar ni parafrasear casi textualmente el texto de una observación — siempre debe reformularse con lenguaje propio, analítico y en tercera persona, como lo haría un profesional sintetizando un caso, incluso cuando solo hay una única observación como evidencia. No inventar información es distinto de no reformular: el contenido debe ser fiel a la evidencia, pero el LENGUAJE siempre debe ser sintetizado, nunca una transcripción.

EJEMPLO (con una sola observación como evidencia):
Observación cruda: "Durante la sesión se observó que el niño tuvo una desregulación emocional debido al cambio de horario."
Summary correcto: "Se han evidenciado episodios de desregulación emocional asociados a cambios de rutina."
Una recomendación correcta (entrada del array "recomendaciones"): "Se recomienda anticipar los cambios de horario con antelación para facilitar la transición."

EVIDENCIA NUEVA POR DIMENSIÓN:

${bloques}

Para CADA una de las dimensiones listadas arriba, genera:
- "summary": resumen narrativo breve (2-3 oraciones) que sintetiza lo que dice la evidencia sobre esa dimensión.
- "fortalezas": 2-3 frases cortas (2-5 palabras cada una, ej. "Memoria visual", "Buena disposición a nuevas rutinas") que nombran fortalezas observadas en esta dimensión. Si la evidencia no permite identificar ninguna, usa un array vacío.
- "enDesarrollo": 2-3 frases cortas (2-5 palabras cada una) que nombran áreas a reforzar en esta dimensión, con el mismo encuadre de evolución (nunca de déficit). Si la evidencia no permite identificar ninguna, usa un array vacío.
- "recomendaciones": 2-3 recomendaciones puntuales y accionables derivadas de esa evidencia (frases completas, cada una una sugerencia concreta distinta).

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
        max_tokens: 2000,
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

// ── Normalización de lectura (compatibilidad temporal con esquema viejo) ─────
// Perfiles calculados antes de este cambio de esquema quedaron con
// `baseRecommendation: string` en vez de fortalezas/enDesarrollo/recomendaciones.
// La evidencia sucia no dispara recálculo por cambio de esquema (solo por
// evidencia nueva), así que estos documentos pueden persistir en Firestore
// indefinidamente sin evidencia nueva. Este helper permite leerlos sin
// romper los consumidores — se puede eliminar una vez se confirme que ya no
// quedan perfiles con el esquema viejo.
export function normalizarDimensionData(data: DimensionData | undefined): DimensionData | undefined {
  if (!data) return undefined;
  if (data.recomendaciones !== undefined) return data;
  const legacy = data as unknown as { baseRecommendation?: string };
  return {
    ...data,
    fortalezas: data.fortalezas ?? [],
    enDesarrollo: data.enDesarrollo ?? [],
    recomendaciones: legacy.baseRecommendation ? [legacy.baseRecommendation] : [],
  };
}

// ── Lectura del perfil ya calculado (sin recalcular) ──────────────────────────

export async function getPerfilDimensiones(studentId: string): Promise<NeuroeducationalProfile | null> {
  const snap = await getDoc(doc(db, 'neuroeducationalProfiles', studentId));
  return snap.exists() ? (snap.data() as NeuroeducationalProfile) : null;
}

// ── Cálculo bajo demanda del perfil de dimensiones ────────────────────────────

export async function calcularPerfilDimensiones(studentId: string): Promise<void> {
  const perfilRef = doc(db, 'neuroeducationalProfiles', studentId);
  const perfilSnap = await getDoc(perfilRef);
  const perfilActual: NeuroeducationalProfile = perfilSnap.exists()
    ? (perfilSnap.data() as NeuroeducationalProfile)
    : { studentId, dimensions: {} };

  // Primer cálculo real: el doc no existe todavía, o existe pero ninguna
  // dimensión ha sido procesada aún (dimensions vacío). Se define sobre las
  // dimensiones YA PRESENTES en el doc, no sobre las 6 fijas — si no, una
  // dimensión que nunca recibe evidencia (ni de onboarding ni observaciones)
  // dejaría esPrimerCalculo en true para siempre y reinyectaría el perfil de
  // onboarding en cada apertura del módulo.
  const esPrimerCalculo = !perfilSnap.exists() || Object.keys(perfilActual.dimensions).length === 0;

  let perfilOnboarding: PerfilNeuroeducativo | null = null;
  if (esPrimerCalculo) {
    const alumnoSnap = await getDoc(doc(db, 'alumnos', studentId));
    perfilOnboarding = (alumnoSnap.data()?.perfilNeuroeducativo as PerfilNeuroeducativo | undefined) ?? null;
  }

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

    const evidenciaBase = (esPrimerCalculo && perfilOnboarding)
      ? construirEvidenciaBase(dim, perfilOnboarding)
      : [];

    const perfilDimPrevio = normalizarDimensionData(perfilActual.dimensions[dim]);
    const analisisAnterior: AnalisisDimension | undefined = perfilDimPrevio?.summary
      ? {
          summary: perfilDimPrevio.summary,
          fortalezas: perfilDimPrevio.fortalezas,
          enDesarrollo: perfilDimPrevio.enDesarrollo,
          recomendaciones: perfilDimPrevio.recomendaciones,
        }
      : undefined;

    if (observacionesNuevas.length === 0 && sesionesNuevas.length === 0 && evidenciaBase.length === 0) continue;

    const timestamps = [
      ...observacionesNuevas.map(o => toMillis(o.createdAt)),
      ...sesionesNuevas.map(s => toMillis(s.createdAt)),
    ];
    // Si la dimensión queda sucia solo por evidenciaBase (sin observaciones ni
    // sesiones con fecha), no hay timestamp que tomar: se usa 0 como
    // centinela — "procesada" (evita reinyectar el onboarding otra vez) pero
    // sin descartar ninguna observación/sesión futura (createdAt siempre > 0).
    nuevoProcessedThrough[dim] = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    nuevosEvidenceRefs[dim] = [
      ...(perfilActual.dimensions[dim]?.evidenceRefs ?? []),
      ...(evidenciaBase.length > 0 ? [`alumnos/${studentId}#perfilNeuroeducativo`] : []),
      ...observacionesNuevas.map(o => `observations/${o.id}`),
      ...sesionesNuevas.map(s => `sessions/${s.id}`),
    ];

    dirtyEvidencia.push({
      dimension: dim,
      observacionesTexto: observacionesNuevas.map(o => ({ authorRole: o.authorRole, texto: o.freeText })),
      resumenSesiones: sesionesNuevas.length > 0 ? resumirSesiones(dim, sesionesNuevas) : undefined,
      evidenciaBase: evidenciaBase.length > 0 ? evidenciaBase : undefined,
      analisisAnterior,
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
      fortalezas: resultado.fortalezas,
      enDesarrollo: resultado.enDesarrollo,
      recomendaciones: resultado.recomendaciones,
      evidenceRefs: nuevosEvidenceRefs[dim]!,
      evidenceProcessedThrough: nuevoProcessedThrough[dim]!,
      updatedAt: ahora,
    };
  }

  if (Object.keys(dimensionesActualizadas).length === 0) return;

  await setDoc(
    perfilRef,
    { studentId, dimensions: dimensionesActualizadas },
    { merge: true }
  );
}

// ── Adaptación de recomendaciones por rol ("lente", sección 21/22) ───────────
// Un solo prompt para todas las dimensiones con contenido — nunca una
// llamada por tarjeta. Solo reformula el array de recomendaciones; el
// summary narrativo y las listas de fortalezas/enDesarrollo se mantienen
// canónicos, sin adaptar. Nunca lanza, nunca se persiste en Firestore — el
// llamador decide caché/invalidación.

function buildAdaptacionPrompt(
  items: { dimension: DimensionKey; recomendaciones: string[] }[],
  rolUsuario: TipoUsuario
): string {
  const bloques = items
    .map(it => `### ${it.dimension} — ${DIMENSION_LABELS[it.dimension]}\nRecomendaciones originales:\n${it.recomendaciones.map(r => `  - "${r}"`).join('\n')}`)
    .join('\n\n');

  const clavesJson = items.map(it => `  "${it.dimension}": ["...", "..."]`).join(',\n');

  return `Eres un Consultor Senior en Neuropsicología y Neuroeducación Aplicada especializado en tecnología asistiva educativa.
Tu tarea es reformular cada lista de recomendaciones a continuación para que le hable directamente a ${ROL_ENFOQUE[rolUsuario]}. El dato de fondo (la evidencia y la intención de cada recomendación) es el mismo — solo cambia el enfoque y el lenguaje según quién la va a leer y aplicar.

REGLA DE ENCUADRE (obligatoria): nunca describas al estudiante en términos evaluativos o de déficit ("le va mal", "bajo rendimiento", "problema de conducta"). Encuadra siempre como evolución y ajuste de estrategia. El texto debe poder leerse en voz alta frente a la familia sin sonar como un diagnóstico o una calificación.

RECOMENDACIONES A REFORMULAR:

${bloques}

Para CADA dimensión, genera un array con la MISMA CANTIDAD de recomendaciones que el original, cada una reformulada para ${ROL_ENFOQUE[rolUsuario]}, EN EL MISMO ORDEN, sin perder el sentido de cada una.

Responde SOLO con este JSON (sin texto fuera, sin markdown), con una clave por cada dimensión listada arriba:
{
${clavesJson}
}`;
}

export async function adaptarRecomendacionesPorRol(
  perfil: NeuroeducationalProfile,
  rolUsuario: TipoUsuario
): Promise<Partial<Record<DimensionKey, string[]>> | null> {
  const items: { dimension: DimensionKey; recomendaciones: string[] }[] = [];
  for (const dim of DIMENSION_KEYS) {
    const rec = normalizarDimensionData(perfil.dimensions[dim])?.recomendaciones;
    if (rec && rec.length > 0) items.push({ dimension: dim, recomendaciones: rec });
  }
  if (items.length === 0) return null;

  try {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildAdaptacionPrompt(items, rolUsuario) }],
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    const resultado: Partial<Record<DimensionKey, string[]>> = {};
    for (const it of items) {
      const arr = parsed[it.dimension];
      if (Array.isArray(arr)) {
        const limpio = arr.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map(t => t.trim());
        if (limpio.length > 0) resultado[it.dimension] = limpio;
      }
    }
    return Object.keys(resultado).length > 0 ? resultado : null;
  } catch {
    return null;
  }
}
