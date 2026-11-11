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

// Login-Handler früh registrieren, damit andere Dashboard-Fehler ihn nicht blockieren.
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginMsg?.classList.add('hidden');
    const submitButton = loginForm.querySelector('button[type="submit"], button:not([type])');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Anmeldung läuft…';
    }
    try {
      const { error } = await db.auth.signInWithPassword({
        email: emailEl.value.trim(),
        password: passwordEl.value
      });
      if (error) {
        showLoginMessage(error.message);
        return;
      }
      await init();
    } catch (error) {
      showLoginMessage(error?.message || 'Anmeldung fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.');
      console.error('Login-Fehler:', error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Anmelden';
      }
    }
  });
}
const logoutBtn = document.getElementById('logout');
const adminSidebar = document.getElementById('adminSidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const sidebarUser = document.getElementById('sidebarUser');
const refreshBtn = document.getElementById('refresh');
const listEl = document.getElementById('list');
const userEl = document.getElementById('user');
const newEl = document.getElementById('newc');
const openEl = document.getElementById('open');
const todayEl = document.getElementById('today');
const dashboardHome = document.getElementById('dashboardHome');
const requestsView = document.getElementById('requestsView');
const ordersView = document.getElementById('ordersView');
const orderList = document.getElementById('orderList');
const orderSearch = document.getElementById('orderSearch');
const orderStatusFilter = document.getElementById('orderStatusFilter');
const manualOrderForm = document.getElementById('manualOrderForm');
const manualOrderMsg = document.getElementById('manualOrderMsg');
const orderCountEl = document.getElementById('orderCount');
const orderVolumeEl = document.getElementById('orderVolume');
const orderOpenCountEl = document.getElementById('orderOpenCount');
const orderInProgressCountEl = document.getElementById('orderInProgressCount');
const orderCompletedCountEl = document.getElementById('orderCompletedCount');
const receiptsView = document.getElementById('receiptsView');
const invoicesView = document.getElementById('invoicesView');
const invoiceDraftForm = document.getElementById('invoiceDraftForm');
const invoiceDraftId = document.getElementById('invoiceDraftId');
const invoiceDraftItems = document.getElementById('invoiceDraftItems');
const invoiceDraftMsg = document.getElementById('invoiceDraftMsg');
const invoiceSettingsForm = document.getElementById('invoiceSettingsForm');
const invoiceNewBtn = document.getElementById('invoiceNewBtn');
const invoiceAddItemBtn = document.getElementById('invoiceAddItemBtn');
const invoiceDraftCancelBtn = document.getElementById('invoiceDraftCancelBtn');
const invoicePreviewBtn = document.getElementById('invoicePreviewBtn');
const invoiceSourceOrder = document.getElementById('invoiceSourceOrder');
const invoiceSourceOffer = document.getElementById('invoiceSourceOffer');
const issuedInvoiceList = document.getElementById('issuedInvoiceList');
const issuedInvoiceSearch = document.getElementById('issuedInvoiceSearch');
const issuedInvoiceCount = document.getElementById('issuedInvoiceCount');
const issuedInvoiceOpen = document.getElementById('issuedInvoiceOpen');
const issuedInvoicePaid = document.getElementById('issuedInvoicePaid');
const invoicePreviewModal = document.getElementById('invoicePreviewModal');
const invoicePreviewFrame = document.getElementById('invoicePreviewFrame');
const invoicePreviewMeta = document.getElementById('invoicePreviewMeta');
const invoicePreviewClose = document.getElementById('invoicePreviewClose');
const invoicePreviewEdit = document.getElementById('invoicePreviewEdit');
const invoicePreviewDownload = document.getElementById('invoicePreviewDownload');
const invoicePreviewPrint = document.getElementById('invoicePreviewPrint');
const invoicePreviewIssue = document.getElementById('invoicePreviewIssue');
const invoicePreviewZoomIn = document.getElementById('invoicePreviewZoomIn');
const invoicePreviewZoomOut = document.getElementById('invoicePreviewZoomOut');
const invoicePreviewZoomLabel = document.getElementById('invoicePreviewZoomLabel');
let currentInvoicePreviewUrl=null;
let currentInvoicePreviewId=null;
let currentInvoicePreviewZoom=100;
const offersView = document.getElementById('offersView');
const customersView = document.getElementById('customersView');
const existingCustomersView = document.getElementById('existingCustomersView');
const customerList = document.getElementById('customerList');
const customerSearch = document.getElementById('customerSearch');
const customerForm = document.getElementById('customerForm');
const customerMsg = document.getElementById('customerMsg');
const customerCount = document.getElementById('customerCount');
const customerId = document.getElementById('customerId');
const customerNumber = document.getElementById('customerNumber');
const customerCompany = document.getElementById('customerCompany');
const customerFirstName = document.getElementById('customerFirstName');
const customerLastName = document.getElementById('customerLastName');
const customerStreet = document.getElementById('customerStreet');
const customerHouseNumber = document.getElementById('customerHouseNumber');
const customerZip = document.getElementById('customerZip');
const customerCity = document.getElementById('customerCity');
const customerPhone = document.getElementById('customerPhone');
const customerEmail = document.getElementById('customerEmail');
const customerNotes = document.getElementById('customerNotes');
const saveCustomerBtn = document.getElementById('saveCustomerBtn');
const cancelCustomerBtn = document.getElementById('cancelCustomerBtn');
const offerList = document.getElementById('offerList');
const offerSearch = document.getElementById('offerSearch');
const offerStatusFilter = document.getElementById('offerStatusFilter');
const offerTotal = document.getElementById('offerTotal');
const offerOpenTotal = document.getElementById('offerOpenTotal');
const offerAcceptedTotal = document.getElementById('offerAcceptedTotal');
const offerRejectedTotal = document.getElementById('offerRejectedTotal');
const offerCount = document.getElementById('offerCount');
const refreshOffersBtn = document.getElementById('refreshOffersBtn');
const invoiceList = document.getElementById('invoiceList');
const invoiceTotal = document.getElementById('invoiceTotal');
const invoiceMonthTotal = document.getElementById('invoiceMonthTotal');
const invoiceSearch = document.getElementById('invoiceSearch');
const pageTitle = document.getElementById('pageTitle');
const dashNew = document.getElementById('dashNew');
const dashOpen = document.getElementById('dashOpen');
const dashToday = document.getElementById('dashToday');
const dashReceiptCount = document.getElementById('dashReceiptCount');
const dashYearGross = document.getElementById('dashYearGross');
const dashMonthGross = document.getElementById('dashMonthGross');
const dashYearCash = document.getElementById('dashYearCash');
const dashYearCard = document.getElementById('dashYearCard');
const dashYearTotal = document.getElementById('dashYearTotal');
const dashMonthTotal = document.getElementById('dashMonthTotal');
const dashInvoiceGross = document.getElementById('dashInvoiceGross');
const dashProfit = document.getElementById('dashProfit');

const INVOICE_TOTAL_URL = 'https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
const RECEIPT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbziO0qeGhs0URutEScjmDNF3tUPGiefZW37s6JxOQSJoY1PHpt2LwxzRQCxC0AMgX0q/exec';
const BELEG_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxJDx4fWqtWjWj056-ZsFJyVPBgB-6uarBsIH0Fmbf30F025o9CmlfhfKXvLU-KLh3Y/exec';
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
const financialYearLabel2 = document.getElementById('financialYearLabel2');
const financialMonthLabel = document.getElementById('financialMonthLabel');
const financialMonthlyTable = document.getElementById('financialMonthlyTable');
const RECHNUNGS_API_URL = 'https://script.google.com/macros/s/AKfycbxJDx4fWqtWjWj056-ZsFJyVPBgB-6uarBsIH0Fmbf30F025o9CmlfhfKXvLU-KLh3Y/exec';
const ANGEBOTE_API_URL = RECHNUNGS_API_URL;

// Google Apps Script GET-API über JSONP.
// GitHub Pages darf die Apps-Script-Antwort nicht per fetch() lesen,
// weil Apps Script hier keinen Access-Control-Allow-Origin-Header liefert.
function googleApiJsonp(baseUrl, params={}, timeoutMs=330000){
  return new Promise((resolve,reject)=>{
    // Nur einfache Buchstaben/Ziffern im Callback-Namen verwenden.
    // Das ist mit Google Apps Script JSONP maximal kompatibel.
    const callbackName='tsGoogleApi'+Date.now()+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    let finished=false;
    let timer=null;

    const cleanup=()=>{
      if(finished)return;
      finished=true;
      try{delete window[callbackName];}catch(e){window[callbackName]=undefined;}
      if(script.parentNode)script.parentNode.removeChild(script);
      if(timer)clearTimeout(timer);
    };

    window[callbackName]=(data)=>{
      cleanup();
      resolve(data||{});
    };

    script.onerror=()=>{
      cleanup();
      reject(new Error('Google-API konnte nicht geladen werden.'));
    };

    timer=setTimeout(()=>{
      cleanup();
      reject(new Error('Google-API antwortet nicht rechtzeitig.'));
    },timeoutMs);

    const query=new URLSearchParams();
    Object.entries(params||{}).forEach(([key,value])=>{
      if(value!==undefined && value!==null)query.set(key,String(value));
    });
    query.set('callback',callbackName);
    query.set('v',String(Date.now()));

    script.src=baseUrl+'?'+query.toString();
    script.async=true;
    document.head.appendChild(script);
  });
}
const OFFERS_INITIAL_SYNC_KEY = 'ts_serviceleistungen_offers_initial_sync_v5';
let currentOffers=[];
let currentCustomers=[];
let currentInvoices=[];
let appointmentDate = new Date();
let appointmentView = 'day';
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let requests=[];let selectedRequest=null;
let currentOrders=[];
let orderRequestIds=new Set();
let currentIssuedInvoices=[];
let currentInvoiceSettings=null;
let currentInvoiceTotal=null;
let currentReceiptTotal=null;

function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function formatDate(value){if(!value)return '—';const d=new Date(value+'T00:00:00');return Number.isNaN(d.getTime())?value:d.toLocaleDateString('de-DE')}
function showLoginMessage(message){loginMsg.textContent=message;loginMsg.classList.remove('hidden')}
async function init(){const {data,error}=await db.auth.getSession();if(error){showLoginMessage(error.message);return}const session=data.session;if(!session){loginEl.classList.remove('hidden');dashEl.classList.add('hidden');return}loginEl.classList.add('hidden');dashEl.classList.remove('hidden');if(userEl) userEl.textContent=session.user.email||'';if(sidebarUser)sidebarUser.textContent=session.user.email||'';showView('dashboard');await load();await loadReceipts();await loadFinancials();await loadInvoices();await loadOffers(false)}
async function load(){
  listEl.innerHTML='<p>Aktualisiere Anfragen...</p>';
  const {data,error}=await db.from('requests').select('*').order('created_at',{ascending:false});
  if(error){
    listEl.innerHTML=`<p class="notice">Fehler beim Laden: ${escapeHtml(error.message)}</p>`;
    return;
  }
  requests=data||[];
  await loadOrders();
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

  listEl.innerHTML=requests.map(x=>`<div class="row request-row"><div><b>${escapeHtml(x.first_name)} ${escapeHtml(x.last_name)}</b><small>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</small></div><div><b>${escapeHtml(x.make)} ${escapeHtml(x.model)}</b><small>${escapeHtml(x.vehicle_type)}${x.vehicle_class ? ' · '+escapeHtml(x.vehicle_class) : ''} · ${escapeHtml(x.color)}</small></div><div><b>${escapeHtml(x.service_type)}</b><small>${formatDate(x.requested_date)} · ${escapeHtml(x.requested_time||'—')}</small></div><div><span class="badge">${escapeHtml(x.status||'Neue Anfrage')}</span><br>${orderRequestIds.has(x.id)?'<button type="button" disabled>Auftrag angelegt</button>':`<button data-action="create-order" data-id="${x.id}">Auftrag erstellen</button>`}<button data-action="details" data-id="${x.id}">Details</button><button data-action="confirm" data-id="${x.id}">Bestätigen</button><button data-action="alternative" data-id="${x.id}">Alternative</button><button data-action="reject" data-id="${x.id}">Ablehnen</button><button data-action="delete" data-id="${x.id}">Löschen</button></div></div>`).join('');
}
function field(label,value){return `<div class="detail-field"><small>${escapeHtml(label)}</small><div>${escapeHtml(value||'—')}</div></div>`}
function arrayValue(value){return Array.isArray(value)&&value.length?value.join(', '):'—'}
async function openDetails(id){selectedRequest=requests.find(x=>x.id===id);if(!selectedRequest)return;const x=selectedRequest;detailTitle.textContent=`${x.first_name||''} ${x.last_name||''}`.trim()||'Anfrage';detailBody.innerHTML=`<div class="detail-grid">${field('Status',x.status)}${field('Leistung',x.service_type)}${field('Wunschdatum',formatDate(x.requested_date))}${field('Gewünschte Abgabezeit / Arbeitsbeginn',x.requested_time)}${field('Voraussichtliche Arbeitsdauer',x.duration_label|| (x.duration_hours?x.duration_hours+' Stunden':''))}${field('Voraussichtliches Ende',estimatedEnd(x))}${field('Vorname',x.first_name)}${field('Nachname',x.last_name)}${field('Telefon',x.phone)}${field('E-Mail',x.email)}${field('Fahrzeugart',x.vehicle_type)}${field('Fahrzeugklasse',x.vehicle_class)}${field('Hersteller',x.make)}${field('Modell / Typ',x.model)}${field('Farbe',x.color)}${field('Baujahr',x.year)}${field('Kennzeichen',x.plate)}${field('Verschmutzungsgrad',x.dirt_level)}${field('Tierhaare',x.pet_hair)}${field('Menge',x.quantity)}${field('Reifentyp',x.tire_type)}${field('Gewünschte Leistungen',arrayValue(x.care_options))}</div><div class="detail-text">${field('Details / Nachricht',x.details||x.message)}</div><div id="photoGallery" class="photo-gallery"><p>Fotos werden geladen...</p></div>`;detailActions.innerHTML=(orderRequestIds.has(x.id)?'<button type="button" disabled>Auftrag bereits angelegt</button>':'<button class="primary" data-modal-action="create-order">Auftrag erstellen</button>')+'<button class="primary" data-modal-action="confirm">Termin bestätigen</button><button data-modal-action="alternative">Alternativtermin</button><button data-modal-action="reject">Anfrage ablehnen</button><button data-modal-action="delete">Löschen</button>';modal.classList.remove('hidden');await loadRequestPhotos(x.id)}
async function loadRequestPhotos(requestId){const gallery=document.getElementById('photoGallery');if(!gallery)return;const {data,error}=await db.from('request_photos').select('storage_path,created_at').eq('request_id',requestId).order('created_at',{ascending:true});if(error){gallery.innerHTML=`<p class="notice">Fotos konnten nicht geladen werden: ${escapeHtml(error.message)}</p>`;return}if(!data||!data.length){gallery.innerHTML='<p>Keine Fotos vorhanden.</p>';return}const items=[];for(const photo of data){const {data:urlData,error:urlError}=await db.storage.from('vehicle-photos').createSignedUrl(photo.storage_path,3600);if(urlError||!urlData?.signedUrl){items.push(`<div class="photo-item"><p>Foto konnte nicht geladen werden.</p></div>`)}else{items.push(`<a class="photo-item" href="${escapeHtml(urlData.signedUrl)}" target="_blank" rel="noopener"><img src="${escapeHtml(urlData.signedUrl)}" alt="Fahrzeugfoto" loading="lazy"></a>`)}}gallery.innerHTML=`<h3>Fahrzeugfotos</h3><div class="photo-grid">${items.join('')}</div>`}
function closeDetails(){modal.classList.add('hidden');selectedRequest=null}
async function sendCustomerEmail(r,status,extra={}){const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Admin-Sitzung abgelaufen');const url=status==='Bestätigt'?CONFIRM_FUNCTION_URL:CUSTOMER_FUNCTION_URL;const body=status==='Bestätigt'?{request:r}:{request:r,status,...extra};const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify(body)});if(!response.ok){const t=await response.text();throw new Error(t||'E-Mail konnte nicht gesendet werden')}return response.json()}
function buildVehicleCalendarSegments(date,time,hours){
  let remaining=Number(hours),first=true,day=new Date(date+'T12:00:00');
  const segments=[];
  while(remaining>0){
    let start;
    if(first)start=new Date(date+'T'+time+':00');
    else{
      day.setDate(day.getDate()+1);
      while(day.getDay()===0||day.getDay()===6)day.setDate(day.getDate()+1);
      start=new Date(day.getFullYear(),day.getMonth(),day.getDate(),8,0,0,0);
    }
    const part=Math.min(remaining,8),end=new Date(start.getTime()+part*3600000);
    segments.push({start,end});remaining-=part;first=false;
  }
  return segments;
}
function estimatedEnd(r){
  const hours=Number(r.duration_hours);
  if(!r.requested_date||!/^[0-9]{2}:[0-9]{2}$/.test(r.requested_time||'')||!Number.isFinite(hours)||hours<=0)return '—';
  const segments=String(r.service_type||'').toLowerCase().includes('fahrzeug')
    ? buildVehicleCalendarSegments(r.requested_date,r.requested_time,hours)
    : [{start:new Date(r.requested_date+'T'+r.requested_time+':00'),end:new Date(new Date(r.requested_date+'T'+r.requested_time+':00').getTime()+hours*3600000)}];
  const end=segments[segments.length-1]?.end;
  return end&&!Number.isNaN(end.getTime())?end.toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'}):'—';
}
async function syncCalendarForRequest(previous,updated){
  const customer=`${updated.first_name||''} ${updated.last_name||''}`.trim() || 'Kunde';
  const marker=`Kundentermin – ${customer} – ${updated.service_type||'Leistung'}`;
  const {error:delError}=await db.from('personal_calendar_events').delete().eq('source','customer_request').eq('notes','Anfrage-ID: '+updated.id);
  if(delError)throw new Error('Kalendereintrag konnte nicht bereinigt werden: '+delError.message);
  if(updated.status!=='Bestätigt'||!updated.requested_date||!updated.requested_time)return;
  const {data:latest,error:loadError}=await db.from('requests').select('duration_hours,duration_label').eq('id',updated.id).single();
  if(loadError)throw new Error('Gespeicherte Auftragsdauer konnte nicht geladen werden: '+loadError.message);
  const hours=Number(latest?.duration_hours||updated.duration_hours||2);
  if(!Number.isFinite(hours)||hours<=0)throw new Error('Die berechnete Arbeitsdauer ist ungültig.');
  const requestedClock=String(updated.requested_time||'');
  const startClock=/^[0-9]{2}:[0-9]{2}$/.test(requestedClock)?requestedClock:(requestedClock.startsWith('13')?'13:00':requestedClock.startsWith('15')?'15:00':requestedClock.startsWith('10')?'10:00':'08:00');
  const st=String(updated.service_type||'').toLowerCase();
  const segments=st.includes('fahrzeug')
    ? buildVehicleCalendarSegments(updated.requested_date,startClock,hours)
    : [{start:new Date(`${updated.requested_date}T${startClock}:00`),end:new Date(new Date(`${updated.requested_date}T${startClock}:00`).getTime()+hours*3600000)}];
  const events=segments.map(segment=>({
    title:marker,
    event_type:st.includes('garten')?'garden':st.includes('fahrzeug')?'vehicle':'other',
    start_time:segment.start.toISOString(),
    end_time:segment.end.toISOString(),
    blocks_customer_bookings:true,
    source:'customer_request',
    notes:'Anfrage-ID: '+updated.id
  }));
  const {error:insError}=await db.from('personal_calendar_events').insert(events);
  if(insError)throw new Error('Kalendereintrag konnte nicht erstellt werden: '+insError.message);
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
        if(storageError)throw storageError;
      }
    }

    const {error:photosError}=await db.from('request_photos').delete().eq('request_id',id);
    if(photosError)throw photosError;

    const {error:blocksError}=await db.from('request_booking_blocks').delete().eq('request_id',id);
    if(blocksError)throw blocksError;

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

// Google-Sheets-Sync läuft bewusst im Hintergrund und darf die App nicht blockieren.
function syncReceiptToGoogle(row){
  if(!row || !row.id || !RECEIPT_SHEETS_URL)return;
  const payload={action:'syncReceipt',id:row.id,receipt_date:row.receipt_date||'',merchant:row.merchant||'',receipt_number:row.receipt_number||'',gross_amount:Number(row.gross_amount||0),category:row.category||'',description:row.description||'',payment_method:row.payment_method||'',storage_path:row.storage_path||''};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  fetch(RECEIPT_SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),signal:controller.signal})
    .catch(err=>console.warn('Google-Beleg-Sync:',err.message))
    .finally(()=>clearTimeout(timer));
}

