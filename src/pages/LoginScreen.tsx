// src/pages/LoginScreen.tsx
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ChevronRight } from 'lucide-react';
import { registrarUsuario, loginUsuario } from '@/lib/authService';
import { TipoUsuario } from '@/components/OnboardingWizard';

interface LoginScreenProps {
  onAuthSuccess: () => void;
}

const ROLES: { id: TipoUsuario; label: string; emoji: string }[] = [
  { id: 'padre',     label: 'Padre / Madre', emoji: '👨‍👩‍👧' },
  { id: 'docente',   label: 'Docente',       emoji: '👩‍🏫' },
  { id: 'terapeuta', label: 'Terapeuta',     emoji: '🧑‍⚕️' },
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess }) => {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre]     = useState('');
  const [role, setRole]         = useState<TipoUsuario>('padre');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-bold text-foreground/80 mb-1';

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) { setError('Completa email y contraseña'); return; }
    if (modo === 'registro' && !nombre) { setError('Escribe tu nombre'); return; }

    setLoading(true);
    try {
      if (modo === 'registro') {
        await registrarUsuario(email, password, nombre, role);
      } else {
        await loginUsuario(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'Este correo ya está registrado.',
        'auth/invalid-email':        'Correo inválido.',
        'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
        'auth/user-not-found':       'No existe una cuenta con ese correo.',
        'auth/wrong-password':       'Contraseña incorrecta.',
        'auth/invalid-credential':   'Correo o contraseña incorrectos.',
      };
      setError(msg[err.code] ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="TEOplay" className="h-[180px] object-contain mb-2" />
         
          <p className="font-[Fredoka] text-lg text-orange-500 font-semibold tracking-wide">
            Tecnología de asistencia educativa
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">

          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            {(['login', 'registro'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setModo(m); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-black transition-all cursor-pointer ${
                  modo === m ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Nombre (solo registro) */}
          {modo === 'registro' && (
            <div>
              <label className={labelClass}>Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Rol (solo registro) */}
          {modo === 'registro' && (
            <div>
              <label className={labelClass}>Soy…</label>
              <div className="flex gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                      role === r.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive font-bold text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-md"
          >
            {loading ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <>
                {modo === 'login' ? 'Entrar' : 'Crear cuenta'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
