import React, { useState, useEffect } from 'react';
import { PerfilNino, SesionGenerada, SessionData, JuegoResult, Interes, INTERESES } from '@/types';
import Phase1Emotion from '@/components/phases/Phase1Emotion';
import PhaseInterestSelection from '@/components/phases/PhaseInterestSelection';
import Phase2Lesson from '@/components/phases/Phase2Lesson';
import Phase3Games from '@/components/phases/Phase3Games';
import Phase4FinalEmotion, { ClosureScreen } from '@/components/phases/Phase4FinalEmotion';
import { generarSesion } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface ChildSessionProps {
  perfil: PerfilNino;
    onComplete: (sessionData: SessionData) => void;
    onBack: () => void;
    
}

type SubPhase =
  | 'phase1_emotion'
  | 'phase1_interest'
  | 'loading'
  | 'load_error'
  | 'phase2'
  | 'phase3'
  | 'phase4'
  | 'closure';

/** Rotating loading messages personalized with name + interés */
const LOADING_MSGS = (nombre: string, interesEmoji: string, interesLabel: string, tema: string, idioma: string): string[] =>
  idioma === 'en'
    ? [
        `Preparing ${nombre ? nombre + "'s" : 'your'} lesson…`,
        `Creating games with ${interesEmoji} ${interesLabel}…`,
        `Generating a special illustration…`,
        `Almost ready, ${nombre || 'friend'}! ✨`,
      ]
    : [
        `Preparando la lección de ${nombre || 'ti'}…`,
        `Creando los juegos con ${interesEmoji} ${interesLabel}…`,
        `Generando la ilustración del tema "${tema}"…`,
        `¡Casi listo, ${nombre || 'campeón'}! ✨`,
      ];

const LOADING_STEPS = [
  { emoji: '🧠', label: 'Analizando perfil' },
  { emoji: '✍️', label: 'Creando contenido' },
  { emoji: '🎮', label: 'Diseñando juegos' },
  { emoji: '🎨', label: 'Generando imagen' },
];

const PHASE_LABELS = ['Inicio', 'Aprendizaje', 'Juegos', 'Final'];
const PHASE_EMOJIS = ['💭', '📖', '🎮', '✨'];

const subPhaseToIndex: Record<SubPhase, number> = {
  phase1_emotion: 0,
  phase1_interest: 0,
  loading: 1,
  load_error: 1,
  phase2: 1,
  phase3: 2,
  phase4: 3,
  closure: 4,
};

