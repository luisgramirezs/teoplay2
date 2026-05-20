/**
 * ApoyoVisualBlock.tsx
 *
 * Enrutador principal de apoyos visuales pedagógicos.
 *
 * Estrategia según asignatura y tema:
 *   - 'svg'       → ClaudeVisualBlock (matemáticas, física, química, lenguaje, etc.)
 *   - 'wikimedia' → solo ExamplesBlock (artes)
 *   - 'both'      → ambos (ciencias, sociales)
 *   - 'none'      → nada
 *
 * ExamplesBlock se maneja en Phase2Lesson via props (obras, selectedIndex, onSelectObra).
 * Este componente solo decide si mostrar el bloque SVG.
 */

import React from 'react';
import type { ApoyoVisualLeccion } from '@/types';
import { getVisualStrategy } from '@/utils/getVisualStrategy';
import ClaudeVisualBlock from './ClaudeVisualBlock';
import NodesVisual from './NodesVisual';
import FlowVisual from './FlowVisual';
import TimelineVisual from './TimelineVisual';
import CycleVisual from './CycleVisual';
import RepartoVisual from './RepartoVisual';
import FormulaVisual from './FormulaVisual';

// ── Paleta por asignatura (fallback estático) ─────────────────────────────────

const asignaturaTheme: Record<string, {
  bg: string; border: string; badge: string; badgeText: string;
  nodeMain: string; nodeMainText: string; nodeSec: string; nodeSecText: string;
  connector: string; label: string;
}> = {
  matematicas: {
    bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100', badgeText: 'text-orange-700',
    nodeMain: 'bg-orange-500', nodeMainText: 'text-white', nodeSec: 'bg-orange-100', nodeSecText: 'text-orange-800',
    connector: 'bg-orange-300', label: 'text-orange-700',
  },
  ingles: {
    bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100', badgeText: 'text-purple-700',
    nodeMain: 'bg-purple-500', nodeMainText: 'text-white', nodeSec: 'bg-purple-100', nodeSecText: 'text-purple-800',
    connector: 'bg-purple-300', label: 'text-purple-700',
  },
  lenguaje: {
    bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100', badgeText: 'text-violet-700',
    nodeMain: 'bg-violet-500', nodeMainText: 'text-white', nodeSec: 'bg-violet-100', nodeSecText: 'text-violet-800',
    connector: 'bg-violet-300', label: 'text-violet-700',
  },
  ciencias: {
    bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100', badgeText: 'text-teal-700',
    nodeMain: 'bg-teal-500', nodeMainText: 'text-white', nodeSec: 'bg-teal-100', nodeSecText: 'text-teal-800',
    connector: 'bg-teal-300', label: 'text-teal-700',
  },
  historia: {
    bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100', badgeText: 'text-amber-700',
    nodeMain: 'bg-amber-500', nodeMainText: 'text-white', nodeSec: 'bg-amber-100', nodeSecText: 'text-amber-800',
    connector: 'bg-amber-300', label: 'text-amber-700',
  },
  sociales: {
    bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100', badgeText: 'text-sky-700',
    nodeMain: 'bg-sky-500', nodeMainText: 'text-white', nodeSec: 'bg-sky-100', nodeSecText: 'text-sky-800',
    connector: 'bg-sky-300', label: 'text-sky-700',
  },
  arte: {
    bg: 'bg-pink-50', border: 'border-pink-200', badge: 'bg-pink-100', badgeText: 'text-pink-700',
    nodeMain: 'bg-pink-500', nodeMainText: 'text-white', nodeSec: 'bg-pink-100', nodeSecText: 'text-pink-800',
    connector: 'bg-pink-300', label: 'text-pink-700',
  },
  ed_fisica: {
    bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100', badgeText: 'text-green-700',
    nodeMain: 'bg-green-500', nodeMainText: 'text-white', nodeSec: 'bg-green-100', nodeSecText: 'text-green-800',
    connector: 'bg-green-300', label: 'text-green-700',
  },
};

const defaultTheme = asignaturaTheme.ciencias;

// ── Fallback estático ─────────────────────────────────────────────────────────

const FallbackVisual: React.FC<{ apoyoVisual: ApoyoVisualLeccion }> = ({ apoyoVisual }) => {
  const theme = asignaturaTheme[apoyoVisual.asignatura] ?? defaultTheme;
  const { tipo, elementos, items } = apoyoVisual;

  switch (tipo) {
    case 'formula':
      return <FormulaVisual elementos={elementos} items={items as any} theme={theme} />;
    case 'flujo':
      return <FlowVisual elementos={elementos} items={items as any} theme={theme} />;
    case 'nodos':
      return <NodesVisual elementos={elementos} items={items as any} theme={theme} />;
    case 'linea_tiempo':
      return <TimelineVisual elementos={elementos} items={items as any} theme={theme} />;
    case 'ciclo':
      return <CycleVisual elementos={elementos} items={items as any} theme={theme} />;
    case 'reparto':
      return <RepartoVisual elementos={elementos} items={items as any} theme={theme} />;
    default:
      return null;
  }
};

// ── Tipos que usan SVG generativo ─────────────────────────────────────────────
// Incluye los nuevos tipos matemáticos/científicos
const SVG_GENERATIVO_TIPOS = new Set([
  'nodos', 'ciclo', 'linea_tiempo', 'flujo', 'formula', 'reparto',
  'fraccion', 'recta_numerica', 'geometria', 'agrupacion',
  'fuerzas', 'molecula', 'reaccion',
]);

// ── Componente principal ──────────────────────────────────────────────────────

type ApoyoVisualBlockProps = {
  apoyoVisual: ApoyoVisualLeccion;
  condicion?: string;
  asignatura?: string;
  tema?: string;
};

const ApoyoVisualBlock: React.FC<ApoyoVisualBlockProps> = ({
  apoyoVisual,
  condicion = 'general',
  asignatura = '',
  tema = '',
}) => {
  if (!apoyoVisual || !apoyoVisual.tipo || !apoyoVisual.elementos?.length) return null;

  const strategy = getVisualStrategy(asignatura || apoyoVisual.asignatura || '', tema);

  // Artes puro: no genera SVG, solo Wikimedia (manejado en Phase2Lesson)
  if (strategy === 'wikimedia') return null;

  // Para el resto: mostrar SVG si el tipo lo soporta
  const usarGenerativo = SVG_GENERATIVO_TIPOS.has(apoyoVisual.tipo);

  if (usarGenerativo) {
    return (
      <ClaudeVisualBlock
        apoyoVisual={apoyoVisual}
        condicion={condicion}
      />
    );
  }

  // Fallback estático para tipos no soportados por el generativo
  return (
    <div className="w-full">
      <FallbackVisual apoyoVisual={apoyoVisual} />
    </div>
  );
};

export default ApoyoVisualBlock;
