import React, { useMemo, useState } from 'react';
import VisualBlockFrame from './VisualBlockFrame';
import VisualInfoModal from './VisualInfoModal';
import type { ApoyoVisualItem } from '../../types';
import { normalizeVisualText } from '../../utils/visualText';

type CycleVisualProps = {
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

type ParsedCycleItem = {
    raw: string;
    titulo: string;
    explicacion: string;
};

const parseCycleItem = (el: string): ParsedCycleItem => {
    const partes = el
        .split(':')
        .map((p) => p.trim())
        .filter(Boolean);

    if (partes.length >= 2) {
        return {
            raw: el,
            titulo: partes[0],
            explicacion: partes.slice(1).join(':'),
        };
    }

    return {
        raw: el,
        titulo: el.trim(),
        explicacion: '',
    };
};

const CycleVisual: React.FC<CycleVisualProps> = ({ elementos, items, theme }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const displayItems = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => {
                const fallback = parseCycleItem(elementos[index] || '');

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
                };
            });
        }

        return elementos.map(parseCycleItem);
    }, [elementos, items]);

    const selectedItem = selectedIndex !== null ? displayItems[selectedIndex] : null;

    return (
        <>
            <VisualBlockFrame
                title={normalizeVisualText('Ciclo')}
                typeLabel={normalizeVisualText('Ciclo')}
                hint="Observa cómo el proceso vuelve a empezar."
            >
                <div className="w-full max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                        {displayItems.map((item, i) => (
                            <React.Fragment key={`${item.raw}-${i}`}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIndex(i)}
                                    aria-label={`Abrir detalle del paso ${i + 1}: ${item.titulo}`}
                                    className={`group relative w-full sm:w-[280px] min-h-[120px] rounded-[1.6rem] border-2 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 ${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm ${theme.nodeMain} ${theme.nodeMainText}`}
                                        >
                                            {i + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <span className="block font-black text-sm md:text-base leading-tight">
                                                {item.titulo}
                                            </span>

                                            {item.explicacion && (
                                                <span className="block mt-1 text-xs md:text-sm opacity-80 leading-snug">
                                                    {item.explicacion}
                                                </span>
                                            )}

                                            <span
                                                className={`block mt-3 text-[10px] font-black uppercase tracking-wider ${theme.label}`}
                                            >
                                                Toca para explorar
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {i < displayItems.length - 1 && (
                                    <div className="hidden md:flex items-center justify-center self-center">
                                        <div className="flex items-center gap-1">
                                            <div className={`w-6 h-0.5 rounded-full ${theme.connector}`} />
                                            <div
                                                className={`w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent ${theme.label.replace('text-', 'border-l-')}`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {displayItems.length > 1 && (
                        <div className="mt-5 flex justify-center">
                            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${theme.nodeSec} ${theme.nodeSecText} ${theme.border} border`}>
                                <span className={`text-sm ${theme.label}`}>↺</span>
                                <span>Cuando termina, vuelve a empezar</span>
                            </div>
                        </div>
                    )}
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={selectedIndex !== null}
                onClose={() => setSelectedIndex(null)}
                title={selectedItem?.titulo || 'Paso del ciclo'}
                description={selectedItem?.explicacion || 'Este paso forma parte del ciclo.'}
                colorRamp="teal"
                extra={
                    selectedIndex !== null ? (
                        <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            Paso {selectedIndex + 1} de {displayItems.length}
                        </div>
                    ) : undefined
                }
            />
        </>
    );
};

export default CycleVisual;