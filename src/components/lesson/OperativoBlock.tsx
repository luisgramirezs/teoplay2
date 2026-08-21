import React, { useState } from 'react';
import type { ApoyoOperativo } from '@/types';

interface OperativoBlockProps {
    apoyoOperativo: ApoyoOperativo;
    fontSize?: string;
}

const OperativoBlock: React.FC<OperativoBlockProps> = ({ apoyoOperativo, fontSize = '16px' }) => {
    const [seleccion, setSeleccion] = useState<number | null>(null);

    if (!apoyoOperativo.ejemplosResueltos?.length) return null;

    const opcionSeleccionada = seleccion !== null ? apoyoOperativo.ejercicio.opciones[seleccion] : null;

    return (
        <div className="rounded-2xl border-2 border-primary/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/10">
                <span className="text-lg">🧮</span>
                <span className="text-xs font-black uppercase tracking-wide text-foreground">
                    {apoyoOperativo.titulo || 'Vamos a resolverlo juntos'}
                </span>
            </div>

            <div className="p-5 bg-white space-y-5">
                {apoyoOperativo.ejemplosResueltos.map((ejemplo, ei) => (
                    <div key={ei} className="rounded-xl border-2 border-primary/15 p-4 space-y-3 bg-primary/5">
                        <p className="text-xs font-black text-primary uppercase tracking-wide">
                            📘 Ejemplo{apoyoOperativo.ejemplosResueltos.length > 1 ? ` ${ei + 1}` : ''}
                        </p>
                        <p className="font-bold text-foreground" style={{ fontSize }}>
                            {ejemplo.enunciado}
                        </p>
                        <div className="space-y-2.5">
                            {ejemplo.pasos.map((paso, pi) => (
                                <div key={pi} className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center text-xs font-black">
                                        {pi + 1}
                                    </span>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-foreground">{paso.descripcion}</p>
                                        <p className="text-sm font-mono text-muted-foreground">{paso.resultadoParcial}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2 border-t border-primary/10">
                            <p className="text-sm font-black text-teo-green">Resultado: {ejemplo.resultado}</p>
                        </div>
                    </div>
                ))}

                {apoyoOperativo.ejercicio?.enunciado && (
                    <div className="rounded-xl border-2 border-amber-200 p-4 space-y-3 bg-amber-50">
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wide">
                            ✏️ Ahora hazlo tú
                        </p>
                        <p className="font-bold text-foreground" style={{ fontSize }}>
                            {apoyoOperativo.ejercicio.enunciado}
                        </p>
                        <div className="space-y-2">
                            {apoyoOperativo.ejercicio.opciones.map((opcion, oi) => {
                                const esSeleccionada = seleccion === oi;
                                const mostrarComoCorrecta = seleccion !== null && opcion.correcta;
                                const mostrarComoIncorrecta = esSeleccionada && !opcion.correcta;
                                return (
                                    <button
                                        key={oi}
                                        type="button"
                                        onClick={() => setSeleccion(oi)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg border-2 font-semibold transition-colors ${
                                            mostrarComoCorrecta
                                                ? 'border-teo-green bg-teo-green/10 text-teo-green'
                                                : mostrarComoIncorrecta
                                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                                    : 'border-border bg-white text-foreground hover:border-primary/40'
                                        }`}
                                    >
                                        {opcion.texto}
                                    </button>
                                );
                            })}
                        </div>

                        {opcionSeleccionada && (
                            <div
                                className={`p-3 rounded-lg text-sm font-semibold ${
                                    opcionSeleccionada.correcta
                                        ? 'bg-teo-green/10 text-teo-green'
                                        : 'bg-amber-100 text-amber-900'
                                }`}
                            >
                                {opcionSeleccionada.correcta ? '¡Muy bien! ' : 'Revisemos juntos: '}
                                {opcionSeleccionada.explicacion}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperativoBlock;