function syncAllReceiptsToGoogle(rows){
  if(!Array.isArray(rows)||!rows.length)return;
  rows.forEach(row=>syncReceiptToGoogle(row));
}

async function loadFinancials(){
  const now=new Date();
  const year=now.getFullYear();
  const month=now.getMonth()+1;
  if(financialYearLabel) financialYearLabel.textContent=String(year);
  if(financialYearLabel2) financialYearLabel2.textContent=String(year);
  if(financialMonthLabel) financialMonthLabel.textContent=now.toLocaleDateString('de-DE',{month:'long',year:'numeric'});

  let invoiceYear=0, invoiceMonth=0;
  let monthlyInvoices=Array.from({length:12},()=>0);

  // First load the invoice API. A failure must NOT prevent the expense side
  // of the financial overview from being rendered.
  try{
    const result=await googleApiJsonp(RECHNUNGS_API_URL,{year:year});
    if(result && result.ok!==false){
      invoiceYear=Number(result.bruttoGesamtJahr ?? result.bruttoGesamt ?? 0)||0;
      if(Array.isArray(result.monatlich)){
        result.monatlich.forEach((v,i)=>{if(i<12) monthlyInvoices[i]=Number(v)||0;});
      }
      invoiceMonth=Number(result.bruttoGesamtMonat ?? monthlyInvoices[month-1] ?? 0)||0;

      // Monatswerte robust aus den gelieferten Rechnungszeilen ableiten.
      // Wichtig: Das bestehende Dashboard-Design und alle anderen Berechnungen bleiben unverändert.
      if(Array.isArray(result.rechnungen) && result.rechnungen.length){
        const parsed=result.rechnungen.map(r=>({
          amount:parseInvoiceMoney(
            r.bruttobetrag ?? r.brutto ?? r.gesamtbetrag ?? r.gesamt ?? r.betrag ?? r.amount ?? r.summe ?? 0
          ),
          date:String(
            r.rechnungsdatum ?? r.datum ?? r.date ?? r.invoice_date ?? r.rechnungsDate ?? r.created_at ?? ''
          ).trim()
        })).filter(r=>r.amount!==0 || r.date);

        // Nur dann aus Einzelrechnungen berechnen, wenn die API keine brauchbaren
        // Monatswerte geliefert hat. So werden Werte nicht doppelt addiert.
        const apiMonthlyHasValues=monthlyInvoices.some(v=>Number(v)>0);
        if(!apiMonthlyHasValues){
          monthlyInvoices=Array.from({length:12},()=>0);
          parsed.forEach(r=>{
            const d=parseFlexibleDate(r.date);
            if(d && d.getFullYear()===year) monthlyInvoices[d.getMonth()]+=r.amount;
          });
        }

        // Falls die API-Jahressumme nicht vorhanden wäre, ebenfalls aus den Zeilen rechnen.
        if(!invoiceYear){
          invoiceYear=parsed.reduce((sum,r)=>{
            const d=parseFlexibleDate(r.date);
            return d && d.getFullYear()===year ? sum+r.amount : sum;
          },0);
        }
        invoiceMonth=monthlyInvoices[month-1]||0;
      }
    }else{
      console.warn('Rechnungsdaten:',result.error||'API nicht erreichbar');
    }
  }catch(err){
    console.warn('Rechnungsdaten:',err.message);
  }

  const receiptTotals=window.receiptTotals||{year:{gross:0},month:{gross:0}};
  const expenseYear=Number(receiptTotals.year?.gross||0);
  const expenseMonth=Number(receiptTotals.month?.gross||0);

  if(dashInvoiceGross) dashInvoiceGross.textContent=euro(invoiceYear);
  if(dashInvoiceMonth) dashInvoiceMonth.textContent=euro(invoiceMonth);
  if(dashProfit) dashProfit.textContent=euro(invoiceYear-expenseYear);
  if(dashProfitMonth) dashProfitMonth.textContent=euro(invoiceMonth-expenseMonth);

  if(financialMonthlyTable){
    const rows=monthlyInvoices.map((income,i)=>{
      const expense=Number(window.receiptMonthlyTotals?.[i]||0);
      const profit=income-expense;
      const name=new Date(year,i,1).toLocaleDateString('de-DE',{month:'long'});
      return {name,income,expense,profit};
    });
    financialMonthlyTable.innerHTML=rows.map(r=>`<tr><td>${escapeHtml(r.name)}</td><td>${euro(r.income)}</td><td>${euro(r.expense)}</td><td>${euro(r.profit)}</td></tr>`).join('');
    const chart=document.getElementById('financialChart');
    if(chart){
      const max=Math.max(1,...rows.map(r=>Math.max(r.income,r.expense)));
      chart.innerHTML=rows.map(r=>{
        const ih=Math.max(2,Math.round(r.income/max*100));
        const eh=Math.max(2,Math.round(r.expense/max*100));
        return `<div class=\"chart-month\" title=\"${escapeHtml(r.name)}: Einnahmen ${euro(r.income)}, Ausgaben ${euro(r.expense)}\"><div class=\"chart-bars\"><span class=\"bar income\" style=\"height:${ih}%\"></span><span class=\"bar expense\" style=\"height:${eh}%\"></span></div><small>${escapeHtml(r.name.slice(0,3))}</small></div>`;
      }).join('');
    }
  }
}

function parseInvoiceMoney(value){
  if(typeof value==='number') return Number.isFinite(value)?value:0;
  let s=String(value??'').trim();
  if(!s)return 0;
  s=s.replace(/€/g,'').replace(/\s/g,'');
  // Deutsche Schreibweise: 1.234,56 -> 1234.56
  if(s.includes(',') && s.includes('.')) s=s.replace(/\./g,'').replace(',','.');
  else if(s.includes(',')) s=s.replace(',','.');
  // Falls nur Tausenderpunkte vorhanden sind: 1.234 -> 1234
  else if(/^[-+]?\d{1,3}(?:\.\d{3})+$/.test(s)) s=s.replace(/\./g,'');
  const n=Number(s);
  return Number.isFinite(n)?n:0;
}

function parseFlexibleDate(value){
  if(!value)return null;
  if(value instanceof Date && !isNaN(value))return value;
  const s=String(value).trim();
  let m=s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
  m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  const d=new Date(s);
  return isNaN(d)?null:d;
}
function dateYear(value){const d=parseFlexibleDate(value);return d?d.getFullYear():null;}

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

  // WICHTIG: Bereits geladene Belege werden hier NICHT erneut gesammelt
  // an Google Sheets gesendet. Das würde bei jedem Dashboard-Aufruf für
  // alle vorhandenen Belege parallele Apps-Script-Aufrufe erzeugen und
  // kann zu "Too many simultaneous calls: Tabellen" führen.
  // Ein neu gespeicherter Beleg wird weiter direkt über syncReceiptToGoogle()
  // synchronisiert.
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
  if(typeof pdfjsLib!=='undefined' && pdfjsLib.GlobalWorkerOptions){
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
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

    const savedReceiptForGoogle={
      id,
      receipt_date:receiptDate.value,
      merchant:receiptMerchant.value.trim()||null,
      receipt_number:receiptNumber.value.trim()||null,
      gross_amount:gross,
      category:receiptCategory.value,
      description:receiptDescription.value.trim()||null,
      payment_method:receiptPayment.value,
      storage_path:path
    };

    receiptForm.reset();
    receiptDate.value=new Date().toLocaleDateString('sv-SE');
    showOcrMsg('');
    ocrMsg.classList.add('hidden');
    showReceiptMsg(`Beleg erfolgreich gespeichert. Google Drive: ${driveResult.fileName||'archiviert'}`);
    syncReceiptToGoogle(savedReceiptForGoogle);
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


function normalizeCustomerText(value){
  return String(value??'').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.,;:()\[\]{}]/g,'');
}

function cleanInvoiceCustomerName(value){
  return String(value??'').trim()
    .replace(/\.(pdf)$/i,'')
    .replace(/^(herrn?|frau|familie)\s+/i,'')
    .replace(/\s+(?:durch\s+)?(?:direkt(?:überweisung|zahlung)|überweisung|barzahlung|bereits\s+bezahlt|schon\s+bezahlt|bezahlt|storno(?:\s+rechnung)?|rechnung\s+storniert).*$/i,'')
    .replace(/[-_]+/g,' ')
    .replace(/\s+/g,' ').trim();
}
function sameInvoicePerson(a,b){
  const tokens=v=>normalizeCustomerText(cleanInvoiceCustomerName(v)).split(/\s+/).filter(Boolean).sort();
  const x=tokens(a),y=tokens(b);
  return x.length===2 && y.length===2 && x[0]===y[0] && x[1]===y[1];
}
function invoiceCustomerParts(value){
  const raw=cleanInvoiceCustomerName(value);
  if(!raw)return {firma:'',vorname:'',nachname:''};
  const business=/\b(gmbh|ug|ag|kg|ohg|gbr|e\.k\.|e\.v\.|brandschutz|service|leistungen|fahrzeug|autohaus|autoteile|werkstatt|immobilien|verwaltung|handel|technik|solutions|logistik|bau|bauunternehmen|versicherung|hotel|gastronomie)\b/i.test(raw);
  const parts=raw.split(/\s+/).filter(Boolean);
  if(!business && parts.length===2)return {firma:'',vorname:parts[0],nachname:parts[1]};
  return {firma:raw,vorname:'',nachname:''};
}

function invoiceCustomerFromFilename(filename, invoiceNumber=''){
  let name=String(filename||'').trim();
  try{
    if(/^https?:\/\//i.test(name)){
      const url=new URL(name);
      name=decodeURIComponent(url.pathname.split('/').pop()||'');
    }else{
      name=decodeURIComponent(name.split(/[\\/]/).pop()||name);
    }
  }catch(e){
    name=String(filename||'').split(/[\\/]/).pop()||'';
  }
  name=name.replace(/\.pdf$/i,'').trim();
  const number=String(invoiceNumber||'').trim();
  if(number && name.toLowerCase().startsWith(number.toLowerCase())){
    name=name.slice(number.length);
  }
  name=name.replace(/^(?:RE|RECHNUNG|R|INVOICE)[-_ ]?\d{4,}[-_ ]*/i,'');
  name=name.replace(/^[\s_-]+|[\s_-]+$/g,'').replace(/_+/g,' ').replace(/\s+/g,' ').trim();
  return name && !/^TEMP_/i.test(name) ? name : '';
}

