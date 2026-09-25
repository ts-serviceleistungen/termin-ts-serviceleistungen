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
const dashYearCash=document.getElementById('dashYearCash');
const dashYearCard=document.getElementById('dashYearCard');
const dashYearTotal=document.getElementById('dashYearTotal');
const dashMonthTotal=document.getElementById('dashMonthTotal');
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
const ocrReceiptBtn = document.getElementById('ocrReceipt');
const ocrMsg = document.getElementById('ocrMsg');
const receiptList = document.getElementById('receiptList');

const modal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailActions = document.getElementById('detailActions');
const closeModal = document.getElementById('closeModal');
let requests=[];let selectedRequest=null;
let personalCalendarEvents=[];
let adminCalendarDate=new Date();
let adminCalendarView='month';

// Google-Rechnungs-/Finanzschnittstelle
const INVOICE_TOTAL_URL='https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
const dashInvoiceGross=document.getElementById('dashInvoiceGross');
const dashInvoiceMonth=document.getElementById('dashInvoiceMonth');
const dashProfit=document.getElementById('dashProfit');
const dashProfitMonth=document.getElementById('dashProfitMonth');
const financialYearLabel=document.getElementById('financialYearLabel');
const financialMonthLabel=document.getElementById('financialMonthLabel');
const financialMonthlyTable=document.getElementById('financialMonthlyTable');

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
  await loadAdminCalendarEvents();
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

  // Belegzahlen und Belegsummen werden separat von loadReceipts()
  // aus der receipts-Tabelle geladen. Hier nichts auf 0 zurücksetzen.

  if(!requests.length){
    listEl.innerHTML='<p>Keine Anfragen vorhanden.</p>';
    return;
  }

  listEl.innerHTML=requests.map(x=>`<div class="row request-row"><div><b>${escapeHtml(x.first_name)} ${escapeHtml(x.last_name)}</b><small>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</small></div><div><b>${escapeHtml(x.make)} ${escapeHtml(x.model)}</b><small>${escapeHtml(x.vehicle_type)} · ${escapeHtml(x.color)}</small></div><div><b>${escapeHtml(x.service_type)}</b><small>${formatDate(x.requested_date)} · ${escapeHtml(x.requested_time||'—')}</small></div><div><span class="badge">${escapeHtml(x.status||'Neue Anfrage')}</span><br><button data-action="details" data-id="${x.id}">Details</button><button data-action="confirm" data-id="${x.id}">Bestätigen</button><button data-action="alternative" data-id="${x.id}">Alternative</button><button data-action="reject" data-id="${x.id}">Ablehnen</button><button data-action="delete" data-id="${x.id}">Löschen</button></div></div>`).join('');
}

