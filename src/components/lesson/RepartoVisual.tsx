import React, { useMemo, useState } from 'react';
import VisualBlockFrame from './VisualBlockFrame';
import VisualInfoModal from './VisualInfoModal';
import type { ApoyoVisualItem } from '../../types';
import { normalizeVisualText } from '../../utils/visualText';

type RepartoVisualProps = {
    elementos: string[];
    items?: ApoyoVisualItem[];
    theme: {
        bg: string;
        border: string;
        badge: string;
        badgeText: string;
        nodeMain: string;
        nodeMainText: string;
        nodeSec: string;
        nodeSecText: string;
        connector: string;
        label: string;
    };
};

type RepartoDisplayItem = {
    raw: string;
    label: string;
    title: string;
    description: string;
    meta: string;
};

const RepartoVisual: React.FC<RepartoVisualProps> = ({ elementos, items, theme }) => {
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

    const { total, grupos, porGrupo, safeTotal, safeGrupos } = useMemo(() => {
        const total = parseInt(elementos[0]) || 12;
        const grupos = parseInt(elementos[1]) || 4;
        const porGrupo = parseInt(elementos[2]) || Math.floor(total / grupos);
        const safeTotal = Math.min(total, 40);
        const safeGrupos = Math.min(grupos, 8);

        return {
            total,
            grupos,
            porGrupo,
            safeTotal,
            safeGrupos,
        };
    }, [elementos]);

    const displayItems = useMemo<RepartoDisplayItem[]>(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => ({
                raw: normalizeVisualText(item.label || item.title || `Grupo ${index + 1}`),
                label: normalizeVisualText(item.label || `Grupo ${index + 1}`),
                title: normalizeVisualText(item.title || item.label || `Grupo ${index + 1}`),
                description: normalizeVisualText(item.description || ''),
                meta: normalizeVisualText(item.meta || ''),
            }));
        }

        return Array.from({ length: safeGrupos }, (_, index) => ({
            raw: `Grupo ${index + 1}`,
            label: `Grupo ${index + 1}`,
            title: `Grupo ${index + 1}`,
            description: '',
            meta: '',
        }));
    }, [items, safeGrupos]);

    const selectedItem =
        selectedGroup !== null ? displayItems[selectedGroup] : null;

    return (
        <>
            <VisualBlockFrame
                title={normalizeVisualText('Reparto')}
                typeLabel={normalizeVisualText('Reparto')}
                hint="Observa cómo una cantidad total se divide en grupos iguales."
            >
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex flex-wrap justify-center gap-1 max-w-[240px]">
                        {[...Array(safeTotal)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full shadow-sm ${theme.nodeMain}`}
                            />
                        ))}
                    </div>

                    <div className={`text-[10px] font-black uppercase tracking-wide ${theme.label}`}>
                        ÷ {grupos} grupos iguales
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {displayItems.slice(0, safeGrupos).map((item, i) => (
                            <button
                                key={`${item.raw}-${i}`}
                                type="button"
                                onClick={() => setSelectedGroup(i)}
                                className={`border-2 rounded-xl p-2 flex flex-col items-center gap-1 shadow-sm text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${theme.nodeSec} ${theme.border}`}
                                aria-label={`Abrir detalle del grupo ${i + 1}`}
                            >
                                <div className="flex flex-wrap gap-0.5 justify-center max-w-[48px]">
                                    {[...Array(Math.min(porGrupo, 10))].map((_, j) => (
                                        <div
                                            key={j}
                                            className={`w-2.5 h-2.5 rounded-full ${theme.nodeMain} opacity-80`}
                                        />
                                    ))}
                                </div>

                                <span className={`text-[9px] font-black uppercase ${theme.label}`}>
                                    {item.label || `Grupo ${i + 1}`}
                                </span>

                                <span className={`text-[9px] font-black uppercase ${theme.label} opacity-80`}>
                                    Toca para explorar
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className={`text-xs font-black ${theme.label}`}>
                        {porGrupo} por grupo
                    </div>
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={selectedGroup !== null}
                onClose={() => setSelectedGroup(null)}
                title={
                    selectedItem?.title ||
                    (selectedGroup !== null ? `Grupo ${selectedGroup + 1}` : 'Grupo')
                }
                description={
                    selectedItem?.description ||
                    `Este grupo tiene ${porGrupo} elemento${porGrupo === 1 ? '' : 's'}. Cuando repartimos ${total} elementos en ${grupos} grupos iguales, cada grupo recibe ${porGrupo}.`
                }
                extra={
                    selectedGroup !== null ? (
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                {porGrupo} por grupo
                            </div>
                            {selectedItem?.meta && (
                                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                    {selectedItem.meta}
                                </div>
                            )}
                        </div>
                    ) : undefined
                }
            />
        </>
    );
};

export default RepartoVisual;