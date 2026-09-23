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
const receiptList = document.getElementById('receiptList');

const modal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailActions = document.getElementById('detailActions');
const closeModal = document.getElementById('closeModal');
let requests=[];let selectedRequest=null;

function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function formatDate(value){if(!value)return '—';const d=new Date(value+'T00:00:00');return Number.isNaN(d.getTime())?value:d.toLocaleDateString('de-DE')}
function showLoginMessage(message){loginMsg.textContent=message;loginMsg.classList.remove('hidden')}
async function init(){const {data,error}=await db.auth.getSession();if(error){showLoginMessage(error.message);return}const session=data.session;if(!session){loginEl.classList.remove('hidden');dashEl.classList.add('hidden');return}loginEl.classList.add('hidden');dashEl.classList.remove('hidden');userEl.textContent=session.user.email||'';showView('dashboard');await load();await loadReceipts()}
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

  // Belege werden in einem späteren Schritt an dieselbe Oberfläche angebunden.
  dashReceiptCount.textContent='0';
  dashYearGross.textContent='0,00 €';
  dashMonthGross.textContent='0,00 €';

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

function euro(value){
  return Number(value||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
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
  const yearGross=rows.filter(r=>String(r.receipt_date||'').startsWith(String(year))).reduce((s,r)=>s+Number(r.gross_amount||0),0);
  const monthGross=rows.filter(r=>{
    const d=String(r.receipt_date||'').split('-');
    return Number(d[0])===year && Number(d[1])===month;
  }).reduce((s,r)=>s+Number(r.gross_amount||0),0);

  dashReceiptCount.textContent=String(rows.length);
  dashYearGross.textContent=euro(yearGross);
  dashMonthGross.textContent=euro(monthGross);

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

async function saveReceipt(){
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

loginForm.addEventListener('submit',async e=>{e.preventDefault();loginMsg.classList.add('hidden');const {error}=await db.auth.signInWithPassword({email:emailEl.value.trim(),password:passwordEl.value});if(error){showLoginMessage(error.message);return}await init()});
listEl.addEventListener('click',async e=>{const button=e.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='details')return openDetails(id);if(action==='confirm')return confirmRequest(id);if(action==='reject')return rejectRequest(id);if(action==='alternative')return alternativeRequest(id);if(action==='delete')return deleteRequest(id)});
detailActions.addEventListener('click',async e=>{const button=e.target.closest('button[data-modal-action]');if(!button||!selectedRequest)return;const action=button.dataset.modalAction;if(action==='confirm')await confirmRequest(selectedRequest.id);if(action==='reject')await rejectRequest(selectedRequest.id);if(action==='alternative')await alternativeRequest(selectedRequest.id);if(action==='delete')await deleteRequest(selectedRequest.id)});
closeModal.addEventListener('click',closeDetails);modal.addEventListener('click',e=>{if(e.target===modal)closeDetails()});logoutBtn.addEventListener('click',async()=>{await db.auth.signOut();location.reload()});refreshBtn.addEventListener('click',load);init();