function invoiceSourceLink(invoice){
  const candidates=[invoice?.pdf_url,invoice?.drive_url,invoice?.url,invoice?.quelldatei];
  const source=candidates.find(value=>String(value||'').trim());
  if(!source)return null;
  const value=String(source).trim();
  if(/^https?:\/\//i.test(value))return {href:value,label:'PDF'};
  if(/^[A-Za-z0-9_-]{25,}$/.test(value))return {href:'https://drive.google.com/open?id='+encodeURIComponent(value),label:'PDF'};
  // Alte API-Versionen liefern manchmal nur den Dateinamen. Dann Drive-Suche öffnen,
  // statt einen ungültigen relativen GitHub-Pages-Link zu erzeugen.
  return {href:'https://drive.google.com/drive/search?q='+encodeURIComponent(value),label:'In Drive suchen'};
}

async function syncInvoiceCustomers(rows){
  if(!Array.isArray(rows)||!rows.length)return;
  try{
    const {data:existing,error}=await db.from('customers').select('*');
    if(error)throw error;
    const customers=Array.isArray(existing)?existing:[];
    let changed=false;
    for(const invoice of rows){
      const invoiceName=cleanInvoiceCustomerName(invoice.kunde);
      if(!invoiceName || invoiceName==='—')continue;
      const norm=normalizeCustomerText(invoiceName);
      const parts=invoiceCustomerParts(invoiceName);
      const fullName=normalizeCustomerText([parts.vorname,parts.nachname].filter(Boolean).join(' '));
      let match=customers.find(c=>{
        const company=normalizeCustomerText(cleanInvoiceCustomerName(c.firma));
        const name=[c.vorname,c.nachname].filter(Boolean).join(' ');
        return (company && company===norm) ||
          (fullName && sameInvoicePerson(name,fullName)) ||
          (!parts.firma && sameInvoicePerson(name,invoiceName)) ||
          (!parts.firma && sameInvoicePerson(c.firma,invoiceName));
      });
      if(match){
        const patch={updated_at:new Date().toISOString()};
        if(!match.firma && parts.firma)patch.firma=parts.firma;
        if(!match.vorname && parts.vorname)patch.vorname=parts.vorname;
        if(!match.nachname && parts.nachname)patch.nachname=parts.nachname;
        if(Object.keys(patch).length>1){
          const {error:updateError}=await db.from('customers').update(patch).eq('id',match.id);
          if(updateError)console.warn('Rechnungskunde konnte nicht ergänzt werden:',updateError.message);
          else Object.assign(match,patch);
        }
      }else{
        const payload={
          kundennummer:null,
          firma:parts.firma||null,
          vorname:parts.vorname||null,
          nachname:parts.nachname||null,
          strasse:null,hausnummer:null,plz:null,ort:null,land:'Deutschland',
          telefon:null,email:null,notizen:'Automatisch aus Rechnung übernommen.',
          updated_at:new Date().toISOString()
        };
        const {data:newCustomer,error:insertError}=await db.from('customers').insert(payload).select().single();
        if(insertError)console.warn('Rechnungskunde konnte nicht angelegt werden:',insertError.message);
        else if(newCustomer){customers.push(newCustomer);changed=true;}
      }
    }
    if(changed && customersView && !customersView.classList.contains('hidden'))renderCustomers();
  }catch(err){
    console.warn('Kundenübernahme aus Rechnungen fehlgeschlagen:',err.message);
  }
}


function invoiceField(id){return document.getElementById(id)?.value?.trim()||''}
function invoiceSetField(id,value){const el=document.getElementById(id);if(el)el.value=value??''}
function addInvoiceItemRow(description='',quantity='1',price='0.00'){
  const row=document.createElement('div');
  row.className='invoice-item-row';
  row.innerHTML='<label>Leistung / Beschreibung<input data-inv-item-description required></label><label>Menge<input data-inv-item-quantity type="number" min="0.001" step="0.001" value="1" required></label><label>Einzelpreis (€)<input data-inv-item-price type="number" min="0" step="0.01" value="0.00" required></label><button type="button" class="danger-btn" data-inv-item-remove aria-label="Position entfernen">×</button>';
  row.querySelector('[data-inv-item-description]').value=description;
  row.querySelector('[data-inv-item-quantity]').value=quantity;
  row.querySelector('[data-inv-item-price]').value=price;
  invoiceDraftItems?.appendChild(row);
}
function resetInvoiceDraft(){
  invoiceDraftForm?.reset();
  if(invoiceDraftId)invoiceDraftId.value='';
  invoiceSourceOrder.value='';
  invoiceSourceOffer.value='';
  invoiceDraftItems.innerHTML='';
  addInvoiceItemRow();
  invoiceDraftMsg.textContent='';
}
async function loadInvoiceSettings(){
  const {data,error}=await db.from('invoice_settings').select('*').eq('id',1).maybeSingle();
  if(error)throw error;
  currentInvoiceSettings=data;
  if(!data)return;
  invoiceSetField('invSellerName',data.seller_name);
  invoiceSetField('invSellerContactName',data.seller_contact_name);
  invoiceSetField('invSellerStreet',data.seller_street);
  invoiceSetField('invSellerZip',data.seller_postal_code);
  invoiceSetField('invSellerCity',data.seller_city);
  invoiceSetField('invSellerEmail',data.seller_email);
  invoiceSetField('invSellerPhone',data.seller_phone);
  invoiceSetField('invSellerWebsite',data.seller_website);
  invoiceSetField('invSellerTaxNumber',data.seller_tax_number);
  invoiceSetField('invSellerVatId',data.seller_vat_id);
  invoiceSetField('invSellerBank',data.seller_bank_name);
  invoiceSetField('invSellerIban',data.seller_iban);
  invoiceSetField('invSellerBic',data.seller_bic);
  invoiceSetField('invPaymentDays',data.payment_terms_days??14);
  invoiceSetField('invPrefix',data.invoice_prefix||'RE');
  invoiceSetField('invCancelPrefix',data.cancellation_prefix||'ST');
}
async function saveInvoiceSettings(event){
  event.preventDefault();
  const payload={id:1,seller_name:invoiceField('invSellerName'),seller_contact_name:invoiceField('invSellerContactName'),seller_street:invoiceField('invSellerStreet'),seller_postal_code:invoiceField('invSellerZip'),seller_city:invoiceField('invSellerCity'),seller_country_code:'DE',seller_email:invoiceField('invSellerEmail'),seller_phone:invoiceField('invSellerPhone'),seller_website:invoiceField('invSellerWebsite'),seller_tax_number:invoiceField('invSellerTaxNumber'),seller_vat_id:invoiceField('invSellerVatId'),seller_bank_name:invoiceField('invSellerBank'),seller_iban:invoiceField('invSellerIban').replace(/\s/g,''),seller_bic:invoiceField('invSellerBic'),payment_terms_days:Number(invoiceField('invPaymentDays')||14),invoice_prefix:invoiceField('invPrefix')||'RE',cancellation_prefix:invoiceField('invCancelPrefix')||'ST',tax_mode:'small_business',updated_at:new Date().toISOString()};
  if(!payload.seller_name||!payload.seller_street||!payload.seller_postal_code||!payload.seller_city||(!payload.seller_tax_number&&!payload.seller_vat_id)){invoiceSettingsMsg.textContent='Bitte Name, Anschrift und Steuernummer oder USt-IdNr. eintragen.';return;}
  const {error}=await db.from('invoice_settings').upsert(payload,{onConflict:'id'});
  if(error){invoiceSettingsMsg.textContent='Speichern fehlgeschlagen: '+error.message;return;}
  currentInvoiceSettings=payload;
  invoiceSettingsMsg.textContent='Rechnungseinstellungen gespeichert.';
}
function populateInvoiceSources(){
  if(invoiceSourceOrder)invoiceSourceOrder.innerHTML='<option value="">Kein Auftrag</option>'+currentOrders.map(o=>'<option value="'+escapeHtml(o.id)+'">'+escapeHtml(o.order_number+' · '+o.customer_name+' · '+euro(o.agreed_amount||0))+'</option>').join('');
  if(invoiceSourceOffer)invoiceSourceOffer.innerHTML='<option value="">Kein Angebot</option>'+currentOffers.map(o=>'<option value="'+escapeHtml(o.id)+'">'+escapeHtml((o.angebotsnummer||'Angebot')+' · '+(o.kundenname||o.firma||'')+' · '+euro(o.betrag||0))+'</option>').join('');
}
async function loadIssuedInvoices(){
  if(!issuedInvoiceList)return;
  issuedInvoiceList.innerHTML='<p>Neue Rechnungen werden geladen…</p>';
  try{
    const {data,error}=await db.from('issued_invoices').select('*,invoice_items(*),invoice_payments(*),invoice_documents(*)').order('created_at',{ascending:false});
    if(error)throw error;
    currentIssuedInvoices=data||[];
    renderIssuedInvoices();
  }catch(error){issuedInvoiceList.innerHTML='<p class="notice">Neue Rechnungen konnten nicht geladen werden: '+escapeHtml(error.message)+'</p>';}
}
function renderIssuedInvoices(){
  if(!issuedInvoiceList)return;
  const search=(issuedInvoiceSearch?.value||'').trim().toLowerCase();
  const rows=currentIssuedInvoices.filter(inv=>[inv.invoice_number,inv.customer_name,inv.customer_company,inv.notes,inv.status].join(' ').toLowerCase().includes(search));
  const issued=currentIssuedInvoices.filter(x=>x.status!=='draft');
  const open=issued.filter(x=>x.status==='issued').reduce((s,x)=>s+Math.max(0,Number(x.total||0)-Number(x.amount_paid||0)),0);
  const paid=issued.reduce((s,x)=>s+Number(x.amount_paid||0),0);
  issuedInvoiceCount.textContent=String(issued.length);
  issuedInvoiceOpen.textContent=euro(open);
  issuedInvoicePaid.textContent=euro(paid);
  if(!rows.length){issuedInvoiceList.innerHTML='<div class="empty-box">Noch keine eigenen Rechnungen vorhanden. Über „Neue Rechnung“ kannst du einen Entwurf anlegen.</div>';return;}
  issuedInvoiceList.innerHTML=rows.map(inv=>{
    const paidAmount=Number(inv.amount_paid||0), total=Number(inv.total||0);
    const paymentStatus=inv.document_type==='cancellation'?'Stornobeleg':inv.status==='cancelled'?'Storniert':inv.status==='draft'?'Entwurf':paidAmount>=total?'Bezahlt':paidAmount>0?'Teilbezahlt':'Offen';
    const badgeClass=inv.status==='cancelled'?'invoice-status-cancelled':inv.status==='draft'?'invoice-status-draft':paidAmount>=total?'invoice-status-paid':paidAmount>0?'invoice-status-partial':'invoice-status-open';
    const num=inv.invoice_number||'Entwurf';
    const date=inv.invoice_date?formatDate(inv.invoice_date):formatDate(String(inv.created_at||'').slice(0,10));
    const hasPdf=(inv.invoice_documents||[]).some(d=>d.document_kind==='pdf');
    const hasXml=(inv.invoice_documents||[]).some(d=>d.document_kind==='xrechnung_xml');
    const actions=inv.status==='draft'
      ? '<button type="button" class="secondary-btn" data-invoice-edit="'+inv.id+'">Entwurf bearbeiten</button><button type="button" class="gold-btn" data-invoice-preview="'+inv.id+'">Vorschau / Freigabe</button><button type="button" class="danger-btn" data-invoice-delete="'+inv.id+'">Entwurf löschen</button>'
      : (hasPdf?'<button type="button" class="secondary-btn" data-invoice-download="'+inv.id+'" data-kind="pdf">PDF herunterladen</button>':'')+
        (hasXml?'<button type="button" class="secondary-btn" data-invoice-download="'+inv.id+'" data-kind="xrechnung_xml">XRechnung XML</button>':'')+
        '<button type="button" class="secondary-btn" data-invoice-generate-docs="'+inv.id+'">Dokumente (neu) erzeugen</button>'+
        (inv.status==='issued'&&inv.document_type==='invoice'?(paidAmount<=0?'<button type="button" class="danger-btn" data-invoice-cancel="'+inv.id+'">Stornieren</button>':'<button type="button" class="secondary-btn" disabled title="Vor Stornierung erst Zahlung/Rückerstattung klären">Stornierung nach Zahlung klären</button>')+'<button type="button" class="secondary-btn" data-invoice-payment="'+inv.id+'">Zahlung erfassen</button>':'');
    return '<article class="issued-invoice-card"><div class="issued-invoice-top"><div><span class="eyebrow">'+(inv.document_type==='cancellation'?'STORNORECHNUNG':'RECHNUNG')+'</span><h3>'+escapeHtml(num)+'</h3><p>'+escapeHtml(inv.customer_company||inv.customer_name)+' · '+escapeHtml(date)+'</p></div><div class="issued-invoice-amount">'+euro(total)+'</div></div><div class="issued-invoice-meta"><span class="invoice-status '+badgeClass+'">'+paymentStatus+'</span><span>Bezahlt: '+euro(paidAmount)+'</span><span>Offen: '+euro(Math.max(0,total-paidAmount))+'</span></div><div class="issued-invoice-actions">'+actions+'</div>'+(inv.cancellation_invoice_id?'<small>Stornobeleg vorhanden.</small>':'')+'</article>';
  }).join('');
}
async function createInvoiceDraft(event,options={}){
  event?.preventDefault();
  const rows=[...invoiceDraftItems.querySelectorAll('.invoice-item-row')].map(row=>({description:row.querySelector('[data-inv-item-description]').value.trim(),quantity:Number(row.querySelector('[data-inv-item-quantity]').value),unit_price:Number(row.querySelector('[data-inv-item-price]').value)}));
  if(!rows.length||rows.some(x=>!x.description||!Number.isFinite(x.quantity)||x.quantity<=0||!Number.isFinite(x.unit_price)||x.unit_price<0)){invoiceDraftMsg.textContent='Bitte alle Rechnungspositionen korrekt ausfüllen.';return;}
  const orderId=invoiceSourceOrder.value||null, offerId=invoiceSourceOffer.value||null;
  if(orderId&&offerId){invoiceDraftMsg.textContent='Bitte entweder einen Auftrag oder ein Angebot auswählen, nicht beides.';return;}
  const customerName=invoiceField('invoiceCustomerName');
  const subtotal=rows.reduce((sum,x)=>sum+Math.round(x.quantity*x.unit_price*100)/100,0);
  const payload={order_id:orderId,offer_id:offerId,customer_name:customerName,customer_company:invoiceField('invoiceCustomerCompany')||null,customer_street:invoiceField('invoiceCustomerStreet'),customer_postal_code:invoiceField('invoiceCustomerZip'),customer_city:invoiceField('invoiceCustomerCity'),customer_email:invoiceField('invoiceCustomerEmail')||null,customer_vat_id:invoiceField('invoiceCustomerVatId')||null,buyer_reference:invoiceField('invoiceBuyerReference')||null,service_date:invoiceField('invoiceServiceDate')||null,output_format:invoiceField('invoiceOutputFormat')||'pdf_xrechnung',seller_identifier:invoiceField('invoiceSellerIdentifier')||null,notes:invoiceField('invoiceDraftNotes')||null,subtotal,total:subtotal,tax_total:0};
  const source=orderId?currentOrders.find(x=>x.id===orderId):offerId?currentOffers.find(x=>x.id===offerId):null;
  payload.customer_id=source?.customer_id||null;
  const draftId=invoiceDraftId?.value||'';
  let invoice,error;
  if(draftId){
    const result=await db.from('issued_invoices').update(payload).eq('id',draftId).eq('status','draft').select('*').single();
    invoice=result.data;error=result.error;
  }else{
    const result=await db.from('issued_invoices').insert(payload).select('*').single();
    invoice=result.data;error=result.error;
  }
  if(error){invoiceDraftMsg.textContent='Entwurf konnte nicht gespeichert werden: '+error.message;return;}
  if(draftId){const {error:removeError}=await db.from('invoice_items').delete().eq('invoice_id',draftId);if(removeError){invoiceDraftMsg.textContent='Alte Positionen konnten nicht ersetzt werden: '+removeError.message;return;}}
  const items=rows.map((x,i)=>({...x,invoice_id:invoice.id,position:i+1,unit_code:'C62'}));
  const {error:itemError}=await db.from('invoice_items').insert(items);
  if(itemError){invoiceDraftMsg.textContent='Positionen konnten nicht gespeichert werden: '+itemError.message;return;}
  const shouldPreview=options.preview===true;
  invoiceDraftForm.classList.add('hidden');
  await loadIssuedInvoices();
  if(shouldPreview){
    const saved=currentIssuedInvoices.find(x=>x.id===invoice.id);
    if(saved)await openInvoicePreview(saved);
    else invoiceDraftMsg.textContent='Entwurf gespeichert, konnte aber für die Vorschau nicht neu geladen werden.';
  }else{
    resetInvoiceDraft();
    alert('Rechnungsentwurf wurde gespeichert. Vor der Ausstellung bitte Firmendaten und Kundenanschrift prüfen.');
  }
}
async function openInvoiceDraftFromOrder(orderId){
  const order=currentOrders.find(x=>x.id===orderId);if(!order)return;
  resetInvoiceDraft();
  invoiceDraftForm.classList.remove('hidden');
  invoiceSourceOrder.value=order.id;
  invoiceSetField('invoiceCustomerName',order.customer_name);
  invoiceSetField('invoiceCustomerCompany','');invoiceSetField('invoiceCustomerStreet','');invoiceSetField('invoiceCustomerZip','');invoiceSetField('invoiceCustomerCity','');
  invoiceSetField('invoiceCustomerEmail',order.customer_email);
  invoiceSetField('invoiceServiceDate',order.scheduled_date||new Date().toLocaleDateString('sv-SE'));
  const {data:customer}=order.customer_id?await db.from('customers').select('*').eq('id',order.customer_id).maybeSingle():{data:null};
  if(customer){
    invoiceSetField('invoiceCustomerCompany',customer.firma);
    invoiceSetField('invoiceCustomerStreet',[customer.strasse,customer.hausnummer].filter(Boolean).join(' '));
    invoiceSetField('invoiceCustomerZip',customer.plz);
    invoiceSetField('invoiceCustomerCity',customer.ort);
    invoiceSetField('invoiceCustomerEmail',customer.email||order.customer_email);
  }
  invoiceDraftItems.innerHTML='';
  addInvoiceItemRow(order.description||order.service_type,'1',Number(order.agreed_amount||0).toFixed(2));
  invoiceDraftForm.scrollIntoView({behavior:'smooth',block:'start'});
}
async function onInvoiceSourceOrder(){
  const id=invoiceSourceOrder.value;if(!id)return;
  invoiceSourceOffer.value='';
  const order=currentOrders.find(x=>x.id===id);if(!order)return;
  invoiceSetField('invoiceCustomerName',order.customer_name);
  invoiceSetField('invoiceCustomerEmail',order.customer_email);
  invoiceSetField('invoiceServiceDate',order.scheduled_date||new Date().toLocaleDateString('sv-SE'));
  const {data:customer}=order.customer_id?await db.from('customers').select('*').eq('id',order.customer_id).maybeSingle():{data:null};
  if(customer){invoiceSetField('invoiceCustomerCompany',customer.firma);invoiceSetField('invoiceCustomerStreet',[customer.strasse,customer.hausnummer].filter(Boolean).join(' '));invoiceSetField('invoiceCustomerZip',customer.plz);invoiceSetField('invoiceCustomerCity',customer.ort);}
  invoiceDraftItems.innerHTML='';addInvoiceItemRow(order.description||order.service_type,'1',Number(order.agreed_amount||0).toFixed(2));
}
async function onInvoiceSourceOffer(){
  const id=invoiceSourceOffer.value;if(!id)return;
  invoiceSourceOrder.value='';
  const offer=currentOffers.find(x=>x.id===id);if(!offer)return;
  invoiceSetField('invoiceCustomerName',offer.kundenname||offer.firma||'');
  invoiceSetField('invoiceCustomerCompany',offer.firma||'');invoiceSetField('invoiceCustomerStreet','');invoiceSetField('invoiceCustomerZip','');invoiceSetField('invoiceCustomerCity','');invoiceSetField('invoiceCustomerEmail','');
  invoiceSetField('invoiceServiceDate',new Date().toLocaleDateString('sv-SE'));
  const {data:customer}=offer.customer_id?await db.from('customers').select('*').eq('id',offer.customer_id).maybeSingle():{data:null};
  if(customer){invoiceSetField('invoiceCustomerName',[customer.vorname,customer.nachname].filter(Boolean).join(' ')||customer.firma);invoiceSetField('invoiceCustomerCompany',customer.firma);invoiceSetField('invoiceCustomerStreet',[customer.strasse,customer.hausnummer].filter(Boolean).join(' '));invoiceSetField('invoiceCustomerZip',customer.plz);invoiceSetField('invoiceCustomerCity',customer.ort);invoiceSetField('invoiceCustomerEmail',customer.email);}
  invoiceDraftItems.innerHTML='';addInvoiceItemRow(offer.beschreibung||'Leistung gemäß Angebot '+(offer.angebotsnummer||''),'1',Number(offer.betrag||0).toFixed(2));
}
function xmlEscape(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&apos;")}
function buildXRechnungXml(inv,items){
  const s=inv.seller_snapshot||currentInvoiceSettings||{};
  const buyerName=inv.customer_company||inv.customer_name;
  const sellerTax=s.vat_id?'<cac:PartyTaxScheme><cbc:CompanyID>'+xmlEscape(s.vat_id)+'</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>':'<cac:PartyTaxScheme><cbc:CompanyID>'+xmlEscape(s.tax_number)+'</cbc:CompanyID><cac:TaxScheme><cbc:ID>FC</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>';
  const party=(name,street,zip,city,country,email,tax='',options={})=>
    '<cac:Party>'+(options.endpoint?'<cbc:EndpointID schemeID="EM">'+xmlEscape(options.endpoint)+'</cbc:EndpointID>':'')+
    (options.identifier?'<cac:PartyIdentification><cbc:ID>'+xmlEscape(options.identifier)+'</cbc:ID></cac:PartyIdentification>':'')+
    '<cac:PartyName><cbc:Name>'+xmlEscape(name)+'</cbc:Name></cac:PartyName><cac:PostalAddress><cbc:StreetName>'+xmlEscape(street)+'</cbc:StreetName><cbc:CityName>'+xmlEscape(city)+'</cbc:CityName><cbc:PostalZone>'+xmlEscape(zip)+'</cbc:PostalZone><cac:Country><cbc:IdentificationCode>'+xmlEscape(country||'DE')+'</cbc:IdentificationCode></cac:Country></cac:PostalAddress>'+tax+
    '<cac:PartyLegalEntity><cbc:RegistrationName>'+xmlEscape(name)+'</cbc:RegistrationName>'+(options.legalForm?'<cbc:CompanyLegalForm>'+xmlEscape(options.legalForm)+'</cbc:CompanyLegalForm>':'')+'</cac:PartyLegalEntity>'+
    (options.contactName||options.phone||email?'<cac:Contact>'+(options.contactName?'<cbc:Name>'+xmlEscape(options.contactName)+'</cbc:Name>':'')+(options.phone?'<cbc:Telephone>'+xmlEscape(options.phone)+'</cbc:Telephone>':'')+(email?'<cbc:ElectronicMail>'+xmlEscape(email)+'</cbc:ElectronicMail>':'')+'</cac:Contact>':'')+'</cac:Party>';
  const total=Math.abs(Number(inv.total||0)).toFixed(2), sub=Math.abs(Number(inv.subtotal||0)).toFixed(2);
  const isCredit=inv.document_type==='cancellation';
  const lineXml=items.map((it,i)=>{
    const line=Math.abs(Number(it.line_total||Number(it.quantity)*Number(it.unit_price))).toFixed(2);
    const qty=Math.abs(Number(it.quantity||1));
    const taxCat='<cac:ClassifiedTaxCategory><cbc:ID>E</cbc:ID><cbc:Percent>0</cbc:Percent><cbc:TaxExemptionReason>Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG</cbc:TaxExemptionReason><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory>';
    return isCredit?'<cac:CreditNoteLine><cbc:ID>'+(i+1)+'</cbc:ID><cbc:CreditedQuantity unitCode="'+xmlEscape(it.unit_code||'C62')+'">'+qty+'</cbc:CreditedQuantity><cbc:LineExtensionAmount currencyID="EUR">'+line+'</cbc:LineExtensionAmount><cac:Item><cbc:Name>'+xmlEscape(it.description)+'</cbc:Name>'+taxCat+'</cac:Item><cac:Price><cbc:PriceAmount currencyID="EUR">'+Number(it.unit_price||0).toFixed(2)+'</cbc:PriceAmount></cac:Price></cac:CreditNoteLine>':'<cac:InvoiceLine><cbc:ID>'+(i+1)+'</cbc:ID><cbc:InvoicedQuantity unitCode="'+xmlEscape(it.unit_code||'C62')+'">'+qty+'</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="EUR">'+line+'</cbc:LineExtensionAmount><cac:Item><cbc:Name>'+xmlEscape(it.description)+'</cbc:Name>'+taxCat+'</cac:Item><cac:Price><cbc:PriceAmount currencyID="EUR">'+Number(it.unit_price||0).toFixed(2)+'</cbc:PriceAmount></cac:Price></cac:InvoiceLine>';
  }).join('');
  const root=isCredit?'CreditNote':'Invoice';
  const type=isCredit?'<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>':'<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>';
  const lines=isCredit?'<cac:CreditNoteLine>':'<cac:InvoiceLine>';
  const ref=isCredit&&inv.original_invoice_id?'<cac:BillingReference><cac:InvoiceDocumentReference><cbc:ID>'+xmlEscape(currentIssuedInvoices.find(x=>x.id===inv.original_invoice_id)?.invoice_number||'')+'</cbc:ID></cac:InvoiceDocumentReference></cac:BillingReference>':'';
  return '<?xml version="1.0" encoding="UTF-8"?>\n<'+root+' xmlns="urn:oasis:names:specification:ubl:schema:xsd:'+root+'-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID><cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID><cbc:ID>'+xmlEscape(inv.invoice_number)+'</cbc:ID><cbc:IssueDate>'+xmlEscape(inv.invoice_date)+'</cbc:IssueDate>'+type+(inv.due_date?'<cbc:DueDate>'+xmlEscape(inv.due_date)+'</cbc:DueDate>':'')+'<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>'+(inv.buyer_reference?'<cbc:BuyerReference>'+xmlEscape(inv.buyer_reference)+'</cbc:BuyerReference>':'')+ref+'<cac:AccountingSupplierParty>'+party(s.name,s.street,s.postal_code,s.city,s.country_code,s.email,sellerTax,{endpoint:s.email,identifier:inv.seller_identifier,contactName:s.contact_name,phone:s.phone,legalForm:'Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG'})+'</cac:AccountingSupplierParty><cac:AccountingCustomerParty>'+party(buyerName,inv.customer_street,inv.customer_postal_code,inv.customer_city,inv.customer_country_code,inv.customer_email,inv.customer_vat_id?'<cac:PartyTaxScheme><cbc:CompanyID>'+xmlEscape(inv.customer_vat_id)+'</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>':'',{endpoint:inv.customer_email})+'</cac:AccountingCustomerParty>'+(inv.service_date?'<cac:Delivery><cbc:ActualDeliveryDate>'+xmlEscape(inv.service_date)+'</cbc:ActualDeliveryDate></cac:Delivery>':'')+(s.iban?'<cac:PaymentMeans><cbc:PaymentMeansCode>58</cbc:PaymentMeansCode><cac:PayeeFinancialAccount><cbc:ID>'+xmlEscape(s.iban)+'</cbc:ID>'+(s.bank_name?'<cbc:Name>'+xmlEscape(s.bank_name)+'</cbc:Name>':'')+'</cac:PayeeFinancialAccount></cac:PaymentMeans>':'')+'<cac:TaxTotal><cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">'+sub+'</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount><cac:TaxCategory><cbc:ID>E</cbc:ID><cbc:Percent>0</cbc:Percent><cbc:TaxExemptionReason>Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG</cbc:TaxExemptionReason><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="EUR">'+sub+'</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="EUR">'+sub+'</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="EUR">'+total+'</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="EUR">'+total+'</cbc:PayableAmount></cac:LegalMonetaryTotal>'+lineXml+'</'+root+'>';
}
function buildInvoicePdf(inv,items){
  if(!window.jspdf?.jsPDF)throw new Error('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const s=inv.seller_snapshot||currentInvoiceSettings||{};
  const pageW=210,pageH=297,left=20,right=190;
  const fmtDate=value=>value?formatDate(value):'—';
  const money=value=>euro(Number(value||0));
  const safe=value=>String(value??'').trim();
  const sellerName=safe(s.name||s.seller_name);
  const sellerStreet=safe(s.street||s.seller_street);
  const sellerPlace=[s.postal_code||s.seller_postal_code,s.city||s.seller_city].filter(Boolean).join(' ');
  const sellerEmail=safe(s.email||s.seller_email);
  const sellerPhone=safe(s.phone||s.seller_phone);
  const taxNumber=safe(s.tax_number||s.seller_tax_number);
  const iban=safe(s.iban||s.seller_iban);
  const bank=safe(s.bank_name||s.seller_bank_name);
  const bic=safe(s.bic||s.seller_bic);
  const recipient=safe(inv.customer_company||inv.customer_name);
  const recipientLine=[inv.customer_postal_code,inv.customer_city].filter(Boolean).join(' ');
  const dueText=inv.due_date?fmtDate(inv.due_date):'';
  const title=inv.document_type==='cancellation'?'STORNORECHNUNG':'RECHNUNG';
  let page=1,y=20;
  const addFooter=()=>{
    doc.setDrawColor(205,195,174);doc.setLineWidth(.25);doc.line(left,270,right,270);
    doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(65,65,65);
    doc.text('T.S. Serviceleistungen',left,276);
    doc.setFont('helvetica','normal');doc.text(sellerStreet,left,281);doc.text(sellerPlace,left,286);doc.text('Deutschland',left,291);
    doc.setFont('helvetica','bold');doc.text('KONTAKT',82,276);
    doc.setFont('helvetica','normal');doc.text('TEL. '+sellerPhone,82,281);doc.text('E-MAIL '+sellerEmail,82,286);doc.text('STEUER-NR. '+taxNumber,82,291);
    doc.setFont('helvetica','bold');doc.text('BANK',151,276);
    doc.setFont('helvetica','normal');doc.text('IBAN '+iban,151,281);doc.text('BIC '+bic,151,286);doc.text('Inhaber Thomas Schwetz',151,291);
    doc.setFontSize(7);doc.text(page+'/'+Math.max(page,doc.getNumberOfPages()),right,294,{align:'right'});
  };
  const newPage=()=>{
    addFooter();doc.addPage();page++;y=22;
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(30,30,30);
    doc.text(sellerName+' – '+title+' – Fortsetzung',left,y);y+=12;
  };
  const ensureSpace=height=>{if(y+height>263)newPage();};
  doc.setTextColor(35,35,35);doc.setFont('helvetica','normal');doc.setFontSize(8);
  doc.text(sellerName,left,18);doc.text(sellerStreet,left,23);doc.text(sellerPlace,left,28);
  doc.setFont('helvetica','bold');doc.setFontSize(8);
  const meta=[
    ['RECHNUNGS-NR.',safe(inv.invoice_number||'ENTWURF')],
    ['RECHNUNGSDATUM',fmtDate(inv.invoice_date)],
    ['LIEFERDATUM',fmtDate(inv.service_date)],
    ['IHRE KUNDENNUMMER',safe(inv.customer_number||'')],
    ['IHR ANSPRECHPARTNER',safe(s.contact_name||'Thomas Schwetz')]
  ];
  let my=18;meta.forEach(([label,value])=>{doc.setFont('helvetica','bold');doc.text(label,125,my);doc.setFont('helvetica','normal');doc.text(value||'—',190,my,{align:'right'});my+=5;});
  doc.setFontSize(9);doc.setFont('helvetica','normal');
  doc.text(recipient,left,52);if(inv.customer_name&&inv.customer_company)doc.text(safe(inv.customer_name),left,57);
  doc.text(safe(inv.customer_street),left,inv.customer_name&&inv.customer_company?62:57);
  doc.text(recipientLine,left,inv.customer_name&&inv.customer_company?67:62);
  doc.text('Deutschland',left,inv.customer_name&&inv.customer_company?72:67);
  doc.setFont('helvetica','bold');doc.text('Rechnungs Nr. '+safe(inv.invoice_number||'ENTWURF'),left,88);
  doc.setFont('helvetica','normal');doc.text(fmtDate(inv.invoice_date),right,88,{align:'right'});
  y=104;doc.text('Sehr geehrte Damen und Herren,',left,y);y+=9;
  doc.text('vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!',left,y);y+=6;
  doc.text('Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:',left,y);y+=12;
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);
  doc.text('Beschreibung',left,y);doc.text('Menge',124,y,{align:'right'});doc.text('Einzelpreis',157,y,{align:'right'});doc.text('Gesamtpreis',right,y,{align:'right'});
  doc.setDrawColor(150,140,120);doc.line(left,y+2,right,y+2);y+=9;doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  (items||[]).forEach((it,index)=>{
    const desc=doc.splitTextToSize(String(it.description||''),92);
    const qty=String(it.quantity??1);
    const unit=money(it.unit_price);
    const total=money(it.line_total??Number(it.quantity||1)*Number(it.unit_price||0));
    const lineHeight=Math.max(5,desc.length*4.6)+2;
    ensureSpace(lineHeight+3);
    doc.text((index+1)+'.',left,y);
    doc.text(desc,left+7,y);
    doc.text(qty,124,y,{align:'right'});doc.text(unit,157,y,{align:'right'});doc.text(total,right,y,{align:'right'});
    y+=lineHeight;
  });
  y+=5;ensureSpace(45);doc.setDrawColor(150,140,120);doc.line(120,y,right,y);y+=8;
  doc.setFont('helvetica','bold');doc.setFontSize(9);
  doc.text('Gesamtbetrag netto',120,y);doc.text(money(inv.subtotal??inv.total),right,y,{align:'right'});y+=7;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  doc.text('Umsatzsteuer nicht erhoben gemäß §19 UStG.',left,y);y+=8;
  doc.setFont('helvetica','bold');doc.setFontSize(10);
  doc.text('Gesamtbetrag brutto',120,y);doc.text(money(inv.total),right,y,{align:'right'});y+=13;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  const paymentDays=Number(currentInvoiceSettings?.payment_terms_days||7);
  const paymentLines=[
    'Zahlungsbedingungen: Zahlung innerhalb von '+paymentDays+' Tagen ab Rechnungseingang ohne Abzüge.',
    'Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene Konto.',
    dueText?'Der Rechnungsbetrag ist bis zum '+dueText+' fällig.':''
  ].filter(Boolean);
  paymentLines.forEach(line=>{
    const wrapped=doc.splitTextToSize(line,170);ensureSpace(wrapped.length*5+3);doc.text(wrapped,left,y);y+=wrapped.length*5+2;
  });
  if(inv.notes){y+=3;ensureSpace(18);doc.setFont('helvetica','bold');doc.text('Hinweise:',left,y);y+=5;doc.setFont('helvetica','normal');const notes=doc.splitTextToSize(String(inv.notes),170);doc.text(notes,left,y);y+=notes.length*5+4;}
  ensureSpace(22);y+=8;doc.text('Mit freundlichen Grüßen',left,y);y+=12;doc.setFont('helvetica','bold');doc.text('Thomas Schwetz',left,y);
  addFooter();
  return doc.output('blob');
}
async function createInvoiceFiles(inv){
  const {data:items,error:itemError}=await db.from('invoice_items').select('*').eq('invoice_id',inv.id).order('position');
  if(itemError)throw itemError;
  const pdfBlob=buildInvoicePdf(inv,items||[]);
  const base=(inv.invoice_number||inv.id).replace(/[^A-Za-z0-9_-]/g,'_');
  const docs=[{kind:'pdf',file:new File([pdfBlob],base+'.pdf',{type:'application/pdf'}),mime:'application/pdf'}];
  if(inv.output_format==='pdf_xrechnung'){
    const xml=buildXRechnungXml(inv,items||[]);
    const xmlDoc=new DOMParser().parseFromString(xml,'application/xml');
    if(xmlDoc.querySelector('parsererror'))throw new Error('Die erzeugte XRechnung-XML-Datei ist nicht wohlgeformt.');
    const xmlBlob=new Blob([xml],{type:'application/xml;charset=utf-8'});
    docs.push({kind:'xrechnung_xml',file:new File([xmlBlob],base+'.xml',{type:'application/xml'}),mime:'application/xml'});
  }
  for(const d of docs){
    const path=new Date().getFullYear()+'/'+base+'/'+d.file.name;
    const {error:uploadError}=await db.storage.from('issued-invoices').upload(path,d.file,{upsert:true,contentType:d.mime});
    if(uploadError)throw uploadError;
    const digest=await crypto.subtle.digest('SHA-256',await d.file.arrayBuffer());
    const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const {error:docError}=await db.from('invoice_documents').upsert({invoice_id:inv.id,document_kind:d.kind,storage_path:path,file_name:d.file.name,mime_type:d.mime,sha256:hash},{onConflict:'invoice_id,document_kind'});
    if(docError)throw docError;
  }
}

function closeInvoicePreview(){
  invoicePreviewModal?.classList.add('hidden');
  if(invoicePreviewFrame)invoicePreviewFrame.src='about:blank';
  if(currentInvoicePreviewUrl){URL.revokeObjectURL(currentInvoicePreviewUrl);currentInvoicePreviewUrl=null;}
  currentInvoicePreviewId=null;
}
async function openInvoicePreview(inv){
  if(!inv)return;
  try{
    const items=Array.isArray(inv.invoice_items)?inv.invoice_items:[];
    if(!items.length)throw new Error('Die Rechnung enthält noch keine Positionen.');
    if(!currentInvoiceSettings)await loadInvoiceSettings();
    if(!currentInvoiceSettings?.seller_name||!currentInvoiceSettings?.seller_street||!currentInvoiceSettings?.seller_postal_code||!currentInvoiceSettings?.seller_city){
      throw new Error('Bitte zuerst unter „Rechnungseinstellungen“ die Firmendaten vollständig hinterlegen.');
    }
    const previewInvoice={
      ...inv,
      invoice_number:inv.invoice_number||'VORSCHAU – noch keine Rechnungsnummer',
      invoice_date:inv.invoice_date||new Date().toLocaleDateString('sv-SE'),
      due_date:inv.due_date||new Date(Date.now()+Number(currentInvoiceSettings.payment_terms_days||7)*86400000).toLocaleDateString('sv-SE'),
      seller_snapshot:{
        name:currentInvoiceSettings.seller_name,contact_name:currentInvoiceSettings.seller_contact_name,
        street:currentInvoiceSettings.seller_street,postal_code:currentInvoiceSettings.seller_postal_code,
        city:currentInvoiceSettings.seller_city,country_code:currentInvoiceSettings.seller_country_code||'DE',
        email:currentInvoiceSettings.seller_email,phone:currentInvoiceSettings.seller_phone,
        website:currentInvoiceSettings.seller_website,tax_number:currentInvoiceSettings.seller_tax_number,
        vat_id:currentInvoiceSettings.seller_vat_id,bank_name:currentInvoiceSettings.seller_bank_name,
        iban:currentInvoiceSettings.seller_iban,bic:currentInvoiceSettings.seller_bic
      },
      tax_note:'Umsatzsteuer nicht erhoben gemäß § 19 UStG.'
    };
    const blob=buildInvoicePdf(previewInvoice,items);
    if(currentInvoicePreviewUrl)URL.revokeObjectURL(currentInvoicePreviewUrl);
    currentInvoicePreviewUrl=URL.createObjectURL(blob);
    currentInvoicePreviewId=inv.id;
    currentInvoicePreviewZoom=100;
    invoicePreviewZoomLabel.textContent='100 %';
    invoicePreviewFrame.style.transform='none';
    invoicePreviewFrame.src=currentInvoicePreviewUrl+'#toolbar=1&navpanes=1&view=FitH';
    invoicePreviewMeta.textContent=(inv.invoice_number||'Entwurf ohne Rechnungsnummer')+' · '+(inv.customer_company||inv.customer_name||'Kunde')+' · '+euro(inv.total||0)+' · noch nicht verbindlich ausgestellt';
    invoicePreviewIssue.disabled=inv.status!=='draft';
    invoicePreviewIssue.textContent=inv.status==='draft'?'Jetzt verbindlich ausstellen':'Bereits ausgestellt';
    invoicePreviewModal.classList.remove('hidden');
  }catch(error){alert('Vorschau konnte nicht erstellt werden: '+error.message);}
}
function downloadCurrentInvoicePreview(){
  if(!currentInvoicePreviewUrl)return;
  const a=document.createElement('a');a.href=currentInvoicePreviewUrl;a.download='Rechnung-Vorschau.pdf';document.body.appendChild(a);a.click();a.remove();
}

async function issueInvoice(id){
  const inv=currentIssuedInvoices.find(x=>x.id===id);if(!inv)return;
  if(!confirm('Rechnung verbindlich ausstellen? Die Rechnungsnummer wird endgültig vergeben.'))return;
  try{
    closeInvoicePreview();
    const {data,error}=await db.rpc('issue_invoice',{p_invoice_id:id});if(error)throw error;
    const issued=Array.isArray(data)?data[0]:data;
    await createInvoiceFiles(issued);
    await loadIssuedInvoices();
    alert('Rechnung '+issued.invoice_number+' wurde ausgestellt. '+(issued.output_format==='pdf_xrechnung'?'PDF und XRechnung wurden archiviert.':'PDF wurde archiviert.'));
  }catch(error){alert('Rechnung wurde nicht vollständig erstellt: '+error.message+'\\nFalls bereits eine Rechnungsnummer vergeben wurde, bitte die Rechnung neu laden und die Dokumente erneut erzeugen.');await loadIssuedInvoices();}
}
function editInvoiceDraft(id){
  const inv=currentIssuedInvoices.find(x=>x.id===id&&x.status==='draft');if(!inv)return;
  resetInvoiceDraft();invoiceDraftId.value=inv.id;invoiceDraftForm.classList.remove('hidden');
  invoiceSourceOrder.value=inv.order_id||'';invoiceSourceOffer.value=inv.offer_id||'';
  invoiceSetField('invoiceCustomerName',inv.customer_name);invoiceSetField('invoiceCustomerCompany',inv.customer_company);
  invoiceSetField('invoiceCustomerStreet',inv.customer_street);invoiceSetField('invoiceCustomerZip',inv.customer_postal_code);
  invoiceSetField('invoiceCustomerCity',inv.customer_city);invoiceSetField('invoiceCustomerEmail',inv.customer_email);
  invoiceSetField('invoiceCustomerVatId',inv.customer_vat_id);invoiceSetField('invoiceBuyerReference',inv.buyer_reference);
  invoiceSetField('invoiceServiceDate',inv.service_date);invoiceSetField('invoiceOutputFormat',inv.output_format||'pdf_xrechnung');invoiceSetField('invoiceSellerIdentifier',inv.seller_identifier);invoiceSetField('invoiceDraftNotes',inv.notes);
  invoiceDraftItems.innerHTML='';(inv.invoice_items||[]).forEach(item=>addInvoiceItemRow(item.description,item.quantity,item.unit_price));
  if(!(inv.invoice_items||[]).length)addInvoiceItemRow();
  invoiceDraftForm.scrollIntoView({behavior:'smooth',block:'start'});
}
async function deleteInvoiceDraft(id){
  const inv=currentIssuedInvoices.find(x=>x.id===id);if(!inv||inv.status!=='draft')return;
  if(!confirm('Diesen Rechnungsentwurf endgültig löschen?'))return;
  const {error}=await db.from('issued_invoices').delete().eq('id',id);
  if(error){alert('Entwurf konnte nicht gelöscht werden: '+error.message);return;}
  await loadIssuedInvoices();
}
async function cancelInvoice(id){
  const reason=prompt('Bitte Stornogrund eingeben:');if(!reason?.trim())return;
  if(!confirm('Eine Stornorechnung wird erstellt. Die ursprüngliche Rechnung bleibt archiviert. Fortfahren?'))return;
  try{
    const {data,error}=await db.rpc('cancel_issued_invoice',{p_invoice_id:id,p_reason:reason.trim()});if(error)throw error;
    const cancelled=Array.isArray(data)?data[0]:data;
    await createInvoiceFiles(cancelled);
    await loadIssuedInvoices();
    alert('Stornorechnung '+cancelled.invoice_number+' wurde erstellt und archiviert.');
  }catch(error){alert('Stornierung nicht möglich: '+error.message);await loadIssuedInvoices();}
}
async function addInvoicePayment(id){
  const inv=currentIssuedInvoices.find(x=>x.id===id);if(!inv)return;
  const amountRaw=prompt('Zahlungseingang in Euro. Noch offen: '+euro(Math.max(0,Number(inv.total||0)-Number(inv.amount_paid||0))));if(amountRaw===null)return;
  const amount=Number(amountRaw.replace(',','.'));
  if(!Number.isFinite(amount)||amount<=0){alert('Bitte einen gültigen positiven Betrag eingeben.');return;}
  const paymentDate=prompt('Zahlungsdatum (JJJJ-MM-TT)',new Date().toLocaleDateString('sv-SE'));if(!paymentDate)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)){alert('Bitte das Datum im Format JJJJ-MM-TT eingeben.');return;}
  const methodRaw=prompt('Zahlungsart: Überweisung, Bar, Karte oder Sonstiges','Überweisung')||'Überweisung';
  const map={'Überweisung':'bank_transfer','Bar':'cash','Karte':'card','Sonstiges':'other'};
  const {error}=await db.from('invoice_payments').insert({invoice_id:id,amount,payment_method:map[methodRaw]||'other',payment_date:paymentDate});
  if(error){alert('Zahlung konnte nicht gespeichert werden: '+error.message);return;}
  await loadIssuedInvoices();
}
async function downloadInvoiceDocument(id,kind){
  const {data:doc,error}=await db.from('invoice_documents').select('*').eq('invoice_id',id).eq('document_kind',kind).maybeSingle();
  if(error){alert('Dokumentdaten konnten nicht geladen werden: '+error.message);return;}
  if(!doc){alert('Das Dokument ist noch nicht archiviert. Bitte Rechnung neu laden oder Support kontaktieren.');return;}
  const {data,error:downloadError}=await db.storage.from('issued-invoices').download(doc.storage_path);
  if(downloadError){alert('Download fehlgeschlagen: '+downloadError.message);return;}
  const url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download=doc.file_name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function ensureInvoiceSources(){
  if(!currentOrders.length)await loadOrders();
  if(!currentOffers.length)await loadOffers(false);
  populateInvoiceSources();
}

async function loadInvoices(){
  if(!invoiceList)return;
  invoiceList.innerHTML='<p>Rechnungen werden geladen...</p>';
  try{
    const result=await googleApiJsonp(RECHNUNGS_API_URL,{year:new Date().getFullYear()});
    if(result.ok===false)throw new Error(result.error||'Rechnungsdaten konnten nicht geladen werden.');
    const rows=Array.isArray(result.rechnungen)?result.rechnungen.map(invoice=>{
      const row={...invoice};
      if(!String(row.kunde||'').trim() || String(row.kunde).trim()==='—'){
        row.kunde=invoiceCustomerFromFilename(row.quelldatei||row.pdf_url||row.drive_url,row.rechnungsnummer)||row.kunde||'';
      }
      row.kunde=cleanInvoiceCustomerName(row.kunde);
      return row;
    }):[];
    currentInvoices=rows;
    const year=Number(result.bruttoGesamtJahr??result.bruttoGesamt??0);
    const month=Number(result.bruttoGesamtMonat??0);
    if(invoiceTotal)invoiceTotal.textContent=euro(year);
    if(invoiceMonthTotal)invoiceMonthTotal.textContent=euro(month);
    if(!rows.length){invoiceList.innerHTML='<div class="empty-box">Die Rechnungs-API liefert aktuell nur Summen. Sobald die erweiterte <b>doGet()</b>-Version eingespielt ist, erscheinen hier wieder alle Rechnungen.</div>';return;}

    // Rechnungen speisen zusätzlich den gemeinsamen Kundenstamm.
    // Die eigentliche Rechnungsberechnung oben bleibt unverändert.
    await syncInvoiceCustomers(rows);

    const q=(invoiceSearch?.value||'').trim().toLowerCase();
    const filtered=rows.filter(r=>[r.rechnungsnummer,r.kunde,r.beschreibung,r.rechnungsdatum].join(' ').toLowerCase().includes(q));
    invoiceList.innerHTML=filtered.length?`<div class="invoice-table"><div class="invoice-row invoice-head"><span>Datum</span><span>Rechnungsnr.</span><span>Kunde</span><span>Beschreibung</span><span>Brutto</span><span>Quelle</span></div>${filtered.map(r=>{const source=invoiceSourceLink(r);return `<div class="invoice-row"><span>${escapeHtml(r.rechnungsdatum||'—')}</span><span><b>${escapeHtml(r.rechnungsnummer||'—')}</b></span><span>${escapeHtml(r.kunde||'—')}</span><span>${escapeHtml(r.beschreibung||'—')}</span><span><b>${euro(r.bruttobetrag||0)}</b></span><span>${source?`<a href="${escapeHtml(source.href)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a>`:'—'}</span></div>`;}).join('')}</div>`:'<div class="empty-box">Keine passende Rechnung gefunden.</div>';
  }catch(err){invoiceList.innerHTML=`<p class="notice">Rechnungsdaten konnten nicht geladen werden: ${escapeHtml(err.message)}</p>`}
}


async function syncOfferCustomers(rows){
  if(!Array.isArray(rows)||!rows.length)return;
  try{
    const {data:existing,error}=await db.from('customers').select('*');
    if(error)throw error;
    const customers=Array.isArray(existing)?existing:[];
    for(const offer of rows){
      const k=offer.kundendaten||{};
      const number=String(k.kundennummer||'').trim();
      const email=String(k.email||'').trim().toLowerCase();
      const company=String(k.firma||'').trim();
      const first=String(k.vorname||'').trim();
      const last=String(k.nachname||'').trim();
      const name=normalizeCustomerText([first,last].filter(Boolean).join(' '));
      if(!number&&!email&&!company&&!name)continue;
      let match=customers.find(c=>number&&String(c.kundennummer||'').trim()===number);
      if(!match&&email)match=customers.find(c=>String(c.email||'').trim().toLowerCase()===email);
      if(!match)match=customers.find(c=>{
        const cName=normalizeCustomerText([c.vorname,c.nachname].filter(Boolean).join(' '));
        return company && normalizeCustomerText(c.firma)===normalizeCustomerText(company) || (name && cName===name);
      });
      const payload={
        kundennummer:number||null,firma:company||null,vorname:first||null,nachname:last||null,
        strasse:String(k.strasse||'').trim()||null,hausnummer:String(k.hausnummer||'').trim()||null,
        plz:String(k.plz||'').trim()||null,ort:String(k.ort||'').trim()||null,land:String(k.land||'Deutschland').trim()||'Deutschland',
        telefon:String(k.telefon||'').trim()||null,email:String(k.email||'').trim()||null,updated_at:new Date().toISOString()
      };
      if(match){
        const patch={updated_at:payload.updated_at};
        for(const key of ['kundennummer','firma','vorname','nachname','strasse','hausnummer','plz','ort','land','telefon','email']){
          if(!match[key] && payload[key])patch[key]=payload[key];
        }
        if(Object.keys(patch).length>1){
          const {error:updateError}=await db.from('customers').update(patch).eq('id',match.id);
          if(updateError)console.warn('Angebotskunde konnte nicht ergänzt werden:',updateError.message);
          else Object.assign(match,patch);
        }
      }else{
        const {data:newCustomer,error:insertError}=await db.from('customers').insert(payload).select().single();
        if(insertError)console.warn('Angebotskunde konnte nicht angelegt werden:',insertError.message);
        else if(newCustomer){customers.push(newCustomer);match=newCustomer;}
      }
      if(match){
        offer.customer_id=match.id;
        const offerNumber=String(offer.angebotsnummer||offer.angebotsnr||'').trim();
        if(offerNumber){
          const {data:savedOffer}=await db.from('offers').select('id').eq('angebotsnummer',offerNumber).maybeSingle();
          if(savedOffer?.id){
            const {error:updateOfferError}=await db.from('offers').update({customer_id:match.id}).eq('id',savedOffer.id);
            if(updateOfferError)console.warn('Angebot konnte nicht mit Kunde verknüpft werden:',updateOfferError.message);
          }
        }
      }
    }
  }catch(err){
    console.warn('Kundenübernahme aus Angeboten fehlgeschlagen:',err.message);
  }
}

function normalizeOfferDate(value){
  if(value===null||value===undefined||value==='')return null;
  const s=String(value).trim();
  let m=s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(m)return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  m=s.match(/^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})$/);
  if(m)return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
  const d=new Date(s);
  if(!Number.isNaN(d.getTime()))return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return null;
}

