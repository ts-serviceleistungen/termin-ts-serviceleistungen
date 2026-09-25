const { createClient } = window.supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
const CUSTOMER_FUNCTION_URL=`${window.SUPABASE_URL}/functions/v1/notify-customer`;
const CONFIRM_FUNCTION_URL=`${window.SUPABASE_URL}/functions/v1/confirm-appointment`;

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
const dashboardHome = document.getElementById('dashboardHome');
const requestsView = document.getElementById('requestsView');
const receiptsView = document.getElementById('receiptsView');
const pageTitle = document.getElementById('pageTitle');
const dashNew = document.getElementById('dashNew');
const dashOpen = document.getElementById('dashOpen');
const dashToday = document.getElementById('dashToday');
const dashReceiptCount = document.getElementById('dashReceiptCount');
const dashYearGross = document.getElementById('dashYearGross');
const dashMonthGross = document.getElementById('dashMonthGross');
const dashInvoiceGross = document.getElementById('dashInvoiceGross');
const dashProfit = document.getElementById('dashProfit');

const INVOICE_TOTAL_URL = 'https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
const BELEG_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
const receiptForm = document.getElementById('receiptForm');
const receiptImage = document.getElementById('receiptImage');
const receiptDate = document.getElementById('receiptDate');
const receiptMerchant = document.getElementById('receiptMerchant');
const receiptNumber = document.getElementById('receiptNumber');
const receiptGross = document.getElementById('receiptGross');
const receiptCategory = document.getElementById('receiptCategory');
const receiptDescription = document.getElementById('receiptDescription');
const receiptPayment = document.getElementById('receiptPayment');
const receiptMsg = document.getElementById('receiptMsg');
const saveReceiptBtn = document.getElementById('saveReceiptBtn');
const ocrMsg = document.getElementById('ocrMsg');
const receiptList = document.getElementById('receiptList');

const modal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailActions = document.getElementById('detailActions');
const closeModal = document.getElementById('closeModal');

const filterCountEl = document.getElementById('filterCount');
const searchFilter = document.getElementById('searchFilter');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const calendarEl = document.getElementById('calendar');
const calendarTitleEl = document.getElementById('calendarTitle');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const appointmentOverview = document.getElementById('appointmentOverview');
const appointmentTitleEl = document.getElementById('appointmentTitle');
const appointmentSummaryEl = document.getElementById('appointmentSummary');
const appointmentTodayBtn = document.getElementById('appointmentToday');
const appointmentPrevBtn = document.getElementById('appointmentPrev');
const appointmentNextBtn = document.getElementById('appointmentNext');
const appointmentViewButtons = document.querySelectorAll('.appt-view');
const dashInvoiceMonth = document.getElementById('dashInvoiceMonth');
const dashProfitMonth = document.getElementById('dashProfitMonth');
const financialYearLabel = document.getElementById('financialYearLabel');
const financialMonthLabel = document.getElementById('financialMonthLabel');
const financialMonthlyTable = document.getElementById('financialMonthlyTable');
const RECHNUNGS_API_URL = 'https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
let appointmentDate = new Date();
let appointmentView = 'day';
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let requests=[];let selectedRequest=null;
let currentInvoiceTotal=null;
let currentReceiptTotal=null;

