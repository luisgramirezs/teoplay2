import React from 'react';
import { INTERESES, Interes } from '@/types';

interface PhaseInterestSelectionProps {
  nombre: string;
  condicion: string;
  idioma: string;
  onSelect: (interes: Interes) => void;
}

const PhaseInterestSelection: React.FC<PhaseInterestSelectionProps> = ({
  nombre, condicion, idioma, onSelect
}) => {
  const [selected, setSelected] = React.useState<Interes | null>(null);
  const isTEA = condicion === 'tea';

  const title = idioma === 'en'
    ? `What do you like most, ${nombre || 'friend'}?`
    : `¿Qué es lo que más te gusta${nombre ? `, ${nombre}` : ''}?`;
  const subtitle = idioma === 'en'
    ? 'Choose your favourite topic — it will be in all your activities!'
    : '¡Elige tu tema favorito — estará en todas tus actividades!';
  const btnLabel = idioma === 'en' ? "Let's go! ➜" : '¡Vamos! ➜';

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 ${!isTEA ? 'animate-slide-up' : ''}`}>
      <div className="bg-card rounded-3xl shadow-lg border border-border w-full max-w-xl p-6 sm:p-8 text-center">
        <div className={`text-5xl mb-4 ${!isTEA ? 'animate-bounce-in' : ''}`}>🌟</div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground font-medium text-sm sm:text-base mb-8">
          {subtitle}
        </p>

        {/* Interest grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {(Object.entries(INTERESES) as [Interes, typeof INTERESES[Interes]][]).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
                isTEA ? '' : 'hover:scale-105'
              } ${
                selected === key
                  ? 'border-primary bg-primary/10 shadow-lg scale-105'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              aria-label={val.label}
              aria-pressed={selected === key}
            >
              <span
                className={`leading-none transition-all ${!isTEA && selected === key ? 'animate-bounce-in' : ''}`}
                style={{ fontSize: selected === key ? '56px' : '44px' }}
              >
                {val.emoji}
              </span>
              <span
                className={`text-xs sm:text-sm font-black text-center leading-tight ${
                  selected === key ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {val.label}
              </span>
            </button>
          ))}
        </div>

        {/* Proceed button */}
        <div className={`transition-all duration-300 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isTEA ? '!transition-none' : ''}`}>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="child-btn w-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xl font-black px-8 py-4 rounded-2xl shadow-lg cursor-pointer disabled:opacity-50"
          >
            {selected ? `${INTERESES[selected]?.emoji} ${btnLabel}` : btnLabel}
          </button>
        </div>

        {!selected && (
          <p className="text-muted-foreground text-sm mt-4 font-medium">
            {idioma === 'en' ? 'Tap your favourite 👆' : 'Toca tu favorito 👆'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhaseInterestSelection;