async function syncOffersToSupabase(rows){
  if(!Array.isArray(rows)||!rows.length)return [];

  // Google Drive kann bei einem manuellen/erneuten Import dieselbe
  // Angebotsnummer mehrfach liefern. Supabase/Postgres lehnt ein UPSERT
  // mit demselben Conflict-Key innerhalb eines Statements ab.
  // Deshalb wird VOR dem UPSERT eindeutig nach Angebotsnummer dedupliziert.
  const uniqueMap=new Map();
  let duplicateCount=0;

  for(const r of rows){
    const number=String(r?.angebotsnummer||r?.angebotsnr||'').trim();
    if(!number)continue;

    const normalized={
      ...r,
      angebotsnummer:number
    };

    if(uniqueMap.has(number)){
      duplicateCount++;
      const previous=uniqueMap.get(number);
      // Den Datensatz mit den vollständigeren Angaben behalten.
      const score=(x)=>[
        x?.betrag,
        x?.angebotsdatum||x?.datum||x?.date,
        x?.kunde||x?.kundenname,
        x?.firma,
        x?.beschreibung,
        x?.dateiId||x?.drive_file_id,
        x?.dateiUrl||x?.drive_url
      ].filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='').length;
      if(score(normalized)>=score(previous))uniqueMap.set(number,normalized);
    }else{
      uniqueMap.set(number,normalized);
    }
  }

  const cleanRows=[...uniqueMap.values()];
  if(!cleanRows.length)return [];

  const numbers=cleanRows.map(r=>r.angebotsnummer);
  const {data:saved,error}=await db.from('offers').select('*').in('angebotsnummer',numbers);
  if(error)throw error;
  const savedMap=new Map((saved||[]).map(x=>[String(x.angebotsnummer||'').trim(),x]));

  const payload=cleanRows.map(r=>{
    const number=String(r.angebotsnummer||'').trim();
    const old=savedMap.get(number);
    return {
      angebotsnummer:number,
      angebotsdatum:normalizeOfferDate(r.angebotsdatum||r.datum||r.date),
      firma:r.firma||'',
      kundenname:r.kunde||r.kundenname||'',
      beschreibung:r.beschreibung||'',
      betrag:Number(r.betrag||0),
      status:old?.status||r.status||'Offen / In Bearbeitung',
      customer_id:old?.customer_id||null,
      dateiname:r.dateiname||'',
      drive_file_id:r.dateiId||r.drive_file_id||'',
      drive_url:r.dateiUrl||r.drive_url||''
    };
  });

  const {error:upsertError}=await db.from('offers').upsert(payload,{onConflict:'angebotsnummer'});
  if(upsertError)throw upsertError;

  if(duplicateCount){
    console.info(`Angebote: ${duplicateCount} doppelte Angebotsnummer(n) beim Import bereinigt.`);
  }
  return payload;
}

