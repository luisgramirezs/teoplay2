import React, { useState, useRef } from 'react';
import {
    Volume2, CheckCircle,
    BookOpen, PencilLine, Monitor, Layers, ArrowLeft
} from 'lucide-react';
import {
    PerfilNino, SesionGenerada, ASIGNATURAS,
    ExplicacionBloque, Reforzamiento,
    ConceptoClave, VisualSugerido, IntroBloque, ApoyoVisualLeccion, ApoyoGramatical,
} from '@/types';
import { normalizeEjemplos } from '@/utils/normalizeLesson';
//import { resolveLucideIcon } from "@/utils/iconResolver";
import { resolveVisual } from "@/utils/iconResolver";
import ApoyoVisualBlock from '../lesson/ApoyoVisualBlock';
import ExamplesBlock from '../lesson/ExamplesBlock';
import { buscarImagenWikimedia } from '@/lib/api';
import GramaticalBlock from '../lesson/GramaticalBlock';
import { buscarImagenConcepto } from '@/lib/api';
import { buildConceptoWikimediaQuery } from '@/utils/wikimediaQueryDictionary';
import { buscarVideoYoutube } from '@/utils/youtubeSearch';


import SeccionIntro from '../lesson/SeccionIntro';
import SeccionVisual from '../lesson/SeccionVisual';
import SeccionVideo from '../lesson/SeccionVideo';
import SeccionResumen from '../lesson/SeccionResumen';
import Phase3Games from '@/components/phases/Phase3Games';



