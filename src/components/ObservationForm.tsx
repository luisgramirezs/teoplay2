// src/components/ObservationForm.tsx
import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, ClipboardList } from 'lucide-react';
import { crearObservacion, ActorRole, DimensionKey, Relevancia } from '@/lib/observationsService';
import { TipoUsuario } from '@/components/OnboardingWizard';

interface ObservationFormProps {
    studentId: string;
    userId: string;
    rolUsuario: TipoUsuario;
    onClose: () => void;
}

const DIMENSION_LABELS: Record<DimensionKey, string> = {
    aprendizajeYDesempeno: 'Aprendizaje y desempeño',
    comunicacionSocial: 'Comunicación social',
    regulacionEmocional: 'Regulación emocional',
    autonomiaCotidiana: 'Autonomía cotidiana',
    saludDesarrollo: 'Salud y desarrollo',
    interesesFortalezas: 'Intereses y fortalezas',
};

const DIMENSION_OPTIONS: DimensionKey[] = [
    'aprendizajeYDesempeno',
    'comunicacionSocial',
    'regulacionEmocional',
    'autonomiaCotidiana',
    'saludDesarrollo',
    'interesesFortalezas',
];

const RELEVANCIA_OPTIONS: Relevancia[] = ['alta', 'media', 'baja'];
const RELEVANCIA_LABELS: Record<Relevancia, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };

// El servicio de observaciones no conoce 'padre': mismo mapeo usado en la prueba temporal.
function toActorRole(rol: TipoUsuario): ActorRole {
    return rol === 'padre' ? 'familia' : rol;
}

function todayInputValue(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const ObservationForm: React.FC<ObservationFormProps> = ({ studentId, userId, rolUsuario, onClose }) => {
    const [fecha, setFecha] = useState(todayInputValue());
    const [relevancia, setRelevancia] = useState<Relevancia>('media');
    const [dimensionSugerida, setDimensionSugerida] = useState<DimensionKey | null>(null);
    const [freeText, setFreeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
    const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';

    const handleGuardar = async () => {
        if (!freeText.trim()) {
            setError('Por favor describe la observación.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await crearObservacion(
                studentId,
                userId,
                toActorRole(rolUsuario),
                relevancia,
                dimensionSugerida,
                new Date(fecha).getTime(),
                freeText.trim()
            );
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        <h2 className="font-black text-foreground text-lg">Ficha de retroalimentación</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {!success ? (
                    <>
                        <div className="p-6 space-y-4">
                            {/* Fecha */}
                            <div>
                                <label className={labelClass}>Fecha</label>
                                <input type="date" className={inputClass} value={fecha}
                                    onChange={e => setFecha(e.target.value)} />
                            </div>

                            {/* Relevancia */}
                            <div>
                                <label className={labelClass}>Relevancia</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {RELEVANCIA_OPTIONS.map(r => (
                                        <button key={r} type="button"
                                            onClick={() => setRelevancia(r)}
                                            className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition-all cursor-pointer ${
                                                relevancia === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                            }`}>
                                            {RELEVANCIA_LABELS[r]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dimensión sugerida */}
                            <div>
                                <label className={labelClass}>Dimensión sugerida (opcional)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DIMENSION_OPTIONS.map(dim => (
                                        <button key={dim} type="button"
                                            onClick={() => setDimensionSugerida(dim)}
                                            className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                                                dimensionSugerida === dim ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                            }`}>
                                            {DIMENSION_LABELS[dim]}
                                        </button>
                                    ))}
                                    <button type="button"
                                        onClick={() => setDimensionSugerida(null)}
                                        className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer col-span-2 ${
                                            dimensionSugerida === null ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                        }`}>
                                        No estoy seguro/a
                                    </button>
                                </div>
                            </div>

                            {/* Texto libre */}
                            <div>
                                <label className={labelClass}>Observación *</label>
                                <textarea
                                    className={`${inputClass} resize-none`}
                                    rows={5}
                                    placeholder="Describe lo que observaste..."
                                    value={freeText}
                                    onChange={e => setFreeText(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-destructive font-bold text-center">{error}</p>
                            )}
                        </div>

                        <div className="px-6 pb-6">
                            <button
                                onClick={handleGuardar}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-pulse" />
                                        Clasificando observación...
                                    </>
                                ) : (
                                    'Guardar observación'
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 space-y-4 text-center">
                        <CheckCircle className="w-12 h-12 text-teo-green mx-auto" />
                        <p className="font-black text-foreground text-base">¡Observación guardada!</p>
                        <p className="text-sm text-muted-foreground font-semibold">
                            Gracias por tu retroalimentación. Ayudará a enriquecer el perfil del estudiante.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border-2 border-border font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ObservationForm;
