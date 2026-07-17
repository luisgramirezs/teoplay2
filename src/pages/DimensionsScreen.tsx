// src/pages/DimensionsScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, User, Pencil, X, CheckCircle, PlusCircle, BarChart2,
    UserPlus, Copy, Check, ClipboardList, Wand2, Target, Zap, KeyRound, ChevronRight,
} from 'lucide-react';
import {
    PerfilPersistente, Condicion, CONDICIONES, GRADOS, EMOCIONES, PERFIL_ACTIVO_KEY,
} from '@/types';
import { PerfilCompleto, TipoUsuario } from '@/components/OnboardingWizard';
import { actualizarPerfilNeuroeducativo, getStudentsLinkedToUser } from '@/lib/studentsService';
import { crearInvitacion, canjearInvitacion } from '@/lib/studentLinksService';
import ObservationForm from '@/components/ObservationForm';
import { DimensionKey } from '@/lib/observationsService';
import { calcularPerfilDimensiones, getPerfilDimensiones, NeuroeducationalProfile } from '@/lib/dimensionsService';
import { getSessionsByStudent } from '@/lib/sessionsService';
import { getDashboardMetrics } from '@/lib/dashboardMetrics';
import DimensionCard from '@/components/dimensions/DimensionCard';

const DIMENSION_KEYS: DimensionKey[] = [
    'aprendizajeYDesempeno',
    'comunicacionSocial',
    'regulacionEmocional',
    'autonomiaCotidiana',
    'saludDesarrollo',
    'interesesFortalezas',
];

interface DimensionsScreenProps {
    perfiles: PerfilCompleto[];
    onPerfilesChange: (perfiles: PerfilCompleto[]) => void;
    userId: string;
    rolUsuario: TipoUsuario;
    onAgregarNino: () => void;
    onFlexibilizarClase: () => void;
}

