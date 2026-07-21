// src/components/dimensions/DimensionCard.tsx
import React from 'react';
import { BookOpen, MessagesSquare, Heart, ListChecks, Stethoscope, Star, LucideIcon } from 'lucide-react';
import { DimensionKey } from '@/lib/observationsService';
import { DimensionData } from '@/lib/dimensionsService';

export interface DimensionMeta {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  iconBgClass: string; // fondo sólido claro del contenedor del ícono
  bgTint: string; // fondo sutil (/50) de la tarjeta completa
}

// Colores/iconos por dimensión: mapeo provisorio sobre la paleta teo-* ya
// existente en tailwind.config.ts / index.css. Ajustar si difiere del diseño aprobado.
export const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
  aprendizajeYDesempeno: {
    label: 'Aprendizaje y desempeño',
    icon: BookOpen,
    colorClass: 'text-blue-700',
    iconBgClass: 'bg-blue-600',
    bgTint: 'bg-blue-100/70',
  },
  comunicacionSocial: {
    label: 'Comunicación social',
    icon: MessagesSquare,
    colorClass: 'text-teal-700',
    iconBgClass: 'bg-teal-600',
    bgTint: 'bg-teal-100/70',
  },
  regulacionEmocional: {
    label: 'Regulación emocional',
    icon: Heart,
    colorClass: 'text-purple-700',
    iconBgClass: 'bg-purple-600',
    bgTint: 'bg-purple-100/70',
  },
  autonomiaCotidiana: {
    label: 'Autonomía cotidiana',
    icon: ListChecks,
    colorClass: 'text-amber-700',
    iconBgClass: 'bg-amber-600',
    bgTint: 'bg-amber-100/70',
  },
  saludDesarrollo: {
    label: 'Salud y desarrollo',
    icon: Stethoscope,
    colorClass: 'text-red-700',
    iconBgClass: 'bg-red-600',
    bgTint: 'bg-red-100/70',
  },
  interesesFortalezas: {
    label: 'Intereses y fortalezas',
    icon: Star,
    colorClass: 'text-pink-700',
    iconBgClass: 'bg-pink-600',
    bgTint: 'bg-pink-50/50',
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
  const clickable = Boolean(data && onClick);

  return (
    <div
      className={`${meta.bgTint} rounded-2xl border border-border p-6 flex flex-col gap-3 ${clickable ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBgClass} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-black text-foreground text-[18px] flex-1">{meta.label}</h3>
      </div>

      {data ? (
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{data.summary}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Aún no hay evidencia suficiente para esta dimensión.
        </p>
      )}
    </div>
  );
};

export default DimensionCard;
