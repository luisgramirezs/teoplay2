import React from 'react';
import type { ExplicacionBloque } from '@/types';

interface Pertinencia { importancia: string; utilidadVida: string; mundoReal: string; }

interface Props {
    pertinencia: Pertinencia | null;
    bloque: ExplicacionBloque;
}

export default function SeccionResumen({ pertinencia, bloque }: Props) {
    return (
        <div className="space-y-4">
            {bloque.resumen && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1">📋 Resumen</p>
                    <p className="text-sm font-semibold text-slate-700">{bloque.resumen}</p>
                </div>
            )}
            {pertinencia && (
                <div className="space-y-3">
                    {[
                        { emoji: '🌟', titulo: '¿Por qué es importante?', texto: pertinencia.importancia, bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-800' },
                        { emoji: '🎯', titulo: '¿Para qué me sirve?', texto: pertinencia.utilidadVida, bg: 'bg-teal-50', border: 'border-teal-200', color: 'text-teal-800' },
                        { emoji: '🌍', titulo: '¿Dónde lo veo?', texto: pertinencia.mundoReal, bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-800' },
                    ].map((caja, i) => (
                        <div key={i} className={`rounded-2xl border-2 ${caja.border} ${caja.bg} p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{caja.emoji}</span>
                                <p className={`text-[11px] font-black uppercase tracking-wide ${caja.color}`}>{caja.titulo}</p>
                            </div>
                            <p className={`text-sm font-semibold leading-relaxed ${caja.color}`}>{caja.texto}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}