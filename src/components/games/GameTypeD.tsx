import React, { useState } from 'react';
import { JuegoD, JuegoResult, PerfilNino } from '@/types';
import { DynamicIcon } from '@/components/DynamicIcon';
import { CheckCircle, XCircle } from 'lucide-react';

interface GameTypeDProps {
  game: JuegoD;
  perfil: PerfilNino;
  onComplete: (result: JuegoResult) => void;
  onCorrect: () => void;
  onWrong: () => void;
}

const GameTypeD: React.FC<GameTypeDProps> = ({ game, perfil, onComplete, onCorrect, onWrong }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const handleSelect = (idx: number) => {
    if (done || revealed) return;
    const item = game.items[idx];
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSelected(idx);

    if (item.esIntruso) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => setDone(true), 1000);
    } else {
      setErrors(e => e + 1);
      setFeedback('wrong');
      onWrong();
      if (newAttempts >= 2) {
        setTimeout(() => { setRevealed(true); setFeedback(null); setSelected(null); }, 800);
      } else {
        setTimeout(() => { setFeedback(null); setSelected(null); }, 600);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-3xl border border-border shadow-lg p-6">
        <p className="text-lg font-bold text-muted-foreground text-center mb-2">{game.instruccion}</p>
        <p className="text-xl font-black text-foreground text-center mb-6">¿Cuál NO pertenece al grupo? 🔍</p>

        <div className="grid grid-cols-2 gap-4">
          {game.items.map((item, idx) => {
            let btnClass = 'game-option child-btn flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 font-bold text-base transition-all cursor-pointer ';
            if (revealed && item.esIntruso) btnClass += 'border-teo-green bg-teo-green/20 animate-bounce-in';
            else if (selected === idx && feedback === 'correct') btnClass += 'border-teo-green bg-teo-green/20 feedback-correct';
            else if (selected === idx && feedback === 'wrong') btnClass += 'border-teo-red bg-teo-red/20 feedback-wrong';
            else if (done && item.esIntruso) btnClass += 'border-teo-green bg-teo-green/20';
            else btnClass += 'border-border bg-card hover:border-primary/60 hover:bg-primary/5';

            return (
              <button key={idx} type="button" className={btnClass} onClick={() => handleSelect(idx)}>
                <DynamicIcon name={item.icono} className="w-10 h-10 text-primary" />
                <span className="text-center leading-tight">{item.texto}</span>
                {selected === idx && feedback === 'correct' && <CheckCircle className="w-5 h-5 text-teo-green" />}
                {selected === idx && feedback === 'wrong' && <XCircle className="w-5 h-5 text-teo-red" />}
                {revealed && item.esIntruso && <span className="text-xs font-black text-teo-green">¡El intruso! 🎯</span>}
              </button>
            );
          })}
        </div>

        {done && (
          <button
            onClick={() => onComplete({ tipo: 'D', aciertos: 1, errores: errors, intentos: attempts })}
            className="child-btn w-full mt-6 bg-teo-green text-white font-black text-lg py-4 rounded-2xl animate-bounce-in cursor-pointer"
          >
            ✅ ¡Lo encontré! Siguiente ➜
          </button>
        )}

        {revealed && !done && (
          <button
            onClick={() => onComplete({ tipo: 'D', aciertos: 0, errores: errors, intentos: attempts })}
            className="child-btn w-full mt-6 bg-primary text-primary-foreground font-black text-lg py-4 rounded-2xl cursor-pointer"
          >
            Continuar ➜
          </button>
        )}
      </div>
    </div>
  );
};

export default GameTypeD;