async function loadOffers(forceRefresh=false){
  if(!offerList)return;
  offerList.innerHTML=forceRefresh?'<p>Angebote werden aktualisiert… Google Drive wird gelesen. Das kann bei vielen PDFs einige Minuten dauern.</p>':'<p>Gespeicherte Angebote werden geladen...</p>';
  try{
    // Normal: ausschließlich Supabase verwenden. Dadurch wird nicht bei jedem Öffnen
    // erneut jedes PDF aus Google Drive gelesen.
    const {data:saved,error:savedError}=await db.from('offers').select('*').order('angebotsdatum',{ascending:false});
    if(savedError)throw savedError;
    let rows=Array.isArray(saved)?saved.map(x=>({
      ...x,
      angebotsnummer:x.angebotsnummer,
      angebotsdatum:x.angebotsdatum,
      datum:x.angebotsdatum,
      kunde:x.kundenname,
      dateiUrl:x.drive_url
    })):[];

    // Beim ersten Start dieser neuen Angebotsversion einmalig aus Google Drive importieren.
    // Danach kommt das normale Öffnen ausschließlich aus Supabase.
    // Der Import-Schlüssel verhindert, dass bei jedem Seitenaufruf erneut alle PDFs gelesen werden.
    let initialSyncDone=false;
    try{ initialSyncDone=localStorage.getItem(OFFERS_INITIAL_SYNC_KEY)==='1'; }catch(e){}
    // Falls die Datenbank leer ist oder diese Version noch nicht initial importiert hat,
    // einmalig alle Angebote aus Google Drive übernehmen.
    const shouldSync=forceRefresh || !initialSyncDone || rows.length===0;
    if(shouldSync){
      const result=await googleApiJsonp(ANGEBOTE_API_URL,{action:'angebote'});
      if(result.ok===false)throw new Error(result.error||'Angebotsdaten konnten nicht geladen werden.');
      const driveRows=Array.isArray(result.angebote)?result.angebote:[];
      if(driveRows.length){
        await syncOffersToSupabase(driveRows);
        // Kundenübernahme läuft bewusst im Hintergrund und darf den Angebotsimport nicht blockieren.
        syncOfferCustomers(driveRows).catch(err=>console.warn('Kundenübernahme aus Angeboten:',err.message));
        const {data:fresh,error:freshError}=await db.from('offers').select('*').order('angebotsdatum',{ascending:false});
        if(freshError)throw freshError;
        rows=Array.isArray(fresh)?fresh.map(x=>({...x,datum:x.angebotsdatum,kunde:x.kundenname,dateiUrl:x.drive_url})):[];
        // Nur als erfolgreich initialisiert markieren, wenn mindestens ein Angebot importiert wurde.
        if(!forceRefresh && driveRows.length>0){
          try{ localStorage.setItem(OFFERS_INITIAL_SYNC_KEY,'1'); }catch(e){}
        }
      }
    }

    currentOffers=rows;
    renderOffers();
    renderOrders();
  }catch(err){
    currentOffers=[];
    offerList.innerHTML=`<p class="notice">Angebotsdaten konnten nicht geladen werden: ${escapeHtml(err.message)}</p>`;
    updateOfferTotals([]);
  }finally{
    if(refreshOffersBtn)refreshOffersBtn.disabled=false;
  }
}


