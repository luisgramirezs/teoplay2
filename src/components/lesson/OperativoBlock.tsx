import React, { useState } from 'react';
import type { ApoyoOperativo } from '@/types';

interface OperativoBlockProps {
    apoyoOperativo: ApoyoOperativo;
    fontSize?: string;
}

const OperativoBlock: React.FC<OperativoBlockProps> = ({ apoyoOperativo, fontSize = '16px' }) => {
    const [seleccion, setSeleccion] = useState<number | null>(null);
    const [mostrarAyuda, setMostrarAyuda] = useState(false);
    const [pasoAyuda, setPasoAyuda] = useState(0);

    if (!apoyoOperativo.ejemplosResueltos?.length) return null;

    const opcionSeleccionada = seleccion !== null ? apoyoOperativo.ejercicio.opciones[seleccion] : null;
    // Pasos guía propios del ejercicio del niño (mismos números de su
    // enunciado, no los del ejemplo), sin resultado parcial — el niño calcula.
    const pasosGuia = apoyoOperativo.ejercicio.pasosGuia ?? [];

    const abrirAyuda = () => {
        setPasoAyuda(0);
        setMostrarAyuda(true);
    };

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
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-black text-amber-800 uppercase tracking-wide">
                                ✏️ Ahora hazlo tú
                            </p>
                            {pasosGuia.length > 0 && (
                                <button
                                    type="button"
                                    onClick={abrirAyuda}
                                    className="text-xs font-black text-primary bg-white border-2 border-primary/30 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors flex-shrink-0"
                                >
                                    🆘 ¿Necesitas ayuda?
                                </button>
                            )}
                        </div>
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
                                className={`p-3 rounded-lg text-sm font-semibold space-y-2 ${
                                    opcionSeleccionada.correcta
                                        ? 'bg-teo-green/10 text-teo-green'
                                        : 'bg-amber-100 text-amber-900'
                                }`}
                            >
                                <p>
                                    {opcionSeleccionada.correcta ? '¡Muy bien! ' : 'Revisemos juntos: '}
                                    {opcionSeleccionada.explicacion}
                                </p>
                                {!opcionSeleccionada.correcta && pasosGuia.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={abrirAyuda}
                                        className="text-xs font-black text-primary underline"
                                    >
                                        Repasemos los pasos otra vez
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {mostrarAyuda && pasosGuia.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
                    onClick={() => setMostrarAyuda(false)}
                >
                    <div
                        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-xs font-black text-primary uppercase tracking-wide">
                            Paso {pasoAyuda + 1} de {pasosGuia.length}
                        </p>
                        <p className="font-bold text-foreground" style={{ fontSize }}>
                            {pasosGuia[pasoAyuda].descripcion}
                        </p>

                        <div className="flex gap-1.5">
                            {pasosGuia.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full ${i <= pasoAyuda ? 'bg-primary' : 'bg-muted'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                            {pasoAyuda > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setPasoAyuda(p => p - 1)}
                                    className="px-4 py-2 rounded-full border-2 border-border font-bold text-sm text-foreground"
                                >
                                    Atrás
                                </button>
                            )}
                            {pasoAyuda < pasosGuia.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setPasoAyuda(p => p + 1)}
                                    className="flex-1 px-4 py-2 rounded-full bg-primary text-white font-bold text-sm"
                                >
                                    Siguiente paso
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setMostrarAyuda(false)}
                                    className="flex-1 px-4 py-2 rounded-full bg-teo-green text-white font-bold text-sm"
                                >
                                    Ya puedo intentarlo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperativoBlock;
