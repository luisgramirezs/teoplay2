import React from 'react';
import { MathText } from './MathText';

interface CpaBlockProps {
  cpa: {
    concreto?: string;
    pictorico?: string;
    abstracto?: string;
  };
  fontSize?: string;
  seccionActiva?: string | null;
  onNarrar?: (id: string, texto: string) => void;
}

export const CpaBlock: React.FC<CpaBlockProps> = ({
  cpa,
  fontSize,
  seccionActiva,
  onNarrar,
}) => {
  const etapas = [
    {
      clave: 'concreto',
      titulo: '1. Concreto (Manos a la obra)',
      emoji: '🧱',
      colorBg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      contenido: cpa.concreto,
    },
    {
      clave: 'pictorico',
      titulo: '2. Pictórico (Representación)',
      emoji: '🎨',
      colorBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      contenido: cpa.pictorico,
    },
    {
      clave: 'abstracto',
      titulo: '3. Abstracto (Símbolos)',
      emoji: '🔢',
      colorBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      contenido: cpa.abstracto,
    },
  ];

  return (
    <div className="bg-white rounded-[26px] border border-slate-200 shadow-sm p-5 md:p-6 space-y-4 my-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-xl">
          🧠
        </div>
        <div>
          <h3 className="text-[17px] font-black text-slate-800">
            Paso a paso CPA (Aprender explorando)
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            De la manipulación física a los símbolos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {etapas.map((etapa) =>
          etapa.contenido ? (
            <div
              key={etapa.clave}
              className={`rounded-2xl border ${etapa.borderColor} ${etapa.colorBg} p-4 flex flex-col justify-between gap-3`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{etapa.emoji}</span>
                    <p className={`text-xs font-black uppercase tracking-wide ${etapa.textColor}`}>
                      {etapa.titulo}
                    </p>
                  </div>
                  {onNarrar && (
                    <button
                      onClick={() => onNarrar(`cpa-${etapa.clave}`, etapa.contenido!)}
                      className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
                      title="Escuchar"
                    >
                      🔊
                    </button>
                  )}
                </div>
                
                {/* NUEVO COMPONENTE CON FORMATO MATEMÁTICO */}
                <MathText
                  text={etapa.contenido}
                  fontSize={fontSize}
                  className="text-sm font-semibold text-slate-700 leading-relaxed block"
                />
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};