import { PERFILES_STORAGE_KEY, PERFIL_ACTIVO_KEY } from '@/types';

const SESSIONS_KEY = 'dashboard_sessions';

// ── Sesiones ──────────────────────────────────────────────────────────────────

export const saveDashboardSession = (session: any): void => {
  try {
    const existing = localStorage.getItem(SESSIONS_KEY);
    const sessions: any[] = existing ? JSON.parse(existing) : [];
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
};

export const getDashboardSessions = (): any[] => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error leyendo sesiones:', error);
    return [];
  }
};

export const getSessionsByChildId = (childId: string): any[] => {
  return getDashboardSessions().filter((s: any) => s.childId === childId);
};

// ── Perfiles ──────────────────────────────────────────────────────────────────

/**
 * Lee todos los perfiles guardados en localStorage.
 * Index.tsx guarda el array completo bajo PERFILES_STORAGE_KEY
 * y el ID activo bajo PERFIL_ACTIVO_KEY.
 */
export const getAllProfiles = (): any[] => {
  try {
    const raw = localStorage.getItem(PERFILES_STORAGE_KEY);
    const profiles: any[] = raw ? JSON.parse(raw) : [];

    // Garantizar que cada perfil tenga un id válido
    return profiles.map((p, i) => ({
      ...p,
      id: p.id ?? `perfil_${i}`,
    }));
  } catch (error) {
    console.error('Error leyendo perfiles:', error);
    return [];
  }
};

export const getActiveProfileId = (): string | null => {
  return localStorage.getItem(PERFIL_ACTIVO_KEY);
};
