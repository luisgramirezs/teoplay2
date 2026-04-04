export interface DashboardMetrics {
  totalSesiones: number;
  promedioAciertos: number;
  promedioDuracion: number;
  promedioEmocionalInicio: number;
  promedioEmocionalFin: number;
  deltaEmocionalPromedio: number;
  totalSimplificaciones: number;
  asignaturasFrecuentes: { asignatura: string; sesiones: number }[];
  evolucionAciertos: { fecha: number; pct: number; tema: string }[];
  ultimaSesion: any | null;
  nivelAprendizaje: 'Alto' | 'Medio' | 'Bajo';
  rachaActual: number;
}

export const getDashboardMetrics = (sesiones: any[]): DashboardMetrics => {
  if (sesiones.length === 0) {
    return {
      totalSesiones: 0,
      promedioAciertos: 0,
      promedioDuracion: 0,
      promedioEmocionalInicio: 0,
      promedioEmocionalFin: 0,
      deltaEmocionalPromedio: 0,
      totalSimplificaciones: 0,
      asignaturasFrecuentes: [],
      evolucionAciertos: [],
      ultimaSesion: null,
      nivelAprendizaje: 'Bajo',
      rachaActual: 0,
    };
  }

  // Ordenar por fecha ascendente
  const ordenadas = [...sesiones].sort((a, b) => (a.fecha || 0) - (b.fecha || 0));

  const total = sesiones.length;
  const sumaAciertos  = sesiones.reduce((acc, s) => acc + (s.aciertosPct || 0), 0);
  const sumaDuracion  = sesiones.reduce((acc, s) => acc + (s.duracion || 0), 0);
  const sumaEmoIni    = sesiones.reduce((acc, s) => acc + (s.emocionInicio || 0), 0);
  const sumaEmoFin    = sesiones.reduce((acc, s) => acc + (s.emocionFin || 0), 0);
  const sumaDelta     = sesiones.reduce((acc, s) => acc + (s.deltaEmocional || 0), 0);
  const sumaSimplif   = sesiones.reduce((acc, s) => acc + (s.simplificaciones || 0), 0);

  const promedioAciertos = Math.min(100, Math.round(sumaAciertos / total));

  // Asignaturas más frecuentes
  const conteoAsig: Record<string, number> = {};
  sesiones.forEach(s => {
    if (s.asignatura) conteoAsig[s.asignatura] = (conteoAsig[s.asignatura] || 0) + 1;
  });
  const asignaturasFrecuentes = Object.entries(conteoAsig)
    .map(([asignatura, sesiones]) => ({ asignatura, sesiones }))
    .sort((a, b) => b.sesiones - a.sesiones)
    .slice(0, 4);

  // Evolución de aciertos para gráfico
  const evolucionAciertos = ordenadas.map(s => ({
    fecha: s.fecha || 0,
    pct: Math.min(100, s.aciertosPct || 0),
    tema: s.tema || s.asignatura || '',
  }));

  // Racha de días consecutivos
  const dias = new Set(
    sesiones.map(s => new Date(s.fecha || 0).toDateString())
  );
  let racha = 0;
  const hoy = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    if (dias.has(d.toDateString())) racha++;
    else break;
  }

  const nivel: 'Alto' | 'Medio' | 'Bajo' =
    promedioAciertos >= 80 ? 'Alto' :
    promedioAciertos >= 50 ? 'Medio' : 'Bajo';

  return {
    totalSesiones: total,
    promedioAciertos,
    promedioDuracion: Math.round(sumaDuracion / total),
    promedioEmocionalInicio: Math.round((sumaEmoIni / total) * 10) / 10,
    promedioEmocionalFin: Math.round((sumaEmoFin / total) * 10) / 10,
    deltaEmocionalPromedio: Math.round((sumaDelta / total) * 10) / 10,
    totalSimplificaciones: sumaSimplif,
    asignaturasFrecuentes,
    evolucionAciertos,
    ultimaSesion: ordenadas[ordenadas.length - 1] || null,
    nivelAprendizaje: nivel,
    rachaActual: racha,
  };
};
