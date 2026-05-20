import React from 'react';
import type { ExplicacionBloque } from '@/types';

interface Props {
    bloque: ExplicacionBloque;
    condicion: string;
    idioma: string;
    fontSize: string;
}

export default function SeccionIntro({ bloque, fontSize }: Props) {
    const introFrase = typeof bloque.intro === 'string' ? bloque.intro : bloque.intro?.fraseEnganche || '';
    const introCuerpo = typeof bloque.intro !== 'string' ? bloque.intro?.cuerpo : '';
    const introAncla = typeof bloque.intro !== 'string' ? bloque.intro?.ejemploAncla : '';

    return (
        <div className="space-y-5">
            {introFrase && (
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{introFrase}</h2>
            )}
            {introAncla && (
                <div className="rounded-2xl bg-[#EFF6FF] border border-blue-100 px-4 py-3">
                    <p className="text-sm font-bold text-blue-700 italic">{introAncla}</p>
                </div>
            )}
            {introCuerpo && (
                <p className="text-[15px] leading-7 text-slate-700 font-medium" style={{ fontSize }}>{introCuerpo}</p>
            )}
            {bloque.resumen && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-wide mb-1">💡 ¿Sabías que?</p>
                    <p className="text-sm font-semibold text-slate-700">{bloque.resumen}</p>
                </div>
            )}
            {bloque.chequeoCobertura?.length > 0 && (
                <div className="rounded-2xl bg-[#F3EFFE] border border-purple-100 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span>🎯</span>
                        <p className="text-[10px] font-black text-purple-700 uppercase tracking-wide">Meta de hoy</p>
                    </div>
                    <div className="space-y-1.5">
                        {bloque.chequeoCobertura.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-[#0E9E8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0E9E8A]" />
                                </div>
                                <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}