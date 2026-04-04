import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Target, TrendingUp, TrendingDown,
  Minus, Users, BookOpen, Zap, Calendar, BarChart2,
  ChevronDown, X, PlayCircle
} from 'lucide-react';
import { getDashboardMetrics } from '@/lib/dashboardMetrics';
import { getAllProfiles, getSessionsByChildId, getActiveProfileId } from '@/lib/dashboardStorage';
import { ASIGNATURAS, EMOCIONES, CONDICIONES, INTERESES } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de fechas
// ─────────────────────────────────────────────────────────────────────────────

type FiltroFecha = 'hoy' | 'semana' | 'mes' | 'personalizado';

function startOfDay(d: Date) {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}

function getRangoFiltro(filtro: FiltroFecha, fechaInicio: string, fechaFin: string): { desde: number; hasta: number } {
  const ahora = new Date();
  if (filtro === 'hoy') {
    return { desde: startOfDay(ahora).getTime(), hasta: Date.now() };
  }
  if (filtro === 'semana') {
    const lunes = new Date(ahora);
    lunes.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7));
    return { desde: startOfDay(lunes).getTime(), hasta: Date.now() };
  }
  if (filtro === 'mes') {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    return { desde: inicio.getTime(), hasta: Date.now() };
  }
  // personalizado
  const desde = fechaInicio ? new Date(fechaInicio).getTime() : 0;
  const hasta = fechaFin ? new Date(fechaFin + 'T23:59:59').getTime() : Date.now();
  return { desde, hasta };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes UI
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  title, value, subtitle, icon, colorClass = 'text-primary', bgClass = 'bg-primary/10'
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; colorClass?: string; bgClass?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bgClass} ${colorClass} mb-3`}>
        {icon}
      </div>
      <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
      <p className="text-xs font-bold text-foreground mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-black text-foreground uppercase tracking-wide mb-3">{children}</h3>;
}

function EmptyState({ nombre }: { nombre: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">📚</div>
      <p className="font-black text-foreground text-lg mb-1">
        {nombre} aún no tiene sesiones
      </p>
      <p className="text-sm text-muted-foreground font-medium max-w-xs">
        Cuando complete su primera lección, aquí verás su progreso, estado emocional y más.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gráfico de evolución simple (barras SVG inline)
// ─────────────────────────────────────────────────────────────────────────────

function EvolucionChart({ datos }: { datos: { pct: number; tema: string; fecha: number }[] }) {
  if (datos.length === 0) return null;
  const max = 100;

  return (
    <div>
      <SectionTitle>Evolución de aciertos</SectionTitle>
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
        <svg viewBox={`0 0 ${Math.max(datos.length * 40, 200)} 100`} className="w-full h-32">
          {datos.map((d, i) => {
            const h = (d.pct / max) * 80;
            const x = i * 40 + 10;
            const y = 90 - h;
            const color = d.pct >= 80 ? '#22c55e' : d.pct >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <g key={i}>
                <rect x={x} y={y} width={24} height={h} rx={4} fill={color} opacity={0.85} />
                <text x={x + 12} y={98} textAnchor="middle" fontSize={8} fill="#94a3b8">
                  {new Date(d.fecha).getDate()}/{new Date(d.fecha).getMonth() + 1}
                </text>
                <text x={x + 12} y={y - 3} textAnchor="middle" fontSize={9} fontWeight="bold" fill={color}>
                  {d.pct}%
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex items-center gap-4 mt-2 justify-center">
          {[['#22c55e', 'Logrado (≥80%)'], ['#f59e0b', 'En proceso (50-79%)'], ['#ef4444', 'En inicio (<50%)']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              <span className="text-[10px] text-muted-foreground font-medium">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel de detalle de asignatura
// ─────────────────────────────────────────────────────────────────────────────

function DetalleAsignatura({
  asignatura,
  sesiones,
  onCerrar,
}: {
  asignatura: string;
  sesiones: any[];
  onCerrar: () => void;
}) {
  const info = ASIGNATURAS[asignatura as keyof typeof ASIGNATURAS];
  const sesionesFiltradas = [...sesiones]
    .filter(s => s.asignatura === asignatura)
    .sort((a, b) => (b.fecha || 0) - (a.fecha || 0));

  return (
    <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-md p-5 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info?.emoji || '📚'}</span>
          <div>
            <p className="font-black text-foreground">{info?.label || asignatura}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {sesionesFiltradas.length} sesión{sesionesFiltradas.length !== 1 ? 'es' : ''} en el período seleccionado
            </p>
          </div>
        </div>
        <button
          onClick={onCerrar}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {sesionesFiltradas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay sesiones de {info?.label || asignatura} en el período seleccionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="text-left px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Tema</th>
                <th className="text-left px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Interés</th>
                <th className="text-center px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Aciertos</th>
                <th className="text-center px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Emoción</th>
                <th className="text-center px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Duración</th>
                <th className="text-center px-3 py-2.5 text-xs font-black text-muted-foreground uppercase tracking-wide">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {sesionesFiltradas.map((s, i) => {
                const pct = Math.min(100, s.aciertosPct || 0);
                const emoI = EMOCIONES.find(e => e.valor === s.emocionInicio);
                const emoF = EMOCIONES.find(e => e.valor === s.emocionFin);
                const interes = INTERESES?.[s.interes as keyof typeof INTERESES];
                const nivelColor = s.nivelLogro === 'logrado'
                  ? 'bg-green-50 text-green-700'
                  : s.nivelLogro === 'proceso'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700';
                const nivelLabel = s.nivelLogro === 'logrado' ? 'Logrado'
                  : s.nivelLogro === 'proceso' ? 'En proceso' : 'En inicio';

                return (
                  <tr key={s.id || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      {s.fecha
                        ? new Date(s.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-3 py-3 font-semibold text-foreground max-w-[160px] truncate">
                      {s.tema || <span className="text-muted-foreground italic">Sin tema</span>}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground font-medium whitespace-nowrap">
                      {interes ? `${interes.emoji} ${interes.label}` : s.interes || '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${
                        pct >= 80 ? 'bg-green-50 text-green-700' :
                        pct >= 50 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-medium text-base">
                      {emoI?.emoji || '—'} → {emoF?.emoji || '—'}
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground font-medium">
                      {s.duracion || 0} min
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${nivelColor}`}>
                        {nivelLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard principal
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [todasSesiones, setTodasSesiones] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // ── Filtro de fechas ──
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarRango, setMostrarRango] = useState(false);

  // ── Detalle asignatura ──
  const [asignaturaDetalle, setAsignaturaDetalle] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    const profiles = getAllProfiles();
    setPerfiles(profiles);
    const activeId = getActiveProfileId();
    if (activeId && profiles.find(p => p.id === activeId)) {
      setSelectedChildId(activeId);
    } else if (profiles.length > 0) {
      setSelectedChildId(profiles[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setTodasSesiones(getSessionsByChildId(selectedChildId));
    setAsignaturaDetalle(null); // Cerrar detalle al cambiar de niño
  }, [selectedChildId]);

  // Sesiones filtradas por rango de fecha
  const sesionesEnPeriodo = useMemo(() => {
    const { desde, hasta } = getRangoFiltro(filtroFecha, fechaInicio, fechaFin);
    return todasSesiones.filter(s => (s.fecha || 0) >= desde && (s.fecha || 0) <= hasta);
  }, [todasSesiones, filtroFecha, fechaInicio, fechaFin]);

  const nino = useMemo(
    () => perfiles.find(p => p.id === selectedChildId) || null,
    [perfiles, selectedChildId]
  );

  // Métricas sobre el período filtrado
  const metrics = useMemo(() => getDashboardMetrics(sesionesEnPeriodo), [sesionesEnPeriodo]);

  // Para emociones y delta usamos el período filtrado
  const emoIni = EMOCIONES.find(e => e.valor === Math.round(metrics.promedioEmocionalInicio));
  const emoFin = EMOCIONES.find(e => e.valor === Math.round(metrics.promedioEmocionalFin));

  const deltaColor = metrics.deltaEmocionalPromedio > 0
    ? 'text-teo-green' : metrics.deltaEmocionalPromedio < 0
    ? 'text-teo-red' : 'text-muted-foreground';

  const hayDatos = todasSesiones.length > 0;
  const hayDatosEnPeriodo = sesionesEnPeriodo.length > 0;

  const labelFiltro: Record<FiltroFecha, string> = {
    hoy: 'Hoy',
    semana: 'Esta semana',
    mes: 'Este mes',
    personalizado: 'Rango personalizado',
  };

  const handleFiltroRapido = (f: FiltroFecha) => {
    setFiltroFecha(f);
    setMostrarRango(f === 'personalizado');
    setAsignaturaDetalle(null);
  };

  const handleAsignaturaClick = (asignatura: string) => {
    setAsignaturaDetalle(prev => prev === asignatura ? null : asignatura);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex">

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-10">
        <img src="/logo.png" alt="TEOplay" className="h-[180px] object-contain block" />
          
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { label: 'Tablero de seguimiento', icon: <BarChart2 className="w-4 h-4" />, active: true },

          ].map(item => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors text-left cursor-pointer ${
                item.active
                  ? 'bg-blue-50 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Lista de niños en sidebar */}
        {perfiles.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Alumnos
            </p>
            <div className="space-y-1">
              {perfiles.map((p, i) => (
                <button
                  key={p.id ?? `perfil-${i}`}
                  onClick={() => setSelectedChildId(p.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                    selectedChildId === p.id
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    selectedChildId === p.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    {p.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{p.nombre} {p.apellido}</p>
                    <p className={`text-[10px] truncate ${selectedChildId === p.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {p.grado} · {CONDICIONES[p.condicion]?.label || p.condicion}
                    </p>
                  </div>
                </button>

              ))}
            </div>
          </div>
        )}
        {/* Botón Nueva lección */}
        <div className="mt-auto pt-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-black text-sm rounded-2xl hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
          >
            <PlayCircle className="w-4 h-4" />
            Nueva lección
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">

          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              {nino ? (
                <>
                  <h2 className="text-2xl font-black text-foreground">
                    {nino.nombre} {nino.apellido}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium mt-0.5">
                    {nino.edad} años · {nino.grado} · {nino.colegio}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      {CONDICIONES[nino.condicion]?.label || nino.condicion}
                    </span>
                    {hayDatos && (
                      <span className="text-xs text-muted-foreground font-medium">
                        Última sesión: {metrics.ultimaSesion
                          ? new Date(metrics.ultimaSesion.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                          : '—'}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <h2 className="text-2xl font-black text-foreground">Selecciona un alumno</h2>
              )}
            </div>

            {/* Selector móvil */}
            <div className="md:hidden flex flex-col gap-2">
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="w-full border-2 border-border rounded-xl px-3 py-2.5 font-semibold text-sm text-foreground bg-white outline-none focus:border-primary"
              >
                <option value="">Seleccionar alumno…</option>
                {perfiles.map((p, i) => (
                  <option key={p.id ?? `perfil-${i}`} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                Nueva lección
              </button>
            </div>
          </div>

          {/* ── FILTRO DE FECHAS ── */}
          {nino && hayDatos && (
            <div className="mb-6 bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-wide mr-1">
                  Período:
                </span>
                {(['hoy', 'semana', 'mes'] as FiltroFecha[]).map(f => (
                  <button
                    key={f}
                    onClick={() => handleFiltroRapido(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      filtroFecha === f
                        ? 'bg-primary text-white'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {labelFiltro[f]}
                  </button>
                ))}
                <button
                  onClick={() => handleFiltroRapido('personalizado')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    filtroFecha === 'personalizado'
                      ? 'bg-primary text-white'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  Personalizado <ChevronDown className="w-3 h-3" />
                </button>

                {/* Indicador de sesiones en período */}
                <span className="ml-auto text-xs text-muted-foreground font-medium">
                  {sesionesEnPeriodo.length} sesión{sesionesEnPeriodo.length !== 1 ? 'es' : ''} en este período
                </span>
              </div>

              {/* Rango personalizado */}
              {mostrarRango && (
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-muted-foreground">Desde</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={e => setFechaInicio(e.target.value)}
                      className="border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground bg-white outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-muted-foreground">Hasta</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      className="border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground bg-white outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sin niño seleccionado */}
          {!nino && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
              <p className="font-black text-foreground text-lg">No hay alumnos registrados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Configura el perfil de un niño para empezar
              </p>
            </div>
          )}

          {nino && !hayDatos && <EmptyState nombre={nino.nombre} />}

          {nino && hayDatos && (
            <div className="space-y-6">

              {/* Sin datos en el período seleccionado */}
              {!hayDatosEnPeriodo && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-border shadow-sm">
                  <div className="text-4xl mb-3">🗓️</div>
                  <p className="font-black text-foreground">Sin sesiones en este período</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prueba con un rango de fechas más amplio.
                  </p>
                </div>
              )}

              {hayDatosEnPeriodo && (
                <>
                  {/* ── MÉTRICAS PRINCIPALES ── */}
                  <div>
                    <SectionTitle>Resumen — {labelFiltro[filtroFecha]}</SectionTitle>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <MetricCard
                        title="Sesiones"
                        value={metrics.totalSesiones}
                        icon={<Calendar className="w-5 h-5" />}
                        colorClass="text-primary"
                        bgClass="bg-primary/10"
                      />
                      <MetricCard
                        title="Precisión promedio"
                        value={`${metrics.promedioAciertos}%`}
                        subtitle={metrics.nivelAprendizaje}
                        icon={<Target className="w-5 h-5" />}
                        colorClass={metrics.promedioAciertos >= 80 ? 'text-teo-green' : metrics.promedioAciertos >= 50 ? 'text-teo-yellow' : 'text-teo-red'}
                        bgClass={metrics.promedioAciertos >= 80 ? 'bg-teo-green/10' : metrics.promedioAciertos >= 50 ? 'bg-teo-yellow/10' : 'bg-teo-red/10'}
                      />
                      <MetricCard
                        title="Duración promedio"
                        value={`${metrics.promedioDuracion} min`}
                        icon={<Clock className="w-5 h-5" />}
                        colorClass="text-blue-600"
                        bgClass="bg-blue-50"
                      />
                      <MetricCard
                        title="Racha actual"
                        value={`${metrics.rachaActual} día${metrics.rachaActual !== 1 ? 's' : ''}`}
                        icon={<Zap className="w-5 h-5" />}
                        colorClass="text-amber-600"
                        bgClass="bg-amber-50"
                      />
                    </div>
                  </div>

                  {/* ── EMOCIONAL ── */}
                  <div>
                    <SectionTitle>Trayectoria emocional</SectionTitle>
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-4xl">{emoIni?.emoji || '😐'}</span>
                          <span className="text-xs font-bold text-muted-foreground text-center">Promedio inicio</span>
                          <span className="text-sm font-black text-foreground">{emoIni?.label || '—'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className={`text-2xl font-black ${deltaColor}`}>
                            {metrics.deltaEmocionalPromedio > 0 ? `+${metrics.deltaEmocionalPromedio}` : metrics.deltaEmocionalPromedio}
                          </div>
                          <div className={`flex items-center gap-1 ${deltaColor}`}>
                            {metrics.deltaEmocionalPromedio > 0
                              ? <TrendingUp className="w-4 h-4" />
                              : metrics.deltaEmocionalPromedio < 0
                              ? <TrendingDown className="w-4 h-4" />
                              : <Minus className="w-4 h-4" />}
                            <span className="text-xs font-bold">
                              {metrics.deltaEmocionalPromedio > 0
                                ? 'Las sesiones mejoran su ánimo'
                                : metrics.deltaEmocionalPromedio < 0
                                ? 'Las sesiones bajan su ánimo'
                                : 'Sin cambio emocional'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-4xl">{emoFin?.emoji || '😐'}</span>
                          <span className="text-xs font-bold text-muted-foreground text-center">Promedio final</span>
                          <span className="text-sm font-black text-foreground">{emoFin?.label || '—'}</span>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">Simplificaciones</span>
                            <span className="text-sm font-black text-teo-orange">{metrics.totalSimplificaciones}x</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">Nivel aprendizaje</span>
                            <span className={`text-sm font-black ${
                              metrics.nivelAprendizaje === 'Alto' ? 'text-teo-green' :
                              metrics.nivelAprendizaje === 'Medio' ? 'text-teo-yellow' : 'text-teo-red'
                            }`}>{metrics.nivelAprendizaje}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── EVOLUCIÓN DE ACIERTOS ── */}
                  {metrics.evolucionAciertos.length > 1 && (
                    <EvolucionChart datos={metrics.evolucionAciertos} />
                  )}

                  {/* ── ASIGNATURAS FRECUENTES ── */}
                  {metrics.asignaturasFrecuentes.length > 0 && (
                    <div>
                      <SectionTitle>Asignaturas trabajadas — toca para ver detalle</SectionTitle>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {metrics.asignaturasFrecuentes.map(({ asignatura, sesiones: n }) => {
                          const info = ASIGNATURAS[asignatura as keyof typeof ASIGNATURAS];
                          const activa = asignaturaDetalle === asignatura;
                          return (
                            <button
                              key={asignatura}
                              onClick={() => handleAsignaturaClick(asignatura)}
                              className={`bg-white rounded-2xl border shadow-sm p-4 text-center transition-all cursor-pointer ${
                                activa
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/40 hover:shadow-md'
                              }`}
                            >
                              <span className="text-3xl block mb-1">{info?.emoji || '📚'}</span>
                              <p className="text-sm font-black text-foreground">{info?.label || asignatura}</p>
                              <p className="text-xs text-muted-foreground font-medium">{n} sesión{n !== 1 ? 'es' : ''}</p>
                              {activa && (
                                <span className="inline-block mt-1.5 text-[10px] font-black text-primary">▲ viendo detalle</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Panel de detalle inline */}
                      {asignaturaDetalle && (
                        <div className="mt-3">
                          <DetalleAsignatura
                            asignatura={asignaturaDetalle}
                            sesiones={sesionesEnPeriodo}
                            onCerrar={() => setAsignaturaDetalle(null)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ÚLTIMA SESIÓN ── */}
                  {metrics.ultimaSesion && (
                    <div>
                      <SectionTitle>Última sesión</SectionTitle>
                      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { label: 'Tema', value: metrics.ultimaSesion.tema || '—' },
                            { label: 'Asignatura', value: ASIGNATURAS[metrics.ultimaSesion.asignatura as keyof typeof ASIGNATURAS]?.label || metrics.ultimaSesion.asignatura || '—' },
                            { label: 'Aciertos', value: `${Math.min(100, metrics.ultimaSesion.aciertosPct || 0)}%` },
                            { label: 'Duración', value: `${metrics.ultimaSesion.duracion || 0} min` },
                          ].map(item => (
                            <div key={item.label}>
                              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                              <p className="font-black text-foreground mt-0.5">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── PERFIL NEUROEDUCATIVO ── */}
                  {nino.perfilNeuroeducativo?.resumen && (
                    <div>
                      <SectionTitle>Perfil neuroeducativo</SectionTitle>
                      <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                          {nino.perfilNeuroeducativo.resumen}
                        </p>

                        {nino.perfilNeuroeducativo.fortalezas?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-black text-teo-green uppercase tracking-wide mb-2">⭐ Fortalezas</p>
                            <div className="flex flex-wrap gap-2">
                              {nino.perfilNeuroeducativo.fortalezas.map((f: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-800">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {nino.perfilNeuroeducativo.recomendaciones?.length > 0 && (
                          <div>
                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide mb-2">📚 Recomendaciones activas</p>
                            <div className="space-y-1.5">
                              {nino.perfilNeuroeducativo.recomendaciones.slice(0, 3).map((r: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-foreground font-medium">
                                  <span className="text-amber-500 flex-shrink-0 font-black">{i + 1}.</span> {r}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-medium">
                            Perfil creado {new Date(nino.fechaCreacion || Date.now()).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── HISTORIAL DE SESIONES ── */}
                  <div>
                    <SectionTitle>Historial de sesiones</SectionTitle>
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Fecha</th>
                              <th className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Tema</th>
                              <th className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Asignatura</th>
                              <th className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Interés</th>
                              <th className="text-center px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Aciertos</th>
                              <th className="text-center px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Emoción</th>
                              <th className="text-center px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wide">Duración</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...sesionesEnPeriodo].reverse().slice(0, 15).map((s, i) => {
                              const pct = Math.min(100, s.aciertosPct || 0);
                              const emoI = EMOCIONES.find(e => e.valor === s.emocionInicio);
                              const emoF = EMOCIONES.find(e => e.valor === s.emocionFin);
                              const asigInfo = ASIGNATURAS[s.asignatura as keyof typeof ASIGNATURAS];
                              const interes = INTERESES?.[s.interes as keyof typeof INTERESES];
                              return (
                                <tr key={s.id || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                    {s.fecha ? new Date(s.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-foreground max-w-[140px] truncate">
                                    {s.tema || <span className="text-muted-foreground italic text-xs">Sin tema</span>}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground font-medium">
                                    {asigInfo?.emoji} {asigInfo?.label || s.asignatura || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                                    {interes ? `${interes.emoji} ${interes.label}` : s.interes || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                                      pct >= 80 ? 'bg-green-50 text-green-700' :
                                      pct >= 50 ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-red-50 text-red-700'
                                    }`}>
                                      {pct}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center font-medium">
                                    {emoI?.emoji || '—'} → {emoF?.emoji || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-muted-foreground font-medium">
                                    {s.duracion || 0} min
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
