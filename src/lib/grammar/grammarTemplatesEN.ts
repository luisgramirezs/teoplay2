/**
 * grammarTemplatesEN.ts
 *
 * Plantillas gramaticales FIJAS y determinísticas para inglés.
 * Esto NO es contenido generado por IA — es la fuente de verdad estructural
 * que se inyecta en el prompt para que GPT-4o deje de "recordar" la
 * gramática y en vez de eso la LEA de aquí.
 *
 * Convenciones usadas en todo TEOplay:
 * - Roles compatibles con ROLES_COLOR_FIJO en GramaticalBlock.tsx: "sujeto",
 *   "auxiliar", "verbo principal", "complemento" ya están mapeados a color
 *   fijo. "Verbo to be" y "Negación" caen a color por hash (determinístico,
 *   pero puedes agregarlos a ROLES_COLOR_FIJO si quieres fijarlos también).
 * - Interrogativa negativa: SIEMPRE forma completa sin contracción, orden
 *   Auxiliar + Sujeto + Negación + resto (ej. "Have you not finished the
 *   book?"). Es la forma correcta y gramaticalmente completa; permite que
 *   el niño vea la oración entera sin fusiones fonéticas.
 * - "correspondeA" usa el mismo formato de texto libre que ya consume
 *   piezaEnConflicto() en GramaticalBlock.tsx (separado por "/").
 *
 * Para agregar un nuevo tiempo verbal: sigue el patrón de cualquiera de los
 * bloques de abajo. Para un nuevo idioma: crea grammarTemplatesXX.ts con la
 * misma forma (PlantillaGramatical / TipoOracion) y regístralo en
 * grammarTemplateEngine.ts (ver PLANTILLAS_POR_IDIOMA).
 */

export type TipoOracion =
  | 'afirmativa'
  | 'negativa'
  | 'interrogativa'
  | 'interrogativa_negativa';

export interface ValorPiezaPlantilla {
  /** Texto real en el idioma enseñado, SIN traducción (la traducción la añade la IA al vocabulario real). */
  texto: string;
  /** Condición de concordancia, ej. "I / you / we / they". Omitir si el valor es invariante. */
  correspondeA?: string;
}

export interface PiezaPlantilla {
  rol: string;
  posicion: number;
  /** Si la pieza varía según el sujeto (auxiliar, verbo to be) — lista fija de formas + su condición. */
  valoresPorSujeto?: ValorPiezaPlantilla[];
  /** Si la pieza es invariante (negación "not", partícula "going to", "been") — un solo valor fijo. */
  valorFijo?: string;
  /** Nota sobre qué forma debe tomar el verbo principal aquí (base, base+s, -ing, participio). Solo informativo para la IA. */
  notaForma?: string;
}

export interface PlantillaGramatical {
  tiempoVerbal: string;
  tipo: TipoOracion;
  /** Descripción legible del orden, para inyectar directo en el prompt. */
  descripcionOrden: string;
  piezas: PiezaPlantilla[];
  /** Oración de referencia con vocabulario genérico — SOLO para ilustrar el patrón, la IA debe generar su propio vocabulario/tema. */
  ejemploIlustrativo: string;
}

const SUJ_1: ValorPiezaPlantilla[] = [{ texto: 'I / you / we / they' }];
const SUJ_3: ValorPiezaPlantilla[] = [{ texto: 'he / she / it' }];

function piezaSujeto(pos: number): PiezaPlantilla {
  return { rol: 'Sujeto', posicion: pos };
}
function piezaNegacion(pos: number): PiezaPlantilla {
  return { rol: 'Negación', posicion: pos, valorFijo: 'not' };
}
function piezaComplemento(pos: number): PiezaPlantilla {
  return { rol: 'Complemento', posicion: pos };
}

