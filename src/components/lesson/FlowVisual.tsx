import React, { useMemo, useState } from 'react';
import VisualBlockFrame from './VisualBlockFrame';
import VisualInfoModal from './VisualInfoModal';
import type { ApoyoVisualItem } from '../../types';
import { normalizeVisualText } from '../../utils/visualText';

type FlowVisualProps = {
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

type ParsedFlowItem = {
    raw: string;
    titulo: string;
    explicacion: string;
    meta: string;
};

const parseFlowItem = (el: string): ParsedFlowItem => {
    const partes = el
        .split(':')
        .map((p) => p.trim())
        .filter(Boolean);

    if (partes.length >= 2) {
        return {
            raw: el,
            titulo: partes[0],
            explicacion: partes.slice(1).join(':'),
            meta: '',
        };
    }

    return {
        raw: el,
        titulo: el.trim(),
        explicacion: '',
        meta: '',
    };
};

const FlowVisual: React.FC<FlowVisualProps> = ({ elementos, items, theme }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const displayItems = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => {
                const fallback = parseFlowItem(elementos[index] || '');

                return {
                    raw: normalizeVisualText(
                        elementos[index] || item.title || item.label || `Paso ${index + 1}`
                    ),
                    titulo:
                        normalizeVisualText(item.title || '') ||
                        fallback.titulo ||
                        normalizeVisualText(item.label || '') ||
                        `Paso ${index + 1}`,
                    explicacion:
                        normalizeVisualText(item.description || '') ||
                        fallback.explicacion ||
                        '',
                    meta:
                        normalizeVisualText(item.meta || '') ||
                        fallback.meta ||
                        '',
                };
            });
        }

        return elementos.map(parseFlowItem);
    }, [elementos, items]);

    const selectedItem = selectedIndex !== null ? displayItems[selectedIndex] : null;

    return (
        <>
            <VisualBlockFrame
                title="Paso a paso"
                typeLabel="Flujo"
                hint="Sigue el orden para entender qué pasa primero y qué pasa después"
            >
                <div className="flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
                    {displayItems.map((item, i) => (
                        <React.Fragment key={`${item.raw}-${i}`}>
                            <button
                                type="button"
                                onClick={() => setSelectedIndex(i)}
                                aria-label={`Abrir detalle del paso ${i + 1}: ${item.titulo}`}
                                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-center shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 ${i === 0
                                    ? `${theme.nodeMain} ${theme.nodeMainText} border-transparent`
                                    : `${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`
                                    }`}
                            >
                                {item.titulo}
                            </button>

                            {i < displayItems.length - 1 && (
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className={`w-0.5 h-3 ${theme.connector}`} />
                                    <svg
                                        width="14"
                                        height="8"
                                        viewBox="0 0 14 8"
                                        className={`${theme.label} fill-current opacity-60`}
                                    >
                                        <path d="M7 8L0 0h14z" />
                                    </svg>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={selectedIndex !== null}
                onClose={() => setSelectedIndex(null)}
                title={selectedItem?.titulo || 'Paso'}
                description={selectedItem?.explicacion || 'Este paso forma parte del proceso.'}
                extra={
                    selectedItem ? (
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                                Paso {(selectedIndex || 0) + 1} de {displayItems.length}
                            </div>
                            {selectedItem.meta && (
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

export default FlowVisual;