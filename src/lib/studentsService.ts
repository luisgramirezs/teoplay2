// src/lib/studentsService.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { PerfilCompleto, PerfilNeuroeducativo } from '@/components/OnboardingWizard';

// ── Guardar alumno nuevo (desde Onboarding) ───────────────────────────────────

export async function guardarStudent(perfil: PerfilCompleto, userId: string): Promise<void> {
  const ref = doc(db, 'alumnos', perfil.id);

  await setDoc(ref, {
    id: perfil.id,
    userId,

    // Datos básicos del niño
    nombre: perfil.nombre,
    edad: perfil.edad,
    grado: perfil.grado,
    condicion: perfil.condicion,

    // Perfil neuroeducativo activo (siempre el más reciente)
    perfilNeuroeducativo: perfil.perfilNeuroeducativo ?? null,

    // Respuestas del onboarding (contexto cualitativo)
    respuestas: perfil.respuestas,

    createdAt: perfil.fechaCreacion,
    updatedAt: serverTimestamp(),
  });

  // Si tiene perfil neuroeducativo, guardar también en el histórico
  if (perfil.perfilNeuroeducativo) {
    await guardarHistoricoPerfil(perfil.id, perfil.perfilNeuroeducativo, 1, 'onboarding');
  }
}

// ── Obtener todos los alumnos de un usuario ───────────────────────────────────

export async function getStudentsByUser(userId: string): Promise<PerfilCompleto[]> {
  const q = query(collection(db, 'alumnos'), where('userId', '==', userId));
  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data();
    // Usar d.id (ID del documento Firestore) como fuente de verdad
    // data.id puede ser undefined si el alumno fue creado antes de esta versión
    const id = data.id ?? d.id;
    return {
      id,
      nombre: data.nombre,
      edad: data.edad,
      grado: data.grado,
      condicion: data.condicion,
      tipoUsuario: data.tipoUsuario ?? 'padre',
      respuestas: data.respuestas,
      perfilNeuroeducativo: data.perfilNeuroeducativo,
      fechaCreacion: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    } as PerfilCompleto;
  });
}

// ── Actualizar perfil neuroeducativo (guarda histórico automáticamente) ────────

export async function actualizarPerfilNeuroeducativo(
  studentId: string,
  nuevoPerfil: PerfilNeuroeducativo,
  version: number
): Promise<void> {
  // 1. Actualizar perfil activo
  await updateDoc(doc(db, 'alumnos', studentId), {
    perfilNeuroeducativo: nuevoPerfil,
    updatedAt: serverTimestamp(),
  });

  // 2. Guardar en histórico
  await guardarHistoricoPerfil(studentId, nuevoPerfil, version, 'actualización');
}

// ── Guardar en student_profiles_history ───────────────────────────────────────

async function guardarHistoricoPerfil(
  studentId: string,
  perfil: PerfilNeuroeducativo,
  version: number,
  fuente: 'onboarding' | 'actualización' | 'informe'
): Promise<void> {
  const histId = `${studentId}_v${version}_${Date.now()}`;
  await setDoc(doc(db, 'student_profiles_history', histId), {
    id: histId,
    studentId,
    perfil,
    version,
    fuente,
    createdAt: serverTimestamp(),
  });
}
