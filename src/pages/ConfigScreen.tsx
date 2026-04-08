// src/pages/ConfigScreen.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, BookOpen, Pencil, X, CheckCircle, PlusCircle, BarChart2 } from 'lucide-react';
import {
    PerfilNino, PerfilPersistente, Condicion, Asignatura, Idioma,
    CONDICIONES, ASIGNATURAS, GRADOS, PERFIL_ACTIVO_KEY,
} from '@/types';
import { PerfilCompleto } from '@/components/OnboardingWizard';
import { actualizarPerfilNeuroeducativo } from '@/lib/studentsService';

interface ConfigScreenProps {
    onGenerate: (perfil: PerfilNino) => void;
    onAgregarNino: () => void;
    // ── Nuevas props: perfiles vienen de Firestore vía Index ──────────────────
    perfiles: PerfilCompleto[];
    onPerfilesChange: (perfiles: PerfilCompleto[]) => void;
    userId: string;
}

// ── Edit Profile Modal ───────────────────────────────────────────────────────
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

// ── Main ConfigScreen ────────────────────────────────────────────────────────
const ConfigScreen: React.FC<ConfigScreenProps> = ({
    onGenerate,
    onAgregarNino,
    perfiles,
    onPerfilesChange,
    userId,
}) => {
    const navigate = useNavigate();

    // Perfil activo: primero intentamos el guardado en localStorage, si no el primero de la lista
    const [perfilActivo, setPerfilActivo] = useState<PerfilCompleto | null>(() => {
        const id = localStorage.getItem(PERFIL_ACTIVO_KEY);
        return perfiles.find(p => p.id === id) || perfiles[0] || null;
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [asignatura, setAsignatura] = useState<Asignatura>('matematicas');
    const [tema, setTema] = useState('');
    const [idioma, setIdioma] = useState<Idioma>('es');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sincronizar perfilActivo cuando llegan nuevos perfiles desde Firestore
    React.useEffect(() => {
        if (!perfilActivo && perfiles.length > 0) {
            setPerfilActivo(perfiles[0]);
        }
        // Si el perfil activo ya existe en la lista actualizada, refrescarlo
        if (perfilActivo) {
            const actualizado = perfiles.find(p => p.id === perfilActivo.id);
            if (actualizado) setPerfilActivo(actualizado);
        }
    }, [perfiles]);

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

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!tema.trim()) errs.tema = 'Por favor ingresa el tema a trabajar.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !perfilActivo) return;
        onGenerate({
            id: perfilActivo.id,
            nombre: perfilActivo.nombre,
            edad: perfilActivo.edad,
            grado: perfilActivo.grado,
            condicion: perfilActivo.condicion,
            interes: 'dinosaurios',
            asignatura,
            tema,
            idioma,
            perfilNeuroeducativo: perfilActivo.perfilNeuroeducativo,
        } as PerfilNino);
    };

    const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
    const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';
    const errorClass = 'text-xs text-destructive mt-1 font-semibold';

    if (!perfilActivo) return null;

    return (
        <div className="min-h-screen bg-background font-child">

            {/* Header */}
            <section className="bg-white border-b border-border">
                <div className="max-w-4xl mx-auto px-4 pt-4 pb-3">
                    <div className="flex flex-col items-start">
                        <img src="/logo.png" alt="TEOplay" className="h-[180px] object-contain block" />
                        <h1 className="font-[Fredoka] text-3xl text-orange-600 font-black">
                            Aprendizaje inclusivo personalizado.
                        </h1>
                    </div>
                </div>
            </section>

            {/* Info banner */}
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-3 text-sm text-primary/80">
                    <span className="text-lg">💡</span>
                    <span className="font-[Fredoka]">
                        Selecciona el niño(a), la asignatura e indica el tema a flexibilizar para generar la lección.
                    </span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Selector de niño */}
                    <section className="bg-white rounded-2xl border-2 border-primary/20 shadow-sm overflow-hidden">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-black text-foreground text-base flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Niño/a activo
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onAgregarNino}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-primary/40 text-xs font-black text-primary hover:bg-primary/5 transition-all cursor-pointer"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Agregar niño
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border text-xs font-black text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
                                    >
                                        <BarChart2 className="w-4 h-4" />
                                        Tablero
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border text-xs font-black text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Editar
                                    </button>
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
                                {perfilActivo.perfilNeuroeducativo && (
                                    <span className="text-xs font-black text-teo-green bg-teo-green/10 px-2 py-1 rounded-lg">
                                        ✓ Perfil IA
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Nueva lección */}
                    <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-accent/8 to-primary/5 border-b border-border flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-accent" />
                            <h2 className="font-black text-foreground text-base">Nueva lección</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Asignatura */}
                            <div>
                                <label className={labelClass}>Asignatura</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(ASIGNATURAS) as [Asignatura, typeof ASIGNATURAS[Asignatura]][]).map(([key, val]) => (
                                        <button key={key} type="button"
                                            onClick={() => setAsignatura(key)}
                                            className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 text-left transition-all text-sm ${asignatura === key
                                                ? 'border-accent bg-accent/10 text-accent font-black'
                                                : 'border-border bg-white text-muted-foreground hover:border-accent/40 font-bold'
                                                }`}>
                                            <span>{val.emoji}</span> {val.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tema */}
                            <div className="flex flex-col">
                                <label className={labelClass}>Tema específico *</label>
                                <textarea
                                    className={`${inputClass} resize-none flex-1 min-h-[120px]`}
                                    placeholder="Ej: Las fracciones simples&#10;El presente perfecto en inglés&#10;El ciclo del agua"
                                    value={tema}
                                    onChange={e => setTema(e.target.value)}
                                    rows={4}
                                />
                                {errors.tema && <p className={errorClass}>{errors.tema}</p>}
                            </div>

                            {/* Idioma */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>Idioma de la sesión</label>
                                <div className="grid grid-cols-2 gap-3 max-w-xs">
                                    {(['es', 'en'] as Idioma[]).map(l => (
                                        <button key={l} type="button"
                                            onClick={() => setIdioma(l)}
                                            className={`py-3 rounded-xl border-2 font-black text-sm transition-all ${idioma === l
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border bg-white text-muted-foreground hover:border-primary/40'
                                                }`}>
                                            {l === 'es' ? '🇨🇱 Español' : '🇺🇸 English'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Callout niño */}
                    <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-teo-yellow/10 to-teo-orange/10 rounded-2xl border border-teo-yellow/30">
                        <span className="text-3xl">🧒</span>
                        <div>
                            <p className="font-black text-foreground text-sm">El niño participa desde el inicio</p>
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed font-semibold">
                                Al comenzar, el niño <strong>expresará cómo se siente</strong> y luego <strong>elegirá su interés favorito</strong>.
                                La IA usará ese interés para personalizar toda la experiencia.
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-center pb-6">
                        <button type="submit"
                            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 min-h-[56px] cursor-pointer">
                            <Sparkles className="w-5 h-5 group-hover:animate-sparkle" />
                            ✨ Iniciar sesión de aprendizaje
                        </button>
                    </div>
                </form>
            </main>

            {/* Edit modal */}
            {showEditModal && perfilActivo && (
                <EditProfileModal
                    perfil={perfilActivo}
                    onSave={handleGuardarEdicion}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};

export default ConfigScreen;