function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function formatDate(value){if(!value)return '—';const d=new Date(value+'T00:00:00');return Number.isNaN(d.getTime())?value:d.toLocaleDateString('de-DE')}
function showLoginMessage(message){loginMsg.textContent=message;loginMsg.classList.remove('hidden')}
async function init(){const {data,error}=await db.auth.getSession();if(error){showLoginMessage(error.message);return}const session=data.session;if(!session){loginEl.classList.remove('hidden');dashEl.classList.add('hidden');return}loginEl.classList.add('hidden');dashEl.classList.remove('hidden');userEl.textContent=session.user.email||'';showView('dashboard');await load();await loadReceipts();await loadFinancials()}
async function load(){
  listEl.innerHTML='<p>Aktualisiere Anfragen...</p>';
  const {data,error}=await db.from('requests').select('*').order('created_at',{ascending:false});
  if(error){
    listEl.innerHTML=`<p class="notice">Fehler beim Laden: ${escapeHtml(error.message)}</p>`;
    return;
  }
  requests=data||[];
  const newCount=requests.filter(x=>x.status==='Neue Anfrage').length;
  const openCount=requests.filter(x=>!['Abgelehnt','Abgeschlossen'].includes(x.status)).length;
  const today=new Date().toLocaleDateString('sv-SE');
  const todayCount=requests.filter(x=>x.requested_date===today).length;

  newEl.textContent=newCount;
  openEl.textContent=openCount;
  todayEl.textContent=todayCount;
  dashNew.textContent=newCount;
  dashOpen.textContent=openCount;
  dashToday.textContent=todayCount;

  if(!requests.length){
    listEl.innerHTML='<p>Keine Anfragen vorhanden.</p>';
    return;
  }

  listEl.innerHTML=requests.map(x=>`<div class="row request-row"><div><b>${escapeHtml(x.first_name)} ${escapeHtml(x.last_name)}</b><small>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</small></div><div><b>${escapeHtml(x.make)} ${escapeHtml(x.model)}</b><small>${escapeHtml(x.vehicle_type)} · ${escapeHtml(x.color)}</small></div><div><b>${escapeHtml(x.service_type)}</b><small>${formatDate(x.requested_date)} · ${escapeHtml(x.requested_time||'—')}</small></div><div><span class="badge">${escapeHtml(x.status||'Neue Anfrage')}</span><br><button data-action="details" data-id="${x.id}">Details</button><button data-action="confirm" data-id="${x.id}">Bestätigen</button><button data-action="alternative" data-id="${x.id}">Alternative</button><button data-action="reject" data-id="${x.id}">Ablehnen</button><button data-action="delete" data-id="${x.id}">Löschen</button></div></div>`).join('');
}
function field(label,value){return `<div class="detail-field"><small>${escapeHtml(label)}</small><div>${escapeHtml(value||'—')}</div></div>`}
function arrayValue(value){return Array.isArray(value)&&value.length?value.join(', '):'—'}
async function openDetails(id){selectedRequest=requests.find(x=>x.id===id);if(!selectedRequest)return;const x=selectedRequest;detailTitle.textContent=`${x.first_name||''} ${x.last_name||''}`.trim()||'Anfrage';detailBody.innerHTML=`<div class="detail-grid">${field('Status',x.status)}${field('Leistung',x.service_type)}${field('Wunschdatum',formatDate(x.requested_date))}${field('Wunschzeit',x.requested_time)}${field('Vorname',x.first_name)}${field('Nachname',x.last_name)}${field('Telefon',x.phone)}${field('E-Mail',x.email)}${field('Fahrzeugart',x.vehicle_type)}${field('Hersteller',x.make)}${field('Modell / Typ',x.model)}${field('Farbe',x.color)}${field('Baujahr',x.year)}${field('Kennzeichen',x.plate)}${field('Verschmutzungsgrad',x.dirt_level)}${field('Tierhaare',x.pet_hair)}${field('Menge',x.quantity)}${field('Reifentyp',x.tire_type)}${field('Gewünschte Leistungen',arrayValue(x.care_options))}</div><div class="detail-text">${field('Details / Nachricht',x.details||x.message)}</div><div id="photoGallery" class="photo-gallery"><p>Fotos werden geladen...</p></div>`;detailActions.innerHTML='<button class="primary" data-modal-action="confirm">Termin bestätigen</button><button data-modal-action="alternative">Alternativtermin</button><button data-modal-action="reject">Anfrage ablehnen</button><button data-modal-action="delete">Löschen</button>';modal.classList.remove('hidden');await loadRequestPhotos(x.id)}
async function loadRequestPhotos(requestId){const gallery=document.getElementById('photoGallery');if(!gallery)return;const {data,error}=await db.from('request_photos').select('storage_path,created_at').eq('request_id',requestId).order('created_at',{ascending:true});if(error){gallery.innerHTML=`<p class="notice">Fotos konnten nicht geladen werden: ${escapeHtml(error.message)}</p>`;return}if(!data||!data.length){gallery.innerHTML='<p>Keine Fotos vorhanden.</p>';return}const items=[];for(const photo of data){const {data:urlData,error:urlError}=await db.storage.from('vehicle-photos').createSignedUrl(photo.storage_path,3600);if(urlError||!urlData?.signedUrl){items.push(`<div class="photo-item"><p>Foto konnte nicht geladen werden.</p></div>`)}else{items.push(`<a class="photo-item" href="${escapeHtml(urlData.signedUrl)}" target="_blank" rel="noopener"><img src="${escapeHtml(urlData.signedUrl)}" alt="Fahrzeugfoto" loading="lazy"></a>`)}}gallery.innerHTML=`<h3>Fahrzeugfotos</h3><div class="photo-grid">${items.join('')}</div>`}
function closeDetails(){modal.classList.add('hidden');selectedRequest=null}
async function sendCustomerEmail(r,status,extra={}){const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Admin-Sitzung abgelaufen');const url=status==='Bestätigt'?CONFIRM_FUNCTION_URL:CUSTOMER_FUNCTION_URL;const body=status==='Bestätigt'?{request:r}:{request:r,status,...extra};const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify(body)});if(!response.ok){const t=await response.text();throw new Error(t||'E-Mail konnte nicht gesendet werden')}return response.json()}
async function syncCalendarForRequest(previous,updated){
  const customer=`${updated.first_name||''} ${updated.last_name||''}`.trim() || 'Kunde';
  const marker=`Kundentermin – ${customer} – ${updated.service_type||'Leistung'}`;
  const {error:delError}=await db.from('personal_calendar_events').delete().eq('title',marker);
  if(delError) throw new Error('Kalendereintrag konnte nicht bereinigt werden: '+delError.message);
  if(updated.status!=='Bestätigt' || !updated.requested_date || !updated.requested_time) return;
  const start=new Date(`${updated.requested_date}T${String(updated.requested_time).slice(0,8)}`);
  if(Number.isNaN(start.getTime())) throw new Error('Ungültiges Termin-Datum oder ungültige Uhrzeit.');
  let hours=2;
  const st=String(updated.service_type||'').toLowerCase();
  const opts=Array.isArray(updated.care_options)?updated.care_options.map(x=>String(x).toLowerCase()):[];
  if(st.includes('garten')) hours=Math.max(4,opts.length*4);
  else if(st.includes('fahrzeug')){
    let total=0; opts.forEach(o=>{if(o.includes('außenreinigung'))total+=2;else if(o.includes('innenraumreinigung'))total+=4;else if(o.includes('polsterreinigung'))total+=4;else if(o.includes('komplettaufbereitung'))total+=8;else if(o.includes('politur'))total+=8;else if(o.includes('lackversiegelung'))total+=8}); hours=total||2;
  }
  const end=new Date(start.getTime()+hours*3600000);
  const {error:insError}=await db.from('personal_calendar_events').insert({title:marker,event_type:st.includes('garten')?'garden':st.includes('fahrzeug')?'vehicle':'other',start_time:start.toISOString(),end_time:end.toISOString()});
  if(insError) throw new Error('Kalendereintrag konnte nicht erstellt werden: '+insError.message);
}

async function updateRequest(id,changes,emailStatus){const current=requests.find(x=>x.id===id);if(!current)return false;const {error}=await db.from('requests').update(changes).eq('id',id);if(error){alert('Fehler: '+error.message);return false}const updated={...current,...changes};try{await syncCalendarForRequest(current,updated)}catch(err){alert('Anfrage wurde gespeichert, aber der Kalender konnte nicht synchronisiert werden.\n\n'+err.message)}if(emailStatus){try{await sendCustomerEmail(updated,emailStatus,{old_status:current.status})}catch(err){alert('Anfrage wurde gespeichert, aber die Kunden-E-Mail konnte nicht gesendet werden.\n\n'+err.message)}}await load();return true}
async function confirmRequest(id){if(!confirm('Soll diese Terminanfrage als bestätigt markiert werden?'))return;await updateRequest(id,{status:'Bestätigt'},'Bestätigt');closeDetails()}
async function rejectRequest(id){if(!confirm('Soll diese Anfrage wirklich abgelehnt werden?'))return;await updateRequest(id,{status:'Abgelehnt'},'Abgelehnt');closeDetails()}
async function alternativeRequest(id){const r=requests.find(x=>x.id===id);if(!r)return;const date=prompt('Welches Alternativdatum möchtest du anbieten?',r.requested_date||'');if(date===null)return;const time=prompt('Welche Alternativzeit möchtest du anbieten?',r.requested_time||'');if(time===null)return;await updateRequest(id,{status:'Alternativtermin',requested_date:date||r.requested_date,requested_time:time||r.requested_time},'Alternativtermin');closeDetails()}
async function deleteRequest(id){
  const r=requests.find(x=>x.id===id);
  if(!r)return;
  const name=`${r.first_name||''} ${r.last_name||''}`.trim()||'diese Anfrage';
  if(!confirm(`Möchtest du die Terminanfrage von ${name} wirklich löschen?\n\nDie Anfrage wird dauerhaft aus der Datenbank entfernt.`))return;

  try{
    // Zugehörige Fotodatensätze ermitteln und aus dem Storage entfernen.
    const {data:photos,error:photoLoadError}=await db.from('request_photos').select('storage_path').eq('request_id',id);
    if(photoLoadError)throw photoLoadError;

    if(photos?.length){
      const paths=photos.map(p=>p.storage_path).filter(Boolean);
      if(paths.length){
        const {error:storageError}=await db.storage.from('vehicle-photos').remove(paths);
        // Falls für den Storage noch keine DELETE-Policy vorhanden ist,
        // darf das Löschen der Anfrage trotzdem nicht blockiert werden.
        if(storageError)console.warn('Fahrzeugfotos konnten nicht aus dem Storage gelöscht werden:',storageError.message);
      }
    }

    const {error:photosError}=await db.from('request_photos').delete().eq('request_id',id);
    if(photosError)throw photosError;

    const {error}=await db.from('requests').delete().eq('id',id);
    if(error)throw error;

    closeDetails();
    await load();
  }catch(err){
    alert('Die Anfrage konnte nicht gelöscht werden.\n\n'+err.message);
  }
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
  const vehicle = r.service_type === 'Gartenarbeiten'
    ? 'Gartenarbeiten'
    : ([r.make, r.model].filter(Boolean).join(' ') || r.vehicle_type || 'Fahrzeug');
  const cardStyle = r.service_type === 'Gartenarbeiten'
    ? 'border-left:5px solid #39a852;background:rgba(57,168,82,.10)'
    : (r.service_type === 'Fahrzeugpflege'
      ? 'border-left:5px solid #e58bb1;background:rgba(229,139,177,.10)'
      : 'border-left:5px solid #999');
  return `
    <div class="appointment-card" style="${cardStyle}">
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


function getCalendarFilteredRequests(){
  if(!Array.isArray(requests)) return [];
  const search = searchFilter?.value?.trim().toLowerCase() || '';
  const status = statusFilter?.value || '';
  const date = dateFilter?.value || '';
  return requests.filter(r=>{
    if(status && normalizeStatus(r.status)!==status) return false;
    if(date && r.requested_date!==date) return false;
    if(search){
      const hay=[r.first_name,r.last_name,r.phone,r.email,r.vehicle_type,r.make,r.model,r.plate,r.service_type,r.status,r.details,r.message].join(' ').toLowerCase();
      if(!hay.includes(search)) return false;
    }
    return true;
  });
}

function renderCalendar(){
  if(!calendarEl) return;
  const year=calendarMonth.getFullYear();
  const month=calendarMonth.getMonth();
  const first=new Date(year,month,1);
  const daysInMonth=new Date(year,month+1,0).getDate();
  const mondayOffset=(first.getDay()+6)%7;
  const todayKey=appointmentDateKey(new Date());
  const selectedKey=dateFilter?.value||'';
  const names=['Mo','Di','Mi','Do','Fr','Sa','So'];
  const eventsByDate={};
  (requests||[]).filter(isAppointmentVisible).forEach(r=>{
    if(r.requested_date)(eventsByDate[r.requested_date] ||= []).push(r);
  });
  let html=names.map(n=>`<div class="calendar-weekday">${n}</div>`).join('');
  for(let i=0;i<mondayOffset;i++) html+='<div class="calendar-day empty"></div>';
  for(let day=1;day<=daysInMonth;day++){
    const key=appointmentDateKey(new Date(year,month,day));
    const entries=eventsByDate[key]||[];
    const dots=entries.slice(0,6).map(r=>{
      const st=String(r.service_type||'').toLowerCase();
      const cls=st.includes('garten')?'garden':st.includes('fahrzeug')?'vehicle':'other';
      return `<span class="calendar-dot ${cls}" title="${escapeHtml(r.first_name||'')} ${escapeHtml(r.last_name||'')}"></span>`;
    }).join('');
    const classes=['calendar-day'];
    if(key===todayKey)classes.push('today');
    if(key===selectedKey)classes.push('selected');
    html+=`<button type="button" class="${classes.join(' ')}" data-calendar-date="${key}"><div class="calendar-day-number">${day}</div>${entries.length?`<div class="calendar-day-count">${entries.length} Termin${entries.length===1?'':'e'}</div><div class="calendar-day-dots">${dots}</div>`:''}</button>`;
  }
  calendarEl.innerHTML=html;
  if(calendarTitleEl)calendarTitleEl.textContent=new Date(year,month,1).toLocaleDateString('de-DE',{month:'long',year:'numeric'});
  if(filterCountEl)filterCountEl.textContent=`${getCalendarFilteredRequests().length} von ${requests.length}`;
}

function renderCalendarRequests(){
  if(!calendarEl) return;
  const original=requests;
  const filtered=getCalendarFilteredRequests();
  if(filterCountEl) filterCountEl.textContent=`${filtered.length} von ${original.length}`;
  requests=filtered;
  renderCalendar();
  renderAppointments();
  requests=original;
}

function euro(value){
  return Number(value||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
}

async function loadFinancials(){
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  if(financialYearLabel) financialYearLabel.textContent = String(year);
  if(financialMonthLabel) financialMonthLabel.textContent = new Date().toLocaleDateString('de-DE',{month:'long',year:'numeric'});

  let invoiceYear = 0;
  let invoiceMonth = 0;
  let monthlyInvoices = Array.from({length:12},()=>0);

  try{
    const response = await fetch(`${RECHNUNGS_API_URL}?v=${year}`,{cache:'no-store'});
    const result = await response.json().catch(()=>({}));
    if(!response.ok || result.ok===false) throw new Error(result.error||'Rechnungsdaten konnten nicht geladen werden.');
    invoiceYear = Number(result.bruttoGesamtJahr||0);
    invoiceMonth = Number(result.bruttoGesamtMonat||0);
    if(Array.isArray(result.monatlich)) result.monatlich.forEach((v,i)=>{if(i<12)monthlyInvoices[i]=Number(v||0)});
  }catch(err){
    console.warn('Rechnungsdaten:',err.message);
    if(dashInvoiceGross) dashInvoiceGross.textContent='—';
    if(dashInvoiceMonth) dashInvoiceMonth.textContent='—';
    if(dashProfit) dashProfit.textContent='—';
    if(dashProfitMonth) dashProfitMonth.textContent='—';
    return;
  }

  const receiptTotals = window.receiptTotals || {year:{gross:0},month:{gross:0}};
  const expenseYear = Number(receiptTotals.year?.gross||0);
  const expenseMonth = Number(receiptTotals.month?.gross||0);
  const profitYear = invoiceYear - expenseYear;
  const profitMonth = invoiceMonth - expenseMonth;

  if(dashInvoiceGross) dashInvoiceGross.textContent=euro(invoiceYear);
  if(dashInvoiceMonth) dashInvoiceMonth.textContent=euro(invoiceMonth);
  if(dashProfit) dashProfit.textContent=euro(profitYear);
  if(dashProfitMonth) dashProfitMonth.textContent=euro(profitMonth);

  if(financialMonthlyTable){
    financialMonthlyTable.innerHTML=monthlyInvoices.map((income,i)=>{
      const expense=window.receiptMonthlyTotals?.[i]||0;
      const profit=income-expense;
      const name=new Date(year,i,1).toLocaleDateString('de-DE',{month:'long'});
      return `<tr><td>${escapeHtml(name)}</td><td>${euro(income)}</td><td>${euro(expense)}</td><td>${euro(profit)}</td></tr>`;
    }).join('');
  }
}

function showReceiptMsg(message, error=false){
  receiptMsg.textContent=message;
  receiptMsg.classList.remove('hidden');
  receiptMsg.style.color=error?'#b00020':'';
}

async function loadReceipts(){
  if(!receiptList)return;
  receiptList.innerHTML='<p>Belege werden geladen...</p>';
  const {data,error}=await db.from('receipts').select('*').order('receipt_date',{ascending:false}).order('created_at',{ascending:false});
  if(error){
    receiptList.innerHTML=`<p class="notice">Fehler beim Laden: ${escapeHtml(error.message)}</p>`;
    dashReceiptCount.textContent='—';
    dashYearGross.textContent='—';
    dashMonthGross.textContent='—';
    return;
  }

  const rows=data||[];
  const now=new Date();
  const year=now.getFullYear();
  const month=now.getMonth()+1;
  const yearRows=rows.filter(r=>String(r.receipt_date||'').startsWith(String(year)));
  const monthRows=rows.filter(r=>{
    const d=String(r.receipt_date||'').split('-');
    return Number(d[0])===year && Number(d[1])===month;
  });

  // Der Gesamtbetrag enthält ALLE Zahlungsarten – Bar, EC/Karte,
  // Überweisung und Sonstiges. Es wird nichts gegeneinander verrechnet.
  const sumGross=list=>list.reduce((sum,r)=>{
    const amount=Number(String(r.gross_amount??0).replace(',','.'));
    return sum+(Number.isFinite(amount)?amount:0);
  },0);

  const yearGross=sumGross(yearRows);
  const monthGross=sumGross(monthRows);

  // Separate Summen für Bar und EC/Karte. Diese sind zusätzlich
  // zum Gesamtbetrag verfügbar, ohne den Gesamtbetrag zu verändern.
  const yearCash=sumGross(yearRows.filter(r=>r.payment_method==='Bar'));
  const yearCard=sumGross(yearRows.filter(r=>r.payment_method==='EC/Karte'));
  const monthCash=sumGross(monthRows.filter(r=>r.payment_method==='Bar'));
  const monthCard=sumGross(monthRows.filter(r=>r.payment_method==='EC/Karte'));

  // Monatliche Brutto-Ausgaben für die Finanzübersicht.
  window.receiptMonthlyTotals=Array.from({length:12},()=>0);
  yearRows.forEach(r=>{
    const parts=String(r.receipt_date||'').split('-');
    const m=Number(parts[1]);
    const amount=Number(String(r.gross_amount??0).replace(',','.'));
    if(m>=1 && m<=12 && Number.isFinite(amount)) window.receiptMonthlyTotals[m-1]+=amount;
  });

  dashReceiptCount.textContent=String(rows.length);
  dashYearGross.textContent=euro(yearGross);
  dashMonthGross.textContent=euro(monthGross);
  if(dashYearCash)dashYearCash.textContent=euro(yearCash);
  if(dashYearCard)dashYearCard.textContent=euro(yearCard);
  if(dashYearTotal)dashYearTotal.textContent=euro(yearGross);
  if(dashMonthTotal)dashMonthTotal.textContent=euro(monthGross);

  // Für spätere Auswertung bereits bereitgestellt.
  window.receiptTotals={
    year:{gross:yearGross,cash:yearCash,card:yearCard},
    month:{gross:monthGross,cash:monthCash,card:monthCard}
  };

  if(!rows.length){
    receiptList.innerHTML='<p>Noch keine Belege vorhanden.</p>';
    return;
  }

  receiptList.innerHTML=rows.map(r=>`
    <div class="row request-row">
      <div><b>${escapeHtml(r.merchant||'Unbekannter Händler')}</b><small>${formatDate(r.receipt_date)}<br>${escapeHtml(r.receipt_number||'')}</small></div>
      <div><b>${escapeHtml(r.category||'Sonstiges')}</b><small>${escapeHtml(r.description||'')}</small></div>
      <div><b>${euro(r.gross_amount)}</b><small>${escapeHtml(r.payment_method||'')}</small></div>
      <div>
        ${r.storage_path ? `<button data-receipt-open="${escapeHtml(r.storage_path)}">Beleg öffnen</button>` : ''}
        <button data-receipt-delete="${r.id}">Löschen</button>
      </div>
    </div>`).join('');
}


function showOcrMsg(message,error=false){
  ocrMsg.textContent=message;
  ocrMsg.classList.remove('hidden');
  ocrMsg.style.color=error?'#b00020':'';
}

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error||new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });
}

async function pdfFirstPageToDataUrl(file){
  if(typeof pdfjsLib==='undefined'){
    throw new Error('Die PDF-Bibliothek konnte nicht geladen werden. Bitte die Seite einmal mit Strg+F5 neu laden.');
  }

  const buffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buffer}).promise;
  const page=await pdf.getPage(1);
  const viewport=page.getViewport({scale:2});

  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false});

  await page.render({canvasContext:ctx,viewport}).promise;
  return canvas.toDataURL('image/jpeg',0.88);
}

async function fileToOcrDataUrl(file){
  if(file.type.startsWith('image/')){
    return fileToDataUrl(file);
  }

  if(file.type==='application/pdf' || file.name.toLowerCase().endsWith('.pdf')){
    showOcrMsg('PDF wird für die KI vorbereitet…');
    return pdfFirstPageToDataUrl(file);
  }

  throw new Error('Dieser Dateityp kann nicht automatisch per KI ausgewertet werden. Bitte JPG, PNG oder PDF verwenden.');
}

async function recognizeReceipt(){
  const file=receiptImage.files?.[0];
  if(!file)return;

  showOcrMsg('Beleg wird automatisch von der KI ausgewertet…');
  try{
    const dataUrl=await fileToOcrDataUrl(file);
    const {data:{session}}=await db.auth.getSession();
    if(!session)throw new Error('Deine Anmeldung ist abgelaufen. Bitte erneut anmelden.');

    const response=await fetch(`${window.SUPABASE_URL}/functions/v1/ocr-receipt`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${session.access_token}`
      },
      body:JSON.stringify({image:dataUrl})
    });

    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||'Die Belegerkennung ist fehlgeschlagen.');

    if(result.receipt_date)receiptDate.value=result.receipt_date;
    if(result.merchant)receiptMerchant.value=result.merchant;
    if(result.receipt_number)receiptNumber.value=result.receipt_number;
    if(result.gross_amount!==null && result.gross_amount!==undefined)receiptGross.value=Number(result.gross_amount).toFixed(2);
    if(result.category)receiptCategory.value=result.category;
    if(result.description)receiptDescription.value=result.description;
    if(result.payment_method)receiptPayment.value=result.payment_method;

    showOcrMsg('Erkennung abgeschlossen. Bitte die Daten kontrollieren – besonders den Bruttobetrag – und anschließend hochladen.');
  }catch(err){
    showOcrMsg(err.message,true);
  }
}

