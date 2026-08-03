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
import { PiezaGramatical, EjemploGramatical, ApoyoGramatical } from '@/types';
import { normalizarTexto } from '@/utils/wikimediaQueryDictionary';
import { useNarrador } from '@/hooks/use-narrador';
import BtnNarrar from './BtnNarrar';

// ─── Paleta de colores por pieza ──────────────────────────────────────────────

export const COLORES: Record<PiezaGramatical['color'], {
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

// ─── Color determinístico por rol ────────────────────────────────────────────
// El mismo rol (ej. "sujeto") debe verse siempre con el mismo color en toda la
// app — es un mapeo no-verbal estable, valioso para dislexia. Por eso el color
// se calcula aquí a partir del rol y NUNCA se toma de "pieza.color" (que la IA
// asigna por rotación/posición y varía entre generaciones).
const ROLES_COLOR_FIJO: Record<string, PiezaGramatical['color']> = {
  sujeto: 'blue',
  verbo: 'orange',
  'verbo principal': 'orange',
  'verbo auxiliar': 'purple',
  auxiliar: 'purple',
  complemento: 'green',
  objeto: 'green',
  'objeto directo': 'green',
  'objeto indirecto': 'teal',
  adverbio: 'teal',
  adjetivo: 'pink',
  preposicion: 'pink',
  articulo: 'pink',
  pronombre: 'blue',
  'participio pasado': 'purple',
};

const COLORES_ORDEN: PiezaGramatical['color'][] = ['orange', 'blue', 'green', 'purple', 'pink', 'teal'];

const hashColor = (s: string): PiezaGramatical['color'] => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return COLORES_ORDEN[hash % COLORES_ORDEN.length];
};

export const colorParaRol = (rol: string): PiezaGramatical['color'] => {
  const normalizado = normalizarTexto(rol);
  return ROLES_COLOR_FIJO[normalizado] ?? hashColor(normalizado);
};

// ─── Idioma del apoyoGramatical → tag BCP-47 (síntesis de voz) ──────────────
// apoyoGramatical.idioma es texto libre en español (ej. "inglés") — nunca se
// usa perfil.idioma (idioma de interfaz del niño) para narrar contenido en el
// idioma que se está enseñando, o se pronunciaría con acento/fonética errónea.
const IDIOMA_A_BCP47: Record<string, string> = {
  ingles: 'en-US',
  frances: 'fr-FR',
  espanol: 'es-ES',
  portugues: 'pt-PT',
};

function mapIdiomaABCP47(idioma: string): string {
  return IDIOMA_A_BCP47[normalizarTexto(idioma)] ?? 'en-US';
}

// Para narrar: quita la traducción entre paréntesis al final del valor
// (ej. "I (yo)" → "I") — la traducción se MUESTRA siempre en pantalla, pero
// nunca se narra con la voz del idioma enseñado (sonaría mal pronunciada).
function extraerTextoIdiomaEnsenado(valor: string): string {
  return valor.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// ─── Subcomponente: Pieza gramatical ─────────────────────────────────────────

export const PiezaCard: React.FC<{ pieza: PiezaGramatical; index: number; total: number }> = ({
  pieza, index, total,
}) => {
  const pal = COLORES[colorParaRol(pieza.rol)];

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
  narrar: (id: string, texto: string, langOverride?: string) => void;
  idiomaBCP47: string;
}> = ({ piezas, idioma, narrar, idiomaBCP47 }) => {
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});

  const oracionArmada = piezas
    .map((p, i) => seleccion[i] ?? '___')
    .join(' ');

  const oracionArmadaSoloIdioma = piezas
    .map((p, i) => (seleccion[i] ? extraerTextoIdiomaEnsenado(seleccion[i]) : '___'))
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
          const pal = COLORES[colorParaRol(pieza.rol)];
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
                    onClick={() => {
                      setSeleccion(s => ({ ...s, [i]: val }));
                      narrar(`pieza-${i}-${j}`, extraerTextoIdiomaEnsenado(val), idiomaBCP47);
                    }}
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
          <>
            <p className="mt-2 text-xs font-bold text-green-700">
              ✅ ¡Muy bien! Así se arma la oración.
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => narrar('oracion-armada-completa', oracionArmadaSoloIdioma, idiomaBCP47)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
              >
                🔊 Escuchar oración completa
              </button>
              <button
                type="button"
                onClick={() => setSeleccion({})}
                className="text-[10px] font-bold text-purple-500 hover:text-purple-700 underline cursor-pointer"
              >
                Limpiar y volver a intentar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Subcomponente: Ejemplos armados ─────────────────────────────────────────

const EjemplosArmados: React.FC<{
  ejemplos: EjemploGramatical[];
  piezas: PiezaGramatical[];
  narrar: (id: string, texto: string, langOverride?: string) => void;
  seccionActiva: string | null;
  idiomaBCP47: string;
}> = ({ ejemplos, piezas, narrar, seccionActiva, idiomaBCP47 }) => {
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <BtnNarrar
              id={`ejemplo-${i}`}
              texto={ej.oracion}
              seccionActiva={seccionActiva}
              onNarrar={(id, texto) => narrar(id, texto, idiomaBCP47)}
            />
            {/* Color dots matching piezas */}
            <div className="flex gap-1">
              {piezas.map((p, j) => (
                <div
                  key={j}
                  className={`w-2 h-2 rounded-full ${COLORES[colorParaRol(p.rol)].dot}`}
                />
              ))}
            </div>
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
  // Hooks siempre antes de cualquier return condicional (Reglas de Hooks de React).
  const { narrar, seccionActiva } = useNarrador('en', condicion);
  const idiomaBCP47 = mapIdiomaABCP47(apoyoGramatical?.idioma ?? '');

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
        <ConstructorOracion piezas={piezas} idioma={idioma} narrar={narrar} idiomaBCP47={idiomaBCP47} />

        {/* Ejemplos */}
        <EjemplosArmados ejemplos={ejemplos} piezas={piezas} narrar={narrar} seccionActiva={seccionActiva} idiomaBCP47={idiomaBCP47} />

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
