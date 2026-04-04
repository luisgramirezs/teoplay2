import { getDashboardSessions } from './dashboardStorage';

export const getDashboardMetrics = (sesiones: any[]) => {

  if (sesiones.length === 0) {
    return {
      totalSesiones: 0,
      promedioAciertos: 0,
      promedioDuracion: 0,
    };
  }

  const totalSesiones = sesiones.length;

  const sumaAciertos = sesiones.reduce((acc, s) => acc + (s.aciertosPct || 0), 0);
  const sumaDuracion = sesiones.reduce((acc, s) => acc + (s.duracion || 0), 0);

  return {
    totalSesiones,
    promedioAciertos: Math.round(sumaAciertos / totalSesiones),
    promedioDuracion: Math.round(sumaDuracion / totalSesiones),
  };
};
