import React, { useMemo, useState } from 'react';
import VisualBlockFrame from './VisualBlockFrame';
import VisualInfoModal from './VisualInfoModal';
import type { ApoyoVisualItem } from '../../types';
import {
    getSafeVisualFallback,
    getVisualDetailOrNull,
    normalizeVisualText,
} from '../../utils/visualText';

type TimelineVisualProps = {
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

type TimelineDisplayItem = {
    raw: string;
    fecha: string;
    evento: string;
    explicacion: string;
    meta: string;
};

const parseTimelineItem = (el: string): TimelineDisplayItem => {
    const partes = el
        .split(':')
        .map((p) => p.trim())
        .filter(Boolean);

    if (partes.length >= 3) {
        return {
            raw: el,
            fecha: normalizeVisualText(partes[0]),
            evento: normalizeVisualText(partes[1]),
            explicacion: normalizeVisualText(partes.slice(2).join(':')),
            meta: '',
        };
    }

    if (partes.length === 2) {
        return {
            raw: el,
            fecha: normalizeVisualText(partes[0]),
            evento: normalizeVisualText(partes[1]),
            explicacion: '',
            meta: '',
        };
    }

    return {
        raw: el,
        fecha: '',
        evento: normalizeVisualText(el),
        explicacion: '',
        meta: '',
    };
};

const TimelineVisual: React.FC<TimelineVisualProps> = ({ elementos, items, theme }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const displayItems = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => {
                const fallback = parseTimelineItem(elementos[index] || item.label || '');

                return {
                    raw: normalizeVisualText(item.label || fallback.raw),
                    fecha: fallback.fecha,
                    evento: normalizeVisualText(item.title || fallback.evento || item.label || `Evento ${index + 1}`),
                    explicacion: normalizeVisualText(item.description || ''),
                    meta: normalizeVisualText(item.meta || ''),
                };
            });
        }

        return elementos.map(parseTimelineItem);
    }, [elementos, items]);

    const selectedItem =
        selectedIndex !== null ? displayItems[selectedIndex] : null;

    const selectedDescription =
        selectedItem
            ? getVisualDetailOrNull(selectedItem.evento, selectedItem.explicacion) ||
            getSafeVisualFallback('timeline')
            : '';

    console.log('[TimelineVisual] props', { elementos, items });
    console.log('[TimelineVisual] displayItems', displayItems);
    console.log('[TimelineVisual] selectedItem', selectedItem);
    console.log('[TimelineVisual] selectedDescription inputs', {
        evento: selectedItem?.evento,
        explicacion: selectedItem?.explicacion,
    });
    console.log('[TimelineVisual] selectedDescription final', selectedDescription);

    return (
        <>



            <VisualBlockFrame
                title={normalizeVisualText('Línea de tiempo')}
                typeLabel={normalizeVisualText('Línea de tiempo')}
                hint={normalizeVisualText('Sigue el orden de los hechos o pasos.')}
            >
                <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                    {displayItems.map((item, i) => (
                        <div key={`${item.raw}-${i}`} className="flex items-start gap-3">
                            <div className="flex flex-col items-center flex-shrink-0">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${theme.nodeMain} ${theme.nodeMainText}`}
                                >
                                    {i + 1}
                                </div>

                                {i < displayItems.length - 1 && (
                                    <div className={`w-0.5 h-6 mt-1 ${theme.connector}`} />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedIndex(i)}
                                className={`flex-1 rounded-xl border px-3 py-2 shadow-sm text-left transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${theme.nodeSec} ${theme.border}`}
                                aria-label={`Abrir detalle del evento ${i + 1}: ${normalizeVisualText(item.evento)}`}
                            >
                                {item.fecha ? (
                                    <>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-wide block ${theme.label}`}
                                        >
                                            {item.fecha}
                                        </span>
                                        <span className={`text-xs font-bold ${theme.nodeSecText}`}>
                                            {item.evento}
                                        </span>
                                    </>
                                ) : (
                                    <span className={`text-xs font-bold ${theme.nodeSecText}`}>
                                        {item.evento || item.raw}
                                    </span>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={selectedIndex !== null}
                onClose={() => setSelectedIndex(null)}
                title={normalizeVisualText(selectedItem?.evento || 'Evento')}
                description={selectedDescription}
                extra={
                    selectedItem && (selectedItem.fecha || selectedItem.meta) ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedItem.fecha && (
                                <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                    {normalizeVisualText(selectedItem.fecha)}
                                </div>
                            )}
                            {selectedItem.meta && (
                                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                    {normalizeVisualText(selectedItem.meta)}
                                </div>
                            )}
                        </div>
                    ) : undefined
                }
            />
        </>
    );
};

export default TimelineVisual;