function dataUrlParts(dataUrl){
  const match=String(dataUrl).match(/^data:([^;,]+)(?:;[^,]*)?,(.*)$/s);
  if(!match)throw new Error('Datei konnte für Google Drive nicht vorbereitet werden.');
  return {mimeType:match[1]||'application/octet-stream',base64:match[2]};
}

function safeFilePart(value){
  return String(value||'').trim().replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').slice(0,80);
}

function driveFileName(file){
  const date=receiptDate.value||new Date().toLocaleDateString('sv-SE');
  const merchant=safeFilePart(receiptMerchant.value)||'Unbekannt';
  const number=safeFilePart(receiptNumber.value)||'ohne-Nr';
  const gross=Number(String(receiptGross.value||0).replace(',','.'));
  const amount=Number.isFinite(gross)?gross.toFixed(2).replace('.',','):'0,00';
  const ext=(file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'')||'bin';
  return `${date}_${merchant}_${number}_${amount}EUR.${ext}`.slice(0,180);
}

async function uploadReceiptToDrive(file){
  const dataUrl=await fileToDataUrl(file);
  const parts=dataUrlParts(dataUrl);
  const payload={
    action:'uploadBeleg',
    fileName:driveFileName(file),
    mimeType:parts.mimeType||file.type||'application/octet-stream',
    base64:parts.base64,
    receiptDate:receiptDate.value,
    merchant:receiptMerchant.value.trim(),
    receiptNumber:receiptNumber.value.trim(),
    grossAmount:Number(String(receiptGross.value).replace(',','.')),
    category:receiptCategory.value,
    description:receiptDescription.value.trim(),
    paymentMethod:receiptPayment.value
  };

  // text/plain avoids a browser CORS preflight while the Apps Script web app
  // still receives the raw JSON in e.postData.contents.
  const response=await fetch(BELEG_UPLOAD_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=UTF-8'},
    body:JSON.stringify(payload)
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok || !result.ok)throw new Error(result.error||'Google Drive Upload fehlgeschlagen.');
  return result;
}

