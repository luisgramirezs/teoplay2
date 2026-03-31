import React from 'react';
import { SessionData } from '@/types';
import { EMOCIONES, INTERESES, CONDICIONES, ASIGNATURAS } from '@/types';
import { Clock, Target, RefreshCw, Heart, RotateCcw, FileText, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { exportReportPDF } from '@/lib/pdfExport';

interface ReportScreenProps {
  data: SessionData;
    onReset: () => void;
    onBack: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ data, onReset, onBack }) => {
  const perfil = data.perfil!;
  const nombre = perfil.nombre || 'Alumno/a';
  const emoIni = EMOCIONES.find(e => e.valor === data.emocionInicio.valor);
  const emoFin = EMOCIONES.find(e => e.valor === data.emocionFin.valor);
  const delta = data.deltaEmocional ?? 0;
  const duracion = data.tiempoFin && data.tiempoInicio
    ? Math.round((data.tiempoFin - data.tiempoInicio) / 60000)
    : 0;
  const pct = data.porcentajeAciertos ?? 0;
  //const pct = Math.min(data.porcentajeAciertos ?? 0, 100);
  const nivel = data.nivelLogro || 'inicio';

  const nivelConfig = {
    logrado: { label: 'Logrado', color: 'text-teo-green', bg: 'bg-teo-green/10', border: 'border-teo-green/30', icon: '🟢', bar: 'bg-teo-green' },
    proceso: { label: 'En proceso', color: 'text-teo-yellow', bg: 'bg-teo-yellow/10', border: 'border-teo-yellow/30', icon: '🟡', bar: 'bg-teo-yellow' },
    inicio: { label: 'En inicio', color: 'text-teo-red', bg: 'bg-teo-red/10', border: 'border-teo-red/30', icon: '🔴', bar: 'bg-teo-red' },
  }[nivel];

  const metrics = [
    {
      label: 'Duración total',
      value: `${duracion} min`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Aciertos en juegos',
      value: `${pct}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-teo-green',
      bg: 'bg-teo-green/10',
    },
    {
      label: '"Explícame diferente"',
      value: `${data.simplificaciones}x`,
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-teo-orange',
      bg: 'bg-teo-orange/10',
    },
    {
      label: 'Delta emocional',
      value: delta > 0 ? `+${delta}` : `${delta}`,
      icon: delta > 0 ? <TrendingUp className="w-5 h-5" /> : delta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />,
      color: delta > 0 ? 'text-teo-green' : delta < 0 ? 'text-teo-red' : 'text-muted-foreground',
      bg: delta > 0 ? 'bg-teo-green/10' : delta < 0 ? 'bg-teo-red/10' : 'bg-muted',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-adult">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Reporte de Sesión</h1>
              <p className="text-xs text-muted-foreground">
                {nombre} — {ASIGNATURAS[perfil.asignatura]?.label}: {perfil.tema}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground font-semibold text-sm rounded-xl hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Atrás
            </button>
            <button
              onClick={() => exportReportPDF(data)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground font-semibold text-sm rounded-xl hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Nueva sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Profile summary */}
        <section className="bg-card rounded-2xl border border-border p-5">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Alumno', val: nombre },
              { label: 'Edad', val: `${perfil.edad} años • ${perfil.grado}` },
              { label: 'Condición', val: CONDICIONES[perfil.condicion]?.label },
              { label: 'Interés', val: `${INTERESES[perfil.interes]?.emoji} ${INTERESES[perfil.interes]?.label}` },
              { label: 'Idioma', val: perfil.idioma === 'es' ? 'Español' : 'English' },
            ].map(item => (
              <div key={item.label} className="flex flex-col px-4 py-2 bg-muted/40 rounded-xl">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">Métricas de la sesión</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${m.bg} ${m.color} mb-3`}>
                  {m.icon}
                </div>
                <div className={`text-3xl font-black ${m.color} mb-1`}>{m.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Emotional delta */}
        <section className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-teo-pink" />
            Trayectoria emocional
          </h2>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">{emoIni?.emoji}</span>
              <span className="text-xs font-bold text-muted-foreground">{emoIni?.label}</span>
              <span className="text-xs text-muted-foreground">Al entrar</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-0.5 bg-border" />
              <span className={`text-sm font-bold ${delta > 0 ? 'text-teo-green' : delta < 0 ? 'text-teo-red' : 'text-muted-foreground'}`}>
                {delta > 0 ? `+${delta} mejoró 📈` : delta < 0 ? `${delta} bajó 📉` : 'Sin cambio'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">{emoFin?.emoji}</span>
              <span className="text-xs font-bold text-muted-foreground">{emoFin?.label}</span>
              <span className="text-xs text-muted-foreground">Al salir</span>
            </div>
          </div>
        </section>

        {/* Achievement scale */}
        <section className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Escala de logro</h2>
          <div className={`flex items-center justify-between p-4 rounded-xl border ${nivelConfig.bg} ${nivelConfig.border} mb-4`}>
            <div>
              <span className="text-lg mr-2">{nivelConfig.icon}</span>
              <span className={`font-black text-lg ${nivelConfig.color}`}>{nivelConfig.label}</span>
            </div>
            <span className={`text-2xl font-black ${nivelConfig.color}`}>{pct}%</span>
          </div>
          {/* Bar */}
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${nivelConfig.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0% — En inicio</span>
            <span>50% — En proceso</span>
            <span>80%+ — Logrado</span>
          </div>
        </section>

        {/* Game details */}
        {data.juegos.length > 0 && (
          <section className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-base font-bold text-foreground mb-4">Detalle por juego</h2>
            <div className="space-y-2">
              {data.juegos.map((j, i) => {
                  //const jPct = j.intentos > 0 ? Math.round((j.aciertos / j.intentos) * 100) : 0;
                  const jPct = j.tipo === 'E' ? 100 : j.intentos > 0 ? Math.round((j.aciertos / j.intentos) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <span className="font-black text-sm text-muted-foreground w-20">Juego {i + 1} (Tipo {j.tipo})</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${j.aciertos > 0 ? 'bg-teo-green' : 'bg-teo-red'}`}
                        style={{ width: `${jPct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground w-16 text-right">
                      {j.aciertos}✅ {j.errores}❌
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {data.sesionGenerada?.recomendaciones?.length > 0 && (
          <section className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-base font-bold text-foreground mb-4">💡 Recomendaciones pedagógicas</h2>
            <div className="space-y-3">
              {data.sesionGenerada.recomendaciones.map((rec, i) => (
                <div key={i} className="flex gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            onClick={() => exportReportPDF(data)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-card border-2 border-border rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            📄 Exportar reporte PDF
          </button>
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            🔁 Generar nueva sesión
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReportScreen;
