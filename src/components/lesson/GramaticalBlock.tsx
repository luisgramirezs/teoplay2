/**
 * GramaticalBlock.tsx
 *
 * Componente React para visualizar estructuras gramaticales de idiomas.
 * Renderiza: piezas de la oración + reglas de uso + ejemplos armados.
 *
 * Funciona para inglés, francés, español y cualquier idioma.
 * Los datos vienen de sesion.apoyoGramatical (generado por OpenAI).
 * Este componente NUNCA genera SVG — siempre renderiza React puro.
 */

import React, { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PiezaGramatical {
  rol: string;           // "Sujeto", "Auxiliar", "Participio pasado"
  valores: string[];     // ["She", "He", "It"] o ["has"] o ["eaten", "gone"]
  etiqueta: string;      // "3ra persona singular" / "usa HAS con She/He/It"
  color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'teal';
}

export interface EjemploGramatical {
  oracion: string;       // "She has eaten."
  traduccion: string;    // "Ella ha comido."
}

export interface ApoyoGramatical {
  titulo: string;                  // "Present Perfect"
  idioma: string;                  // "inglés" | "francés" | "español"
  piezas: PiezaGramatical[];
  reglas: string[];                // ["She/He/It → HAS", "I/You/We/They → HAVE"]
  ejemplos: EjemploGramatical[];
  nota?: string;                   // nota pedagógica opcional
}

// ─── Paleta de colores por pieza ──────────────────────────────────────────────

const COLORES: Record<PiezaGramatical['color'], {
  bg: string; border: string; text: string; badge: string; badgeText: string; dot: string;
}> = {
  orange: {
    bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
    badge: 'bg-orange-500', badgeText: 'text-white', dot: 'bg-orange-400',
  },
  blue: {
    bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
    badge: 'bg-blue-500', badgeText: 'text-white', dot: 'bg-blue-400',
  },
  green: {
    bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700',
    badge: 'bg-green-500', badgeText: 'text-white', dot: 'bg-green-400',
  },
  purple: {
    bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700',
    badge: 'bg-purple-500', badgeText: 'text-white', dot: 'bg-purple-400',
  },
  pink: {
    bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700',
    badge: 'bg-pink-500', badgeText: 'text-white', dot: 'bg-pink-400',
  },
  teal: {
    bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700',
    badge: 'bg-teal-500', badgeText: 'text-white', dot: 'bg-teal-400',
  },
};

// ─── Subcomponente: Pieza gramatical ─────────────────────────────────────────

const PiezaCard: React.FC<{ pieza: PiezaGramatical; index: number; total: number }> = ({
  pieza, index, total,
}) => {
  const pal = COLORES[pieza.color] ?? COLORES.blue;

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Card de la pieza */}
      <div className={`flex-1 min-w-0 rounded-2xl border-2 ${pal.border} ${pal.bg} p-3 flex flex-col gap-2`}>
        {/* Rol (etiqueta del tipo) */}
        <span className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${pal.badge} ${pal.badgeText}`}>
          {pieza.rol}
        </span>

        {/* Valores */}
        <div className="flex flex-wrap gap-1.5">
          {pieza.valores.map((val, i) => (
            <span
              key={i}
              className={`px-2.5 py-1 rounded-xl text-sm font-black border ${pal.border} bg-white ${pal.text}`}
            >
              {val}
            </span>
          ))}
        </div>

        {/* Etiqueta explicativa */}
        <p className={`text-[11px] font-semibold ${pal.text} leading-tight`}>
          {pieza.etiqueta}
        </p>
      </div>

      {/* Conector "+" entre piezas */}
      {index < total - 1 && (
        <span className="text-slate-400 font-black text-lg flex-shrink-0">+</span>
      )}
    </div>
  );
};

// ─── Subcomponente: Reglas de uso ────────────────────────────────────────────

const ReglasBlock: React.FC<{ reglas: string[] }> = ({ reglas }) => {
  if (!reglas?.length) return null;

  return (
    <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📌</span>
        <p className="text-[11px] font-black text-amber-800 uppercase tracking-wide">
          Reglas importantes
        </p>
      </div>
      <div className="space-y-2">
        {reglas.map((regla, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-[10px] font-black">{i + 1}</span>
            </div>
            <p className="text-sm font-bold text-amber-900 leading-snug">{regla}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Subcomponente: Constructor interactivo ───────────────────────────────────
// El niño selecciona un valor de cada pieza y arma su propia oración

const ConstructorOracion: React.FC<{
  piezas: PiezaGramatical[];
  idioma: string;
}> = ({ piezas, idioma }) => {
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});

  const oracionArmada = piezas
    .map((p, i) => seleccion[i] ?? '___')
    .join(' ');

  const completa = piezas.every((_, i) => !!seleccion[i]);

  return (
    <div className="rounded-2xl bg-[#F3EFFE] border-2 border-purple-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🧩</span>
        <p className="text-[11px] font-black text-purple-800 uppercase tracking-wide">
          Arma tu oración
        </p>
      </div>

      {/* Selectores por pieza */}
      <div className="space-y-2 mb-4">
        {piezas.map((pieza, i) => {
          const pal = COLORES[pieza.color] ?? COLORES.blue;
          return (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase w-24 flex-shrink-0 ${pal.text}`}>
                {pieza.rol}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pieza.valores.map((val, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setSeleccion(s => ({ ...s, [i]: val }))}
                    className={`px-2.5 py-1 rounded-xl text-sm font-black border-2 transition-all cursor-pointer
                      ${seleccion[i] === val
                        ? `${pal.badge} ${pal.badgeText} border-transparent scale-105`
                        : `bg-white ${pal.text} ${pal.border} hover:scale-105`
                      }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resultado */}
      <div className={`rounded-xl p-3 text-center transition-all ${
        completa ? 'bg-white border-2 border-purple-300' : 'bg-white/60 border-2 border-dashed border-purple-200'
      }`}>
        <p className={`text-lg font-black italic ${completa ? 'text-slate-800' : 'text-slate-400'}`}>
          {oracionArmada}
        </p>
        {completa && (
          <button
            type="button"
            onClick={() => setSeleccion({})}
            className="mt-2 text-[10px] font-bold text-purple-500 hover:text-purple-700 underline cursor-pointer"
          >
            Limpiar y volver a intentar
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Subcomponente: Ejemplos armados ─────────────────────────────────────────

const EjemplosArmados: React.FC<{
  ejemplos: EjemploGramatical[];
  piezas: PiezaGramatical[];
}> = ({ ejemplos, piezas }) => {
  if (!ejemplos?.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">✅</span>
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
          Ejemplos completos
        </p>
      </div>
      {ejemplos.map((ej, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-slate-200 px-4 py-3 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-black text-slate-800 italic">{ej.oracion}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{ej.traduccion}</p>
          </div>
          {/* Color dots matching piezas */}
          <div className="flex gap-1 flex-shrink-0">
            {piezas.map((p, j) => (
              <div
                key={j}
                className={`w-2 h-2 rounded-full ${COLORES[p.color]?.dot ?? 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

interface GramaticalBlockProps {
  apoyoGramatical: ApoyoGramatical;
  condicion?: string;
}

const GramaticalBlock: React.FC<GramaticalBlockProps> = ({
  apoyoGramatical,
  condicion = 'general',
}) => {
  if (!apoyoGramatical?.piezas?.length) return null;

  const { titulo, idioma, piezas, reglas, ejemplos, nota } = apoyoGramatical;

  return (
    <div className="w-full rounded-[26px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#F3EFFE] to-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">
          🔤
        </div>
        <div>
          <p className="text-sm font-black text-purple-800">{titulo}</p>
          <p className="text-[11px] font-medium text-purple-500 capitalize">{idioma}</p>
        </div>
        <span className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
          Estructura
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Piezas de la oración */}
        <div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide mb-3">
            ¿Cómo se forma?
          </p>
          <div className="flex flex-wrap gap-2 items-start">
            {piezas.map((pieza, i) => (
              <PiezaCard key={i} pieza={pieza} index={i} total={piezas.length} />
            ))}
          </div>
        </div>

        {/* Reglas */}
        <ReglasBlock reglas={reglas} />

        {/* Constructor interactivo */}
        <ConstructorOracion piezas={piezas} idioma={idioma} />

        {/* Ejemplos */}
        <EjemplosArmados ejemplos={ejemplos} piezas={piezas} />

        {/* Nota pedagógica */}
        {nota && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-[12px] font-semibold text-slate-600 leading-relaxed">
              💡 {nota}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GramaticalBlock;
export type { ApoyoGramatical };
