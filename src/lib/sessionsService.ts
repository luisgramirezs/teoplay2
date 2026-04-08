// src/lib/sessionsService.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Guardar sesión finalizada ─────────────────────────────────────────────────

export async function guardarSession(
  session: any,
  studentId: string,
  userId: string
): Promise<void> {
  // Diagnóstico — confirmar que studentId llega con valor
  if (!studentId) {
    console.error('⚠️ guardarSession: studentId está vacío. La sesión no podrá vincularse al alumno.');
  }
  console.log('💾 Guardando sesión | studentId:', studentId, '| userId:', userId);

  const ref = doc(db, 'sessions', session.id);

  await setDoc(ref, {
    id:        session.id,
    studentId: studentId || session.studentId, // fallback al campo del mapper
    userId,

    // Campos planos — espejamos exactamente lo que produce dashboardMapper
    fecha:            session.fecha           ?? Date.now(),
    asignatura:       session.asignatura       ?? null,
    tema:             session.tema             ?? null,
    aciertosPct:      session.aciertosPct      ?? 0,
    duracion:         session.duracion         ?? 0,
    emocionInicio:    session.emocionInicio    ?? null,
    emocionFin:       session.emocionFin       ?? null,
    deltaEmocional:   session.deltaEmocional   ?? 0,
    simplificaciones: session.simplificaciones ?? 0,
    nivelLogro:       session.nivelLogro        ?? 'inicio',
    condicion:        session.condicion         ?? null,
    grado:            session.grado             ?? null,
    edad:             session.edad              ?? null,
    interes:          session.interes           ?? null,
    juegos:           session.juegos            ?? [],

    completada: true,
    createdAt:  serverTimestamp(),
  });
}

// ── Obtener sesiones de un alumno ─────────────────────────────────────────────
// Sin orderBy: evita requerir índice compuesto en Firestore.
// El ordenamiento lo hace getDashboardMetrics en el cliente.

export async function getSessionsByStudent(studentId: string, userId: string): Promise<any[]> {
  const q = query(
    collection(db, 'sessions'),
    where('studentId', '==', studentId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ── Obtener todas las sesiones de un usuario (dashboard global) ───────────────

export async function getSessionsByUser(userId: string): Promise<any[]> {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