function ensureAdminCalendarUI(){
  if(document.getElementById('adminCalendar'))return;
  const host=document.getElementById('requestsView')||document.getElementById('dashboardHome');
  if(!host)return;
  const wrap=document.createElement('section');
  wrap.id='adminCalendar';
  wrap.className='panel';
  wrap.style.marginBottom='20px';
  if(!document.getElementById('adminCalendarDarkStyle')){
    const style=document.createElement('style');
    style.id='adminCalendarDarkStyle';
    style.textContent=`
      #adminCalendar{background:#0b0b0b!important;color:#f5f5f5!important;border-color:#8a6a1f!important}
      #adminCalendar .head{background:transparent!important;color:#fff!important}
      #adminCalTitle{color:#d6b55a!important}
      #adminCalGrid{color:#fff!important}
      #adminCalGrid > div{background:#0b0b0b!important;color:#f5f5f5!important}
      #adminCalGrid .admin-cal-day{background:#111!important;color:#fff!important;border-color:#6d5317!important}
      #adminCalGrid .admin-cal-day:hover{background:#1a1710!important;border-color:#c49b36!important}
      #adminCalGrid .admin-cal-day > div:first-child{color:#d6b55a!important}
      #adminCalGrid .admin-cal-event{color:#fff!important;background-color:rgba(255,255,255,.04)!important}
      #adminCalGrid .admin-cal-event[data-kind="customer"]{color:#fff!important}
      #adminCalGrid button{color:#fff!important}
      #adminCalGrid button:hover{color:#fff!important}
    `;
    document.head.appendChild(style);
  }
  wrap.innerHTML=`
    <div class="head" style="flex-wrap:wrap;gap:10px">
      <div><b>Admin-Kalender</b><small id="adminCalendarSummary" style="display:block;margin-top:4px">Termine</small></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <button type="button" id="adminCalPrev">‹</button>
        <button type="button" id="adminCalToday">Heute</button>
        <button type="button" id="adminCalNext">›</button>
        <button type="button" class="primary" data-admin-cal-view="day">Tag</button>
        <button type="button" data-admin-cal-view="week">Woche</button>
        <button type="button" data-admin-cal-view="month">Monat</button>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px">
      <input id="adminCalSearch" type="search" placeholder="Kunde, Fahrzeug, Leistung …" style="flex:1;min-width:220px">
      <select id="adminCalStatus" style="min-width:150px">
        <option value="">Alle Status</option>
        <option>Neue Anfrage</option><option>Bestätigt</option><option>Alternativtermin</option><option>Abgelehnt</option><option>Abgeschlossen</option>
      </select>
      <input id="adminCalDate" type="date">
      <button type="button" id="adminCalClear">Filter zurücksetzen</button>
    </div>
    <div id="adminCalTitle" style="font-size:18px;font-weight:700;margin-bottom:10px"></div>
    <div id="adminCalGrid"></div>`;
  host.insertBefore(wrap,host.firstChild);
  document.getElementById('adminCalPrev').onclick=()=>{moveAdminCalendar(-1);};
  document.getElementById('adminCalNext').onclick=()=>{moveAdminCalendar(1);};
  document.getElementById('adminCalToday').onclick=()=>{adminCalendarDate=new Date();renderAdminCalendar();};
  document.getElementById('adminCalClear').onclick=()=>{document.getElementById('adminCalSearch').value='';document.getElementById('adminCalStatus').value='';document.getElementById('adminCalDate').value='';renderAdminCalendar();};
  ['adminCalSearch','adminCalStatus','adminCalDate'].forEach(id=>document.getElementById(id).addEventListener('input',renderAdminCalendar));
  document.querySelectorAll('[data-admin-cal-view]').forEach(btn=>btn.addEventListener('click',()=>{adminCalendarView=btn.dataset.adminCalView;renderAdminCalendar();}));
}

async function loadAdminCalendarEvents(){
  const {data,error}=await db.from('personal_calendar_events').select('*').order('start_time',{ascending:true});
  if(error){
    console.warn('Persönlicher Kalender konnte nicht geladen werden:',error.message);
    personalCalendarEvents=[];
  }else personalCalendarEvents=data||[];
  ensureAdminCalendarUI();
  renderAdminCalendar();
}

