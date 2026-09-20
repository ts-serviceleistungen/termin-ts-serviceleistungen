const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=x=>document.getElementById(x);
const FUNCTION_URL=`${SUPABASE_URL}/functions/v1/notify-new-request`;

function pick(s){
  $('service_type').value=s;
  $('title').textContent=s;
  $('box').classList.remove('hidden');
  $('care').classList.toggle('hidden',s!=='Fahrzeugpflege');
  $('parts').classList.toggle('hidden',s==='Fahrzeugpflege');
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
}

$('requested_date').min=new Date(Date.now()+86400000).toISOString().slice(0,10);

$('form').onsubmit=async e=>{
  e.preventDefault();
  const b=e.submitter;
  b.disabled=true;
  b.textContent='Wird gesendet …';

  const requestId=crypto.randomUUID();

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
    privacy_consent:$('privacy_consent').checked
  };

  try{
    // Wichtig: Kein .select() nach dem INSERT.
    // Dadurch benötigt der öffentliche Besucher keine SELECT-RLS-Berechtigung.
    const r=await db.from('requests').insert(d);
    if(r.error) throw r.error;

    const files=[...($('photos')?.files||[])];

    // Fotos im privaten Bucket speichern und mit der Anfrage verknüpfen.
    for(const file of files){
      const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
      const safeExt=/^[a-z0-9]+$/.test(ext)?ext:'jpg';
      const path=`${requestId}/${crypto.randomUUID()}.${safeExt}`;

      const upload=await db.storage
        .from('vehicle-photos')
        .upload(path,file,{contentType:file.type||'image/jpeg',upsert:false});

      if(upload.error) throw upload.error;

      const photo=await db.from('request_photos').insert({
        request_id:requestId,
        storage_path:path
      });

      if(photo.error) throw photo.error;
    }

    // E-Mail an T.S. Serviceleistungen.
    const notify=await fetch(FUNCTION_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({request:d})
    });

    if(!notify.ok){
      console.warn('E-Mail-Benachrichtigung konnte nicht gesendet werden:',await notify.text());
    }

    $('msg').textContent='Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns nach Prüfung bei Ihnen.';
    $('msg').classList.remove('hidden');
    e.target.reset();
  }catch(err){
    $('msg').textContent='Die Anfrage konnte nicht gesendet werden: '+err.message;
    $('msg').classList.remove('hidden');
  }

  b.disabled=false;
  b.textContent='Anfrage absenden';
};
