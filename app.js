(() => {
  'use strict';
  const KEY = 'workledger-labor-casebook-v1';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const seed = {
    payments: [
      { id: 'p-2024-11', period: '2024-11', gross: 1420000, net: 1138000, contract: 1420000, doc: 'd-contract', note: 'Liquidación recibida por correo' },
      { id: 'p-2024-12', period: '2024-12', gross: 1580000, net: 1262000, contract: 1420000, doc: 'd-dec', note: 'Incluye bono variable declarado' },
      { id: 'p-2025-01', period: '2025-01', gross: 1420000, net: 1138000, contract: 1420000, doc: 'd-jan', note: 'Liquidación sintética' },
      { id: 'p-2025-02', period: '2025-02', gross: 1350000, net: 1081000, contract: 1420000, doc: '', note: 'Dato de ejemplo sin documento asociado' },
      { id: 'p-2025-03', period: '2025-03', gross: 1420000, net: 1138000, contract: 1420000, doc: 'd-mar', note: 'Liquidación sintética' },
      { id: 'p-2025-04', period: '2025-04', gross: 1510000, net: 1206000, contract: 1420000, doc: 'd-apr', note: 'Incluye variable según ejemplo' }
    ],
    docs: [
      { id: 'd-contract', name: 'Contrato de trabajo · base mensual', type: 'Contrato / anexo', date: '2024-10-15', location: 'Referencia ficticia · demo' },
      { id: 'd-dec', name: 'Liquidación de remuneraciones · dic 2024', type: 'Liquidación', date: '2025-01-02', location: 'Referencia ficticia · demo' },
      { id: 'd-jan', name: 'Liquidación de remuneraciones · ene 2025', type: 'Liquidación', date: '2025-02-01', location: 'Referencia ficticia · demo' },
      { id: 'd-mar', name: 'Comprobante de transferencia · mar 2025', type: 'Comprobante bancario', date: '2025-04-01', location: 'Referencia ficticia · demo' },
      { id: 'd-apr', name: 'Correo de RR. HH. · variable abril', type: 'Correo / mensaje', date: '2025-04-28', location: 'Referencia ficticia · demo' }
    ],
    events: [
      { id: 'e-contract', title: 'Inicio de relación laboral (ejemplo)', date: '2024-10-15', type: 'Contrato', note: 'Fecha sintética, vinculada al contrato ficticio.' },
      { id: 'e-pay', title: 'Primer periodo de remuneraciones registrado', date: '2024-11-30', type: 'Pago', note: 'Comparación basada en los datos de demostración.' },
      { id: 'e-message', title: 'Comunicación sobre componente variable', date: '2025-04-28', type: 'Comunicación', note: 'Evento de ejemplo; requiere validar el documento fuente.' }
    ]
  };
  const readState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (parsed && Array.isArray(parsed.payments) && Array.isArray(parsed.docs) && Array.isArray(parsed.events)) return parsed;
    } catch (error) { console.warn('No se pudo leer el expediente guardado; se carga el ejemplo.', error); }
    return clone(seed);
  };
  let state = readState();
  let toastTimer;
  const $ = (selector) => document.querySelector(selector);
  const money = (value) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const periodLabel = (value) => {
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CL', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '');
  };
  const dateLabel = (value) => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)).replace('.', '');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { toast('No se pudo guardar: revisa el almacenamiento del navegador.'); }
  }
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function render() {
    renderStats(); renderChart(); renderPayments(); renderDocs(); renderEvents(); renderDocOptions();
  }
  function renderStats() {
    const gross = state.payments.reduce((sum, row) => sum + Number(row.gross || 0), 0);
    const net = state.payments.reduce((sum, row) => sum + Number(row.net || 0), 0);
    const comparable = state.payments.filter((row) => Number(row.contract) > 0);
    const variance = comparable.reduce((sum, row) => sum + Number(row.contract) - Number(row.gross), 0);
    const supported = state.payments.filter((row) => state.docs.some((doc) => doc.id === row.doc)).length;
    $('#gross-total').textContent = money(gross); $('#net-total').textContent = money(net);
    $('#variance-total').textContent = `${variance > 0 ? '+' : variance < 0 ? '−' : ''}${money(Math.abs(variance))}`;
    $('#supported-count').textContent = `${supported} / ${state.payments.length}`;
    $('#coverage-label').textContent = state.payments.length ? `${Math.round((supported / state.payments.length) * 100)}% con respaldo asociado` : 'Sin periodos registrados';
    $('#coverage-bar').style.width = `${state.payments.length ? Math.round((supported / state.payments.length) * 100) : 0}%`;
    $('#doc-nav-count').textContent = state.docs.length;
  }
  function renderChart() {
    const filter = $('#period-filter').value;
    const rows = [...state.payments].filter((row) => filter === 'all' || row.period.startsWith(filter)).sort((a, b) => a.period.localeCompare(b.period)).slice(-12);
    const chart = $('#salary-chart');
    if (!rows.length) { chart.innerHTML = '<div class="empty-state">No hay periodos para este filtro.</div>'; return; }
    const max = Math.max(2000000, ...rows.map((row) => Math.max(Number(row.gross) || 0, Number(row.contract) || 0)));
    chart.innerHTML = rows.map((row) => {
      const gross = Math.max(0, Number(row.gross) || 0), contract = Math.max(0, Number(row.contract) || 0);
      return `<div class="bar-group" aria-label="${escapeHtml(periodLabel(row.period))}: bruto ${money(gross)}, contrato ref. ${money(contract)}"><div class="bar-pair"><i class="bar gross" style="height:${Math.max(1, gross / max * 100)}%" data-tip="Bruto: ${money(gross)}"></i><i class="bar contract" style="height:${Math.max(1, contract / max * 100)}%" data-tip="Contrato ref.: ${money(contract)}"></i></div><span class="month">${escapeHtml(periodLabel(row.period))}</span></div>`;
    }).join('');
    $('#chart-caption-text').textContent = `Mostrando ${rows.length} periodo(s). Comparación descriptiva, no determina conceptos adeudados.`;
  }
  function renderPayments() {
    const rows = [...state.payments].sort((a, b) => b.period.localeCompare(a.period));
    $('#payments-body').innerHTML = rows.length ? rows.map((row) => {
      const diff = Number(row.contract || 0) - Number(row.gross || 0);
      const doc = state.docs.find((item) => item.id === row.doc);
      return `<tr><td class="period-name">${escapeHtml(periodLabel(row.period))}</td><td class="money">${money(row.gross)}</td><td>${money(row.net)}</td><td>${row.contract ? money(row.contract) : '—'}</td><td class="${diff > 0 ? 'variance-positive' : 'variance-zero'}">${row.contract ? `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${money(Math.abs(diff))}` : '—'}</td><td><span class="file-chip ${doc ? '' : 'missing'}">${doc ? '▤ ' + escapeHtml(doc.type) : '○ Sin respaldo'}</span></td><td><button class="row-menu" data-delete-payment="${escapeHtml(row.id)}" aria-label="Eliminar periodo ${escapeHtml(periodLabel(row.period))}">⋯</button></td></tr>`;
    }).join('') : '<tr><td colspan="7" class="empty-state">No hay periodos guardados. Añade el primero.</td></tr>';
  }
  function renderDocs() {
    const docs = [...state.docs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    $('#evidence-list').innerHTML = docs.length ? docs.map((doc) => `<div class="evidence-item"><div class="doc-icon">▤</div><div class="doc-info"><strong>${escapeHtml(doc.name)}</strong><small>${escapeHtml(doc.type)} · ${dateLabel(doc.date)}</small></div><span class="doc-state">Registrado</span></div>`).join('') : '<div class="empty-state">Sin antecedentes. Registra metadatos y ubicación privada.</div>';
  }
  function renderEvents() {
    const events = [...state.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    $('#timeline-list').innerHTML = events.length ? events.map((event) => `<div class="timeline-item"><strong>${escapeHtml(event.title)}</strong><small>${dateLabel(event.date)} · ${escapeHtml(event.type)}${event.note ? ` · ${escapeHtml(event.note)}` : ''}</small></div>`).join('') : '<div class="empty-state">Aún no hay eventos en la cronología.</div>';
  }
  function renderDocOptions() {
    $('#payment-doc').innerHTML = '<option value="">Sin documento asociado</option>' + state.docs.map((doc) => `<option value="${escapeHtml(doc.id)}">${escapeHtml(doc.name)}</option>`).join('');
  }
  function openDialog(id) { const dialog = document.getElementById(id); if (typeof dialog.showModal === 'function') dialog.showModal(); else toast('Tu navegador no permite abrir este formulario.'); }
  function closeDialogs() { document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close()); }
  function download(name, content, type) {
    const blob = new Blob([content], { type }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }
  function csvCell(value) {
    const text = String(value ?? '');
    return `"${(/^[\s]*[=+@\-]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
  }
  $('#add-payment-top').addEventListener('click', () => openDialog('entry-dialog'));
  $('#add-payment-table').addEventListener('click', () => openDialog('entry-dialog'));
  $('#add-doc').addEventListener('click', () => openDialog('doc-dialog'));
  $('#manage-docs').addEventListener('click', () => openDialog('doc-dialog'));
  $('#add-event').addEventListener('click', () => openDialog('event-dialog'));
  $('#more-events').addEventListener('click', () => toast(`Cronología: ${state.events.length} evento(s) guardados.`));
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeDialogs));
  $('#dismiss-notice').addEventListener('click', () => $('.notice').remove());
  $('#period-filter').addEventListener('change', renderChart);
  $('#payments-body').addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-payment]'); if (!button) return;
    if (window.confirm('¿Eliminar este periodo de los datos locales?')) { state.payments = state.payments.filter((row) => row.id !== button.dataset.deletePayment); persist(); render(); toast('Periodo eliminado del navegador.'); }
  });
  $('#entry-form').addEventListener('submit', (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const period = String(form.get('period'));
    if (state.payments.some((row) => row.period === period)) { toast('Ya existe un registro para ese periodo.'); return; }
    state.payments.push({ id: crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`, period, gross: Number(form.get('gross')), net: Number(form.get('net')), contract: Number(form.get('contract')) || 0, doc: String(form.get('doc') || ''), note: String(form.get('note') || '') });
    persist(); render(); event.currentTarget.reset(); closeDialogs(); toast('Periodo añadido al expediente local.');
  });
  $('#doc-form').addEventListener('submit', (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    state.docs.push({ id: crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}`, name: String(form.get('name')), type: String(form.get('type')), date: String(form.get('date')), location: String(form.get('location') || '') });
    persist(); render(); event.currentTarget.reset(); closeDialogs(); toast('Antecedente registrado; no se subió ningún archivo.');
  });
  $('#event-form').addEventListener('submit', (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    state.events.push({ id: crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`, title: String(form.get('title')), date: String(form.get('date')), type: String(form.get('type')), note: String(form.get('note') || '') });
    persist(); render(); event.currentTarget.reset(); closeDialogs(); toast('Evento añadido a la cronología local.');
  });
  $('#export-csv').addEventListener('click', () => {
    const lines = [['periodo', 'bruto_registrado_clp', 'liquido_pagado_clp', 'base_contrato_referencia_clp', 'diferencia_aritmetica_clp', 'antecedente_asociado', 'nota']];
    state.payments.slice().sort((a, b) => a.period.localeCompare(b.period)).forEach((row) => {
      const doc = state.docs.find((item) => item.id === row.doc);
      lines.push([row.period, row.gross, row.net, row.contract || '', row.contract ? Number(row.contract) - Number(row.gross) : '', doc ? doc.name : 'Sin respaldo asociado', row.note]);
    });
    download('workledger-periodos-demo.csv', '\ufeff' + lines.map((line) => line.map(csvCell).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  });
  $('#export-json').addEventListener('click', () => download('workledger-expediente-demo.json', JSON.stringify({ exportedAt: new Date().toISOString(), jurisdiction: 'Chile (referencias orientativas)', syntheticDemo: true, ...state }, null, 2), 'application/json;charset=utf-8'));
  render();
})();
