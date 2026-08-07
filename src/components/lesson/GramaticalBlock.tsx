/**
 * GramaticalBlock.tsx
 *
 * Componente React para visualizar estructuras gramaticales de idiomas.
 * Renderiza: fórmula con íconos, ejemplo guiado con pictograma, resumen
 * "¡Recuerda!", ejemplo interlineado + cierre, constructor interactivo y
 * ejemplos completos.
 *
 * Funciona para inglés, francés, español y cualquier idioma.
 * Los datos vienen de sesion.apoyoGramatical (generado por OpenAI).
 * Este componente NUNCA genera SVG — siempre renderiza React puro.
 */

import React, { useState, useEffect } from 'react';
import { User, Heart, Footprints, MapPin, HelpCircle, ArrowRight, CheckCircle2, Volume2, RotateCcw } from 'lucide-react';
import { PiezaGramatical, EjemploGramatical, ApoyoGramatical, ConceptoClave, ValorPieza, TipoOracion } from '@/types';
import { normalizarTexto } from '@/utils/wikimediaQueryDictionary';
import { useNarrador, RATE_NARRACION_LENTA } from '@/hooks/use-narrador';
import { mapIdiomaABCP47 } from '@/utils/idiomaBCP47';
import { obtenerOGenerarPictogramaGramatical } from '@/lib/apoyoVisualIAService';
import { traducirOracionArmada } from '@/lib/api';
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