async function saveReceipt(){
  const file=receiptImage.files?.[0];
  if(!file){
    showReceiptMsg('Bitte zuerst einen Beleg oder eine Rechnung auswählen.',true);
    return;
  }

  // Der Bruttobetrag muss beim ersten Klick noch nicht vorhanden sein.
  // Wenn es sich um ein Bild handelt, wird die vorhandene OCR automatisch
  // ausgeführt und der erkannte Betrag anschließend geprüft.
  let gross=Number(String(receiptGross.value||'').replace(',','.'));
  if(!Number.isFinite(gross)||gross<0){
    if(file.type.startsWith('image/')){
      await recognizeReceipt();
      gross=Number(String(receiptGross.value||'').replace(',','.'));
    }
  }

  if(!Number.isFinite(gross)||gross<0){
    showReceiptMsg('Der Bruttobetrag konnte noch nicht erkannt werden. Bitte kurz die OCR abwarten oder den Betrag manuell eintragen.',true);
    return;
  }

  const {data:{session}}=await db.auth.getSession();
  if(!session){
    showReceiptMsg('Deine Anmeldung ist abgelaufen. Bitte erneut anmelden.',true);
    return;
  }

  const id=crypto.randomUUID();
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
  const path=`${id}.${ext}`;

  saveReceiptBtn.disabled=true;
  saveReceiptBtn.textContent='⏳ Wird hochgeladen…';
  showReceiptMsg('Dokument wird dauerhaft in Supabase Storage und anschließend in Google Drive archiviert…');

  let storageUploaded=false;
  try{
    const upload=await db.storage.from('receipts').upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});
    if(upload.error)throw upload.error;
    storageUploaded=true;

    const {error}=await db.from('receipts').insert({
      id,
      receipt_date:receiptDate.value,
      merchant:receiptMerchant.value.trim()||null,
      receipt_number:receiptNumber.value.trim()||null,
      gross_amount:gross,
      category:receiptCategory.value,
      description:receiptDescription.value.trim()||null,
      payment_method:receiptPayment.value,
      storage_path:path
    });
    if(error){
      await db.storage.from('receipts').remove([path]);
      storageUploaded=false;
      throw error;
    }

    let driveResult=null;
    try{
      driveResult=await uploadReceiptToDrive(file);
    }catch(driveError){
      console.warn('Google Drive Upload fehlgeschlagen:',driveError.message);
      showReceiptMsg(`Beleg wurde in der App gespeichert, aber Google Drive konnte nicht erreicht werden: ${driveError.message}`,true);
      await loadReceipts();
      return;
    }

    receiptForm.reset();
    receiptDate.value=new Date().toLocaleDateString('sv-SE');
    showOcrMsg('');
    ocrMsg.classList.add('hidden');
    showReceiptMsg(`Beleg erfolgreich gespeichert. Google Drive: ${driveResult.fileName||'archiviert'}`);
    await loadReceipts();
  }catch(err){
    if(storageUploaded){
      // The DB row normally exists only after a successful insert. Keep the
      // document if a later step failed so no original is lost.
    }
    showReceiptMsg('Beleg konnte nicht gespeichert werden: '+err.message,true);
  }finally{
    saveReceiptBtn.disabled=false;
    saveReceiptBtn.textContent='📤 Beleg / Rechnung hochladen';
  }
}

