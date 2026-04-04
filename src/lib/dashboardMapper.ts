import { SessionData } from '@/types';

export const mapSessionToDashboard = (data: SessionData) => {
  const duracion =
    data.tiempoFin && data.tiempoInicio
      ? Math.round((data.tiempoFin - data.tiempoInicio) / 60000)
      : 0;

  return {
    id: crypto.randomUUID(),
    childId: data.perfil.id,
    fecha: Date.now(),

    duracion,
    aciertosPct: data.porcentajeAciertos ?? 0,
    simplificaciones: data.simplificaciones ?? 0,
    deltaEmocional: data.deltaEmocional ?? 0,
    nivelLogro: data.nivelLogro || 'inicio',

    emocionInicio: data.emocionInicio.valor,
    emocionFin: data.emocionFin.valor,

    // Campos del perfil del niño
    edad: data.perfil?.edad ?? 0,
    grado: data.perfil?.grado ?? '',
    asignatura: data.perfil?.asignatura ?? '',
    condicion: data.perfil?.condicion ?? '',
    interes: data.perfil?.interes ?? '',   // interés que eligió el niño
    tema: data.perfil?.tema ?? '',         // tema de la lección

    juegos: data.juegos.map(j => ({
      tipo: j.tipo,
      aciertos: j.aciertos,
      errores: j.errores,
      intentos: j.intentos,
    })),
  };
};
