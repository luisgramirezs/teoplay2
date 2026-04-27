import type { PasoGuiado } from '../../types';

type ProcedureStepsProps = {
    pasos?: PasoGuiado[];
};

export default function ProcedureSteps({ pasos = [] }: ProcedureStepsProps) {
    if (!pasos.length) return null;

    return (
        <div className="space-y-3">
            {pasos.map((paso, index) => {
                const accion = paso.accionPrincipal ?? paso.accion ?? '';
                const tieneExploracion = paso.exploracionConcreta?.aplica &&
                    (paso.exploracionConcreta.materiales?.length ||
                     paso.exploracionConcreta.instrucciones?.length ||
                     paso.exploracionConcreta.conclusion);

                return (
                    <div key={index} className="flex gap-3">
                        {/* Número del paso */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-sm font-black flex items-center justify-center mt-0.5">
                            {paso.numeroPaso ?? index + 1}
                        </div>

                        <div className="flex-1 space-y-2">
                            {/* Acción principal */}
                            {accion && (
                                <p className="text-[13px] font-bold text-muted-foreground">
                                    {accion}
                                </p>
                            )}

                            {/* Explicación */}
                            {paso.explicacion && (
                                <p className="text-sm text-foreground leading-relaxed">
                                    {paso.explicacion}
                                </p>
                            )}

                            {/* Resultado parcial */}
                            {paso.resultadoParcial && (
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-bold">Resultado:</span>{' '}
                                    {paso.resultadoParcial}
                                </p>
                            )}

                            {/* Vínculo con concepto */}
                            {paso.vinculoConcepto && (
                                <div className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5">
                                    <p className="text-[11px] font-black text-purple-700 uppercase tracking-wide mb-0.5">Conecta con</p>
                                    <p className="text-xs text-purple-800">{paso.vinculoConcepto}</p>
                                </div>
                            )}

                            {/* Exploración concreta */}
                            {tieneExploracion && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm">🫘</span>
                                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-wide">
                                            Actividad con tus manos
                                        </p>
                                    </div>

                                    {!!paso.exploracionConcreta!.materiales?.length && (
                                        <div>
                                            <p className="text-[11px] font-bold text-amber-700 mb-1">Materiales</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {paso.exploracionConcreta!.materiales!.map((m, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800"
                                                    >
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!!paso.exploracionConcreta!.instrucciones?.length && (
                                        <div>
                                            <p className="text-[11px] font-bold text-amber-700 mb-1">Instrucciones</p>
                                            <ol className="space-y-1">
                                                {paso.exploracionConcreta!.instrucciones!.map((inst, i) => (
                                                    <li key={i} className="flex gap-2 text-sm text-amber-900">
                                                        <span className="flex-shrink-0 font-black">{i + 1}.</span>
                                                        {inst}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {paso.exploracionConcreta!.conclusion && (
                                        <p className="text-sm font-semibold text-amber-900 border-t border-amber-200 pt-2 mt-1">
                                            {paso.exploracionConcreta!.conclusion}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
