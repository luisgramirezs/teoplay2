import { SessionData } from '@/types';
import { EMOCIONES, INTERESES, CONDICIONES, ASIGNATURAS } from '@/types';

export function exportReportPDF(data: SessionData): void {
  // Dynamic import to keep bundle clean
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const PAGE_W = 210;
    const MARGIN = 20;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    let y = 0;

    const PAGE_H = 297;
    const BOTTOM_MARGIN = 20;

    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > PAGE_H - BOTTOM_MARGIN) {
        doc.addPage();
        y = 20;
      }
    };
    const perfil = data.perfil!;
    const nombre = perfil.nombre || 'Alumno/a';
    const emoIni = EMOCIONES.find(e => e.valor === data.emocionInicio.valor);
    const emoFin = EMOCIONES.find(e => e.valor === data.emocionFin.valor);
    const delta = data.deltaEmocional || 0;
    const duracion = data.tiempoFin && data.tiempoInicio
      ? Math.round((data.tiempoFin - data.tiempoInicio) / 60000)
      : 0;

    // ── HEADER ──────────────────────────────────────────────────────────────
    // Background bar
    doc.setFillColor(67, 97, 238); // primary blue
    doc.rect(0, 0, PAGE_W, 42, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TEOplay', MARGIN, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Sesión de Aprendizaje', MARGIN, 27);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    doc.text(`${dateStr} — ${timeStr}`, PAGE_W - MARGIN, 27, { align: 'right' });

    y = 55;

    // ── STUDENT INFO ─────────────────────────────────────────────────────────
    checkPageBreak(50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 50);
    doc.text('Información del alumno', MARGIN, y);
    y += 2;
    doc.setDrawColor(67, 97, 238);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);

    const infoLeft = [
      ['Nombre', nombre],
      ['Edad', `${perfil.edad} años`],
      ['Grado', perfil.grado],
    ];
    const infoRight = [
      ['Condición', CONDICIONES[perfil.condicion]?.label || perfil.condicion],
      ['Interés', INTERESES[perfil.interes]?.label || perfil.interes],
      ['Idioma', perfil.idioma === 'es' ? 'Español' : 'English'],
    ];

    infoLeft.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, MARGIN, y + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(value, MARGIN + 25, y + i * 7);
    });
    infoRight.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, PAGE_W / 2 + 5, y + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(value, PAGE_W / 2 + 30, y + i * 7);
    });
    y += 30;

    // Module info
    doc.setFont('helvetica', 'bold');
    doc.text('Asignatura:', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(ASIGNATURAS[perfil.asignatura]?.label || perfil.asignatura, MARGIN + 30, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Tema:', PAGE_W / 2 + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(perfil.tema, PAGE_W / 2 + 20, y);
    y += 14;

    // ── METRICS ──────────────────────────────────────────────────────────────
    checkPageBreak(45);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 50);
    doc.text('Métricas de la sesión', MARGIN, y);
    y += 2;
    doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
    y += 9;

    const metricBoxW = (CONTENT_W - 9) / 4;
    const metricBoxH = 24;
    const metrics = [
      { label: 'Duración', value: `${duracion} min`, color: [67, 97, 238] },
      { label: 'Aciertos', value: `${data.porcentajeAciertos ?? 0}%`, color: [34, 197, 94] },
      { label: 'Simplific.', value: `${data.simplificaciones}x`, color: [249, 115, 22] },
      { label: 'Delta emoc.', value: delta > 0 ? `+${delta} 😊` : delta < 0 ? `${delta} 😔` : '= igual', color: [168, 85, 247] },
    ];

    metrics.forEach((m, i) => {
      const bx = MARGIN + i * (metricBoxW + 3);
      doc.setFillColor(m.color[0], m.color[1], m.color[2]);
      doc.roundedRect(bx, y, metricBoxW, metricBoxH, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(m.value, bx + metricBoxW / 2, y + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(m.label, bx + metricBoxW / 2, y + 20, { align: 'center' });
    });
    y += metricBoxH + 10;

      // ── EMOTIONAL DELTA ──────────────────────────────────────────────────────
      checkPageBreak(40);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.text('Trayectoria emocional', MARGIN, y);
      y += 2;
      doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
      y += 9;

      const emoIniLabel = emoIni?.label || 'Sin dato';
      const emoFinLabel = emoFin?.label || 'Sin dato';
      const deltaTexto = delta > 0 ? `Mejoró +${delta}` : delta < 0 ? `Bajó ${delta}` : 'Sin cambio';

      doc.setFillColor(248, 248, 252);
      doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, 'F');

      // Emoción inicio
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.text('Al entrar', MARGIN + 15, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(emoIniLabel, MARGIN + 15, y + 15, { align: 'center' });

      // Flecha y delta
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const deltaColor = delta > 0 ? [34, 197, 94] : delta < 0 ? [239, 68, 68] : [150, 150, 170];
      doc.setTextColor(deltaColor[0], deltaColor[1], deltaColor[2]);
      doc.text(deltaTexto, PAGE_W / 2, y + 12, { align: 'center' });

      // Emoción fin
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.setFontSize(10);
      doc.text('Al salir', PAGE_W - MARGIN - 15, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(emoFinLabel, PAGE_W - MARGIN - 15, y + 15, { align: 'center' });

      y += 30;
    // ── ACHIEVEMENT SCALE ────────────────────────────────────────────────────
    checkPageBreak(40);
    const pct = Math.min(data.porcentajeAciertos ?? 0, 100);
    const nivel = data.nivelLogro || 'inicio';
    const nivelMap = {
      logrado: { label: 'Logrado ✅', color: [34, 197, 94] as [number,number,number] },
      proceso: { label: 'En proceso 🟡', color: [234, 179, 8] as [number,number,number] },
      inicio: { label: 'En inicio 🔴', color: [239, 68, 68] as [number,number,number] },
    };
    const nivelData = nivelMap[nivel];

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 50);
    doc.text('Escala de logro', MARGIN, y);
    y += 2;
    doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
    y += 9;

    // Bar
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 4, 4, 'F');
    doc.setFillColor(nivelData.color[0], nivelData.color[1], nivelData.color[2]);
    doc.roundedRect(MARGIN, y, Math.max(CONTENT_W * (pct / 100), 5), 8, 4, 4, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(nivelData.color[0], nivelData.color[1], nivelData.color[2]);
    doc.text(`${pct}% — ${nivelData.label}`, MARGIN, y + 18);
    y += 24;

      /////////////////////////////////////////////////////////////////////////////
// ── GAME DETAILS ─────────────────────────────────────────────────────────
    if (data.juegos.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.text('Detalle por juego', MARGIN, y);
      y += 2;
      doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
      y += 9;

      const tipoLabels: Record<string, string> = {
        A: 'Clasificación',
        B: 'Selección múltiple',
        C: 'Tarjetas de memoria',
        D: 'Encuentra el intruso',
        E: 'Actividad en cuaderno',
      };

      data.juegos.forEach((j, i) => {
        checkPageBreak(25); 
        const jPct = j.tipo === 'E' ? 100 : j.intentos > 0
          ? Math.min(Math.round((j.aciertos / j.intentos) * 100), 100)
          : 0;
        const jColor: [number, number, number] = jPct >= 80
          ? [34, 197, 94]
          : jPct >= 50
          ? [234, 179, 8]
          : [239, 68, 68];

        // Fondo de fila
        doc.setFillColor(248, 249, 255);
        doc.roundedRect(MARGIN, y, CONTENT_W, 16, 2, 2, 'F');

        // Número y tipo
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 50);
        doc.text(`Juego ${i + 1} — ${tipoLabels[j.tipo] || j.tipo}`, MARGIN + 4, y + 6);

        // Aciertos/errores
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 100);
        const detalle = j.tipo === 'E'
          ? 'Actividad fisica completada — pendiente revision docente'
          : `${j.aciertos} aciertos / ${j.errores} errores`;
        doc.text(detalle, MARGIN + 4, y + 12);

        // Porcentaje
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(jColor[0], jColor[1], jColor[2]);
        doc.text(`${jPct}%`, MARGIN + CONTENT_W - 4, y + 9, { align: 'right' });

        // Barra de progreso
        doc.setFillColor(220, 220, 230);
        doc.roundedRect(MARGIN + 90, y + 6, 60, 3, 1, 1, 'F');
        doc.setFillColor(jColor[0], jColor[1], jColor[2]);
        doc.roundedRect(MARGIN + 90, y + 6, Math.max(60 * (jPct / 100), 2), 3, 1, 1, 'F');

        y += 20;
      });
      y += 4;
    }






      /////////////////////////////////////////////////////////////////////////////







    // ── RECOMMENDATIONS ──────────────────────────────────────────────────────
     checkPageBreak(30);
    if (data.sesionGenerada?.recomendaciones?.length) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.text('Recomendaciones pedagógicas', MARGIN, y);
      y += 2;
      doc.line(MARGIN, y + 1, MARGIN + CONTENT_W, y + 1);
      y += 9;

      data.sesionGenerada.recomendaciones.forEach((rec, i) => {
        doc.setFillColor(248, 249, 255);
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, CONTENT_W - 8);
        const boxH = lines.length * 5 + 8;
        checkPageBreak(boxH + 6);
        doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'F');
        doc.setFillColor(67, 97, 238);
        doc.circle(MARGIN + 4, y + boxH / 2, 2.5, 'F');
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 60);
        doc.text(lines, MARGIN + 9, y + 6);
        y += boxH + 4;
      });
    }

    // ── FOOTER ───────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          doc.setFillColor(240, 240, 248);
          doc.rect(0, 285, PAGE_W, 12, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120, 120, 140);
          doc.text(
              `Generado por TEOplay — Aprendizaje inclusivo personalizado  |  Página ${p} de ${totalPages}`,
              PAGE_W / 2, 292, { align: 'center' }
          );
      }
      doc.save(`TEOplay_Reporte_${nombre.replace(/\s+/g, '_')}_${now.toISOString().slice(0, 10)}.pdf`);
  }); 
}