// ─────────────────────────────────────────────────────────────────────────
// 1. PRESENTE SIMPLE
// ─────────────────────────────────────────────────────────────────────────
const presente_simple: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'presente_simple', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Verbo principal (base, +s si el sujeto es he/she/it) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo principal', posicion: 2, notaForma: 'base para I/you/we/they; base+s para he/she/it' },
      piezaComplemento(3),
    ],
    ejemploIlustrativo: 'You like pizza. / She likes pizza.',
  },
  negativa: {
    tiempoVerbal: 'presente_simple', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (do/does) + Negación (not) + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valoresPorSujeto: [{ texto: 'do', correspondeA: 'I / you / we / they' }, { texto: 'does', correspondeA: 'he / she / it' }] },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base, nunca +s (la concordancia ya la lleva el auxiliar)' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'You do not like pizza.',
  },
  interrogativa: {
    tiempoVerbal: 'presente_simple', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Do/Does) + Sujeto + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Do', correspondeA: 'I / you / we / they' }, { texto: 'Does', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: 'base, nunca +s' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Do you like pizza?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'presente_simple', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Do/Does) + Sujeto + Negación (not) + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Do', correspondeA: 'I / you / we / they' }, { texto: 'Does', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Do you not like pizza?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 2. PRESENTE CONTINUO
// ─────────────────────────────────────────────────────────────────────────
const presente_continuo: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'presente_continuo', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Verbo to be (am/is/are) + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'am', correspondeA: 'I' }, { texto: 'is', correspondeA: 'he / she / it' }, { texto: 'are', correspondeA: 'you / we / they' }] },
      { rol: 'Verbo principal', posicion: 3, notaForma: '-ing' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'She is eating pizza.',
  },
  negativa: {
    tiempoVerbal: 'presente_continuo', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Verbo to be (am/is/are) + Negación (not) + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'am', correspondeA: 'I' }, { texto: 'is', correspondeA: 'he / she / it' }, { texto: 'are', correspondeA: 'you / we / they' }] },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'She is not eating pizza.',
  },
  interrogativa: {
    tiempoVerbal: 'presente_continuo', tipo: 'interrogativa',
    descripcionOrden: 'Verbo to be (Am/Is/Are) + Sujeto + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Am', correspondeA: 'I' }, { texto: 'Is', correspondeA: 'he / she / it' }, { texto: 'Are', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: '-ing' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Is she eating pizza?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'presente_continuo', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Verbo to be (Am/Is/Are) + Sujeto + Negación (not) + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Am', correspondeA: 'I' }, { texto: 'Is', correspondeA: 'he / she / it' }, { texto: 'Are', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Is she not eating pizza?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 3. PASADO SIMPLE
// ─────────────────────────────────────────────────────────────────────────
const pasado_simple: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'pasado_simple', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Verbo principal (pasado: -ed o forma irregular) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo principal', posicion: 2, notaForma: 'pasado (-ed regular o forma irregular), igual para todos los sujetos' },
      piezaComplemento(3),
    ],
    ejemploIlustrativo: 'You walked to school.',
  },
  negativa: {
    tiempoVerbal: 'pasado_simple', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (did) + Negación (not) + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'did' },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base, nunca pasado (el auxiliar ya marca el tiempo)' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'You did not walk to school.',
  },
  interrogativa: {
    tiempoVerbal: 'pasado_simple', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Did) + Sujeto + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Did' },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: 'base' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Did you walk to school?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'pasado_simple', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Did) + Sujeto + Negación (not) + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Did' },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Did you not walk to school?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 4. PASADO CONTINUO