// Para narrar: quita la traducción entre paréntesis al final del valor
// (ej. "I (yo)" → "I") — la traducción se MUESTRA siempre en pantalla, pero
// nunca se narra con la voz del idioma enseñado (sonaría mal pronunciada).
function extraerTextoIdiomaEnsenado(valor: string): string {
  return valor.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// ─── Validación de concordancia real vía correspondeA (Constructor) ─────────
// "correspondeA" es texto libre tipo "you / we / they" — se divide en tokens
// normalizados para comparar, nunca como string completo.
function dividirCondicion(correspondeA: string): string[] {
  return correspondeA
    .split(/\s*[/,|]\s*|\s+y\s+|\s+o\s+|\s+and\s+|\s+or\s+/i)
    .map(t => normalizarTexto(t.trim()))
    .filter(Boolean);
}

// Genérico: no asume cuál pieza es "el sujeto" — para cada pieza seleccionada
// con correspondeA, exige que ALGUNA OTRA pieza seleccionada tenga un texto
// (sin traducción) que coincida con uno de los tokens de esa condición.
// Piezas sin correspondeA (valores libres) se consideran automáticamente
// compatibles — no hay nada que validar entre ellas.
// Devuelve la PRIMERA pieza en conflicto (Bloque 5: habilita un mensaje
// orientador específico) o null si toda la selección concuerda.
function piezaEnConflicto(
  piezas: PiezaGramatical[],
  seleccion: Record<number, ValorPieza>
): PiezaGramatical | null {
  for (let i = 0; i < piezas.length; i++) {
    const seleccionada = seleccion[i];
    if (!seleccionada?.correspondeA) continue;

    const tokens = dividirCondicion(seleccionada.correspondeA);
    const compatible = piezas.some((_, k) => {
      if (k === i || !seleccion[k]) return false;
      const textoOtra = normalizarTexto(extraerTextoIdiomaEnsenado(seleccion[k].texto));
      return tokens.includes(textoOtra);
    });
    if (!compatible) return piezas[i];
  }
  return null;
}

// ─── Agrupación de valores condicionados (Cambio 1 — reutilizada por PiezaCard
// y por la caja "¡Recuerda!") ─────────────────────────────────────────────────

interface GrupoValor {
  condicion: string;
  formas: string[];
}

function agruparValoresPorCondicion(pieza: PiezaGramatical): { grupos: GrupoValor[]; sueltos: string[] } {
  const grupos: GrupoValor[] = [];
  const sueltos: string[] = [];
  const indice = new Map<string, number>();
  for (const v of pieza.valores) {
    if (v.correspondeA) {
      if (!indice.has(v.correspondeA)) {
        indice.set(v.correspondeA, grupos.length);
        grupos.push({ condicion: v.correspondeA, formas: [] });
      }
      grupos[indice.get(v.correspondeA)!].formas.push(v.texto);
    } else {
      sueltos.push(v.texto);
    }
  }
  return { grupos, sueltos };
}

// ─── Diccionario de ícono + pregunta guía por rol ────────────────────────────
// Matching por palabra clave sobre el rol normalizado — genérico, no atado a
// inglés. Si ningún patrón coincide, respaldo genérico (nunca rompe el render).

interface InfoRol {
  icon: React.ComponentType<{ className?: string }>;
  pregunta: string;
}

const DICCIONARIO_ROL: { test: (rolNormalizado: string) => boolean; info: InfoRol }[] = [
  { test: n => n.includes('sujeto'), info: { icon: User, pregunta: '¿Quién?' } },
  { test: n => n.includes('auxiliar') || (n.includes('verbo') && n.includes('be')), info: { icon: Heart, pregunta: '¿Cómo está?' } },
  { test: n => n.includes('verbo') && (n.includes('principal') || n.includes('ing')), info: { icon: Footprints, pregunta: '¿Qué está haciendo?' } },
  { test: n => n.includes('complemento'), info: { icon: MapPin, pregunta: '¿Dónde?' } },
];

const INFO_ROL_RESPALDO: InfoRol = { icon: HelpCircle, pregunta: '¿Qué es?' };

function infoParaRol(rol: string): InfoRol {
  const normalizado = normalizarTexto(rol);
  return DICCIONARIO_ROL.find(d => d.test(normalizado))?.info ?? INFO_ROL_RESPALDO;
}

// ─── Matching rol↔concepto (mismo criterio que ConceptosClaveBlock) ──────────
// Reutilizado por "Veamos un ejemplo" y por el ejemplo interlineado.

function fragmentoParaPieza(pieza: PiezaGramatical, conceptos: ConceptoClave[]): string {
  const rolNormalizado = normalizarTexto(pieza.rol);
  const concepto = conceptos.find(c => normalizarTexto(c.nombre) === rolNormalizado);
  return concepto?.fragmentoEnOracion?.trim() ?? '';
}

// ─── Segmentación de la oración canónica por fragmento de pieza ──────────────
// Generaliza la idea de "resaltar un fragmento" a N fragmentos: ubica cada uno
// por posición real en el texto (no por orden de piezas[], que puede no
// coincidir con el orden textual) y descarta solapamientos defensivamente.

interface SegmentoOracion {
  texto: string;
  pieza?: PiezaGramatical;
}

function segmentarOracion(
  oracion: string,
  piezas: PiezaGramatical[],
  conceptos: ConceptoClave[]
): SegmentoOracion[] {
  type Coincidencia = { idx: number; len: number; pieza: PiezaGramatical };

  const coincidencias: Coincidencia[] = piezas
    .map((pieza): Coincidencia | null => {
      const fragmento = fragmentoParaPieza(pieza, conceptos);
      if (!fragmento) return null;
      const idx = oracion.indexOf(fragmento);
      if (idx === -1) return null;
      return { idx, len: fragmento.length, pieza };
    })
    .filter((m): m is Coincidencia => m !== null)
    .sort((a, b) => a.idx - b.idx);

  const limpias: Coincidencia[] = [];
  let cursor = 0;
  for (const m of coincidencias) {
    if (m.idx < cursor) continue; // se solapa con una coincidencia anterior — se omite
    limpias.push(m);
    cursor = m.idx + m.len;
  }

  const segmentos: SegmentoOracion[] = [];
  let pos = 0;
  for (const m of limpias) {
    if (m.idx > pos) segmentos.push({ texto: oracion.slice(pos, m.idx) });
    segmentos.push({ texto: oracion.slice(m.idx, m.idx + m.len), pieza: m.pieza });
    pos = m.idx + m.len;
  }
  if (pos < oracion.length) segmentos.push({ texto: oracion.slice(pos) });
  return segmentos;
}

// ─── Subcomponente: Pieza gramatical (Primera Sección — SIN CAMBIOS de cara
// afuera, sigue exportado y usado por ConceptosClaveBlock) ───────────────────

export const PiezaCard: React.FC<{ pieza: PiezaGramatical; index: number; total: number }> = ({
  pieza, index, total,
}) => {
  const pal = COLORES[colorParaRol(pieza.rol)];
  const { grupos, sueltos } = agruparValoresPorCondicion(pieza);
  const tieneAgrupacion = grupos.length > 0;

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Card de la pieza */}
      <div className={`flex-1 min-w-0 rounded-2xl border-2 ${pal.border} ${pal.bg} p-3 flex flex-col gap-2`}>
        {/* Rol (etiqueta del tipo) */}
        <span className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${pal.badge} ${pal.badgeText}`}>
          {pieza.rol}
        </span>

        {/* Valores */}
        {tieneAgrupacion ? (
          <>
            <p className={`text-[10px] font-bold ${pal.text} uppercase tracking-wide`}>
              Usa cada opción según corresponda
            </p>
            <div className="flex flex-wrap gap-2">
              {grupos.map((g, i) => (
                <div
                  key={i}
                  className={`rounded-xl border-2 ${pal.border} bg-white px-2.5 py-1.5 flex flex-col items-center gap-0.5`}
                >
                  <span className={`text-sm font-black ${pal.text}`}>{g.formas.join(' / ')}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{g.condicion}</span>
                </div>
              ))}
              {sueltos.map((s, i) => (
                <span
                  key={i}
                  className={`px-2.5 py-1 rounded-xl text-sm font-black border ${pal.border} bg-white ${pal.text}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {pieza.valores.map((v, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-xl text-sm font-black border ${pal.border} bg-white ${pal.text}`}
              >
                {v.texto}
              </span>
            ))}
          </div>
        )}

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

// ─── Segunda Sección — Pieza 1: Fórmula con íconos ───────────────────────────

const FormulaIconos: React.FC<{ piezas: PiezaGramatical[] }> = ({ piezas }) => {
  if (!piezas.length) return null;

  return (
    <div className="rounded-2xl bg-[#F6F3FF] border border-purple-100 px-4 py-4">
      <div className="flex items-center gap-2 flex-wrap">
        {piezas.map((pieza, i) => {
          const { icon: Icon, pregunta } = infoParaRol(pieza.rol);
          const pal = COLORES[colorParaRol(pieza.rol)];
          return (
            <React.Fragment key={i}>
              <div className={`flex flex-col items-center gap-1 rounded-xl border-2 ${pal.border} ${pal.bg} px-3 py-2 min-w-[84px]`}>
                <Icon className={`w-5 h-5 ${pal.text}`} />
                <span className={`text-[11px] font-black ${pal.text} text-center leading-tight`}>{pieza.rol}</span>
                <span className="text-[10px] font-semibold text-slate-500 text-center">{pregunta}</span>
              </div>
              {i < piezas.length - 1 && (
                <span className="text-[#5b40d6] font-black text-lg flex-shrink-0">+</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── Segunda Sección — Pieza 2: "Veamos un ejemplo" ──────────────────────────

const VeamosUnEjemplo: React.FC<{
  piezas: PiezaGramatical[];
  conceptos: ConceptoClave[];
  oracion: string;
  pictogramaUrl: string | null | undefined; // undefined = cargando, null = sin imagen
}> = ({ piezas, conceptos, oracion, pictogramaUrl }) => {
  const pasos = piezas
    .map(pieza => ({ pieza, fragmento: fragmentoParaPieza(pieza, conceptos) }))
    .filter(p => !!p.fragmento);

  if (!pasos.length) return null;

  const mostrarPictograma = pictogramaUrl !== null;

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-[#E8FBF8] p-4">
      <p className="text-[11px] font-black text-teal-800 uppercase tracking-wide mb-3">
        Veamos un ejemplo
      </p>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {mostrarPictograma && (
          <div className="w-full md:w-40 h-32 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden border border-teal-200 bg-white flex items-center justify-center">
            {pictogramaUrl ? (
              <img src={pictogramaUrl} alt={oracion} className="w-full h-full object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
            )}
          </div>
        )}
        <div className="flex-1 flex flex-wrap items-center gap-2 justify-center md:justify-start">
          {pasos.map(({ pieza, fragmento }, i) => {
            const { icon: Icon } = infoParaRol(pieza.rol);
            const pal = COLORES[colorParaRol(pieza.rol)];
            return (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-1 rounded-xl border-2 ${pal.border} ${pal.bg} px-3 py-2 min-w-[90px]`}>
                  <Icon className={`w-4 h-4 ${pal.text}`} />
                  <span className={`text-sm font-black ${pal.text}`}>{fragmento}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{pieza.rol}</span>
                </div>
                {i < pasos.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Segunda Sección — Pieza 3: "¡Recuerda!" ─────────────────────────────────

const RecuerdaBlock: React.FC<{ piezas: PiezaGramatical[] }> = ({ piezas }) => {
  const piezasConGrupos = piezas
    .map(pieza => ({ pieza, ...agruparValoresPorCondicion(pieza) }))
    .filter(x => x.grupos.length > 0);

  if (!piezasConGrupos.length) return null;

  return (
    <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💡</span>
        <p className="text-[11px] font-black text-amber-800 uppercase tracking-wide">
          ¡Recuerda!
        </p>
      </div>
      <div className="space-y-3">
        {piezasConGrupos.map(({ pieza, grupos }, i) => {
          const pal = COLORES[colorParaRol(pieza.rol)];
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {grupos.map((g, j) => (
                  <span
                    key={j}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black border ${pal.border} bg-white ${pal.text}`}
                  >
                    {g.formas.join(' / ')} → {g.condicion}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-semibold text-amber-900 leading-snug">
                {pieza.etiqueta}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Segunda Sección — Pieza 4(a): Ejemplo completo interlineado ─────────────

const EjemploCompletoInterlineado: React.FC<{
  oracion: string;
  piezas: PiezaGramatical[];
  conceptos: ConceptoClave[];
  seccionActiva: string | null;
  narrar: (id: string, texto: string, langOverride?: string) => void;
  idiomaBCP47: string;
}> = ({ oracion, piezas, conceptos, seccionActiva, narrar, idiomaBCP47 }) => {
  if (!oracion) return null;
  const segmentos = segmentarOracion(oracion, piezas, conceptos);

  return (
    <div className="flex-[3] min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
          Ejemplo completo
        </p>
        <BtnNarrar
          id="ejemplo-completo-interlineado"
          texto={oracion}
          seccionActiva={seccionActiva}
          onNarrar={(id, texto) => narrar(id, texto, idiomaBCP47)}
        />
      </div>
      <div className="flex flex-wrap items-start gap-y-3">
        {segmentos.map((seg, i) =>
          seg.pieza ? (
            <div key={i} className="flex flex-col items-center px-0.5">
              <span className={`text-sm font-black ${COLORES[colorParaRol(seg.pieza.rol)].text}`}>
                {seg.texto}
              </span>
              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                {infoParaRol(seg.pieza.rol).pregunta}
              </span>
            </div>
          ) : (
            <span key={i} className="text-sm font-medium text-slate-500 self-center whitespace-pre">
              {seg.texto}
            </span>
          )
        )}
      </div>
    </div>
  );
};

// ─── Segunda Sección — Pieza 4(b): "Así se forma una oración" ───────────────

const AsiSeForma: React.FC<{ piezas: PiezaGramatical[] }> = ({ piezas }) => {
  if (!piezas.length) return null;
  const roles = piezas.map(p => p.rol).join(' + ');

  return (
    <div className="flex-[2] min-w-0 rounded-2xl bg-green-50 border-2 border-green-200 p-4 flex flex-col items-center justify-center text-center gap-2">
      <CheckCircle2 className="w-6 h-6 text-green-600" />
      <p className="text-[13px] font-bold text-green-800 leading-snug">
        Unimos {roles} en el orden correcto para formar la oración.
      </p>
    </div>
  );
};

// ─── Mensaje orientador dinámico (Bloque 5) ──────────────────────────────────
// En vez de un mensaje genérico de error, usa la "etiqueta" de la pieza en
// conflicto (ya escrita por la IA para explicar cuándo/por qué se usa esa
// pieza) más un encabezado según el tipo de oración — la pista apunta a la
// regla real, no solo a "algo falló".
function mensajeOrientador(pieza: PiezaGramatical, tipoOracion?: TipoOracion): string {
  const encabezado =
    tipoOracion === 'negativa' ? 'En esta oración negativa, revisa' :
    tipoOracion === 'interrogativa' ? 'En esta pregunta, revisa' :
    'Revisa';
  return `${encabezado}: ${pieza.etiqueta}`;
}

// ─── Tercera Sección — Constructor interactivo ───────────────────────────────
// El niño selecciona un valor de cada pieza y arma su propia oración.
// Valida concordancia real vía correspondeA (no solo "todas las piezas tienen
// algo seleccionado") y solo revela la traducción cuando la oración es correcta.

const ConstructorOracion: React.FC<{
  piezas: PiezaGramatical[];
  idioma: string;
  narrar: (id: string, texto: string, langOverride?: string) => void;
  idiomaBCP47: string;
  tipoOracion?: TipoOracion;
}> = ({ piezas, idioma, narrar, idiomaBCP47, tipoOracion }) => {
  const [seleccion, setSeleccion] = useState<Record<number, ValorPieza>>({});
  // Caché de traducciones reales (IA) por texto exacto de oracionArmada — evita
  // volver a pagar la llamada si el niño rearma la misma combinación correcta.
  const [traducciones, setTraducciones] = useState<Record<string, string>>({});

  const completa = piezas.every((_, i) => !!seleccion[i]);
  const conflicto = completa ? piezaEnConflicto(piezas, seleccion) : null;
  const correcta = completa && !conflicto;

  // Cambio 2: la oración armada (mientras se construye Y una vez completa)
  // nunca muestra la traducción entre paréntesis — protagonismo del idioma enseñado.
  // Si la oración es interrogativa, cierra con "?" (el español, con apertura
  // "¿" incluida, lo resuelve la traducción real de la IA — ver useEffect abajo).
  const oracionArmada = piezas
    .map((_, i) => (seleccion[i] ? extraerTextoIdiomaEnsenado(seleccion[i].texto) : '___'))
    .join(' ') + (tipoOracion === 'interrogativa' ? '?' : '');

  const oracionTraducida = traducciones[oracionArmada];

  useEffect(() => {
    if (!correcta || traducciones[oracionArmada] !== undefined) return;
    let cancelado = false;
    traducirOracionArmada(oracionArmada, idioma, tipoOracion)
      .then(texto => {
        if (!cancelado) setTraducciones(t => ({ ...t, [oracionArmada]: texto }));
      })
      .catch(error => {
        console.error('🔴 Error traduciendo oración armada:', error);
        if (!cancelado) setTraducciones(t => ({ ...t, [oracionArmada]: '' }));
      });
    return () => { cancelado = true; };
  }, [correcta, oracionArmada, idioma, tipoOracion, traducciones]);

  return (
    <div className="rounded-2xl bg-[#F3EFFE] border-2 border-purple-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🧩</span>
        <p className="text-[11px] font-black text-purple-800 uppercase tracking-wide">
          Arma tu oración
        </p>
      </div>

      {/* Selectores por pieza — Cambio 2: la píldora muestra SOLO el texto en el idioma enseñado */}
      <div className="space-y-2 mb-4">
        {piezas.map((pieza, i) => {
          const pal = COLORES[colorParaRol(pieza.rol)];
          return (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase w-24 flex-shrink-0 ${pal.text}`}>
                {pieza.rol}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pieza.valores.map((v, j) => {
                  const textoBoton = extraerTextoIdiomaEnsenado(v.texto);
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => {
                        setSeleccion(s => ({ ...s, [i]: v }));
                        narrar(`pieza-${i}-${j}`, textoBoton, idiomaBCP47);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-sm font-black border-2 transition-all cursor-pointer
                        ${seleccion[i]?.texto === v.texto
                          ? `${pal.badge} ${pal.badgeText} border-transparent scale-105`
                          : `bg-white ${pal.text} ${pal.border} hover:scale-105`
                        }`}
                    >
                      {textoBoton}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resultado */}
      <div className={`rounded-xl p-3 text-center transition-all ${
        !completa
          ? 'bg-white/60 border-2 border-dashed border-purple-200'
          : correcta
            ? 'bg-white border-2 border-purple-300'
            : 'bg-amber-50 border-2 border-amber-200'
      }`}>
        <p className={`text-lg font-black italic ${completa ? 'text-slate-800' : 'text-slate-400'}`}>
          {oracionArmada}
        </p>

        {/* Cambio 2: traducción real (IA) solo cuando está completa Y validada como
            correcta — no bloquea el refuerzo de abajo, aparece cuando resuelve.
            Si la traducción falló (string vacío en caché), no se muestra nada. */}
        {correcta && (
          oracionTraducida === undefined ? (
            <div className="mt-1.5 flex justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-purple-400 animate-spin" />
            </div>
          ) : oracionTraducida ? (
            <p className="mt-1 text-xs font-medium text-slate-400">
              {oracionTraducida}
            </p>
          ) : null
        )}

        {correcta && (
          <>
            <p className="mt-2 text-xs font-bold text-green-700">
              ✅ ¡Muy bien! Así se arma la oración.
            </p>
            {/* Cambio 3: botones reales, fila con uno a cada extremo */}
            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <button
                type="button"
                onClick={() => narrar('oracion-armada-completa', oracionArmada, idiomaBCP47)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Escuchar oración completa
              </button>
              <button
                type="button"
                onClick={() => setSeleccion({})}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-white text-purple-700 border-2 border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Limpiar y volver a intentar
              </button>
            </div>
          </>
        )}

        {completa && !correcta && (
          <>
            <p className="mt-2 text-xs font-bold text-amber-700">
              🤔 {conflicto ? mensajeOrientador(conflicto, tipoOracion) : 'Esta combinación no funciona todavía — ajusta y vuelve a intentar.'}
            </p>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setSeleccion({})}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-amber-500 text-white hover:bg-amber-600 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Limpiar y volver a intentar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Tercera Sección — Ejemplos armados (SIN CAMBIOS) ────────────────────────

const EjemplosArmados: React.FC<{
  ejemplos: EjemploGramatical[];
  piezas: PiezaGramatical[];
  narrar: (id: string, texto: string, langOverride?: string, rateOverride?: number) => void;
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
              onNarrar={(id, texto) => narrar(id, texto, idiomaBCP47, RATE_NARRACION_LENTA)}
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

// ─── Orden real de piezas (por posicion) ─────────────────────────────────────
// El array piezas[] que llega de la API puede no coincidir con el orden
// gramatical real de la oración (ej. auxiliar antes que sujeto en
// interrogativa). "posicion" es la fuente de verdad para el orden de render.
// Si falta (sesiones generadas antes de este campo, o parcialmente presente),
// se usa el índice original como clave de respaldo — así se conserva el orden
// tal como vino del array en vez de mezclar piezas con y sin posicion.
function ordenarPorPosicion(piezas: PiezaGramatical[]): PiezaGramatical[] {
  return piezas
    .map((pieza, i) => ({ pieza, clave: pieza.posicion ?? i + 1 }))
    .sort((a, b) => a.clave - b.clave)
    .map(({ pieza }) => pieza);
}

// ─── Validación silenciosa de orden (Bloque 4) ───────────────────────────────
// Contrasta el orden dado por "posicion" contra el orden real en que las
// piezas aparecen en la oración de ejemplo (localizándolas por su
// fragmentoEnOracion, igual que segmentarOracion). Si no coinciden, es señal
// de que la IA asignó mal alguna posicion — se registra en consola para
// depuración, pero NUNCA bloquea ni altera el render de la lección.
function validarOrdenPiezas(
  piezasOrdenadas: PiezaGramatical[],
  conceptos: ConceptoClave[],
  oracion: string
): void {
  if (!oracion) return;
  let ultimoIdx = -1;
  for (const pieza of piezasOrdenadas) {
    const fragmento = fragmentoParaPieza(pieza, conceptos);
    if (!fragmento) continue;
    const idx = oracion.indexOf(fragmento);
    if (idx === -1) continue;
    if (idx < ultimoIdx) {
      console.warn(
        `[GramaticalBlock] "posicion" inconsistente para la pieza "${pieza.rol}" (posicion: ${pieza.posicion ?? '—'}) — aparece antes en el texto de lo que su posicion indica. Oración: "${oracion}"`
      );
    }
    ultimoIdx = idx;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface GramaticalBlockProps {
  apoyoGramatical: ApoyoGramatical;
  condicion?: string;
  conceptos?: ConceptoClave[];
  asignatura?: string;
  tema?: string;
}

const GramaticalBlock: React.FC<GramaticalBlockProps> = ({
  apoyoGramatical,
  condicion = 'general',
  conceptos = [],
  asignatura = '',
  tema = '',
}) => {
  // Hooks siempre antes de cualquier return condicional (Reglas de Hooks de React).
  const { narrar, seccionActiva } = useNarrador('en', condicion);
  const idiomaBCP47 = mapIdiomaABCP47(apoyoGramatical?.idioma ?? '');
  const oracionCanonica = apoyoGramatical?.ejemplos?.[0]?.oracion ?? '';

  // Pictograma único de la lección — mismo asignatura/tema/oración que ya usa
  // ConceptosClaveBlock, para pegarle a la MISMA clave de caché en Firestore y
  // no disparar una generación nueva.
  const [pictogramaUrl, setPictogramaUrl] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (!asignatura || !tema || !oracionCanonica) {
      setPictogramaUrl(null);
      return;
    }
    let cancelado = false;
    setPictogramaUrl(undefined);
    obtenerOGenerarPictogramaGramatical(asignatura, tema, oracionCanonica).then(url => {
      if (!cancelado) setPictogramaUrl(url);
    });
    return () => { cancelado = true; };
  }, [asignatura, tema, oracionCanonica]);

  if (!apoyoGramatical?.piezas?.length) return null;

  const { titulo, idioma, piezas, ejemplos, nota, tipoOracion } = apoyoGramatical;
  const piezasOrdenadas = ordenarPorPosicion(piezas);
  validarOrdenPiezas(piezasOrdenadas, conceptos, oracionCanonica);

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
        {/* Segunda Sección: Estructura */}
        <FormulaIconos piezas={piezasOrdenadas} />

        <VeamosUnEjemplo
          piezas={piezasOrdenadas}
          conceptos={conceptos}
          oracion={oracionCanonica}
          pictogramaUrl={pictogramaUrl}
        />

        <RecuerdaBlock piezas={piezasOrdenadas} />

        <div className="flex flex-col md:flex-row gap-3">
          <EjemploCompletoInterlineado
            oracion={oracionCanonica}
            piezas={piezasOrdenadas}
            conceptos={conceptos}
            seccionActiva={seccionActiva}
            narrar={narrar}
            idiomaBCP47={idiomaBCP47}
          />
          <AsiSeForma piezas={piezasOrdenadas} />
        </div>

        {/* Tercera Sección */}
        <ConstructorOracion piezas={piezasOrdenadas} idioma={idioma} narrar={narrar} idiomaBCP47={idiomaBCP47} tipoOracion={tipoOracion} />
        <EjemplosArmados ejemplos={ejemplos} piezas={piezasOrdenadas} narrar={narrar} seccionActiva={seccionActiva} idiomaBCP47={idiomaBCP47} />

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
