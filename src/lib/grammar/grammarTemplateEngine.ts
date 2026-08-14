/**
 * grammarTemplateEngine.ts
 *
 * Detecta (sin IA — por palabras clave, determinístico) qué tiempo verbal y
 * qué tipo de oración pide una lección de idioma, busca la plantilla FIJA
 * correspondiente en grammarTemplatesEN.ts (o el archivo del idioma que
 * corresponda) y genera el bloque de texto que se inyecta en el prompt de
 * GPT-4o como restricción dura — reemplazando la regla 29f, que dependía
 * de que el modelo "recordara" la estructura en medio de ~55 instrucciones.
 *
 * Filosofía: la IA deja de tener que INVENTAR la estructura gramatical
 * (tarea propensa a error, no creativa) y pasa solo a LLENARLA con
 * vocabulario y contexto reales (tarea generativa legítima).
 *
 * Para agregar un idioma nuevo: crea grammarTemplatesXX.ts con la misma
 * forma (PLANTILLAS_XX, TipoOracion, PlantillaGramatical) y agrégalo a
 * PLANTILLAS_POR_IDIOMA abajo.
 */

import {
  PLANTILLAS_INGLES,
  NOMBRES_TIEMPO_VERBAL,
  NOMBRES_TIPO_ORACION,
  TipoOracion,
  PlantillaGramatical,
} from './grammarTemplatesEN';

// ─────────────────────────────────────────────────────────────────────────
// Registro de idiomas soportados — agrega aquí cuando exista francés, etc.
// ─────────────────────────────────────────────────────────────────────────
const PLANTILLAS_POR_IDIOMA: Record<string, Record<string, Record<TipoOracion, PlantillaGramatical>>> = {
  ingles: PLANTILLAS_INGLES,
  // frances: PLANTILLAS_FRANCES,  // cuando se agregue el idioma
};

const NOMBRES_TIEMPO_POR_IDIOMA: Record<string, Record<string, string>> = {
  ingles: NOMBRES_TIEMPO_VERBAL,
};

/** Asignaturas que corresponden a un idioma con plantillas registradas. */
const ASIGNATURA_A_IDIOMA: Record<string, string> = {
  ingles: 'ingles',
  // frances: 'frances',
};

// ─────────────────────────────────────────────────────────────────────────
// Detección de tiempo verbal por palabras clave (español e inglés, tema u objetivo)
// ─────────────────────────────────────────────────────────────────────────
const PALABRAS_CLAVE_TIEMPO: Record<string, string[]> = {
  presente_perfecto_continuo: ['presente perfecto continuo', 'present perfect continuous'],
  pasado_perfecto_continuo: ['pasado perfecto continuo', 'past perfect continuous'],
  presente_perfecto: ['presente perfecto', 'present perfect'],
  pasado_perfecto: ['pasado perfecto', 'pluscuamperfecto', 'past perfect'],
  presente_continuo: ['presente continuo', 'presente progresivo', 'present continuous'],
  pasado_continuo: ['pasado continuo', 'pasado progresivo', 'past continuous'],
  futuro_going_to: ['going to', 'futuro próximo', 'futuro cercano'],
  futuro_simple_will: ['futuro simple', 'futuro con will', 'simple future', 'future with will', 'futuro'],
  presente_simple: ['presente simple', 'simple present'],
  pasado_simple: ['pasado simple', 'pretérito simple', 'preterito simple', 'simple past'],
};
// Nota: el orden del objeto arriba importa para la búsqueda — los tiempos
// compuestos (que contienen substrings de los simples, ej. "perfecto
// continuo" contiene "perfecto") se revisan primero para no hacer match
// parcial equivocado.
const ORDEN_BUSQUEDA_TIEMPO = Object.keys(PALABRAS_CLAVE_TIEMPO);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quita acentos
}

/** Detecta el tiempo verbal canónico a partir de tema + objetivo. Null si no se menciona ninguno. */
export function detectarTiempoVerbal(tema: string, objetivo: string, idioma: string): string | null {
  const idiomaKey = ASIGNATURA_A_IDIOMA[idioma];
  if (!idiomaKey) return null;

  const texto = normalizar(`${tema} ${objetivo}`);
  for (const clave of ORDEN_BUSQUEDA_TIEMPO) {
    const variantes = PALABRAS_CLAVE_TIEMPO[clave];
    if (variantes.some(v => texto.includes(normalizar(v)))) {
      return clave;
    }
  }
  return null;
}

