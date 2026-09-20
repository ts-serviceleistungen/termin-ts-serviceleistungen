const { createClient } = window.supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
const CUSTOMER_FUNCTION_URL = `${window.SUPABASE_URL}/functions/v1/notify-customer`;
const CONFIRM_FUNCTION_URL = `${window.SUPABASE_URL}/functions/v1/confirm-appointment`;

const loginEl = document.getElementById('login');
const dashEl = document.getElementById('dash');
const loginForm = document.getElementById('loginForm');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const loginMsg = document.getElementById('loginMsg');
const logoutBtn = document.getElementById('logout');
const refreshBtn = document.getElementById('refresh');
const listEl = document.getElementById('list');
const userEl = document.getElementById('user');
const newEl = document.getElementById('newc');
const openEl = document.getElementById('open');
const todayEl = document.getElementById('today');
const filterCountEl = document.getElementById('filterCount');
const searchFilter = document.getElementById('searchFilter');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const calendarEl = document.getElementById('calendar');
const calendarTitleEl = document.getElementById('calendarTitle');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const modal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailActions = document.getElementById('detailActions');
const closeModal = document.getElementById('closeModal');
const appointmentOverview = document.getElementById('appointmentOverview');
const appointmentTitleEl = document.getElementById('appointmentTitle');
const appointmentSummaryEl = document.getElementById('appointmentSummary');
const appointmentTodayBtn = document.getElementById('appointmentToday');
const appointmentPrevBtn = document.getElementById('appointmentPrev');
const appointmentNextBtn = document.getElementById('appointmentNext');
const appointmentViewButtons = document.querySelectorAll('.appt-view');
let appointmentDate = new Date();
let appointmentView = 'day';

let requests = [];
let selectedRequest = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('de-DE');
}

function showLoginMessage(message) {
  loginMsg.textContent = message;
  loginMsg.classList.remove('hidden');
}

function normalizeStatus(status) {
  return status || 'Neue Anfrage';
}

function getFilteredRequests() {
  const search = searchFilter.value.trim().toLowerCase();
  const status = statusFilter.value;
  const date = dateFilter.value;

  return requests.filter((r) => {
    if (status && normalizeStatus(r.status) !== status) return false;
    if (date && r.requested_date !== date) return false;
    if (!search) return true;

    const haystack = [
      r.first_name,
      r.last_name,
      r.phone,
      r.email,
      r.vehicle_type,
      r.make,
      r.model,
      r.color,
      r.plate,
      r.service_type,
      r.status,
      r.details,
      r.message
    ].join(' ').toLowerCase();

    return haystack.includes(search);
  });
}

function renderRequests() {
  const filtered = getFilteredRequests();
  filterCountEl.textContent = `${filtered.length} von ${requests.length}`;

  if (!filtered.length) {
    listEl.innerHTML = '<p>Keine passenden Anfragen vorhanden.</p>';
    return;
  }

  listEl.innerHTML = filtered.map((x) => `
    <div class="row request-row">
      <div>
        <b>${escapeHtml(x.first_name)} ${escapeHtml(x.last_name)}</b>
        <small>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</small>
      </div>
      <div>
        <b>${escapeHtml(x.make)} ${escapeHtml(x.model)}</b>
        <small>${escapeHtml(x.vehicle_type)} · ${escapeHtml(x.color)}</small>
      </div>
      <div>
        <b>${escapeHtml(x.service_type)}</b>
        <small>${formatDate(x.requested_date)} · ${escapeHtml(x.requested_time || '—')}</small>
      </div>
      <div>
        <span class="badge status-${escapeHtml(normalizeStatus(x.status).replaceAll(' ', '-'))}">${escapeHtml(normalizeStatus(x.status))}</span><br>
        <button data-action="details" data-id="${x.id}">Details</button>
        <button data-action="confirm" data-id="${x.id}">Bestätigen</button>
        <button data-action="alternative" data-id="${x.id}">Alternative</button>
        <button data-action="reject" data-id="${x.id}">Ablehnen</button>
      </div>
    </div>
  `).join('');
}