async function openReceipt(path){
  const {data,error}=await db.storage.from('receipts').createSignedUrl(path,3600);
  if(error||!data?.signedUrl){
    alert('Beleg konnte nicht geöffnet werden.');
    return;
  }
  window.open(data.signedUrl,'_blank','noopener');
}

async function deleteReceipt(id){
  if(!confirm('Diesen Beleg wirklich löschen?'))return;
  const {data,error}=await db.from('receipts').select('storage_path').eq('id',id).single();
  if(error){alert('Beleg konnte nicht gefunden werden: '+error.message);return;}
  if(data?.storage_path)await db.storage.from('receipts').remove([data.storage_path]);
  const result=await db.from('receipts').delete().eq('id',id);
  if(result.error){alert('Beleg konnte nicht gelöscht werden: '+result.error.message);return;}
  await loadReceipts();
}

function showView(view){
  dashboardHome.classList.toggle('hidden',view!=='dashboard');
  requestsView.classList.toggle('hidden',view!=='requests');
  receiptsView.classList.toggle('hidden',view!=='receipts');

  if(view==='dashboard')pageTitle.textContent='Dashboard';
  if(view==='requests')pageTitle.textContent='Terminanfragen';
  if(view==='receipts')pageTitle.textContent='Belege';

  if(view==='requests')load();
  if(view==='receipts'){
    receiptDate.value=receiptDate.value||new Date().toLocaleDateString('sv-SE');
    loadReceipts();
  }
}

