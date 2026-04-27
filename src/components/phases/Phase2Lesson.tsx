import React, { useState, useRef } from 'react';
import {
  Volume2, RefreshCw, CheckCircle, Loader2, ImageOff,
  BookOpen, PencilLine, Monitor, Layers, ArrowLeft, ZoomIn
} from 'lucide-react';
import {
  PerfilNino, SesionGenerada, ASIGNATURAS,
  ExplicacionBloque, Reforzamiento,
  ConceptoClave, VisualSugerido, IntroBloque, ApoyoVisualLeccion,
} from '@/types';
import ApoyoVisualBlock from '../lesson/ApoyoVisualBlock';

import ExamplesBlock from '../lesson/ExamplesBlock';
import { normalizeEjemplos } from '@/utils/normalizeLesson';

// ─────────────────────────────────────────────────────────────────────────────
// Hook de narración por sección — toggle on/off, una sola voz activa
// ─────────────────────────────────────────────────────────────────────────────
function useNarrador(idioma: string, condicion: string) {
    const [seccionActiva, setSeccionActiva] = React.useState<string | null>(null);

    const narrar = (id: string, texto: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        if (seccionActiva === id) {
            // Ya estaba narrando esta sección — detener
            setSeccionActiva(null);
            return;
        }

        const u = new SpeechSynthesisUtterance(texto);
        u.lang = idioma === 'es' ? 'es-ES' : 'en-US';
        u.rate = condicion === 'tea' ? 0.8 : 0.9;
        u.onstart = () => setSeccionActiva(id);
        u.onend = () => setSeccionActiva(null);
        u.onerror = () => setSeccionActiva(null);
        window.speechSynthesis.speak(u);
    };

    const detener = () => {
        window.speechSynthesis?.cancel();
        setSeccionActiva(null);
    };

    return { narrar, detener, seccionActiva };
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizar(raw: unknown): ExplicacionBloque {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;

    // ── Ejemplos ────────────────────────────────────────────────────────────
    const ejemplos = normalizeEjemplos(r.ejemplos);

    // ── Conceptos clave — lee icono, colorRamp y etiqueta ───────────────────
    let conceptosClave: ConceptoClave[] = [];
    if (Array.isArray(r.conceptosClave)) {
      conceptosClave = r.conceptosClave
        .map((c: unknown) => {
          if (typeof c === 'object' && c !== null) {
            const cc = c as Record<string, unknown>;
            return {
              nombre:            typeof cc.nombre            === 'string' ? cc.nombre            : '',
              formula:           typeof cc.formula           === 'string' ? cc.formula           : '',
              uso:               typeof cc.uso               === 'string' ? cc.uso               : '',
              necesidad:         typeof cc.necesidad         === 'string' ? cc.necesidad         : '',
              elementos:         typeof cc.elementos         === 'string' ? cc.elementos         : '',
              apoyoVisual:       typeof cc.apoyoVisual       === 'string' ? cc.apoyoVisual       : '',
              etiqueta:          typeof cc.etiqueta          === 'string' ? cc.etiqueta          : '',
              funcion:           typeof cc.funcion           === 'string' ? cc.funcion           : '',
              explicacionSimple: typeof cc.explicacionSimple === 'string' ? cc.explicacionSimple : '',
              icono:             typeof cc.icono             === 'string' ? cc.icono             : '',
              colorRamp:         typeof cc.colorRamp         === 'string' ? cc.colorRamp         : 'gray',
            };
          }
            return { nombre: '', formula: '', elementos: '', uso: '', etiqueta: '', necesidad: '', apoyoVisual: '', funcion: '', explicacionSimple: '', icono: '', colorRamp: 'gray' };
        })
        .filter(c => c.nombre || c.explicacionSimple);
    }

    // ── visualSugerido — lee icono y colorRamp ──────────────────────────────
    let visualSugerido: VisualSugerido | undefined;
    if (typeof r.visualSugerido === 'object' && r.visualSugerido !== null) {
      const vs = r.visualSugerido as Record<string, unknown>;
      const tiposValidos = ['secuencia','diagrama','comparacion','formula','ninguna'];
      visualSugerido = {
        tipo: (tiposValidos.includes(vs.tipo as string) ? vs.tipo : 'ninguna') as VisualSugerido['tipo'],
        icono:       typeof vs.icono       === 'string' ? vs.icono       : '',
        colorRamp:   typeof vs.colorRamp   === 'string' ? vs.colorRamp   : 'gray',
        descripcion: typeof vs.descripcion === 'string' ? vs.descripcion : '',
        justificacionPedagogica:
          typeof vs.justificacionPedagogica === 'string' ? vs.justificacionPedagogica : '',
      };
    }

    // ── intro — acepta string legacy u objeto nuevo ─────────────────────────
    let intro: string | IntroBloque = '';
    if (typeof r.intro === 'string') {
      intro = r.intro;
    } else if (typeof r.intro === 'object' && r.intro !== null) {
      const ri = r.intro as Record<string, unknown>;
      intro = {
        fraseEnganche: typeof ri.fraseEnganche === 'string' ? ri.fraseEnganche : '',
        ejemploAncla:  typeof ri.ejemploAncla  === 'string' ? ri.ejemploAncla  : '',
        cuerpo:        typeof ri.cuerpo        === 'string' ? ri.cuerpo        : '',
      };
    }

    // ── apoyoVisual — campo a nivel de explicacion ──────────────────────────────
    let apoyoVisual: ApoyoVisualLeccion | undefined;
    if (typeof r.apoyoVisual === 'object' && r.apoyoVisual !== null) {
      const av = r.apoyoVisual as Record<string, unknown>;
      const tiposValidos = ['formula', 'flujo', 'nodos', 'linea_tiempo', 'ciclo', 'reparto'];
      if (typeof av.tipo === 'string' && tiposValidos.includes(av.tipo)) {
        apoyoVisual = {
          tipo: av.tipo as ApoyoVisualLeccion['tipo'],
          titulo: typeof av.titulo === 'string' ? av.titulo : '',
          elementos: Array.isArray(av.elementos) ? av.elementos.map(String) : [],
          asignatura: typeof av.asignatura === 'string' ? av.asignatura : '',
        };
      }
    }

    return {
      objetivo: typeof r.objetivo === 'string' ? r.objetivo : '',
      intro,
      pasos: Array.isArray(r.pasos) ? r.pasos.map(String) : [],
      conceptosClave,
      analogia:  typeof r.analogia  === 'string' ? r.analogia  : '',
      ejemplos,
      apoyoVisual,
      resumen:   typeof r.resumen   === 'string' ? r.resumen   : '',
      visualSugerido,
      chequeoCobertura: Array.isArray(r.chequeoCobertura)
        ? r.chequeoCobertura.map(String)
        : [],
    };
  }

  return {
    objetivo:       '',
    intro:          String(raw || ''),
    pasos:          [],
    conceptosClave: [],
    analogia:       '',
    ejemplos:       [],
    resumen:        '',
    visualSugerido: undefined,
    chequeoCobertura: [],
  };
}