function renderCalendar() {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  calendarTitleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const today = new Date().toLocaleDateString('sv-SE');
  const names = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const counts = {};

  requests.forEach((r) => {
    if (r.requested_date) counts[r.requested_date] = (counts[r.requested_date] || 0) + 1;
  });

  let html = names.map((name) => `<div class="calendar-weekday">${name}</div>`).join('');

  for (let i = 0; i < mondayIndex; i++) html += '<div class="calendar-day empty"></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = counts[key] || 0;
    const classes = ['calendar-day'];
    if (key === today) classes.push('today');
    if (key === dateFilter.value) classes.push('selected');
    html += `
      <button type="button" class="${classes.join(' ')}" data-calendar-date="${key}">
        <span>${day}</span>
        ${count ? `<b>${count}</b>` : ''}
      </button>
    `;
  }

  const totalCells = mondayIndex + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) html += '<div class="calendar-day empty"></div>';

  calendarEl.innerHTML = html;
}


function appointmentDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function appointmentDateFromKey(value) {
  if (!value) return new Date();
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const monday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - monday);
  return d;
}

function isAppointmentVisible(r) {
  return !!r.requested_date && normalizeStatus(r.status) !== 'Abgelehnt';
}

function sortedAppointments(items) {
  return items.slice().sort((a, b) => {
    const ad = `${a.requested_date || ''} ${a.requested_time || '99:99'}`;
    const bd = `${b.requested_date || ''} ${b.requested_time || '99:99'}`;
    return ad.localeCompare(bd) || String(a.last_name || '').localeCompare(String(b.last_name || ''));
  });
}

