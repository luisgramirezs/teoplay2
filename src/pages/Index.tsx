import React, { useState } from 'react';
import { PerfilNino, SesionGenerada, SessionData, AppScreen } from '@/types';
import { PERFILES_STORAGE_KEY, PERFIL_ACTIVO_KEY } from '@/types';
import ConfigScreen from '@/pages/ConfigScreen';
import ChildSession from '@/pages/ChildSession';
import ReportScreen from '@/pages/ReportScreen';
import OnboardingWizard from '@/components/OnboardingWizard';
import { PerfilCompleto } from '@/components/OnboardingWizard';

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
    const [perfiles] = useState<PerfilCompleto[]>(() => cargarPerfiles());
    const [screen, setScreen] = useState<AppScreen | 'onboarding'>(() =>
        cargarPerfiles().length === 0 ? 'onboarding' : 'config'
    );
    const [perfil, setPerfil] = useState<PerfilNino | null>(null);
    const [sesion, setSesion] = useState<SesionGenerada | null>(null);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

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