function showCustomerMsg(message,isError=false){
  if(!customerMsg)return;
  customerMsg.textContent=message;
  customerMsg.classList.toggle('hidden',!message);
  customerMsg.classList.toggle('notice-error',isError);
}

function resetCustomerForm(){
  customerForm?.reset();
  if(customerId)customerId.value='';
  if(customerCompany)customerCompany.value='';
  if(customerFirstName)customerFirstName.value='';
  if(customerLastName)customerLastName.value='';
  if(customerStreet)customerStreet.value='';
  if(customerHouseNumber)customerHouseNumber.value='';
  if(customerZip)customerZip.value='';
  if(customerCity)customerCity.value='';
  if(customerPhone)customerPhone.value='';
  if(customerEmail)customerEmail.value='';
  if(customerNotes)customerNotes.value='';
  if(saveCustomerBtn)saveCustomerBtn.textContent='Kunde speichern';
  showCustomerMsg('');
}

function renderCustomers(){
  if(!customerList)return;
  const q=(customerSearch?.value||'').trim().toLowerCase();
  const rows=currentCustomers.filter(c=>[
    c.kundennummer,c.firma,c.vorname,c.nachname,c.strasse,c.hausnummer,c.plz,c.ort,c.telefon,c.email
  ].join(' ').toLowerCase().includes(q));
  if(customerCount)customerCount.textContent=String(currentCustomers.length);
  if(!rows.length){
    customerList.innerHTML='<div class="empty-box">Keine Kunden gefunden.</div>';
    return;
  }
  const norm=value=>normalizeCustomerText(value||'');
  customerList.innerHTML=rows.map(c=>{
    const name=[c.vorname,c.nachname].filter(Boolean).join(' ');
    const title=c.firma||name||'Ohne Namen';
    const address=[c.strasse,c.hausnummer].filter(Boolean).join(' ');
    const city=[c.plz,c.ort].filter(Boolean).join(' ');
    const customerNames=[norm(c.firma),norm(name)].filter(Boolean);
    const relatedOffers=currentOffers.filter(o=>{
      if(o.customer_id && o.customer_id===c.id)return true;
      const offerName=norm(o.kunde||o.kundenname||o.firma);
      return !!offerName && customerNames.includes(offerName);
    });
    const relatedInvoices=currentInvoices.filter(inv=>{
      const invoiceName=norm(inv.kunde);
      return !!invoiceName && customerNames.includes(invoiceName);
    });
    // Anfragen werden ausschließlich über die exakt übereinstimmende E-Mail-Adresse zugeordnet.
    // Eine Namensähnlichkeit allein reicht bewusst nicht aus, um Kundendaten falsch zu verknüpfen.
    const customerEmail=String(c.email||'').trim().toLowerCase();
    const relatedRequests=customerEmail?requests
      .filter(r=>String(r.email||'').trim().toLowerCase()===customerEmail)
      .sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))):[];
    const requestsHtml=relatedRequests.length?relatedRequests.map(r=>{
      const requestDate=r.requested_date?formatDate(r.requested_date):(r.created_at?new Date(r.created_at).toLocaleDateString('de-DE'):'—');
      const vehicle=[r.make,r.model].filter(Boolean).join(' ')||r.vehicle_type||'';
      const status=r.status||'Neue Anfrage';
      return '<div class="related-document"><span><b>'+escapeHtml(r.service_type||'Anfrage')+'</b> · '+escapeHtml(requestDate)+' · '+escapeHtml(status)+'<br><small>'+escapeHtml(vehicle||r.details||'')+(r.requested_time?' · '+escapeHtml(r.requested_time):'')+(r.duration_label?' · '+escapeHtml(r.duration_label):'')+'</small></span><span><button type="button" class="small-btn" data-customer-request-details="'+escapeHtml(r.id)+'">Ansehen</button></span></div>';
    }).join(''):'<p class="related-empty">Keine eindeutig zugeordneten Anfragen.</p>';
    const offersHtml=relatedOffers.length?relatedOffers.map(o=>{
      const number=o.angebotsnummer||o.angebotsnr||'—';
      const date=o.datum||o.angebotsdatum||'—';
      const pdf=o.dateiUrl||o.drive_url||o.driveUrl||'';
      return '<div class="related-document"><span><b>'+escapeHtml(number)+'</b> · '+escapeHtml(date)+' · '+escapeHtml(o.status||'Offen / In Bearbeitung')+'</span><span><b>'+euro(o.betrag||0)+'</b> '+(pdf?'<a href="'+escapeHtml(pdf)+'" target="_blank" rel="noopener">PDF</a>':'')+'</span></div>';
    }).join(''):'<p class="related-empty">Keine zugeordneten Angebote.</p>';
    const invoicesHtml=relatedInvoices.length?relatedInvoices.map(inv=>{
      const source=invoiceSourceLink(inv);
      return '<div class="related-document"><span><b>'+escapeHtml(inv.rechnungsnummer||'—')+'</b> · '+escapeHtml(inv.rechnungsdatum||'—')+' · '+escapeHtml(inv.beschreibung||'Rechnung')+'</span><span><b>'+euro(inv.bruttobetrag||0)+'</b> '+(source?'<a href="'+escapeHtml(source.href)+'" target="_blank" rel="noopener">'+escapeHtml(source.label==='In Drive suchen'?'Drive':'PDF')+'</a>':'')+'</span></div>';
    }).join(''):'<p class="related-empty">Keine zugeordneten Rechnungen.</p>';
    return '<div class="customer-card" style="padding:16px;border:1px solid #e6dfcf;border-radius:16px;margin:10px 0;background:#fff">'+
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">'+
        '<div><b>'+escapeHtml(title)+'</b><div style="margin-top:4px;color:#777">'+escapeHtml(name&&c.firma?name+' · ':'')+escapeHtml(c.kundennummer||'')+'</div>'+
        '<div style="margin-top:8px;color:#555">'+escapeHtml(address||'')+(address&&city?' · ':'')+escapeHtml(city||'')+'</div>'+
        '<div style="margin-top:4px;color:#555">'+escapeHtml(c.telefon||'')+(c.telefon&&c.email?' · ':'')+escapeHtml(c.email||'')+'</div></div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="small-btn" data-customer-edit="'+escapeHtml(c.id)+'">Bearbeiten</button><button type="button" class="small-btn" data-customer-delete="'+escapeHtml(c.id)+'">Löschen</button></div>'+
      '</div>'+
      '<div class="customer-documents" style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">'+
        '<div><h3 style="margin:0 0 8px">Anfragen ('+relatedRequests.length+')</h3>'+requestsHtml+'</div>'+
        '<div><h3 style="margin:0 0 8px">Angebote ('+relatedOffers.length+')</h3>'+offersHtml+'</div>'+
        '<div><h3 style="margin:0 0 8px">Rechnungen ('+relatedInvoices.length+')</h3>'+invoicesHtml+'</div>'+
      '</div></div>';
  }).join('');
}
async function loadCustomers(){
  if(!customerList)return;
  customerList.innerHTML='<p>Kunden werden geladen...</p>';
  const {data,error}=await db.from('customers').select('*').order('nachname',{ascending:true}).order('firma',{ascending:true});
  if(error){
    currentCustomers=[];
    if(customerCount)customerCount.textContent='0';
    customerList.innerHTML=`<p class="notice">Kunden konnten nicht geladen werden: ${escapeHtml(error.message)}</p>`;
    return;
  }
  currentCustomers=data||[];
  renderCustomers();
}

async function linkExistingOffersToCustomers(){
  if(!currentOffers.length||!currentCustomers.length)return;
  const norm=value=>normalizeCustomerText(value||'');
  for(const offer of currentOffers){
    if(offer.customer_id)continue;
    const offerName=norm(offer.kunde||offer.kundenname);
    if(!offerName)continue;
    const matches=currentCustomers.filter(c=>{
      const company=norm(c.firma);
      const person=norm([c.vorname,c.nachname].filter(Boolean).join(' '));
      return (company&&company===offerName)||(person&&person===offerName);
    });
    // Nur bei genau einem eindeutigen Treffer verknüpfen, um Fehlzuordnungen zu vermeiden.
    if(matches.length!==1)continue;
    const customer=matches[0];
    const {error}=await db.from('offers').update({customer_id:customer.id}).eq('angebotsnummer',String(offer.angebotsnummer||'').trim());
    if(error){
      console.warn('Angebot konnte nicht dem Bestandskunden zugeordnet werden:',error.message);
      continue;
    }
    offer.customer_id=customer.id;
  }
}

async function loadBestandskunden(){
  if(customerList)customerList.innerHTML='<p>Kunden, Rechnungen und Angebote werden geladen...</p>';
  try{
    // Erst die beiden Dokumentenlisten laden, damit die Kundenansicht aktuelle Daten verwendet.
    await Promise.all([load(),loadInvoices(),loadOffers(false)]);
    await loadCustomers();
    await linkExistingOffersToCustomers();
    renderCustomers();
  }catch(err){
    if(customerList)customerList.innerHTML=`<p class="notice">Bestandskunden konnten nicht vollständig geladen werden: ${escapeHtml(err.message)}</p>`;
  }
}

function editCustomer(id){
  const c=currentCustomers.find(x=>x.id===id);
  if(!c)return;
  showView('customers');
  customerId.value=c.id||'';
  customerNumber.value=c.kundennummer||'';
  customerCompany.value=c.firma||'';
  customerFirstName.value=c.vorname||'';
  customerLastName.value=c.nachname||'';
  customerStreet.value=c.strasse||'';
  customerHouseNumber.value=c.hausnummer||'';
  customerZip.value=c.plz||'';
  customerCity.value=c.ort||'';
  customerPhone.value=c.telefon||'';
  customerEmail.value=c.email||'';
  customerNotes.value=c.notizen||'';
  saveCustomerBtn.textContent='Änderungen speichern';
  showCustomerMsg('');
  window.scrollTo({top:0,behavior:'smooth'});
}

async function saveCustomer(e){
  e.preventDefault();
  if(saveCustomerBtn)saveCustomerBtn.disabled=true;
  showCustomerMsg('');
  try{
    const payload={
      kundennummer:customerNumber.value.trim()||null,
      firma:customerCompany.value.trim()||null,
      vorname:customerFirstName.value.trim()||null,
      nachname:customerLastName.value.trim()||null,
      strasse:customerStreet.value.trim()||null,
      hausnummer:customerHouseNumber.value.trim()||null,
      plz:customerZip.value.trim()||null,
      ort:customerCity.value.trim()||null,
      land:'Deutschland',
      telefon:customerPhone.value.trim()||null,
      email:customerEmail.value.trim()||null,
      notizen:customerNotes.value.trim()||null,
      updated_at:new Date().toISOString()
    };
    const id=customerId.value.trim();
    const result=id?await db.from('customers').update(payload).eq('id',id):await db.from('customers').insert(payload);
    if(result.error)throw result.error;
    resetCustomerForm();
    await loadCustomers();
    showCustomerMsg('Kunde erfolgreich gespeichert.');
  }catch(err){
    showCustomerMsg('Kunde konnte nicht gespeichert werden: '+err.message,true);
  }finally{
    if(saveCustomerBtn)saveCustomerBtn.disabled=false;
  }
}

async function deleteCustomer(id){
  const c=currentCustomers.find(x=>x.id===id);
  if(!c)return;
  const title=c.firma||[c.vorname,c.nachname].filter(Boolean).join(' ')||'diesen Kunden';
  if(!confirm(`„${title}“ wirklich löschen?`))return;
  const {error}=await db.from('customers').delete().eq('id',id);
  if(error){alert('Kunde konnte nicht gelöscht werden: '+error.message);return;}
  if(customerId.value===id)resetCustomerForm();
  await loadCustomers();
}