function appointmentCard(r, showDate = true) {
  const status = normalizeStatus(r.status);
  const dateText = formatDate(r.requested_date);
  const timeText = r.requested_time || 'Keine Uhrzeit';
  const vehicle = [r.make, r.model].filter(Boolean).join(' ') || r.vehicle_type || 'Fahrzeug';
  return `
    <div class="appointment-card">
      <div class="appointment-time">
        <b>${escapeHtml(timeText)}</b>
        ${showDate ? `<small>${escapeHtml(dateText)}</small>` : ''}
      </div>
      <div class="appointment-main">
        <b>${escapeHtml(`${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unbekannter Kunde')}</b>
        <span>${escapeHtml(vehicle)} · ${escapeHtml(r.service_type || 'Leistung')}</span>
        <small>${escapeHtml(r.phone || '')} ${r.plate ? `· ${escapeHtml(r.plate)}` : ''}</small>
      </div>
      <div class="appointment-actions">
        <span class="badge status-${escapeHtml(status.replaceAll(' ', '-'))}">${escapeHtml(status)}</span>
        <button type="button" data-appt-action="details" data-id="${r.id}">Details</button>
        <button type="button" data-appt-action="move" data-id="${r.id}">Termin ändern</button>
        ${status !== 'Abgeschlossen' ? `<button type="button" data-appt-action="complete" data-id="${r.id}">Erledigt</button>` : ''}
      </div>
    </div>`;
}

function renderAppointments() {
  if (!appointmentOverview) return;
  const all = sortedAppointments(requests.filter(isAppointmentVisible));
  appointmentSummaryEl.textContent = `${all.length} Termine mit Datum`;

  let title = '';
  let visible = [];
  let showDate = true;

  if (appointmentView === 'day') {
    const key = appointmentDateKey(appointmentDate);
    title = appointmentDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    visible = all.filter(r => r.requested_date === key);
    showDate = false;
  } else if (appointmentView === 'week') {
    const start = startOfWeek(appointmentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    title = `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} – ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    const startKey = appointmentDateKey(start), endKey = appointmentDateKey(end);
    visible = all.filter(r => r.requested_date >= startKey && r.requested_date <= endKey);
  } else {
    title = appointmentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    const monthKey = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, '0')}`;
    visible = all.filter(r => String(r.requested_date || '').startsWith(monthKey));
  }

  appointmentTitleEl.textContent = title.charAt(0).toUpperCase() + title.slice(1);

  if (appointmentView === 'month') {
    if (!visible.length) {
      appointmentOverview.innerHTML = '<div class="appointment-empty">Keine Termine in diesem Zeitraum.</div>';
      return;
    }
    const grouped = {};
    visible.forEach(r => { (grouped[r.requested_date] ||= []).push(r); });
    appointmentOverview.innerHTML = Object.keys(grouped).sort().map(key => `
      <div class="appointment-day-group">
        <h3>${escapeHtml(formatDate(key))}</h3>
        ${sortedAppointments(grouped[key]).map(r => appointmentCard(r, false)).join('')}
      </div>`).join('');
  } else if (appointmentView === 'day') {
    renderDayTimeline(visible);
  } else {
    if (!visible.length) {
      appointmentOverview.innerHTML = '<div class="appointment-empty">Keine Termine in diesem Zeitraum.</div>';
      return;
    }
    appointmentOverview.innerHTML = visible.map(r => appointmentCard(r, showDate)).join('');
  }
}

function renderDayTimeline(items) {
  const sorted = sortedAppointments(items);
  const withTime = sorted.filter(r => /^\d{2}:\d{2}$/.test(r.requested_time || ''));
  const withoutTime = sorted.filter(r => !/^\d{2}:\d{2}$/.test(r.requested_time || ''));
  const startHour = 7;
  const endHour = 20;
  const byHour = {};
  withTime.forEach(r => {
    const hour = Number(r.requested_time.slice(0, 2));
    const minute = Number(r.requested_time.slice(3, 5));
    const key = `${String(hour).padStart(2, '0')}:00`;
    (byHour[key] ||= []).push(r);
    r.__minute = minute;
  });

  let html = '';
  for (let hour = startHour; hour <= endHour; hour++) {
    const key = `${String(hour).padStart(2, '0')}:00`;
    const entries = byHour[key] || [];
    html += `
      <div class="day-slot ${entries.length ? 'has-appointments' : ''}">
        <div class="day-slot-time">${key}</div>
        <div class="day-slot-content">
          ${entries.length ? entries.sort((a,b) => (a.__minute || 0) - (b.__minute || 0)).map(r => appointmentCard(r, false)).join('') : '<span class="day-slot-empty">frei</span>'}
        </div>
      </div>`;
  }

  if (withoutTime.length) {
    html += `
      <div class="day-slot has-appointments no-time">
        <div class="day-slot-time">—</div>
        <div class="day-slot-content">
          <div class="day-slot-label">Termine ohne Uhrzeit</div>
          ${withoutTime.map(r => appointmentCard(r, false)).join('')}
        </div>
      </div>`;
  }

  appointmentOverview.innerHTML = html || '<div class="appointment-empty">Keine Termine für diesen Tag.</div>';
}

async function moveAppointment(id) {
  const r = requests.find(x => x.id === id);
  if (!r) return;
  const date = prompt('Neues Datum (TT.MM.JJJJ oder JJJJ-MM-TT):', formatDate(r.requested_date));
  if (date === null) return;
  const normalized = /^\d{2}\.\d{2}\.\d{4}$/.test(date)
    ? `${date.slice(6)}-${date.slice(3,5)}-${date.slice(0,2)}`
    : date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    alert('Bitte ein gültiges Datum eingeben.');
    return;
  }
  const time = prompt('Neue Uhrzeit (z. B. 09:30):', r.requested_time || '');
  if (time === null) return;
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    alert('Bitte die Uhrzeit im Format HH:MM eingeben.');
    return;
  }
  const ok = await updateRequest(id, { requested_date: normalized, requested_time: time || r.requested_time }, null);
  if (ok) {
    alert('Termin wurde geändert.');
    renderAppointments();
  }
}

async function completeAppointment(id) {
  if (!confirm('Soll dieser Termin als erledigt markiert werden?')) return;
  await updateRequest(id, { status: 'Abgeschlossen' }, null);
  renderAppointments();
}

function shiftAppointmentPeriod(direction) {
  if (appointmentView === 'day') appointmentDate.setDate(appointmentDate.getDate() + direction);
  else if (appointmentView === 'week') appointmentDate.setDate(appointmentDate.getDate() + direction * 7);
  else appointmentDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth() + direction, 1);
  renderAppointments();
}

async function init() {
  const { data, error } = await db.auth.getSession();
  if (error) {
    showLoginMessage(error.message);
    return;
  }

  const session = data.session;
  if (!session) {
    loginEl.classList.remove('hidden');
    dashEl.classList.add('hidden');
    return;
  }

  loginEl.classList.add('hidden');
  dashEl.classList.remove('hidden');
  userEl.textContent = session.user.email || '';
  await load();
}

async function load() {
  listEl.innerHTML = '<p>Aktualisiere Anfragen...</p>';

  const { data, error } = await db
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    listEl.innerHTML = `<p class="notice">Fehler beim Laden: ${escapeHtml(error.message)}</p>`;
    return;
  }

  requests = data || [];
  newEl.textContent = requests.filter((x) => normalizeStatus(x.status) === 'Neue Anfrage').length;
  openEl.textContent = requests.filter((x) => !['Abgelehnt', 'Abgeschlossen'].includes(normalizeStatus(x.status))).length;

  const today = new Date().toLocaleDateString('sv-SE');
  todayEl.textContent = requests.filter((x) => x.requested_date === today).length;

  renderRequests();
  renderCalendar();
  renderAppointments();
}

function field(label, value) {
  return `<div class="detail-field"><small>${escapeHtml(label)}</small><div>${escapeHtml(value || '—')}</div></div>`;
}

function arrayValue(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : '—';
}

async function openDetails(id) {
  selectedRequest = requests.find((x) => x.id === id);
  if (!selectedRequest) return;

  const x = selectedRequest;
  detailTitle.textContent = `${x.first_name || ''} ${x.last_name || ''}`.trim() || 'Anfrage';
  detailBody.innerHTML = `
    <div class="detail-grid">
      ${field('Status', normalizeStatus(x.status))}
      ${field('Leistung', x.service_type)}
      ${field('Wunschdatum', formatDate(x.requested_date))}
      ${field('Wunschzeit', x.requested_time)}
      ${field('Vorname', x.first_name)}
      ${field('Nachname', x.last_name)}
      ${field('Telefon', x.phone)}
      ${field('E-Mail', x.email)}
      ${field('Fahrzeugart', x.vehicle_type)}
      ${field('Hersteller', x.make)}
      ${field('Modell / Typ', x.model)}
      ${field('Farbe', x.color)}
      ${field('Baujahr', x.year)}
      ${field('Kennzeichen', x.plate)}
      ${field('Verschmutzungsgrad', x.dirt_level)}
      ${field('Tierhaare', x.pet_hair)}
      ${field('Menge', x.quantity)}
      ${field('Reifentyp', x.tire_type)}
      ${field('Gewünschte Leistungen', arrayValue(x.care_options))}
    </div>
    <div class="detail-text">${field('Details / Nachricht', x.details || x.message)}</div>
    <div id="photoGallery" class="photo-gallery"><p>Fotos werden geladen...</p></div>
  `;

  detailActions.innerHTML = `
    <button class="primary" data-modal-action="confirm">Termin bestätigen</button>
    <button data-modal-action="alternative">Alternativtermin</button>
    <button data-modal-action="reject">Anfrage ablehnen</button>
  `;

  modal.classList.remove('hidden');
  await loadRequestPhotos(x.id);
}

async function loadRequestPhotos(requestId) {
  const gallery = document.getElementById('photoGallery');
  if (!gallery) return;

  const { data, error } = await db
    .from('request_photos')
    .select('storage_path,created_at')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) {
    gallery.innerHTML = `<p class="notice">Fotos konnten nicht geladen werden: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || !data.length) {
    gallery.innerHTML = '<p>Keine Fotos vorhanden.</p>';
    return;
  }

  const items = [];
  for (const photo of data) {
    const { data: urlData, error: urlError } = await db.storage
      .from('vehicle-photos')
      .createSignedUrl(photo.storage_path, 3600);

    if (urlError || !urlData?.signedUrl) {
      items.push('<div class="photo-item"><p>Foto konnte nicht geladen werden.</p></div>');
    } else {
      const safeUrl = escapeHtml(urlData.signedUrl);
      items.push(`<a class="photo-item" href="${safeUrl}" target="_blank" rel="noopener"><img src="${safeUrl}" alt="Fahrzeugfoto" loading="lazy"></a>`);
    }
  }

  gallery.innerHTML = `<h3>Fahrzeugfotos</h3><div class="photo-grid">${items.join('')}</div>`;
}

