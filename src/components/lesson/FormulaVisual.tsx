import React, { useMemo, useState } from 'react';
import VisualBlockFrame from './VisualBlockFrame';
import VisualInfoModal from './VisualInfoModal';
import type { ApoyoVisualItem } from '../../types';
import { normalizeVisualText } from '../../utils/visualText';

type FormulaVisualProps = {
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

type ParsedFormulaItem = {
    raw: string;
    nombre: string;
    valor: string;
    explicacion: string;
    meta: string;
};

const parseFormulaItem = (el: string): ParsedFormulaItem => {
    const partes = el.split(':');
    const nombre = partes[0]?.trim() || '';
    const valor = partes.slice(1).join(':').trim();

    if (valor) {
        return {
            raw: el,
            nombre,
            valor,
            explicacion: '',
            meta: '',
        };
    }

    return {
        raw: el,
        nombre: el.trim(),
        valor: '',
        explicacion: '',
        meta: '',
    };
};

const FormulaVisual: React.FC<FormulaVisualProps> = ({ elementos, items, theme }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const displayItems = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item, index) => {
                const fallback = parseFormulaItem(elementos[index] || '');

                return {
                    raw: normalizeVisualText(
                        elementos[index] || item.title || item.label || `Parte ${index + 1}`
                    ),
                    nombre:
                        normalizeVisualText(item.label || '') ||
                        fallback.nombre ||
                        `Parte ${index + 1}`,
                    valor:
                        normalizeVisualText(item.title || '') ||
                        fallback.valor ||
                        '',
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

        return elementos.map(parseFormulaItem);
    }, [elementos, items]);

    const selectedItem =
        selectedIndex !== null ? displayItems[selectedIndex] : null;

    return (
        <>
            <VisualBlockFrame
                title={normalizeVisualText('Fórmula')}
                typeLabel={normalizeVisualText('Fórmula')}
                hint="Toca cada parte para entender qué significa."
            >
                <div className="flex items-center justify-center gap-2 flex-wrap py-2">
                    {displayItems.map((item, i) => {
                        const displayValue = item.valor || item.nombre;
                        const hasLabel = Boolean(item.valor);

                        return (
                            <React.Fragment key={`${item.raw}-${i}`}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIndex(i)}
                                    className="flex flex-col items-center gap-1 text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 rounded-xl"
                                    aria-label={`Abrir detalle de la parte ${i + 1}: ${displayValue}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm border ${i === 0
                                            ? `${theme.nodeMain} ${theme.nodeMainText} border-transparent`
                                            : `${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`
                                            }`}
                                    >
                                        {displayValue}
                                    </div>

                                    {hasLabel ? (
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wide ${theme.label}`}
                                        >
                                            {item.nombre}
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wide opacity-80 ${theme.label}`}
                                        >
                                            Toca para explorar
                                        </span>
                                    )}
                                </button>

                                {i < displayItems.length - 1 && (
                                    <span className={`text-xl font-black ${theme.label} flex-shrink-0`}>
                                        +
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </VisualBlockFrame>

            <VisualInfoModal
                open={selectedIndex !== null}
                onClose={() => setSelectedIndex(null)}
                title={selectedItem?.valor || selectedItem?.nombre || 'Parte de la fórmula'}
                description={
                    selectedItem
                        ? selectedItem.explicacion ||
                        (selectedItem.valor
                            ? `${selectedItem.nombre} corresponde a ${selectedItem.valor}.`
                            : `${selectedItem.nombre} es una parte importante de la fórmula.`)
                        : ''
                }
                extra={
                    selectedItem ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedItem.nombre && (
                                <div className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                                    {selectedItem.nombre}
                                </div>
                            )}
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

export default FormulaVisual;