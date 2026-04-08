// src/pages/Index.tsx
import React, { useState, useEffect } from 'react';
import { PerfilNino, SesionGenerada, SessionData, AppScreen } from '@/types';
import { PERFIL_ACTIVO_KEY } from '@/types';
import ConfigScreen from '@/pages/ConfigScreen';
import ChildSession from '@/pages/ChildSession';
import ReportScreen from '@/pages/ReportScreen';
import LoginScreen from '@/pages/LoginScreen';
import OnboardingWizard from '@/components/OnboardingWizard';
import { PerfilCompleto } from '@/components/OnboardingWizard';
import { mapSessionToDashboard } from '@/lib/dashboardMapper';
import { getDashboardMetrics } from '@/lib/dashboardMetrics';
import { onAuthChange, logoutUsuario, getRolUsuario } from '@/lib/authService';
import { TipoUsuario } from '@/components/OnboardingWizard';
import { guardarStudent, getStudentsByUser } from '@/lib/studentsService';
import { guardarSession } from '@/lib/sessionsService';
import { User } from 'firebase/auth';

// ── Splash Screen ─────────────────────────────────────────────────────────────

function playBootSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.2);
        master.connect(ctx.destination);
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 1.0);
        osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.8);
        gain1.gain.setValueAtTime(1, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.2);
        osc1.connect(gain1);
        gain1.connect(master);
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(360, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 1.0);
        osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.8);
        gain2.gain.setValueAtTime(0.35, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
        osc2.connect(gain2);
        gain2.connect(master);
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(2200, ctx.currentTime + 0.9);
        osc3.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 2.0);
        gain3.gain.setValueAtTime(0, ctx.currentTime);
        gain3.gain.setValueAtTime(0, ctx.currentTime + 0.9);
        gain3.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.1);
        gain3.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.1);
        osc3.connect(gain3);
        gain3.connect(master);
        osc1.start(ctx.currentTime); osc2.start(ctx.currentTime); osc3.start(ctx.currentTime + 0.9);
        osc1.stop(ctx.currentTime + 2.3); osc2.stop(ctx.currentTime + 2.1); osc3.stop(ctx.currentTime + 2.2);
    } catch { /* silencio si el navegador bloquea el audio */ }
}

const SplashScreen: React.FC = () => {
    useEffect(() => { playBootSound(); }, []);
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
            style={{ animation: 'splashFadeOut 0.5s ease-in-out 2.6s forwards' }}
        >
            <style>{`
                @keyframes splashLogoDrop {
                    0%   { opacity: 0; transform: translateY(-120px) scale(0.9); }
                    55%  { opacity: 1; transform: translateY(18px) scale(1.04); }
                    72%  { transform: translateY(-10px) scale(0.98); }
                    85%  { transform: translateY(6px) scale(1.01); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes splashTaglineIn {
                    0%   { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes splashFadeOut {
                    0%   { opacity: 1; }
                    100% { opacity: 0; pointer-events: none; }
                }
                .splash-logo     { animation: splashLogoDrop 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
                .splash-tagline  { animation: splashTaglineIn 0.45s ease-out 1.1s both; }
            `}</style>
            <div className="splash-logo flex flex-col items-center">
                <img src="/logo.png" alt="TEOplay" className="h-48 object-contain" />
            </div>
            <p className="splash-tagline font-[Fredoka] text-lg text-orange-500 font-semibold tracking-wide mt-2">
                Tecnología de asistencia educativa
            </p>
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────

const Index: React.FC = () => {
    const [showSplash, setShowSplash]     = useState(true);
    const [authUser, setAuthUser]         = useState<User | null | undefined>(undefined);
    const [rolUsuario, setRolUsuario]       = useState<TipoUsuario>('padre'); // undefined = cargando
    const [perfiles, setPerfiles]         = useState<PerfilCompleto[]>([]);
    const [screen, setScreen]             = useState<AppScreen | 'onboarding'>('config');
    const [perfil, setPerfil]             = useState<PerfilNino | null>(null);
    const [sesion, setSesion]             = useState<SesionGenerada | null>(null);
    const [sessionData, setSessionData]   = useState<SessionData | null>(null);

    // Ocultar splash tras 3 s
    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(t);
    }, []);

    // Observer de autenticación Firebase
    useEffect(() => {
        const unsub = onAuthChange(user => {
            setAuthUser(user);
        });
        return () => unsub();
    }, []);

    // Cargar perfiles desde Firestore cuando el usuario se autentica
    useEffect(() => {
        if (!authUser) return;
        getRolUsuario(authUser.uid).then(rol => setRolUsuario(rol));
        getStudentsByUser(authUser.uid).then(students => {
            setPerfiles(students);
            setScreen(students.length === 0 ? 'onboarding' : 'config');
        });
    }, [authUser]);

    const handleOnboardingComplete = async (perfilCompleto: PerfilCompleto) => {
        if (!authUser) return;
        await guardarStudent(perfilCompleto, authUser.uid);
        localStorage.setItem(PERFIL_ACTIVO_KEY, perfilCompleto.id);
        setPerfiles(prev => [...prev, perfilCompleto]);
        setScreen('config');
    };

    const handleGenerate = (p: PerfilNino) => {
        setPerfil(p);
        setScreen('session');
    };

    const handleSessionComplete = async (data: SessionData) => {
        if (!authUser || !perfil) return;
        const mapped = mapSessionToDashboard(data);
        // Guardar en Firestore (reemplaza saveDashboardSession de localStorage)
        await guardarSession(mapped, perfil.id, authUser.uid);
        setSessionData(data);
        setScreen('report');
    };

    const handleReset = () => {
        setSesion(null);
        setSessionData(null);
        setPerfil(null);
        setScreen('config');
    };

    const handleBack = () => {
        if (screen === 'session') setScreen('config');
        if (screen === 'report') setScreen('session');
    };

    // ── Estados de carga y auth ───────────────────────────────────────────────

    // Mientras Firebase verifica la sesión guardada
    if (authUser === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <img src="/logo.png" alt="TEOplay" className="h-16 object-contain opacity-60" />
                    <p className="text-sm text-muted-foreground font-semibold animate-pulse">Cargando…</p>
                </div>
            </div>
        );
    }

    // Usuario no autenticado → pantalla de login
    if (!authUser) {
        return <LoginScreen onAuthSuccess={() => { /* onAuthChange lo detecta automáticamente */ }} />;
    }

    // ── App principal ─────────────────────────────────────────────────────────

    return (
        <>
            {showSplash && <SplashScreen />}

            {/* Botón de logout discreto — puedes moverlo a un header si prefieres */}
            <button
                onClick={logoutUsuario}
                className="fixed top-3 right-3 z-40 text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-sm"
            >
                Cerrar sesión
            </button>

            {screen === 'onboarding' && (
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                    apiKey={import.meta.env.VITE_OPENAI_API_KEY || ''}
                    tipoUsuarioAuth={rolUsuario}
                />
            )}
            {screen === 'config' && (
                <ConfigScreen
                    onGenerate={handleGenerate}
                    onAgregarNino={() => setScreen('onboarding')}
                    perfiles={perfiles}
                    onPerfilesChange={setPerfiles}
                    userId={authUser.uid}
                />
            )}
            {screen === 'session' && perfil && (
                <ChildSession perfil={perfil} onComplete={handleSessionComplete} onBack={handleBack} />
            )}
            {screen === 'report' && sessionData && (
                <ReportScreen data={sessionData} onReset={handleReset} onBack={handleBack} />
            )}
        </>
    );
};

export default Index;