const ChildSession: React.FC<ChildSessionProps> = ({ perfil, onComplete, onBack }) => {
  const [subPhase, setSubPhase] = useState<SubPhase>('phase1_emotion');
  const [perfilConInteres, setPerfilConInteres] = useState<PerfilNino>(perfil);
  const [sesion, setSesion] = useState<SesionGenerada | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMsgIndex, setLoadMsgIndex] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData>({
    perfil,
    sesionGenerada: null,
    emocionInicio: { valor: null, timestamp: null },
    emocionFin: { valor: null, timestamp: null },
    deltaEmocional: null,
    simplificaciones: 0,
    tiempoInicio: Date.now(),
    tiempoFin: null,
    tiempoFase2: null,
    errores: [],
    juegos: [],
    porcentajeAciertos: null,
    nivelLogro: null,
  });

  const isTEA = perfil.condicion === 'tea';
  const nombre = perfil.nombre || '';
  const interes = INTERESES[perfilConInteres.interes];

  // Apply condition class to body
  useEffect(() => {
    const condClass = `condicion-${perfil.condicion}`;
    document.body.classList.add('child-ui', condClass);
    if (perfil.condicion === 'dislexia') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.css';
      document.head.appendChild(link);
    }
    return () => { document.body.classList.remove('child-ui', condClass); };
  }, [perfil.condicion]);

  // Loading animation
  useEffect(() => {
    if (subPhase !== 'loading') return;
    const interesLabel = INTERESES[perfilConInteres.interes]?.label || '';
    const interesEmoji = INTERESES[perfilConInteres.interes]?.emoji || '';
    const msgs = LOADING_MSGS(nombre, interesEmoji, interesLabel, perfil.tema, perfil.idioma);
    const msgTimer = setInterval(() => setLoadMsgIndex(i => (i + 1) % msgs.length), 2400);
    const progTimer = setInterval(() => setLoadProgress(p => Math.min(p + 1.2, 92)), 200);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [subPhase]);

  const currentPhaseIndex = subPhaseToIndex[subPhase] ?? 0;

  // PHASE 1 — Emotion
  const handlePhase1Complete = (valor: number) => {
    setSessionData(s => ({ ...s, emocionInicio: { valor, timestamp: Date.now() } }));
    setSubPhase('phase1_interest');
  };

  // PHASE 1.5 — Interest (child selects)
  const handleInterestSelect = async (selectedInteres: Interes) => {
    const updated: PerfilNino = { ...perfil, interes: selectedInteres };
    setPerfilConInteres(updated);
    setSessionData(s => ({ ...s, perfil: updated }));
    setLoadMsgIndex(0);
    setLoadProgress(0);
    setSubPhase('loading');

    try {
      const result = await generarSesion(updated);
      setSesion(result);
      setSessionData(s => ({ ...s, sesionGenerada: result }));
      setSubPhase('phase2');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al generar la sesión.';
      setLoadError(msg);
      setSubPhase('load_error');
    }
  };

  const handleRetryLoad = async () => {
    setLoadError(null);
    setLoadMsgIndex(0);
    setLoadProgress(0);
    setSubPhase('loading');
    try {
      const result = await generarSesion(perfilConInteres);
      setSesion(result);
      setSessionData(s => ({ ...s, sesionGenerada: result }));
      setSubPhase('phase2');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido.';
      setLoadError(msg);
      setSubPhase('load_error');
    }
  };

  // PHASE 2 — Lesson
  const handlePhase2Complete = (tiempo: number) => {
    setSessionData(s => ({ ...s, tiempoFase2: tiempo }));
    setSubPhase('phase3');
  };

  // PHASE 3 — Games
    const handlePhase3Complete = (juegos: JuegoResult[]) => {
        // Tipo E siempre cuenta como 100% — lo valida un humano
        const juegosConPct = juegos.map(j => {
            if (j.tipo === 'E') return 100;
            if (j.intentos === 0) return 0;
            return Math.min(Math.round((j.aciertos / j.intentos) * 100), 100);
        });

        const promedioFinal = juegosConPct.length > 0
            ? Math.round(juegosConPct.reduce((acc, pct) => acc + pct, 0) / juegosConPct.length)
            : 0;

        const finalPct = Math.min(promedioFinal, 100);

        setSessionData(prev => ({
            ...prev,
            porcentajeAciertos: finalPct,
            juegos,
            nivelLogro: finalPct >= 80 ? 'logrado' : finalPct >= 50 ? 'proceso' : 'inicio',
        }));

        setSubPhase('phase4');
    };



  // PHASE 4 — Final emotion
  const handlePhase4Complete = (valor: number) => {
    const emocionInicio = sessionData.emocionInicio.valor || 3;
    const delta = valor - emocionInicio;
    setSessionData(s => ({
      ...s,
      emocionFin: { valor, timestamp: Date.now() },
      deltaEmocional: delta,
      tiempoFin: Date.now(),
    }));
    setSubPhase('closure');
  };

  const handleShowReport = () => {
    onComplete({ ...sessionData, tiempoFin: Date.now() });
  };

  // ── LOADING SCREEN ────────────────────────────────────────────────────────
  if (subPhase === 'loading') {
    const interesLabel = INTERESES[perfilConInteres.interes]?.label || '';
    const interesEmoji = INTERESES[perfilConInteres.interes]?.emoji || '✨';
    const msgs = LOADING_MSGS(nombre, interesEmoji, interesLabel, perfil.tema, perfil.idioma);

    return (
      <div className="child-ui min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, hsl(40 30% 97%), hsl(234 72% 97%), hsl(172 60% 97%))' }}
      >
        <div className="max-w-sm w-full text-center">
          {/* Floating emoji */}
          <div className="relative flex justify-center mb-8">
            <div className="w-28 h-28 rounded-3xl bg-white shadow-xl border-2 border-primary/15 flex items-center justify-center animate-float">
              <span className="text-6xl">{interesEmoji}</span>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-teo-yellow animate-sparkle" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-foreground mb-1">
            {perfil.idioma === 'en' ? 'Preparing your session…' : 'Preparando tu sesión…'}
          </h2>
          <p className="text-muted-foreground font-bold text-sm mb-5">
            {perfil.idioma === 'en' ? 'This may take a few seconds' : 'Esto puede tomar unos segundos'}
          </p>

          {/* Progress bar */}
          <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full progress-bar"
              style={{
                width: `${loadProgress}%`,
                background: 'linear-gradient(90deg, hsl(234 72% 55%), hsl(172 60% 45%))',
              }}
            />
          </div>

          {/* Rotating message */}
          <p key={loadMsgIndex} className="text-sm font-black text-primary animate-fade-in h-6 mb-8">
            {msgs[loadMsgIndex]}
          </p>

          {/* Steps */}
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
            {LOADING_STEPS.map((step, i) => {
              const threshold = (i + 1) * 22;
              const active = loadProgress > threshold;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-700 ${
                    active ? 'bg-primary/15 shadow-sm scale-110' : 'bg-muted'
                  }`}>
                    {step.emoji}
                  </div>
                  <span className={`text-center leading-tight ${active ? 'text-primary font-black' : 'font-semibold'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── LOAD ERROR SCREEN ─────────────────────────────────────────────────────
  if (subPhase === 'load_error') {
    return (
      <div className="child-ui min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-destructive/30 shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-black text-foreground mb-2">
            {perfil.idioma === 'en' ? 'Something went wrong' : 'Algo salió mal'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-semibold">{loadError}</p>
          <button
            onClick={handleRetryLoad}
            className="child-btn w-full bg-primary text-white font-black py-3 rounded-xl cursor-pointer"
          >
            🔄 {perfil.idioma === 'en' ? 'Try again' : 'Intentar de nuevo'}
          </button>
        </div>
      </div>
    );
  }

  // ── SHOW TOP BAR only for active phases (not closure) ────────────────────
  const showTopBar = subPhase !== 'closure';

  return (
    <div className="min-h-screen child-ui font-child">
      {showTopBar && (
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-sm border-b border-border/50 px-4 py-3 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        if (subPhase === 'phase1_emotion') onBack();
                        else if (subPhase === 'phase1_interest') setSubPhase('phase1_emotion');
                        else if (subPhase === 'phase2') setSubPhase('phase1_interest');
                        else if (subPhase === 'phase3') setSubPhase('phase2');
                        else if (subPhase === 'phase4') setSubPhase('phase3');
                        else onBack();
                    }}
                    className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mr-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </button>
                <span className="text-xl">
                  {subPhase === 'phase1_emotion' || subPhase === 'phase1_interest'
                    ? '🌟'
                    : interes?.emoji || '✨'}
                </span>
                <span className="font-black text-base text-foreground">
                  {nombre ? `¡Hola, ${nombre}!` : 'TEOplay'}
                </span>
              </div>
              <span className="text-xs font-black text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {PHASE_EMOJIS[Math.min(currentPhaseIndex, 3)]} {PHASE_LABELS[Math.min(currentPhaseIndex, 3)]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {PHASE_LABELS.map((label, i) => (
                <div key={i} className={`flex flex-col items-center gap-0.5 flex-1 ${i <= currentPhaseIndex ? '' : 'opacity-40'}`}>
                  <div className={`w-full h-2 rounded-full transition-all duration-500 ${
                    i < currentPhaseIndex ? 'bg-teo-green' :
                    i === currentPhaseIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <span className={`text-[9px] font-black hidden sm:block ${
                    i === currentPhaseIndex ? 'text-primary' : 'text-muted-foreground'
                  }`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {subPhase === 'phase1_emotion' && (
          <Phase1Emotion
            nombre={nombre}
            condicion={perfil.condicion}
            title={perfil.idioma === 'es' ? '¿Cómo te sientes hoy?' : 'How are you feeling today?'}
            onSelect={handlePhase1Complete}
          />
        )}

        {subPhase === 'phase1_interest' && (
          <PhaseInterestSelection
            nombre={nombre}
            condicion={perfil.condicion}
            idioma={perfil.idioma}
            onSelect={handleInterestSelect}
          />
        )}

        {subPhase === 'phase2' && sesion && (
          <Phase2Lesson
            perfil={perfilConInteres}
            sesion={sesion}
            onComplete={handlePhase2Complete}
          />
        )}

        {subPhase === 'phase3' && sesion && (
          <Phase3Games
            perfil={perfilConInteres}
            sesion={sesion}
            onComplete={handlePhase3Complete}
          />
        )}

        {subPhase === 'phase4' && sesion && (
          <Phase4FinalEmotion
            nombre={nombre}
            condicion={perfil.condicion}
            interes={perfilConInteres.interes}
            mensajeCierre={sesion.mensajeCierre}
            emocionInicio={sessionData.emocionInicio.valor || 3}
            onSelect={handlePhase4Complete}
          />
        )}

        {subPhase === 'closure' && sesion && (
          <ClosureScreen
            nombre={nombre}
            interes={perfilConInteres.interes}
            mensajeCierre={sesion.mensajeCierre}
            emocionInicio={sessionData.emocionInicio.valor || 3}
            emocionFin={sessionData.emocionFin.valor || 3}
            onVerReporte={handleShowReport}
          />
        )}
      </div>
    </div>
  );
};

export default ChildSession;
