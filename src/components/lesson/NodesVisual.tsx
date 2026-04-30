import React, { useMemo, useState } from 'react';
import { resolveLucideIcon } from "@/utils/iconResolver";
import VisualInfoModal from './VisualInfoModal';
import VisualBlockFrame from './VisualBlockFrame';
import type { ApoyoVisualItem } from '../../types';
import { normalizeVisualText } from '../../utils/visualText';

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

type NodesVisualProps = {
    elementos: string[];
    items?: ApoyoVisualItem[];
    theme: typeof defaultTheme;
};

type ParsedNodo = {
    raw: string;
    nombre: string;
    descripcion: string;
    icono?: string;
    meta?: string;
};

const parseNodo = (text: string): ParsedNodo => {
    const cleaned = text.trim();

    const iconMatch = cleaned.match(/\(([^)]+)\)\s*$/);
    const icono = iconMatch ? iconMatch[1].trim() : '';

    const withoutIcon = cleaned.replace(/\(([^)]+)\)\s*$/, '').trim();
    const separatorIndex = withoutIcon.indexOf(':');

    if (separatorIndex !== -1) {
        return {
            raw: text,
            nombre: withoutIcon.substring(0, separatorIndex).trim(),
            descripcion: withoutIcon.substring(separatorIndex + 1).trim(),
            icono,
            meta: '',
        };
    }

    return {
        raw: text,
        nombre: withoutIcon,
        descripcion: '',
        icono,
        meta: '',
    };
};

const NodesVisual: React.FC<NodesVisualProps> = ({ elementos, items, theme }) => {
    const [selectedNodo, setSelectedNodo] = useState<ParsedNodo | null>(null);

    const displayNodes = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => {
                const fallback = parseNodo(elementos[index] || '');

                return {
                    raw: normalizeVisualText(
                        elementos[index] || item.title || item.label || `Nodo ${index + 1}`
                    ),
                    nombre:
                        normalizeVisualText(item.title || '') ||
                        fallback.nombre ||
                        normalizeVisualText(item.label || '') ||
                        `Nodo ${index + 1}`,
                    descripcion:
                        normalizeVisualText(item.description || '') ||
                        fallback.descripcion ||
                        '',
                    icono: normalizeVisualText(item.shortLabel || '') || fallback.icono || '',
                    meta: normalizeVisualText(item.meta || '') || '',
                };
            });
        }

        return elementos.map(parseNodo);
    }, [elementos, items]);

    const [central, ...hijos] = displayNodes;

    return (
        <>
            <VisualBlockFrame
                title="Mapa visual"
                typeLabel="Nodos"
                hint="Toca una parte para entenderla mejor"
            >
                <div className="flex flex-col items-center gap-4 w-full">
                    {central && (
                        <button
                            type="button"
                            onClick={() => setSelectedNodo(central)}
                            className={`px-6 py-3 rounded-[1.4rem] font-black text-sm md:text-base shadow-md text-center max-w-[340px] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 ${theme.nodeMain} ${theme.nodeMainText}`}
                            aria-label={`Abrir detalle de ${central.nombre}`}
                        >
                            <span className="block">
                                {central.nombre}
                            </span>
                            {central.descripcion && (
                                <span className="block mt-1 text-[12px] font-semibold opacity-90">
                                    {central.descripcion}
                                </span>
                            )}
                            <span className="block mt-3 text-[10px] font-black uppercase tracking-wider opacity-90">
                                Toca para explorar
                            </span>
                        </button>
                    )}
                    {hijos.length > 0 && (
                        <div className="flex flex-col items-center">
                            <div className={`w-0.5 h-5 ${theme.connector}`} />
                            <div className={`w-2.5 h-2.5 rounded-full ${theme.connector}`} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {hijos.map((nodo, i) => {
                            const NodoIcon = resolveLucideIcon(nodo.icono || nodo.nombre);

                            return (
                                <button
                                    key={`${nodo.raw}-${i}`}
                                    type="button"
                                    onClick={() => setSelectedNodo(nodo)}
                                    className={`group w-full px-4 py-4 rounded-2xl border-2 text-left shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <span className="block font-black text-sm">
                                                {nodo.nombre}
                                            </span>
                                            {nodo.descripcion && (
                                                <span className="block mt-1 text-[12px] font-semibold opacity-80 leading-snug">
                                                    {nodo.descripcion}
                                                </span>
                                            )}
                                            <span className={`block mt-3 text-[10px] font-black uppercase tracking-wider ${theme.label}`}>
                                                Toca para explorar
                                            </span>
                                        </div>

                                        <div className="shrink-0 opacity-80">
                                            <NodoIcon size={22} strokeWidth={2} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={!!selectedNodo}
                onClose={() => setSelectedNodo(null)}
                title={selectedNodo?.nombre || 'Detalle'}
                description={
                    selectedNodo?.descripcion || 'Este elemento forma parte de este tema importante.'
                }
                icon={selectedNodo?.icono || selectedNodo?.nombre}
                colorRamp="teal"
                extra={
                    selectedNodo?.meta ? (
                        <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {selectedNodo.meta}
                        </div>
                    ) : undefined
                }
            />
        </>
    );
};

export default NodesVisual;