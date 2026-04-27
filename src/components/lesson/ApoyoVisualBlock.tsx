import React from 'react';
import type { ApoyoVisualLeccion } from '@/types';

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

// ── Tipo: FORMULA ─────────────────────────────────────────────────────────────
const DiagramaFormula: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => (
    <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {elementos.map((el, i) => {
            const partes = el.split(':');
            const nombre = partes[0]?.trim();
            const valor = partes[1]?.trim();
            return (
                <React.Fragment key={i}>
                    <div className={`flex flex-col items-center gap-1`}>
                        <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm border ${
                            i === 0
                                ? `${theme.nodeMain} ${theme.nodeMainText} border-transparent`
                                : `${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`
                        }`}>
                            {valor || nombre}
                        </div>
                        {valor && (
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${theme.label}`}>
                                {nombre}
                            </span>
                        )}
                    </div>
                    {i < elementos.length - 1 && (
                        <span className={`text-xl font-black ${theme.label} flex-shrink-0`}>+</span>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Tipo: FLUJO ───────────────────────────────────────────────────────────────
const DiagramaFlujo: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
        {elementos.map((el, i) => (
            <React.Fragment key={i}>
                <div className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-center shadow-sm ${
                    i === 0
                        ? `${theme.nodeMain} ${theme.nodeMainText} border-transparent`
                        : `${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`
                }`}>
                    {el}
                </div>
                {i < elementos.length - 1 && (
                    <div className="flex flex-col items-center gap-0.5">
                        <div className={`w-0.5 h-3 ${theme.connector}`} />
                        <svg width="14" height="8" viewBox="0 0 14 8" className={`${theme.label} fill-current opacity-60`}>
                            <path d="M7 8L0 0h14z" />
                        </svg>
                    </div>
                )}
            </React.Fragment>
        ))}
    </div>
);

// ── Tipo: NODOS ───────────────────────────────────────────────────────────────
const DiagramaNodos: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => {
    const [central, ...hijos] = elementos;
    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* Nodo central */}
            <div className={`px-5 py-2.5 rounded-2xl font-black text-sm shadow-sm ${theme.nodeMain} ${theme.nodeMainText}`}>
                {central}
            </div>
            {/* Línea conectora */}
            {hijos.length > 0 && (
                <div className={`w-0.5 h-3 ${theme.connector}`} />
            )}
            {/* Nodos hijo */}
            <div className="flex flex-wrap justify-center gap-2">
                {hijos.map((h, i) => (
                    <div key={i} className={`px-3 py-2 rounded-xl border-2 text-xs font-bold shadow-sm ${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`}>
                        {h}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Tipo: LÍNEA DE TIEMPO ─────────────────────────────────────────────────────
const DiagramaLineaTiempo: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
        {elementos.map((el, i) => {
            const partes = el.split(':');
            const fecha = partes[0]?.trim();
            const evento = partes.slice(1).join(':').trim();
            return (
                <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${theme.nodeMain} ${theme.nodeMainText}`}>
                            {i + 1}
                        </div>
                        {i < elementos.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 ${theme.connector}`} />
                        )}
                    </div>
                    <div className={`flex-1 rounded-xl border px-3 py-2 shadow-sm ${theme.nodeSec} ${theme.border}`}>
                        {fecha && evento ? (
                            <>
                                <span className={`text-[10px] font-black uppercase tracking-wide block ${theme.label}`}>{fecha}</span>
                                <span className={`text-xs font-bold ${theme.nodeSecText}`}>{evento}</span>
                            </>
                        ) : (
                            <span className={`text-xs font-bold ${theme.nodeSecText}`}>{el}</span>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

// ── Tipo: CICLO ───────────────────────────────────────────────────────────────
const DiagramaCiclo: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => (
    <div className="flex flex-wrap justify-center gap-2 w-full">
        {elementos.map((el, i) => (
            <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${theme.nodeMain} ${theme.nodeMainText}`}>
                        {i + 1}
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${theme.nodeSec} ${theme.nodeSecText} ${theme.border}`}>
                        {el}
                    </div>
                </div>
                {i < elementos.length - 1 && (
                    <span className={`text-sm font-black ${theme.label} self-center`}>→</span>
                )}
                {i === elementos.length - 1 && (
                    <span className={`text-sm font-black ${theme.label} self-center`}>↩</span>
                )}
            </React.Fragment>
        ))}
    </div>
);

// ── Tipo: REPARTO ─────────────────────────────────────────────────────────────
const DiagramaReparto: React.FC<{ elementos: string[]; theme: typeof defaultTheme }> = ({ elementos, theme }) => {
    const total = parseInt(elementos[0]) || 12;
    const grupos = parseInt(elementos[1]) || 4;
    const porGrupo = parseInt(elementos[2]) || Math.floor(total / grupos);
    const safeTotal = Math.min(total, 40);
    const safeGrupos = Math.min(grupos, 8);

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Total */}
            <div className="flex flex-wrap justify-center gap-1 max-w-[240px]">
                {[...Array(safeTotal)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full shadow-sm ${theme.nodeMain}`} />
                ))}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-wide ${theme.label}`}>
                ÷ {grupos} grupos iguales
            </div>
            {/* Grupos */}
            <div className="flex flex-wrap justify-center gap-3">
                {[...Array(safeGrupos)].map((_, i) => (
                    <div key={i} className={`border-2 rounded-xl p-2 flex flex-col items-center gap-1 shadow-sm ${theme.nodeSec} ${theme.border}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-[48px]">
                            {[...Array(Math.min(porGrupo, 10))].map((_, j) => (
                                <div key={j} className={`w-2.5 h-2.5 rounded-full ${theme.nodeMain} opacity-80`} />
                            ))}
                        </div>
                        <span className={`text-[9px] font-black uppercase ${theme.label}`}>
                            Grupo {i + 1}
                        </span>
                    </div>
                ))}
            </div>
            <div className={`text-xs font-black ${theme.label}`}>
                {porGrupo} por grupo
            </div>
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const ApoyoVisualBlock: React.FC<ApoyoVisualBlockProps> = ({ apoyoVisual }) => {
    if (!apoyoVisual || !apoyoVisual.tipo || !apoyoVisual.elementos?.length) return null;

    const theme = asignaturaTheme[apoyoVisual.asignatura] ?? defaultTheme;

    const renderDiagrama = () => {
        switch (apoyoVisual.tipo) {
            case 'formula':
                return <DiagramaFormula elementos={apoyoVisual.elementos} theme={theme} />;
            case 'flujo':
                return <DiagramaFlujo elementos={apoyoVisual.elementos} theme={theme} />;
            case 'nodos':
                return <DiagramaNodos elementos={apoyoVisual.elementos} theme={theme} />;
            case 'linea_tiempo':
                return <DiagramaLineaTiempo elementos={apoyoVisual.elementos} theme={theme} />;
            case 'ciclo':
                return <DiagramaCiclo elementos={apoyoVisual.elementos} theme={theme} />;
            case 'reparto':
                return <DiagramaReparto elementos={apoyoVisual.elementos} theme={theme} />;
            default:
                return null;
        }
    };

    const diagrama = renderDiagrama();
    if (!diagrama) return null;

    return (
        <div className={`rounded-2xl border-2 ${theme.bg} ${theme.border} overflow-hidden shadow-sm`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b ${theme.border} flex items-center gap-2`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.badgeText}`}>
                    📊 {apoyoVisual.titulo || 'Apoyo visual'}
                </span>
            </div>
            {/* Diagrama */}
            <div className="px-4 py-5">
                {diagrama}
            </div>
        </div>
    );
};

export default ApoyoVisualBlock;