document.querySelectorAll('[data-nav]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    showView(btn.dataset.nav);
    window.scrollTo({top:0,behavior:'smooth'});
  });
});


receiptImage.addEventListener('change',()=>{
  ocrMsg.classList.add('hidden');
  if(receiptImage.files?.[0]){
    if(!receiptDate.value)receiptDate.value=new Date().toLocaleDateString('sv-SE');
    recognizeReceipt();
  }
});

receiptForm.addEventListener('submit',async e=>{
  e.preventDefault();
  await saveReceipt();
});
receiptList.addEventListener('click',async e=>{
  const open=e.target.closest('[data-receipt-open]');
  if(open)return openReceipt(open.dataset.receiptOpen);
  const del=e.target.closest('[data-receipt-delete]');
  if(del)return deleteReceipt(del.dataset.receiptDelete);
});

if(appointmentTodayBtn){
  appointmentTodayBtn.addEventListener('click',()=>{appointmentDate=new Date();renderAppointments();});
  appointmentPrevBtn?.addEventListener('click',()=>shiftAppointmentPeriod(-1));
  appointmentNextBtn?.addEventListener('click',()=>shiftAppointmentPeriod(1));
  appointmentViewButtons.forEach(btn=>btn.addEventListener('click',()=>{
    appointmentView=btn.dataset.view;
    appointmentViewButtons.forEach(x=>x.classList.toggle('active',x===btn));
    renderAppointments();
  }));
}
appointmentOverview?.addEventListener('click',async e=>{
  const button=e.target.closest('button[data-appt-action]');
  if(!button)return;
  const id=button.dataset.id;
  const action=button.dataset.apptAction;
  if(action==='details')return openDetails(id);
  if(action==='move')return moveAppointment(id);
  if(action==='complete')return completeAppointment(id);
});
searchFilter?.addEventListener('input',renderCalendarRequests);
statusFilter?.addEventListener('change',renderCalendarRequests);
dateFilter?.addEventListener('change',renderCalendarRequests);
clearFiltersBtn?.addEventListener('click',()=>{
  if(searchFilter)searchFilter.value='';
  if(statusFilter)statusFilter.value='';
  if(dateFilter)dateFilter.value='';
  renderCalendarRequests();
});
calendarEl?.addEventListener('click',e=>{
  const button=e.target.closest('[data-calendar-date]');
  if(!button)return;
  if(dateFilter)dateFilter.value=button.dataset.calendarDate;
  appointmentDate=appointmentDateFromKey(button.dataset.calendarDate);
  appointmentView='day';
  appointmentViewButtons.forEach(x=>x.classList.toggle('active',x.dataset.view==='day'));
  renderCalendarRequests();
});
prevMonthBtn?.addEventListener('click',()=>{
  calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);
  renderCalendarRequests();
});
nextMonthBtn?.addEventListener('click',()=>{
  calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);
  renderCalendarRequests();
});