// ─────────────────────────────────────────────────────────────────────────────
// Hook de narración por sección — toggle on/off, una sola voz activa
// ─────────────────────────────────────────────────────────────────────────────
function useNarrador(idioma: string, condicion: string) {
    const [seccionActiva, setSeccionActiva] = React.useState<string | null>(null);

    const narrar = (id: string, texto: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        if (seccionActiva === id) {
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

function buildWikimediaQuery(obra: any) {
    const titulo = obra?.titulo?.trim() || '';
    const autor = obra?.autor?.trim() || '';
    const epoca = obra?.epoca?.trim() || '';

    // fallback inteligente para mejorar búsqueda en Wikimedia
    if (titulo && autor) return `${titulo} ${autor}`;
    if (titulo) return titulo;
    if (autor) return autor;

    // nuevo 4.3.4: fallback pedagógico contextual
    if (epoca) return `${epoca} arte pintura`;

    return 'arte pintura obra clasica';
}

function buildWikimediaOptions(tema: string) {
    return [
        `${tema} pintura famosa`,
        `${tema} arte obra clasica`,
        `${tema} pintura historia del arte`,
    ];
}

function generarObrasArte(tema: string) {
    return [
        {
            titulo: `${tema} I`,
            autor: "Obra representativa",
            query: `${tema} pintura famosa`
        },
        {
            titulo: `${tema} II`,
            autor: "Obra clásica",
            query: `${tema} arte barroco pintura`
        },
        {
            titulo: `${tema} III`,
            autor: "Obra histórica",
            query: `${tema} historia del arte pintura`
        }
    ];
}

const handleOpenWikimedia = async (obra: any) => {
    const query = buildWikimediaQuery(obra);
    const img = await buscarImagenWikimedia(query);
    console.log("IMAGEN:", img);
};



/////// NORMALIZAR ///////////////

// Define los colores permitidos una sola vez para toda la función
const COLORES_PERMITIDOS = ["gray", "blue", "green", "amber", "purple", "teal", "coral", "pink"] as const;
type ColorRamp = typeof COLORES_PERMITIDOS[number];

function normalizar(raw: unknown): ExplicacionBloque {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const r = raw as Record<string, unknown>;

        // 1. Procesar Conceptos Clave
        let conceptosClave: ConceptoClave[] = [];
        if (Array.isArray(r.conceptosClave)) {
            conceptosClave = r.conceptosClave
                //.map((c: unknown) => {
                .map((c: unknown): ConceptoClave | null => {
                    if (typeof c === 'object' && c !== null) {
                        const cc = c as Record<string, unknown>;
                        const rawColor = typeof cc.colorRamp === 'string' ? cc.colorRamp : 'gray';

                        return {
                            nombre: typeof cc.nombre === 'string' ? cc.nombre : '',
                            formula: typeof cc.formula === 'string' ? cc.formula : '',
                            elementos: typeof cc.elementos === 'string' ? cc.elementos : '',
                            componentes: typeof cc.componentes === 'string' ? cc.componentes : '',
                            miembros: typeof cc.miembros === 'string' ? cc.miembros : '',
                            uso: typeof cc.uso === 'string' ? cc.uso : '',
                            necesidad: typeof cc.necesidad === 'string' ? cc.necesidad : '',
                            ejemploPedagogico: typeof cc.ejemploPedagogico === 'string' ? cc.ejemploPedagogico : '',
                            explicacionSimple: typeof cc.explicacionSimple === 'string' ? cc.explicacionSimple : '',

                            apoyoVisual: typeof cc.apoyoVisual === 'string' ? cc.apoyoVisual : '',
                            etiqueta: typeof cc.etiqueta === 'string' ? cc.etiqueta : '',
                            funcion: typeof cc.funcion === 'string' ? cc.funcion : '',
                            //explicacionSimple: typeof cc.explicacionSimple === 'string' ? cc.explicacionSimple : '',
                            icono: typeof cc.icono === 'string' ? cc.icono : '',
                            colorRamp: COLORES_PERMITIDOS.includes(rawColor as any) ? (rawColor as ColorRamp) : 'gray',
                            apoyoGramatical: (r.apoyoGramatical as any) ?? null,
                        };
                    }
                    return null;
                })
                .filter((c): c is ConceptoClave => c !== null);
        }

        // 2. Procesar Visual Sugerido
        let visualSugerido: VisualSugerido | undefined;
        if (typeof r.visualSugerido === 'object' && r.visualSugerido !== null) {
            const vs = r.visualSugerido as Record<string, unknown>;
            const tiposValidos = ['secuencia', 'diagrama', 'comparacion', 'formula', 'ninguna'];
            const vsColor = typeof vs.colorRamp === 'string' ? vs.colorRamp : 'gray';

            visualSugerido = {
                tipo: (tiposValidos.includes(vs.tipo as string) ? vs.tipo : 'ninguna') as VisualSugerido['tipo'],
                icono: typeof vs.icono === 'string' ? vs.icono : '',
                colorRamp: COLORES_PERMITIDOS.includes(vsColor as any) ? (vsColor as ColorRamp) : 'gray',
                descripcion: typeof vs.descripcion === 'string' ? vs.descripcion : '',
                justificacionPedagogica: typeof vs.justificacionPedagogica === 'string' ? vs.justificacionPedagogica : '',
            };
        }

        // 3. Procesar Intro
        let intro: string | IntroBloque = '';
        if (typeof r.intro === 'string') {
            intro = r.intro;
        } else if (typeof r.intro === 'object' && r.intro !== null) {
            const ri = r.intro as Record<string, unknown>;
            intro = {
                fraseEnganche: typeof ri.fraseEnganche === 'string' ? ri.fraseEnganche : '',
                ejemploAncla: typeof ri.ejemploAncla === 'string' ? ri.ejemploAncla : '',
                cuerpo: typeof ri.cuerpo === 'string' ? ri.cuerpo : '',
            };
        }

        // 4. Procesar Apoyo Visual
        let apoyoVisual: ApoyoVisualLeccion | undefined;
        if (typeof r.apoyoVisual === 'object' && r.apoyoVisual !== null) {
            const av = r.apoyoVisual as Record<string, unknown>;
            const tiposValidos = [
                'formula', 'flujo', 'nodos', 'linea_tiempo', 'ciclo', 'reparto',
                'fraccion', 'recta_numerica', 'geometria', 'agrupacion',
                'fuerzas', 'molecula', 'reaccion'
            ];

            if (typeof av.tipo === 'string' && tiposValidos.includes(av.tipo)) {
                apoyoVisual = {
                    tipo: av.tipo as ApoyoVisualLeccion['tipo'],
                    titulo: typeof av.titulo === 'string' ? av.titulo : '',
                    elementos: Array.isArray(av.elementos) ? av.elementos.map(String) : [],
                    asignatura: typeof av.asignatura === 'string' ? av.asignatura : '',
                    instruccionVisual: typeof av.instruccionVisual === 'string' ? av.instruccionVisual : 'Observa con atención.',
                    justificacionCalidad: typeof av.justificacionCalidad === 'string' ? av.justificacionCalidad : 'Contenido generado.',
                    items: Array.isArray(av.items)
                        ? av.items.map((it, index) => {
                            const item = it as Record<string, unknown>;
                            return {
                                id: typeof item.id === 'string' ? item.id : `item-${index}`,
                                label: typeof item.label === 'string' ? item.label : '',
                                title: typeof item.title === 'string' ? item.title : '',
                                description: typeof item.description === 'string' ? item.description : '',
                                shortLabel: typeof item.shortLabel === 'string' ? item.shortLabel : '',
                                meta: typeof item.meta === 'string' ? item.meta : '',
                            };
                        })
                        : undefined,
                };
            }
        }

        // Return final
        return {
            objetivo: typeof r.objetivo === 'string' ? r.objetivo : '',
            intro,
            pasos: Array.isArray(r.pasos) ? r.pasos.map(String) : [],
            conceptosClave,
            analogia: typeof r.analogia === 'string' ? r.analogia : '',
            ejemplos: normalizeEjemplos(r.ejemplos),
            apoyoVisual,
            resumen: typeof r.resumen === 'string' ? r.resumen : '',
            visualSugerido,
            chequeoCobertura: Array.isArray(r.chequeoCobertura) ? r.chequeoCobertura.map(String) : [],
        };
    }

    // Fallback completo si 'raw' no es un objeto válido
    return {
        objetivo: '',
        intro: '',
        pasos: [],
        conceptosClave: [],
        analogia: '',
        ejemplos: [],
        resumen: '',
        visualSugerido: undefined,
        apoyoVisual: undefined,
        chequeoCobertura: [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Conceptos clave
// ─────────────────────────────────────────────────────────────────────────────
const cardPalette = [
    { step: 'bg-[#F97316]', iconBg: 'bg-[#FFF0E8]', iconText: 'text-[#F97316]', nameText: 'text-[#F97316]', exampleBg: 'bg-[#FFF0E8]' },
    { step: 'bg-[#3B82F6]', iconBg: 'bg-[#EFF6FF]', iconText: 'text-[#3B82F6]', nameText: 'text-[#3B82F6]', exampleBg: 'bg-[#EFF6FF]' },
    { step: 'bg-[#22C55E]', iconBg: 'bg-[#F0FFF4]', iconText: 'text-[#22C55E]', nameText: 'text-[#22C55E]', exampleBg: 'bg-[#F0FFF4]' },
    { step: 'bg-[#7C3AED]', iconBg: 'bg-[#F3EFFE]', iconText: 'text-[#7C3AED]', nameText: 'text-[#7C3AED]', exampleBg: 'bg-[#F3EFFE]' },
    { step: 'bg-[#0E9E8A]', iconBg: 'bg-[#E0F5F2]', iconText: 'text-[#0E9E8A]', nameText: 'text-[#0E9E8A]', exampleBg: 'bg-[#E0F5F2]' },
];

const ConceptosClaveBlock: React.FC<{
    conceptos: NonNullable<ExplicacionBloque['conceptosClave']>;
    fontSize: string;
    seccionActiva: string | null;
    onNarrar: (id: string, texto: string) => void;
    onSelectObra?: (obra: any) => void;
    perfil: PerfilNino;
    asignatura: any; 
    tema: string;


}> = ({
    conceptos,
    fontSize,
    seccionActiva,
    onNarrar,
    onSelectObra,
    perfil,
}) => {
    
    if (!conceptos?.length) return null;

    return (
        <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
        >
            {conceptos.map((concepto, i) => {
                const pal = cardPalette[i % cardPalette.length];
                //const Icon = resolveLucideIcon(concepto.icono);
                const visual = resolveVisual(
                    concepto.icono ||
                    concepto.nombre ||
                    concepto.etiqueta
                );

                const fuenteEjemplo =
                    concepto.ejemploPedagogico ||
                    concepto.componentes ||
                    concepto.miembros ||
                    concepto.elementos ||
                    concepto.uso ||
                    '';

                const ejemploTexto = concepto.ejemploPedagogico
                    ? concepto.ejemploPedagogico.trim()
                    : fuenteEjemplo
                        .replace(/\\n/g, '\n')
                        .split('\n')
                        .filter(l => l.trim())
                        .slice(0, 4)
                        .join(', ');

                return (
                    <div
                        key={i}
                        className="bg-white rounded-[26px] border border-slate-200 shadow-sm px-5 py-5 flex flex-col items-center text-center min-h-[300px]"
                    >
                        <div className={`w-10 h-10 rounded-full ${pal.step} text-white text-base font-black flex items-center justify-center mb-4`}>
                            {i + 1}
                        </div>

                        <h3 className={`text-[22px] font-black ${pal.nameText} mb-5`}>
                            {concepto.nombre}
                        </h3>
                        
                        <button
                            type="button"
                            onClick={() =>
                                onSelectObra?.({
                                    titulo: concepto.nombre,
                                    autor: 'Wikimedia Commons',
                                    esConcepto: true,  
                                    query: buildConceptoWikimediaQuery(perfil.asignatura, perfil.tema, concepto.nombre),
                                })
                            }
                            className={`
                                w-28 h-28
                                rounded-full
                                ${pal.iconBg}
                                flex items-center justify-center
                                mb-5
                                transition-all
                                hover:scale-105
                                active:scale-95
                                hover:shadow-md
                            `}
                        >
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-4xl">
                                    🔎
                                </span>

                                <span
                                    className={`
                                        text-[10px]
                                        font-black
                                        uppercase
                                        mt-1
                                        ${pal.iconText}
                                    `}
                                >
                                    Ver
                                </span>
                            </div>
                        </button>

                        <p
                            className="text-[15px] text-slate-700 font-medium leading-7 mb-6"
                            style={{ fontSize }}
                        >
                            {concepto.explicacionSimple}
                        </p>

                        {concepto.formula && (
                            <div className="w-full rounded-2xl bg-[#F6F3FF] border border-purple-100 px-4 py-3 mb-4">
                                <p className="text-[11px] font-black text-[#5b40d6] uppercase tracking-wide mb-2">
                                    Fórmula
                                </p>
                                <div className="flex items-center gap-1 flex-wrap justify-center">
                                    {concepto.formula.split('+').map((parte, idx, arr) => (
                                        <React.Fragment key={idx}>
                                            <span className="px-2 py-1 rounded-lg text-[11px] font-black border bg-white text-slate-700 border-slate-200">
                                                {parte.trim()}
                                            </span>
                                            {idx < arr.length - 1 && (
                                                <span className="text-[#5b40d6] font-black text-xs">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ejemploTexto && (
                            <div className={`mt-auto w-full rounded-2xl ${pal.exampleBg} px-4 py-4`}>
                                <p className={`text-sm font-black mb-1 ${pal.nameText}`}>Ejemplo</p>
                                <p className="text-[13px] text-slate-700 font-medium leading-6 text-left">
                                    {ejemploTexto}
                                </p>
                            </div>
                        )}

                        <div className="mt-4">
                            <BtnNarrar
                                id={`concepto-${i}`}
                                texto={[concepto.nombre, concepto.explicacionSimple, ejemploTexto].filter(Boolean).join('. ')}
                                seccionActiva={seccionActiva}
                                onNarrar={onNarrar}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Explicación principal
// ─────────────────────────────────────────────────────────────────────────────
type ObraVisual = { titulo: string; autor: string; descripcion: string; tipo: string; query: string };

const ExplicacionRenderer: React.FC<{
    bloque: ExplicacionBloque;
    condicion: string;
    fontSize: string;
    tema: string;
    idioma: string;
    onSaberMas?: () => void;
    onPracticar?: () => void;
    puedeSaberMas?: boolean;
    obras?: ObraVisual[];
    selectedIndex?: number | null;
    apoyoGramatical?: ApoyoGramatical | null;   
    onSelectObra?: (obra: ObraVisual) => void;
    perfil: PerfilNino;
    asignatura?: string; 
    videoYoutube?: { videoId: string; titulo: string; canal: string } | null;
    loadingVideo?: boolean;
    pertinencia?: { importancia: string; utilidadVida: string; mundoReal: string } | null;


}> = ({ bloque, condicion, fontSize, tema, idioma, perfil, onSaberMas, onPracticar, puedeSaberMas, obras = [], selectedIndex = null, onSelectObra, apoyoGramatical = null, asignatura = '', videoYoutube = null, pertinencia, loadingVideo = false }) => {


    const isTEA = condicion === 'tea';
    const { narrar, seccionActiva } = useNarrador(idioma, condicion);

    const conceptos = bloque.conceptosClave || [];

    const renderConceptosOPasos = () => (
        conceptos.length > 0 ? (
            <ConceptosClaveBlock
                conceptos={conceptos}
                fontSize={fontSize}
                seccionActiva={seccionActiva}
                onNarrar={narrar}
                onSelectObra={onSelectObra}
                perfil={perfil}
                asignatura={perfil.asignatura}
                tema={perfil.tema}
            />

        ) : bloque.pasos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {bloque.pasos.map((paso, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-[24px] border border-slate-200 shadow-sm px-5 py-5 flex flex-col"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-black flex items-center justify-center mb-4">
                            {i + 1}
                        </div>

                        <p className="text-[16px] font-bold text-slate-800 leading-7 flex-1">
                            {paso}
                        </p>

                        <div className="mt-4">
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
        ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm font-bold text-slate-400">
                    No hay componentes definidos para esta lección.
                </p>
            </div>
        )
    );

    const introTextoNarracion =
        typeof bloque.intro === 'string'
            ? bloque.intro
            : [bloque.intro.fraseEnganche, bloque.intro.ejemploAncla, bloque.intro.cuerpo]
                .filter(Boolean)
                .join('. ');

    const introFrase =
        typeof bloque.intro === 'string'
            ? bloque.intro
            : bloque.intro.fraseEnganche || bloque.intro.cuerpo || '';

    const introCuerpo = typeof bloque.intro !== 'string' ? bloque.intro.cuerpo : '';
    const introAncla = typeof bloque.intro !== 'string' ? bloque.intro.ejemploAncla : '';

    const comoSeUsaTexto =
        //bloque.analogia ||
        conceptos.find(c => c.uso)?.uso ||
        conceptos.find(c => c.uso)?.uso ||
        conceptos.find(c => c.funcion)?.funcion ||
        bloque.objetivo ||
        '';

    const formulaDesdeConceptos =
        conceptos.map(c => c.formula).find(Boolean) || '';

    const estructuraDesdeElementos =
        conceptos.map(c => c.elementos).filter(Boolean).join('\n');

    const estructuraDesdeApoyoVisual =
        bloque.apoyoVisual?.elementos?.length
            ? bloque.apoyoVisual.elementos.join(' + ')
            : '';

    const formulaOEstructuraTexto =
        formulaDesdeConceptos ||
        estructuraDesdeApoyoVisual ||
        estructuraDesdeElementos ||
        '';

    const cuandoLoNecesitoTexto =
        conceptos.find(c => c.necesidad)?.necesidad ||
        bloque.ejemplos?.[0]?.conclusionPedagogica ||
        bloque.ejemplos?.[0]?.explicacionBreve ||
        bloque.resumen ||
        '';

    const renderCajaLateral = ({
        id,
        icono,
        titulo,
        texto,
        color,
        bg,
        border,
    }: {
        id: string;
        icono: string;
        titulo: string;
        texto: string;
        color: string;
        bg: string;
        border: string;
    }) => (
        <div className={`rounded-[26px] border ${border} ${bg} p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm">
                        {icono}
                    </div>
                    <p className={`text-sm font-black uppercase tracking-wide ${color}`}>
                        {titulo}
                    </p>
                </div>

                {texto && (
                    <BtnNarrar
                        id={id}
                        texto={texto}
                        seccionActiva={seccionActiva}
                        onNarrar={narrar}
                    />
                )}
            </div>

            {texto ? (
                <p className="text-[15px] leading-7 font-semibold text-slate-700 whitespace-pre-line">
                    {texto}
                </p>
            ) : (
                <p className="text-[14px] leading-7 font-semibold text-slate-400">
                    Esta parte se completará cuando la lección tenga más información.
                </p>
            )}
        </div>
    );

    return (
        <div
            className="grid grid-cols-1 gap-5 items-start lg:[grid-template-columns:1fr_1.5fr_1fr]"
            style={{ fontSize, lineHeight: isTEA ? '1.9' : '1.7' }}
        >
            {/* COLUMNA 1: INTRODUCCIÓN */}
            <section className="min-w-0">
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 flex flex-col gap-6 h-full">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-2xl shadow-sm">
                                ⚙️
                            </div>
                            <div>
                                <p className="text-[16px] font-black text-[#F97316]">Introducción:</p>
                            </div>
                        </div>

                        <BtnNarrar
                            id="intro-full"
                            texto={introTextoNarracion}
                            seccionActiva={seccionActiva}
                            onNarrar={narrar}
                        />
                    </div>

                    {introFrase && (
                        <h2 className="text-2xl xl:text-3xl font-black text-slate-800 leading-tight">
                            {introFrase}
                        </h2>
                    )}

                    {introAncla && (
                        <div className="rounded-2xl bg-[#EFF6FF] border border-blue-100 px-4 py-3">
                            <p className="text-sm font-bold text-blue-700 italic">{introAncla}</p>
                        </div>
                    )}

                    {introCuerpo && (
                        <p className="text-[15px] leading-7 text-slate-700 font-medium">
                            {introCuerpo}
                        </p>
                    )}

                    {bloque.resumen && (
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                            <p className="text-[11px] font-black text-amber-700 uppercase tracking-wide mb-1">
                                💡 ¿Sabías que?
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                                {bloque.resumen}
                            </p>
                        </div>
                    )}

                    {/* Meta de hoy */}
                    {bloque.chequeoCobertura && bloque.chequeoCobertura.length > 0 && (
                        <div className="rounded-2xl bg-[#F3EFFE] border border-purple-100 px-4 py-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">🎯</span>
                                <p className="text-[10px] font-black text-purple-700 uppercase tracking-wide">Meta de hoy</p>
                            </div>
                            <p className="text-[11px] text-purple-500 font-semibold mb-2">Al final de la lección podrás:</p>
                            <div className="space-y-1.5">
                                {bloque.chequeoCobertura.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-[#0E9E8A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#0E9E8A]" />
                                        </div>
                                        <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}


                    {/* Apoyos disponibles — card separada */}
                    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🛠️</span>
                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Apoyos disponibles</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { emoji: '📖', label: 'Lectura\nfácil' },
                                { emoji: '🔊', label: 'Audio' },
                                { emoji: '🎨', label: 'Colores\namigables' },
                                { emoji: 'Aa', label: 'Tamaño', isText: true },
                            ].map((ap, i) => (
                                <button key={i} type="button"
                                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#0E9E8A]/40 hover:bg-teal-50/40 transition-colors cursor-pointer">
                                    <span className={ap.isText ? 'text-[15px] font-black text-slate-600' : 'text-[22px]'}>{ap.emoji}</span>
                                    <span className="text-[9px] font-bold text-slate-500 text-center leading-tight whitespace-pre-line">{ap.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-1 pt-1">
                            <span className="text-[13px] font-bold text-slate-600">Modo enfoque</span>
                            <div className="w-10 h-5 rounded-full bg-slate-200 relative cursor-pointer flex-shrink-0">
                                <div className="w-4 h-4 rounded-full bg-white shadow absolute top-0.5 left-0.5" />
                            </div>
                        </div>
                    </div>

                    {/*Bloque de pertinencia*/}
                    {pertinencia && (
                        <div className="space-y-3">
                            {[
                                { emoji: '🌟', titulo: '¿Por qué es importante?', texto: pertinencia.importancia, bg: 'bg-red-50', border: 'border-amber-200', color: 'text-orange-800' },
                                { emoji: '🎯', titulo: '¿Para qué me sirve?', texto: pertinencia.utilidadVida, bg: 'bg-teal-50', border: 'border-teal-200', color: 'text-teal-800' },
                                { emoji: '🌍', titulo: '¿Dónde lo veo?', texto: pertinencia.mundoReal, bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-800' },
                            ].map((caja, i) => (
                                <div key={i} className={`rounded-2xl border-2 ${caja.border} ${caja.bg} p-4`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{caja.emoji}</span>
                                        <p className={`text-[11px] font-black uppercase tracking-wide ${caja.color}`}>
                                            {caja.titulo}
                                        </p>
                                    </div>
                                    <p className={`text-sm font-semibold leading-relaxed ${caja.color}`}>
                                        {caja.texto}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Botón Saber más */}
                    <div className="pt-2 mt-auto">
                        {puedeSaberMas && (
                            <button
                                type="button"
                                onClick={onSaberMas}
                                className="w-full rounded-2xl border-2 border-[#0E9E8A] text-[#0E9E8A] font-black text-lg py-4 hover:bg-[#0E9E8A]/5 transition-colors"
                            >
                                Saber más →
                            </button>
                        )}
                    </div>




                </div>
            </section>








            {/* COLUMNA 2: COMPONENTES */}
            <section className="min-w-0">
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 h-full">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-xl">📘</div>
                            <div>
                                <h3 className="text-[17px] font-black text-slate-800">Conceptos clave</h3>
                                <p className="text-[16px] text-slate-500 font-medium">Así se compone: <b>{tema}</b>:</p>
                            </div>
                        </div>
                        {bloque.apoyoVisual && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-700">
                                📊 Visual incluido
                            </span>
                        )}
                    </div>

                    {/* Cards de conceptos */}
                    {renderConceptosOPasos()}


                    {/* Apoyo visual pedagógico generado por Claude */}
                    {bloque.apoyoVisual && (
                        <div className="mt-6">
                            <ApoyoVisualBlock
                                apoyoVisual={bloque.apoyoVisual}
                                condicion={condicion}
                                asignatura={perfil.asignatura} 
                                tema={perfil.tema} 
                            />
                        </div>
                    )}

                    {bloque.apoyoGramatical && (
                        <GramaticalBlock
                            apoyoGramatical={bloque.apoyoGramatical}
                            condicion={condicion}
                        />
                    )}

                    {/* ¡Vamos a practicar! */}
                    <div className="rounded-2xl bg-[#E0F5F2] shadow-m border border-slate-200 px-4 py-3 flex items-center justify-between gap-3 mt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0E9E8A] flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                            <div>
                                <p className="text-[18px] font-black text-teal-800">¡Vamos a practicar!</p>
                                <p className="text-[16px] font-semibold text-teal-600">Realiza actividades interactivas para reforzar lo aprendido.</p>
                            </div>
                        </div>
                        <button type="button" onClick={onPracticar}
                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-teal-300 text-[14px] font-black text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer">
                            🎮 Practicar ahora →
                        </button>
                    </div>
                </div>
            </section>

            {/* COLUMNA 3: CAJAS PEDAGÓGICAS */}
            <section className="min-w-0 flex flex-col gap-4">


                {/* Imágenes */}

                {obras.length > 0 && onSelectObra && (
                    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-xl">🔎</div>
                            <div>
                                <p className="text-sm font-black text-slate-800">Ejemplos visuales</p>
                                <p className="text-xs font-medium text-slate-500">Haz clic en una imagen para verla</p>
                            </div>
                        </div>
                        <ExamplesBlock
                            obras={obras}
                            selectedIndex={selectedIndex}
                            onSelect={onSelectObra}
                        />
                    </div>
                )}

                {/* VIDEO YOUTUBE */}
                {(loadingVideo || videoYoutube) && (
                    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-xl">▶️</div>
                            <div>
                                <p className="text-sm font-black text-slate-800">Video del tema</p>
                                <p className="text-xs font-medium text-slate-500">Recurso de YouTube</p>
                            </div>
                        </div>

                        {loadingVideo ? (
                            <div className="w-full h-40 rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
                                <p className="text-xs text-slate-400 font-bold">Buscando video…</p>
                            </div>
                        ) : videoYoutube ? (
                            <div className="space-y-2">
                                <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${videoYoutube.videoId}?rel=0&modestbranding=1`}
                                        title={videoYoutube.titulo}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <p className="text-[11px] font-bold text-slate-600 line-clamp-2">{videoYoutube.titulo}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{videoYoutube.canal}</p>
                            </div>
                        ) : null}
                    </div>
                )}








                {/* Ejemplo completo */}
                {bloque.ejemplos?.[0]?.enunciado && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#0E9E8A] flex items-center justify-center">
                                    <span className="text-white text-xs font-black">▶</span>
                                </div>
                                <p className="text-[14px] font-black text-slate-800">Ejemplo completo</p>
                            </div>
                            <BtnNarrar id="ejemplo-completo" texto={bloque.ejemplos[0].enunciado} seccionActiva={seccionActiva} onNarrar={narrar} />
                        </div>

                        <div className="px-5 py-4 bg-white space-y-4">
                            {/* Enunciado */}
                            <p className="text-[14px] font-black text-slate-800 italic">
                                {bloque.ejemplos[0].enunciado}
                            </p>

                            {/* CASO A: hay pasosGuiados → paso a paso */}
                            {bloque.ejemplos[0].pasosGuiados?.length > 0 ? (
                                <div className="space-y-2">
                                    {bloque.ejemplos[0].pasosGuiados.map((paso: any, i: number) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            {/* Número del paso */}
                                            <div className="w-6 h-6 rounded-full bg-[#0E9E8A] text-white text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 leading-tight">
                                                    {paso.accionPrincipal}
                                                </p>
                                                {paso.explicacion && (
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                        {paso.explicacion}
                                                    </p>
                                                )}
                                                {paso.resultadoParcial && (
                                                    <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E0F5F2] border border-teal-200">
                                                        <span className="text-[10px] font-black text-teal-700">
                                                            = {paso.resultadoParcial}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Resultado final si hay conclusión */}
                                    {bloque.ejemplos[0].conclusionPedagogica && (
                                        <div className="mt-3 p-3 rounded-xl bg-[#0E9E8A] text-white flex items-center gap-2">
                                            <span className="text-lg">✅</span>
                                            <p className="text-sm font-black">{bloque.ejemplos[0].conclusionPedagogica}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* CASO B: sin pasos → pills de conceptos (gramática, historia, etc.) */
                                conceptos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {conceptos.map((c, i) => {
                                            const pal = cardPalette[i % cardPalette.length];
                                            const val = c.ejemploPedagogico?.split(/[,\n]/)[0]?.trim()
                                                || c.elementos?.split(/[\n,]/)[0]?.trim()
                                                || c.nombre;
                                            return (
                                                <React.Fragment key={i}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-3 py-1.5 rounded-xl text-[13px] font-black ${pal.exampleBg} ${pal.nameText}`}>
                                                            {val}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">{c.nombre}</span>
                                                    </div>
                                                    {i < conceptos.length - 1 && (
                                                        <span className="text-slate-300 font-black text-lg">+</span>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bloque de Reforzamiento
// ─────────────────────────────────────────────────────────────────────────────
const tipoConfig = {
    fisico: { icono: <PencilLine className="w-4 h-4" />, label: 'En tu cuaderno', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    digital: { icono: <Monitor className="w-4 h-4" />, label: 'Actividad digital', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    hibrido: { icono: <Layers className="w-4 h-4" />, label: 'Práctica mixta', color: 'bg-purple-50 border-purple-200 text-purple-800' },
};

const ReforzamientoBlock: React.FC<{
    reforzamiento: Reforzamiento;
    condicion: string;
    fontSize: string;
    onComplete: () => void;
    onBack: () => void;
}> = ({ reforzamiento, condicion, fontSize, onComplete, onBack }) => {
    const [actividadIdx, setActividadIdx] = useState(0);
    const [seleccion, setSeleccion] = useState<number | null>(null);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [completadas, setCompletadas] = useState(0);
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
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
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

    const cfg2 = tipoConfig[actual.tipo] || tipoConfig.digital;
    const esCorrecta =
        actual.verificacion &&
        seleccion !== null &&
        actual.verificacion.opciones[seleccion]?.correcta;

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5 flex-shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" /> Lección
                </button>
                <div className="flex-1 border-b border-border pb-2">
                    <h3 className="font-black text-foreground text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> {reforzamiento.titulo}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {reforzamiento.descripcion}
                    </p>
                </div>
            </div>

            <div className="flex gap-1.5">
                {actividades.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i < completadas ? 'bg-teo-green' : i === actividadIdx ? 'bg-primary' : 'bg-muted'
                            }`}
                    />
                ))}
            </div>

            <div className={`rounded-2xl border-2 overflow-hidden ${!isTEA ? 'animate-fade-in' : ''}`}>
                <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${cfg2.color}`}>
                    {cfg2.icono}
                    <span className="text-xs font-black uppercase tracking-wide">{cfg2.label}</span>
                    <span className="ml-auto text-xs font-bold opacity-70">
                        {actividadIdx + 1} / {actividades.length}
                    </span>
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
                                            onClick={() => {
                                                if (!mostrarFeedback) {
                                                    setSeleccion(i);
                                                    setMostrarFeedback(true);
                                                }
                                            }}
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
    onComplete: (tiempo: number, simplificaciones: number) => void;
    onBack?: () => void;
    moduleId?: string;       
    onModuleComplete?: () => void; 
    
}

type SubFase = 'leccion' | 'reforzamiento';

//const Phase2Lesson: React.FC<Phase2LessonProps> = ({ perfil, sesion, onComplete, onBack }) => {
const Phase2Lesson: React.FC<Phase2LessonProps> = ({ perfil, sesion, onComplete, onBack, moduleId, onModuleComplete }) => {

    const [imagenModal, setImagenModal] = useState<string | null>(null);

    const abrirImagen = (url: string) => {
        setImagenModal(url);
    };

    const [subFase, setSubFase] = useState<SubFase>('leccion');
    const [explicacionIndex, setExplicacionIndex] = useState(0);
    const [reforzamientoCompleto, setReforzamientoCompleto] = useState(false);


    const [obraSeleccionada, setObraSeleccionada] = useState<any | null>(null);

    const obrasArte = React.useMemo(() => {
        const ejemplos = sesion?.ejemplosVisuales;
        if (!Array.isArray(ejemplos) || ejemplos.length === 0) return [];
        return ejemplos
            .filter((o: any) => o?.titulo && o?.query) // solo los que tienen datos válidos
            .map((o: any) => ({
                titulo: o.titulo ?? '',
                autor: o.autor ?? '',
                descripcion: o.descripcion ?? '',
                tipo: o.tipo ?? '',
                query: o.query ?? `${o.titulo} ${perfil.tema}`.trim()
            }));
    }, [sesion, perfil.tema]);

    React.useEffect(() => {
        if (!perfil.tema) return;
        setLoadingVideo(true);
        buscarVideoYoutube(perfil.tema, perfil.idioma)
            .then(v => setVideoYoutube(v))
            .finally(() => setLoadingVideo(false));
    }, [perfil.tema, perfil.idioma]);
    
    const selectedIndex = React.useMemo<number | null>(() => {
        if (!obraSeleccionada) return null;

        const idx = obrasArte.findIndex(
            o => o.query === obraSeleccionada.query
        );

        return idx !== -1 ? idx : null;
    }, [obraSeleccionada, obrasArte]);



    const [imagenObra, setImagenObra] = useState<string | null>(null);
    const [videoYoutube, setVideoYoutube] = useState<{ videoId: string; titulo: string; canal: string } | null>(null);
    const [loadingVideo, setLoadingVideo] = useState(false);


    const startTime = useRef(Date.now());

    const isTEA = perfil.condicion === 'tea';
    const isDown = perfil.condicion === 'down';
    const isDislexia = perfil.condicion === 'dislexia';
    const fontSize = isDown ? '20px' : isDislexia ? '18px' : '16px';
    const asignaturaInfo = ASIGNATURAS[perfil.asignatura];

    const explicaciones = [
        normalizar(sesion.explicacion),
        normalizar(sesion.explicacionAlternativa1),
        normalizar(sesion.explicacionAlternativa2),
    ];
    const bloqueActual = explicaciones[explicacionIndex];



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
        onComplete(Math.round((Date.now() - startTime.current) / 1000), explicacionIndex);
    };


    const handleSelectObra = async (obra: any) => {
        setObraSeleccionada({ ...obra, query: obra.query ?? `${obra.titulo} ${obra.autor}` });
        abrirImagen('loading');
        const img = obra.esConcepto
            ? await buscarImagenConcepto(obra.query)
            : await buscarImagenWikimedia(obra.query);
        setImagenObra(img);
        setImagenModal(img ?? 'not_found');
    };

    const handleBack = () => {
        window.speechSynthesis?.cancel();

        if (subFase === 'reforzamiento') {
            setSubFase('leccion');
            setReforzamientoCompleto(false);
            return;
        }

        if (onBack) {
            onBack();
            return;
        }

        window.history.back();
    };

    const labelSimplificacion =
        explicacionIndex === 0 ? null
            : explicacionIndex === 1 ? 'Versión desarrollada'
                : 'Versión ampliada';

    const progresoPct = explicacionIndex === 0 ? 40 : explicacionIndex === 1 ? 65 : 90;

    const moduleTitles: Record<string, string> = {
        intro: 'Introducción',
        concept: 'Conceptos clave',
        visual: 'Ejemplos visuales',
        video: 'Video del tema',
        activity: 'Juego interactivo',
        summary: 'Resumen y cierre',
    };

    // Si hay moduleId → modal de sección específica
    if (moduleId) {
        return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
                <div className="bg-[#F0FAFA] w-full sm:max-w-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh] shadow-2xl">

                    {/* Header del modal */}
                    <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-200 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-bold text-slate-700">Volver</span>
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-[#0E9E8A] truncate">{perfil.tema}</p>
                            <p className="text-xs text-slate-400 font-semibold">{moduleTitles[moduleId] ?? moduleId}</p>
                        </div>
                        <img src="/logo.png" alt="TEOplay" className="h-8 object-contain flex-shrink-0" />
                    </div>

                    {/* Contenido de la sección */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

                        {moduleId === 'intro' && (
                            <SeccionIntro bloque={bloqueActual} condicion={perfil.condicion} idioma={perfil.idioma} fontSize={fontSize} />
                        )}

                        {moduleId === 'concept' && (
                            <div className="space-y-5">
                                <ConceptosClaveBlock
                                    conceptos={bloqueActual.conceptosClave ?? []}
                                    fontSize={fontSize}
                                    seccionActiva={null}
                                    onNarrar={() => { }}
                                    asignatura={perfil.asignatura}
                                    tema={perfil.tema}
                                    onSelectObra={handleSelectObra}
                                    perfil={perfil}
                                />
                                {bloqueActual.apoyoGramatical && (
                                    <GramaticalBlock
                                        apoyoGramatical={bloqueActual.apoyoGramatical}
                                        condicion={perfil.condicion}
                                    />
                                )}
                            </div>
                        )}

                        {moduleId === 'visual' && (
                            <SeccionVisual
                                bloque={bloqueActual}
                                obras={obrasArte}
                                selectedIndex={selectedIndex}
                                onSelectObra={handleSelectObra}
                                condicion={perfil.condicion}
                                asignatura={perfil.asignatura}
                                tema={perfil.tema}
                            />
                        )}

                        {moduleId === 'video' && (
                            <SeccionVideo videoYoutube={videoYoutube} loadingVideo={loadingVideo} tema={perfil.tema} />

                        )}
                        {moduleId === 'activity' && (
                            <Phase3Games
                                perfil={perfil}
                                sesion={sesion}
                                onComplete={() => { onModuleComplete?.(); onBack?.(); }}
                            />
                        )}

                        {moduleId === 'summary' && (
                            <SeccionResumen pertinencia={sesion.pertinencia ?? null} bloque={bloqueActual} />
                        )}

                    </div>



                    {/* Modal imagen obra */}
                    {imagenModal && obraSeleccionada && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                            onClick={() => setImagenModal(null)}
                        >
                            <div
                                className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                {imagenModal === 'loading' ? (
                                    <div className="w-full h-48 flex items-center justify-center bg-slate-50">
                                        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
                                    </div>
                                ) : imagenModal !== 'not_found' ? (
                                    <img
                                        src={imagenModal}
                                        alt={obraSeleccionada.titulo}
                                        className="w-full object-contain max-h-[60vh]"
                                    />
                                ) : (
                                    <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-slate-50">
                                        <span className="text-3xl">🔍</span>
                                        <p className="text-sm font-bold text-slate-500 text-center px-4">
                                            No encontramos imagen para "{obraSeleccionada?.titulo}"
                                        </p>
                                    </div>
                                )}


                                <div className="px-5 py-4">
                                    <p className="font-black text-slate-800 text-base">{obraSeleccionada.titulo}</p>
                                    {obraSeleccionada.autor && (
                                        <p className="text-sm text-slate-500 font-medium mt-0.5">{obraSeleccionada.autor}</p>
                                    )}
                                    {obraSeleccionada.descripcion && (
                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{obraSeleccionada.descripcion}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setImagenModal(null)}
                                        className="mt-4 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }



    // Sin moduleId → vista completa original (sin cambios)
    return (
        <div
            className={`fixed inset-0 z-40 flex flex-col bg-[#F0FAFA] ${!isTEA ? 'animate-slide-up' : ''}`}
            style={{ fontFamily: 'inherit' }}
        >

            {/* NAVBAR */}
            <header className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-16 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
                        title="Regresar"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-700 hidden sm:inline">Volver</span>
                    </button>

                    <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 px-2">
                        <span className="text-xs text-slate-400 font-semibold hidden md:block flex-shrink-0">Lección:</span>
                        <span className="text-sm font-black text-[#0E9E8A] truncate max-w-[140px] sm:max-w-xs">
                            {perfil.tema}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-24 sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#0E9E8A] to-[#5DCABB] rounded-full transition-all duration-500"
                                    style={{ width: `${progresoPct}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-400">{progresoPct}%</span>
                        </div>
                    </div>



                    
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 px-2">
                    <div className="w-20 h-20 rounded-xl  flex items-center justify-center text-white font-black text-sm select-none">
                        <img src="/logo.png" alt="TEOplay" className="h-[300px] object-contain block" />
                    </div>
                </div>

                <div className="hidden lg:inline-flex flex items-center gap-1 px-2.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#F3EFFE] flex items-center justify-center text-lg select-none">⭐</div>
                    <span className="text-sm font-black text-[#0E9E8A] truncate max-w-[140px] sm:max-w-xs">
                        {perfil.nombre} | Edad: {perfil.edad} | Grado: {perfil.grado} 
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border bg-primary/10 border-primary/20 text-primary flex-shrink-0">
                        {asignaturaInfo?.emoji} <span className="hidden sm:inline">{asignaturaInfo?.label}</span>
                    </span>

                    {labelSimplificacion && (
                        <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-teo-orange/10 border border-teo-orange/20 text-teo-orange">
                            💡 {labelSimplificacion}
                        </span>
                    )}
                </div>
            </header>

            {/* CUERPO */}
            <main className="flex-1 overflow-y-auto">

                <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    {subFase === 'leccion' && (
                        <ExplicacionRenderer
                            bloque={bloqueActual}
                            condicion={perfil.condicion}
                            fontSize={fontSize}
                            tema={perfil.tema}
                            idioma={perfil.idioma}
                            onSaberMas={explicacionIndex < 2 ? () => setExplicacionIndex(i => i + 1) : undefined}
                            puedeSaberMas={explicacionIndex < 2}
                            onPracticar={handleEntendi}
                            obras={obrasArte}
                            selectedIndex={selectedIndex}
                            onSelectObra={handleSelectObra}
                            apoyoGramatical={bloqueActual.apoyoGramatical ?? null}
                            perfil={perfil}
                            asignatura={perfil.asignatura}
                            videoYoutube={videoYoutube}
                            loadingVideo={loadingVideo}
                            pertinencia={sesion.pertinencia ?? null}

                        />
                    )}

                    {subFase === 'reforzamiento' && sesion.reforzamiento && (
                        <div className="space-y-5 pb-4">
                            <ReforzamientoBlock
                                reforzamiento={sesion.reforzamiento}
                                condicion={perfil.condicion}
                                fontSize={fontSize}
                                onComplete={() => setReforzamientoCompleto(true)}
                                onBack={handleVolverLeccion}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="flex-shrink-0 bg-white border-t border-slate-200">
                {subFase === 'reforzamiento' && reforzamientoCompleto && (
                    <button
                        type="button"
                        onClick={finalizarFase}
                        className="child-btn w-full bg-[#0E9E8A] hover:bg-[#0A7A6A] text-white font-black text-lg py-4 flex items-center justify-center gap-3 cursor-pointer transition-colors"
                        style={{ minHeight: '60px' }}
                    >
                        🎮 ¡A los juegos!
                    </button>
                )}
            </footer>

            {/* MODAL IMAGEN OBRA */}
            {imagenModal && obraSeleccionada && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setImagenModal(null)}
                >
                    <div
                        className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {imagenModal ===  'loading' ? (
                            <div className="w-full h-48 flex items-center justify-center bg-slate-50">
                                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
                            </div>
                        ) : imagenModal !== 'not_found' ? (
                            <img
                                src={imagenModal}
                                alt={obraSeleccionada.titulo}
                                className="w-full object-contain max-h-[60vh]"
                            />
                        ) : (
                            <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-slate-50">
                                <span className="text-3xl">🔍</span>
                                <p className="text-sm font-bold text-slate-500 text-center px-4">
                                    No encontramos imagen para "{obraSeleccionada?.titulo}"
                                </p>
                            </div>
                        )}


                        <div className="px-5 py-4">
                            <p className="font-black text-slate-800 text-base">{obraSeleccionada.titulo}</p>
                            {obraSeleccionada.autor && (
                                <p className="text-sm text-slate-500 font-medium mt-0.5">{obraSeleccionada.autor}</p>
                            )}
                            {obraSeleccionada.descripcion && (
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{obraSeleccionada.descripcion}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setImagenModal(null)}
                                className="mt-4 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Phase2Lesson;