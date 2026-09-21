const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=x=>document.getElementById(x);
const FUNCTION_URL=`${SUPABASE_URL}/functions/v1/notify-new-request`;

const DURATION_HOURS={
  'Außenreinigung':2,
  'Innenraumreinigung':4,
  'Polsterreinigung':4,
  'Komplettaufbereitung':8,
  'Politur':8,
  'Lackversiegelung':8
};

function calculateDuration(){
  const service=$('service_type').value;
  if(service!=='Fahrzeugpflege') return {hours:2,label:'2 Stunden'};
  const options=[...document.querySelectorAll('input[name=care]:checked')].map(x=>x.value);
  let hours=options.reduce((sum,x)=>sum+(DURATION_HOURS[x]||0),0);
  if(!hours) hours=2;
  const days=Math.floor(hours/8), rest=hours%8;
  let label;
  if(rest===0) label=`${days} Arbeitstag${days===1?'':'e'}`;
  else if(hours===4) label='½ Arbeitstag';
  else label=`${hours} Stunden`;
  return {hours,label};
}

function ensureDurationBox(){
  const careBox=$('care');
  if(!careBox) return;

  let el=$('durationInfo');
  if(!el){
    el=document.createElement('div');
    el.id='durationInfo';
    el.className='notice';
    el.style.display='block';
    el.style.margin='15px 0';
    el.style.padding='12px';
    el.style.fontWeight='500';
    careBox.insertAdjacentElement('afterend',el);
  }

  const d=calculateDuration();
  el.innerHTML=
    `<b>Voraussichtliche Bearbeitungsdauer: ${d.label}</b><br>`+
    `Der Termin wird erst nach Prüfung und Bestätigung durch T.S. Serviceleistungen verbindlich.`;
}

async function loadBookedWindows(){
  const from=new Date();
  from.setDate(from.getDate()+1);
  const to=new Date(from);
  to.setDate(to.getDate()+90);
  const f=from.toISOString().slice(0,10), t=to.toISOString().slice(0,10);
  const {data,error}=await db.rpc('get_all_booked_windows',{p_from:f,p_to:t});
  if(error){console.warn('Verfügbarkeit konnte nicht geladen werden:',error.message);return []}
  return data||[];
}

function addBusinessDays(date,count){
  const d=new Date(date);
  while(count>0){
    d.setDate(d.getDate()+1);
    const day=d.getDay();
    if(day!==0 && day!==6) count--;
  }
  return d;
}

function makeDesiredBlocks(date,time,duration){
  const blocks=[];
  const base=new Date(`${date}T08:00:00`);
  if(duration.hours>=8){
    let remaining=duration.hours;
    let day=new Date(base);
    while(remaining>=8){
      while(day.getDay()===0||day.getDay()===6) day.setDate(day.getDate()+1);
      const start=new Date(day); start.setHours(8,0,0,0);
      const end=new Date(day); end.setHours(16,0,0,0);
      blocks.push([start,end]);
      remaining-=8;
      day=addBusinessDays(day,1);
    }
    if(remaining>0){
      while(day.getDay()===0||day.getDay()===6) day.setDate(day.getDate()+1);
      const start=new Date(day); start.setHours(8,0,0,0);
      const end=new Date(start.getTime()+remaining*3600000);
      blocks.push([start,end]);
    }
  }else if(duration.hours===4){
    const start=new Date(base);
    if(time==='13:00 – 15:00'||time==='15:00 – 17:00') start.setHours(13,0,0,0);
    const end=new Date(start.getTime()+4*3600000);
    blocks.push([start,end]);
  }else{
    const start=new Date(base);
    if(time.startsWith('10:00')) start.setHours(10,0,0,0);
    else if(time.startsWith('13:00')) start.setHours(13,0,0,0);
    else if(time.startsWith('15:00')) start.setHours(15,0,0,0);
    const end=new Date(start.getTime()+duration.hours*3600000);
    blocks.push([start,end]);
  }
  return blocks;
}