function bloqueATexto(b: ExplicacionBloque): string {
    const introTexto = typeof b.intro === 'string'
        ? b.intro
        : [b.intro.fraseEnganche, b.intro.ejemploAncla, b.intro.cuerpo].filter(Boolean).join('. ');

    const ejs = b.ejemplos
        .map((e) => {
            const pasos = e.pasosGuiados?.map((p) =>
                [p.accionPrincipal ?? p.accion, p.explicacion, p.resultadoParcial].filter(Boolean).join('. ')
            ).join('. ');
            return [e.enunciado, e.explicacionBreve, pasos, e.conclusionPedagogica]
                .filter(Boolean)
                .join('. ');
        })
        .join('. ');

    return [introTexto, ...b.pasos, b.analogia, ejs, b.resumen]
        .filter(Boolean)
        .join('. ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Imagen pedagógica con zoom
// ─────────────────────────────────────────────────────────────────────────────

const ImagenPedagogica: React.FC<{
  url: string;
  tema: string;
  condicion: string;
}> = ({ url, tema, condicion }) => {
  const [zoom, setZoom] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <>
      {/* Imagen inline dentro de la explicación */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/20">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="p-1.5 bg-white/90 rounded-lg shadow-sm border border-border hover:bg-white transition-colors cursor-pointer"
            title="Ver imagen grande"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <img
          src={url}
          alt={`Diagrama de ${tema}`}
          className="w-full object-contain max-h-[320px]"
          onError={() => setError(true)}
        />
         <div className="px-3 py-1.5 bg-muted/40 border-t border-border">
          <p className="text-[11px] font-bold text-muted-foreground text-center">
            🖼️ Imagen pedagógica — {tema}
          </p>
          <p className="text-[11px] text-muted-foreground text-center mt-0.5">
                      🚨 <span className="font-semibold">Nota para el docente: Las etiquetas pueden estar en otro idioma. Úsela como apoyo visual y complemente verbalmente.</span>
          </p>
        </div>
      </div>

      {/* Modal zoom */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoom(false)}
        >
          <div className="relative max-w-3xl w-full">
            <img
              src={url}
              alt={`Diagrama de ${tema}`}
              className="w-full rounded-2xl object-contain max-h-[85vh]"
            />
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center font-black text-lg shadow-lg cursor-pointer"
            >
              ×
            </button>
            <p className="text-white text-center text-sm font-bold mt-3 opacity-70">
              Toca para cerrar
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Ejemplos
// ─────────────────────────────────────────────────────────────────────────────




// ─────────────────────────────────────────────────────────────────────────────
// Conceptos clave
// ─────────────────────────────────────────────────────────────────────────────

// ── Mapa de colores por ramp ────────────────────────────────────────────────
const rampStyles: Record<string, { border: string; bg: string; badge: string; badgeText: string; title: string }> = {
  blue:   { border: 'border-blue-300',   bg: 'bg-blue-50',   badge: 'bg-blue-100',   badgeText: 'text-blue-700',   title: 'text-blue-800'   },
  green:  { border: 'border-green-300',  bg: 'bg-green-50',  badge: 'bg-green-100',  badgeText: 'text-green-700',  title: 'text-green-800'  },
  amber:  { border: 'border-amber-300',  bg: 'bg-amber-50',  badge: 'bg-amber-100',  badgeText: 'text-amber-700',  title: 'text-amber-800'  },
  purple: { border: 'border-purple-300', bg: 'bg-purple-50', badge: 'bg-purple-100', badgeText: 'text-purple-700', title: 'text-purple-800' },
  teal:   { border: 'border-teal-300',   bg: 'bg-teal-50',   badge: 'bg-teal-100',   badgeText: 'text-teal-700',   title: 'text-teal-800'   },
  coral:  { border: 'border-orange-300', bg: 'bg-orange-50', badge: 'bg-orange-100', badgeText: 'text-orange-700', title: 'text-orange-800' },
  pink:   { border: 'border-pink-300',   bg: 'bg-pink-50',   badge: 'bg-pink-100',   badgeText: 'text-pink-700',   title: 'text-pink-800'   },
  gray:   { border: 'border-gray-300',   bg: 'bg-gray-50',   badge: 'bg-gray-100',   badgeText: 'text-gray-600',   title: 'text-gray-800'   },
};

const ConceptosClaveBlock: React.FC<{
    conceptos: NonNullable<ExplicacionBloque['conceptosClave']>;
    fontSize: string;
    seccionActiva: string | null;
    onNarrar: (id: string, texto: string) => void;
}> = ({ conceptos, fontSize, seccionActiva, onNarrar }) => {
    if (!conceptos?.length) return null;

    return (
        <div className="space-y-8">
            <p className="text-[14px] font-black text-primary uppercase tracking-wide px-1">
                🧩 Conceptos importantes:
            </p>

            {conceptos.map((concepto, i) => {
                const ramp = rampStyles[concepto.colorRamp ?? 'gray'] ?? rampStyles.gray;

                return (
                    <div key={i} className="space-y-5 mb-12 border-b border-slate-100 pb-8 last:border-0">

                        {/* 1. BLOQUE: FÓRMULA */}
                        {concepto.formula && (
                            <div className="rounded-2xl bg-[#f3f0ff] p-6 shadow-sm flex flex-col items-center border border-purple-100">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#5b40d6] mb-4">
                                    Fórmula de {concepto.nombre}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap justify-center font-bold">
                                    {concepto.formula.split('+').map((parte, idx) => (
                                        <React.Fragment key={idx}>
                                            <span className={`px-4 py-2 rounded-xl shadow-sm border-2 text-sm ${idx % 3 === 0 ? 'bg-[#fff4e0] text-[#8a5d1a] border-[#ffe0a3]' : idx % 3 === 1 ? 'bg-[#e0f0ff] text-[#1a5d8a] border-[#a3d1ff]' : 'bg-[#f0ffe0] text-[#3d8a1a] border-[#c1ffa3]'}`}>
                                                {parte.trim()}
                                            </span>
                                            {idx < concepto.formula.split('+').length - 1 && (
                                                <span className="text-[#5b40d6] text-xl font-black mx-1">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. BLOQUE: EXPLICACIÓN */}
                        <div className="rounded-2xl border-2 border-l-[6px] border-l-[#5b40d6] border-slate-100 bg-white p-5 shadow-sm">
                            <h4 className="text-[#5b40d6] font-black text-lg mb-1">{concepto.nombre}</h4>
                            <p className="text-slate-700 font-medium leading-relaxed" style={{ fontSize }}>
                                {concepto.explicacionSimple}
                            </p>
                        </div>

                        {/* 3. BLOQUE: LAS PIEZAS (ELEMENTOS) */}
                        {concepto.elementos && (
                            <div className="rounded-2xl bg-[#f8fafc] border-2 border-slate-100 overflow-hidden shadow-sm">
                                {/* Encabezado dinámico */}
                                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                                    <div>
                                        <h5 className="text-[#1a5d8a] font-black text-md">
                                            {/* Si el nombre del concepto es técnico, lo usamos, si no, un título genérico amigable */}
                                            {concepto.nombre ? `Componentes de "${concepto.nombre}"` : "Las piezas clave"}
                                        </h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Análisis de la estructura y reglas
                                        </p>
                                    </div>
                                    <span className="text-xl opacity-40">🧩</span>
                                </div>

                                <div className="p-4 bg-white/40">
                                    <div className="space-y-2">
                                        {/* Separamos cada línea generada por el \n del prompt */}
                                        
                                        {concepto.elementos.replace(/\\n/g, '\n').split('\n').filter(l => l.includes(':')).map((linea, idx) => {
                                            const [izquierda, derecha] = linea.split(':');

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 py-3 px-3 rounded-xl border border-slate-100 bg-white/80 shadow-sm transition-all hover:border-blue-200"
                                                >
                                                    {/* PARTE IZQUIERDA: El elemento técnico (I, He, She / Verbo base) */}
                                                    <div className="min-w-[90px] flex-shrink-0">
                                                        <span className="inline-block w-full text-center font-black text-[#1a5d8a] bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100 shadow-inner" style={{ fontSize }}>
                                                            {izquierda.trim()}
                                                        </span>
                                                    </div>

                                                    {/* CONECTOR VISUAL: La flecha que indica relación */}
                                                    <div className="text-blue-300 font-bold flex-shrink-0">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12h14m-7-7 7 7-7 7" />
                                                        </svg>
                                                    </div>

                                                    {/* PARTE DERECHA: La explicación o transformación */}
                                                    <div className="flex-1">
                                                        <p
                                                            className="text-slate-600 font-bold leading-tight"
                                                            style={{ fontSize: `calc(${fontSize} - 2px)` }}
                                                        >
                                                            {derecha.trim()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 4. BLOQUE: USO (PASO A PASO) */}
                        {concepto.uso && (
                            <div className="rounded-2xl border-2 border-green-100 bg-green-50/30 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-green-100 bg-white flex items-center gap-2">
                                    <div className="bg-green-100 p-1.5 rounded-lg text-lg">⚙️</div>
                                    <div>
                                        <h5 className="text-green-800 font-black text-md">¿Cómo se usa?</h5>
                                        <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider">Guía práctica</p>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    {concepto.uso.split('\n').filter(l => l.trim()).map((paso, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-[11px] font-black flex items-center justify-center mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <p className="text-slate-700 font-semibold" style={{ fontSize: `calc(${fontSize} - 1px)` }}>{paso.trim()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. BLOQUE: NECESIDAD (¿CUÁNDO?) */}
                        {concepto.necesidad && (
                            <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/30 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-amber-100 bg-white flex items-center gap-2">
                                    <div className="bg-amber-100 p-1.5 rounded-lg text-lg">💡</div>
                                    <div>
                                        <h5 className="text-amber-800 font-black text-md">¿Cuándo lo necesito?</h5>
                                        <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider">Momento de aplicación</p>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    {concepto.necesidad.split('\n').filter(l => l.trim()).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-amber-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                            <p className="text-slate-700 font-bold italic" style={{ fontSize: `calc(${fontSize} - 1px)` }}>
                                                {item.trim()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* BLOQUE 6: APOYO VISUAL DINÁMICO UNIVERSAL */}
                        {concepto.apoyoVisual && (
                            <div className="my-6 p-6 rounded-[2rem] bg-slate-50/80 border-2 border-dashed border-slate-200 flex flex-col items-center">
                                {(() => {
                                    const [tipo, titulo, datosRaw] = concepto.apoyoVisual.split('|').map(v => v.trim());
                                    const datos = datosRaw ? datosRaw.split(',').map(d => d.trim()) : [];

                                    return (
                                        <>
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="text-lg">💡</span>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{titulo}</p>
                                            </div>

                                            {/* CASO 1: REPARTO MATEMÁTICO (Tu lógica original) */}
                                            {tipo === 'reparto' && (
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="flex flex-wrap justify-center gap-1.5 max-w-[200px]">
                                                        {[...Array(parseInt(datos[0]))].map((_, i) => (
                                                            <div key={i} className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-sm" />
                                                        ))}
                                                    </div>
                                                    <div className="text-slate-300 font-black text-[10px]">⬇ REPARTIR EN PARTES IGUALES ⬇</div>
                                                    <div className="flex flex-wrap justify-center gap-4">
                                                        {[...Array(parseInt(datos[1]))].map((_, i) => (
                                                            <div key={i} className="w-14 h-14 border-2 border-amber-100 bg-white rounded-2xl flex items-center justify-center relative shadow-sm">
                                                                <div className="flex flex-wrap gap-1 justify-center p-1">
                                                                    {[...Array(parseInt(datos[2]))].map((_, j) => (
                                                                        <div key={j} className="w-2 h-2 bg-amber-400 rounded-full" />
                                                                    ))}
                                                                </div>
                                                                <span className="absolute -bottom-5 text-[8px] font-bold text-slate-400 uppercase">Grupo {i + 1}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* CASO 2: PASOS / LÍNEA DE TIEMPO (Historia, Ciencias) */}
                                            {tipo === 'pasos' && (
                                                <div className="flex flex-col items-start gap-4 w-full max-w-xs">
                                                    {datos.map((text, i) => (
                                                        <div key={i} className="flex items-center gap-3 w-full">
                                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1 p-3 bg-white rounded-xl border border-blue-100 text-[11px] font-medium text-slate-600 shadow-sm">
                                                                {text}
                                                            </div>
                                                            {i < datos.length - 1 && <div className="absolute h-4 w-0.5 bg-blue-100 ml-[11px] mt-12" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* CASO 3: NODOS / CATEGORÍAS (Lenguaje, Inglés, Sociales) */}
                                            {tipo === 'nodos' && (
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {datos.map((text, i) => (
                                                        <div key={i} className={`px-4 py-2 rounded-full border-2 text-[11px] font-bold shadow-sm
                                                            ${i === 0 ? 'bg-indigo-500 border-indigo-500 text-white scale-110 mb-2' : 'bg-white border-indigo-100 text-indigo-600'}`}>
                                                            {text}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// ── Helper para renderizar intro en cualquier formato ──────────────────────
const IntroRenderer: React.FC<{
  intro: string | IntroBloque;
  fontSize: string;
  seccionActiva: string | null;
  onNarrar: (id: string, texto: string) => void;
  colorScheme?: { bg: string; border: string; engancheBg: string; engancheText: string };
}> = ({ intro, fontSize, seccionActiva, onNarrar, colorScheme }) => {
  const cs = colorScheme ?? {
    bg: 'bg-blue-50', border: 'border-blue-400',
    engancheBg: 'bg-blue-100', engancheText: 'text-blue-800',
  };

  if (typeof intro === 'string') {
    return (
      <div className={`p-4 ${cs.bg} border-l-4 ${cs.border} rounded-r-xl`}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-foreground" style={{ fontSize }}>{intro}</p>
          <BtnNarrar id="intro" texto={intro} seccionActiva={seccionActiva} onNarrar={onNarrar} />
        </div>
      </div>
    );
  }

  const textoNarracion = [intro.fraseEnganche, intro.ejemploAncla, intro.cuerpo].filter(Boolean).join('. ');

  return (
    <div className={`rounded-xl border-l-4 ${cs.border} ${cs.bg} overflow-hidden`}>
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-1">
        <div className="flex-1 space-y-2">
          {/* Frase de enganche */}
          {intro.fraseEnganche && (
            <p className={`font-black text-base ${cs.engancheText}`} style={{ fontSize }}>
              {intro.fraseEnganche}
            </p>
          )}
          {/* Ejemplo ancla */}
          {intro.ejemploAncla && (
            <div className={`px-3 py-2 rounded-lg ${cs.engancheBg} border border-current/10`}>
              <p className="font-bold text-foreground text-sm italic">{intro.ejemploAncla}</p>
            </div>
          )}
          {/* Cuerpo */}
          {intro.cuerpo && (
            <p className="font-semibold text-foreground leading-relaxed text-sm pb-1">{intro.cuerpo}</p>
          )}
        </div>
        <BtnNarrar id="intro" texto={textoNarracion} seccionActiva={seccionActiva} onNarrar={onNarrar} />
      </div>
    </div>
  );
};

const ExplicacionRenderer: React.FC<{
  bloque: ExplicacionBloque;
  condicion: string;
  fontSize: string;
  imagenUrl?: string;
  tema: string;
  idioma: string;

}> = ({ bloque, condicion, fontSize, imagenUrl, tema, idioma }) => {
    const isTEA = condicion === 'tea';
    const isTDAH = condicion === 'tdah';
    const isDown = condicion === 'down';
    const isDislexia = condicion === 'dislexia';
    const isDiscalculia = condicion === 'discalculia';
    const isDisgrafia = condicion === 'disgrafia';
    const isGeneral = condicion === 'general';
    const isNinguna = condicion === 'ninguna';

    const { narrar, seccionActiva } = useNarrador(idioma, condicion);

  // Imágenes externas desactivadas — el sistema usa iconos y visuales propios
  const imagenBloque = null;


  if (isTEA) {
      return (
        <div className="space-y-3" style={{ fontSize, lineHeight: '1.9' }}>

          {/* INTRO */}
          <IntroRenderer
            intro={bloque.intro}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
            colorScheme={{ bg: 'bg-blue-50', border: 'border-blue-400', engancheBg: 'bg-blue-100', engancheText: 'text-blue-800' }}
          />

          {/* Imagen */}
          {imagenBloque}

          {/* PASOS */}
          
        {/* CONCEPTOS CLAVE O PASOS */}
        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wide px-1">
              Lo que vamos a aprender:
            </p>
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white border border-border rounded-xl">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                <BtnNarrar
                  id={`paso-${i}`}
                  texto={paso}
                  seccionActiva={seccionActiva}
                  onNarrar={narrar}
                />
              </div>
            ))}
          </div>
        ) : null}

          {/* ANALOGÍA */}
          {bloque.analogia && (
            <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-purple-600 uppercase tracking-wide mb-1">🔗 Esto es como...</p>
                  <p className="font-semibold text-foreground">{bloque.analogia}</p>
                </div>
                <BtnNarrar id="analogia" texto={bloque.analogia} seccionActiva={seccionActiva} onNarrar={narrar} />
              </div>
            </div>
          )}

          {/* EJEMPLOS */}
         
           {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />
        
          {/* RESUMEN */}
          {bloque.resumen && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wide mb-1">⭐ Recuerda</p>
                  <p className="font-black text-foreground">{bloque.resumen}</p>
                </div>
                <BtnNarrar id="resumen" texto={bloque.resumen} seccionActiva={seccionActiva} onNarrar={narrar} />
              </div>
            </div>
          )}

        </div>
      );
  }

   if (isTDAH) {
      return (
        <div className="space-y-3" style={{ fontSize, lineHeight: '1.9' }}>

          {/* INTRO */}
          <IntroRenderer
            intro={bloque.intro}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
            colorScheme={{ bg: 'bg-blue-50', border: 'border-blue-400', engancheBg: 'bg-blue-100', engancheText: 'text-blue-800' }}
          />

          {/* Imagen */}
          {imagenBloque}

          {/* PASOS */}
          
            {/* CONCEPTOS CLAVE O PASOS */}
            {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
              <ConceptosClaveBlock
                conceptos={bloque.conceptosClave}
                fontSize={fontSize}
                seccionActiva={seccionActiva}
                onNarrar={narrar}
              />
            ) : bloque.pasos.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide px-1">
                  Lo que vamos a aprender:
                </p>
                {bloque.pasos.map((paso, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white border border-border rounded-xl">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                    <BtnNarrar
                      id={`paso-${i}`}
                      texto={paso}
                      seccionActiva={seccionActiva}
                      onNarrar={narrar}
                    />
                  </div>
                ))}
              </div>
            ) : null}

          {/* ANALOGÍA */}
          {bloque.analogia && (
            <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-purple-600 uppercase tracking-wide mb-1">🔗 Esto es como...</p>
                  <p className="font-semibold text-foreground">{bloque.analogia}</p>
                </div>
                <BtnNarrar id="analogia" texto={bloque.analogia} seccionActiva={seccionActiva} onNarrar={narrar} />
              </div>
            </div>
          )}

          {/* EJEMPLOS */}
         
             
          {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />
        
          {/* RESUMEN */}
          {bloque.resumen && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wide mb-1">⭐ Recuerda</p>
                  <p className="font-black text-foreground">{bloque.resumen}</p>
                </div>
                <BtnNarrar id="resumen" texto={bloque.resumen} seccionActiva={seccionActiva} onNarrar={narrar} />
              </div>
            </div>
          )}

        </div>
      );
  }

// Down
if (isDown) {
  return (
    <div className="space-y-4" style={{ fontSize, lineHeight: '2' }}>
      <IntroRenderer
        intro={bloque.intro}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
        colorScheme={{ bg: 'bg-pink-50', border: 'border-pink-400', engancheBg: 'bg-pink-100', engancheText: 'text-pink-800' }}
      />
      {imagenBloque}

        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-2">
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-pink-50 border border-pink-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500 text-white text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                <BtnNarrar
                  id={`paso-${i}`}
                  texto={paso}
                  seccionActiva={seccionActiva}
                  onNarrar={narrar}
                />
              </div>
            ))}
          </div>
        ) : null}

      {bloque.analogia && (
        <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-xl">
          <div className="lesson-block-label text-teo-purple">🔗 Analogía</div>
          <p className="font-semibold text-foreground/90">{bloque.analogia}</p>
        </div>
      )}

      
      {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

      {bloque.resumen && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl">
          <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wide mb-1">⭐ Para recordar</p>
          <p className="font-bold text-foreground">{bloque.resumen}</p>
        </div>
      )}
    </div>
  );
}

// Dislexia
if (isDislexia) {
  return (
    <div className="space-y-4" style={{ fontSize, lineHeight: '2.1' }}>
      <IntroRenderer
        intro={bloque.intro}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
        colorScheme={{ bg: 'bg-sky-50', border: 'border-sky-400', engancheBg: 'bg-sky-100', engancheText: 'text-sky-800' }}
      />
      {imagenBloque}

        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-3">
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border-2 border-sky-100">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-500 text-white text-sm font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                  <BtnNarrar
                    id={`paso-${i}`}
                    texto={paso}
                    seccionActiva={seccionActiva}
                    onNarrar={narrar}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null} 
    {bloque.analogia && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
          <div className="lesson-block-label text-sky-700">🔗 Analogía</div>
          <p className="font-semibold text-foreground/90">{bloque.analogia}</p>
        </div>
      )}

      {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

      {bloque.resumen && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-[11px] font-black text-amber-700 uppercase tracking-wide mb-1">⭐ Para recordar</p>
          <p className="font-bold text-foreground">{bloque.resumen}</p>
        </div>
      )}
    </div>
  );
}

// Discalculia
if (isDiscalculia) {
  return (
    <div className="space-y-4" style={{ fontSize, lineHeight: '1.9' }}>
      <IntroRenderer
        intro={bloque.intro}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
        colorScheme={{ bg: 'bg-orange-50', border: 'border-orange-400', engancheBg: 'bg-orange-100', engancheText: 'text-orange-800' }}
      />
      {imagenBloque}

        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wide px-1">
              Paso a paso
            </p>
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                <BtnNarrar
                  id={`paso-${i}`}
                  texto={paso}
                  seccionActiva={seccionActiva}
                  onNarrar={narrar}
                />
              </div>
            ))}
          </div>
        ) : null}
      {bloque.analogia && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="lesson-block-label text-yellow-700">🧠 Pista para entenderlo</div>
          <p className="font-semibold text-foreground/90">{bloque.analogia}</p>
        </div>
      )}

      {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

      {bloque.resumen && (
        <div className="p-4 bg-orange-50 border border-orange-300 rounded-xl">
          <p className="text-[11px] font-black text-orange-700 uppercase tracking-wide mb-1">⭐ Recuerda</p>
          <p className="font-bold text-foreground">{bloque.resumen}</p>
        </div>
      )}
    </div>
  );
}

// Disgrafía
if (isDisgrafia) {
  return (
    <div className="space-y-4" style={{ fontSize, lineHeight: '1.9' }}>
      <IntroRenderer
        intro={bloque.intro}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
        colorScheme={{ bg: 'bg-green-50', border: 'border-green-400', engancheBg: 'bg-green-100', engancheText: 'text-green-800' }}
      />
      {imagenBloque}

        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-2">
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                <BtnNarrar
                  id={`paso-${i}`}
                  texto={paso}
                  seccionActiva={seccionActiva}
                  onNarrar={narrar}
                />
              </div>
            ))}
          </div>
        ) : null}

      {bloque.analogia && (
        <div className="lesson-block-analogy">
          <div className="lesson-block-label text-emerald-700">🔗 Para imaginarlo mejor</div>
          <p className="font-semibold text-foreground/90">{bloque.analogia}</p>
        </div>
      )}

      {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

      {bloque.resumen && (
        <div className="p-4 bg-lime-50 border border-lime-200 rounded-xl">
          <p className="text-[11px] font-black text-lime-700 uppercase tracking-wide mb-1">⭐ Idea importante</p>
          <p className="font-bold text-foreground">{bloque.resumen}</p>
        </div>
      )}
    </div>
  );
}

// General o ninguna
if (isGeneral || isNinguna) {
  return (
    <div className="space-y-4" style={{ fontSize, lineHeight: '1.8' }}>
      <IntroRenderer
        intro={bloque.intro}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
        colorScheme={{ bg: 'bg-blue-50', border: 'border-blue-300', engancheBg: 'bg-blue-100', engancheText: 'text-blue-700' }}
      />
      {imagenBloque}

        {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
          <ConceptosClaveBlock
            conceptos={bloque.conceptosClave}
            fontSize={fontSize}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        ) : bloque.pasos.length > 0 ? (
          <div className="space-y-2">
            {bloque.pasos.map((paso, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
                <BtnNarrar
                  id={`paso-${i}`}
                  texto={paso}
                  seccionActiva={seccionActiva}
                  onNarrar={narrar}
                />
              </div>
            ))}
          </div>
        ) : null}

      {bloque.analogia && (
        <div className="lesson-block-analogy">
          <div className="lesson-block-label text-teo-purple">🔗 Analogía</div>
          <p className="font-semibold text-foreground/90">{bloque.analogia}</p>
          <BtnNarrar
            id="analogia"
            texto={bloque.analogia}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        </div>
      )}

      {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

      {bloque.resumen && (
        <div className="p-4 bg-teo-yellow/10 border border-teo-yellow/30 rounded-xl">
          <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wide mb-1">⭐ Para recordar</p>
          <p className="font-bold text-foreground">{bloque.resumen}</p>
          <BtnNarrar
            id="resumen"
            texto={bloque.resumen}
            seccionActiva={seccionActiva}
            onNarrar={narrar}
          />
        </div>
      )}
    </div>
  );
}

// Fallback
return (
  <div className="space-y-4" style={{ fontSize, lineHeight: '1.8' }}>
    <IntroRenderer
      intro={bloque.intro}
      fontSize={fontSize}
      seccionActiva={seccionActiva}
      onNarrar={narrar}
    />
    {imagenBloque}

    {bloque.conceptosClave && bloque.conceptosClave.length > 0 ? (
      <ConceptosClaveBlock
        conceptos={bloque.conceptosClave}
        fontSize={fontSize}
        seccionActiva={seccionActiva}
        onNarrar={narrar}
      />
    ) : bloque.pasos.length > 0 ? (
      <div className="space-y-2">
        {bloque.pasos.map((paso, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">
              {i + 1}
            </span>
            <p className="font-semibold text-foreground leading-relaxed flex-1">{paso}</p>
            <BtnNarrar
              id={`paso-${i}`}
              texto={paso}
              seccionActiva={seccionActiva}
              onNarrar={narrar}
            />
          </div>
        ))}
      </div>
    ) : null}

    {bloque.apoyoVisual && (
              <ApoyoVisualBlock apoyoVisual={bloque.apoyoVisual} />
            )}
            <ExamplesBlock ejemplos={bloque.ejemplos} />

    {bloque.resumen && (
      <div className="p-4 bg-teo-yellow/10 border border-teo-yellow/30 rounded-xl">
        <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wide mb-1">⭐ Para recordar</p>
        <p className="font-bold text-foreground">{bloque.resumen}</p>
      </div>
    )}
  </div>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// Bloque de Reforzamiento
// ─────────────────────────────────────────────────────────────────────────────

const tipoConfig = {
  fisico:  { icono: <PencilLine className="w-4 h-4" />, label: 'En tu cuaderno',   color: 'bg-amber-50 border-amber-200 text-amber-800' },
  digital: { icono: <Monitor   className="w-4 h-4" />, label: 'Actividad digital', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  hibrido: { icono: <Layers    className="w-4 h-4" />, label: 'Práctica mixta',    color: 'bg-purple-50 border-purple-200 text-purple-800' },
};

const ReforzamientoBlock: React.FC<{
  reforzamiento: Reforzamiento;
  condicion: string;
  fontSize: string;
  onComplete: () => void;
  onBack: () => void;
}> = ({ reforzamiento, condicion, fontSize, onComplete, onBack }) => {
  const [actividadIdx, setActividadIdx] = useState(0);
  const [seleccion, setSeleccion]       = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [completadas, setCompletadas]   = useState(0);
  const isTEA = condicion === 'tea';

  const actividades = reforzamiento.actividades || [];
  const actual = actividades[actividadIdx];
  const todasListas = completadas >= actividades.length;

  const handleSiguiente = () => {
    const nuevas = completadas + 1;
    setCompletadas(nuevas);
    if (actividadIdx < actividades.length - 1) {
      setActividadIdx(i => i + 1);
      setSeleccion(null);
      setMostrarFeedback(false);
    } else {
      onComplete();
    }
  };

  if (!actual || todasListas) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver a la lección
        </button>
        <div className={`p-6 rounded-2xl bg-gradient-to-br from-teo-green/10 to-primary/10 border-2 border-teo-green/30 text-center ${!isTEA ? 'animate-fade-in' : ''}`}>
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-black text-foreground text-lg">¡Práctica completada!</p>
          <p className="text-muted-foreground text-sm font-medium mt-1">Ya estás listo para los juegos</p>
        </div>
      </div>
    );
  }

  const cfg = tipoConfig[actual.tipo] || tipoConfig.digital;
  const esCorrecta = actual.verificacion && seleccion !== null &&
    actual.verificacion.opciones[seleccion]?.correcta;

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Lección
        </button>
        <div className="flex-1 border-b border-border pb-2">
          <h3 className="font-black text-foreground text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> {reforzamiento.titulo}
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{reforzamiento.descripcion}</p>
        </div>
      </div>

      {/* Progreso */}
      <div className="flex gap-1.5">
        {actividades.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
            i < completadas ? 'bg-teo-green' : i === actividadIdx ? 'bg-primary' : 'bg-muted'
          }`} />
        ))}
      </div>

      {/* Tarjeta actividad */}
      <div className={`rounded-2xl border-2 overflow-hidden ${!isTEA ? 'animate-fade-in' : ''}`}>
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${cfg.color}`}>
          {cfg.icono}
          <span className="text-xs font-black uppercase tracking-wide">{cfg.label}</span>
          <span className="ml-auto text-xs font-bold opacity-70">{actividadIdx + 1} / {actividades.length}</span>
        </div>

        <div className="p-5 bg-white space-y-4">
          <p className="font-bold text-foreground leading-relaxed" style={{ fontSize }}>
            {actual.instruccion}
          </p>

          {actual.contexto && (
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl">
              <span className="text-base flex-shrink-0">📦</span>
              <p className="text-sm font-medium text-muted-foreground">{actual.contexto}</p>
            </div>
          )}

          {actual.verificacion && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="font-black text-foreground text-sm">{actual.verificacion.pregunta}</p>
              <div className="space-y-2">
                {actual.verificacion.opciones.map((op, i) => {
                  let cls = 'border-border bg-white hover:border-primary/50 hover:bg-primary/5';
                  if (mostrarFeedback) {
                    if (op.correcta) cls = 'border-teo-green bg-green-50';
                    else if (seleccion === i) cls = 'border-red-400 bg-red-50';
                    else cls = 'border-border bg-white opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { if (!mostrarFeedback) { setSeleccion(i); setMostrarFeedback(true); } }}
                      disabled={mostrarFeedback}
                      className={`w-full text-left p-3.5 rounded-xl border-2 font-semibold transition-all cursor-pointer disabled:cursor-default flex items-center gap-3 ${cls}`}
                      style={{ fontSize }}
                    >
                      <span className="w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center text-xs font-black">
                        {mostrarFeedback
                          ? (op.correcta ? '✓' : seleccion === i ? '✗' : String.fromCharCode(65 + i))
                          : String.fromCharCode(65 + i)}
                      </span>
                      {op.texto}
                    </button>
                  );
                })}
              </div>
              {mostrarFeedback && (
                <div className={`p-3 rounded-xl font-bold text-sm ${esCorrecta ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                  {esCorrecta ? '✅ ¡Correcto! Excelente.' : '🔄 Casi — la respuesta correcta está marcada en verde.'}
                </div>
              )}
            </div>
          )}

          {(actual.tipo === 'fisico' || mostrarFeedback) && (
            <button
              type="button"
              onClick={handleSiguiente}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              {actividadIdx < actividades.length - 1 ? '→ Siguiente actividad' : '✅ ¡Terminé la práctica!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

interface Phase2LessonProps {
  perfil: PerfilNino;
  sesion: SesionGenerada;
  onComplete: (tiempo: number) => void;
}

type SubFase = 'leccion' | 'reforzamiento';

const Phase2Lesson: React.FC<Phase2LessonProps> = ({ perfil, sesion, onComplete }) => {
  const [subFase, setSubFase]               = useState<SubFase>('leccion');
  const [explicacionIndex, setExplicacionIndex] = useState(0);
  const [speaking, setSpeaking]             = useState(false);
  const [reforzamientoCompleto, setReforzamientoCompleto] = useState(false);
  const startTime = useRef(Date.now());

  const isTEA      = perfil.condicion === 'tea';
  const isDown     = perfil.condicion === 'down';
  const isDislexia = perfil.condicion === 'dislexia';
  const fontSize   = isDown ? '20px' : isDislexia ? '18px' : '16px';
  const asignaturaInfo = ASIGNATURAS[perfil.asignatura];

  const explicaciones = [
    normalizar(sesion.explicacion),
    normalizar(sesion.explicacionAlternativa1),
    normalizar(sesion.explicacionAlternativa2),
  ];
  const bloqueActual = explicaciones[explicacionIndex];

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const texto = subFase === 'leccion'
      ? bloqueATexto(bloqueActual)
      : (sesion.reforzamiento?.descripcion || '');
    const u = new SpeechSynthesisUtterance(texto);
    u.lang  = perfil.idioma === 'es' ? 'es-ES' : 'en-US';
    u.rate  = isTEA ? 0.8 : 0.9;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleEntendi = () => {
    window.speechSynthesis?.cancel();
    if (sesion.reforzamiento?.actividades?.length) {
      setSubFase('reforzamiento');
    } else {
      finalizarFase();
    }
  };

  const handleVolverLeccion = () => {
    window.speechSynthesis?.cancel();
    setSubFase('leccion');
    setReforzamientoCompleto(false);
  };

  const finalizarFase = () => {
    window.speechSynthesis?.cancel();
    onComplete(Math.round((Date.now() - startTime.current) / 1000));
  };

  const labelSimplificacion = explicacionIndex === 0 ? null
        : explicacionIndex === 1 ? 'Versión desarrollada'
            : 'Versión desarrollada';

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 ${!isTEA ? 'animate-slide-up' : ''}`}>
      <div className="bg-white rounded-[16px] shadow-lg border border-border w-full max-w-2xl overflow-hidden">

        {/* ── Header compacto (sin imagen hero) ── */}
        <div className="px-6 pt-5 pb-3 border-b border-border/50">
          <h2 className={`font-black text-foreground leading-tight ${isDown ? 'text-[26px]' : 'text-[22px] sm:text-[26px]'}`}>
            {perfil.tema}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border bg-primary/10 border-primary/20 text-primary">
              {asignaturaInfo?.emoji} {asignaturaInfo?.label}
            </span>
            {labelSimplificacion && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-teo-orange/10 border border-teo-orange/20 text-teo-orange">
                💡 {labelSimplificacion}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
              subFase === 'leccion'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {subFase === 'leccion' ? '📖 Aprendizaje' : '✏️ Práctica'}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-5">

          {/* ══ SUB-FASE: LECCIÓN ══ */}
          {subFase === 'leccion' && (
            <>
              {/* Imagen pedagógica integrada dentro del renderer */}
              <ExplicacionRenderer
                bloque={bloqueActual}
                condicion={perfil.condicion}
                fontSize={fontSize}
                imagenUrl={sesion.imagenUrl}
                tema={perfil.tema}
                idioma={perfil.idioma}
              />

              {/* Controles */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {explicacionIndex < 2 ? (
                  <button
                    type="button"
                    onClick={() => setExplicacionIndex(i => i + 1)}
                    className="child-btn flex items-center justify-center gap-2 flex-1 font-black py-3.5 rounded-xl border-2 border-teo-orange/40 text-teo-orange bg-[#FFF7ED] hover:bg-teo-orange/10 transition-all cursor-pointer text-sm"
                  >
                    <RefreshCw className="w-5 h-5" />
                    🤔 Saber más
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm text-muted-foreground font-bold">
                    <span>📌</span> Esta es la explicación más profunda recomendada
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleEntendi}
                className="child-btn w-full bg-teo-green text-white font-black text-lg py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: '52px' }}
              >
                <CheckCircle className="w-6 h-6" />
                ✅ ¡Lo entendí! — Vamos a practicar
              </button>
            </>
          )}

          {/* ══ SUB-FASE: REFORZAMIENTO ══ */}
          {subFase === 'reforzamiento' && sesion.reforzamiento && (
            <>
              <ReforzamientoBlock
                reforzamiento={sesion.reforzamiento}
                condicion={perfil.condicion}
                fontSize={fontSize}
                onComplete={() => setReforzamientoCompleto(true)}
                onBack={handleVolverLeccion}
              />
              {reforzamientoCompleto && (
                <button
                  type="button"
                  onClick={finalizarFase}
                  className="child-btn w-full bg-teo-green text-white font-black text-lg py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  style={{ minHeight: '52px' }}
                >
                  🎮 ¡A los juegos!
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phase2Lesson;
