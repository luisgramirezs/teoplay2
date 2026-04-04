const STORAGE_KEY = 'dashboard_sessions';

export const saveDashboardSession = (session: any) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    const sessions = existing ? JSON.parse(existing) : [];

    sessions.push(session);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error guardando sesión', error);
  }
};
export const getDashboardSessions = () => {
  try {
    const data = localStorage.getItem('dashboard_sessions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error leyendo sesiones', error);
    return [];
  }
};