function overlapsDateOrSlot(date,time,windows,duration){
  const desired=makeDesiredBlocks(date,time,duration);
  return desired.some(([start,end])=>windows.some(w=>{
    const ws=new Date(w.booking_start), we=new Date(w.booking_end);
    return ws<end && we>start;
  }));
}

async function validateAvailability(){
  const date=$('requested_date').value;
  if(!date) return true;
  const duration=calculateDuration();
  const windows=await loadBookedWindows();
  if(overlapsDateOrSlot(date,$('requested_time').value,windows,duration)){
    $('msg').textContent='Der gewünschte Zeitraum ist bereits belegt. Bitte wählen Sie einen anderen Termin.';
    $('msg').classList.remove('hidden');
    return false;
  }
  return true;
}

function pick(s){
  $('service_type').value=s;
  $('title').textContent=s;
  $('box').classList.remove('hidden');
  $('care').classList.toggle('hidden',s!=='Fahrzeugpflege');
  $('parts').classList.toggle('hidden',s==='Fahrzeugpflege');
  ensureDurationBox();
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
}

function initApp(){
  $('requested_date').min=new Date(Date.now()+86400000).toISOString().slice(0,10);

  document.querySelectorAll('input[name=care]').forEach(x=>x.addEventListener('change',ensureDurationBox));
  $('requested_time').addEventListener('change',ensureDurationBox);
  $('requested_date').addEventListener('change',async()=>{ await validateAvailability(); });
  ensureDurationBox();

  $('form').onsubmit=async e=>{
  e.preventDefault();
  const b=e.submitter;
  b.disabled=true;
  b.textContent='Wird gesendet …';

  const requestId=crypto.randomUUID();
  const duration=calculateDuration();

  try{
    if(!(await validateAvailability())) return;

    const d={
      id:requestId,
      service_type:$('service_type').value,
      status:'Neue Anfrage',
      first_name:$('first_name').value,
      last_name:$('last_name').value,
      phone:$('phone').value,
      email:$('email').value,
      vehicle_type:$('vehicle_type').value,
      make:$('make').value,
      model:$('model').value,
      color:$('color').value,
      year:$('year').value?Number($('year').value):null,
      plate:$('plate').value,
      care_options:[...document.querySelectorAll('input[name=care]:checked')].map(x=>x.value),
      dirt_level:$('dirt_level').value,
      pet_hair:$('pet_hair').value,
      details:$('details').value,
      quantity:Number($('quantity').value)||null,
      tire_type:$('tire_type').value,
      requested_date:$('requested_date').value,
      requested_time:$('requested_time').value,
      message:$('message').value,
      privacy_consent:$('privacy_consent').checked,
      duration_hours:duration.hours,
      duration_label:duration.label
    };

    const r=await db.from('requests').insert(d);
    if(r.error) throw r.error;

    const files=[...($('photos')?.files||[])];
    for(const file of files){
      const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
      const safeExt=/^[a-z0-9]+$/.test(ext)?ext:'jpg';
      const path=`${requestId}/${crypto.randomUUID()}.${safeExt}`;
      const upload=await db.storage.from('vehicle-photos').upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});
      if(upload.error) throw upload.error;
      const photo=await db.from('request_photos').insert({request_id:requestId,storage_path:path});
      if(photo.error) throw photo.error;
    }

    const notify=await fetch(FUNCTION_URL,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request:d})
    });
    if(!notify.ok) console.warn('E-Mail-Benachrichtigung konnte nicht gesendet werden:',await notify.text());

    $('msg').textContent=`Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt. Voraussichtliche Bearbeitungsdauer: ${duration.label}. Der Termin wird nach Prüfung durch T.S. Serviceleistungen bestätigt.`;
    $('msg').classList.remove('hidden');
    e.target.reset();
    ensureDurationBox();
  }catch(err){
    $('msg').textContent='Die Anfrage konnte nicht gesendet werden: '+err.message;
    $('msg').classList.remove('hidden');
  }finally{
    b.disabled=false;
    b.textContent='Anfrage absenden';
  }
};
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded',initApp);
}else{
  initApp();
}
