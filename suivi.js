/* Safara Shuttle : suivi des pages trajets, vers le même tableau Google que la page d'accueil.
   Visite (une seule par session), parcours à la sortie, clics WhatsApp. Pas de cookie, pas d'adresse IP gardée.
   Rien n'est envoyé hors de safarashuttle.com (sauf ?log=1), ni pour les robots, ni avec ?notrack=1. */
(function(){
  var LOG='https://script.google.com/macros/s/AKfycbxuzFwxHQ-AX0AoyJDBjRI_ZrmDWsRnsY-phxdKLYuuHnbve23sYb88_1NnLqZVxf7f/exec';
  var ua=navigator.userAgent||'', q=location.search, mute=false;
  try{ if(/[?&]notrack=1\b/.test(q)) localStorage.setItem('safara-notrack','1');
    if(/[?&]track=1\b/.test(q)) localStorage.removeItem('safara-notrack'); mute=localStorage.getItem('safara-notrack')==='1'; }catch(e){}
  var on=!mute&&(/(^|\.)safarashuttle\.com$/.test(location.hostname)||/[?&]log=1\b/.test(q))
    &&!navigator.webdriver&&!/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|Claude\//i.test(ua);
  var page=document.body.getAttribute('data-page')||document.title;
  var TZ={'Africa/Casablanca':'Maroc','Africa/El_Aaiun':'Maroc','Europe/Paris':'France','Europe/Madrid':'Espagne','Atlantic/Canary':'Espagne','Africa/Ceuta':'Espagne',
    'Europe/London':'Royaume-Uni','Europe/Dublin':'Irlande','Europe/Brussels':'Belgique','Europe/Amsterdam':'Pays-Bas','Europe/Luxembourg':'Luxembourg','Europe/Berlin':'Allemagne',
    'Europe/Zurich':'Suisse','Europe/Vienna':'Autriche','Europe/Rome':'Italie','Europe/Lisbon':'Portugal','Europe/Stockholm':'Suède','Europe/Oslo':'Norvège','Europe/Copenhagen':'Danemark',
    'Europe/Helsinki':'Finlande','Europe/Warsaw':'Pologne','Europe/Prague':'Tchéquie','Europe/Budapest':'Hongrie','Europe/Bucharest':'Roumanie','Europe/Athens':'Grèce',
    'Europe/Istanbul':'Turquie','Europe/Moscow':'Russie','Europe/Kiev':'Ukraine','Europe/Kyiv':'Ukraine','Africa/Algiers':'Algérie','Africa/Tunis':'Tunisie','Africa/Cairo':'Égypte',
    'Africa/Dakar':'Sénégal','Africa/Abidjan':'Côte d’Ivoire','Africa/Lagos':'Nigeria','Africa/Johannesburg':'Afrique du Sud','Asia/Dubai':'Émirats arabes unis',
    'Asia/Riyadh':'Arabie saoudite','Asia/Qatar':'Qatar','Asia/Kuwait':'Koweït','Asia/Jerusalem':'Israël','Asia/Tokyo':'Japon','Asia/Shanghai':'Chine','Asia/Hong_Kong':'Hong Kong',
    'Asia/Seoul':'Corée du Sud','Asia/Singapore':'Singapour','Asia/Kolkata':'Inde','Asia/Calcutta':'Inde','Australia/Sydney':'Australie','Australia/Melbourne':'Australie',
    'America/New_York':'États-Unis','America/Chicago':'États-Unis','America/Denver':'États-Unis','America/Los_Angeles':'États-Unis','America/Phoenix':'États-Unis',
    'America/Toronto':'Canada','America/Montreal':'Canada','America/Vancouver':'Canada','America/Mexico_City':'Mexique','America/Sao_Paulo':'Brésil','America/Argentina/Buenos_Aires':'Argentine'};
  var tz=''; try{ tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''; }catch(e){}
  var country=TZ[tz]||(!tz||/^(UTC|GMT|Etc\/)/.test(tz)?'Inconnu':tz.split('/').pop().replace(/_/g,' ')+' ('+tz.split('/')[0]+')');
  var device=(/iPad|Tablet/i.test(ua)||(/Android/i.test(ua)&&!/Mobi/i.test(ua))||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))?'Tablette'
    :/Mobi|iPhone|Android/i.test(ua)?'Téléphone':'Ordinateur';
  var utm=((q.match(/[?&]utm_source=([^&#]+)/)||[])[1]||'').toLowerCase();
  var host=location.hostname.replace(/^www\./,''), ref='';
  try{ ref=document.referrer?new URL(document.referrer).hostname.replace(/^www\./,''):''; }catch(e){}
  var internal=ref===host; if(internal) ref='';
  var s=ref; try{ s=decodeURIComponent(utm)||ref; }catch(e){ s=utm||ref; }
  var KNOWN=[[/google_?maps|maps\.google|business\.google/,'Google Maps'],[/google/,'Google'],[/bing/,'Bing'],[/facebook|fb\.|^fb$/,'Facebook'],
    [/instagram/,'Instagram'],[/whatsapp|wa\.me/,'WhatsApp'],[/tiktok/,'TikTok'],[/youtube/,'YouTube'],[/tripadvisor/,'TripAdvisor'],[/chatgpt|openai/,'ChatGPT'],
    [/pinterest|pin\.it/,'Pinterest'],[/yahoo/,'Yahoo'],[/duckduckgo/,'DuckDuckGo'],[/linkedin/,'LinkedIn'],[/snapchat/,'Snapchat'],[/^t\.co$|twitter|^x\.com$/,'X (Twitter)']];
  var src='Direct'; for(var i=0;i<KNOWN.length;i++){ if(KNOWN[i][0].test(s)){ src=KNOWN[i][1]; break; } } if(s&&src==='Direct') src=s;
  // une seule visite par session : en passant d'une page du site à l'autre, on garde la source d'origine
  var first=''; try{ first=sessionStorage.getItem('safara-src')||''; }catch(e){}
  var newVisit=!(internal&&first); if(!newVisit) src=first;
  try{ if(newVisit) sessionStorage.setItem('safara-src',src); }catch(e){}
  var lang=(navigator.language||'').slice(0,5);

  function track(type,data){
    if(!on) return;
    var o={type:type,src:src,country:country,device:device,lang:lang,page:location.pathname};
    for(var k in data) o[k]=data[k];
    var body=JSON.stringify(o);
    try{ if(navigator.sendBeacon&&navigator.sendBeacon(LOG,new Blob([body],{type:'text/plain;charset=UTF-8'}))) return; }catch(e){}
    try{ fetch(LOG,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=UTF-8'},body:body}).catch(function(){}); }catch(e){}
  }
  var GEO=null;
  function geo(){ if(!on) return Promise.resolve(null);
    if(!GEO) GEO=fetch('https://get.geojs.io/v1/ip/geo.json',{cache:'no-store',credentials:'omit'}).then(function(r){return r.ok?r.json():null;}).then(function(g){
      if(!g) return null; var c=g.country||''; try{ if(g.country_code) c=new Intl.DisplayNames(['fr'],{type:'region'}).of(g.country_code)||c; }catch(e){}
      return {country:c,city:[g.city,g.region&&g.region!==g.city?g.region:''].filter(Boolean).join(', ')}; }).catch(function(){return null;});
    return GEO; }
  function withGeo(fn){ Promise.race([geo(),new Promise(function(r){setTimeout(function(){r(null);},1500);})]).then(function(g){ fn({country:(g&&g.country)||country,city:(g&&g.city)||''}); }); }

  if(newVisit) track('visit',{});
  var J={id:Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4),vis:0,since:document.visibilityState==='visible'?Date.now():0,book:false,wa:false};
  function journey(){ if(!on) return;
    if(J.since){ J.vis+=Date.now()-J.since; J.since=document.visibilityState==='visible'?Date.now():0; }
    track('journey',{id:J.id,dur:Math.round(J.vis/1000),seen:'Page : '+page,form:J.book?'Clic « Réserver » (suite sur l’accueil)':'Pas ouvert',wa:J.wa?'Oui':'Non'}); }
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') journey(); else J.since=Date.now(); });
  window.addEventListener('pagehide',journey);
  document.addEventListener('pointerdown',function(e){ if(e.target.closest&&e.target.closest('a[href*="wa.me/"]')) geo(); },true);
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a'); if(!a) return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('wa.me/')>-1){ J.wa=true; var lbl=a.getAttribute('data-wa')||'Lien WhatsApp'; withGeo(function(g){ g.btn=lbl+' · '+page; track('wa',g); }); return; }
    if(/[?&]reserver=1/.test(href)) J.book=true;
  },true);
})();