function offerStatusClass(status){
  if(status==='Angenommen')return 'offer-status accepted';
  if(status==='Abgelehnt')return 'offer-status rejected';
  return 'offer-status open';
}

function updateOfferTotals(rows){
  const all=rows.reduce((s,r)=>s+Number(r.betrag||0),0);
  const open=rows.filter(r=>r.status==='Offen / In Bearbeitung').reduce((s,r)=>s+Number(r.betrag||0),0);
  const accepted=rows.filter(r=>r.status==='Angenommen').reduce((s,r)=>s+Number(r.betrag||0),0);
  const rejected=rows.filter(r=>r.status==='Abgelehnt').reduce((s,r)=>s+Number(r.betrag||0),0);
  if(offerTotal)offerTotal.textContent=euro(all);
  if(offerOpenTotal)offerOpenTotal.textContent=euro(open);
  if(offerAcceptedTotal)offerAcceptedTotal.textContent=euro(accepted);
  if(offerRejectedTotal)offerRejectedTotal.textContent=euro(rejected);
  if(offerCount)offerCount.textContent=String(rows.length);
}

function renderOffers(){
  if(!offerList)return;
  const q=(offerSearch?.value||'').trim().toLowerCase();
  const status=offerStatusFilter?.value||'';
  const filtered=currentOffers.filter(r=>{
    const hay=[r.angebotsnummer,r.kunde,r.kundenname,r.firma,r.beschreibung,r.dateiname].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!status||r.status===status);
  });
  updateOfferTotals(currentOffers);
  if(!filtered.length){
    offerList.innerHTML='<div class="empty-box">Keine passenden Angebote gefunden.</div>';
    return;
  }
  offerList.innerHTML=`<div class="invoice-table offer-table"><div class="invoice-row invoice-head"><span>Datum</span><span>Angebotsnr.</span><span>Kunde</span><span>Beschreibung</span><span>Betrag</span><span>Status</span><span>PDF</span></div>${filtered.map(r=>{
    const number=String(r.angebotsnummer||r.angebotsnr||'—');
    const customer=String(r.kunde||r.kundenname||r.firma||'—');
    const status=r.status||'Offen / In Bearbeitung';
    const pdf=r.dateiUrl||r.drive_url||r.driveUrl||'';
    return `<div class="invoice-row offer-row"><span>${escapeHtml(r.datum||r.angebotsdatum||'—')}</span><span><b>${escapeHtml(number)}</b></span><span>${escapeHtml(customer)}</span><span>${escapeHtml(r.beschreibung||'—')}</span><span><b>${euro(r.betrag||0)}</b></span><span><select class="offer-status-select ${offerStatusClass(status)}" data-offer-number="${escapeHtml(number)}"><option value="Offen / In Bearbeitung" ${status==='Offen / In Bearbeitung'?'selected':''}>Offen / In Bearbeitung</option><option value="Angenommen" ${status==='Angenommen'?'selected':''}>Angenommen</option><option value="Abgelehnt" ${status==='Abgelehnt'?'selected':''}>Abgelehnt</option></select></span><span>${pdf?`<a href="${escapeHtml(pdf)}" target="_blank" rel="noopener">PDF</a>`:'—'}</span></div>`;
  }).join('')}</div>`;
}

async function saveOfferStatus(offer, status){
  const number=String(offer.angebotsnummer||offer.angebotsnr||'').trim();
  if(!number)return;
  const payload={
    angebotsnummer:number,
    angebotsdatum:normalizeOfferDate(offer.angebotsdatum||offer.datum||offer.date),
    firma:offer.firma||'',
    kundenname:offer.kunde||offer.kundenname||'',
    beschreibung:offer.beschreibung||'',
    betrag:Number(offer.betrag||0),
    status,
    customer_id:offer.customer_id||null,
    dateiname:offer.dateiname||'',
    drive_file_id:offer.dateiId||offer.drive_file_id||'',
    drive_url:offer.dateiUrl||offer.drive_url||''
  };
  const {error}=await db.from('offers').upsert(payload,{onConflict:'angebotsnummer'});
  if(error)throw error;
}

async function handleOfferStatusChange(select){
  const number=select.dataset.offerNumber;
  const offer=currentOffers.find(r=>String(r.angebotsnummer||r.angebotsnr||'').trim()===number);
  if(!offer)return;
  const oldStatus=offer.status||'Offen / In Bearbeitung';
  const newStatus=select.value;
  if(oldStatus===newStatus)return;
  select.disabled=true;
  try{
    await saveOfferStatus(offer,newStatus);
    offer.status=newStatus;
    renderOffers();
  }catch(err){
    select.value=oldStatus;
    alert('Angebotsstatus konnte nicht gespeichert werden: '+err.message);
  }finally{
    select.disabled=false;
  }
}


async function loadOrders(){
  if(!orderList)return;
  orderList.innerHTML='<p>Aufträge werden geladen…</p>';
  const {data,error}=await db.from('orders').select('*').order('created_at',{ascending:false});
  if(error){
    currentOrders=[];
    orderRequestIds=new Set();
    orderList.innerHTML='<p class="notice">Aufträge konnten nicht geladen werden: '+escapeHtml(error.message)+'</p>';
    renderOrders();
    return;
  }
  currentOrders=data||[];
  orderRequestIds=new Set(currentOrders.map(o=>o.request_id).filter(Boolean));
  renderOrders();
}
function renderOrders(){
  if(!orderList)return;
  const q=(orderSearch?.value||'').trim().toLowerCase();
  const selectedStatus=orderStatusFilter?.value||'';
  const rows=currentOrders.filter(o=>{
    const searchable=[o.order_number,o.customer_name,o.customer_email,o.customer_phone,o.service_type,o.description,o.notes,o.external_invoice_number,o.scheduled_date,o.status].join(' ').toLowerCase();
    return (!q||searchable.includes(q))&&(!selectedStatus||o.status===selectedStatus);
  });
  if(orderCountEl)orderCountEl.textContent=String(currentOrders.length);
  if(orderVolumeEl)orderVolumeEl.textContent=euro(currentOrders.reduce((sum,o)=>sum+Number(o.agreed_amount||0),0));
  if(orderOpenCountEl)orderOpenCountEl.textContent=String(currentOrders.filter(o=>['Offen','Geplant'].includes(o.status)).length);
  if(orderInProgressCountEl)orderInProgressCountEl.textContent=String(currentOrders.filter(o=>o.status==='In Arbeit').length);
  if(orderCompletedCountEl)orderCompletedCountEl.textContent=String(currentOrders.filter(o=>o.status==='Abgeschlossen').length);
  if(!rows.length){
    orderList.innerHTML='<div class="empty-box">Keine Aufträge für diese Suche oder diesen Status gefunden.</div>';
    return;
  }
  const statuses=['Offen','Geplant','In Arbeit','Abgeschlossen','Storniert'];
  const renderCard=o=>{
    const linked=currentOffers.find(x=>x.order_id===o.id);
    const availableOffers=currentOffers.filter(x=>!x.order_id||x.order_id===o.id);
    const offerOptions=availableOffers.map(x=>{
      const number=x.angebotsnummer||'Angebot ohne Nummer';
      const customer=x.kundenname||x.firma||'';
      return '<option value="'+escapeHtml(x.id)+'" '+(linked?.id===x.id?'selected':'')+'>'+escapeHtml(number+' · '+customer+' · '+euro(x.betrag||0))+'</option>';
    }).join('');
    const contact=[o.customer_phone?'Telefon: '+o.customer_phone:'',o.customer_email?'E-Mail: '+o.customer_email:''].filter(Boolean).join(' · ');
    const appointment=o.scheduled_date?formatDate(o.scheduled_date)+(o.scheduled_time?' · '+o.scheduled_time:''):'Noch kein Ausführungstermin festgelegt';
    return `<article class="order-card" data-order-card="${escapeHtml(o.id)}">
      <div class="order-card-head"><div><span class="eyebrow">AUFTRAG</span><h3>${escapeHtml(o.order_number)}</h3><p>${escapeHtml(o.customer_name)} · ${escapeHtml(o.service_type)}</p><div class="order-contact">${escapeHtml(contact||'Keine Kontaktdaten hinterlegt')}</div><div class="order-meta">Ausführung: ${escapeHtml(appointment)} · Angelegt: ${escapeHtml(formatDate(String(o.created_at||'').slice(0,10)))}</div></div><span class="order-card-value">${euro(o.agreed_amount||0)}</span></div>
      <div class="order-fields">
        <label>Status<select data-order-status="${escapeHtml(o.id)}">${statuses.map(s=>'<option value="'+s+'" '+(o.status===s?'selected':'')+'>'+s+'</option>').join('')}</select></label>
        <label>Auftragswert (€)<input type="number" min="0" step="0.01" value="${Number(o.agreed_amount||0).toFixed(2)}" data-order-field="agreed_amount"></label>
        <label>Ausführung am<input type="date" value="${escapeHtml(o.scheduled_date||'')}" data-order-field="scheduled_date"></label>
        <label>Uhrzeit<input type="time" value="${escapeHtml(o.scheduled_time||'')}" data-order-field="scheduled_time"></label>
        <label>Geschätzte Dauer (Std.)<input type="number" min="0" step="0.25" value="${o.estimated_hours==null?'':Number(o.estimated_hours)}" data-order-field="estimated_hours"></label>
        <label class="order-wide">Zugehöriges Angebot<select data-order-offer="${escapeHtml(o.id)}"><option value="">Kein Angebot verknüpft</option>${offerOptions}</select><small>Hier werden vorhandene Angebote aus dem Angebotsbereich zugeordnet. Neue PDF-Angebote erstellst du weiterhin über deinen bisherigen Ablauf.</small></label>
        <label>Externe Rechnungsnummer<input type="text" value="${escapeHtml(o.external_invoice_number||'')}" data-order-field="external_invoice_number" placeholder="Wird im Rechnungsprogramm erstellt"></label>
        <label class="order-wide">Leistungsbeschreibung<textarea rows="2" data-order-field="description">${escapeHtml(o.description||'')}</textarea></label>
        <label class="order-wide">Interne Notizen<textarea rows="2" data-order-field="notes">${escapeHtml(o.notes||'')}</textarea></label>
      </div>
      <div class="order-card-foot"><span>${linked?'Verknüpftes Angebot: '+escapeHtml(linked.angebotsnummer||'ohne Nummer'):'Noch kein Angebot zugeordnet'}</span><div class="order-card-actions"><button type="button" class="secondary-btn" data-order-invoice="${escapeHtml(o.id)}">Rechnung erstellen</button><button type="button" class="gold-btn" data-order-save="${escapeHtml(o.id)}">Änderungen speichern</button><button type="button" class="danger-btn" data-order-delete="${escapeHtml(o.id)}">Auftrag löschen</button></div></div>
    </article>`;
  };
  const groupedStatuses=statuses.map(status=>{
    const groupRows=rows.filter(o=>o.status===status);
    if(!groupRows.length)return '';
    return `<section class="order-status-group"><div class="order-status-heading"><h3>${status}</h3><span>${groupRows.length} ${groupRows.length===1?'Auftrag':'Aufträge'}</span></div>${groupRows.map(renderCard).join('')}</section>`;
  }).join('');
  const ungrouped=rows.filter(o=>!statuses.includes(o.status));
  orderList.innerHTML=groupedStatuses+(ungrouped.length?`<section class="order-status-group"><div class="order-status-heading"><h3>Weitere Status</h3><span>${ungrouped.length}</span></div>${ungrouped.map(renderCard).join('')}</section>`:'');
}

async function createManualOrder(event){
  event.preventDefault();
  if(!manualOrderForm)return;
  const submit=manualOrderForm.querySelector('button[type="submit"]');
  const formData=new FormData(manualOrderForm);
  const customerName=String(formData.get('customer_name')||'').trim();
  const serviceType=String(formData.get('service_type')||'').trim();
  const amount=Number(formData.get('agreed_amount')||0);
  const hoursValue=String(formData.get('estimated_hours')||'').trim();
  const hours=hoursValue===''?null:Number(hoursValue);
  if(!customerName||!serviceType){alert('Bitte Kundenname und Leistung ausfüllen.');return;}
  if(!Number.isFinite(amount)||amount<0){alert('Bitte einen gültigen Auftragswert eingeben.');return;}
  if(hours!==null&&(!Number.isFinite(hours)||hours<0)){alert('Bitte eine gültige geschätzte Dauer eingeben.');return;}
  const email=String(formData.get('customer_email')||'').trim();
  const phone=String(formData.get('customer_phone')||'').trim();
  const nameParts=customerName.split(/\s+/);
  if(manualOrderMsg)manualOrderMsg.textContent='Auftrag wird angelegt…';
  if(submit)submit.disabled=true;
  try{
    let customerId=null;
    if(email){
      const {data:matches,error}=await db.from('customers').select('id').ilike('email',email).order('created_at',{ascending:true}).limit(1);
      if(error)throw error;
      if(matches?.length)customerId=matches[0].id;
      else{
        const {data:newCustomer,error:createError}=await db.from('customers').insert({
          vorname:nameParts[0]||null,nachname:nameParts.slice(1).join(' ')||null,
          email,telefon:phone||null,land:'Deutschland',notizen:'Kundenstamm aus manuell angelegtem Auftrag erstellt'
        }).select('id').single();
        if(createError)throw createError;
        customerId=newCustomer.id;
      }
    }
    const payload={
      request_id:null,customer_id:customerId,status:'Offen',
      service_type:serviceType,customer_name:customerName,
      customer_email:email||null,customer_phone:phone||null,
      description:String(formData.get('description')||'').trim()||serviceType,
      scheduled_date:String(formData.get('scheduled_date')||'')||null,
      scheduled_time:String(formData.get('scheduled_time')||'')||null,
      estimated_hours:hours,agreed_amount:amount
    };
    const {data:created,error}=await db.from('orders').insert(payload).select('*').single();
    if(error)throw error;
    manualOrderForm.reset();
    manualOrderForm.elements.agreed_amount.value='0';
    if(manualOrderMsg)manualOrderMsg.textContent='Auftrag '+created.order_number+' wurde angelegt.';
    await loadOrders();
  }catch(error){
    if(manualOrderMsg)manualOrderMsg.textContent='Fehler: '+error.message;
    alert('Auftrag konnte nicht angelegt werden: '+error.message);
  }finally{if(submit)submit.disabled=false;}
}

async function saveOrderDetails(button){
  const card=button.closest('[data-order-card]');
  const order=currentOrders.find(o=>o.id===button.dataset.orderSave);
  if(!card||!order)return;
  const value=name=>card.querySelector('[data-order-field="'+name+'"]')?.value??'';
  const amount=Number(value('agreed_amount'));
  if(!Number.isFinite(amount)||amount<0){alert('Bitte einen gültigen Auftragswert ab 0,00 € eingeben.');return;}
  const hoursRaw=value('estimated_hours');
  const hours=hoursRaw===''?null:Number(hoursRaw);
  if(hours!==null&&(!Number.isFinite(hours)||hours<0)){alert('Bitte eine gültige Dauer ab 0 Stunden eingeben.');return;}
  const payload={agreed_amount:amount,scheduled_date:value('scheduled_date')||null,scheduled_time:value('scheduled_time')||null,estimated_hours:hours,external_invoice_number:value('external_invoice_number').trim()||null,description:value('description').trim()||null,notes:value('notes').trim()||null,updated_at:new Date().toISOString()};
  button.disabled=true;
  try{
    const {error}=await db.from('orders').update(payload).eq('id',order.id);
    if(error)throw error;
    Object.assign(order,payload);
    renderOrders();
    alert('Auftrag '+order.order_number+' wurde aktualisiert.');
  }catch(error){alert('Auftrag konnte nicht gespeichert werden: '+error.message);}
  finally{button.disabled=false;}
}

async function deleteOrder(button){
  const order=currentOrders.find(o=>o.id===button.dataset.orderDelete);
  if(!order)return;
  const linkedOffer=currentOffers.find(x=>x.order_id===order.id);
  const warning=linkedOffer
    ? '\n\nDas zugeordnete Angebot bleibt erhalten und wird vom Auftrag getrennt.'
    : '';
  if(!confirm('Möchtest du den Auftrag '+order.order_number+' wirklich endgültig löschen?\n\nDie ursprüngliche Anfrage und Kundendaten bleiben erhalten.'+warning))return;
  button.disabled=true;
  try{
    const {error}=await db.from('orders').delete().eq('id',order.id);
    if(error)throw error;
    currentOrders=currentOrders.filter(o=>o.id!==order.id);
    orderRequestIds=new Set(currentOrders.map(o=>o.request_id).filter(Boolean));
    currentOffers.forEach(offer=>{if(offer.order_id===order.id)offer.order_id=null;});
    renderOrders();
    renderOffers();
    alert('Auftrag '+order.order_number+' wurde gelöscht.');
  }catch(error){
    alert('Auftrag konnte nicht gelöscht werden: '+error.message);
    button.disabled=false;
  }
}

