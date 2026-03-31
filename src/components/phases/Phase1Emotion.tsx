import React from 'react';
import { EMOCIONES } from '@/types';

interface Phase1EmotionProps {
  nombre: string;
  condicion: string;
  title: string;
  onSelect: (valor: number) => void;
}

const Phase1Emotion: React.FC<Phase1EmotionProps> = ({ nombre, condicion, title, onSelect }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const isTEA = condicion === 'tea';

  const handleSelect = (valor: number) => {
    setSelected(valor);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className={`bg-card rounded-3xl shadow-lg border border-border w-full max-w-lg p-8 text-center ${!isTEA ? 'animate-slide-up' : ''}`}>
        <h2 className="text-2xl font-black text-foreground mb-2 child-text">
          {title}
        </h2>
        {nombre && (
          <p className="text-lg font-bold text-primary mb-6">¡Hola, {nombre}! 👋</p>
        )}

        {/* Emotion faces */}
        <div className="flex items-end justify-center gap-3 sm:gap-5 my-8">
          {EMOCIONES.map(emo => (
            <button
              key={emo.valor}
              type="button"
              onClick={() => handleSelect(emo.valor)}
              className={`emotion-face flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                selected === emo.valor
                  ? 'border-2 bg-primary/10 selected'
                  : 'border-transparent hover:border-border/50'
              } ${isTEA ? '!transition-none' : ''}`}
              style={selected === emo.valor ? { borderColor: emo.color } : {}}
              aria-label={emo.label}
            >
              <span
                className="leading-none select-none"
                style={{ fontSize: selected === emo.valor ? '72px' : '60px' }}
              >
                {emo.emoji}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: selected === emo.valor ? emo.color : '#94a3b8' }}
              >
                {emo.label}
              </span>
            </button>
          ))}
        </div>

        {/* Proceed button — only visible after selection */}
        <div className={`transition-all duration-300 ${selected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${isTEA ? '!transition-none' : ''}`}>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="child-btn w-full bg-primary text-primary-foreground text-lg font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            Empezamos ➜
          </button>
        </div>

        {!selected && (
          <p className="text-muted-foreground text-sm mt-4 font-medium animate-fade-in">
            Toca cómo te sientes 👆
          </p>
        )}
      </div>
    </div>
  );
};

export default Phase1Emotion;
