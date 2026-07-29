import React from 'react';
import { Volume2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Mini botón de narración por secciones
// ─────────────────────────────────────────────────────────────────────────────
const BtnNarrar: React.FC<{
    id: string;
    texto: string;
    seccionActiva: string | null;
    onNarrar: (id: string, texto: string) => void;
}> = ({ id, texto, seccionActiva, onNarrar }) => {
    const activo = seccionActiva === id;

    return (
        <button
            type="button"
            onClick={() => onNarrar(id, texto)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${activo
                    ? 'bg-accent/20 text-accent border border-accent/40'
                    : 'bg-muted text-muted-foreground border border-border hover:text-accent hover:border-accent/40'
                }`}
            title={activo ? 'Detener narración' : 'Escuchar esta sección'}
        >
            <Volume2 className={`w-3 h-3 ${activo ? 'animate-pulse' : ''}`} />
            {activo ? 'Detener' : 'Escuchar'}
        </button>
    );
};

export default BtnNarrar;
