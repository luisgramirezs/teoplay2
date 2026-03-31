import React, { useState, useEffect } from 'react';
import { Sparkles, User, BookOpen, ChevronDown, Pencil, X, CheckCircle } from 'lucide-react';
import {
  PerfilNino, PerfilPersistente, Condicion, Asignatura, Idioma,
  CONDICIONES, ASIGNATURAS, GRADOS, PERFIL_STORAGE_KEY,
} from '@/types';

interface ConfigScreenProps {
  onGenerate: (perfil: PerfilNino) => void;
}

const DEFAULT_PERFIL: PerfilPersistente = {
  nombre: '',
  edad: 8,
  grado: '2° Básico',
  condicion: 'general',
};

function loadPerfil(): PerfilPersistente | null {
  try {
    const raw = localStorage.getItem(PERFIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePerfil(p: PerfilPersistente) {
  localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(p));
}

// ── Sub-form: profile fields ─────────────────────────────────────────────────
const ProfileForm: React.FC<{
  value: PerfilPersistente;
  onChange: (p: PerfilPersistente) => void;
  compact?: boolean;
}> = ({ value, onChange, compact }) => {
  const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';

  return (
    <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'md:grid-cols-2 gap-5'}`}>
      {/* Name */}
      <div>
        <label className={labelClass}>Nombre del niño <span className="text-muted-foreground font-normal">(opcional)</span></label>
        <input
          type="text"
          className={inputClass}
          placeholder="Ej: Sofía, Mateo…"
          value={value.nombre}
          onChange={e => onChange({ ...value, nombre: e.target.value })}
        />
      </div>

      {/* Age */}
      <div>
        <label className={labelClass}>Edad: <span className="text-primary font-black">{value.edad} años</span></label>
        <input
          type="range" min={5} max={15} value={value.edad}
          onChange={e => onChange({ ...value, edad: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary mt-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>5</span><span>10</span><span>15</span>
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className={labelClass}>Grado escolar</label>
        <div className="relative">
          <select
            className={`${inputClass} appearance-none pr-10`}
            value={value.grado}
            onChange={e => onChange({ ...value, grado: e.target.value })}
          >
            {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Condition */}
      <div className={compact ? '' : 'md:col-span-2'}>
        <label className={labelClass}>Condición principal</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(CONDICIONES) as [Condicion, typeof CONDICIONES[Condicion]][]).map(([key, val]) => (
            <button
              key={key} type="button"
              onClick={() => onChange({ ...value, condicion: key })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                value.condicion === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-white hover:border-primary/40'
              }`}
            >
              <div className={`font-bold text-sm ${value.condicion === key ? 'text-primary' : 'text-foreground'}`}>
                {val.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{val.descripcion}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal: React.FC<{
  perfil: PerfilPersistente;
  onSave: (p: PerfilPersistente) => void;
  onClose: () => void;
}> = ({ perfil, onSave, onClose }) => {
  const [draft, setDraft] = useState(perfil);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-black text-foreground text-lg">Editar perfil del niño</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6">
          <ProfileForm value={draft} onChange={setDraft} />
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => { savePerfil(draft); onSave(draft); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-black transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Guardar perfil
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ConfigScreen ────────────────────────────────────────────────────────
const ConfigScreen: React.FC<ConfigScreenProps> = ({ onGenerate }) => {
  const [perfil, setPerfil] = useState<PerfilPersistente>(() => loadPerfil() ?? DEFAULT_PERFIL);
  const [showFirstTimeForm, setShowFirstTimeForm] = useState(() => !loadPerfil());
  const [showEditModal, setShowEditModal] = useState(false);

  const [asignatura, setAsignatura] = useState<Asignatura>('matematicas');
  const [tema, setTema] = useState('');
  const [idioma, setIdioma] = useState<Idioma>('es');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Save whenever perfil changes
  useEffect(() => {
    if (!showFirstTimeForm) savePerfil(perfil);
  }, [perfil, showFirstTimeForm]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!tema.trim()) errs.tema = 'Por favor ingresa el tema a trabajar.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFirstTimeSave = () => {
    savePerfil(perfil);
    setShowFirstTimeForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onGenerate({
      ...perfil,
      interes: 'dinosaurios', // placeholder, overwritten by child
      asignatura,
      tema,
      idioma,
    });
  };

  const inputClass = 'w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-bold text-foreground/80 mb-2';
  const errorClass = 'text-xs text-destructive mt-1 font-semibold';

  // ── FIRST TIME: show profile form ────────────────────────────────────────
  if (showFirstTimeForm) {
    return (
      <div className="min-h-screen bg-background font-child">
        {/* Header */}
        <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">


          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight">TEOplay</h1>
              <p className="text-xs text-muted-foreground font-semibold">Aprendizaje inclusivo personalizado</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-primary/8 to-accent/8 border-b border-border">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-6 h-6 text-primary" />
                <h2 className="font-black text-foreground text-xl">Perfil del niño</h2>
              </div>
              <p className="text-muted-foreground text-sm font-semibold">
                Este perfil se guardará para futuras lecciones. Podrás editarlo cuando quieras.
              </p>
            </div>
            <div className="p-6">
              <ProfileForm value={perfil} onChange={setPerfil} />
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={handleFirstTimeSave}
                className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                Guardar perfil y continuar →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── MAIN: lesson config with profile summary ──────────────────────────────
  return (
    <div className="min-h-screen bg-background font-child">
          {/* Hero / Landing Header */}
          <section className="bg-white border-b border-border">
              <div className="max-w-4xl mx-auto px-4 pt-4 pb-3">

                  <div className="flex flex-col items-start">

                      {/* Logo */}
                      <img
                          src="/logo.png"
                          alt="TEOplay"
                          className="h-[180px] sm:h-[180px] md:h-[180px] object-contain block"
                      />

                      {/* Texto */}
                      
                      <h1 className="font-[Fredoka] text-3xl text-orange-600 font-black">
                          Aprendizaje inclusivo personalizado
                      </h1>

                  </div>

              </div>
          </section>





      {/* Info banner */}
      <div className="bg-primary/5 border-b border-primary/10 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3 text-sm text-primary/80">
                  <span className="text-lg">💡</span>
                  <span className="font-[Fredoka]">
            El niño elegirá su interés motivacional al comenzar la sesión. La IA adaptará todo el contenido automáticamente.
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Summary Card */}
          <section className="bg-white rounded-2xl border-2 border-primary/20 shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">



              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <p className="font-black text-foreground text-base">
                    {perfil.nombre || 'Sin nombre'} · {perfil.edad} años
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    {perfil.grado} · {CONDICIONES[perfil.condicion].label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-sm font-black text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Editar perfil
              </button>
            </div>
          </section>

          {/* Section: Learning Module */}
          <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-accent/8 to-primary/5 border-b border-border flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-accent" />
              <h2 className="font-black text-foreground text-base">Nueva lección</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Subject */}
              <div>
                <label className={labelClass}>Asignatura</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ASIGNATURAS) as [Asignatura, typeof ASIGNATURAS[Asignatura]][]).map(([key, val]) => (
                    <button
                      key={key} type="button"
                      onClick={() => setAsignatura(key)}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 text-left transition-all text-sm ${
                        asignatura === key
                          ? 'border-accent bg-accent/10 text-accent font-black'
                          : 'border-border bg-white text-muted-foreground hover:border-accent/40 font-bold'
                      }`}
                    >
                      <span>{val.emoji}</span> {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="flex flex-col">
                <label className={labelClass}>Tema específico *</label>
                <textarea
                  className={`${inputClass} resize-none flex-1 min-h-[120px]`}
                  placeholder="Ej: Las fracciones simples&#10;El presente perfecto en inglés&#10;El ciclo del agua"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  rows={4}
                />
                {errors.tema && <p className={errorClass}>{errors.tema}</p>}
              </div>

              {/* Language */}
              <div className="md:col-span-2">
                <label className={labelClass}>Idioma de la sesión</label>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {(['es', 'en'] as Idioma[]).map(l => (
                    <button
                      key={l} type="button"
                      onClick={() => setIdioma(l)}
                      className={`py-3 rounded-xl border-2 font-black text-sm transition-all ${
                        idioma === l
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-white text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {l === 'es' ? '🇨🇱 Español' : '🇺🇸 English'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Child's role callout */}
          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-teo-yellow/10 to-teo-orange/10 rounded-2xl border border-teo-yellow/30">
            <span className="text-3xl">🧒</span>
            <div>
              <p className="font-black text-foreground text-sm">El niño participa desde el inicio</p>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed font-semibold">
                Al comenzar, el niño <strong>expresará cómo se siente</strong> y luego <strong>elegirá su interés favorito</strong>.
                La IA usará ese interés para personalizar toda la experiencia.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pb-6">
            <button
              type="submit"
              className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 min-h-[56px] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-sparkle" />
              ✨ Iniciar sesión de aprendizaje
            </button>
          </div>
        </form>
      </main>

      {/* Edit modal */}
      {showEditModal && (
        <EditProfileModal
          perfil={perfil}
          onSave={setPerfil}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ConfigScreen;
