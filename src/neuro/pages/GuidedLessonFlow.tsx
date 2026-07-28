/**
 * GuidedLessonFlow.tsx
 *
 * Modo guiado: recorrido secuencial de las 6 cápsulas de la lección, con
 * retroceso libre y sin ningún piso de tiempo mínimo — "Siguiente" siempre
 * está habilitado. El tiempo por cápsula se registra como telemetría
 * descriptiva (pausable/reanudable), nunca como criterio de avance.
 */

import React, { useEffect, useRef, useState } from 'react';
import Phase2Lesson from '@/components/phases/Phase2Lesson';
import { MODULOS } from './NeuroLessonPage';
import type { PerfilNino, SesionGenerada, ProgresoGuiadoTema } from '@/types';
import { actualizarPasoGuiado, incrementarTiempoCapsula } from '@/lib/studentsService';

interface GuidedLessonFlowProps {
    perfil: PerfilNino;
    sesion: SesionGenerada;
    /** Progreso guiado ya persistido para este tema, si el niño lo había empezado antes */
    progresoGuiadoInicial?: ProgresoGuiadoTema;
    /** Se dispara al terminar la última cápsula */
    onGuidedComplete: () => void;
    /** Se dispara cada vez que se avanza de cápsula (para trackear modulosCompletados en ChildSession) */
    onModuleComplete?: (moduleId: string) => void;
}

export default function GuidedLessonFlow({
    perfil,
    sesion,
    progresoGuiadoInicial,
    onGuidedComplete,
    onModuleComplete,
}: GuidedLessonFlowProps) {

    const [pasoGuiado, setPasoGuiado] = useState(() => {
        const inicial = progresoGuiadoInicial?.pasoActual ?? 0;
        return Math.min(Math.max(inicial, 0), MODULOS.length - 1);
    });

    // Tracking de tiempo por cápsula — solo telemetría descriptiva, nunca gate de avance.
    // Pausable/reanudable: se detiene al ocultar la pestaña y retoma sin resetear el acumulado.
    const capsulaStartRef = useRef<number | null>(Date.now());

    useEffect(() => {
        const moduleId = MODULOS[pasoGuiado].id;
        capsulaStartRef.current = Date.now();

        const flush = () => {
            if (capsulaStartRef.current === null) return;
            const deltaSegundos = Math.round((Date.now() - capsulaStartRef.current) / 1000);
            capsulaStartRef.current = null;
            if (deltaSegundos > 0) {
                incrementarTiempoCapsula(perfil.id, perfil.tema, moduleId, deltaSegundos);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                flush();
            } else {
                capsulaStartRef.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            flush();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pasoGuiado, perfil.id, perfil.tema]);

    const handlePrev = () => {
        setPasoGuiado(p => Math.max(0, p - 1));
    };

    const handleNext = () => {
        const moduleId = MODULOS[pasoGuiado].id;
        onModuleComplete?.(moduleId);

        const esUltimoPaso = pasoGuiado === MODULOS.length - 1;

        if (esUltimoPaso) {
            actualizarPasoGuiado(perfil.id, perfil.tema, { pasoActual: pasoGuiado, completado: true });
            onGuidedComplete();
        } else {
            const siguiente = pasoGuiado + 1;
            actualizarPasoGuiado(perfil.id, perfil.tema, { pasoActual: siguiente });
            setPasoGuiado(siguiente);
        }
    };

    return (
        <Phase2Lesson
            key={MODULOS[pasoGuiado].id}
            perfil={perfil}
            sesion={sesion}
            onComplete={() => { }}
            moduleId={MODULOS[pasoGuiado].id}
            navMode="guided"
            onPrev={pasoGuiado > 0 ? handlePrev : undefined}
            onNext={handleNext}
            isLastStep={pasoGuiado === MODULOS.length - 1}
        />
    );
}
