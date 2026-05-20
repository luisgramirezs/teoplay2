import React from 'react';
import type { ExplicacionBloque } from '@/types';
import ExamplesBlock from './ExamplesBlock';
import ApoyoVisualBlock from './ApoyoVisualBlock';

interface ObraVisual { titulo: string; autor: string; descripcion: string; tipo: string; query: string; }

interface Props {
    bloque: ExplicacionBloque;
    obras: ObraVisual[];
    selectedIndex: number | null;
    onSelectObra: (obra: ObraVisual) => void;
    condicion: string;
    asignatura: string;
    tema: string;
}

export default function SeccionVisual({ bloque, obras, selectedIndex, onSelectObra, condicion, asignatura, tema }: Props) {
    return (
        <div className="space-y-5">
            {obras.length > 0 && (
                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-xl">🎨</div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Ejemplos visuales</p>
                            <p className="text-xs font-medium text-slate-500">Haz clic en una obra para verla</p>
                        </div>
                    </div>
                    <ExamplesBlock obras={obras} selectedIndex={selectedIndex} onSelect={onSelectObra} />
                </div>
            )}
            {bloque.apoyoVisual && (
                <div className="mt-4">
                    <ApoyoVisualBlock
                        apoyoVisual={bloque.apoyoVisual}
                        condicion={condicion}
                        asignatura={asignatura}
                        tema={tema}
                    />
                </div>
            )}
        </div>
    );
}