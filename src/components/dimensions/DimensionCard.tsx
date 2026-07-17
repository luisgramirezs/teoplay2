// src/components/dimensions/DimensionCard.tsx
import React from 'react';
import { BookOpen, MessagesSquare, Heart, ListChecks, Stethoscope, Star, Lightbulb, LucideIcon } from 'lucide-react';
import { DimensionKey } from '@/lib/observationsService';
import { DimensionData } from '@/lib/dimensionsService';

interface DimensionMeta {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  iconBgClass: string; // fondo sólido claro del contenedor del ícono
  barClass: string;
}

// Colores/iconos por dimensión: mapeo provisorio sobre la paleta teo-* ya
// existente en tailwind.config.ts / index.css. Ajustar si difiere del diseño aprobado.
const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
  aprendizajeYDesempeno: {
    label: 'Aprendizaje y desempeño',
    icon: BookOpen,
    colorClass: 'text-blue-700',
    iconBgClass: 'bg-blue-50',
    barClass: 'bg-blue-700',
  },
  comunicacionSocial: {
    label: 'Comunicación social',
    icon: MessagesSquare,
    colorClass: 'text-teal-700',
    iconBgClass: 'bg-teal-50',
    barClass: 'bg-teal-700',
  },
  regulacionEmocional: {
    label: 'Regulación emocional',
    icon: Heart,
    colorClass: 'text-purple-700',
    iconBgClass: 'bg-purple-50',
    barClass: 'bg-purple-700',
  },
  autonomiaCotidiana: {
    label: 'Autonomía cotidiana',
    icon: ListChecks,
    colorClass: 'text-amber-700',
    iconBgClass: 'bg-amber-50',
    barClass: 'bg-amber-700',
  },
  saludDesarrollo: {
    label: 'Salud y desarrollo',
    icon: Stethoscope,
    colorClass: 'text-red-700',
    iconBgClass: 'bg-red-50',
    barClass: 'bg-red-700',
  },
  interesesFortalezas: {
    label: 'Intereses y fortalezas',
    icon: Star,
    colorClass: 'text-pink-700',
    iconBgClass: 'bg-pink-50',
    barClass: 'bg-pink-700',
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
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBgClass} ${meta.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-foreground text-[15px] flex-1">{meta.label}</h3>
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
          <div className={`border-t border-border pt-3 flex items-start gap-2 text-xs font-bold ${meta.colorClass}`}>
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <span>{adaptedRecommendation ?? data.baseRecommendation}</span>
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
