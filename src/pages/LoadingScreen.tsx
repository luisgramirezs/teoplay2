import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PerfilNino } from '@/types';
import { INTERESES, CONDICIONES } from '@/types';

interface LoadingScreenProps {
  perfil: PerfilNino;
  error: string | null;
  onRetry: () => void;
}

const MESSAGES = (perfil: PerfilNino): string[] => {
  const nombre = perfil.nombre || 'el alumno';
  const interes = INTERESES[perfil.interes]?.emoji + ' ' + INTERESES[perfil.interes]?.label;
  const condicion = CONDICIONES[perfil.condicion]?.label;
  return [
    `Preparando la lección de ${nombre}…`,
    `Diseñando los juegos con ${interes}…`,
    `Adaptando el contenido para ${condicion}…`,
    `Creando preguntas sobre "${perfil.tema}"…`,
    `Personalizando la experiencia para ${nombre}…`,
    `Generando recomendaciones pedagógicas…`,
    `¡Casi listo! Revisando todo el contenido…`,
  ];
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ perfil, error, onRetry }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const messages = MESSAGES(perfil);

  useEffect(() => {
    if (error) return;
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, 2500);
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.5, 90));
    }, 200);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [error]);

  const interes = INTERESES[perfil.interes];
  const nombre = perfil.nombre || 'el alumno';

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border border-destructive/30 shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Ups, algo salió mal</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors min-h-[56px] cursor-pointer"
            >
              🔄 Intentar de nuevo
            </button>
            <p className="text-xs text-muted-foreground">
              Asegúrate de que tu API Key sea correcta y tengas conexión a internet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        {/* Animated icon */}
        <div className="relative flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center animate-float">
            <span className="text-5xl" role="img" aria-label="interés">
              {interes?.emoji}
            </span>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-primary"
                style={{
                  animation: `loading-dots 1.4s ${i * 0.16}s ease-in-out infinite`,
                  transform: `rotate(${i * 120}deg) translateX(52px)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
          <h1 className="text-2xl font-bold text-foreground">
            Creando la sesión de <span className="text-primary">{nombre}</span>
          </h1>
          <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
        </div>
        <p className="text-muted-foreground text-sm mb-6">La IA está generando una experiencia única</p>

        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Rotating message */}
        <div className="h-8 flex items-center justify-center">
          <p
            key={msgIndex}
            className="text-sm font-medium text-primary animate-fade-in"
          >
            {messages[msgIndex]}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          {[
            { emoji: '🧠', label: 'Analizando perfil' },
            { emoji: '✍️', label: 'Creando contenido' },
            { emoji: '🎮', label: 'Diseñando juegos' },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-700 ${
                progress > (i + 1) * 25 ? 'bg-primary/20 scale-110' : 'bg-muted'
              }`}>
                {step.emoji}
              </div>
              <span className={progress > (i + 1) * 25 ? 'text-primary font-semibold' : ''}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
