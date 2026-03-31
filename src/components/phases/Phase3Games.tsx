import React, { useState, useEffect } from 'react';
import { PerfilNino, SesionGenerada, JuegoResult, JuegoA, JuegoB, JuegoC, JuegoD, JuegoE } from '@/types';
import { INTERESES } from '@/types';
import GameTypeA from '@/components/games/GameTypeA';
import GameTypeB from '@/components/games/GameTypeB';
import GameTypeC from '@/components/games/GameTypeC';
import GameTypeD from '@/components/games/GameTypeD';
import GameTypeE from '@/components/games/GameTypeE';

interface Phase3GamesProps {
  perfil: PerfilNino;
  sesion: SesionGenerada;
  onComplete: (juegos: JuegoResult[]) => void;
}

function playCorrectSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function playWrongSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const Phase3Games: React.FC<Phase3GamesProps> = ({ perfil, sesion, onComplete }) => {
  const [juegoIndex, setJuegoIndex] = useState(0);
  const [mostrandoMensaje, setMostrandoMensaje] = useState(false);
  const [results, setResults] = useState<JuegoResult[]>([]);
  const isTEA = perfil.condicion === 'tea';
  const nombre = perfil.nombre || '';
  const interes = INTERESES[perfil.interes];

  const juegos = sesion.juegos || [];
  const currentGame = juegos[juegoIndex];

  const handleGameComplete = (result: JuegoResult) => {
    if (perfil.condicion !== 'tea') playCorrectSound();
    const newResults = [...results, result];
    setResults(newResults);

    const isLast = juegoIndex >= juegos.length - 1;
    if (isLast) {
      onComplete(newResults);
      return;
    }

    // Show motivational message between games
    if (sesion.mensajesMotivacionales?.[juegoIndex]) {
      setMostrandoMensaje(true);
      setTimeout(() => {
        setMostrandoMensaje(false);
        setJuegoIndex(i => i + 1);
      }, 3000);
    } else {
      setJuegoIndex(i => i + 1);
    }
  };

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando juegos…</p>
        </div>
      </div>
    );
  }

  if (mostrandoMensaje) {
    const msg = sesion.mensajesMotivacionales?.[juegoIndex] || `¡Excelente${nombre ? ', ' + nombre : ''}! Vamos al siguiente juego ${interes?.emoji}`;
    return (
      <div className={`flex items-center justify-center min-h-[60vh] px-4 py-8 ${!isTEA ? 'animate-fade-in' : ''}`}>
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/20 p-10 max-w-md text-center">
          <div className="text-7xl mb-4 animate-bounce-in">{interes?.emoji}</div>
          <p className="text-2xl font-black text-foreground leading-relaxed">{msg}</p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const gameProps = {
    perfil,
    onComplete: handleGameComplete,
    onCorrect: () => { if (perfil.condicion !== 'tea') playCorrectSound(); },
    onWrong: () => { if (perfil.condicion !== 'tea') playWrongSound(); },
  };

  return (
    <div className={`px-4 py-6 ${!isTEA ? 'animate-slide-up' : ''}`}>
      {/* Game number indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {juegos.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < juegoIndex ? 'w-6 bg-teo-green' :
              i === juegoIndex ? 'w-10 bg-primary' :
              'w-6 bg-muted'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-sm font-bold text-muted-foreground mb-4">
        Juego {juegoIndex + 1} de {juegos.length}
      </p>

      
      {currentGame.tipo === 'A' && (
          <GameTypeA
            game={currentGame as JuegoA}
            perfil={perfil}
            explicacion={sesion.explicacion}
            onComplete={handleGameComplete}
            onCorrect={() => { if (perfil.condicion !== 'tea') playCorrectSound(); }}
            onWrong={() => { if (perfil.condicion !== 'tea') playWrongSound(); }}
          />
      )}
      {currentGame.tipo === 'B' && (
        <GameTypeB
          game={currentGame as JuegoB}
          perfil={perfil}
          explicacion={sesion.explicacion}
          onComplete={handleGameComplete}
          onCorrect={() => { if (perfil.condicion !== 'tea') playCorrectSound(); }}
          onWrong={() => { if (perfil.condicion !== 'tea') playWrongSound(); }}
        />
      )}
      {currentGame.tipo === 'C' && (
        <GameTypeC
          game={currentGame as JuegoC}
          perfil={perfil}
          explicacion={sesion.explicacion}
          onComplete={handleGameComplete}
          onCorrect={() => { if (perfil.condicion !== 'tea') playCorrectSound(); }}
          onWrong={() => { if (perfil.condicion !== 'tea') playWrongSound(); }}
        />
      )}
      {currentGame.tipo === 'D' && <GameTypeD game={currentGame as any} {...gameProps} />}
      {currentGame.tipo === 'E' && <GameTypeE game={currentGame as any} {...gameProps} />}
    </div>
  );
};

export default Phase3Games;
