// src/lib/studentLinksService.ts
import { doc, getDoc, setDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const MAX_INTENTOS = 3;

// ── Generación de código de invitación (formato TEO-XXXX-YYYY) ────────────────

function generarSegmentoHex(): string {
  return Math.floor(Math.random() * 0x10000)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
}

function generarCodigo(): string {
  return `TEO-${generarSegmentoHex()}-${generarSegmentoHex()}`;
}

// ── Crear invitación para un especialista (docente/terapeuta) ─────────────────

export async function crearInvitacion(
  studentId: string,
  userId: string,
  role: 'docente' | 'terapeuta'
): Promise<string> {
  let codigo: string | null = null;

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    const candidato = generarCodigo();
    const snap = await getDoc(doc(db, 'studentLinks', candidato));

    if (!snap.exists()) {
      codigo = candidato;
      break;
    }
  }

  if (!codigo) {
    throw new Error('No se pudo generar un código de invitación único. Intenta de nuevo.');
  }

  await setDoc(doc(db, 'studentLinks', codigo), {
    studentId,
    role,
    status: 'invitado',
    canEdit: false,
    canInvite: false,
    invitedBy: userId,
    createdAt: serverTimestamp(),
  });

  return codigo;
}

// ── Canjear invitación (el especialista ingresa el código) ────────────────────

export async function canjearInvitacion(codigo: string, userId: string): Promise<void> {
  const invitacionRef = doc(db, 'studentLinks', codigo);
  const snap = await getDoc(invitacionRef);

  if (!snap.exists()) {
    throw new Error('Código de invitación no válido');
  }

  const data = snap.data();

  if (data.status !== 'invitado' || 'userId' in data) {
    throw new Error('Este código ya fue usado o ya no es válido');
  }

  const linkActivoRef = doc(db, 'studentLinks', `${data.studentId}_${userId}`);
  const batch = writeBatch(db);

  batch.set(linkActivoRef, {
    studentId: data.studentId,
    userId,
    role: data.role,
    status: 'activo',
    canEdit: data.canEdit,
    canInvite: data.canInvite,
    invitedBy: data.invitedBy,
    sourceInvitationId: codigo,
    createdAt: serverTimestamp(),
  });

  batch.update(invitacionRef, {
    status: 'consumido',
    claimedBy: userId,
    claimedAt: serverTimestamp(),
  });

  await batch.commit();
}
