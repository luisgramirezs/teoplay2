import React from 'react';
import type { ApoyoVisualLeccion } from '@/types';
import { resolveLucideIcon } from "@/utils/iconResolver";
import NodesVisual from './NodesVisual';
import FlowVisual from './FlowVisual';
import TimelineVisual from './TimelineVisual';
import CycleVisual from './CycleVisual';
import RepartoVisual from './RepartoVisual';
import FormulaVisual from './FormulaVisual';



type ApoyoVisualBlockProps = {
    apoyoVisual: ApoyoVisualLeccion;
    condicion?: string;
};

// ── Paleta por asignatura ─────────────────────────────────────────────────────
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









// ── Componente principal ──────────────────────────────────────────────────────
const ApoyoVisualBlock: React.FC<ApoyoVisualBlockProps> = ({ apoyoVisual }) => {
    if (!apoyoVisual || !apoyoVisual.tipo || !apoyoVisual.elementos?.length) return null;

    const theme = asignaturaTheme[apoyoVisual.asignatura] ?? defaultTheme;


    console.log('[ApoyoVisualBlock] apoyoVisual recibido', {
        tipo: apoyoVisual?.tipo,
        titulo: apoyoVisual?.titulo,
        elementos: apoyoVisual?.elementos,
        items: apoyoVisual?.items,
    });

    const renderDiagrama = () => {
        switch (apoyoVisual.tipo) {
            case 'formula':
                return (
                    <FormulaVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            case 'flujo':
                return (
                    <FlowVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            case 'nodos':
                return (
                    <NodesVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            case 'linea_tiempo':
                return (
                    <TimelineVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            case 'ciclo':
                return (
                    <CycleVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            case 'reparto':
                return (
                    <RepartoVisual
                        elementos={apoyoVisual.elementos || []}
                        items={apoyoVisual.items || []}
                        theme={theme}
                    />
                );
            default:
                return null;
        }
    };    

    const diagrama = renderDiagrama();
    if (!diagrama) return null;

    return (
        <div className="w-full">
            {diagrama}
        </div>  
    );
};

export default ApoyoVisualBlock;
