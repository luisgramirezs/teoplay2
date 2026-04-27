import type { EjemploLeccion } from '../types';

export function normalizeEjemplos(raw: unknown): EjemploLeccion[] {
    if (!Array.isArray(raw)) return [];

    return raw.map((item) => {
        if (typeof item === 'string') {
            return {
                enunciado: item,
                requiereProcedimiento: false,
                explicacionBreve: item,
                pasosGuiados: [],
                visualSugerido: {
                    tipo: 'ninguna',
                    descripcion: '',
                    justificacionPedagogica: '',
                },
                conclusionPedagogica: '',
            };
        }

        if (!item || typeof item !== 'object') {
            return {
                enunciado: '',
                requiereProcedimiento: false,
                explicacionBreve: '',
                pasosGuiados: [],
                visualSugerido: {
                    tipo: 'ninguna',
                    descripcion: '',
                    justificacionPedagogica: '',
                },
                conclusionPedagogica: '',
            };
        }

        const ejemplo = item as EjemploLeccion;

        return {
            enunciado: ejemplo.enunciado ?? '',
            requiereProcedimiento: Boolean(ejemplo.requiereProcedimiento),
            explicacionBreve: ejemplo.explicacionBreve ?? '',
            pasosGuiados: Array.isArray(ejemplo.pasosGuiados) ? ejemplo.pasosGuiados : [],
            visualSugerido: {
                tipo: ejemplo.visualSugerido?.tipo ?? 'ninguna',
                descripcion: ejemplo.visualSugerido?.descripcion ?? '',
                justificacionPedagogica: ejemplo.visualSugerido?.justificacionPedagogica ?? '',
            },
            conclusionPedagogica: ejemplo.conclusionPedagogica ?? '',
        };
    });
}