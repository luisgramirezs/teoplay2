/**
 * NeuroLessonPage.tsx
 *
 * Navegador de lección modular para TEOplay.
 * El niño ve 6 cards y elige por dónde empezar.
 * Al hacer clic abre la sección correspondiente de Phase2Lesson.
 *
 * Integración con Phase2Lesson:
 * Esta página recibe `perfil` y `sesion` como props (o los obtiene del contexto/router).
 * Cada módulo renderiza una sección específica del contenido ya generado.
 */

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ModuleCard from "../components/ModuleCard";
import type { ModuleType } from "../components/ModuleCard";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ModuleDef {
    id: string;
    type: ModuleType;
    title: string;
    subtitle: string;
}

// ─── Definición de los 6 módulos ─────────────────────────────────────────────

const MODULOS: ModuleDef[] = [
    {
        id: 'intro',
        type: 'intro',
        title: 'Introducción',
        subtitle: 'Descubre qué aprenderemos en esta lección.',
    },
    {
        id: 'concept',
        type: 'concept',
        title: 'Conceptos clave',
        subtitle: 'Las ideas más importantes que debes conocer.',
    },
    {
        id: 'visual',
        type: 'visual',
        title: 'Ejemplos visuales',
        subtitle: 'Imágenes y gráficos para entender mejor.',
    },
    {
        id: 'video',
        type: 'video',
        title: 'Video del tema',
        subtitle: 'Mira y escucha para aprender más.',
    },
    {
        id: 'activity',
        type: 'activity',
        title: 'Juego interactivo',
        subtitle: 'Practica jugando y pon a prueba lo que aprendiste.',
    },
    {
        id: 'summary',
        type: 'summary',
        title: 'Resumen y cierre',
        subtitle: 'Repasamos juntos lo más importante.',
    },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface NeuroLessonPageProps {
    tema: string;
    asignatura: string;
    nombreNino: string;
    /** Callback cuando el niño abre un módulo — la app renderiza la sección correspondiente */
    onOpenModule: (moduleId: string) => void;
    /** Módulos ya completados */
    completedModules?: string[];
    onBack?: () => void;
    onContinue?: () => void;
 


}





// ─── Componente ───────────────────────────────────────────────────────────────

export default function NeuroLessonPage({
    tema,
    asignatura,
    nombreNino,
    onOpenModule,
    //completedModules: externalCompleted,
    completedModules = [],
    onBack,
    onContinue,

}: NeuroLessonPageProps) {

    const [lastModule, setLastModule] = useState<string | null>(null);


    // Solo leemos el último módulo del localStorage, no el progreso
    useEffect(() => {
        const last = localStorage.getItem(`teoplay-last-${tema}`);
        if (last) setLastModule(last);
    }, [tema]);


    const handleOpen = (moduleId: string) => {
        localStorage.setItem(`teoplay-last-${tema}`, moduleId);
        setLastModule(moduleId);
        onOpenModule(moduleId);
    };

    const exploredCount = completedModules.length;
    const progresoPct = Math.round((exploredCount / MODULOS.length) * 100);
    const todasCompletas = exploredCount === MODULOS.length;

    return (
        <div className="min-h-screen bg-[#F0FAFA]">

            {/* NAVBAR */}
            <header className="bg-white border-b border-slate-200 shadow-sm px-4 sm:px-8 h-14 flex items-center gap-3">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-700 hidden sm:inline">Volver</span>
                    </button>
                )}

                <div className="w-8 h-8 rounded-xl bg-[#0E9E8A] flex items-center justify-center text-white font-black text-sm select-none">
                    T
                </div>
                <span className="font-black text-slate-800 text-base hidden sm:block">TEOplay</span>

                <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2">
                    <span className="text-sm font-black text-[#0E9E8A] truncate max-w-[200px] sm:max-w-sm">
                        {tema}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold hidden sm:block">·</span>
                    <span className="text-xs text-slate-400 font-semibold hidden sm:block capitalize">{asignatura}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#F3EFFE] flex items-center justify-center text-lg select-none">⭐</div>
                    <span className="text-sm font-bold text-slate-600 hidden sm:block">{nombreNino}</span>
                </div>
            </header>

            {/* CUERPO */}
            <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

                {/* Mascota + saludo */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#0E9E8A] flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                        🤖
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none border border-slate-200 px-5 py-4 shadow-sm flex-1">
                        <p className="font-black text-slate-800 text-lg">
                            ¡Hola, {nombreNino}! 👋
                        </p>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">
                            ¡Tú decides por dónde empezar! Elige una sección para aprender a tu manera.
                        </p>
                    </div>
                </div>

                {/* Progreso */}
                <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-6 flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-black text-slate-700">Tu progreso en esta lección</p>
                            <p className="text-sm font-black text-[#0E9E8A]">{exploredCount} de {MODULOS.length}</p>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#0E9E8A] to-[#5DCABB] rounded-full transition-all duration-500"
                                style={{ width: `${progresoPct}%` }}
                            />
                        </div>
                    </div>

                    {/* Continuar donde quedó */}
                    {lastModule && !todasCompletas && (
                        <button
                            type="button"
                            onClick={() => handleOpen(lastModule)}
                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#0E9E8A] text-white font-black text-sm hover:bg-[#0A7A6A] transition-colors cursor-pointer"

                        >
                            Continuar →
                        </button>
                    )}

                    {todasCompletas && (
                        <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm">
                            🎉 ¡Todo listo!
                        </div>
                    )}
                </div>

                {/* Grid de módulos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {MODULOS.map((modulo) => (
                        <ModuleCard
                            key={modulo.id}
                            module={modulo}
                            completed={completedModules.includes(modulo.id)}
                            onClick={() => handleOpen(modulo.id)}
                        />
                    ))}
                </div>

                {/* Gran botón final visible solo al completar todo */}
                {todasCompletas && (
                    <div className="mt-8 animate-in fade-in zoom-in duration-500">
                        <button
                            onClick={onContinue}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            ¡Lección completada! Veamos los resultados
                        </button>
                    </div>
                )}

                {/* Footer motivacional */}
                <div className="mt-8 flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
                    <span className="text-3xl flex-shrink-0">🦁</span>
                    <div>
                        <p className="text-sm font-black text-slate-700">Cada pequeño paso te acerca a tu meta.</p>
                        <p className="text-[#0E9E8A] font-black text-base">¡Tú puedes!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Exportar lista de módulos para uso externo ───────────────────────────────
export { MODULOS };
export type { ModuleDef };
