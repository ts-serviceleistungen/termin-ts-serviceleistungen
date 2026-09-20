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
const modal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailActions = document.getElementById('detailActions');
const closeModal = document.getElementById('closeModal');
let requests=[];let selectedRequest=null;

function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function formatDate(value){if(!value)return '—';const d=new Date(value+'T00:00:00');return Number.isNaN(d.getTime())?value:d.toLocaleDateString('de-DE')}
function showLoginMessage(message){loginMsg.textContent=message;loginMsg.classList.remove('hidden')}
async function init(){const {data,error}=await db.auth.getSession();if(error){showLoginMessage(error.message);return}const session=data.session;if(!session){loginEl.classList.remove('hidden');dashEl.classList.add('hidden');return}loginEl.classList.add('hidden');dashEl.classList.remove('hidden');userEl.textContent=session.user.email||'';await load()}
async function load(){listEl.innerHTML='<p>Aktualisiere Anfragen...</p>';const {data,error}=await db.from('requests').select('*').order('created_at',{ascending:false});if(error){listEl.innerHTML=`<p class="notice">Fehler beim Laden: ${escapeHtml(error.message)}</p>`;return}requests=data||[];newEl.textContent=requests.filter(x=>x.status==='Neue Anfrage').length;openEl.textContent=requests.filter(x=>!['Abgelehnt','Abgeschlossen'].includes(x.status)).length;const today=new Date().toLocaleDateString('sv-SE');todayEl.textContent=requests.filter(x=>x.requested_date===today).length;if(!requests.length){listEl.innerHTML='<p>Keine Anfragen vorhanden.</p>';return}listEl.innerHTML=requests.map(x=>{
  const isGarden=x.service_type==='Gartenarbeiten';
  const middle=isGarden
    ? `<div><b>Gartenarbeiten</b><small>${escapeHtml(x.garden_area||'Fläche —')} · ${escapeHtml(x.garden_condition||'Zustand —')}</small></div>`
    : `<div><b>${escapeHtml(x.make)} ${escapeHtml(x.model)}</b><small>${escapeHtml(x.vehicle_type)} · ${escapeHtml(x.color)}</small></div>`;
  const duration=x.duration_label?` · ${escapeHtml(x.duration_label)}`:'';
  return `<div class="row request-row"><div><b>${escapeHtml(x.first_name)} ${escapeHtml(x.last_name)}</b><small>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</small></div>${middle}<div><b>${escapeHtml(x.service_type)}</b><small>${formatDate(x.requested_date)} · ${escapeHtml(x.requested_time||'—')}${duration}</small></div><div><span class="badge">${escapeHtml(x.status||'Neue Anfrage')}</span><br><button data-action="details" data-id="${x.id}">Details</button><button data-action="confirm" data-id="${x.id}">Bestätigen</button><button data-action="alternative" data-id="${x.id}">Alternative</button><button data-action="reject" data-id="${x.id}">Ablehnen</button></div></div>`;
}).join('')}
function field(label,value){return `<div class="detail-field"><small>${escapeHtml(label)}</small><div>${escapeHtml(value||'—')}</div></div>`}
function arrayValue(value){return Array.isArray(value)&&value.length?value.join(', '):'—'}
async function openDetails(id){selectedRequest=requests.find(x=>x.id===id);if(!selectedRequest)return;const x=selectedRequest;detailTitle.textContent=`${x.first_name||''} ${x.last_name||''}`.trim()||'Anfrage';detailBody.innerHTML=`<div class="detail-grid">${field('Status',x.status)}${field('Leistung',x.service_type)}${field('Wunschdatum',formatDate(x.requested_date))}${field('Wunschzeit',x.requested_time)}${field('Vorname',x.first_name)}${field('Nachname',x.last_name)}${field('Telefon',x.phone)}${field('E-Mail',x.email)}${field('Fahrzeugart',x.vehicle_type)}${field('Hersteller',x.make)}${field('Modell / Typ',x.model)}${field('Farbe',x.color)}${field('Baujahr',x.year)}${field('Kennzeichen',x.plate)}${field('Verschmutzungsgrad',x.dirt_level)}${field('Tierhaare',x.pet_hair)}${field('Menge',x.quantity)}${field('Reifentyp',x.tire_type)}${field('Gewünschte Leistungen',arrayValue(x.care_options))}${x.service_type==='Gartenarbeiten'?field('Gartenfläche',x.garden_area):''}${x.service_type==='Gartenarbeiten'?field('Gartenzustand',x.garden_condition):''}${field('Geplante Dauer',x.duration_label)}${field('Startzeit',x.requested_time)}</div><div class="detail-text">${field('Details / Nachricht',x.details||x.message)}</div><div id="photoGallery" class="photo-gallery"><p>Fotos werden geladen...</p></div>`;detailActions.innerHTML='<button class="primary" data-modal-action="confirm">Termin bestätigen</button><button data-modal-action="alternative">Alternativtermin</button><button data-modal-action="reject">Anfrage ablehnen</button>';modal.classList.remove('hidden');await loadRequestPhotos(x.id)}
async function loadRequestPhotos(requestId){const gallery=document.getElementById('photoGallery');if(!gallery)return;const {data,error}=await db.from('request_photos').select('storage_path,created_at').eq('request_id',requestId).order('created_at',{ascending:true});if(error){gallery.innerHTML=`<p class="notice">Fotos konnten nicht geladen werden: ${escapeHtml(error.message)}</p>`;return}if(!data||!data.length){gallery.innerHTML='<p>Keine Fotos vorhanden.</p>';return}const items=[];for(const photo of data){const {data:urlData,error:urlError}=await db.storage.from('vehicle-photos').createSignedUrl(photo.storage_path,3600);if(urlError||!urlData?.signedUrl){items.push(`<div class="photo-item"><p>Foto konnte nicht geladen werden.</p></div>`)}else{items.push(`<a class="photo-item" href="${escapeHtml(urlData.signedUrl)}" target="_blank" rel="noopener"><img src="${escapeHtml(urlData.signedUrl)}" alt="Fahrzeugfoto" loading="lazy"></a>`)}}gallery.innerHTML=`<h3>Fahrzeugfotos</h3><div class="photo-grid">${items.join('')}</div>`}
function closeDetails(){modal.classList.add('hidden');selectedRequest=null}
async function sendCustomerEmail(r,status,extra={}){const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Admin-Sitzung abgelaufen');const url=status==='Bestätigt'?CONFIRM_FUNCTION_URL:CUSTOMER_FUNCTION_URL;const body=status==='Bestätigt'?{request:r}:{request:r,status,...extra};const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify(body)});if(!response.ok){const t=await response.text();throw new Error(t||'E-Mail konnte nicht gesendet werden')}return response.json()}
async function updateRequest(id,changes,emailStatus){const current=requests.find(x=>x.id===id);if(!current)return false;const {error}=await db.from('requests').update(changes).eq('id',id);if(error){alert('Fehler: '+error.message);return false}const updated={...current,...changes};if(emailStatus){try{await sendCustomerEmail(updated,emailStatus,{old_status:current.status})}catch(err){alert('Anfrage wurde gespeichert, aber die Kunden-E-Mail konnte nicht gesendet werden.\n\n'+err.message)}}await load();return true}
async function confirmRequest(id){if(!confirm('Soll diese Terminanfrage als bestätigt markiert werden?'))return;await updateRequest(id,{status:'Bestätigt'},'Bestätigt');closeDetails()}
async function rejectRequest(id){if(!confirm('Soll diese Anfrage wirklich abgelehnt werden?'))return;await updateRequest(id,{status:'Abgelehnt'},'Abgelehnt');closeDetails()}
async function alternativeRequest(id){const r=requests.find(x=>x.id===id);if(!r)return;const date=prompt('Welches Alternativdatum möchtest du anbieten?',r.requested_date||'');if(date===null)return;const time=prompt('Welche Alternativzeit möchtest du anbieten?',r.requested_time||'');if(time===null)return;await updateRequest(id,{status:'Alternativtermin',requested_date:date||r.requested_date,requested_time:time||r.requested_time},'Alternativtermin');closeDetails()}
loginForm.addEventListener('submit',async e=>{e.preventDefault();loginMsg.classList.add('hidden');const {error}=await db.auth.signInWithPassword({email:emailEl.value.trim(),password:passwordEl.value});if(error){showLoginMessage(error.message);return}await init()});
listEl.addEventListener('click',async e=>{const button=e.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='details')return openDetails(id);if(action==='confirm')return confirmRequest(id);if(action==='reject')return rejectRequest(id);if(action==='alternative')return alternativeRequest(id)});
detailActions.addEventListener('click',async e=>{const button=e.target.closest('button[data-modal-action]');if(!button||!selectedRequest)return;const action=button.dataset.modalAction;if(action==='confirm')await confirmRequest(selectedRequest.id);if(action==='reject')await rejectRequest(selectedRequest.id);if(action==='alternative')await alternativeRequest(selectedRequest.id)});
closeModal.addEventListener('click',closeDetails);modal.addEventListener('click',e=>{if(e.target===modal)closeDetails()});logoutBtn.addEventListener('click',async()=>{await db.auth.signOut();location.reload()});refreshBtn.addEventListener('click',load);init();
