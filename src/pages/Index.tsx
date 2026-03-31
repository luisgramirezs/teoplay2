import React, { useState } from 'react';
import { PerfilNino, SesionGenerada, SessionData, AppScreen } from '@/types';
import ConfigScreen from '@/pages/ConfigScreen';
import ChildSession from '@/pages/ChildSession';
import ReportScreen from '@/pages/ReportScreen';

const Index: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('config');
  const [perfil, setPerfil] = useState<PerfilNino | null>(null);
  const [sesion, setSesion] = useState<SesionGenerada | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

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
          {screen === 'config' && (
              <ConfigScreen onGenerate={handleGenerate} />
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