// ─────────────────────────────────────────────────────────────────────────
const pasado_continuo: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'pasado_continuo', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Verbo to be (was/were) + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'was', correspondeA: 'I / he / she / it' }, { texto: 'were', correspondeA: 'you / we / they' }] },
      { rol: 'Verbo principal', posicion: 3, notaForma: '-ing' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'They were playing soccer.',
  },
  negativa: {
    tiempoVerbal: 'pasado_continuo', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Verbo to be (was/were) + Negación (not) + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'was', correspondeA: 'I / he / she / it' }, { texto: 'were', correspondeA: 'you / we / they' }] },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'They were not playing soccer.',
  },
  interrogativa: {
    tiempoVerbal: 'pasado_continuo', tipo: 'interrogativa',
    descripcionOrden: 'Verbo to be (Was/Were) + Sujeto + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Was', correspondeA: 'I / he / she / it' }, { texto: 'Were', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: '-ing' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Were they playing soccer?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'pasado_continuo', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Verbo to be (Was/Were) + Sujeto + Negación (not) + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Was', correspondeA: 'I / he / she / it' }, { texto: 'Were', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Were they not playing soccer?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 5. FUTURO SIMPLE (will)
// ─────────────────────────────────────────────────────────────────────────
const futuro_simple_will: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'futuro_simple_will', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Auxiliar (will) + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'will' },
      { rol: 'Verbo principal', posicion: 3, notaForma: 'base, invariante para todos los sujetos' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'I will visit my parents.',
  },
  negativa: {
    tiempoVerbal: 'futuro_simple_will', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (will) + Negación (not) + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'will' },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'I will not visit my parents.',
  },
  interrogativa: {
    tiempoVerbal: 'futuro_simple_will', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Will) + Sujeto + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Will' },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: 'base' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Will you visit your parents?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'futuro_simple_will', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Will) + Sujeto + Negación (not) + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Will' },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Will you not visit your parents?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 6. FUTURO "GOING TO"