function closeDetails() {
  modal.classList.add('hidden');
  selectedRequest = null;
}

async function sendCustomerEmail(r, status, extra = {}) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) throw new Error('Admin-Sitzung abgelaufen');

  const url = status === 'Bestätigt' ? CONFIRM_FUNCTION_URL : CUSTOMER_FUNCTION_URL;
  const body = status === 'Bestätigt' ? { request: r } : { request: r, status, ...extra };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(t || 'E-Mail konnte nicht gesendet werden');
  }

  return response.json();
}

async function updateRequest(id, changes, emailStatus) {
  const current = requests.find((x) => x.id === id);
  if (!current) return false;

  const { error } = await db.from('requests').update(changes).eq('id', id);
  if (error) {
    alert('Fehler: ' + error.message);
    return false;
  }

  const updated = { ...current, ...changes };
  if (emailStatus) {
    try {
      await sendCustomerEmail(updated, emailStatus, { old_status: current.status });
    } catch (err) {
      alert('Anfrage wurde gespeichert, aber die Kunden-E-Mail konnte nicht gesendet werden.\n\n' + err.message);
    }
  }

  await load();
  return true;
}

async function confirmRequest(id) {
  if (!confirm('Soll diese Terminanfrage als bestätigt markiert werden?')) return;
  await updateRequest(id, { status: 'Bestätigt' }, 'Bestätigt');
  closeDetails();
}

