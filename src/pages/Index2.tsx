import React, { useState, useEffect } from 'react';
import { PerfilNino, SesionGenerada, SessionData, AppScreen } from '@/types';
import { PERFILES_STORAGE_KEY, PERFIL_ACTIVO_KEY } from '@/types';
import ConfigScreen from '@/pages/ConfigScreen';
import ChildSession from '@/pages/ChildSession';
import ReportScreen from '@/pages/ReportScreen';
import OnboardingWizard from '@/components/OnboardingWizard';
import { PerfilCompleto } from '@/components/OnboardingWizard';
import { mapSessionToDashboard } from '@/lib/dashboardMapper';
import { saveDashboardSession } from '@/lib/dashboardStorage';
import { getDashboardSessions } from '@/lib/dashboardStorage';
import { getDashboardMetrics } from '@/lib/dashboardMetrics';

// ── Splash Screen ─────────────────────────────────────────────────────────────

const SplashScreen: React.FC = () => (
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
            .splash-logo {
                animation: splashLogoDrop 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
            }
            .splash-tagline {
                animation: splashTaglineIn 0.45s ease-out 1.1s both;
            }
        `}</style>

        <div className="splash-logo flex flex-col items-center">
            <img
                src="/logo.png"
                alt="TEOplay"
                className="h-48 object-contain"
            />
        </div>

        <p className="splash-tagline font-[Fredoka] text-lg text-orange-500 font-semibold tracking-wide mt-2">
            Tecnología de asistencia educativa
        </p>
    </div>
);


function cargarPerfiles(): PerfilCompleto[] {
    try {
        const raw = localStorage.getItem(PERFILES_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function guardarPerfiles(perfiles: PerfilCompleto[]) {
    localStorage.setItem(PERFILES_STORAGE_KEY, JSON.stringify(perfiles));
}

const Index: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [perfiles] = useState<PerfilCompleto[]>(() => cargarPerfiles());
    const [screen, setScreen] = useState<AppScreen | 'onboarding'>(() =>
        cargarPerfiles().length === 0 ? 'onboarding' : 'config'
    );
    const [perfil, setPerfil] = useState<PerfilNino | null>(null);
    const [sesion, setSesion] = useState<SesionGenerada | null>(null);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    // Ocultar splash tras 3 s (0.4 s de margen sobre el fade-out de 2.6 s)
    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(t);
    }, []);
    



    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

    const handleOnboardingComplete = (perfilCompleto: PerfilCompleto) => {
        const existentes = cargarPerfiles();
        const nuevos = [...existentes, perfilCompleto];
        guardarPerfiles(nuevos);
        localStorage.setItem(PERFIL_ACTIVO_KEY, perfilCompleto.id);
        setScreen('config');
    };

    const handleGenerate = (p: PerfilNino) => {
        setPerfil(p);
        setScreen('session');
    };

    const handleSessionComplete = (data: SessionData) => {
        const mapped = mapSessionToDashboard(data);
        console.log('SESSION MAPEADA ', mapped);
        saveDashboardSession(mapped);
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

    return (
        <>
            {showSplash && <SplashScreen />}
            {screen === 'onboarding' && (
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                    apiKey={import.meta.env.VITE_OPENAI_API_KEY || ''}
                />
            )}
            {screen === 'config' && (
                <ConfigScreen
                    onGenerate={handleGenerate}
                    onAgregarNino={() => setScreen('onboarding')}
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