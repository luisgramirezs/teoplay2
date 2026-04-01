// src/components/OnboardingWizard.tsx
import React, { useState, useRef } from 'react';
import {
  User, BookOpen, Heart, FileText, Sparkles,
  ChevronRight, ChevronLeft, Upload, X, CheckCircle
} from 'lucide-react';
import { PerfilPersistente, Condicion, CONDICIONES, GRADOS } from '@/types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TipoUsuario = 'padre' | 'docente' | 'terapeuta';

export interface RespuestasOnboarding {
  habilidades: string;
  retos: string;
  comportamiento: string;
  observaciones: string;
}

export interface PerfilNeuroeducativo {
  resumen: string;
  fortalezas: string[];
  retos: string[];
  estrategias: string[];
  recomendaciones: string[];
  raw: string;
}

export interface PerfilCompleto extends PerfilPersistente {
  id: string;
  tipoUsuario: TipoUsuario;
  respuestas: RespuestasOnboarding;
  perfilNeuroeducativo?: PerfilNeuroeducativo;
  fechaCreacion: number;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const TIPOS_USUARIO = [
  {
    id: 'padre' as TipoUsuario,
    label: 'Padre / Madre',
    descripcion: 'Quiero apoyar el aprendizaje de mi hijo/a',
    emoji: '👨‍👩‍👧',
  },
  {
    id: 'docente' as TipoUsuario,
    label: 'Docente',
    descripcion: 'Trabajo con estudiantes con necesidades diversas',
    emoji: '👩‍🏫',
  },
  {
    id: 'terapeuta' as TipoUsuario,
    label: 'Terapeuta',
    descripcion: 'Brindo apoyo terapéutico a niños',
    emoji: '🧑‍⚕️',
  },
];

const PREGUNTAS = [
  {
    id: 'habilidades' as keyof RespuestasOnboarding,
    pregunta: '¿Qué habilidades o fortalezas destacas en el niño/a?',
    placeholder: 'Ej: Es muy creativo, tiene buena memoria visual, le encantan los números...',
    opcional: false,
  },
  {
    id: 'retos' as keyof RespuestasOnboarding,
    pregunta: '¿En qué áreas o situaciones presenta mayores dificultades?',
    placeholder: 'Ej: Le cuesta mantener el foco, tiene dificultad con la lectura, se frustra fácilmente...',
    opcional: false,
  },
  {
    id: 'comportamiento' as keyof RespuestasOnboarding,
    pregunta: '¿Cómo describes su comportamiento y rutina en casa?',
    placeholder: 'Ej: Es tranquilo en casa pero se altera con cambios de rutina, duerme bien, come bien...',
    opcional: false,
  },
  {
    id: 'observaciones' as keyof RespuestasOnboarding,
    pregunta: '¿Hay algo más que quieras que TEOplay sepa sobre él/ella?',
    placeholder: 'Cualquier detalle adicional que consideres importante (opcional)...',
    opcional: true,
  },
];

// ─── Prompt para generar perfil neuroeducativo ────────────────────────────────

function buildPerfilPrompt(
  perfil: PerfilPersistente,
  respuestas: RespuestasOnboarding,
  textoInforme?: string
): string {
  const condicion = CONDICIONES[perfil.condicion]?.label || perfil.condicion;

  return `Eres un Consultor Senior en Neuropsicología y Neuroeducación Aplicada especializado en tecnología asistiva educativa.
Tu misión es generar un Perfil Neuroeducativo completo para orientar a TEOplay — una tecnología de asistencia educativa — en la personalización de lecciones para este niño/a.

DATOS DEL NIÑO:
- Nombre: ${perfil.nombre || 'Sin nombre'}
- Edad: ${perfil.edad} años
- Grado: ${perfil.grado}
- Condición: ${condicion}

INFORMACIÓN APORTADA POR LA FAMILIA:
- Habilidades y fortalezas: ${respuestas.habilidades}
- Áreas de dificultad: ${respuestas.retos}
- Comportamiento y rutina: ${respuestas.comportamiento}
${respuestas.observaciones ? `- Observaciones adicionales: ${respuestas.observaciones}` : ''}

${textoInforme ? `INFORME CLÍNICO O ACADÉMICO ADJUNTO:\n${textoInforme}` : ''}

REGLA DE ORO: Integra TODA la información disponible. Cada dato es evidencia del perfil.

Responde SOLO con este JSON (sin texto fuera, sin markdown):
{
  "resumen": "2-3 oraciones que describen al niño como ser integral, conectando sus características con su potencial de aprendizaje",
  "fortalezas": [
    "Fortaleza 1 específica y accionable",
    "Fortaleza 2",
    "Fortaleza 3",
    "Fortaleza 4",
    "Fortaleza 5"
  ],
  "retos": [
    "Reto 1 descrito como oportunidad con sugerencia de apoyo",
    "Reto 2",
    "Reto 3"
  ],
  "estrategias": [
    "Estrategia pedagógica 1 basada en evidencia para usar en cada lección",
    "Estrategia 2",
    "Estrategia 3",
    "Estrategia 4"
  ],
  "recomendaciones": [
    "Recomendación 1 para la familia sobre cómo apoyar desde casa",
    "Recomendación 2",
    "Recomendación 3"
  ],
  "raw": "Narrativa completa del perfil en formato profesional para compartir con terapeutas y docentes. Mínimo 300 palabras. Incluye: perfil holístico, análisis de fortalezas y retos, estrategias DUA recomendadas, y hoja de ruta de abordaje inicial."
}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete: (perfil: PerfilCompleto) => void;
  apiKey: string;
}

const TOTAL_PASOS = 5;

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, apiKey }) => {
  const [paso, setPaso] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [datosPerfil, setDatosPerfil] = useState<PerfilPersistente>({
    nombre: '', edad: 8, grado: '2° Básico', condicion: 'general',
  });
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding>({
    habilidades: '', retos: '', comportamiento: '', observaciones: '',
  });
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [textoInforme, setTextoInforme] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [perfilGenerado, setPerfilGenerado] = useState<PerfilNeuroeducativo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';

  // ── Leer PDF ────────────────────────────────────────────────────────────────
  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombre(file.name);

    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let texto = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
      }
      setTextoInforme(texto.slice(0, 8000));
    } catch {
      // Si falla la lectura del PDF, continuamos sin él
      setTextoInforme(null);
    }
  };

  // ── Generar perfil neuroeducativo ────────────────────────────────────────────
  const generarPerfil = async () => {
    setGenerando(true);
    setError(null);
    try {
      const prompt = buildPerfilPrompt(datosPerfil, respuestas, textoInforme || undefined);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setPerfilGenerado(parsed);
      setPaso(5);
    } catch {
      setError('Hubo un problema generando el perfil. Intenta de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  // ── Finalizar onboarding ─────────────────────────────────────────────────────
  const handleFinalizar = () => {
    const perfilCompleto: PerfilCompleto = {
      ...datosPerfil,
      id: Date.now().toString(),
      tipoUsuario: tipoUsuario!,
      respuestas,
      perfilNeuroeducativo: perfilGenerado || undefined,
      fechaCreacion: Date.now(),
    };
    onComplete(perfilCompleto);
  };

  // ── Validaciones por paso ───────────────────────────────────────────────────
  const puedeAvanzar = () => {
    if (paso === 1) return tipoUsuario !== null;
    if (paso === 2) return datosPerfil.nombre.trim() !== '' || true; // nombre opcional
    if (paso === 3) return respuestas.habilidades.trim() !== '' && respuestas.retos.trim() !== '' && respuestas.comportamiento.trim() !== '';
    return true;
  };

  // ── Barra de progreso ───────────────────────────────────────────────────────
  const ProgressBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i + 1 < paso ? 'bg-teo-green' :
            i + 1 === paso ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );

  // ── PASO 1: Tipo de usuario ─────────────────────────────────────────────────
  if (paso === 1) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Bienvenido a TEOplay</h1>
          <p className="text-muted-foreground font-semibold">La tecnología de asistencia educativa para tu niño/a</p>
        </div>
        <ProgressBar />
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-black text-foreground text-lg mb-1">¿Quién eres?</h2>
          <p className="text-muted-foreground text-sm font-semibold mb-5">Esto nos ayuda a personalizar tu experiencia</p>
          <div className="space-y-3">
            {TIPOS_USUARIO.map(tipo => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setTipoUsuario(tipo.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  tipoUsuario === tipo.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-3xl">{tipo.emoji}</span>
                <div>
                  <p className={`font-black text-sm ${tipoUsuario === tipo.id ? 'text-primary' : 'text-foreground'}`}>
                    {tipo.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">{tipo.descripcion}</p>
                </div>
                {tipoUsuario === tipo.id && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPaso(2)}
            disabled={!puedeAvanzar()}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-2xl disabled:opacity-40 cursor-pointer"
          >
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // ── PASO 2: Datos básicos ───────────────────────────────────────────────────
  if (paso === 2) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ProgressBar />
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-black text-foreground text-lg">Datos del niño/a</h2>
              <p className="text-muted-foreground text-xs font-semibold">Información básica para personalizar las lecciones</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nombre <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <input
                type="text"
                className={inputClass}
                placeholder="Ej: Sofía, Mateo…"
                value={datosPerfil.nombre}
                onChange={e => setDatosPerfil(p => ({ ...p, nombre: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelClass}>Edad: <span className="text-primary font-black">{datosPerfil.edad} años</span></label>
              <input
                type="range" min={5} max={15} value={datosPerfil.edad}
                onChange={e => setDatosPerfil(p => ({ ...p, edad: Number(e.target.value) }))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5</span><span>10</span><span>15</span>
              </div>
            </div>

            <div>
              <label className={labelClass}>Grado escolar</label>
              <select
                className={inputClass}
                value={datosPerfil.grado}
                onChange={e => setDatosPerfil(p => ({ ...p, grado: e.target.value }))}
              >
                {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Condición principal</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(CONDICIONES) as [Condicion, typeof CONDICIONES[Condicion]][]).map(([key, val]) => (
                  <button
                    key={key} type="button"
                    onClick={() => setDatosPerfil(p => ({ ...p, condicion: key }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      datosPerfil.condicion === key
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className={`font-bold text-sm ${datosPerfil.condicion === key ? 'text-primary' : 'text-foreground'}`}>
                      {val.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{val.descripcion}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setPaso(1)} className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPaso(3)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-black py-3 rounded-2xl cursor-pointer"
            >
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PASO 3: Las 4 preguntas ─────────────────────────────────────────────────
  if (paso === 3) return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="w-full max-w-lg mx-auto">
        <ProgressBar />
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <Heart className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-black text-foreground text-lg">Cuéntanos sobre {datosPerfil.nombre || 'el niño/a'}</h2>
              <p className="text-muted-foreground text-xs font-semibold">Estas respuestas permiten a TEOplay personalizar cada lección</p>
            </div>
          </div>

          <div className="space-y-5">
            {PREGUNTAS.map(p => (
              <div key={p.id}>
                <label className={labelClass}>
                  {p.pregunta}
                  {p.opcional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder={p.placeholder}
                  value={respuestas[p.id]}
                  onChange={e => setRespuestas(r => ({ ...r, [p.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setPaso(2)} className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPaso(4)}
              disabled={!puedeAvanzar()}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-black py-3 rounded-2xl disabled:opacity-40 cursor-pointer"
            >
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PASO 4: Documento opcional ──────────────────────────────────────────────
  if (paso === 4) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ProgressBar />
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-black text-foreground text-lg">¿Tienes un informe?</h2>
              <p className="text-muted-foreground text-xs font-semibold">Opcional — enriquece significativamente el perfil</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-semibold mb-5 leading-relaxed">
            Si tienes un informe terapéutico, PIAR o boletín académico, TEOplay lo analizará para crear un perfil neuroeducativo más preciso.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleArchivo}
          />

          {!archivoNombre ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-bold text-foreground text-sm">Subir informe PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Informe terapéutico, PIAR o boletín académico</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-teo-green/10 border border-teo-green/30 rounded-xl">
              <FileText className="w-5 h-5 text-teo-green flex-shrink-0" />
              <p className="text-sm font-bold text-foreground flex-1 truncate">{archivoNombre}</p>
              <button
                type="button"
                onClick={() => { setArchivoNombre(null); setTextoInforme(null); }}
                className="p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setPaso(3)} className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={generarPerfil}
              disabled={generando}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-black py-3 rounded-2xl disabled:opacity-60 cursor-pointer"
            >
              {generando ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Generando perfil…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {archivoNombre ? 'Analizar y generar perfil' : 'Generar perfil sin informe'}
                </>
              )}
            </button>
          </div>

          {error && <p className="text-xs text-destructive font-bold mt-3 text-center">{error}</p>}

          <button
            type="button"
            onClick={() => setPaso(4)}
            className="w-full mt-3 text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors cursor-pointer"
          >
            Omitir este paso →
          </button>
        </div>
      </div>
    </div>
  );

  // ── PASO 5: Perfil generado ─────────────────────────────────────────────────
  if (paso === 5 && perfilGenerado) return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <ProgressBar />
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-teo-green/10 to-primary/5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teo-green/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teo-green" />
              </div>
              <div>
                <h2 className="font-black text-foreground text-lg">
                  Perfil Neuroeducativo de {datosPerfil.nombre || 'tu niño/a'}
                </h2>
                <p className="text-xs text-muted-foreground font-semibold">Generado por TEOplay IA</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Resumen */}
            <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
              <p className="text-sm font-semibold text-foreground leading-relaxed">{perfilGenerado.resumen}</p>
            </div>

            {/* Fortalezas */}
            <div>
              <h3 className="font-black text-foreground text-sm mb-3 flex items-center gap-2">
                <span>⭐</span> Fortalezas identificadas
              </h3>
              <div className="space-y-2">
                {perfilGenerado.fortalezas.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-teo-green/5 border border-teo-green/20 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-teo-green flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-foreground">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Retos */}
            <div>
              <h3 className="font-black text-foreground text-sm mb-3 flex items-center gap-2">
                <span>🎯</span> Retos como oportunidades
              </h3>
              <div className="space-y-2">
                {perfilGenerado.retos.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">→</span>
                    <p className="text-sm font-semibold text-foreground">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estrategias */}
            <div>
              <h3 className="font-black text-foreground text-sm mb-3 flex items-center gap-2">
                <span>🧠</span> Estrategias para TEOplay
              </h3>
              <div className="space-y-2">
                {perfilGenerado.estrategias.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-blue-500 font-black text-xs flex-shrink-0 mt-1">{i + 1}</span>
                    <p className="text-sm font-semibold text-foreground">{e}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleFinalizar}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-2xl cursor-pointer shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Comenzar con TEOplay
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
};

export default OnboardingWizard;