async function rejectRequest(id) {
  if (!confirm('Soll diese Anfrage wirklich abgelehnt werden?')) return;
  await updateRequest(id, { status: 'Abgelehnt' }, 'Abgelehnt');
  closeDetails();
}

async function alternativeRequest(id) {
  const r = requests.find((x) => x.id === id);
  if (!r) return;

  const date = prompt('Welches Alternativdatum möchtest du anbieten?', r.requested_date || '');
  if (date === null) return;

  const time = prompt('Welche Alternativzeit möchtest du anbieten?', r.requested_time || '');
  if (time === null) return;

  await updateRequest(
    id,
    {
      status: 'Alternativtermin',
      requested_date: date || r.requested_date,
      requested_time: time || r.requested_time
    },
    'Alternativtermin'
  );
  closeDetails();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMsg.classList.add('hidden');

  const { error } = await db.auth.signInWithPassword({
    email: emailEl.value.trim(),
    password: passwordEl.value
  });

  if (error) {
    showLoginMessage(error.message);
    return;
  }

  await 
appointmentTodayBtn.addEventListener('click', () => { appointmentDate = new Date(); renderAppointments(); });
appointmentPrevBtn.addEventListener('click', () => shiftAppointmentPeriod(-1));
appointmentNextBtn.addEventListener('click', () => shiftAppointmentPeriod(1));
appointmentViewButtons.forEach(btn => btn.addEventListener('click', () => {
  appointmentView = btn.dataset.view;
  appointmentViewButtons.forEach(x => x.classList.toggle('active', x === btn));
  renderAppointments();
}));
appointmentOverview.addEventListener('click', async (e) => {
  const button = e.target.closest('button[data-appt-action]');
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.apptAction;
  if (action === 'details') return openDetails(id);
  if (action === 'move') return moveAppointment(id);
  if (action === 'complete') return completeAppointment(id);
});

init();
});

listEl.addEventListener('click', async (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  if (action === 'details') return openDetails(id);
  if (action === 'confirm') return confirmRequest(id);
  if (action === 'reject') return rejectRequest(id);
  if (action === 'alternative') return alternativeRequest(id);
});

detailActions.addEventListener('click', async (e) => {
  const button = e.target.closest('button[data-modal-action]');
  if (!button || !selectedRequest) return;

  const action = button.dataset.modalAction;
  if (action === 'confirm') await confirmRequest(selectedRequest.id);
  if (action === 'reject') await rejectRequest(selectedRequest.id);
  if (action === 'alternative') await alternativeRequest(selectedRequest.id);
});

searchFilter.addEventListener('input', renderRequests);
statusFilter.addEventListener('change', renderRequests);
dateFilter.addEventListener('change', renderRequests);

clearFiltersBtn.addEventListener('click', () => {
  searchFilter.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
  renderRequests();
  renderCalendar();
});

calendarEl.addEventListener('click', (e) => {
  const button = e.target.closest('[data-calendar-date]');
  if (!button) return;
  dateFilter.value = button.dataset.calendarDate;
  renderRequests();
  renderCalendar();
  document.getElementById('list').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

prevMonthBtn.addEventListener('click', () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderCalendar();
});

closeModal.addEventListener('click', closeDetails);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeDetails();
});

logoutBtn.addEventListener('click', async () => {
  await db.auth.signOut();
  location.reload();
});

refreshBtn.addEventListener('click', load);

init();
