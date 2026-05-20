/**
 * getVisualStrategy.ts
 *
 * Decide qué bloques visuales mostrar según asignatura y tema.
 * Retorna: 'wikimedia' | 'svg' | 'both' | 'none'
 *
 * Uso:
 *   const strategy = getVisualStrategy('matematicas', 'fracciones')
 *   // → 'svg'
 */

export type VisualStrategy = 'wikimedia' | 'svg' | 'both' | 'none';

// Asignaturas que usan SOLO Wikimedia (imágenes reales)
const WIKIMEDIA_ONLY = new Set([
  'arte',
  'artes',
  
]);

// Asignaturas que usan SOLO SVG
const SVG_ONLY = new Set([
  'matematicas',
  'fisica',
  'quimica',
  'lenguaje',
  'ingles',
  'frances',
  'ed_fisica',
  'tecnologia',
]);

// Asignaturas que pueden usar ambos según el tema
const BOTH_CAPABLE = new Set([
  'ciencias',
  'sociales',
  'historia',
]);

// Palabras clave en el tema que indican necesidad de SVG dentro de asignaturas mixtas
const SVG_KEYWORDS = [
  'ciclo', 'proceso', 'etapas', 'fases', 'sistema', 'estructura',
  'función', 'formula', 'ecuación', 'reacción', 'célula', 'anatomía',
  'diagrama', 'clasificación', 'taxonomía', 'cadena',
];

// Palabras clave que indican necesidad de Wikimedia dentro de asignaturas mixtas
const WIKIMEDIA_KEYWORDS = [
  'historia', 'período', 'época', 'guerra', 'revolución', 'personaje',
  'mapa', 'geografía', 'monumento', 'civilización', 'cultura', 'arte',
  'pintura', 'escultura', 'fotografía','átomo','célula',
];

export function getVisualStrategy(
  asignatura: string,
  tema: string = ''
): VisualStrategy {
  const a = asignatura.toLowerCase().trim();
  const t = tema.toLowerCase().trim();

  if (WIKIMEDIA_ONLY.has(a)) return 'wikimedia';
  if (SVG_ONLY.has(a)) return 'svg';

  if (BOTH_CAPABLE.has(a)) {
    const needsSvg = SVG_KEYWORDS.some(kw => t.includes(kw));
    const needsWikimedia = WIKIMEDIA_KEYWORDS.some(kw => t.includes(kw));

    if (needsSvg && needsWikimedia) return 'both';
    if (needsSvg) return 'svg';
    if (needsWikimedia) return 'wikimedia';

    // Default para asignaturas mixtas sin keywords claras
    return 'both';
  }

  // Fallback conservador
  return 'svg';
}
