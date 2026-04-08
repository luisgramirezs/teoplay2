import React, { useState } from 'react';
import { EMOCIONES, INTERESES } from '@/types';

interface Phase4Props {
  nombre: string;
  condicion: string;
  interes: string;
  mensajeCierre: string;
  emocionInicio: number;
  onSelect: (valor: number) => void;
}

const Phase4FinalEmotion: React.FC<Phase4Props> = ({
  nombre, condicion, interes, mensajeCierre, emocionInicio, onSelect
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const isTEA = condicion === 'tea';
  const interesData = INTERESES[interes as keyof typeof INTERESES];

  const handleContinue = () => {
    if (selected === null) return;
    setTimeout(() => onSelect(selected), 100);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 ${!isTEA ? 'animate-slide-up' : ''}`}>
      <div className="bg-white rounded-3xl shadow-lg border border-border w-full max-w-lg p-8 text-center">
        <div className={`text-6xl mb-4 ${!isTEA ? 'animate-bounce-in' : ''}`}>
          {interesData?.emoji}
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">
          ¿Cómo te sientes ahora{nombre ? `, ${nombre}` : ''}?
        </h2>
        <p className="text-muted-foreground text-sm mb-6 font-bold">¡Ya casi terminas! 🌟</p>

        <div className="flex items-end justify-center gap-3 sm:gap-5 my-6">
          {EMOCIONES.map(emo => (
            <button
              key={emo.valor}
              type="button"
              onClick={() => setSelected(emo.valor)}
              className={`emotion-face flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                selected === emo.valor ? 'selected' : 'border-transparent'
              } ${isTEA ? '!transition-none' : ''}`}
              style={selected === emo.valor ? { borderColor: emo.color } : {}}
            >
              <span style={{ fontSize: selected === emo.valor ? '68px' : '56px' }}>{emo.emoji}</span>
              <span className="text-xs font-bold" style={{ color: selected === emo.valor ? emo.color : '#94a3b8' }}>
                {emo.label}
              </span>
            </button>
          ))}
        </div>

        <div className={`transition-all duration-300 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isTEA ? '!transition-none' : ''}`}>
          <button
            type="button"
            disabled={!selected}
            onClick={handleContinue}
            className="child-btn w-full bg-gradient-to-r from-primary to-accent text-white text-lg font-black px-8 py-4 rounded-2xl shadow-lg cursor-pointer"
          >
            🏆 ¡Ver mi resultado!
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Celebration / closure screen ─────────────────────────────────────────────
interface ClosureScreenProps {
  nombre: string;
  interes: string;
  mensajeCierre: string;
  emocionInicio: number;
  emocionFin: number;
  onVerReporte: () => void;
}

export const ClosureScreen: React.FC<ClosureScreenProps> = ({
  nombre, interes, mensajeCierre, emocionInicio, emocionFin, onVerReporte
}) => {
  const interesData = INTERESES[interes as keyof typeof INTERESES];
  const delta = emocionFin - emocionInicio;
  const emoIni = EMOCIONES.find(e => e.valor === emocionInicio);
  const emoFin = EMOCIONES.find(e => e.valor === emocionFin);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, hsl(42 96% 62% / 0.12), hsl(172 60% 45% / 0.10), hsl(270 68% 58% / 0.10))' }}
    >
      {/* Confetti dots (pure CSS) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full opacity-70"
            style={{
              left: `${8 + i * 8}%`,
              top: `${10 + (i % 3) * 15}%`,
              backgroundColor: ['#fbbf24','#34d399','#818cf8','#f87171','#60a5fa','#a78bfa'][i % 6],
              animation: `confetti-fall ${1.5 + (i % 4) * 0.4}s ${i * 0.15}s ease-in infinite`,
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-border/50 w-full max-w-md p-8 text-center relative z-10">

        {/* Animated badge */}
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-5">
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teo-yellow to-teo-orange opacity-15 animate-pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teo-yellow/30 to-teo-orange/20" />
          {/* Badge */}
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-teo-yellow to-teo-orange flex items-center justify-center shadow-xl animate-badge-pop"
            style={{ boxShadow: '0 8px 32px hsl(42 96% 62% / 0.45)' }}
          >
            <span className="text-5xl">{interesData?.emoji}</span>
          </div>
          {/* Star accents */}
          <span className="absolute -top-1 -right-1 text-2xl animate-sparkle">⭐</span>
          <span className="absolute -bottom-1 -left-1 text-xl animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</span>
        </div>

        <div className="text-[28px] font-black text-foreground mb-3 leading-tight">
          ¡Misión completada{nombre ? `, ${nombre}` : ''}! 🎉
        </div>
        <p className="text-foreground/80 text-base font-semibold leading-relaxed mb-6 px-2">
          {mensajeCierre}
        </p>

        {/* Emotion journey */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl mb-5">
          <div className="text-center">
            <span className="text-4xl block">{emoIni?.emoji}</span>
            <span className="text-[11px] font-black text-muted-foreground mt-1 block">Al inicio</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-muted-foreground">→</span>
            {delta > 0 && (
              <span className="text-[11px] font-black text-teo-green">+{delta} 📈</span>
            )}
            {delta < 0 && (
              <span className="text-[11px] font-black text-teo-red">{delta} 📉</span>
            )}
            {delta === 0 && (
              <span className="text-[11px] font-black text-muted-foreground">= igual</span>
            )}
          </div>
          <div className="text-center">
            <span className="text-4xl block">{emoFin?.emoji}</span>
            <span className="text-[11px] font-black text-muted-foreground mt-1 block">Al final</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground font-bold mb-6">
          ¡Dile a tu maestra o familiar que terminaste! 🌟
        </p>

        <button
          type="button"
          onClick={onVerReporte}
          className="w-full py-3.5 px-4 rounded-xl border-2 border-border text-muted-foreground font-black text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          👤 Ver resultados
        </button>
      </div>
    </div>
  );
};

export default Phase4FinalEmotion;
