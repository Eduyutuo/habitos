/**
 * DISCIPLINA GAMIFICADA - SEGUIMIENTO DE HÁBITOS 🕹️🔥
 * Motor interactivo en Vanilla JavaScript
 */

(function () {
  'use strict';

  // Configuración de Meses y Días
  const MONTHS_CONFIG = [
    { name: 'JULIO', days: 31, startDayLetter: 'l' },
    { name: 'AGOSTO', days: 31, startDayLetter: 'v' },
    { name: 'SEPTIEMBRE', days: 30, startDayLetter: 'l' },
    { name: 'OCTUBRE', days: 31, startDayLetter: 'v' },
    { name: 'NOVIEMBRE', days: 30, startDayLetter: 'd' },
    { name: 'DICIEMBRE', days: 31, startDayLetter: 'm' },
  ];

  const DAY_LETTERS_CYCLE = ['v', 's', 'd', 'l', 'm', 'm', 'j'];

  // Hábitos por defecto extraídos directamente del video (Fotograma 9)
  const DEFAULT_HABITS = [
    'Entrenar en el Gym 🏋️',
    'Tomar agua 💧',
    'No usar redes sociales ❌',
    'Correr mas de 5 km 🏃',
    'Leer 10 Paginas Diarias 📕',
    'No mas Fap 🚫',
    'Agradecer a dios 🙏',
    'Dormir 8:30 PM ⏱️',
    'Contabilizar mis macros 🥑',
    'Levantarme 5 AM ⏰'
  ];

  // Tareas semanales y objetivos mensuales por defecto
  const DEFAULT_WEEKLY_TASKS = [
    { id: 'w1', title: 'Limpiar la casa a fondo 🧹', done: true, week: 1 },
    { id: 'w2', title: 'Hacer la compra de la semana 🛒', done: false, week: 1 },
    { id: 'w3', title: 'Revisión y balance financiero 📊', done: false, week: 2 },
    { id: 'w4', title: 'Planificar metas de la semana entrante 🎯', done: true, week: 2 }
  ];

  const DEFAULT_MONTHLY_GOALS = [
    { id: 'g1', title: 'Terminar la lectura de un libro 📖', done: false },
    { id: 'g2', title: 'Superar 120km de carrera en el mes 🏃‍♂️', done: false },
    { id: 'g3', title: 'Mantener racha de 15 días consecutivos 🔥', done: true }
  ];

  // Estado Central de la Aplicación
  let currentMonthIndex = 3; // Octubre por defecto (índice 3 en MONTHS_CONFIG)
  let appState = loadState() || getInitialState();
  let soundEnabled = true;

  // Audio Sintetizado con Web Audio API (Sin archivos externos)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, delay = 0) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay * 1000);
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  function playArcadeCheckSound() {
    playTone(523.25, 'triangle', 0.08); // Do
    playTone(659.25, 'sine', 0.12, 0.05); // Mi
  }

  function playLevelUpFanfare() {
    playTone(440, 'triangle', 0.1);
    playTone(554.37, 'triangle', 0.1, 0.09);
    playTone(659.25, 'triangle', 0.15, 0.18);
    playTone(880, 'sine', 0.35, 0.28);
  }

  // Carga y Guardado en LocalStorage
  function getInitialState() {
    const monthsData = {};
    MONTHS_CONFIG.forEach((m, idx) => {
      // Matriz de hábitos: { habitId: [bool_dia1, bool_dia2, ...] }
      const matrix = {};
      DEFAULT_HABITS.forEach((h, hIdx) => {
        // Marcado inicial representativo similar al video
        const checks = new Array(m.days).fill(false);
        if (idx === 3) { // Octubre
          for (let d = 0; d < 14; d++) {
            checks[d] = Math.random() > 0.28;
          }
        }
        matrix[`habit_${hIdx}`] = checks;
      });

      monthsData[m.name] = {
        habits: [...DEFAULT_HABITS],
        matrix: matrix,
        goalNote: idx === 3 ? 'Completar el 85% de los hábitos y correr 60km en total' : '',
        weeklyTasks: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_TASKS)),
        monthlyGoals: JSON.parse(JSON.stringify(DEFAULT_MONTHLY_GOALS)),
        notes: idx === 3 ? 'La consistencia en levantarse a las 5 AM desbloquea 2 horas extra de alto rendimiento.' : ''
      };
    });

    return {
      months: monthsData,
      soundEnabled: true,
      lastActiveMonth: 'OCTUBRE'
    };
  }

  function saveState() {
    try {
      localStorage.setItem('DISCIPLINA_GAMIFICADA_DATA', JSON.stringify(appState));
    } catch (e) {
      console.error('Error al guardar datos:', e);
    }
  }

  function loadState() {
    try {
      const data = localStorage.getItem('DISCIPLINA_GAMIFICADA_DATA');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function getCurrentMonthData() {
    const monthName = MONTHS_CONFIG[currentMonthIndex].name;
    if (!appState.months[monthName]) {
      const days = MONTHS_CONFIG[currentMonthIndex].days;
      appState.months[monthName] = {
        habits: [...DEFAULT_HABITS],
        matrix: {},
        goalNote: '',
        weeklyTasks: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_TASKS)),
        monthlyGoals: JSON.parse(JSON.stringify(DEFAULT_MONTHLY_GOALS)),
        notes: ''
      };
      DEFAULT_HABITS.forEach((_, i) => {
        appState.months[monthName].matrix[`habit_${i}`] = new Array(days).fill(false);
      });
    }
    return appState.months[monthName];
  }

  // Helper para asignar la clase de semana según el número de día (1-31)
  function getWeekClass(dayNum) {
    if (dayNum <= 7) return { week: 1, class: 'week-1', boxClass: 'week-1-box' };
    if (dayNum <= 14) return { week: 2, class: 'week-2', boxClass: 'week-2-box' };
    if (dayNum <= 21) return { week: 3, class: 'week-3', boxClass: 'week-3-box' };
    if (dayNum <= 28) return { week: 4, class: 'week-4', boxClass: 'week-4-box' };
    return { week: 5, class: 'week-5', boxClass: 'week-5-box' };
  }

  // =========================================================================
  // RENDERIZADO PRINCIPAL
  // =========================================================================

  function renderAll() {
    const monthConfig = MONTHS_CONFIG[currentMonthIndex];
    const monthData = getCurrentMonthData();

    // Actualizar Título de Mes
    const monthBadge = document.getElementById('currentMonthYearBadge');
    if (monthBadge) monthBadge.textContent = `${monthConfig.name} 2026`;

    renderMatrixHeaders(monthConfig);
    renderHabitRows(monthConfig, monthData);
    updateCalculationsAndUI();
    renderWeeklyTasks(monthData);
    renderMonthlyGoals(monthData);
    renderNotesAndGoalInputs(monthData);
    updateMonthTabs();
  }

  // Renderizar cabecera de la tabla (Letras de días y Números 1..31)
  function renderMatrixHeaders(monthConfig) {
    const daysLetterRow = document.getElementById('daysLetterRow');
    const daysNumRow = document.getElementById('daysNumRow');
    const week5Header = document.getElementById('week5HeaderTh');
    if (!daysLetterRow || !daysNumRow) return;

    // Ajustar colspan dinámico de la Semana 5 según días del mes (31 -> 3, 30 -> 2, 28 -> 1)
    const week5Days = Math.max(1, monthConfig.days - 28);
    if (week5Header) {
      week5Header.setAttribute('colspan', week5Days);
    }

    // Limpiar filas de letras y números (las 3 primeras columnas fijas ahora usan rowspan="3")
    daysLetterRow.innerHTML = '';
    daysNumRow.innerHTML = '';

    for (let d = 1; d <= monthConfig.days; d++) {
      const letterIndex = (d - 1) % DAY_LETTERS_CYCLE.length;
      const letter = DAY_LETTERS_CYCLE[letterIndex];
      const isWeekEnd = (d % 7 === 0);

      const thLetter = document.createElement('th');
      thLetter.textContent = letter;
      thLetter.className = 'th-day-letter';
      if (isWeekEnd) thLetter.classList.add('week-end');
      daysLetterRow.appendChild(thLetter);

      const thNum = document.createElement('th');
      thNum.textContent = d;
      thNum.className = 'th-day-num';
      if (isWeekEnd) thNum.classList.add('week-end');
      daysNumRow.appendChild(thNum);
    }
  }

  // Renderizar filas de hábitos y checkboxes
  function renderHabitRows(monthConfig, monthData) {
    const tbody = document.getElementById('habitTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    monthData.habits.forEach((habitName, habitIdx) => {
      const row = document.createElement('tr');
      const habitKey = `habit_${habitIdx}`;
      if (!monthData.matrix[habitKey]) {
        monthData.matrix[habitKey] = new Array(monthConfig.days).fill(false);
      }
      const checks = monthData.matrix[habitKey];

      // Columna #:
      const tdNum = document.createElement('td');
      tdNum.className = 'col-sticky col-num';
      tdNum.textContent = habitIdx + 1;
      row.appendChild(tdNum);

      // Columna Nombre Hábito (Editable):
      const tdName = document.createElement('td');
      tdName.className = 'col-sticky col-habit-name';
      tdName.innerHTML = `
        <div class="habit-item-cell">
          <span class="habit-name-text" title="Clic para renombrar hábito">${escapeHtml(habitName)}</span>
          <button class="btn-remove-habit" title="Eliminar hábito">✕</button>
        </div>
      `;

      // Evento renombrar
      const nameSpan = tdName.querySelector('.habit-name-text');
      nameSpan.addEventListener('click', async () => {
        const newName = await showCustomPrompt({
          title: 'Editar Hábito',
          icon: '✏️',
          message: 'Modifica el nombre o emoji de tu hábito:',
          defaultValue: habitName,
          placeholder: 'Ej: Entrenar en el Gym 🏋️',
          showEmojis: true
        });
        if (newName && newName.trim() !== '') {
          monthData.habits[habitIdx] = newName.trim();
          saveState();
          renderAll();
        }
      });

      // Evento eliminar
      const removeBtn = tdName.querySelector('.btn-remove-habit');
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await showCustomConfirm({
          title: '¿Eliminar Hábito?',
          icon: '🗑️',
          message: `¿Estás seguro de eliminar <strong>"${escapeHtml(habitName)}"</strong>?<br><span style="color: #94a3b8; font-size: 0.8rem;">Esta acción borrará el progreso de este hábito en el mes.</span>`,
          confirmText: 'Sí, Eliminar',
          cancelText: 'Cancelar',
          isDanger: true
        });
        if (confirmed) {
          monthData.habits.splice(habitIdx, 1);
          delete monthData.matrix[habitKey];
          // Reindexar claves de matriz
          const newMatrix = {};
          monthData.habits.forEach((_, idx) => {
            newMatrix[`habit_${idx}`] = monthData.matrix[`habit_${idx >= habitIdx ? idx + 1 : idx}`] || new Array(monthConfig.days).fill(false);
          });
          monthData.matrix = newMatrix;
          saveState();
          renderAll();
        }
      });

      row.appendChild(tdName);

      // Columna % Mes para este hábito:
      const tdPct = document.createElement('td');
      tdPct.className = 'col-sticky col-pct';
      tdPct.id = `habitPct_${habitIdx}`;
      tdPct.textContent = '0%';
      row.appendChild(tdPct);

      // Celdas de días (1 a 31) con Checkbox Neón:
      for (let d = 1; d <= monthConfig.days; d++) {
        const tdDay = document.createElement('td');
        const weekInfo = getWeekClass(d);
        tdDay.className = `cell-day ${d % 7 === 0 ? 'week-end' : ''}`;

        const isChecked = !!checks[d - 1];
        const box = document.createElement('div');
        box.className = `neon-checkbox ${weekInfo.boxClass} ${isChecked ? 'checked' : ''}`;
        box.textContent = isChecked ? '✓' : '';
        box.dataset.habitIdx = habitIdx;
        box.dataset.day = d;

        box.addEventListener('click', () => {
          toggleHabitCheck(habitIdx, d - 1, box);
        });

        tdDay.appendChild(box);
        row.appendChild(tdDay);
      }

      tbody.appendChild(row);
    });
  }

  // Toggle Checkbox con sonido y recálculo
  function toggleHabitCheck(habitIdx, dayIndex, boxElement) {
    const monthData = getCurrentMonthData();
    const habitKey = `habit_${habitIdx}`;
    const currentState = monthData.matrix[habitKey][dayIndex];
    const newState = !currentState;

    monthData.matrix[habitKey][dayIndex] = newState;

    if (newState) {
      boxElement.classList.add('checked');
      boxElement.textContent = '✓';
      playArcadeCheckSound();
    } else {
      boxElement.classList.remove('checked');
      boxElement.textContent = '';
      playTone(330, 'sine', 0.05);
    }

    saveState();
    updateCalculationsAndUI();
  }

  // =========================================================================
  // CÁLCULOS ESTADÍSTICOS, GRÁFICOS Y GAMIFICACIÓN
  // =========================================================================

  function updateCalculationsAndUI() {
    const monthConfig = MONTHS_CONFIG[currentMonthIndex];
    const monthData = getCurrentMonthData();
    const totalHabits = monthData.habits.length;
    const totalDays = monthConfig.days;

    let globalCompletedCount = 0;
    const totalPossibleChecks = totalHabits * totalDays;

    // 1. Porcentaje por hábito individual (columna % Mes)
    monthData.habits.forEach((_, hIdx) => {
      const checks = monthData.matrix[`habit_${hIdx}`] || [];
      const checkedCount = checks.filter(Boolean).length;
      globalCompletedCount += checkedCount;
      const pct = totalDays > 0 ? ((checkedCount / totalDays) * 100).toFixed(1) : 0;
      const pctCell = document.getElementById(`habitPct_${hIdx}`);
      if (pctCell) {
        pctCell.textContent = `${pct}%`;
        if (pct >= 80) pctCell.style.color = 'var(--accent-green)';
        else if (pct >= 50) pctCell.style.color = 'var(--accent-gold)';
        else pctCell.style.color = 'var(--accent-coral)';
      }
    });

    // 2. Totales y Porcentajes por Día (1..31)
    const dailyPcts = [];
    const dailyDoneCounts = [];

    for (let d = 0; d < totalDays; d++) {
      let dayDone = 0;
      monthData.habits.forEach((_, hIdx) => {
        if (monthData.matrix[`habit_${hIdx}`] && monthData.matrix[`habit_${hIdx}`][d]) {
          dayDone++;
        }
      });
      dailyDoneCounts.push(dayDone);
      const dayPct = totalHabits > 0 ? (dayDone / totalHabits) * 100 : 0;
      dailyPcts.push(dayPct);
    }

    // 3. Fila de Totales en Footer de la Tabla
    renderTableFooter(totalDays, dailyDoneCounts, totalHabits, globalCompletedCount, totalPossibleChecks);

    // 4. Renderizar Gráfico de Barras Superiores (Daily Bars)
    renderDailyBars(totalDays, dailyPcts, dailyDoneCounts, totalHabits);

    // 5. Gauge y Métricas de Resumen Diario
    const globalPct = totalPossibleChecks > 0 ? ((globalCompletedCount / totalPossibleChecks) * 100) : 0;
    updateDailySummaryGauge(globalPct, globalCompletedCount, totalPossibleChecks);

    // 6. Gráfico de Tendencia SVG (Curva de Evolución Diaria)
    renderTrendSvg(dailyPcts);

    // 7. Resumen de Barras Semanales (Semana 1..5)
    updateWeeklySummaryBars(dailyPcts);

    // 8. Motor de Gamificación (XP, Rango, Racha, Nivel)
    updateGamification(globalCompletedCount, dailyPcts);
  }

  function renderTableFooter(totalDays, dailyDoneCounts, totalHabits, globalDone, totalPossible) {
    const totalRow = document.getElementById('totalDailyDoneRow');
    if (!totalRow) return;

    // Limpiar celdas previas de días (conservar las 3 primeras columnas fijas)
    while (totalRow.children.length > 3) {
      totalRow.removeChild(totalRow.lastChild);
    }

    const globalPctCell = document.getElementById('globalPctFooter');
    if (globalPctCell) {
      const pct = totalPossible > 0 ? ((globalDone / totalPossible) * 100).toFixed(0) : 0;
      globalPctCell.textContent = `${pct}%`;
    }

    for (let d = 0; d < totalDays; d++) {
      const td = document.createElement('td');
      td.textContent = dailyDoneCounts[d];
      td.className = (d + 1) % 7 === 0 ? 'week-end' : '';
      if (dailyDoneCounts[d] === totalHabits && totalHabits > 0) {
        td.style.color = 'var(--accent-green)';
        td.style.fontWeight = '900';
      }
      totalRow.appendChild(td);
    }
  }

  // Renderizado dinámico de las 31 barras superiores
  function renderDailyBars(totalDays, dailyPcts, dailyDoneCounts, totalHabits) {
    const container = document.getElementById('dailyBarsContainer');
    if (!container) return;
    container.innerHTML = '';

    for (let d = 0; d < totalDays; d++) {
      const pct = Math.round(dailyPcts[d]);
      const done = dailyDoneCounts[d];

      const col = document.createElement('div');
      col.className = 'daily-bar-col';
      col.title = `Día ${d + 1}: ${done}/${totalHabits} hábitos (${pct}%)`;

      let fillClass = 'bar-fill';
      if (pct === 100) fillClass += ' bar-full';
      else if (pct >= 70) fillClass += ' bar-high';
      else if (pct >= 40) fillClass += ' bar-mid';

      col.innerHTML = `
        <span class="bar-pct-label">${pct}%</span>
        <div class="bar-track">
          <div class="${fillClass}" style="height: ${Math.max(pct, 3)}%;"></div>
        </div>
        <span class="bar-day-label">${d + 1}</span>
      `;

      container.appendChild(col);
    }
  }

  // Actualizar Gauge Circular y Contadores
  function updateDailySummaryGauge(globalPct, completedCount, totalPossible) {
    const gaugeValue = document.getElementById('dailyGaugeValue');
    const gaugeCircle = document.getElementById('dailyGaugeCircle');
    const habitsCount = document.getElementById('dailyHabitsCount');
    const metricPct = document.getElementById('metricPctCompleted');
    const metricDone = document.getElementById('metricCountCompleted');
    const metricIncomplete = document.getElementById('metricCountIncompleted');

    const formattedPct = globalPct.toFixed(1);

    if (gaugeValue) gaugeValue.textContent = `${formattedPct}%`;
    if (habitsCount) habitsCount.textContent = `${completedCount} / ${totalPossible}`;
    if (metricPct) metricPct.textContent = `${formattedPct}%`;
    if (metricDone) metricDone.textContent = completedCount;
    if (metricIncomplete) metricIncomplete.textContent = Math.max(totalPossible - completedCount, 0);

    // Actualizar circunferencia SVG (Radio 50 -> Perímetro ~314)
    if (gaugeCircle) {
      const maxOffset = 314;
      const offset = maxOffset - (globalPct / 100) * maxOffset;
      gaugeCircle.style.strokeDashoffset = Math.max(0, offset);
      if (globalPct >= 80) gaugeCircle.style.stroke = '#10b981';
      else if (globalPct >= 50) gaugeCircle.style.stroke = '#38bdf8';
      else gaugeCircle.style.stroke = '#fb923c';
    }
  }

  // Gráfico de Tendencia Diaria SVG (Curva suave con relleno)
  function renderTrendSvg(dailyPcts) {
    const areaPath = document.getElementById('trendAreaPath');
    const linePath = document.getElementById('trendLinePath');
    if (!areaPath || !linePath || dailyPcts.length === 0) return;

    const width = 320;
    const height = 90;
    const paddingX = 10;
    const paddingY = 10;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const stepX = usableWidth / (dailyPcts.length - 1);
    const points = dailyPcts.map((pct, idx) => {
      const x = paddingX + idx * stepX;
      const y = height - paddingY - (pct / 100) * usableHeight;
      return { x, y };
    });

    let dLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Interpolación cúbica simple
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      dLine += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const dArea = `${dLine} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    linePath.setAttribute('d', dLine);
    areaPath.setAttribute('d', dArea);
  }

  // Resumen Semanal (Barras de progreso Semana 1..5)
  function updateWeeklySummaryBars(dailyPcts) {
    const container = document.getElementById('weeklyBarsSummary');
    if (!container) return;
    container.innerHTML = '';

    const weeksRanges = [
      { name: 'Semana 1', start: 0, end: 6, color: 'var(--week-1)' },
      { name: 'Semana 2', start: 7, end: 13, color: 'var(--week-2)' },
      { name: 'Semana 3', start: 14, end: 20, color: 'var(--week-3)' },
      { name: 'Semana 4', start: 21, end: 27, color: 'var(--week-4)' },
      { name: 'Semana 5', start: 28, end: dailyPcts.length - 1, color: 'var(--week-5)' },
    ];

    weeksRanges.forEach((w) => {
      const slice = dailyPcts.slice(w.start, w.end + 1);
      const avg = slice.length > 0 ? (slice.reduce((acc, v) => acc + v, 0) / slice.length).toFixed(0) : 0;

      const item = document.createElement('div');
      item.className = 'weekly-bar-item';
      item.innerHTML = `
        <div class="weekly-bar-title" style="color: ${w.color}">${w.name}</div>
        <div class="weekly-bar-pct" style="color: #fff">${avg}%</div>
        <div class="weekly-progress-rail">
          <div class="weekly-progress-fill" style="width: ${avg}%; background: ${w.color};"></div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  // Motor de Gamificación (XP, Niveles, Racha)
  function updateGamification(totalChecked, dailyPcts) {
    // 10 XP por cada hábito marcado + 50 XP por cada día al 100%
    const perfectDays = dailyPcts.filter(p => p >= 100).length;
    const baseXP = totalChecked * 10;
    const bonusXP = perfectDays * 50;
    const totalXP = baseXP + bonusXP;

    // Niveles: 0-300: Nvl 1, 301-700: Nvl 2, 701-1200: Nvl 3, etc.
    const levels = [
      { lvl: 1, xpReq: 0, rank: 'Novato Disciplinado' },
      { lvl: 2, xpReq: 250, rank: 'Iniciado Constante' },
      { lvl: 3, xpReq: 600, rank: 'Forjador de Hábitos' },
      { lvl: 4, xpReq: 1100, rank: 'Guerrero de la Voluntad' },
      { lvl: 5, xpReq: 1800, rank: 'Maestro de la Disciplina' },
      { lvl: 6, xpReq: 2700, rank: 'Titán Inquebrantable' },
      { lvl: 7, xpReq: 4000, rank: 'Leyenda del Enfoque 🔥' },
    ];

    let currentLvl = levels[0];
    let nextLvl = levels[1];
    for (let i = 0; i < levels.length; i++) {
      if (totalXP >= levels[i].xpReq) {
        currentLvl = levels[i];
        nextLvl = levels[i + 1] || { xpReq: levels[i].xpReq + 1500 };
      } else {
        break;
      }
    }

    const prevXP = currentLvl.xpReq;
    const nextXP = nextLvl.xpReq;
    const lvlProgress = Math.min(100, Math.max(0, ((totalXP - prevXP) / (nextXP - prevXP)) * 100));

    // Cálculo de racha consecutiva activa
    let currentStreak = 0;
    for (let i = 0; i < dailyPcts.length; i++) {
      if (dailyPcts[i] >= 60) {
        currentStreak++;
      } else if (dailyPcts[i] > 0) {
        currentStreak = 1;
      }
    }

    // Actualizar UI
    const elLevel = document.getElementById('playerLevel');
    const elRank = document.getElementById('playerRank');
    const elXP = document.getElementById('playerXP');
    const elBar = document.getElementById('xpProgressBar');
    const elStreak = document.getElementById('streakCounter');

    if (elLevel) elLevel.textContent = `Nvl ${currentLvl.lvl}`;
    if (elRank) elRank.textContent = currentLvl.rank;
    if (elXP) elXP.textContent = `${totalXP.toLocaleString()} XP`;
    if (elBar) elBar.style.width = `${lvlProgress}%`;
    if (elStreak) elStreak.textContent = `🔥 ${currentStreak} Días`;
  }

  // =========================================================================
  // TAREAS SEMANALES Y OBJETIVOS MENSUALES (Checklist con tachado)
  // =========================================================================

  function renderWeeklyTasks(monthData) {
    const list = document.getElementById('weeklyTaskList');
    const filterSelect = document.getElementById('weeklyFilterSelect');
    if (!list) return;

    const filterVal = filterSelect ? filterSelect.value : 'ALL';
    list.innerHTML = '';

    const filtered = (filterVal === 'ALL')
      ? monthData.weeklyTasks
      : monthData.weeklyTasks.filter(t => t.week.toString() === filterVal);

    if (filtered.length === 0) {
      list.innerHTML = `<li class="hint-text" style="padding: 0.5rem 0;">No hay tareas para esta semana.</li>`;
      return;
    }

    filtered.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item ${task.done ? 'done' : ''}`;
      li.innerHTML = `
        <div class="task-checkbox">${task.done ? '✓' : ''}</div>
        <span class="task-title">${escapeHtml(task.title)}</span>
        <button class="btn-remove-habit" title="Eliminar">✕</button>
      `;

      // Toggle tarea
      const chk = li.querySelector('.task-checkbox');
      chk.addEventListener('click', () => {
        task.done = !task.done;
        saveState();
        renderWeeklyTasks(monthData);
        if (task.done) playArcadeCheckSound();
      });

      // Eliminar tarea
      const rm = li.querySelector('.btn-remove-habit');
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        monthData.weeklyTasks = monthData.weeklyTasks.filter(t => t.id !== task.id);
        saveState();
        renderWeeklyTasks(monthData);
      });

      list.appendChild(li);
    });
  }

  function renderMonthlyGoals(monthData) {
    const list = document.getElementById('monthlyGoalsList');
    if (!list) return;
    list.innerHTML = '';

    monthData.monthlyGoals.forEach((goal) => {
      const li = document.createElement('li');
      li.className = `task-item ${goal.done ? 'done' : ''}`;
      li.innerHTML = `
        <div class="task-checkbox">${goal.done ? '✓' : ''}</div>
        <span class="task-title">${escapeHtml(goal.title)}</span>
        <button class="btn-remove-habit" title="Eliminar">✕</button>
      `;

      const chk = li.querySelector('.task-checkbox');
      chk.addEventListener('click', () => {
        goal.done = !goal.done;
        saveState();
        renderMonthlyGoals(monthData);
        if (goal.done) {
          playLevelUpFanfare();
          launchConfetti();
        }
      });

      const rm = li.querySelector('.btn-remove-habit');
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        monthData.monthlyGoals = monthData.monthlyGoals.filter(g => g.id !== goal.id);
        saveState();
        renderMonthlyGoals(monthData);
      });

      list.appendChild(li);
    });
  }

  function renderNotesAndGoalInputs(monthData) {
    const goalInput = document.getElementById('monthlyGoalNote');
    const notesArea = document.getElementById('monthlyNotesArea');

    if (goalInput) {
      goalInput.value = monthData.goalNote || '';
      goalInput.oninput = (e) => {
        monthData.goalNote = e.target.value;
        saveState();
      };
    }

    if (notesArea) {
      notesArea.value = monthData.notes || '';
      notesArea.oninput = (e) => {
        monthData.notes = e.target.value;
        saveState();
      };
    }
  }

  // =========================================================================
  // NAVEGACIÓN POR PESTAÑAS (Estilo Hojas de Cálculo del video)
  // =========================================================================

  function updateMonthTabs() {
    const tabButtons = document.querySelectorAll('.bottom-sheet-tabs .tab-btn');
    const currentName = MONTHS_CONFIG[currentMonthIndex].name;

    tabButtons.forEach(btn => {
      if (btn.dataset.month) {
        const monthNum = parseInt(btn.dataset.month, 10);
        const config = MONTHS_CONFIG.find(m => m.name === btn.textContent.trim());
        if (btn.textContent.trim() === currentName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  // =========================================================================
  // EFECTO CONFETI (CANVAS PURO)
  // =========================================================================

  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#9ef01a', '#ff6b6b', '#00f5d4', '#c77dff', '#ffb703', '#ffffff'];
    const particles = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravedad
        p.rotation += p.vr;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 80) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(anim);
  }

  // =========================================================================
  // SISTEMA DE MODALES Y DIÁLOGOS PERSONALIZADOS (Reemplazo moderno de prompt/confirm/alert)
  // =========================================================================

  let activeModalResolve = null;

  function closeCustomModal(result = null) {
    const overlay = document.getElementById('dynamicModalOverlay');
    if (overlay) overlay.classList.add('hidden');
    if (activeModalResolve) {
      const resolve = activeModalResolve;
      activeModalResolve = null;
      resolve(result);
    }
  }

  function showCustomPrompt({ title = 'Nuevo Elemento', icon = '🕹️', message = '', defaultValue = '', placeholder = '', showEmojis = true }) {
    return new Promise((resolve) => {
      activeModalResolve = resolve;

      const overlay = document.getElementById('dynamicModalOverlay');
      const modalIcon = document.getElementById('dynamicModalIcon');
      const modalTitle = document.getElementById('dynamicModalTitle');
      const modalMsg = document.getElementById('dynamicModalMsg');
      const inputWrap = document.getElementById('dynamicModalInputWrap');
      const input = document.getElementById('dynamicModalInput');
      const emojiPalette = document.getElementById('dynamicModalEmojiPalette');
      const confirmBtn = document.getElementById('dynamicModalConfirmBtn');
      const cancelBtn = document.getElementById('dynamicModalCancelBtn');

      modalIcon.textContent = icon;
      modalTitle.textContent = title;
      modalMsg.innerHTML = message;
      modalMsg.style.display = message ? 'block' : 'none';

      inputWrap.classList.remove('hidden');
      input.value = defaultValue;
      input.placeholder = placeholder;

      if (showEmojis) {
        emojiPalette.style.display = 'flex';
      } else {
        emojiPalette.style.display = 'none';
      }

      confirmBtn.textContent = 'Guardar';
      confirmBtn.className = 'btn btn-accent';
      cancelBtn.style.display = 'inline-flex';

      overlay.classList.remove('hidden');
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    });
  }

  function showCustomConfirm({ title = '¿Estás seguro?', icon = '⚠️', message = '', confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false }) {
    return new Promise((resolve) => {
      activeModalResolve = resolve;

      const overlay = document.getElementById('dynamicModalOverlay');
      const modalIcon = document.getElementById('dynamicModalIcon');
      const modalTitle = document.getElementById('dynamicModalTitle');
      const modalMsg = document.getElementById('dynamicModalMsg');
      const inputWrap = document.getElementById('dynamicModalInputWrap');
      const confirmBtn = document.getElementById('dynamicModalConfirmBtn');
      const cancelBtn = document.getElementById('dynamicModalCancelBtn');

      modalIcon.textContent = icon;
      modalTitle.textContent = title;
      modalMsg.innerHTML = message;
      modalMsg.style.display = 'block';

      inputWrap.classList.add('hidden');

      confirmBtn.textContent = confirmText;
      confirmBtn.className = isDanger ? 'btn btn-danger' : 'btn btn-accent';
      cancelBtn.textContent = cancelText;
      cancelBtn.style.display = 'inline-flex';

      overlay.classList.remove('hidden');
      setTimeout(() => confirmBtn.focus(), 50);
    });
  }

  function showCustomAlert({ title = 'Aviso', icon = '🎯', message = '', buttonText = 'Entendido' }) {
    return new Promise((resolve) => {
      activeModalResolve = resolve;

      const overlay = document.getElementById('dynamicModalOverlay');
      const modalIcon = document.getElementById('dynamicModalIcon');
      const modalTitle = document.getElementById('dynamicModalTitle');
      const modalMsg = document.getElementById('dynamicModalMsg');
      const inputWrap = document.getElementById('dynamicModalInputWrap');
      const confirmBtn = document.getElementById('dynamicModalConfirmBtn');
      const cancelBtn = document.getElementById('dynamicModalCancelBtn');

      modalIcon.textContent = icon;
      modalTitle.textContent = title;
      modalMsg.innerHTML = message;
      modalMsg.style.display = 'block';

      inputWrap.classList.add('hidden');

      confirmBtn.textContent = buttonText;
      confirmBtn.className = 'btn btn-accent';
      cancelBtn.style.display = 'none';

      overlay.classList.remove('hidden');
      setTimeout(() => confirmBtn.focus(), 50);
    });
  }

  // =========================================================================
  // FUNCIONES DE EXPORTACIÓN ESTÉTICA (EXCEL .xlsx con estilos, CSV, JSON)
  // =========================================================================

  async function exportToExcel() {
    const monthConfig = MONTHS_CONFIG[currentMonthIndex];
    const monthData = getCurrentMonthData();

    if (typeof ExcelJS === 'undefined') {
      alert('La biblioteca de Excel no está disponible. Usando CSV como alternativa.');
      exportToCSV();
      return;
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Disciplina Gamificada';
    wb.lastModifiedBy = 'Disciplina Gamificada';
    wb.created = new Date();

    const ws = wb.addWorksheet(monthConfig.name, {
      views: [
        {
          state: 'frozen',
          xSplit: 3, // Inmovilizar las 3 primeras columnas (#, HÁBITO, % MES)
          ySplit: 4, // Inmovilizar las 4 primeras filas (Banner + Semanas + Días Letras + Días Números)
          showGridLines: true
        }
      ]
    });

    const totalDays = monthConfig.days;
    const totalHabits = monthData.habits.length;
    const totalPossible = totalHabits * totalDays;

    // Configuración de Anchos de Columna Generosos y Ordenados
    ws.getColumn(1).width = 5.5;   // #
    ws.getColumn(2).width = 34;    // HÁBITO (suficiente para que no se corte ningún emoji o texto)
    ws.getColumn(3).width = 12.5;  // % MES
    for (let c = 4; c < 4 + totalDays; c++) {
      ws.getColumn(c).width = 5.2; // Celdas cuadradas para los 31 días
    }

    // Paleta de Colores de las Semanas (Basado en la Web y el Video Original)
    const weekStyles = [
      { name: 'SEMANA 1', startDay: 1, endDay: 7, bg: 'FF9EF01A', text: 'FF000000', lightBg: 'FFF4FEE8' },
      { name: 'SEMANA 2', startDay: 8, endDay: 14, bg: 'FFFF6B6B', text: 'FFFFFFFF', lightBg: 'FFFFF0F0' },
      { name: 'SEMANA 3', startDay: 15, endDay: 21, bg: 'FF00F5D4', text: 'FF000000', lightBg: 'FFE8FDF9' },
      { name: 'SEMANA 4', startDay: 22, endDay: 28, bg: 'FFC77DFF', text: 'FFFFFFFF', lightBg: 'FFF9F0FF' },
      { name: 'SEMANA 5', startDay: 29, endDay: totalDays, bg: 'FFFFB703', text: 'FF000000', lightBg: 'FFFFF9E6' }
    ];

    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };

    // ==========================================
    // FILA 1: TÍTULO Y BANNER ARCADE
    // ==========================================
    const lastColLetter = ws.getColumn(3 + totalDays).letter;
    ws.mergeCells(`A1:${lastColLetter}1`);
    const banner = ws.getCell('A1');
    banner.value = `DISCIPLINA GAMIFICADA — SEGUIMIENTO DE HÁBITOS 🕹️🔥 (${monthConfig.name} 2026)`;
    banner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    banner.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // ==========================================
    // FILA 2: AGRUPACIÓN DE SEMANAS
    // ==========================================
    ws.getRow(2).height = 22;
    ['A2', 'B2', 'C2'].forEach(ref => {
      const c = ws.getCell(ref);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF94A3B8' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = thinBorder;
    });

    weekStyles.forEach(w => {
      if (w.startDay <= totalDays) {
        const startCol = 3 + w.startDay;
        const endCol = 3 + Math.min(w.endDay, totalDays);
        if (startCol <= endCol) {
          ws.mergeCells(2, startCol, 2, endCol);
          const cell = ws.getCell(2, startCol);
          cell.value = w.name;
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: w.text } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: w.bg } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          for (let col = startCol; col <= endCol; col++) {
            ws.getCell(2, col).border = thinBorder;
          }
        }
      }
    });

    // ==========================================
    // FILA 3: LETRAS DE LOS DÍAS (v, s, d, l, m, m, j)
    // ==========================================
    ws.getRow(3).height = 18;
    ['A3', 'B3', 'C3'].forEach(ref => {
      const c = ws.getCell(ref);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      c.border = thinBorder;
    });

    for (let d = 1; d <= totalDays; d++) {
      const col = 3 + d;
      const cell = ws.getCell(3, col);
      const letterIndex = (d - 1) % DAY_LETTERS_CYCLE.length;
      cell.value = DAY_LETTERS_CYCLE[letterIndex].toUpperCase();
      cell.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF94A3B8' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    }

    // ==========================================
    // FILA 4: NÚMEROS DE DÍAS (1..31)
    // ==========================================
    ws.getRow(4).height = 22;
    const hNum = ws.getCell('A4');
    hNum.value = '#';
    hNum.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    hNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    hNum.alignment = { horizontal: 'center', vertical: 'middle' };
    hNum.border = thinBorder;

    const hHabit = ws.getCell('B4');
    hHabit.value = 'HÁBITO';
    hHabit.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    hHabit.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    hHabit.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    hHabit.border = thinBorder;

    const hPct = ws.getCell('C4');
    hPct.value = '% MES';
    hPct.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    hPct.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    hPct.alignment = { horizontal: 'center', vertical: 'middle' };
    hPct.border = thinBorder;

    for (let d = 1; d <= totalDays; d++) {
      const col = 3 + d;
      const cell = ws.getCell(4, col);
      cell.value = d;
      cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    }

    // ==========================================
    // FILAS DE HÁBITOS (DATOS)
    // ==========================================
    let globalCompleted = 0;
    const dailyDoneCounts = new Array(totalDays).fill(0);

    monthData.habits.forEach((habit, hIdx) => {
      const rowIdx = 5 + hIdx;
      ws.getRow(rowIdx).height = 23;

      // Col A: #
      const cNum = ws.getCell(rowIdx, 1);
      cNum.value = hIdx + 1;
      cNum.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
      cNum.alignment = { horizontal: 'center', vertical: 'middle' };
      cNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hIdx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF' } };
      cNum.border = thinBorder;

      // Col B: Hábito
      const cHabit = ws.getCell(rowIdx, 2);
      cHabit.value = habit;
      cHabit.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
      cHabit.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      cHabit.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hIdx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF' } };
      cHabit.border = thinBorder;

      // Checks de este hábito
      const checks = monthData.matrix[`habit_${hIdx}`] || [];
      const doneCount = checks.filter(Boolean).length;
      globalCompleted += doneCount;
      const pctValue = totalDays > 0 ? (doneCount / totalDays) : 0;

      // Col C: % Mes
      const cPct = ws.getCell(rowIdx, 3);
      cPct.value = pctValue;
      cPct.numFmt = '0.0%';
      cPct.font = {
        name: 'Segoe UI',
        size: 9.5,
        bold: true,
        color: { argb: pctValue >= 0.7 ? 'FF16A34A' : pctValue >= 0.4 ? 'FFD97706' : 'FFE11D48' }
      };
      cPct.alignment = { horizontal: 'center', vertical: 'middle' };
      cPct.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hIdx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF' } };
      cPct.border = thinBorder;

      // Días 1..31
      for (let d = 0; d < totalDays; d++) {
        const col = 4 + d;
        const cell = ws.getCell(rowIdx, col);
        const isChecked = !!checks[d];
        const dayNum = d + 1;
        const week = weekStyles.find(w => dayNum >= w.startDay && dayNum <= w.endDay) || weekStyles[0];

        if (isChecked) {
          cell.value = '✓';
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F766E' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: week.lightBg } };
          dailyDoneCounts[d]++;
        } else {
          cell.value = '';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = thinBorder;
      }
    });

    // ==========================================
    // FILA DE TOTALES DIARIOS (Footer)
    // ==========================================
    const footerRowIdx = 5 + totalHabits;
    ws.getRow(footerRowIdx).height = 25;

    const fNum = ws.getCell(footerRowIdx, 1);
    fNum.value = 'Σ';
    fNum.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    fNum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    fNum.alignment = { horizontal: 'center', vertical: 'middle' };
    fNum.border = thinBorder;

    const fHabit = ws.getCell(footerRowIdx, 2);
    fHabit.value = 'TOTAL COMPLETADOS';
    fHabit.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    fHabit.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    fHabit.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    fHabit.border = thinBorder;

    const globalPctVal = totalPossible > 0 ? (globalCompleted / totalPossible) : 0;
    const fPct = ws.getCell(footerRowIdx, 3);
    fPct.value = globalPctVal;
    fPct.numFmt = '0.0%';
    fPct.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF38BDF8' } };
    fPct.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    fPct.alignment = { horizontal: 'center', vertical: 'middle' };
    fPct.border = thinBorder;

    for (let d = 0; d < totalDays; d++) {
      const col = 4 + d;
      const cell = ws.getCell(footerRowIdx, col);
      cell.value = dailyDoneCounts[d];
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    }

    // ==========================================
    // SECCIÓN DASHBOARD ORDENADA EN EXCEL (Fila N + 3)
    // ==========================================
    const dashStartRow = footerRowIdx + 3;

    // 1. Resumen de Hábitos Diarios
    ws.mergeCells(dashStartRow, 2, dashStartRow, 3);
    const dHeader1 = ws.getCell(dashStartRow, 2);
    dHeader1.value = 'RESUMEN DE HÁBITOS DIARIOS';
    dHeader1.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    dHeader1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFB923C' } };
    dHeader1.alignment = { horizontal: 'center', vertical: 'middle' };

    const dailyMetrics = [
      ['% Cumplimiento Global', (globalPctVal * 100).toFixed(1) + '%'],
      ['Total Casillas Marcadas', globalCompleted],
      ['Total Casillas Incompletas', Math.max(0, totalPossible - globalCompleted)],
      ['Objetivo Diario', '100%'],
      ['Meta del Mes', monthData.goalNote || 'Sin definir']
    ];

    dailyMetrics.forEach((m, i) => {
      const r = dashStartRow + 1 + i;
      ws.getCell(r, 2).value = m[0];
      ws.getCell(r, 2).font = { name: 'Segoe UI', size: 8.5, color: { argb: 'FF475569' } };
      ws.getCell(r, 2).border = thinBorder;

      ws.getCell(r, 3).value = m[1];
      ws.getCell(r, 3).font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0F172A' } };
      ws.getCell(r, 3).alignment = { horizontal: 'right', vertical: 'middle' };
      ws.getCell(r, 3).border = thinBorder;
    });

    // 2. Resumen Semanal
    ws.mergeCells(dashStartRow, 5, dashStartRow, 11);
    const dHeader2 = ws.getCell(dashStartRow, 5);
    dHeader2.value = 'RESUMEN DE RENDIMIENTO SEMANAL';
    dHeader2.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    dHeader2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
    dHeader2.alignment = { horizontal: 'center', vertical: 'middle' };

    weekStyles.forEach((w, i) => {
      const r = dashStartRow + 1 + i;
      ws.mergeCells(r, 5, r, 7);
      const wLabel = ws.getCell(r, 5);
      wLabel.value = w.name;
      wLabel.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: w.text } };
      wLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: w.bg } };
      wLabel.alignment = { horizontal: 'center', vertical: 'middle' };

      let weekChecks = 0;
      let weekPossible = 0;
      for (let d = w.startDay; d <= Math.min(w.endDay, totalDays); d++) {
        weekChecks += dailyDoneCounts[d - 1] || 0;
        weekPossible += totalHabits;
      }
      const weekPct = weekPossible > 0 ? (weekChecks / weekPossible) : 0;

      ws.mergeCells(r, 8, r, 11);
      const wVal = ws.getCell(r, 8);
      wVal.value = weekPct;
      wVal.numFmt = '0.0%';
      wVal.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0F172A' } };
      wVal.alignment = { horizontal: 'center', vertical: 'middle' };
      wVal.border = thinBorder;
    });

    // 3. Tareas y Objetivos
    ws.mergeCells(dashStartRow, 13, dashStartRow, 22);
    const dHeader3 = ws.getCell(dashStartRow, 13);
    dHeader3.value = 'TAREAS Y OBJETIVOS CLAVE';
    dHeader3.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    dHeader3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF06B6D4' } };
    dHeader3.alignment = { horizontal: 'center', vertical: 'middle' };

    const tasksAndGoals = [
      ...(monthData.monthlyGoals || []).map(g => ({ title: `[Objetivo] ${g.title}`, done: g.done })),
      ...(monthData.weeklyTasks || []).map(t => ({ title: `[Semana ${t.week}] ${t.title}`, done: t.done }))
    ];

    tasksAndGoals.slice(0, 5).forEach((t, i) => {
      const r = dashStartRow + 1 + i;
      ws.mergeCells(r, 13, r, 20);
      const cTitle = ws.getCell(r, 13);
      cTitle.value = t.title;
      cTitle.font = { name: 'Segoe UI', size: 8.5, color: { argb: t.done ? 'FF94A3B8' : 'FF1E293B' } };
      cTitle.border = thinBorder;

      ws.mergeCells(r, 21, r, 22);
      const cState = ws.getCell(r, 21);
      cState.value = t.done ? 'COMPLETADO ✓' : 'PENDIENTE';
      cState.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: t.done ? 'FF16A34A' : 'FFE11D48' } };
      cState.alignment = { horizontal: 'center', vertical: 'middle' };
      cState.border = thinBorder;
    });

    // Generar buffer y descargar archivo
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seguimiento_Habitos_${monthConfig.name}_2026.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playLevelUpFanfare();
  }

  function exportToCSV() {
    const monthConfig = MONTHS_CONFIG[currentMonthIndex];
    const monthData = getCurrentMonthData();

    // UTF-8 BOM (\uFEFF) para compatibilidad absoluta con Microsoft Excel en español
    let csv = '\uFEFF';

    // Encabezado
    const headers = ['#', 'Hábito', '% Mes'];
    for (let d = 1; d <= monthConfig.days; d++) {
      headers.push(`Dia_${d}`);
    }
    csv += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';') + '\r\n';

    const dailyCounts = new Array(monthConfig.days).fill(0);
    let globalCompleted = 0;

    monthData.habits.forEach((habit, idx) => {
      const checks = monthData.matrix[`habit_${idx}`] || [];
      const doneCount = checks.filter(Boolean).length;
      globalCompleted += doneCount;
      const pct = monthConfig.days > 0 ? ((doneCount / monthConfig.days) * 100).toFixed(1) + '%' : '0%';
      const row = [idx + 1, habit, pct];

      for (let d = 0; d < monthConfig.days; d++) {
        if (checks[d]) {
          row.push('1');
          dailyCounts[d]++;
        } else {
          row.push('0');
        }
      }
      csv += row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';') + '\r\n';
    });

    // Fila Totales
    const totalsRow = ['Σ', 'TOTAL COMPLETADOS', ''];
    for (let d = 0; d < monthConfig.days; d++) {
      totalsRow.push(dailyCounts[d]);
    }
    csv += totalsRow.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';') + '\r\n';

    // Descargar CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seguimiento_Habitos_${monthConfig.name}_2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playLevelUpFanfare();
  }

  function exportToJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Seguimiento_Habitos_Backup_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playLevelUpFanfare();
  }

  // =========================================================================
  // SISTEMA UNIVERSAL DE IMPORTACIÓN (Excel .xlsx/.xls, CSV .csv, JSON .json)
  // =========================================================================

  function handleUniversalFileImport(file) {
    if (!file) return;

    const fileName = file.name.toLowerCase();

    // 1. Caso JSON (Respaldo Técnico Completo)
    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && parsed.months) {
            appState = parsed;
            saveState();
            renderAll();
            launchConfetti();
            playLevelUpFanfare();
            await showCustomAlert({
              title: '¡Importación Exitosa!',
              icon: '✅',
              message: 'Tus datos y seguimiento han sido restaurados completamente desde el archivo JSON.',
              buttonText: 'Continuar'
            });
          } else {
            throw new Error('Estructura de respaldo no válida');
          }
        } catch (err) {
          showCustomAlert({
            title: 'Error de Importación',
            icon: '⚠️',
            message: 'El archivo seleccionado no tiene un formato válido de respaldo JSON.',
            buttonText: 'Cerrar'
          });
        }
      };
      reader.readAsText(file, 'utf-8');
      return;
    }

    // 2. Caso Excel (.xlsx, .xls) o CSV (.csv)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (typeof XLSX === 'undefined') {
            throw new Error('La biblioteca de lectura XLSX no está cargada');
          }

          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array', codepage: 65001 });

          // Detectar a qué mes pertenece (por nombre de hoja o nombre de archivo)
          let targetMonthName = MONTHS_CONFIG[currentMonthIndex].name;
          for (const m of MONTHS_CONFIG) {
            if (wb.SheetNames.some(s => s.toUpperCase().includes(m.name)) || file.name.toUpperCase().includes(m.name)) {
              targetMonthName = m.name;
              break;
            }
          }

          const foundMonthIdx = MONTHS_CONFIG.findIndex(m => m.name === targetMonthName);
          if (foundMonthIdx !== -1) {
            currentMonthIndex = foundMonthIdx;
          }

          const monthConfig = MONTHS_CONFIG[currentMonthIndex];
          const monthData = getCurrentMonthData();
          const targetDays = monthConfig.days;

          // Seleccionar la hoja que contiene la matriz (la primera hoja o la que contenga el nombre del mes)
          const matrixSheetName = wb.SheetNames.find(s => s.toUpperCase().includes(targetMonthName)) || wb.SheetNames[0];
          const sheet = wb.Sheets[matrixSheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Buscar fila de cabecera que contiene "HÁBITO" o "HABITO"
          let habitRowIdx = -1;
          let habitColIdx = -1;

          for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
              const val = String(row[c] || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
              if (val === 'HABITO') {
                habitRowIdx = r;
                habitColIdx = c;
              }
            }
          }

          if (habitRowIdx === -1) {
            throw new Error('No se encontró la columna "HÁBITO" en la hoja.');
          }

          // Las columnas de días empiezan 2 columnas después de HÁBITO (después de % MES)
          let daysStartCol = habitColIdx + 2;

          // Extraer hábitos y casillas marcadas
          const newHabits = [];
          const newMatrix = {};

          for (let r = habitRowIdx + 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || !row[habitColIdx]) continue;
            const habitName = String(row[habitColIdx]).trim();

            // Si llegamos a la fila de totales o dashboards, detener extracción de hábitos
            const normName = habitName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            if (normName.startsWith('TOTAL') || normName.startsWith('RESUMEN') || habitName === 'Σ') {
              break;
            }

            const checks = new Array(targetDays).fill(false);
            for (let d = 0; d < targetDays; d++) {
              const val = row[daysStartCol + d];
              if (val !== undefined && val !== null) {
                const s = String(val).trim().toLowerCase();
                if (s === '✓' || s === '✔' || s === '1' || val === 1 || s === 'x' || s === 'si' || s === 'true') {
                  checks[d] = true;
                }
              }
            }

            const hIdx = newHabits.length;
            newHabits.push(habitName);
            newMatrix[`habit_${hIdx}`] = checks;
          }

          if (newHabits.length === 0) {
            throw new Error('No se encontraron filas de hábitos válidas para importar.');
          }

          // Si hay hojas adicionales de Tareas u Objetivos, intentar extraerlas
          const tasksSheetName = wb.SheetNames.find(s => s.toUpperCase().includes('TAREAS') || s.toUpperCase().includes('METAS'));
          if (tasksSheetName) {
            const tRows = XLSX.utils.sheet_to_json(wb.Sheets[tasksSheetName], { header: 1 });
            const importedWeekly = [];
            const importedGoals = [];

            for (let r = 1; r < tRows.length; r++) {
              const row = tRows[r];
              if (!row || row.length < 3) continue;
              const type = String(row[0] || '').toLowerCase();
              const scope = String(row[1] || '');
              const desc = String(row[2] || '').trim();
              const isDone = String(row[3] || '').toUpperCase().includes('COMPLET') || String(row[3] || '').includes('✓');

              if (type.includes('semanal') || scope.includes('Semana')) {
                const weekNum = parseInt(scope.replace(/\D/g, ''), 10) || 1;
                importedWeekly.push({ id: 'w_' + Date.now() + '_' + r, title: desc, done: isDone, week: weekNum });
              } else if (type.includes('mensual') || type.includes('objetivo')) {
                importedGoals.push({ id: 'g_' + Date.now() + '_' + r, title: desc, done: isDone });
              }
            }

            if (importedWeekly.length > 0) monthData.weeklyTasks = importedWeekly;
            if (importedGoals.length > 0) monthData.monthlyGoals = importedGoals;
          }

          // Asignar los nuevos datos al mes correspondiente
          monthData.habits = newHabits;
          monthData.matrix = newMatrix;

          saveState();
          renderAll();
          launchConfetti();
          playLevelUpFanfare();

          await showCustomAlert({
            title: '¡Importación Exitosa!',
            icon: '📊',
            message: `Se importaron correctamente <strong>${newHabits.length} hábitos</strong> y sus marcas para el mes de <strong>${targetMonthName}</strong> desde tu archivo.`,
            buttonText: '¡Genial!'
          });

        } catch (err) {
          console.error('Error al importar Excel/CSV:', err);
          showCustomAlert({
            title: 'Error de Importación',
            icon: '⚠️',
            message: `No se pudo procesar el archivo: ${err.message || 'Formato no reconocido'}. Asegúrate de que sea un archivo de hábitos exportado por la app o con columnas válidas.`,
            buttonText: 'Cerrar'
          });
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    showCustomAlert({
      title: 'Formato no soportado',
      icon: '⚠️',
      message: 'Por favor selecciona un archivo con extensión <strong>.xlsx, .xls, .csv o .json</strong>.',
      buttonText: 'Entendido'
    });
  }

  // =========================================================================
  // LISTENERS Y EVENTOS GLOBALES
  // =========================================================================

  function setupGlobalEvents() {
    // Manejo de Modales Dinámicos
    const dynamicOverlay = document.getElementById('dynamicModalOverlay');
    const dynamicConfirmBtn = document.getElementById('dynamicModalConfirmBtn');
    const dynamicCancelBtn = document.getElementById('dynamicModalCancelBtn');
    const dynamicCloseBtn = document.getElementById('dynamicModalCloseBtn');
    const dynamicInput = document.getElementById('dynamicModalInput');
    const dynamicInputWrap = document.getElementById('dynamicModalInputWrap');

    if (dynamicConfirmBtn) {
      dynamicConfirmBtn.addEventListener('click', () => {
        if (!dynamicInputWrap.classList.contains('hidden')) {
          closeCustomModal(dynamicInput.value.trim());
        } else {
          closeCustomModal(true);
        }
      });
    }

    if (dynamicCancelBtn) {
      dynamicCancelBtn.addEventListener('click', () => closeCustomModal(null));
    }

    if (dynamicCloseBtn) {
      dynamicCloseBtn.addEventListener('click', () => closeCustomModal(null));
    }

    if (dynamicOverlay) {
      dynamicOverlay.addEventListener('click', (e) => {
        if (e.target === dynamicOverlay) closeCustomModal(null);
      });
    }

    if (dynamicInput) {
      dynamicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          closeCustomModal(dynamicInput.value.trim());
        } else if (e.key === 'Escape') {
          closeCustomModal(null);
        }
      });
    }

    // Selector rápido de emojis en modal
    const emojiChips = document.querySelectorAll('#dynamicModalEmojiPalette .emoji-chip');
    emojiChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const emoji = chip.dataset.emoji || chip.textContent;
        if (dynamicInput) {
          dynamicInput.value = `${dynamicInput.value.trim()} ${emoji}`.trim();
          dynamicInput.focus();
        }
      });
    });

    // 1. Agregar nuevo hábito
    const btnAddHabit = document.getElementById('btnAddHabit');
    if (btnAddHabit) {
      btnAddHabit.addEventListener('click', async () => {
        const name = await showCustomPrompt({
          title: 'Nuevo Hábito a Seguir',
          icon: '🕹️',
          message: 'Escribe el nombre de tu hábito y selecciona un emoji representativo:',
          defaultValue: '',
          placeholder: 'Ej: Meditar 15 min 🧘',
          showEmojis: true
        });
        if (name && name.trim() !== '') {
          const monthData = getCurrentMonthData();
          const monthConfig = MONTHS_CONFIG[currentMonthIndex];
          const newIdx = monthData.habits.length;
          monthData.habits.push(name.trim());
          monthData.matrix[`habit_${newIdx}`] = new Array(monthConfig.days).fill(false);
          saveState();
          renderAll();
          playArcadeCheckSound();
        }
      });
    }

    // 2. Agregar Tarea Semanal
    const btnAddWeeklyTask = document.getElementById('btnAddWeeklyTask');
    if (btnAddWeeklyTask) {
      btnAddWeeklyTask.addEventListener('click', async () => {
        const filterSelect = document.getElementById('weeklyFilterSelect');
        const week = filterSelect && filterSelect.value !== 'ALL' ? parseInt(filterSelect.value, 10) : 1;
        const title = await showCustomPrompt({
          title: `Nueva Tarea Semanal (Semana ${week})`,
          icon: '📋',
          message: 'Describe el compromiso o tarea importante para esta semana:',
          defaultValue: '',
          placeholder: 'Ej: Organizar la agenda semanal 📅',
          showEmojis: true
        });
        if (title && title.trim() !== '') {
          const monthData = getCurrentMonthData();
          monthData.weeklyTasks.push({
            id: 'w_' + Date.now(),
            title: title.trim(),
            done: false,
            week: week
          });
          saveState();
          renderWeeklyTasks(monthData);
        }
      });
    }

    // 3. Agregar Objetivo Mensual
    const btnAddMonthlyGoal = document.getElementById('btnAddMonthlyGoal');
    if (btnAddMonthlyGoal) {
      btnAddMonthlyGoal.addEventListener('click', async () => {
        const title = await showCustomPrompt({
          title: 'Nuevo Objetivo del Mes',
          icon: '🎯',
          message: 'Define una gran meta a alcanzar durante este mes:',
          defaultValue: '',
          placeholder: 'Ej: Ahorrar un 20% de los ingresos 💰',
          showEmojis: true
        });
        if (title && title.trim() !== '') {
          const monthData = getCurrentMonthData();
          monthData.monthlyGoals.push({
            id: 'g_' + Date.now(),
            title: title.trim(),
            done: false
          });
          saveState();
          renderMonthlyGoals(monthData);
        }
      });
    }

    // 4. Filtro de semana
    const weeklyFilter = document.getElementById('weeklyFilterSelect');
    if (weeklyFilter) {
      weeklyFilter.addEventListener('change', () => {
        renderWeeklyTasks(getCurrentMonthData());
      });
    }

    // 5. Botón Sonido
    const btnSound = document.getElementById('btnSoundToggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btnSound.textContent = soundEnabled ? '🔊 Sonido' : '🔇 Silenciado';
        btnSound.classList.toggle('btn-secondary', soundEnabled);
        btnSound.classList.toggle('btn-outline', !soundEnabled);
      });
    }

    // 6. Exportar e Importar Datos (Modal con Excel, CSV y JSON)
    const btnExport = document.getElementById('btnExportData');
    const btnImportHeader = document.getElementById('btnImportHeader');
    const modalExport = document.getElementById('modalExport');
    const btnCloseExport = document.getElementById('btnCloseExport');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnExportJSON = document.getElementById('btnExportJSON');
    const fileInputImport = document.getElementById('universalFileInput') || document.getElementById('importJsonFileInput');

    // Botón Importar directo en la cabecera
    if (btnImportHeader && fileInputImport) {
      btnImportHeader.addEventListener('click', () => {
        fileInputImport.click();
      });
    }

    if (btnExport && modalExport) {
      btnExport.addEventListener('click', () => {
        modalExport.classList.remove('hidden');
      });
    }

    if (btnCloseExport && modalExport) {
      btnCloseExport.addEventListener('click', () => {
        modalExport.classList.add('hidden');
      });
      modalExport.addEventListener('click', (e) => {
        if (e.target === modalExport) modalExport.classList.add('hidden');
      });
    }

    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', () => {
        if (modalExport) modalExport.classList.add('hidden');
        exportToExcel();
      });
    }

    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => {
        if (modalExport) modalExport.classList.add('hidden');
        exportToCSV();
      });
    }

    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => {
        if (modalExport) modalExport.classList.add('hidden');
        exportToJSON();
      });
    }

    if (fileInputImport) {
      fileInputImport.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (modalExport) modalExport.classList.add('hidden');
          handleUniversalFileImport(file);
        }
        fileInputImport.value = '';
      });
    }

    // 7. Restablecer datos del mes
    const btnReset = document.getElementById('btnResetData');
    if (btnReset) {
      btnReset.addEventListener('click', async () => {
        const monthName = MONTHS_CONFIG[currentMonthIndex].name;
        const confirmed = await showCustomConfirm({
          title: `¿Reiniciar ${monthName}?`,
          icon: '🔄',
          message: `¿Deseas desmarcar todas las casillas de hábitos correspondientes a <strong>${monthName}</strong>?<br><span style="color: #94a3b8; font-size: 0.8rem;">Los nombres de hábitos se conservarán, pero las marcas volverán a cero.</span>`,
          confirmText: 'Sí, Reiniciar Mes',
          cancelText: 'Cancelar',
          isDanger: true
        });
        if (confirmed) {
          const monthData = getCurrentMonthData();
          const days = MONTHS_CONFIG[currentMonthIndex].days;
          monthData.habits.forEach((_, idx) => {
            monthData.matrix[`habit_${idx}`] = new Array(days).fill(false);
          });
          saveState();
          renderAll();
        }
      });
    }

    // 8. Pestañas de Navegación por Meses
    const tabButtons = document.querySelectorAll('.bottom-sheet-tabs .tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const tabType = btn.dataset.tab;
        if (tabType === 'INSTRUCTIONS') {
          const modal = document.getElementById('modalInstructions');
          if (modal) modal.classList.remove('hidden');
          return;
        }

        if (tabType === 'GOALS_TRACKER') {
          await showCustomAlert({
            title: 'SEGUIMIENTO DE OBJETIVOS',
            icon: '🎯',
            message: `Para maximizar tus resultados:<br><br>
              • <strong>Enfócate en la consistencia:</strong> Mantén el porcentaje global del mes por encima del <strong>80%</strong>.<br>
              • <strong>Gana bonus XP:</strong> Completa el 100% de tus hábitos en los días clave para avanzar de rango.<br>
              • <strong>Revisa tus metas:</strong> Mantén al día tus 3 objetivos mensuales en el panel inferior derecho.`,
            buttonText: '¡A por ello!'
          });
          return;
        }

        const monthName = btn.textContent.trim();
        const foundIdx = MONTHS_CONFIG.findIndex(m => m.name === monthName);
        if (foundIdx !== -1) {
          currentMonthIndex = foundIdx;
          renderAll();
        }
      });
    });

    // 9. Cerrar Modal Instrucciones
    const btnCloseInst = document.getElementById('btnCloseInstructions');
    const modalInst = document.getElementById('modalInstructions');
    if (btnCloseInst && modalInst) {
      btnCloseInst.addEventListener('click', () => modalInst.classList.add('hidden'));
      modalInst.addEventListener('click', (e) => {
        if (e.target === modalInst) modalInst.classList.add('hidden');
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Inicialización al cargar la página
  window.addEventListener('DOMContentLoaded', () => {
    setupGlobalEvents();
    renderAll();
  });

})();