async function saveOrderOfferLink(select){
  const order=currentOrders.find(o=>o.id===select.dataset.orderOffer);
  if(!order)return;
  const nextId=select.value||null;
  const previous=currentOffers.find(x=>x.order_id===order.id);
  if((previous?.id||'')===(nextId||''))return;
  if(nextId&&currentOffers.some(x=>x.id===nextId&&x.order_id&&x.order_id!==order.id)){
    alert('Dieses Angebot ist bereits einem anderen Auftrag zugeordnet.');
    renderOrders();
    return;
  }
  select.disabled=true;
  try{
    // Erst das neue Angebot zuordnen. So bleibt die bisherige Verknüpfung erhalten,
    // falls die neue Zuordnung fehlschlägt.
    if(nextId){
      const {data,error}=await db.from('offers').update({order_id:order.id}).eq('id',nextId).is('order_id',null).select('id').maybeSingle();
      if(error)throw error;
      if(!data)throw new Error('Das Angebot wurde inzwischen einem anderen Auftrag zugeordnet. Bitte neu laden.');
    }
    if(previous){
      const {error}=await db.from('offers').update({order_id:null}).eq('id',previous.id);
      if(error)throw error;
      previous.order_id=null;
    }
    if(nextId){
      const selected=currentOffers.find(x=>x.id===nextId);
      if(selected)selected.order_id=order.id;
    }
    renderOrders();
    renderOffers();
  }catch(error){
    alert('Angebot konnte nicht zugeordnet werden: '+error.message);
    await loadOffers(false);
  }finally{select.disabled=false;}
}
async function saveOrderAmount(input){
  const order=currentOrders.find(o=>o.id===input.dataset.orderAmount);
  if(!order)return;
  const amount=Number(input.value);
  if(!Number.isFinite(amount)||amount<0){input.value=Number(order.agreed_amount||0).toFixed(2);alert('Bitte einen gültigen Betrag ab 0,00 € eingeben.');return;}
  const previous=Number(order.agreed_amount||0);
  if(amount===previous)return;
  input.disabled=true;
  try{
    const {error}=await db.from('orders').update({agreed_amount:amount,updated_at:new Date().toISOString()}).eq('id',order.id);
    if(error)throw error;
    order.agreed_amount=amount;
    renderOrders();
  }catch(error){input.value=previous.toFixed(2);alert('Auftragswert konnte nicht gespeichert werden: '+error.message);}
  finally{input.disabled=false;}
}
async function saveOrderStatus(select){
  const order=currentOrders.find(o=>o.id===select.dataset.orderStatus);
  if(!order)return;
  const previous=order.status;
  const status=select.value;
  if(status===previous)return;
  select.disabled=true;
  try{
    const {error}=await db.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',order.id);
    if(error)throw error;
    order.status=status;
    renderOrders();
  }catch(error){select.value=previous;alert('Auftragsstatus konnte nicht gespeichert werden: '+error.message);}
  finally{select.disabled=false;}
}
async function createOrderFromRequest(id){
  const request=requests.find(r=>r.id===id);
  if(!request)return;
  if(orderRequestIds.has(id)){alert('Für diese Anfrage wurde bereits ein Auftrag angelegt.');return;}
  const customerName=[request.first_name,request.last_name].filter(Boolean).join(' ').trim()||'Kunde';
  if(!confirm('Aus dieser Anfrage einen Auftrag für '+customerName+' erstellen?\n\nDie ursprüngliche Anfrage bleibt erhalten.'))return;
  try{
    let customerId=null;
    const email=String(request.email||'').trim().toLowerCase();
    if(email){
      const {data:matches,error:customerLookupError}=await db.from('customers').select('id').ilike('email',email).order('created_at',{ascending:true}).limit(1);
      if(customerLookupError)throw customerLookupError;
      if(matches?.length)customerId=matches[0].id;
    }
    if(!customerId){
      const {data:newCustomer,error:createCustomerError}=await db.from('customers').insert({
        vorname:request.first_name||null,nachname:request.last_name||null,
        telefon:request.phone||null,email:request.email||null,land:'Deutschland',
        notizen:'Automatisch aus Kundenanfrage '+id+' übernommen'
      }).select('id').single();
      if(createCustomerError)throw createCustomerError;
      customerId=newCustomer.id;
    }
    const vehicle=[request.make,request.model,request.vehicle_type].filter(Boolean).join(' ');
    const description=[request.details,request.message,vehicle?('Fahrzeug: '+vehicle):null,
      request.care_options?.length?('Leistungen: '+request.care_options.join(', ')):null].filter(Boolean).join('\n');
    const {data:created,error}=await db.from('orders').insert({
      request_id:request.id,customer_id:customerId,status:'Offen',
      service_type:request.service_type,customer_name:customerName,
      customer_email:request.email,customer_phone:request.phone,
      description:description||request.service_type,
      scheduled_date:request.requested_date||null,
      scheduled_time:request.requested_time||null,
      estimated_hours:request.duration_hours||null,
      agreed_amount:0
    }).select('*').single();
    if(error)throw error;
    currentOrders.unshift(created);
    orderRequestIds.add(request.id);
    renderOrders();
    await load();
    alert('Auftrag '+created.order_number+' wurde erfolgreich angelegt.');
  }catch(error){
    if(error.code==='23505'){
      await loadOrders();
      alert('Für diese Anfrage existiert bereits ein Auftrag.');
    }else{
      alert('Auftrag konnte nicht erstellt werden: '+error.message);
    }
  }
}

function showView(view){
  dashboardHome.classList.toggle('hidden',view!=='dashboard');
  if(ordersView)ordersView.classList.toggle('hidden',view!=='orders');
  requestsView.classList.toggle('hidden',view!=='requests');
  receiptsView.classList.toggle('hidden',view!=='receipts');
  if(invoicesView)invoicesView.classList.toggle('hidden',view!=='invoices');
  if(offersView)offersView.classList.toggle('hidden',view!=='offers');
  if(customersView)customersView.classList.toggle('hidden',view!=='customers');
  if(existingCustomersView)existingCustomersView.classList.toggle('hidden',view!=='existingCustomers');
  document.querySelectorAll('[data-back-dashboard]').forEach(btn=>btn.classList.toggle('hidden',view==='dashboard'));
  document.querySelectorAll('[data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===view));
  if(window.matchMedia('(max-width: 800px)').matches)closeAdminSidebar();

  if(pageTitle && view==='dashboard')pageTitle.textContent='Dashboard';
  if(pageTitle && view==='requests')pageTitle.textContent='Terminanfragen';
  if(pageTitle && view==='orders')pageTitle.textContent='Auftragsverwaltung';
  if(pageTitle && view==='receipts')pageTitle.textContent='Belege';
  if(pageTitle && view==='invoices')pageTitle.textContent='Rechnungen';
  if(pageTitle && view==='offers')pageTitle.textContent='Angebote';
  if(pageTitle && view==='customers')pageTitle.textContent='Kunden anlegen';
  if(pageTitle && view==='existingCustomers')pageTitle.textContent='Bestandskunden';

  if(view==='requests')load();
  if(view==='orders')loadOrders();
  if(view==='receipts'){
    receiptDate.value=receiptDate.value||new Date().toLocaleDateString('sv-SE');
    loadReceipts();
  }
  if(view==='invoices'){loadInvoices();loadInvoiceSettings().catch(err=>console.warn('Rechnungseinstellungen:',err.message));loadIssuedInvoices();ensureInvoiceSources().catch(err=>console.warn('Rechnungsquellen:',err.message));}
  if(view==='offers')loadOffers(false);
  if(view==='customers')resetCustomerForm();
  if(view==='existingCustomers')loadBestandskunden();
}

document.querySelectorAll('[data-nav]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    showView(btn.dataset.nav);
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

function openAdminSidebar(){
  adminSidebar?.classList.add('is-open');
  sidebarBackdrop?.classList.add('is-visible');
  sidebarToggle?.setAttribute('aria-expanded','true');
}
function closeAdminSidebar(){
  adminSidebar?.classList.remove('is-open');
  sidebarBackdrop?.classList.remove('is-visible');
  sidebarToggle?.setAttribute('aria-expanded','false');
}
sidebarToggle?.addEventListener('click',()=>{
  if(window.matchMedia('(max-width: 800px)').matches){
    adminSidebar?.classList.contains('is-open')?closeAdminSidebar():openAdminSidebar();
  }else{
    document.getElementById('dash')?.classList.toggle('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded',String(!document.getElementById('dash')?.classList.contains('sidebar-collapsed')));
  }
});
sidebarClose?.addEventListener('click',closeAdminSidebar);
sidebarBackdrop?.addEventListener('click',closeAdminSidebar);


document.querySelectorAll('[data-back-dashboard]').forEach(btn=>btn.addEventListener('click',()=>{showView('dashboard');window.scrollTo({top:0,behavior:'smooth'});}));


orderSearch?.addEventListener('input',renderOrders);
orderStatusFilter?.addEventListener('change',renderOrders);
manualOrderForm?.addEventListener('submit',createManualOrder);
ordersView?.addEventListener('change',e=>{
  const select=e.target.closest('[data-order-status]');if(select)saveOrderStatus(select);
  const amount=e.target.closest('[data-order-amount]');if(amount)saveOrderAmount(amount);
  const offer=e.target.closest('[data-order-offer]');if(offer)saveOrderOfferLink(offer);
});
ordersView?.addEventListener('click',async e=>{const invoice=e.target.closest('[data-order-invoice]');if(invoice){showView('invoices');await ensureInvoiceSources();return openInvoiceDraftFromOrder(invoice.dataset.orderInvoice);}const del=e.target.closest('[data-order-delete]');if(del)return deleteOrder(del);const button=e.target.closest('[data-order-save]');if(button)saveOrderDetails(button)});

invoiceSettingsForm?.addEventListener('submit',saveInvoiceSettings);
invoiceDraftForm?.addEventListener('submit',createInvoiceDraft);
invoicePreviewBtn?.addEventListener('click',()=>createInvoiceDraft(null,{preview:true}));
invoiceNewBtn?.addEventListener('click',async()=>{resetInvoiceDraft();invoiceDraftForm.classList.remove('hidden');invoiceSetField('invoiceServiceDate',new Date().toLocaleDateString('sv-SE'));await ensureInvoiceSources();invoiceDraftForm.scrollIntoView({behavior:'smooth',block:'start'});});
invoiceDraftCancelBtn?.addEventListener('click',()=>invoiceDraftForm.classList.add('hidden'));
invoicePreviewClose?.addEventListener('click',closeInvoicePreview);
invoicePreviewEdit?.addEventListener('click',()=>{const id=currentInvoicePreviewId;closeInvoicePreview();if(id)editInvoiceDraft(id);});
invoicePreviewDownload?.addEventListener('click',downloadCurrentInvoicePreview);
invoicePreviewPrint?.addEventListener('click',()=>{if(currentInvoicePreviewUrl){const w=window.open(currentInvoicePreviewUrl,'_blank');if(w)w.addEventListener('load',()=>w.print(),{once:true});}});
invoicePreviewIssue?.addEventListener('click',()=>{if(currentInvoicePreviewId)issueInvoice(currentInvoicePreviewId);});
invoicePreviewZoomIn?.addEventListener('click',()=>{currentInvoicePreviewZoom=Math.min(160,currentInvoicePreviewZoom+10);invoicePreviewZoomLabel.textContent=currentInvoicePreviewZoom+' %';invoicePreviewFrame.style.transform='scale('+(currentInvoicePreviewZoom/100)+')';invoicePreviewFrame.style.transformOrigin='top center';});
invoicePreviewZoomOut?.addEventListener('click',()=>{currentInvoicePreviewZoom=Math.max(70,currentInvoicePreviewZoom-10);invoicePreviewZoomLabel.textContent=currentInvoicePreviewZoom+' %';invoicePreviewFrame.style.transform='scale('+(currentInvoicePreviewZoom/100)+')';invoicePreviewFrame.style.transformOrigin='top center';});
invoicePreviewModal?.addEventListener('click',e=>{if(e.target===invoicePreviewModal)closeInvoicePreview();});
invoiceAddItemBtn?.addEventListener('click',()=>addInvoiceItemRow());
invoiceDraftItems?.addEventListener('click',e=>{const b=e.target.closest('[data-inv-item-remove]');if(b){b.closest('.invoice-item-row')?.remove();if(!invoiceDraftItems.querySelector('.invoice-item-row'))addInvoiceItemRow();}});
invoiceSourceOrder?.addEventListener('change',onInvoiceSourceOrder);
invoiceSourceOffer?.addEventListener('change',onInvoiceSourceOffer);
issuedInvoiceSearch?.addEventListener('input',renderIssuedInvoices);
issuedInvoiceList?.addEventListener('click',async e=>{
  const edit=e.target.closest('[data-invoice-edit]');if(edit)return editInvoiceDraft(edit.dataset.invoiceEdit);
  const preview=e.target.closest('[data-invoice-preview]');if(preview){const inv=currentIssuedInvoices.find(x=>x.id===preview.dataset.invoicePreview);return openInvoicePreview(inv);}
  const issue=e.target.closest('[data-invoice-issue]');if(issue)return issueInvoice(issue.dataset.invoiceIssue);
  const del=e.target.closest('[data-invoice-delete]');if(del)return deleteInvoiceDraft(del.dataset.invoiceDelete);
  const cancel=e.target.closest('[data-invoice-cancel]');if(cancel)return cancelInvoice(cancel.dataset.invoiceCancel);
  const payment=e.target.closest('[data-invoice-payment]');if(payment)return addInvoicePayment(payment.dataset.invoicePayment);
  const regen=e.target.closest('[data-invoice-generate-docs]');if(regen){const inv=currentIssuedInvoices.find(x=>x.id===regen.dataset.invoiceGenerateDocs);if(inv){try{await createInvoiceFiles(inv);await loadIssuedInvoices();alert('Rechnungsdokumente wurden neu erzeugt.');}catch(err){alert('Dokumente konnten nicht erzeugt werden: '+err.message);}}return;}
  const download=e.target.closest('[data-invoice-download]');if(download)return downloadInvoiceDocument(download.dataset.invoiceDownload,download.dataset.kind);
});
offerSearch?.addEventListener('input',renderOffers);
offerStatusFilter?.addEventListener('change',renderOffers);
offerList?.addEventListener('change',e=>{
  const select=e.target.closest('[data-offer-number]');
  if(select)handleOfferStatusChange(select);
});

customerSearch?.addEventListener('input',renderCustomers);
customerForm?.addEventListener('submit',saveCustomer);
cancelCustomerBtn?.addEventListener('click',resetCustomerForm);
customerList?.addEventListener('click',e=>{
  const request=e.target.closest('[data-customer-request-details]');
  if(request)return openDetails(request.dataset.customerRequestDetails);
  const edit=e.target.closest('[data-customer-edit]');
  if(edit)return editCustomer(edit.dataset.customerEdit);
  const del=e.target.closest('[data-customer-delete]');
  if(del)return deleteCustomer(del.dataset.customerDelete);
});

receiptImage?.addEventListener('change',()=>{
  ocrMsg.classList.add('hidden');
  if(receiptImage.files?.[0]){
    if(!receiptDate.value)receiptDate.value=new Date().toLocaleDateString('sv-SE');
    recognizeReceipt();
  }
});

receiptForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  await saveReceipt();
});
receiptList?.addEventListener('click',async e=>{
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


listEl.addEventListener('click',async e=>{const button=e.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='details')return openDetails(id);if(action==='create-order')return createOrderFromRequest(id);if(action==='confirm')return confirmRequest(id);if(action==='reject')return rejectRequest(id);if(action==='alternative')return alternativeRequest(id);if(action==='delete')return deleteRequest(id)});
detailActions.addEventListener('click',async e=>{const button=e.target.closest('button[data-modal-action]');if(!button||!selectedRequest)return;const action=button.dataset.modalAction;if(action==='create-order')await createOrderFromRequest(selectedRequest.id);if(action==='confirm')await confirmRequest(selectedRequest.id);if(action==='reject')await rejectRequest(selectedRequest.id);if(action==='alternative')await alternativeRequest(selectedRequest.id);if(action==='delete')await deleteRequest(selectedRequest.id)});
closeModal.addEventListener('click',closeDetails);modal.addEventListener('click',e=>{if(e.target===modal)closeDetails()});logoutBtn.addEventListener('click',async()=>{await db.auth.signOut();location.reload()});refreshBtn.addEventListener('click',async()=>{refreshBtn.disabled=true;try{await load();await loadReceipts();await loadFinancials();await loadInvoices();await loadOffers(false);await loadCustomers();await loadIssuedInvoices();}finally{refreshBtn.disabled=false;}});
refreshOffersBtn?.addEventListener('click',async()=>{refreshOffersBtn.disabled=true;try{await loadOffers(true);}finally{refreshOffersBtn.disabled=false;}});
init();