function adminDateKey(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function adminStartOfWeek(d){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const monday=(x.getDay()+6)%7;x.setDate(x.getDate()-monday);return x;
}
function adminEventStart(e){return new Date(e.start_time);}
function adminEventEnd(e){return new Date(e.end_time);}
function adminTime(e){const s=adminEventStart(e),en=adminEventEnd(e);return `${s.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}–${en.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;}
function adminEventType(e){
  const t=String(e.event_type||'').toLowerCase();
  if(t.includes('garten'))return'garden';
  if(t.includes('fahrzeug'))return'vehicle';
  if(t.includes('schicht'))return'shift';
  return'private';
}
function adminEventStyle(type){
  if(type==='garden')return'border-left:4px solid #39a852;background:rgba(57,168,82,.10)';
  if(type==='vehicle')return'border-left:4px solid #e58bb1;background:rgba(229,139,177,.10)';
  if(type==='shift')return'border-left:4px solid #777;background:rgba(120,120,120,.10)';
  return'border-left:4px solid #b08a2e;background:rgba(176,138,46,.10)';
}
function adminRequestMatches(r){
  if(!r.requested_date)return false;
  const status=(r.status||'Neue Anfrage');
  if(status==='Abgelehnt')return false;
  const search=(document.getElementById('adminCalSearch')?.value||'').trim().toLowerCase();
  const statusFilter=document.getElementById('adminCalStatus')?.value||'';
  const dateFilter=document.getElementById('adminCalDate')?.value||'';
  if(statusFilter && status!==statusFilter)return false;
  if(dateFilter && r.requested_date!==dateFilter)return false;
  if(!search)return true;
  return [r.first_name,r.last_name,r.phone,r.email,r.vehicle_type,r.make,r.model,r.color,r.plate,r.service_type,r.status,r.details,r.message,(r.care_options||[]).join(' ')].join(' ').toLowerCase().includes(search);
}
function adminPersonalMatches(e){
  const search=(document.getElementById('adminCalSearch')?.value||'').trim().toLowerCase();
  const dateFilter=document.getElementById('adminCalDate')?.value||'';
  const date=adminDateKey(adminEventStart(e));
  if(dateFilter && date!==dateFilter)return false;
  if(!search)return true;
  return [e.title,e.event_type,e.notes].join(' ').toLowerCase().includes(search);
}
function adminCustomerEvent(r){
  return {kind:'customer',id:r.id,date:r.requested_date,time:r.requested_time||'',title:`${r.first_name||''} ${r.last_name||''}`.trim()||'Kunde',subtitle:`${r.service_type||'Leistung'} · ${[r.make,r.model].filter(Boolean).join(' ')||r.vehicle_type||'Fahrzeug'}`,status:r.status||'Neue Anfrage',style:r.service_type==='Gartenarbeiten'?'garden':'vehicle'};
}
function adminPersonalEvent(e){
  return {kind:'personal',id:e.id,date:adminDateKey(adminEventStart(e)),time:adminTime(e),title:e.title||'Termin',subtitle:e.event_type||'Termin',status:e.notes||'',style:adminEventType(e),raw:e};
}
function adminVisibleItems(){
  const customers=requests.filter(adminRequestMatches).map(adminCustomerEvent);
  const customerMarkers=new Set(customers.map(x=>`${x.date}|${x.title}|${x.time}`));
  const personal=personalCalendarEvents.filter(adminPersonalMatches).filter(e=>{
    // Kundentermine werden bereits direkt aus requests dargestellt.
    const t=String(e.title||'');
    if(t.startsWith('Kundentermin – '))return false;
    return true;
  }).map(adminPersonalEvent);
  return [...customers,...personal];
}
function renderAdminCalendar(){
  const grid=document.getElementById('adminCalGrid');
  if(!grid)return;
  const title=document.getElementById('adminCalTitle');
  const items=adminVisibleItems();
  const summary=document.getElementById('adminCalendarSummary');
  if(summary)summary.textContent=`${items.length} Einträge · Kunden + eigener Kalender`;
  if(adminCalendarView==='month'){
    const y=adminCalendarDate.getFullYear(),m=adminCalendarDate.getMonth();
    title.textContent=adminCalendarDate.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
    const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),lead=(first.getDay()+6)%7;
    let html='<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">';
    ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(d=>html+=`<div style="font-weight:700;text-align:center;padding:6px">${d}</div>`);
    for(let i=0;i<lead;i++)html+='<div></div>';
    for(let day=1;day<=days;day++){
      const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const dayItems=items.filter(x=>x.date===key);
      const today=key===adminDateKey(new Date());
      html+=`<button type="button" class="admin-cal-day" data-cal-day="${key}" style="min-height:92px;text-align:left;padding:7px;border:1px solid ${today?'#b08a2e':'#ddd'};border-radius:8px;background:${today?'rgba(176,138,46,.10)':'#111'};color:#fff;cursor:pointer">`;
      html+=`<div style="font-weight:700;margin-bottom:5px">${day}</div>`;
      dayItems.slice(0,4).forEach(x=>html+=`<div class="admin-cal-event" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="${adminEventStyle(x.style)};padding:3px 5px;margin:3px 0;border-radius:4px;font-size:12px;overflow:hidden"><b>${escapeHtml(x.time||'')}</b> ${escapeHtml(x.title)}<br><span>${escapeHtml(x.subtitle)}</span></div>`);
      if(dayItems.length>4)html+=`<div style="font-size:11px">+ ${dayItems.length-4} weitere</div>`;
      html+='</button>';
    }
    html+='</div>';grid.innerHTML=html;
  }else{
    const isDay=adminCalendarView==='day';
    const start=isDay?new Date(adminCalendarDate):adminStartOfWeek(adminCalendarDate);
    const count=isDay?1:7;
    title.textContent=isDay?adminCalendarDate.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}):`${start.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})} – ${new Date(start.getFullYear(),start.getMonth(),start.getDate()+6).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}`;
    let html='<div style="display:grid;grid-template-columns:90px repeat('+count+',minmax(0,1fr));border:1px solid #6d5317;overflow:auto;background:#0b0b0b;color:#fff">';
    html+='<div></div>';
    for(let i=0;i<count;i++){const d=new Date(start);d.setDate(d.getDate()+i);html+=`<div style="padding:8px;text-align:center;font-weight:700;border-left:1px solid #4a3a17">${d.toLocaleDateString('de-DE',{weekday:'short'})}<br>${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.</div>`;}
    for(let h=0;h<24;h++){
      html+=`<div style="min-height:54px;padding:6px;font-size:12px;border-top:1px solid #2d281d">${String(h).padStart(2,'0')}:00</div>`;
      for(let i=0;i<count;i++){const d=new Date(start);d.setDate(d.getDate()+i);const key=adminDateKey(d);const slot=items.filter(x=>x.date===key).filter(x=>{const hh=parseInt((x.time||'').slice(0,2),10);return Number.isFinite(hh)&&hh===h;});html+='<div style="min-height:54px;border-left:1px solid #eee;border-top:1px solid #2d281d;padding:3px">';slot.forEach(x=>html+=`<div class="admin-cal-event" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="${adminEventStyle(x.style)};padding:4px;border-radius:4px;font-size:12px;margin-bottom:3px;cursor:pointer"><b>${escapeHtml(x.time)}</b><br>${escapeHtml(x.title)}<br><span>${escapeHtml(x.subtitle)}</span></div>`);html+='</div>';}
    }
    html+='</div>';grid.innerHTML=html;
  }
  grid.querySelectorAll('.admin-cal-event').forEach(el=>el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(el.dataset.kind==='customer')openDetails(el.dataset.id);else openPersonalCalendarDetail(el.dataset.id);}));
  grid.querySelectorAll('[data-cal-day]').forEach(el=>el.addEventListener('dblclick',()=>{adminCalendarDate=new Date(el.dataset.calDay+'T12:00:00');adminCalendarView='day';renderAdminCalendar();}));
}
function moveAdminCalendar(delta){
  if(adminCalendarView==='month')adminCalendarDate=new Date(adminCalendarDate.getFullYear(),adminCalendarDate.getMonth()+delta,1);
  else if(adminCalendarView==='week')adminCalendarDate=new Date(adminCalendarDate.getFullYear(),adminCalendarDate.getMonth(),adminCalendarDate.getDate()+delta*7);
  else adminCalendarDate=new Date(adminCalendarDate.getFullYear(),adminCalendarDate.getMonth(),adminCalendarDate.getDate()+delta);
  renderAdminCalendar();
}
function openPersonalCalendarDetail(id){
  const e=personalCalendarEvents.find(x=>String(x.id)===String(id));if(!e)return;
  detailTitle.textContent=e.title||'Kalendereintrag';
  detailBody.innerHTML=`<div class="detail-grid">${field('Art',e.event_type)}${field('Beginn',adminEventStart(e).toLocaleString('de-DE'))}${field('Ende',adminEventEnd(e).toLocaleString('de-DE'))}${field('Kundenbuchungen blockieren',e.blocks_customer_bookings?'Ja':'Nein')}</div><div class="detail-text">${field('Notiz',e.notes)}</div>`;
  detailActions.innerHTML='<button type="button" data-personal-close>Schließen</button>';
  modal.classList.remove('hidden');
  detailActions.querySelector('[data-personal-close]').onclick=closeDetails;
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

function euro(value){
  return Number(value||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
}

async function loadFinancials(){
  const year=new Date().getFullYear();
  const month=new Date().getMonth()+1;
  if(financialYearLabel)financialYearLabel.textContent=String(year);
  if(financialMonthLabel)financialMonthLabel.textContent=new Date().toLocaleDateString('de-DE',{month:'long',year:'numeric'});

  let invoiceYear=0;
  let invoiceMonth=0;
  let monthlyInvoices=Array.from({length:12},()=>0);

  try{
    const response=await fetch(`${INVOICE_TOTAL_URL}?v=${year}`,{cache:'no-store'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok || result.ok===false)throw new Error(result.error||'Rechnungsdaten konnten nicht geladen werden.');
    invoiceYear=Number(result.bruttoGesamtJahr||0);
    invoiceMonth=Number(result.bruttoGesamtMonat||0);
    if(Array.isArray(result.monatlich))result.monatlich.forEach((v,i)=>{if(i<12)monthlyInvoices[i]=Number(v||0)});
  }catch(err){
    console.warn('Rechnungsdaten:',err.message);
    if(dashInvoiceGross)dashInvoiceGross.textContent='—';
    if(dashInvoiceMonth)dashInvoiceMonth.textContent='—';
    if(dashProfit)dashProfit.textContent='—';
    if(dashProfitMonth)dashProfitMonth.textContent='—';
    return;
  }

  // Ausgaben direkt aus Supabase lesen. Dadurch ist die Finanzübersicht
  // unabhängig davon, ob loadReceipts() vorher bereits gelaufen ist.
  let expenseYear=0;
  let expenseMonth=0;
  const monthlyExpenses=Array.from({length:12},()=>0);
  try{
    const {data:expenseRows,error:expenseError}=await db
      .from('receipts')
      .select('receipt_date,gross_amount')
      .order('receipt_date',{ascending:true});
    if(expenseError)throw expenseError;

    const parseAmount=value=>{
      if(typeof value==='number')return Number.isFinite(value)?value:0;
      let text=String(value??'').trim().replace(/€|\s/g,'');
      if(text.includes(',')&&text.includes('.')){
        text=text.replace(/\./g,'').replace(',','.');
      }else if(text.includes(',')){
        text=text.replace(',','.');
      }
      const n=Number(text);
      return Number.isFinite(n)?n:0;
    };

    const rows=expenseRows||[];
    rows.forEach(row=>{
      const raw=String(row.receipt_date??'').trim();
      const match=raw.match(/^(\d{4})[-.](\d{1,2})/);
      if(!match)return;
      const rowYear=Number(match[1]);
      const rowMonth=Number(match[2]);
      const amount=parseAmount(row.gross_amount);
      if(rowYear!==year || rowMonth<1 || rowMonth>12)return;
      expenseYear+=amount;
      monthlyExpenses[rowMonth-1]+=amount;
      if(rowMonth===month)expenseMonth+=amount;
    });
  }catch(err){
    console.warn('Ausgabendaten:',err.message);
  }

  const profitYear=invoiceYear-expenseYear;
  const profitMonth=invoiceMonth-expenseMonth;

  if(dashInvoiceGross)dashInvoiceGross.textContent=euro(invoiceYear);
  if(dashInvoiceMonth)dashInvoiceMonth.textContent=euro(invoiceMonth);
  if(dashProfit)dashProfit.textContent=euro(profitYear);
  if(dashProfitMonth)dashProfitMonth.textContent=euro(profitMonth);

  if(financialMonthlyTable){
    financialMonthlyTable.innerHTML=monthlyInvoices.map((income,i)=>{
      const expense=Number(monthlyExpenses[i]||0);
      const profit=income-expense;
      const name=new Date(year,i,1).toLocaleDateString('de-DE',{month:'long'});
      return `<tr><td>${escapeHtml(name)}</td><td>${euro(income)}</td><td>${euro(expense)}</td><td>${euro(profit)}</td></tr>`;
    }).join('');
  }
}

function showReceiptMsg(message, error=false){
  if(!receiptMsg)return;
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

  // Monatliche Beleg-/Ausgabensummen für die Finanzübersicht (Jan–Dez).
  const monthlyExpenses=Array.from({length:12},()=>0);
  yearRows.forEach(r=>{
    const d=String(r.receipt_date||'').split('-');
    const m=Number(d[1]);
    const amount=Number(String(r.gross_amount??0).replace(',','.'));
    if(m>=1 && m<=12 && Number.isFinite(amount)) monthlyExpenses[m-1]+=amount;
  });
  window.receiptMonthlyTotals=monthlyExpenses;

  // Separate Summen für Bar und EC/Karte. Diese sind zusätzlich
  // zum Gesamtbetrag verfügbar, ohne den Gesamtbetrag zu verändern.
  const yearCash=sumGross(yearRows.filter(r=>r.payment_method==='Bar'));
  const yearCard=sumGross(yearRows.filter(r=>r.payment_method==='EC/Karte'));
  const monthCash=sumGross(monthRows.filter(r=>r.payment_method==='Bar'));
  const monthCard=sumGross(monthRows.filter(r=>r.payment_method==='EC/Karte'));

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
  if(!ocrMsg)return;
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

async function recognizeReceipt(){
  if(!receiptImage){
    return;
  }
  const file=receiptImage.files?.[0];
  if(!file){
    showOcrMsg('Bitte zuerst ein Belegfoto auswählen.',true);
    return;
  }

  const isPdf=file.type==='application/pdf' || /\.pdf$/i.test(file.name);
  if(!file.type.startsWith('image/') && !isPdf){
    showOcrMsg('Bitte ein Bild oder PDF als Beleg/Rechnung auswählen.',true);
    return;
  }

  if(ocrReceiptBtn)ocrReceiptBtn.disabled=true;
  if(ocrReceiptBtn)ocrReceiptBtn.textContent='🔎 Dokument wird erkannt…';
  showOcrMsg('Dokument wird analysiert. Bitte einen Moment warten…');

  try{
    let dataUrl;
    if(isPdf){
      if(!window.pdfjsLib)throw new Error('PDF-Erkennung ist noch nicht geladen. Bitte Seite einmal neu laden.');
      const buffer=await file.arrayBuffer();
      const pdf=await window.pdfjsLib.getDocument({data:buffer}).promise;
      const page=await pdf.getPage(1);
      const viewport=page.getViewport({scale:2});
      const canvas=document.createElement('canvas');
      canvas.width=Math.ceil(viewport.width);
      canvas.height=Math.ceil(viewport.height);
      const ctx=canvas.getContext('2d');
      await page.render({canvasContext:ctx,viewport}).promise;
      dataUrl=canvas.toDataURL('image/jpeg',0.9);
    }else{
      dataUrl=await fileToDataUrl(file);
    }
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

    showOcrMsg('Erkennung abgeschlossen. Bitte die Daten kontrollieren – besonders den Bruttobetrag – und anschließend speichern.');
  }catch(err){
    showOcrMsg(err.message,true);
  }finally{
    if(ocrReceiptBtn)ocrReceiptBtn.disabled=false;
    if(ocrReceiptBtn)ocrReceiptBtn.textContent='🔎 Beleg automatisch erkennen';
  }
}

async function saveReceipt(){
  if(!receiptImage){
    return;
  }
  const file=receiptImage.files?.[0];
  if(!file){
    showReceiptMsg('Bitte ein Belegfoto auswählen.',true);
    return;
  }

  const gross=Number(String(receiptGross.value).replace(',','.'));
  if(!Number.isFinite(gross)||gross<0){
    showReceiptMsg('Bitte einen gültigen Bruttobetrag eingeben.',true);
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

  showReceiptMsg('Beleg wird gespeichert…');

  try{
    const upload=await db.storage.from('receipts').upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});
    if(upload.error)throw upload.error;

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
      throw error;
    }

    receiptForm.reset();
    receiptDate.value=new Date().toLocaleDateString('sv-SE');
    showReceiptMsg('Beleg erfolgreich gespeichert.');
    await loadReceipts();
      await loadFinancials();
  }catch(err){
    showReceiptMsg('Beleg konnte nicht gespeichert werden: '+err.message,true);
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
  await loadFinancials();
}

function showView(view){
  dashboardHome.classList.toggle('hidden',view!=='dashboard');
  requestsView.classList.toggle('hidden',view!=='requests');
  receiptsView.classList.toggle('hidden',view!=='receipts');

  if(view==='dashboard')pageTitle.textContent='Dashboard';
  if(view==='requests')pageTitle.textContent='Terminanfragen';
  if(view==='receipts')pageTitle.textContent='Belege';

  if(view==='requests'){ensureAdminCalendarUI();load();}
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


if(ocrReceiptBtn){
  ocrReceiptBtn.addEventListener('click',recognizeReceipt);
}
if(receiptImage){
  receiptImage.addEventListener('change',()=>{
    if(receiptImage.files?.[0]) recognizeReceipt();
  });
}

if(receiptForm){
  receiptForm.addEventListener('submit',async e=>{
    e.preventDefault();
    await saveReceipt();
  });
}

if(receiptList){
  receiptList.addEventListener('click',async e=>{
    const open=e.target.closest('[data-receipt-open]');
    if(open)return openReceipt(open.dataset.receiptOpen);
    const del=e.target.closest('[data-receipt-delete]');
    if(del)return deleteReceipt(del.dataset.receiptDelete);
  });
}

loginForm.addEventListener('submit',async e=>{e.preventDefault();loginMsg.classList.add('hidden');const {error}=await db.auth.signInWithPassword({email:emailEl.value.trim(),password:passwordEl.value});if(error){showLoginMessage(error.message);return}await init()});
listEl.addEventListener('click',async e=>{const button=e.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='details')return openDetails(id);if(action==='confirm')return confirmRequest(id);if(action==='reject')return rejectRequest(id);if(action==='alternative')return alternativeRequest(id);if(action==='delete')return deleteRequest(id)});
detailActions.addEventListener('click',async e=>{const button=e.target.closest('button[data-modal-action]');if(!button||!selectedRequest)return;const action=button.dataset.modalAction;if(action==='confirm')await confirmRequest(selectedRequest.id);if(action==='reject')await rejectRequest(selectedRequest.id);if(action==='alternative')await alternativeRequest(selectedRequest.id);if(action==='delete')await deleteRequest(selectedRequest.id)});
closeModal.addEventListener('click',closeDetails);
modal.addEventListener('click',e=>{if(e.target===modal)closeDetails()});
logoutBtn.addEventListener('click',async()=>{await db.auth.signOut();location.reload()});
refreshBtn.addEventListener('click',async()=>{
  refreshBtn.disabled=true;
  refreshBtn.textContent='Aktualisiere…';
  try{
    await Promise.all([load(),loadReceipts()]);
    await loadFinancials();
  }finally{
    refreshBtn.disabled=false;
    refreshBtn.textContent='Aktualisieren';
  }
});
init();