// ─────────────────────────────────────────────────────────────────────────
const futuro_going_to: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'futuro_going_to', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Verbo to be (am/is/are) + "going to" + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'am', correspondeA: 'I' }, { texto: 'is', correspondeA: 'he / she / it' }, { texto: 'are', correspondeA: 'you / we / they' }] },
      { rol: 'Going to', posicion: 3, valorFijo: 'going to' },
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'She is going to visit her parents.',
  },
  negativa: {
    tiempoVerbal: 'futuro_going_to', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Verbo to be (am/is/are) + Negación (not) + "going to" + Verbo principal (base) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Verbo to be', posicion: 2, valoresPorSujeto: [{ texto: 'am', correspondeA: 'I' }, { texto: 'is', correspondeA: 'he / she / it' }, { texto: 'are', correspondeA: 'you / we / they' }] },
      piezaNegacion(3),
      { rol: 'Going to', posicion: 4, valorFijo: 'going to' },
      { rol: 'Verbo principal', posicion: 5, notaForma: 'base' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'She is not going to visit her parents.',
  },
  interrogativa: {
    tiempoVerbal: 'futuro_going_to', tipo: 'interrogativa',
    descripcionOrden: 'Verbo to be (Am/Is/Are) + Sujeto + "going to" + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Am', correspondeA: 'I' }, { texto: 'Is', correspondeA: 'he / she / it' }, { texto: 'Are', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      { rol: 'Going to', posicion: 3, valorFijo: 'going to' },
      { rol: 'Verbo principal', posicion: 4, notaForma: 'base' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Is she going to visit her parents?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'futuro_going_to', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Verbo to be (Am/Is/Are) + Sujeto + Negación (not) + "going to" + Verbo principal (base) + Complemento + ?',
    piezas: [
      { rol: 'Verbo to be', posicion: 1, valoresPorSujeto: [{ texto: 'Am', correspondeA: 'I' }, { texto: 'Is', correspondeA: 'he / she / it' }, { texto: 'Are', correspondeA: 'you / we / they' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Going to', posicion: 4, valorFijo: 'going to' },
      { rol: 'Verbo principal', posicion: 5, notaForma: 'base' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'Is she not going to visit her parents?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 7. PRESENTE PERFECTO
// ─────────────────────────────────────────────────────────────────────────
const presente_perfecto: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'presente_perfecto', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Auxiliar (have/has) + Verbo principal (participio pasado) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valoresPorSujeto: [{ texto: 'have', correspondeA: 'I / you / we / they' }, { texto: 'has', correspondeA: 'he / she / it' }] },
      { rol: 'Verbo principal', posicion: 3, notaForma: 'participio pasado (-ed regular o forma irregular)' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'You have finished the book.',
  },
  negativa: {
    tiempoVerbal: 'presente_perfecto', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (have/has) + Negación (not) + Verbo principal (participio pasado) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valoresPorSujeto: [{ texto: 'have', correspondeA: 'I / you / we / they' }, { texto: 'has', correspondeA: 'he / she / it' }] },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'participio pasado' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'You have not finished the book.',
  },
  interrogativa: {
    tiempoVerbal: 'presente_perfecto', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Have/Has) + Sujeto + Verbo principal (participio pasado) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Have', correspondeA: 'I / you / we / they' }, { texto: 'Has', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: 'participio pasado' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Have you finished the book?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'presente_perfecto', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Have/Has) + Sujeto + Negación (not) + Verbo principal (participio pasado) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Have', correspondeA: 'I / you / we / they' }, { texto: 'Has', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'participio pasado' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Have you not finished the book?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 8. PRESENTE PERFECTO CONTINUO
// ─────────────────────────────────────────────────────────────────────────
const presente_perfecto_continuo: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'presente_perfecto_continuo', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Auxiliar (have/has) + "been" + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valoresPorSujeto: [{ texto: 'have', correspondeA: 'I / you / we / they' }, { texto: 'has', correspondeA: 'he / she / it' }] },
      { rol: 'Been', posicion: 3, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'They have been playing soccer.',
  },
  negativa: {
    tiempoVerbal: 'presente_perfecto_continuo', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (have/has) + Negación (not) + "been" + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valoresPorSujeto: [{ texto: 'have', correspondeA: 'I / you / we / they' }, { texto: 'has', correspondeA: 'he / she / it' }] },
      piezaNegacion(3),
      { rol: 'Been', posicion: 4, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 5, notaForma: '-ing' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'They have not been playing soccer.',
  },
  interrogativa: {
    tiempoVerbal: 'presente_perfecto_continuo', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Have/Has) + Sujeto + "been" + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Have', correspondeA: 'I / you / we / they' }, { texto: 'Has', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      { rol: 'Been', posicion: 3, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Have they been playing soccer?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'presente_perfecto_continuo', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Have/Has) + Sujeto + Negación (not) + "been" + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valoresPorSujeto: [{ texto: 'Have', correspondeA: 'I / you / we / they' }, { texto: 'Has', correspondeA: 'he / she / it' }] },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Been', posicion: 4, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 5, notaForma: '-ing' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'Have they not been playing soccer?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 9. PASADO PERFECTO
// ─────────────────────────────────────────────────────────────────────────
const pasado_perfecto: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'pasado_perfecto', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Auxiliar (had) + Verbo principal (participio pasado) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'had' },
      { rol: 'Verbo principal', posicion: 3, notaForma: 'participio pasado' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'She had finished the book.',
  },
  negativa: {
    tiempoVerbal: 'pasado_perfecto', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (had) + Negación (not) + Verbo principal (participio pasado) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'had' },
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'participio pasado' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'She had not finished the book.',
  },
  interrogativa: {
    tiempoVerbal: 'pasado_perfecto', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Had) + Sujeto + Verbo principal (participio pasado) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Had' },
      piezaSujeto(2),
      { rol: 'Verbo principal', posicion: 3, notaForma: 'participio pasado' },
      piezaComplemento(4),
    ],
    ejemploIlustrativo: 'Had she finished the book?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'pasado_perfecto', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Had) + Sujeto + Negación (not) + Verbo principal (participio pasado) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Had' },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Verbo principal', posicion: 4, notaForma: 'participio pasado' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Had she not finished the book?',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 10. PASADO PERFECTO CONTINUO
// ─────────────────────────────────────────────────────────────────────────
const pasado_perfecto_continuo: Record<TipoOracion, PlantillaGramatical> = {
  afirmativa: {
    tiempoVerbal: 'pasado_perfecto_continuo', tipo: 'afirmativa',
    descripcionOrden: 'Sujeto + Auxiliar (had) + "been" + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'had' },
      { rol: 'Been', posicion: 3, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'They had been playing soccer.',
  },
  negativa: {
    tiempoVerbal: 'pasado_perfecto_continuo', tipo: 'negativa',
    descripcionOrden: 'Sujeto + Auxiliar (had) + Negación (not) + "been" + Verbo principal (-ing) + Complemento',
    piezas: [
      piezaSujeto(1),
      { rol: 'Auxiliar', posicion: 2, valorFijo: 'had' },
      piezaNegacion(3),
      { rol: 'Been', posicion: 4, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 5, notaForma: '-ing' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'They had not been playing soccer.',
  },
  interrogativa: {
    tiempoVerbal: 'pasado_perfecto_continuo', tipo: 'interrogativa',
    descripcionOrden: 'Auxiliar (Had) + Sujeto + "been" + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Had' },
      piezaSujeto(2),
      { rol: 'Been', posicion: 3, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 4, notaForma: '-ing' },
      piezaComplemento(5),
    ],
    ejemploIlustrativo: 'Had they been playing soccer?',
  },
  interrogativa_negativa: {
    tiempoVerbal: 'pasado_perfecto_continuo', tipo: 'interrogativa_negativa',
    descripcionOrden: 'Auxiliar (Had) + Sujeto + Negación (not) + "been" + Verbo principal (-ing) + Complemento + ?',
    piezas: [
      { rol: 'Auxiliar', posicion: 1, valorFijo: 'Had' },
      piezaSujeto(2),
      piezaNegacion(3),
      { rol: 'Been', posicion: 4, valorFijo: 'been' },
      { rol: 'Verbo principal', posicion: 5, notaForma: '-ing' },
      piezaComplemento(6),
    ],
    ejemploIlustrativo: 'Had they not been playing soccer?',
  },
};

/**
 * Diccionario maestro: tiempoVerbal -> tipo -> plantilla.
 * Para agregar un tiempo nuevo (ej. futuro perfecto), crea su bloque arriba
 * siguiendo el mismo patrón y regístralo aquí con su clave canónica.
 */
export const PLANTILLAS_INGLES: Record<string, Record<TipoOracion, PlantillaGramatical>> = {
  presente_simple,
  presente_continuo,
  pasado_simple,
  pasado_continuo,
  futuro_simple_will,
  futuro_going_to,
  presente_perfecto,
  presente_perfecto_continuo,
  pasado_perfecto,
  pasado_perfecto_continuo,
};

/** Nombres legibles en español, para mensajes al adulto/maestro y para el prompt. */
export const NOMBRES_TIEMPO_VERBAL: Record<string, string> = {
  presente_simple: 'presente simple',
  presente_continuo: 'presente continuo',
  pasado_simple: 'pasado simple',
  pasado_continuo: 'pasado continuo',
  futuro_simple_will: 'futuro simple (will)',
  futuro_going_to: 'futuro con "going to"',
  presente_perfecto: 'presente perfecto',
  presente_perfecto_continuo: 'presente perfecto continuo',
  pasado_perfecto: 'pasado perfecto',
  pasado_perfecto_continuo: 'pasado perfecto continuo',
};

export const NOMBRES_TIPO_ORACION: Record<TipoOracion, string> = {
  afirmativa: 'afirmativa',
  negativa: 'negativa',
  interrogativa: 'interrogativa',
  interrogativa_negativa: 'interrogativa negativa',
};
