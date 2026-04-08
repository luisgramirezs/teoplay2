// src/lib/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { TipoUsuario } from '@/components/OnboardingWizard';

export async function registrarUsuario(
  email: string,
  password: string,
  nombre: string,
  role: TipoUsuario
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;
  await setDoc(doc(db, 'usuarios', uid), {
    id: uid, email, nombre, role,
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginUsuario(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUsuario(): Promise<void> {
  await signOut(auth);
}

export async function getUsuarioData(uid: string) {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getRolUsuario(uid: string): Promise<TipoUsuario> {
  const data = await getUsuarioData(uid);
  return (data?.role as TipoUsuario) ?? 'padre';
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