loginForm.addEventListener('submit',async e=>{e.preventDefault();loginMsg.classList.add('hidden');const {error}=await db.auth.signInWithPassword({email:emailEl.value.trim(),password:passwordEl.value});if(error){showLoginMessage(error.message);return}await init()});
listEl.addEventListener('click',async e=>{const button=e.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='details')return openDetails(id);if(action==='confirm')return confirmRequest(id);if(action==='reject')return rejectRequest(id);if(action==='alternative')return alternativeRequest(id);if(action==='delete')return deleteRequest(id)});
detailActions.addEventListener('click',async e=>{const button=e.target.closest('button[data-modal-action]');if(!button||!selectedRequest)return;const action=button.dataset.modalAction;if(action==='confirm')await confirmRequest(selectedRequest.id);if(action==='reject')await rejectRequest(selectedRequest.id);if(action==='alternative')await alternativeRequest(selectedRequest.id);if(action==='delete')await deleteRequest(selectedRequest.id)});
closeModal.addEventListener('click',closeDetails);modal.addEventListener('click',e=>{if(e.target===modal)closeDetails()});logoutBtn.addEventListener('click',async()=>{await db.auth.signOut();location.reload()});refreshBtn.addEventListener('click',async()=>{refreshBtn.disabled=true;try{await Promise.all([load(),loadReceipts(),loadFinancials()]);}finally{refreshBtn.disabled=false;}});init();
