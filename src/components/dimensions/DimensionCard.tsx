// src/components/dimensions/DimensionCard.tsx
import React from 'react';
import { BookOpen, MessagesSquare, Heart, ListChecks, Stethoscope, Star, LucideIcon } from 'lucide-react';
import { DimensionKey } from '@/lib/observationsService';
import { DimensionData } from '@/lib/dimensionsService';

interface DimensionMeta {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  barClass: string;
}

// Colores/iconos por dimensión: mapeo provisorio sobre la paleta teo-* ya
// existente en tailwind.config.ts / index.css. Ajustar si difiere del diseño aprobado.
const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
  aprendizajeYDesempeno: {
    label: 'Aprendizaje y desempeño',
    icon: BookOpen,
    colorClass: 'text-teo-blue',
    bgClass: 'bg-teo-blue/10',
    barClass: 'bg-teo-blue',
  },
  comunicacionSocial: {
    label: 'Comunicación social',
    icon: MessagesSquare,
    colorClass: 'text-teo-teal',
    bgClass: 'bg-teo-teal/10',
    barClass: 'bg-teo-teal',
  },
  regulacionEmocional: {
    label: 'Regulación emocional',
    icon: Heart,
    colorClass: 'text-teo-purple',
    bgClass: 'bg-teo-purple/10',
    barClass: 'bg-teo-purple',
  },
  autonomiaCotidiana: {
    label: 'Autonomía cotidiana',
    icon: ListChecks,
    colorClass: 'text-teo-orange',
    bgClass: 'bg-teo-orange/10',
    barClass: 'bg-teo-orange',
  },
  saludDesarrollo: {
    label: 'Salud y desarrollo',
    icon: Stethoscope,
    colorClass: 'text-teo-green',
    bgClass: 'bg-teo-green/10',
    barClass: 'bg-teo-green',
  },
  interesesFortalezas: {
    label: 'Intereses y fortalezas',
    icon: Star,
    colorClass: 'text-teo-yellow',
    bgClass: 'bg-teo-yellow/10',
    barClass: 'bg-teo-yellow',
  },
};

// Encuadre no evaluativo del progreso (sección 21 del documento de visión):
// nunca se presenta como nota/calificación, siempre como proceso en curso.
function encuadreProgreso(progress: number): string {
  if (progress <= 40) return 'Iniciando este proceso';
  if (progress <= 70) return 'En desarrollo, mejorando';
  return 'Consolidando avances';
}

interface DimensionCardProps {
  dimensionKey: DimensionKey;
  data?: DimensionData;
  adaptedRecommendation?: string;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ dimensionKey, data, adaptedRecommendation }) => {
  const meta = DIMENSION_META[dimensionKey];
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bgClass} ${meta.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-black text-foreground text-sm flex-1">{meta.label}</h3>
      </div>

      {data?.progress !== undefined && (
        <div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${meta.barClass}`}
              style={{ width: `${data.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs font-bold ${meta.colorClass}`}>{encuadreProgreso(data.progress)}</p>
            <p className="text-[10px] font-semibold text-muted-foreground">{data.progress}%</p>
          </div>
        </div>
      )}

      {data ? (
        <>
          <p className="text-sm text-foreground/80 leading-relaxed">{data.summary}</p>
          <div className={`rounded-xl px-3 py-2 text-xs font-bold ${meta.bgClass} ${meta.colorClass}`}>
            💡 {adaptedRecommendation ?? data.baseRecommendation}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Aún no hay evidencia suficiente para esta dimensión.
        </p>
      )}
    </div>
  );
};

export default DimensionCard;
