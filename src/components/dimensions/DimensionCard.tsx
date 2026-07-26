// src/components/dimensions/DimensionCard.tsx
import React from 'react';
import { BookOpen, MessagesSquare, Heart, ListChecks, Stethoscope, Star, LucideIcon } from 'lucide-react';
import { DimensionKey } from '@/lib/observationsService';
import { DimensionData, normalizarDimensionData } from '@/lib/dimensionsService';

export interface DimensionMeta {
  label: string;
  descripcion: string;
  numero: number;
  icon: LucideIcon;
  colorClass: string;
  iconBgClass: string;
  cardBgClass: string; 
  accentBorder: string; 
}

export const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
  aprendizajeYDesempeno: {
    label: 'Aprendizaje y desempeño',
    descripcion: 'Cómo aprende, sus fortalezas y áreas de oportunidad.',
    numero: 1,
    icon: BookOpen,
    colorClass: 'text-blue-700',
    iconBgClass: 'bg-blue-500',
    cardBgClass: 'bg-gradient-to-br from-blue-50 to-blue-100/40',
    accentBorder: 'border-blue-200',
  },
  comunicacionSocial: {
    label: 'Comunicación social',
    descripcion: 'Cómo se comunica y relaciona con su entorno.',
    numero: 2,
    icon: MessagesSquare,
    colorClass: 'text-teal-700',
    iconBgClass: 'bg-teal-500',
    cardBgClass: 'bg-gradient-to-br from-teal-50 to-teal-100/40',
    accentBorder: 'border-teal-200',
  },
  regulacionEmocional: {
    label: 'Regulación emocional',
    descripcion: 'Cómo responde a situaciones y maneja sus emociones.',
    numero: 3,
    icon: Heart,
    colorClass: 'text-purple-700',
    iconBgClass: 'bg-purple-500',
    cardBgClass: 'bg-gradient-to-br from-purple-50 to-purple-100/40',
    accentBorder: 'border-purple-200',
  },
  autonomiaCotidiana: {
    label: 'Autonomía cotidiana',
    descripcion: 'Su independencia en tareas diarias y rutinas.',
    numero: 4,
    icon: ListChecks,
    colorClass: 'text-amber-700',
    iconBgClass: 'bg-amber-500',
    cardBgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/40',
    accentBorder: 'border-amber-200',
  },
  saludDesarrollo: {
    label: 'Salud y desarrollo',
    descripcion: 'Información relevante acerca de su salud general y desarrollo integral.',
    numero: 5,
    icon: Stethoscope,
    colorClass: 'text-red-700',
    iconBgClass: 'bg-red-500',
    cardBgClass: 'bg-gradient-to-br from-red-50 to-red-100/40',
    accentBorder: 'border-red-200',
  },
  interesesFortalezas: {
    label: 'Intereses y fortalezas',
    descripcion: 'Sus talentos naturales y aquello por lo que muestra motivación.',
    numero: 6,
    icon: Star,
    colorClass: 'text-pink-700',
    iconBgClass: 'bg-pink-500',
    cardBgClass: 'bg-gradient-to-br from-pink-50 to-pink-100/40',
    accentBorder: 'border-pink-200',
  },
};

interface DimensionCardProps {
  dimensionKey: DimensionKey;
  data?: DimensionData;
  onClick?: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ dimensionKey, data, onClick }) => {
  const meta = DIMENSION_META[dimensionKey];
  const Icon = meta.icon;
  const normalized = normalizarDimensionData(data);
  const clickable = Boolean(normalized && onClick);

  return (
    <div
      className={`${meta.cardBgClass} rounded-3xl border ${meta.accentBorder} p-5 flex flex-col shadow-sm ${clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      {/* Sección 1: número + título + descripción — altura fija, texto truncado */}
      <div className="flex items-start gap-3 h-28 overflow-hidden">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBgClass} text-white font-semibold text-sm`}>
          {meta.numero}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight">{meta.label}</h3>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{meta.descripcion}</p>
        </div>
      </div>

      {/* Sección 2: ícono central, altura fija, siempre en la misma posición */}
      <div className="flex items-center justify-center h-20 flex-shrink-0">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${meta.iconBgClass} shadow-md`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Sección 3: fortalezas / en desarrollo / recomendaciones (o mensaje de sin evidencia) */}
      {normalized ? (
        <div className="flex flex-col gap-2.5  flex-1 mt-4">
          {normalized.fortalezas.length > 0 && (
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${meta.colorClass}`}>Fortalezas</p>
              <p className="text-sm text-foreground/80 mt-0.5">{normalized.fortalezas.join(' · ')}</p>
            </div>
          )}

          {normalized.enDesarrollo.length > 0 && (
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${meta.colorClass}`}>En desarrollo</p>
              <p className="text-sm text-foreground/80 mt-0.5">{normalized.enDesarrollo.join(' · ')}</p>
            </div>
          )}

          {normalized.recomendaciones.length > 0 && (
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${meta.colorClass}`}>Recomendaciones</p>
              <p className="text-sm text-foreground/80 mt-0.5">
                {normalized.recomendaciones.length} activa{normalized.recomendaciones.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic flex-1">
          Aún no hay evidencia suficiente para esta dimensión.
        </p>
      )}

      {/* Sección 4: Ver detalle, centrado abajo — sin tocar */}
      <div className={`flex justify-center pt-3 mt-2 border-t ${meta.accentBorder}`}>
        <span className={`text-sm font-semibold ${meta.colorClass}`}>
          Ver detalle →
        </span>
      </div>
    </div>
  );
};

export default DimensionCard;