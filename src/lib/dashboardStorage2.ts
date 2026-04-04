// Claves de localStorage — deben coincidir con las usadas en el onboarding
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
 * El onboarding guarda cada perfil bajo la clave teoplay_perfil_data_{id}
 * y el ID activo bajo teoplay_perfil_id.
 */
export const getAllProfiles = (): any[] => {
  try {
    const raw = localStorage.getItem(PERFILES_STORAGE_KEY); // ← misma clave que Index
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo perfiles:', error);
    return [];
  }
};

export const getActiveProfileId = (): string | null => {
  return localStorage.getItem(PERFIL_ACTIVO_KEY); // ← misma clave que Index
};

    // Fallback: perfil guardado con clave antigua
    if (profiles.length === 0) {
      const legacy = localStorage.getItem('teoplay_perfil');
      if (legacy) {
        try { profiles.push(JSON.parse(legacy)); } catch {}
      }
    }

    return profiles;
  } catch (error) {
    console.error('Error leyendo perfiles:', error);
    return [];
  }
};

export const getActiveProfileId = (): string | null => {
  return localStorage.getItem('teoplay_perfil_id');
};
