const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=id=>document.getElementById(id);
const FUNCTION_URL=`${SUPABASE_URL}/functions/v1/notify-new-request`;
function calculateDuration(){
  const service=$('service_type').value;
  if(service==='Renovierung & Reparaturen')return{hours:0,label:'Nach Aufwand'};
  if(service!=='Fahrzeugpflege')return{hours:2,label:'2 Stunden'};
  const options=[...document.querySelectorAll('input[name=care]:checked')].map(x=>x.value);
  let base=0;
  if(options.includes('Komplettaufbereitung'))base=4;
  else{
    if(options.includes('Außenreinigung'))base+=1.5;
    if(options.includes('Innenraumreinigung'))base+=2.5;
  }
  if(options.includes('Polsterreinigung'))base+=2;
  if(options.includes('Politur'))base+=4;
  if(options.includes('Lackversiegelung'))base+=2;
  if(!base)base=2;
  const vehicleFactors={'Kleinwagen':0.9,'Kompaktklasse':1,'Mittelklasse':1.1,'SUV / Geländewagen':1.2,'Transporter':1.35,'Wohnmobil':1.5,'Sonstiges':1.15};
  const factor=vehicleFactors[$('vehicle_class').value]||1;
  const dirtExtra=$('dirt_level').value==='Stark'?0.5:$('dirt_level').value==='Sehr stark'?1:0;
  const petExtra={'Ja – gering':0.5,'Ja – mittel':1,'Ja – stark':1.5}[$('pet_hair').value]||0;
  const hours=Math.ceil((base*factor+dirtExtra+petExtra)*2)/2;
  const label=hours===8?'1 Arbeitstag':hours.toLocaleString('de-DE')+' Stunden';
  return{hours,label};
}
function formatLocalDate(date){
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
function buildVehicleSegments(date,time,hours){
  let remaining=Number(hours),first=true;
  let day=new Date(date+'T12:00:00');
  const segments=[];
  while(remaining>0){
    let start;
    if(first)start=new Date(date+'T'+time+':00');
    else{
      day.setDate(day.getDate()+1);
      while(day.getDay()===0||day.getDay()===6)day.setDate(day.getDate()+1);
      start=new Date(day.getFullYear(),day.getMonth(),day.getDate(),8,0,0,0);
    }
    const part=Math.min(remaining,8);
    const end=new Date(start.getTime()+part*3600000);
    segments.push({start,end});
    remaining-=part;
    first=false;
  }
  return segments;
}
function ensureDurationBox(){
  const el=$('durationInfo');if(!el)return;
  const d=calculateDuration();
  const date=$('requested_date').value,time=$('requested_time').value;
  let finish='';
  if(date&&time&&$('service_type').value==='Fahrzeugpflege'){
    const segments=buildVehicleSegments(date,time,d.hours);
    const end=segments[segments.length-1]?.end;
    if(end)finish='<br>Voraussichtliches Ende: <b>'+end.toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'})+'</b>';
  }
  if($('service_type').value==='Fahrzeugpflege')el.innerHTML='<b>Voraussichtliche Arbeitsdauer: '+d.label+'</b>'+finish+'<br>Der gewählte Zeitpunkt ist die gewünschte Abgabezeit bzw. der Arbeitsbeginn. Bei mehr als 8 Stunden wird die Arbeit auf weitere Werktage verteilt. 30 Minuten Abstand zu anderen Terminen werden berücksichtigt.<br>Der Termin wird erst nach persönlicher Bestätigung verbindlich.';
  else el.innerHTML='<b>Voraussichtliche Bearbeitungsdauer: '+d.label+'</b><br>Der Termin wird erst nach Prüfung und Bestätigung durch T.S. Serviceleistungen verbindlich.';
}
function setAppointmentTimeOptions(vehicleCare){
  const select=$('requested_time');
  const previous=select.value;
  const values=vehicleCare
    ? Array.from({length:17},(_,i)=>{const minutes=8*60+i*30;return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')})
    : ['Vormittags','08:00 – 10:00','10:00 – 12:00','13:00 – 15:00','15:00 – 17:00'];
  select.innerHTML=(vehicleCare?'<option value="">Bitte Startzeit wählen</option>':'')+values.map(v=>'<option value="'+v+'">'+v+'</option>').join('');
  select.value=values.includes(previous)?previous:(vehicleCare?'':'Vormittags');
  select.required=vehicleCare;
}
function pick(service){
  $('service_type').value=service;
  setAppointmentTimeOptions(service==='Fahrzeugpflege');
  $('vehicle_class').required=service==='Fahrzeugpflege';
  $('title').textContent=service;
  $('box').classList.remove('hidden');
  const isRenovation=service==='Renovierung & Reparaturen';
  $('serviceHint').textContent=isRenovation?'Beschreiben Sie Ihr Renovierungs- oder Reparaturvorhaben. Sie können Fotos hinzufügen. Wir prüfen Ihre Angaben und melden uns mit den nächsten Schritten.':service==='Gartenarbeiten'?'Bitte beschreiben Sie die Arbeiten sowie Schnitt- und Grünreste, die gegebenenfalls abtransportiert werden sollen.':service==='Foto & Drohnenfotografie'?'Bitte nennen Sie Objekt, Einsatzort und gewünschte Aufnahmen (Foto, Video oder beides).':'Bitte tragen Sie die gewünschten Angaben ein.';
  const needsVehicle=['Fahrzeugpflege','Ersatzteilanfrage','Reifenanfrage','Zubehörmontage'].includes(service);
  $('vehicleBlock').classList.toggle('hidden',!needsVehicle);
  $('vehicle_type').required=needsVehicle;$('make').required=needsVehicle;$('model').required=needsVehicle;
  $('care').classList.toggle('hidden',service!=='Fahrzeugpflege');
  $('parts').classList.toggle('hidden',service==='Fahrzeugpflege'||isRenovation);
  $('renovationBlock').classList.toggle('hidden',!isRenovation);
  $('renovation_type').required=isRenovation;
  $('appointmentBlock').classList.toggle('hidden',isRenovation);
  $('requested_date').required=!isRenovation;
  $('durationInfo').classList.toggle('hidden',isRenovation);
  if(!isRenovation)ensureDurationBox();
  window.scrollTo({top:$('box').offsetTop-20,behavior:'smooth'});
}
function resetService(){$('box').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'})}
async function loadBookedWindows(from,to){
  const {data,error}=await db.rpc('get_all_booked_windows',{p_from:from,p_to:to});
  if(error)throw new Error('Die Kalenderverfügbarkeit konnte nicht geprüft werden: '+error.message);
  return data||[];
}
function overlaps(date,time,windows,duration){
  const segments=buildVehicleSegments(date,time,duration.hours);
  const buffer=30*60*1000;
  return segments.some(segment=>windows.some(w=>
    new Date(w.booking_start)<new Date(segment.end.getTime()+buffer)&&
    new Date(w.booking_end)>new Date(segment.start.getTime()-buffer)
  ));
}
async function validateAvailability(){
  if($('service_type').value!=='Fahrzeugpflege')return true;
  const date=$('requested_date').value,time=$('requested_time').value;
  if(!date||!time)return true;
  try{
    const day=new Date(date+'T12:00:00').getDay();
    if(day===0||day===6){
      $('msg').textContent='Fahrzeugpflege-Termine sind nur von Montag bis Freitag möglich. Bitte wählen Sie einen Werktag.';
      $('msg').classList.remove('hidden');return false;
    }
    const duration=calculateDuration();
    const segments=buildVehicleSegments(date,time,duration.hours);
    const lastDate=formatLocalDate(segments[segments.length-1].end);
    const windows=await loadBookedWindows(date,lastDate);
    if(overlaps(date,time,windows,duration)){
      $('msg').textContent='Dieser Startzeitpunkt ist bereits belegt oder der 30-Minuten-Puffer wird unterschritten. Bitte wählen Sie eine andere Abgabezeit.';
      $('msg').classList.remove('hidden');return false;
    }
    $('msg').classList.add('hidden');return true;
  }catch(error){
    $('msg').textContent=error.message;$('msg').classList.remove('hidden');return false;
  }
}
function init(){const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);$('requested_date').min=formatLocalDate(tomorrow);document.querySelectorAll('input[name=care]').forEach(x=>x.addEventListener('change',()=>{ensureDurationBox();validateAvailability()}));['vehicle_type','vehicle_class','dirt_level','pet_hair'].forEach(id=>$(id).addEventListener('change',()=>{ensureDurationBox();validateAvailability()}));$('requested_time').addEventListener('change',()=>{ensureDurationBox();validateAvailability()});$('requested_date').addEventListener('change',()=>{ensureDurationBox();validateAvailability()});ensureDurationBox();$('form').addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;b.textContent='Wird gesendet …';const duration=calculateDuration();const requestId=crypto.randomUUID();let requestWasSaved=false;try{const selectedFiles=[...($('photos').files||[])];const allowedTypes=['image/jpeg','image/png','image/webp'];const invalidFile=selectedFiles.find(file=>!allowedTypes.includes(file.type)||file.size>8*1024*1024);if(invalidFile)throw new Error('Bitte nur JPG-, PNG- oder WebP-Bilder bis jeweils 8 MB hochladen.');if(!(await validateAvailability()))return;const userMessage=$('message').value;const d={id:requestId,service_type:$('service_type').value,status:'Neue Anfrage',first_name:$('first_name').value,last_name:$('last_name').value,phone:$('phone').value,email:$('email').value,vehicle_type:$('vehicle_type').value,vehicle_class:$('vehicle_class').value,make:$('make').value,model:$('model').value,color:$('color').value,year:$('year').value?Number($('year').value):null,plate:$('plate').value,care_options:[...document.querySelectorAll('input[name=care]:checked')].map(x=>x.value),dirt_level:$('dirt_level').value,pet_hair:$('pet_hair').value,details:$('service_type').value==='Renovierung & Reparaturen'?`Arbeit: ${$('renovation_type').value}; Objektart: ${$('renovation_object').value}; Bereich: ${$('renovation_area').value}; Umfang: ${$('renovation_size').value}; Beschreibung: ${$('renovation_description').value}`:$('details').value,quantity:Number($('quantity').value)||null,tire_type:$('tire_type').value,requested_date:$('service_type').value==='Renovierung & Reparaturen'?null:$('requested_date').value,requested_time:$('service_type').value==='Renovierung & Reparaturen'?'Anfrage – Termin nach Absprache':$('requested_time').value,message:userMessage,privacy_consent:$('privacy_consent').checked,duration_hours:duration.hours,duration_label:duration.label};const r=await db.from('requests').insert(d);if(r.error)throw r.error;requestWasSaved=true;for(const file of selectedFiles){const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`${requestId}/${crypto.randomUUID()}.${ext}`;const up=await db.storage.from('vehicle-photos').upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});if(up.error)throw up.error;const pr=await db.from('request_photos').insert({request_id:requestId,storage_path:path});if(pr.error)throw pr.error}let notificationWarning='';try{const notify=await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request:d})});if(!notify.ok){const responseText=await notify.text();console.warn('E-Mail-Benachrichtigung fehlgeschlagen:',notify.status,responseText);notificationWarning=` Die E-Mail-Benachrichtigung konnte nicht versendet werden (HTTP ${notify.status}).`;}}catch(notificationError){console.error('E-Mail-Benachrichtigung nicht erreichbar:',notificationError);notificationWarning=' Die E-Mail-Benachrichtigung konnte nicht bestätigt werden.';}$('msg').textContent=`Vielen Dank. Ihre Anfrage wurde gespeichert. Voraussichtliche Bearbeitungsdauer: ${duration.label}. Der Termin wird nach Prüfung bestätigt.${notificationWarning}${notificationWarning?' Bitte prüfe den Eingang im Adminbereich.':''}`;$('msg').classList.remove('hidden');e.target.reset();$('box').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'})}catch(err){$('msg').textContent=requestWasSaved?'Die Anfrage wurde bereits gespeichert, aber die weitere Verarbeitung war nicht vollständig erfolgreich: '+err.message:'Die Anfrage konnte nicht gesendet werden: '+err.message;$('msg').classList.remove('hidden')}finally{b.disabled=false;b.textContent='Anfrage absenden'}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
