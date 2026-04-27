import React, { useState } from 'react';
import type { EjemploLeccion } from '../../types';
import { Volume2, Trophy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti'; // Asegúrate de instalarlo: npm install canvas-confetti

type ExampleCardProps = {
    ejemplo: EjemploLeccion;
    index: number;
    onNarrar?: (id: string, texto: string) => void;
    seccionActiva?: string | null;
};

export default function ExampleCard({ ejemplo, onNarrar, seccionActiva }: ExampleCardProps) {
    const [completada, setCompletada] = useState(false);

    const handleFinalizarMision = () => {
        setCompletada(true);
        // Efecto de confeti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5b40d6', '#3d8a1a', '#ffb000']
        });

        if (onNarrar) {
            onNarrar('victoria', '¡Felicidades! Has completado la misión con éxito. ¡Eres un gran explorador!');
        }
    };

    const handleNarrarPaso = (idx: number, paso: any) => {
        if (!onNarrar) return;
        const texto = [
            `Paso ${idx + 1}. ${paso.accionPrincipal}.`,
            paso.exploracionConcreta?.aplica
                ? `Preparación física: Necesitarás ${paso.exploracionConcreta.materiales.join(', ')}. Instrucciones: ${paso.exploracionConcreta.instrucciones.join('. ')}`
                : '',
            paso.exploracionConcreta?.conclusion || paso.resultadoParcial || ''
        ].join(' ');
        onNarrar(`ejemplo-paso-${idx}`, texto);
    };

    return (
        <div className={`rounded-3xl border-2 transition-all duration-500 ${completada ? 'border-green-400 bg-green-50/20' : 'border-slate-100 bg-white'} p-5 shadow-sm space-y-6`}>

            {/* Enunciado con botón de audio */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                <p className="text-sm font-bold text-slate-700 leading-relaxed italic pr-10">
                    "{ejemplo.enunciado}"
                </p>
                <button
                    onClick={() => onNarrar?.('enunciado', ejemplo.enunciado)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#5b40d6]"
                >
                    <Volume2 size={18} />
                </button>
            </div>

            {/* Pasos de la Misión */}
            <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {ejemplo.pasosGuiados?.map((paso, idx) => (
                    <div key={idx} className="relative pl-10">
                        <span className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ring-4 ring-white transition-colors ${completada ? 'bg-green-500 text-white' : 'bg-[#5b40d6] text-white'}`}>
                            {completada ? <CheckCircle2 size={16} /> : idx + 1}
                        </span>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-black text-slate-800 text-md leading-tight">{paso.accionPrincipal}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{paso.explicacion}</p>
                                </div>
                                <button
                                    onClick={() => handleNarrarPaso(idx, paso)}
                                    className={`p-2 rounded-xl border-2 transition-all ${seccionActiva === `ejemplo-paso-${idx}` ? 'bg-[#5b40d6] text-white' : 'bg-white text-slate-400'}`}
                                >
                                    <Volume2 size={18} />
                                </button>
                            </div>

                            {/* Exploración Concreta */}
                            {paso.exploracionConcreta?.aplica && (
                                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-amber-100/50 px-4 py-2 flex items-center gap-2 border-b border-amber-100">
                                        <span className="text-sm">🎒</span>
                                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Mundo Físico</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {paso.exploracionConcreta.materiales?.map((mat, midx) => (
                                                <span key={midx} className="bg-white px-2 py-1 rounded-lg text-[10px] font-black border border-amber-200 text-amber-700">{mat}</span>
                                            ))}
                                        </div>
                                        <ul className="space-y-2">
                                            {paso.exploracionConcreta.instrucciones?.map((ins, iidx) => (
                                                <li key={iidx} className="flex items-start gap-2 text-[13px] font-bold text-slate-700">
                                                    <div className="w-5 h-5 rounded bg-white border border-amber-200 mt-0.5" />
                                                    {ins}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Positivo */}
                            {(paso.exploracionConcreta?.conclusion || paso.resultadoParcial) && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 p-2 px-3 rounded-xl border border-green-100 inline-flex">
                                    <span className="text-xs">✨</span>
                                    <p className="text-[11px] font-black uppercase tracking-tight">{paso.exploracionConcreta?.conclusion || paso.resultadoParcial}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* BOTÓN FINAL DE VICTORIA */}
            {!completada ? (
                <button
                    onClick={handleFinalizarMision}
                    className="w-full py-4 bg-[#5b40d6] hover:bg-[#4a32b5] text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <Trophy size={24} />
                    ¡TERMINÉ MI MISIÓN!
                </button>
            ) : (
                <div className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 animate-fade-in">
                    <Trophy size={24} className="animate-bounce" />
                    ¡MISIÓN COMPLETADA! 🌟
                </div>
            )}
        </div>
    );
}
