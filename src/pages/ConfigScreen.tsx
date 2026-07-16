// src/pages/ConfigScreen.tsx
import React, { useState } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { PerfilNino, Asignatura, Idioma, ASIGNATURAS, PERFIL_ACTIVO_KEY } from '@/types';
import { PerfilCompleto } from '@/components/OnboardingWizard';

interface ConfigScreenProps {
    onGenerate: (perfil: PerfilNino) => void;
    perfiles: PerfilCompleto[];
}

// ── Main ConfigScreen ────────────────────────────────────────────────────────
const ConfigScreen: React.FC<ConfigScreenProps> = ({
    onGenerate,
    perfiles,
}) => {
    // Perfil activo: primero intentamos el guardado en localStorage, si no el primero de la lista
    const [perfilActivo, setPerfilActivo] = useState<PerfilCompleto | null>(() => {
        const id = localStorage.getItem(PERFIL_ACTIVO_KEY);
        return perfiles.find(p => p.id === id) || perfiles[0] || null;
    });

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

                    {/* Contexto: niño activo (solo lectura, sin selector ni botones) */}
                    <p className="text-sm font-bold text-muted-foreground">
                        Generando lección para: <span className="text-foreground">{perfilActivo.nombre || 'Sin nombre'}</span>
                    </p>

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
        </div>
    );
};

export default ConfigScreen;