/** Detecta el tipo de oración a partir de tema + objetivo. Null si no se especifica ninguno. */
export function detectarTipoOracion(tema: string, objetivo: string): TipoOracion | null {
  const texto = normalizar(`${tema} ${objetivo}`);
  const tieneInterrogativa = texto.includes('interrogativ') || texto.includes('pregunta') || texto.includes('question');
  const tieneNegativa = texto.includes('negativ') || texto.includes('negative');

  if (tieneInterrogativa && tieneNegativa) return 'interrogativa_negativa';
  if (tieneInterrogativa) return 'interrogativa';
  if (tieneNegativa) return 'negativa';
  if (texto.includes('afirmativ') || texto.includes('affirmative')) return 'afirmativa';
  return null;
}

export interface ResultadoDeteccion {
  idiomaKey: string | null;
  tiempoVerbal: string | null;
  tipoOracion: TipoOracion | null;
}

export function detectarEstructuraGramatical(
  asignatura: string,
  tema: string,
  objetivo: string
): ResultadoDeteccion {
  const idiomaKey = ASIGNATURA_A_IDIOMA[asignatura] ?? null;
  if (!idiomaKey) return { idiomaKey: null, tiempoVerbal: null, tipoOracion: null };

  return {
    idiomaKey,
    tiempoVerbal: detectarTiempoVerbal(tema, objetivo, asignatura),
    tipoOracion: detectarTipoOracion(tema, objetivo),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Generación del bloque de texto para inyectar en el prompt
// ─────────────────────────────────────────────────────────────────────────

function renderPlantilla(p: PlantillaGramatical): string {
  const piezasTexto = p.piezas
    .map(pz => {
      if (pz.valorFijo) {
        return `   • ${pz.rol} (posición ${pz.posicion}): valor fijo "${pz.valorFijo}"`;
      }
      if (pz.valoresPorSujeto) {
        const formas = pz.valoresPorSujeto.map(v => `"${v.texto}"${v.correspondeA ? ` → ${v.correspondeA}` : ''}`).join(', ');
        return `   • ${pz.rol} (posición ${pz.posicion}): varía según sujeto — ${formas}`;
      }
      return `   • ${pz.rol} (posición ${pz.posicion})${pz.notaForma ? ` — forma: ${pz.notaForma}` : ''}`;
    })
    .join('\n');

  return [
    `  [${NOMBRES_TIPO_ORACION[p.tipo]}] ${p.descripcionOrden}`,
    piezasTexto,
    `   Ejemplo de patrón (NO reutilices este vocabulario, es solo ilustrativo): "${p.ejemploIlustrativo}"`,
  ].join('\n');
}

/**
 * Construye el bloque de instrucciones que reemplaza la regla 29f.
 * - Si se detectó tiempo verbal + tipo específico: inyecta SOLO esa
 *   estructura, como restricción dura, no negociable.
 * - Si se detectó tiempo verbal pero NO tipo: inyecta las 4 variantes de
 *   ese tiempo y pide cobertura genérica de las 4, más una recomendación
 *   al adulto para que la próxima vez especifique el tipo de oración
 *   (dosificación progresiva).
 * - Si no se detectó tiempo verbal: retorna null (no aplica; la asignatura
 *   no es de idioma o el tema no es una estructura gramatical con tiempo
 *   verbal identificable — se deja el comportamiento anterior sin bloque).
 */
export function construirBloquePlantillaGramatical(
  asignatura: string,
  tema: string,
  objetivo: string
): { bloque: string; tipoDetectado: boolean } | null {
  const { idiomaKey, tiempoVerbal, tipoOracion } = detectarEstructuraGramatical(asignatura, tema, objetivo);
  if (!idiomaKey || !tiempoVerbal) return null;

  const plantillas = PLANTILLAS_POR_IDIOMA[idiomaKey];
  const nombreTiempo = NOMBRES_TIEMPO_POR_IDIOMA[idiomaKey][tiempoVerbal];
  const familiaPlantillas = plantillas[tiempoVerbal];
  if (!familiaPlantillas) return null;

  if (tipoOracion) {
    const plantilla = familiaPlantillas[tipoOracion];
    return {
      tipoDetectado: true,
      bloque: [
        `29f. ESTRUCTURA GRAMATICAL OBLIGATORIA — tiempo verbal detectado: "${nombreTiempo}", tipo: "${NOMBRES_TIPO_ORACION[tipoOracion]}".`,
        `Esta es la ÚNICA estructura válida para "apoyoGramatical" en esta lección. NO la reinterpretes, NO la mezcles con otro tiempo verbal, NO cambies el orden ni agregues/quites piezas:`,
        renderPlantilla(plantilla),
        `"piezas[].rol", "piezas[].posicion" y la variación por sujeto (correspondeA) de "apoyoGramatical" DEBEN calcarse exactamente de esta plantilla. Solo debes decidir el vocabulario real (verbo, complemento, tema) — la estructura ya está dada, no es tuya para inventar.`,
      ].join('\n'),
    };
  }

  // No se especificó tipo de oración: cobertura genérica de las 4 variantes,
  // más recomendación al adulto para dosificar en próximas lecciones.
  const bloqueVariantes = (['afirmativa', 'negativa', 'interrogativa', 'interrogativa_negativa'] as TipoOracion[])
    .map(t => renderPlantilla(familiaPlantillas[t]))
    .join('\n\n');

  return {
    tipoDetectado: false,
    bloque: [
      `29f. ESTRUCTURA GRAMATICAL OBLIGATORIA — tiempo verbal detectado: "${nombreTiempo}". No se especificó un tipo de oración particular (afirmativa/negativa/interrogativa/interrogativa negativa), así que esta lección debe cubrir las 4 variantes de forma genérica, cada una EXACTAMENTE con la estructura fija siguiente (no la inventes, no la mezcles con otro tiempo verbal):`,
      bloqueVariantes,
      `Además, agrega en "recomendaciones" una sugerencia breve y amable al adulto: la próxima vez puede especificar en el Objetivo de aprendizaje un tipo de oración particular (ej. "solo afirmativa" o "negativa e interrogativa") para dosificar el tiempo verbal en varias lecciones progresivas — más fácil de asimilar para el niño que las 4 formas juntas.`,
    ].join('\n'),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Corrección post-generación: la IA puede fallar prediciendo texto/vocabulario
// (eso está bien, es su trabajo), pero la ESTRUCTURA (posicion, esInterrogativa,
// esNegativa) nunca debería depender de que "la haya recordado bien" — ya la
// tenemos en la plantilla. Esta función sobrescribe esos campos con el valor
// de la plantilla, emparejando piezas por "rol" (normalizado). El vocabulario
// real que generó la IA (piezas[].valores) NUNCA se toca aquí — solo se
// corrige metadata estructural, nunca contenido.
// ─────────────────────────────────────────────────────────────────────────

function normalizarRol(rol: string): string {
  return normalizar(rol).trim();
}

interface PiezaConEstructura {
  rol: string;
  posicion?: number;
  [k: string]: unknown;
}

interface ApoyoGramaticalConEstructura {
  esInterrogativa?: boolean;
  esNegativa?: boolean;
  piezas: PiezaConEstructura[];
  [k: string]: unknown;
}

/**
 * Aplica la estructura fija de la plantilla (posicion por rol, esInterrogativa,
 * esNegativa) sobre el apoyoGramatical que generó la IA. Si el tema/objetivo no
 * corresponde a ningún tiempo verbal con plantilla registrada, no hace nada y
 * devuelve el apoyoGramatical intacto (comportamiento actual sin cambios).
 *
 * Uso previsto: dentro de generarSesion() en api.ts, justo después de
 * JSON.parse(rawContent) y antes de retornar/guardar la sesión.
 */
export function aplicarEstructuraFija<T extends ApoyoGramaticalConEstructura>(
  apoyoGramatical: T | null | undefined,
  asignatura: string,
  tema: string,
  objetivo: string
): T | null | undefined {
  if (!apoyoGramatical?.piezas?.length) return apoyoGramatical;

  const { idiomaKey, tiempoVerbal, tipoOracion } = detectarEstructuraGramatical(asignatura, tema, objetivo);
  if (!idiomaKey || !tiempoVerbal) return apoyoGramatical; // no aplica plantilla, se deja como vino

  const plantillas = PLANTILLAS_POR_IDIOMA[idiomaKey][tiempoVerbal];
  if (!plantillas) return apoyoGramatical;

  // Si no se especificó tipo, no hay una única plantilla que aplicar (la
  // lección cubre las 4 variantes mezcladas) — no corregimos posicion en
  // ese caso, porque distintas piezas del array podrían pertenecer a
  // distintas variantes. Se deja tal cual generó la IA.
  if (!tipoOracion) return apoyoGramatical;

  const plantilla = plantillas[tipoOracion];
  const posicionPorRol = new Map(plantilla.piezas.map(p => [normalizarRol(p.rol), p.posicion]));

  const piezasCorregidas = apoyoGramatical.piezas.map(pieza => {
    const posicionFija = posicionPorRol.get(normalizarRol(pieza.rol));
    return posicionFija !== undefined ? { ...pieza, posicion: posicionFija } : pieza;
  });

  return {
    ...apoyoGramatical,
    esInterrogativa: tipoOracion === 'interrogativa' || tipoOracion === 'interrogativa_negativa',
    esNegativa: tipoOracion === 'negativa' || tipoOracion === 'interrogativa_negativa',
    piezas: piezasCorregidas,
  };
}