// ── Edit Profile Modal (movido desde ConfigScreen.tsx) ───────────────────────
const EditProfileModal: React.FC<{
    perfil: PerfilCompleto;
    onSave: (p: PerfilCompleto) => void;
    onClose: () => void;
}> = ({ perfil, onSave, onClose }) => {
    const [draft, setDraft] = useState<PerfilPersistente>({
        nombre: perfil.nombre,
        edad: perfil.edad,
        grado: perfil.grado,
        condicion: perfil.condicion,
    });

    const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
    const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="font-black text-foreground text-lg">Editar perfil</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className={labelClass}>Nombre</label>
                        <input type="text" className={inputClass} value={draft.nombre}
                            onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))} />
                    </div>
                    <div>
                        <label className={labelClass}>Edad: <span className="text-primary font-black">{draft.edad} años</span></label>
                        <input type="range" min={5} max={15} value={draft.edad}
                            onChange={e => setDraft(d => ({ ...d, edad: Number(e.target.value) }))}
                            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary mt-2" />
                    </div>
                    <div>
                        <label className={labelClass}>Grado escolar</label>
                        <select className={inputClass} value={draft.grado}
                            onChange={e => setDraft(d => ({ ...d, grado: e.target.value }))}>
                            {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Condición principal</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(CONDICIONES) as [Condicion, typeof CONDICIONES[Condicion]][]).map(([key, val]) => (
                                <button key={key} type="button"
                                    onClick={() => setDraft(d => ({ ...d, condicion: key }))}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${draft.condicion === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                                    <div className={`font-bold text-sm ${draft.condicion === key ? 'text-primary' : 'text-foreground'}`}>{val.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{val.descripcion}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onSave({ ...perfil, ...draft }); onClose(); }}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-black transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer">
                        <CheckCircle className="w-4 h-4" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Invite Specialist Modal (movido desde ConfigScreen.tsx) ──────────────────
const InviteSpecialistModal: React.FC<{
    studentId: string;
    userId: string;
    onClose: () => void;
}> = ({ studentId, userId, onClose }) => {
    const [rol, setRol] = useState<'docente' | 'terapeuta'>('docente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codigo, setCodigo] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);
    const copiadoTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Limpiar el timeout pendiente si el modal se desmonta antes de los 2s
    React.useEffect(() => {
        return () => {
            if (copiadoTimeoutRef.current) clearTimeout(copiadoTimeoutRef.current);
        };
    }, []);

    const handleGenerar = async () => {
        setError(null);
        setLoading(true);
        try {
            const nuevoCodigo = await crearInvitacion(studentId, userId, rol);
            setCodigo(nuevoCodigo);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopiar = async () => {
        if (!codigo) return;
        await navigator.clipboard.writeText(codigo);
        setCopiado(true);
        if (copiadoTimeoutRef.current) clearTimeout(copiadoTimeoutRef.current);
        copiadoTimeoutRef.current = setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        <h2 className="font-black text-foreground text-lg">Invitar especialista</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!codigo ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-foreground/80 mb-2">Rol del especialista</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['docente', 'terapeuta'] as const).map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRol(r)}
                                            className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition-all cursor-pointer ${
                                                rol === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                            }`}
                                        >
                                            {r === 'docente' ? 'Docente' : 'Terapeuta'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-destructive font-bold text-center">{error}</p>
                            )}

                            <button
                                onClick={handleGenerar}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md"
                            >
                                {loading ? <Sparkles className="w-5 h-5 animate-pulse" /> : 'Generar invitación'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-center py-2">
                                <p className="text-sm text-muted-foreground font-semibold mb-2">Código generado</p>
                                <p className="text-3xl font-black text-primary tracking-wider">{codigo}</p>
                            </div>

                            <button
                                onClick={handleCopiar}
                                className="w-full flex items-center justify-center gap-2 border-2 border-primary/40 text-primary font-black py-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                                {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copiado ? '¡Copiado!' : 'Copiar código'}
                            </button>

                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                Comparte este código con el especialista por WhatsApp o correo. Es de un solo uso.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Canjear Código Modal (docente/terapeuta con niños ya vinculados) ─────────
const CanjearCodigoModal: React.FC<{
    userId: string;
    onSuccess: (perfiles: PerfilCompleto[]) => void;
    onClose: () => void;
}> = ({ userId, onSuccess, onClose }) => {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
    const labelClass = 'block text-sm font-bold text-foreground/80 mb-1';

    const handleValidar = async () => {
        setError(null);
        if (!codigo.trim()) { setError('Ingresa el código de invitación.'); return; }

        setLoading(true);
        try {
            await canjearInvitacion(codigo.trim(), userId);
            const perfiles = await getStudentsLinkedToUser(userId);
            onSuccess(perfiles);
            onClose();
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
                        <KeyRound className="w-5 h-5 text-primary" />
                        <h2 className="font-black text-foreground text-lg">Código de invitación</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground font-semibold">
                        Ingresa el código que te compartió la familia para vincularte a otro niño(a).
                    </p>

                    <div>
                        <label className={labelClass}>Código</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={codigo}
                                onChange={e => setCodigo(e.target.value.toUpperCase())}
                                placeholder="TEO-XXXX-YYYY"
                                className={`${inputClass} pl-9 uppercase`}
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-destructive font-bold mt-2">{error}</p>
                        )}
                    </div>

                    <button
                        onClick={handleValidar}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md"
                    >
                        {loading ? (
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        ) : (
                            <>
                                Validar código
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Indicador simple del panel lateral ────────────────────────────────────────
function IndicatorTile({ icon, label, value, valueClass = 'text-foreground' }: {
    icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground truncate">{label}</p>
                <p className={`text-sm font-black truncate ${valueClass}`}>{value}</p>
            </div>
        </div>
    );
}

// ── Main DimensionsScreen ─────────────────────────────────────────────────────
const DimensionsScreen: React.FC<DimensionsScreenProps> = ({
    perfiles,
    onPerfilesChange,
    userId,
    rolUsuario,
    onAgregarNino,
    onFlexibilizarClase,
}) => {
    const navigate = useNavigate();

    // Perfil activo: mismo patrón que ConfigScreen — localStorage primero, si no el primero de la lista.
    const [perfilActivo, setPerfilActivo] = useState<PerfilCompleto | null>(() => {
        const id = localStorage.getItem(PERFIL_ACTIVO_KEY);
        return perfiles.find(p => p.id === id) || perfiles[0] || null;
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showObservationModal, setShowObservationModal] = useState(false);
    const [showCanjearModal, setShowCanjearModal] = useState(false);

    const [perfilDimensiones, setPerfilDimensiones] = useState<NeuroeducationalProfile | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [sesiones, setSesiones] = useState<any[]>([]);
    const [loadingPerfil, setLoadingPerfil] = useState(true);

    // Sincronizar perfilActivo cuando llegan nuevos perfiles desde Firestore
    useEffect(() => {
        if (!perfilActivo && perfiles.length > 0) {
            setPerfilActivo(perfiles[0]);
        }
        // Si el perfil activo ya existe en la lista actualizada, refrescarlo
        if (perfilActivo) {
            const actualizado = perfiles.find(p => p.id === perfilActivo.id);
            if (actualizado) setPerfilActivo(actualizado);
        }
    }, [perfiles]);

    // Al entrar (o cambiar de niño activo): recalcular el perfil de dimensiones
    // con la evidencia nueva y cargar el resultado + sesiones para el panel lateral.
    useEffect(() => {
        const studentId = perfilActivo?.id;
        if (!studentId) { setLoadingPerfil(false); return; }

        let cancelled = false;
        setLoadingPerfil(true);

        (async () => {
            await calcularPerfilDimensiones(studentId);
            const [perfil, sesionesData] = await Promise.all([
                getPerfilDimensiones(studentId),
                getSessionsByStudent(studentId),
            ]);
            if (cancelled) return;
            setPerfilDimensiones(perfil);
            setSesiones(sesionesData);
            setLoadingPerfil(false);
        })();

        return () => { cancelled = true; };
    }, [perfilActivo?.id]);

    const metrics = useMemo(() => getDashboardMetrics(sesiones), [sesiones]);
    const emocionPredominante = EMOCIONES.find(e => e.valor === Math.round(metrics.promedioEmocionalFin));

    const recomendaciones = useMemo(() => {
        if (!perfilDimensiones) return [];
        return DIMENSION_KEYS
            .map(key => perfilDimensiones.dimensions[key]?.baseRecommendation)
            .filter((r): r is string => Boolean(r));
    }, [perfilDimensiones]);

    const nivelColor =
        metrics.nivelAprendizaje === 'Alto' ? 'text-teo-green'
        : metrics.nivelAprendizaje === 'Medio' ? 'text-teo-yellow'
        : metrics.nivelAprendizaje === 'Bajo' ? 'text-teo-red'
        : 'text-muted-foreground';

    const handleSeleccionarPerfil = (id: string) => {
        const p = perfiles.find(p => p.id === id) || null;
        setPerfilActivo(p);
        if (id) localStorage.setItem(PERFIL_ACTIVO_KEY, id);
    };

    const handleGuardarEdicion = async (perfilEditado: PerfilCompleto) => {
        const nuevos = perfiles.map(p => p.id === perfilEditado.id ? perfilEditado : p);
        onPerfilesChange(nuevos);
        setPerfilActivo(perfilEditado);

        // Si tiene perfil neuroeducativo, actualizar también en Firestore
        if (perfilEditado.perfilNeuroeducativo) {
            try {
                await actualizarPerfilNeuroeducativo(
                    perfilEditado.id,
                    perfilEditado.perfilNeuroeducativo,
                    Date.now()
                );
            } catch (e) {
                console.error('Error actualizando perfil en Firestore:', e);
            }
        }
    };

    const actionButtonClass = 'flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border text-xs font-black text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer';

    if (!perfilActivo) return null;

    return (
        <div className="min-h-screen bg-background font-child">

            {/* Header */}
            <section className="bg-white border-b border-border">
                <div className="max-w-5xl mx-auto px-4 pt-4 pb-3">
                    <div className="flex flex-col items-start">
                        <img src="/logo.png" alt="TEOplay" className="h-[180px] object-contain block" />
                        <h1 className="font-[Fredoka] text-3xl text-orange-600 font-black">
                            Perfil neuroeducativo
                        </h1>
                    </div>
                </div>
            </section>

            {/* Info banner */}
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-3 text-sm text-primary/80">
                    <span className="text-lg">💡</span>
                    <span className="font-[Fredoka]">
                        Este perfil se actualiza automáticamente con cada nueva sesión y observación registrada.
                    </span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* Niño activo + barra de acciones */}
                <section className="bg-white rounded-2xl border-2 border-primary/20 shadow-sm overflow-hidden">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="font-black text-foreground text-base flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Niño/a activo
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                {rolUsuario === 'padre' && (
                                    <button type="button" onClick={onAgregarNino} className={actionButtonClass}>
                                        <PlusCircle className="w-4 h-4" />
                                        Agregar niño
                                    </button>
                                )}
                                <button type="button" onClick={() => navigate('/dashboard')} className={actionButtonClass}>
                                    <BarChart2 className="w-4 h-4" />
                                    Tablero
                                </button>
                                {(rolUsuario === 'docente' || rolUsuario === 'terapeuta') && (
                                    <button type="button" onClick={() => setShowCanjearModal(true)} className={actionButtonClass}>
                                        <KeyRound className="w-4 h-4" />
                                        Tengo un código
                                    </button>
                                )}
                                {rolUsuario === 'padre' && (
                                    <button type="button" onClick={() => setShowEditModal(true)} className={actionButtonClass}>
                                        <Pencil className="w-4 h-4" />
                                        Editar
                                    </button>
                                )}
                                <button type="button" onClick={() => setShowObservationModal(true)} className={actionButtonClass}>
                                    <ClipboardList className="w-4 h-4" />
                                    Ficha de retroalimentación
                                </button>
                                {rolUsuario === 'padre' && (
                                    <button type="button" onClick={() => setShowInviteModal(true)} className={actionButtonClass}>
                                        <UserPlus className="w-4 h-4" />
                                        Invitar especialista
                                    </button>
                                )}
                                {rolUsuario !== 'terapeuta' && (
                                    <button
                                        type="button"
                                        onClick={onFlexibilizarClase}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        Flexibilizar clase
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de perfiles si hay más de uno */}
                        {perfiles.length > 1 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                {perfiles.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSeleccionarPerfil(p.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${perfilActivo.id === p.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/40'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${perfilActivo.id === p.id ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
                                            {p.nombre ? p.nombre.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className={`font-black text-xs truncate ${perfilActivo.id === p.id ? 'text-primary' : 'text-foreground'}`}>
                                                {p.nombre || 'Sin nombre'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{CONDICIONES[p.condicion]?.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Perfil activo */}
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary flex-shrink-0">
                                {perfilActivo.nombre ? perfilActivo.nombre.charAt(0).toUpperCase() : '👤'}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-foreground text-sm">
                                    {perfilActivo.nombre || 'Sin nombre'} · {perfilActivo.edad} años
                                </p>
                                <p className="text-xs text-muted-foreground font-semibold">
                                    {perfilActivo.grado} · {CONDICIONES[perfilActivo.condicion]?.label}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dimensiones + panel lateral */}
                {loadingPerfil ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        <p className="text-sm text-muted-foreground font-semibold">Actualizando perfil neuroeducativo…</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {DIMENSION_KEYS.map(key => (
                                <DimensionCard key={key} dimensionKey={key} data={perfilDimensiones?.dimensions[key]} />
                            ))}
                        </div>

                        <aside className="lg:w-80 flex-shrink-0 space-y-4">
                            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-3">
                                <h3 className="font-black text-foreground text-sm mb-1">Panorama general</h3>
                                <IndicatorTile
                                    icon={<Target className="w-4 h-4 text-primary" />}
                                    label="Nivel de comprensión"
                                    value={metrics.nivelAprendizaje}
                                    valueClass={nivelColor}
                                />
                                <IndicatorTile
                                    icon={<span className="text-lg leading-none">{emocionPredominante?.emoji || '😐'}</span>}
                                    label="Emoción predominante"
                                    value={emocionPredominante?.label || 'Sin datos'}
                                />
                                <IndicatorTile
                                    icon={<Zap className="w-4 h-4 text-amber-600" />}
                                    label="Racha actual"
                                    value={`${metrics.rachaActual} día${metrics.rachaActual !== 1 ? 's' : ''}`}
                                    valueClass="text-amber-600"
                                />
                            </div>

                            {recomendaciones.length > 0 && (
                                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-5 space-y-2">
                                    <h3 className="font-black text-foreground text-sm flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Recomendaciones
                                    </h3>
                                    <ul className="space-y-2">
                                        {recomendaciones.map((rec, i) => (
                                            <li key={i} className="text-xs font-semibold text-foreground/80 bg-white rounded-xl px-3 py-2 border border-border">
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>

            {/* Edit modal */}
            {showEditModal && perfilActivo && (
                <EditProfileModal
                    perfil={perfilActivo}
                    onSave={handleGuardarEdicion}
                    onClose={() => setShowEditModal(false)}
                />
            )}
            {/* Invite specialist modal */}
            {showInviteModal && perfilActivo && (
                <InviteSpecialistModal
                    studentId={perfilActivo.id}
                    userId={userId}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
            {/* Observation form modal (también cubre "Subir informe": ya soporta adjuntar PDF) */}
            {showObservationModal && perfilActivo && (
                <ObservationForm
                    studentId={perfilActivo.id}
                    userId={userId}
                    rolUsuario={rolUsuario}
                    onClose={() => setShowObservationModal(false)}
                />
            )}
            {/* Canjear código modal (docente/terapeuta con niños ya vinculados) */}
            {showCanjearModal && (
                <CanjearCodigoModal
                    userId={userId}
                    onSuccess={onPerfilesChange}
                    onClose={() => setShowCanjearModal(false)}
                />
            )}
        </div>
    );
};

export default DimensionsScreen;
