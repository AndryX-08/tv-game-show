// GAME RULES
const TC=[
  {hex:'#3498DB',light:'rgba(52,152,219,.22)'},
  {hex:'#E74C3C',light:'rgba(231,76,60,.22)'},
  {hex:'#2ECC71',light:'rgba(46,204,113,.22)'},
  {hex:'#9B59B6',light:'rgba(155,89,182,.22)'},
  {hex:'#F5C518',light:'rgba(245,197,24,.22)'},
];

let players=[],teams=[],nPid=1,nTid=1;
let selPid=null,selP1=null,selP2=null,selWheelPid=null,selChainP1=null,selChainP2=null,selTabooPid=null;
let intesaWinner=null;
let intesaPlayers={p1:null,p2:null};
let globalLeaderboard=[];
let registeredUsers=[];
let currentUserProfile=null;
let pendingGameInvite=null;
let pendingPlayModeGame=null,selectedPlayMode='local';
let activeGameSessionId=null,activeGameSessionGame=null,unsubscribeGameSession=null,applyingRemoteWheelState=false,applyingRemoteSessionState=false;
let unsubscribeLeaderboard=null,unsubscribeRegisteredUsers=null,unsubscribeCurrentUserProfile=null,unsubscribeGameInvites=null;
let tabooScoreEventsRef=null,tabooScoreEventsStartedAt=Date.now(),processedTabooScoreEvents=new Set();
let auaAudio=null,auaErrorAudio=null,auaAutoStartListener=null,auaAutoStarted=false,auaThemeResumeTime=0;
let rdfAudio=null,rdfAutoStartListener=null,rdfAutoStarted=false;
let ttsVoices=[];
let ttsVoiceURI=localStorage.getItem('tvgn-tts-voice')||'';
let ttsRate=parseFloat(localStorage.getItem('tvgn-tts-rate'))||.9;

const AUA_Q=[
{q:"Di che colore è il cielo sereno?",a:["Verde","Blu"],wrong:"Verde"},
{q:"Quanti giorni ha una settimana?",a:["7","10"],wrong:"10"},
{q:"Quale animale dice 'bau'?",a:["Gatto","Cane"],wrong:"Gatto"},
{q:"Quanto fa 2+2?",a:["4","5"],wrong:"5"},
{q:"Quale stagione viene dopo l’inverno?",a:["Autunno","Primavera"],wrong:"Autunno"},
{q:"Qual è il contrario di freddo?",a:["Caldo","Ghiaccio"],wrong:"Ghiaccio"},
{q:"Quale pianeta è noto come pianeta rosso?",a:["Venere","Marte"],wrong:"Venere"},
{q:"Qual è il risultato di 10×10?",a:["100","110"],wrong:"110"},
{q:"Quale organo pompa il sangue?",a:["Fegato","Cuore"],wrong:"Fegato"},
{q:"Quale animale vive nel mare?",a:["Pesce","Mucca"],wrong:"Mucca"},
{q:"Qual è lo sport più praticato al mondo?",a:["Tennis","Calcio"],wrong:"Tennis"},
{q:"Qual è il simbolo dell’acqua?",a:["H2O","O2"],wrong:"O2"},
{q:"Quale colore si ottiene mescolando rosso e blu?",a:["Verde","Viola"],wrong:"Verde"},
{q:"Quale strumento misura il tempo?",a:["Orologio","Righello"],wrong:"Righello"},
{q:"Qual è il risultato di 5 per 5?",a:["20","25"],wrong:"20"},
{q:"Quale animale è il re della savana?",a:["Leone","Elefante"],wrong:"Elefante"},
{q:"Quanti minuti ci sono in un’ora?",a:["100","60"],wrong:"100"},
{q:"Qual è il contrario di notte?",a:["Giorno","Sera"],wrong:"Sera"},
{q:"Quale materia studia i numeri?",a:["Storia","Matematica"],wrong:"Storia"},
{q:"Quale è un linguaggio di programmazione?",a:["Python","Serpente"],wrong:"Serpente"},
{q:"Quale frutto è giallo e lungo?",a:["Mela","Banana"],wrong:"Mela"},
{q:"Quale animale fa 'miao'?",a:["Gatto","Cane"],wrong:"Cane"},
{q:"Quanto fa 3*3?",a:["6","7"],wrong:"6"},
{q:"Qual è il contrario di grande?",a:["Piccolo","Alto"],wrong:"Alto"},
{q:"Quale pianeta è più vicino al Sole?",a:["Marte","Mercurio"],wrong:"Marte"},
{q:"Quale sport usa la racchetta?",a:["Tennis","Calcio"],wrong:"Calcio"},
{q:"Qual è il simbolo dell’oro?",a:["Ag","Au"],wrong:"Ag"},
{q:"Quanti lati ha un quadrato?",a:["4","3"],wrong:"3"},
{q:"Quale organo usiamo per vedere?",a:["Naso","Occhi"],wrong:"Naso"},
{q:"Quale animale vola?",a:["Uccello","Pesce"],wrong:"Pesce"},
{q:"Qual è il risultato di 12+8?",a:["18","20"],wrong:"18"},
{q:"Quale è un colore primario?",a:["Rosso","Rosa"],wrong:"Rosa"},
{q:"Quale mese viene dopo gennaio?",a:["Marzo","Febbraio"],wrong:"Marzo"},
{q:"Quale animale è domestico?",a:["Cane","Lupo"],wrong:"Lupo"},
{q:"Quanto fa 9-3?",a:["5","6"],wrong:"5"},
{q:"Quale materia studia il passato?",a:["Storia","Fisica"],wrong:"Fisica"},
{q:"Quale strumento musicale ha i tasti bianchi e neri?",a:["Chitarra","Pianoforte"],wrong:"Chitarra"},
{q:"Qual è il contrario di alto?",a:["Basso","Lungo"],wrong:"Lungo"},
{q:"Quale pianeta ha gli anelli?",a:["Venere","Saturno"],wrong:"Venere"},
{q:"Quale animale è più veloce sulla terra?",a:["Ghepardo","Tartaruga"],wrong:"Tartaruga"},
{q:"Quanto fa 6 per 6?",a:["30","36"],wrong:"30"},
{q:"Quale è un metallo?",a:["Ferro","Legno"],wrong:"Legno"},
{q:"Quale animale vive nella fattoria?",a:["Squalo","Mucca"],wrong:"Squalo"},
{q:"Quale è il contrario di acceso?",a:["Spento","Caldo"],wrong:"Caldo"},
{q:"Quale materia studia la natura?",a:["Italiano","Scienze"],wrong:"Italiano"},
{q:"Quale sport si gioca con il pallone ovale?",a:["Rugby","Basket"],wrong:"Basket"},
// {q:"Quale bevi con gusto?",a:["Sborra","Succo di frutta"],wrong:"Succo di frutta"},
{q:"E' giusto dire che in Italia non si guida a sinistra?",a:["Sì","No"],wrong:"Sì"},
{q:"E' giusto dire che Boni è gay?",a:["Sì","No"],wrong:"No"},
{q:"Solo Marzo ha 28 giorni",a:["Vero","Falso"],wrong:"Vero"},
];

const ERE_WORDS=[
{clue:"Qual è la capitale dell’Italia?",word:"ROMA"},
{clue:"Qual è il fiume più lungo d’Italia?",word:"PO"},
{clue:"Chi ha dipinto la Cappella Sistina?",word:"MICHELANGELO"},
{clue:"In che continente si trova l’Egitto?",word:"AFRICA"},
{clue:"Qual è il pianeta più grande del sistema solare?",word:"GIOVE"},
{clue:"Chi ha scritto I Promessi Sposi?",word:"MANZONI"},
{clue:"Qual è la capitale della Francia?",word:"PARIGI"},
{clue:"Quanti continenti ci sono?",word:"SETTE"},
{clue:"Qual è il simbolo chimico dell’acqua?",word:"H2O"},
{clue:"Chi ha scoperto l’America?",word:"COLOMBO"},
{clue:"Qual è la capitale della Spagna?",word:"MADRID"},
{clue:"Qual è il mare tra Italia e Grecia?",word:"IONIO"},
{clue:"Chi ha scritto la Divina Commedia?",word:"DANTE"},
{clue:"Qual è il pianeta rosso?",word:"MARTE"},
{clue:"Qual è il monte più alto del mondo?",word:"EVEREST"},
{clue:"In che anno è caduto l’Impero romano d’Occidente?",word:"476"},
{clue:"Qual è la capitale del Regno Unito?",word:"LONDRA"},
{clue:"Qual è l’organo principale della respirazione?",word:"POLMONI"},
{clue:"Qual è il simbolo dell’oro?",word:"AU"},
{clue:"Chi ha dipinto la Gioconda?",word:"LEONARDO"},
{clue:"Qual è la capitale della Germania?",word:"BERLINO"},
{clue:"Qual è il lago più grande d’Italia?",word:"GARDA"},
{clue:"Qual è il pianeta più vicino al Sole?",word:"MERCURIO"},
{clue:"Chi ha scritto Pinocchio?",word:"COLLODI"},
{clue:"Qual è la capitale del Giappone?",word:"TOKYO"},
{clue:"Qual è la lingua ufficiale del Brasile?",word:"PORTOGHESE"},
{clue:"Qual è il mare più grande del mondo?",word:"PACIFICO"},
{clue:"Qual è il simbolo del ferro?",word:"FE"},
{clue:"Chi ha inventato la lampadina?",word:"EDISON"},
{clue:"Qual è la capitale della Russia?",word:"MOSCA"},
{clue:"Qual è il fiume che attraversa Roma?",word:"TEVERE"},
{clue:"Qual è la capitale della Cina?",word:"PECHINO"},
{clue:"Quanti giorni ha un anno bisestile?",word:"366"},
{clue:"Chi ha scritto Harry Potter?",word:"ROWLING"},
{clue:"Qual è il pianeta con gli anelli?",word:"SATURNO"},
{clue:"Qual è la capitale dell’Australia?",word:"CANBERRA"},
{clue:"Qual è il mare più salato?",word:"MORTO"},
{clue:"Qual è il simbolo del sodio?",word:"NA"},
{clue:"Chi ha dipinto L’Ultima Cena?",word:"LEONARDO"},
{clue:"Qual è la capitale del Canada?",word:"OTTAWA"},
{clue:"Qual è il monte più alto d’Italia?",word:"MONTE BIANCO"},
{clue:"Qual è il gas che respiriamo di più?",word:"AZOTO"},
{clue:"Chi ha scritto La Traviata?",word:"VERDI"},
{clue:"Qual è la capitale dell’India?",word:"NUOVA DELHI"},
{clue:"Qual è il pianeta più piccolo del sistema solare?",word:"MERCURIO"},
{clue:"Qual è il mare tra Italia e Africa?",word:"MEDITERRANEO"},
{clue:"Qual è la capitale del Messico?",word:"CITTA DEL MESSICO"},
{clue:"Qual è il simbolo del carbonio?",word:"C"},
{clue:"Chi ha dipinto La Nascita di Venere?",word:"BOTTICELLI"},
{clue:"Qual è la capitale della Grecia?",word:"ATENE"}
];

const WHEEL_PHRASES=[
  {cat:"Tempo libero",text:"FESTA DI COMPLEANNO"},
  {cat:"Proverbio",text:"CHI DORME NON PIGLIA PESCI"},
  {cat:"Tempo libero",text:"GITA IN MONTAGNA"},
  {cat:"Cinema",text:"LA GRANDE BELLEZZA"},
  {cat:"Cucina",text:"SPAGHETTI AL POMODORO"},
  {cat:"Modo di dire",text:"NON E TUTTO ORO QUEL CHE LUCCICA"},
  {cat:"Modo di dire",text:"ACQUA IN BOCCA"},
  {cat:"Viaggi",text:"UN BIGLIETTO PER PARIGI"},
  {cat:"Sport",text:"GOL ALL ULTIMO MINUTO"},
  {cat:"Musica",text:"SOTTO IL CIELO DI ROMA"},
  {cat:"Tecnologia",text:"SMARTPHONE DI ULTIMA GENERAZIONE"},
  {cat:"Sport",text:"LA PARTITA DELLA DOMENICA"},
  {cat:"Cinema",text:"RITORNO AL FUTURO"},
  {cat:"Oggetto",text:"TELECOMANDO SUL DIVANO"},
  {cat:"Estate",text:"GELATO ALLA STRACCIATELLA"},
  {cat:"Sport",text:"FINALE DI CHAMPIONS LEAGUE"},
  {cat:"Casa",text:"CHIAVI NEL CASSETTO"},
  {cat:"Cinema",text:"AVATAR"},
  {cat:"Cinema",text:"IL RE LEONE"},
  {cat:"TV",text:"APPLAUSI IN STUDIO"},
  {cat:"Modo di dire",text:"L ERBA DEL VICINO E SEMPRE PIU VERDE"},
  {cat:"Tempo libero",text:"VACANZA AL MARE"},
  {cat:"Fortuna",text:"COLPO DI SCENA FINALE"},
  {cat:"Tecnologia",text:"INTELLIGENZA ARTIFICIALE"},
  {cat:"Modo di dire",text:"IL TEMPO E DENARO"},
  {cat:"Tecnologia",text:"RETE WIFI INSTABILE"},
];

const CHAIN_ROUNDS=[
  {start:"CASA",words:["RIPOSO","MATTUTINO","BUONGIORNO","SERALE"]},
  {start:"MARE",words:["ONDA","RADIO","FREQUENZA","MUSICA"]},
  {start:"SOLE",words:["LUNA","PIENA","NOTTE","STELLATA"]},
  {start:"LIBRO",words:["PAGINA","BIANCA","NEVE","MONTAGNA"]},
  {start:"TEMPO",words:["ORO","ANELLO","DITO","INDICE"]},
  {start:"CUORE",words:["BATTITO","MANI","APPLAUSO","PUBBLICO"]},
  {start:"STRADA",words:["VIAGGIO","VALIGIA","AEREO","PORTO"]},
  {start:"SCUOLA",words:["BANCO","POSTA","LETTERA","ALFABETO"]},
  {start:"FUOCO",words:["FIAMMA","OLIMPICA","GIOCHI","SQUADRA"]},
  {start:"FESTA",words:["TORTA","CANDELA","LUCE","STELLA"]}
];

const WHEEL_SEGMENTS=[
  {label:"100",points:100},
  {label:"200",points:200},
  {label:"400",points:400},
  {label:"800",points:800},
  {label:"500",points:500},
  {label:"PASSA",points:0,pass:true},
  {label:"300",points:300},
  {label:"1000",points:1000},
  {label:"BANK",points:0,bankrupt:true},
  {label:"400",points:400},
  {label:"800",points:800},
  {label:"JOLLY",points:1200}
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function refreshTtsVoices(){
  if(!('speechSynthesis' in window))return;
  ttsVoices=window.speechSynthesis.getVoices();
  renderTtsVoiceOptions();
}
refreshTtsVoices();
if('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged=refreshTtsVoices;
}
function scoreTtsVoice(voice){
  const name=voice.name.toLowerCase();
  const lang=(voice.lang||'').toLowerCase();
  let score=0;
  if(lang==='it-it')score+=80;
  else if(lang.startsWith('it'))score+=60;
  if(/premium|enhanced|neural|natural|google|microsoft|alice|elsa|isabella|silvia|paolo|luca/.test(name))score+=25;
  if(!voice.localService)score+=8;
  if(/compact/.test(name))score-=20;
  return score;
}
function getItalianVoice(){
  const chosen=ttsVoices.find(v=>v.voiceURI===ttsVoiceURI);
  if(chosen)return chosen;
  return [...ttsVoices]
    .filter(v=>(v.lang&&v.lang.toLowerCase().startsWith('it'))||/ital/i.test(v.name))
    .sort((a,b)=>scoreTtsVoice(b)-scoreTtsVoice(a))[0]||null;
}
function renderTtsVoiceOptions(){
  const sel=document.getElementById('tts-voice');
  if(!sel)return;
  const italianVoices=ttsVoices
    .filter(v=>(v.lang&&v.lang.toLowerCase().startsWith('it'))||/ital/i.test(v.name))
    .sort((a,b)=>scoreTtsVoice(b)-scoreTtsVoice(a));
  sel.innerHTML='';
  const autoOpt=document.createElement('option');
  autoOpt.value='';
  autoOpt.textContent='Automatica';
  sel.appendChild(autoOpt);
  italianVoices.forEach(v=>{
    const opt=document.createElement('option');
    opt.value=v.voiceURI;
    opt.textContent=`${v.name} (${v.lang})`;
    opt.selected=v.voiceURI===ttsVoiceURI;
    sel.appendChild(opt);
  });
}
function setTtsVoice(uri){
  ttsVoiceURI=uri;
  localStorage.setItem('tvgn-tts-voice',uri);
  stopQuestionSpeech();
}
function setTtsRate(value){
  ttsRate=parseFloat(value)||.9;
  localStorage.setItem('tvgn-tts-rate',ttsRate);
  const val=document.getElementById('tts-rate-val');
  if(val)val.textContent=ttsRate.toFixed(2)+'x';
}
function stopQuestionSpeech(){
  if(!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
}
function speakQuestion(text){
  if(!('speechSynthesis' in window)||!text)return;
  stopQuestionSpeech();
  const msg=new SpeechSynthesisUtterance(text);
  msg.lang='it-IT';
  msg.rate=ttsRate;
  msg.pitch=.92;
  msg.volume=1;
  const voice=getItalianVoice();
  if(voice)msg.voice=voice;
  window.speechSynthesis.speak(msg);
}

function goTo(id){
  if(id!=='s-aua'&&id!=='s-eredita')stopQuestionSpeech();
  if(id!=='s-pick-wheel'&&id!=='s-wheel')stopRdfAudio();
  if(id!=='s-chain')clearChainTimer();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='s-setup')initTtsControls();
}
function initials(n){return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[ch]));
}
function getTimer(g){return parseInt(document.getElementById('timer-'+g).value)||30}
function getTabooTimer(){return parseInt(document.getElementById('timer-taboo')?.value)||60}
function initTtsControls(){
  const rate=document.getElementById('tts-rate');
  if(rate)rate.value=ttsRate;
  setTtsRate(ttsRate);
  renderTtsVoiceOptions();
}

function setAuaAudio(){
  if(!auaAudio){auaAudio=document.getElementById('aua-audio');}
}
function setAuaErrorAudio(){
  if(!auaErrorAudio){auaErrorAudio=document.getElementById('aua-error-audio');}
}
function showAuaIntroEffects(){
  const el=document.getElementById('aua-intro-effects');
  if(el){el.classList.add('active');}
}
function hideAuaIntroEffects(){
  const el=document.getElementById('aua-intro-effects');
  if(el){el.classList.remove('active');}
}
function showWheelIntroEffects(){
  const el=document.getElementById('wheel-intro-effects');
  if(el){el.classList.add('active');}
}
function hideWheelIntroEffects(){
  const el=document.getElementById('wheel-intro-effects');
  if(el){el.classList.remove('active');}
}
function clearAuaAutoStart(){
  if(auaAudio && auaAutoStartListener){
    auaAudio.removeEventListener('timeupdate',auaAutoStartListener);
    auaAutoStartListener=null;
  }
}
function playAuaErrorSound(){
  setAuaAudio();
  setAuaErrorAudio();
  if(!auaErrorAudio) return;
  if(auaAudio && !auaAudio.paused){
    auaThemeResumeTime = auaAudio.currentTime;
    auaAudio.pause();
  }
  auaErrorAudio.currentTime = 0;
  auaErrorAudio.play().catch(()=>{});
  auaErrorAudio.onended = () => {
    if(auaAudio){
      auaAudio.currentTime = auaThemeResumeTime;
      auaAudio.play().catch(()=>{});
    }
  };
}
function startAuaIntro(){
  setAuaAudio();
  if(!auaAudio) return;
  clearAuaAutoStart();
  showAuaIntroEffects();
  auaAutoStarted=false;
  auaAudio.currentTime=0;
  auaAudio.play().catch(()=>{});
  auaAutoStartListener=function(){
    if(auaAutoStarted) return;
    if(auaAudio.currentTime>=14){
      auaAutoStarted=true;
      clearAuaAutoStart();
      if(!selPid){
        selPid=players.length?players[0].id:null;
        if(selPid){
          document.getElementById('pp1-'+selPid)?.classList.add('selected');
          document.getElementById('btn-pick-go').disabled=false;
        }
      }
      if(selPid){
        beginAUA();
      }
    }
  };
  auaAudio.addEventListener('timeupdate',auaAutoStartListener);
}
function stopAuaAudio(){
  setAuaAudio();
  setAuaErrorAudio();
  if(!auaAudio) return;
  clearAuaAutoStart();
  auaAudio.pause();
  auaAudio.currentTime=0;
  if(auaErrorAudio){
    auaErrorAudio.pause();
    auaErrorAudio.currentTime = 0;
  }
}
function setRdfAudio(){
  if(!rdfAudio){rdfAudio=document.getElementById('rdf-audio');}
}
function clearRdfAutoStart(){
  if(rdfAudio&&rdfAutoStartListener){
    rdfAudio.removeEventListener('timeupdate',rdfAutoStartListener);
    rdfAutoStartListener=null;
  }
}
function startRdfAudioAuto(){
  setRdfAudio();
  if(!rdfAudio)return;
  clearRdfAutoStart();
  showWheelIntroEffects();
  rdfAutoStarted=false;
  rdfAudio.currentTime=0;
  rdfAudio.play().catch(()=>{});
  rdfAutoStartListener=function(){
    if(rdfAutoStarted)return;
    if(rdfAudio.currentTime>=12){
      rdfAutoStarted=true;
      clearRdfAutoStart();
      if(!selWheelPid&&players.length){
        selWheelPid=players[0].id;
        document.getElementById('pp-wheel-'+selWheelPid)?.classList.add('selected');
      }
      beginWheel();
    }
  };
  rdfAudio.addEventListener('timeupdate',rdfAutoStartListener);
}
function stopRdfAudio(){
  setRdfAudio();
  hideWheelIntroEffects();
  if(!rdfAudio)return;
  clearRdfAutoStart();
  rdfAudio.pause();
  rdfAudio.currentTime=0;
}

async function beginIntesa(options={}){
  if(!selP1||!selP2||selP1===selP2) return;
  if(options.sessionId)listenGameSession(options.sessionId);
  intesaPlayers={p1:selP1,p2:selP2};
  const p1=players.find(p=>p.id===selP1);
  const p2=players.find(p=>p.id===selP2);
  if(!p1||!p2) return;
  if(!options.fromInvite&&selectedPlayMode==='online'){
    const sessionId=await createGameSession('intesa',{
      p1Uid:p1.uid||null,
      p2Uid:p2.uid||null,
      p1Name:p1.name,
      p2Name:p2.name,
      status:'scoring'
    });
    sendGameInvites('intesa',{p1Uid:p1.uid||null,p2Uid:p2.uid||null,sessionId});
  }
  document.getElementById('intesa-p1-input').innerHTML=`<span style="flex:1;font-weight:800">${p1.name}</span><input class="tf" id="intesa-p1-score" type="number" min="0" value="0" style="width:80px">`;
  document.getElementById('intesa-p2-input').innerHTML=`<span style="flex:1;font-weight:800">${p2.name}</span><input class="tf" id="intesa-p2-score" type="number" min="0" value="0" style="width:80px">`;
  window.open('https://www.ed0.it/games/intesavincente/','_blank');
  goTo('s-intesa-score');
}

function saveIntesaScores(){
  const v1=parseInt(document.getElementById('intesa-p1-score')?.value)||0;
  const v2=parseInt(document.getElementById('intesa-p2-score')?.value)||0;
  awardPlayerPoints(intesaPlayers.p1,v1,'intesa');
  awardPlayerPoints(intesaPlayers.p2,v2,'intesa');
  intesaPlayers={p1:null,p2:null};
  renderPlayers();
  renderTeamSection();
  renderHomeLeaderboard();
  cleanupOnlineGameArtifacts();
  
  goTo('s-hero');
}

/* ── PLAYER/TEAM MANAGEMENT ── */
function addPlayer(){
  const inp=document.getElementById('inp-player');
  const name=inp.value.trim();
  if(!name||players.find(p=>p.name.toLowerCase()===name.toLowerCase()))return;
  players.push({id:nPid++,name,teamId:null,score:0,ci:players.length%TC.length,uid:null});
  inp.value='';inp.focus();
  renderPlayers();renderTeamSection();
}
function addRegisteredPlayer(){
  const select=document.getElementById('registered-player-select');
  const uid=select?.value;
  if(!uid)return;
  const user=registeredUsers.find(u=>u.uid===uid||u.id===uid);
  if(!user||players.some(p=>p.uid===uid))return;
  players.push({
    id:nPid++,
    name:user.name||`Anonimo ${uid.slice(0,4).toUpperCase()}`,
    teamId:null,
    score:0,
    ci:players.length%TC.length,
    uid,
    isAnonymous:!!user.isAnonymous,
    photoURL:user.photoURL||null
  });
  select.value='';
  renderPlayers();
  renderTeamSection();
  renderRegisteredUserSelect();
}
function removePlayer(id){
  players=players.filter(p=>p.id!==id);
  teams.forEach(t=>{t.mids=t.mids.filter(m=>m!==id)});
  renderPlayers();renderTeamSection();renderRegisteredUserSelect();
}
function renderPlayers(){
  const el=document.getElementById('list-players');
  if(!players.length){el.innerHTML='<div class="empty">Nessun giocatore ancora</div>';renderHomeLeaderboard();return;}
  el.innerHTML=players.map(p=>{
    const t=teams.find(t=>t.mids.includes(p.id));
    const c=TC[p.ci%TC.length];
    const tag=t?`<span class="chip-tag" style="background:${t.color.light};color:${t.color.hex}">${escapeHtml(t.name)}</span>`:'';
    const onlineTag=p.uid?`<span class="chip-tag" style="background:rgba(46,204,113,.14);color:#2ECC71">Firestore</span>`:'';
    return `<div class="chip"><div class="chip-left">
      <div class="avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
      <span class="chip-name">${escapeHtml(p.name)}</span>${onlineTag}${tag}
    </div><button class="btn-rm" onclick="removePlayer(${p.id})">✕</button></div>`;
  }).join('');
  renderHomeLeaderboard();
}
function renderRegisteredUserSelect(){
  const select=document.getElementById('registered-player-select');
  if(!select)return;
  const available=registeredUsers
    .filter(u=>!players.some(p=>p.uid===(u.uid||u.id)))
    .sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  if(!currentUser){
    select.innerHTML='<option value="">Accedi per caricare profili</option>';
    return;
  }
  if(!available.length){
    select.innerHTML='<option value="">Nessun altro profilo disponibile</option>';
    return;
  }
  select.innerHTML='<option value="">Aggiungi giocatore registrato...</option>'+
    available.map(u=>`<option value="${escapeHtml(u.uid||u.id)}">${escapeHtml(u.name||'Anonimo')}${u.isAnonymous?' (anonimo)':''}</option>`).join('');
}
function addTeam(){
  const inp=document.getElementById('inp-team');if(!inp)return;
  const name=inp.value.trim()||`Squadra ${teams.length+1}`;
  teams.push({id:nTid++,name,color:TC[teams.length%TC.length],mids:[],score:0});
  inp.value='';renderTeamSection();renderPlayers();
}
function removeTeam(id){teams=teams.filter(t=>t.id!==id);renderTeamSection();renderPlayers();}
function assignPlayer(pid,tidStr){
  const tid=parseInt(tidStr);
  teams.forEach(t=>{t.mids=t.mids.filter(id=>id!==pid)});
  if(tid){const t=teams.find(t=>t.id===tid);if(t)t.mids.push(pid);}
  renderTeamSection();renderPlayers();
}
function renderTeamSection(){
  const el=document.getElementById('team-section');
  if(players.length<2){el.innerHTML='<div class="empty">Aggiungi almeno 2 giocatori</div>';return;}
  const addRow=teams.length<5?`<div class="field-row" style="margin-bottom:.7rem">
    <input class="tf" id="inp-team" placeholder="Nome squadra..." maxlength="18" onkeydown="if(event.key==='Enter')addTeam()">
    <button class="btn-add" onclick="addTeam()">＋</button></div>`:'';
  const tHtml=teams.map(t=>`<div class="chip" style="margin-bottom:.35rem;border-left:3px solid ${t.color.hex};border-radius:0 9px 9px 0">
    <div class="chip-left"><span class="chip-name" style="color:${t.color.hex}">${t.name}</span>
    <span style="font-size:.72rem;color:var(--mut);margin-left:.4rem">${players.filter(p=>t.mids.includes(p.id)).map(m=>m.name).join(', ')||'(vuota)'}</span></div>
    <button class="btn-rm" onclick="removeTeam(${t.id})">✕</button></div>`).join('');
  const assignHtml=teams.length?`<div style="margin-top:.8rem;font-size:.68rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-bottom:.5rem">Assegna</div>
    ${players.map(p=>{const cur=teams.find(t=>t.mids.includes(p.id));
    return `<div class="field-row" style="margin-bottom:.35rem">
      <span style="flex:1;font-size:.86rem;font-weight:800;display:flex;align-items:center">${p.name}</span>
      <select class="tf" style="flex:1" onchange="assignPlayer(${p.id},this.value)">
        <option value="">— Libero —</option>
        ${teams.map(t=>`<option value="${t.id}"${cur&&cur.id===t.id?' selected':''}>${t.name}</option>`).join('')}
      </select></div>`;}).join('')}`:'';
  el.innerHTML=addRow+tHtml+assignHtml;
  renderHomeLeaderboard();
}

function renderHomeLeaderboard(){
  const el=document.getElementById('home-leaderboard');
  if(!el){return;}
  const sortedPlayers=[...players].sort((a,b)=>b.score-a.score).slice(0,3);
  const sortedTeams=[...teams].sort((a,b)=>b.score-a.score).slice(0,3);
  if(!sortedPlayers.length&&!sortedTeams.length&&!globalLeaderboard.length){el.innerHTML='';return;}
  let html='<div style="font-size:.78rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-bottom:.8rem">Classifica punti</div>';
  if(sortedPlayers.length){
    html+='<div style="margin-bottom:.85rem"><strong style="display:block;margin-bottom:.35rem;color:#fff">Giocatori</strong>';
    html+=sortedPlayers.map((p,i)=>`<div class="sc-row">
      <div class="sc-rank">${i+1}</div>
      <div class="sc-name">${escapeHtml(p.name)}</div>
      <div class="sc-pts">${p.score}</div>
    </div>`).join('');
    html+='</div>';
  }
  if(globalLeaderboard.length){
    html+='<div style="margin-bottom:.85rem"><strong style="display:block;margin-bottom:.35rem;color:#fff">Online</strong>';
    html+=globalLeaderboard.map((u,i)=>`<div class="sc-row">
      <div class="sc-rank">${i+1}</div>
      <div class="sc-name">${escapeHtml(u.name)}${u.isAnonymous?' <span style="font-size:.68rem;color:var(--mut)">(anonimo)</span>':''}</div>
      <div class="sc-pts">${u.totalScore||0}</div>
    </div>`).join('');
    html+='</div>';
  }
  if(sortedTeams.length){
    html+='<div><strong style="display:block;margin-bottom:.35rem;color:#fff">Squadre</strong>';
    html+=sortedTeams.map((t,i)=>`<div class="sc-row">
      <div class="sc-rank">${i+1}</div>
      <div class="sc-name">${escapeHtml(t.name)}</div>
      <div class="sc-pts">${t.score}</div>
    </div>`).join('');
    html+='</div>';
  }
  el.innerHTML=html;
  
}

function awardPlayerPoints(pid,points=1,source='game',scoreTeam=true){
  const value=Number(points)||0;
  if(!pid||!value)return;
  const p=players.find(pl=>pl.id===pid);
  if(!p)return;
  p.score+=value;
  const t=scoreTeam?teams.find(tm=>tm.mids.includes(pid)):null;
  if(t)t.score+=value;
  savePlayerScoreOnline(p,value,source);
}

function getUserDisplayName(user){
  if(!user)return 'Anonimo';
  if(user.displayName)return user.displayName;
  if(user.email)return user.email.split('@')[0];
  return user.uid?`Anonimo ${user.uid.slice(0,4).toUpperCase()}`:'Anonimo';
}

function getProfileDisplayName(profile={},user=currentUser){
  if(profile.nickname)return profile.nickname.startsWith('@')?profile.nickname:`@${profile.nickname}`;
  const fullName=[profile.firstName,profile.lastName].filter(Boolean).join(' ').trim();
  return fullName||profile.name||getUserDisplayName(user);
}

function addCurrentUserAsPlayer(user=currentUser){
  if(!user)return;
  const name=getUserDisplayName(user);
  const existing=players.find(p=>p.uid===user.uid);
  if(existing){
    existing.name=name;
    existing.isAnonymous=!!user.isAnonymous;
    existing.photoURL=user.photoURL||null;
    renderPlayers();
    renderTeamSection();
    renderRegisteredUserSelect();
    return;
  }
  players.push({
    id:nPid++,
    name,
    teamId:null,
    score:0,
    ci:players.length%TC.length,
    uid:user.uid,
    isAnonymous:!!user.isAnonymous,
    photoURL:user.photoURL||null
  });
  renderPlayers();
  renderTeamSection();
  renderRegisteredUserSelect();
}

function savePlayerScoreOnline(player,points,source='game'){
  if(!player?.uid||!currentUser||!window.db)return;
  const value=Number(points)||0;
  if(!value)return;
  const now=firebase.firestore.FieldValue.serverTimestamp();
  const inc=firebase.firestore.FieldValue.increment(value);
  const userData={
    name:player.name||'Anonimo',
    isAnonymous:!!player.isAnonymous,
    photoURL:player.photoURL||null,
    updatedAt:now
  };
  const targetUid=player.uid;
  const eventRef=db.collection('scoreEvents').doc();
  const batch=db.batch();
  batch.set(db.collection('users').doc(targetUid),{
    ...userData,
    totalScore:inc
  },{merge:true});
  batch.set(db.collection('leaderboard').doc(targetUid),{
    ...userData,
    totalScore:inc
  },{merge:true});
  batch.set(eventRef,{
    uid:targetUid,
    name:userData.name,
    points:value,
    source,
    writtenBy:currentUser.uid,
    createdAt:now
  });
  batch.commit().catch(err=>console.error('Errore salvataggio punti Firestore:',err));
}

function saveUserIfNew(user){
  if(!user||!window.db)return Promise.resolve();
  const now=firebase.firestore.FieldValue.serverTimestamp();
  const authName=getUserDisplayName(user);
  const freshData={
    name:authName,
    firstName:'',
    lastName:'',
    nickname:'',
    isAnonymous:user.isAnonymous,
    photoURL:user.photoURL||null,
    updatedAt:now
  };
  const existingData={
    isAnonymous:user.isAnonymous,
    photoURL:user.photoURL||null,
    updatedAt:now
  };
  const userRef=db.collection('users').doc(user.uid);
  const leaderboardRef=db.collection('leaderboard').doc(user.uid);
  return userRef.get().then(doc=>{
    const base=doc.exists?existingData:{...freshData,createdAt:now,totalScore:0};
    return userRef.set(base,{merge:true});
  }).then(()=>leaderboardRef.get()).then(doc=>{
    const base=doc.exists?existingData:{...freshData,totalScore:0};
    return leaderboardRef.set(base,{merge:true});
  }).catch(err=>console.error('Errore salvataggio utente Firestore:',err));
}

function loadLeaderboard(){
  if(!window.db)return;
  if(unsubscribeLeaderboard)unsubscribeLeaderboard();
  unsubscribeLeaderboard=db.collection('leaderboard')
    .orderBy('totalScore','desc')
    .limit(10)
    .onSnapshot(snapshot=>{
      globalLeaderboard=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
      renderHomeLeaderboard();
    },err=>console.error('Errore classifica Firestore:',err));
}

function loadRegisteredUsers(){
  if(!window.db)return;
  if(unsubscribeRegisteredUsers)unsubscribeRegisteredUsers();
  unsubscribeRegisteredUsers=db.collection('users')
    .limit(100)
    .onSnapshot(snapshot=>{
      registeredUsers=snapshot.docs.map(doc=>({id:doc.id,uid:doc.id,...doc.data()}));
      renderRegisteredUserSelect();
    },err=>{
      console.error('Errore profili registrati Firestore:',err);
      renderRegisteredUserSelect();
    });
}

function listenCurrentUserProfile(user){
  if(unsubscribeCurrentUserProfile)unsubscribeCurrentUserProfile();
  currentUserProfile=null;
  if(!user||!window.db){
    updateUserUI(user);
    return;
  }
  unsubscribeCurrentUserProfile=db.collection('users').doc(user.uid).onSnapshot(doc=>{
    currentUserProfile=doc.exists?{id:doc.id,...doc.data()}:null;
    const displayName=getProfileDisplayName(currentUserProfile||{},user);
    const player=players.find(p=>p.uid===user.uid);
    if(player){
      player.name=displayName;
      renderPlayers();
      renderTeamSection();
    }
    updateUserUI(user);
    hydrateProfilePopup();
  },err=>console.error('Errore profilo utente Firestore:',err));
}

function openProfilePopup(){
  if(!currentUser)return;
  hydrateProfilePopup();
  const overlay=document.getElementById('profileOverlay');
  if(overlay)overlay.classList.remove('hidden');
}

function closeProfilePopup(){
  document.getElementById('profileOverlay')?.classList.add('hidden');
}

function hydrateProfilePopup(){
  const profile=currentUserProfile||{};
  const firstName=document.getElementById('profileFirstName');
  const lastName=document.getElementById('profileLastName');
  const nickname=document.getElementById('profileNickname');
  const totalScore=document.getElementById('profileTotalScore');
  if(firstName)firstName.value=profile.firstName||'';
  if(lastName)lastName.value=profile.lastName||'';
  if(nickname)nickname.value=profile.nickname||'';
  if(totalScore)totalScore.textContent=profile.totalScore||0;
}

function normalizeNickname(value){
  const raw=String(value||'').trim().replace(/^@+/,'');
  if(!raw)return '';
  return '@'+raw.replace(/\s+/g,'').slice(0,23);
}

function saveProfilePopup(){
  if(!currentUser||!window.db)return;
  const firstName=document.getElementById('profileFirstName')?.value.trim()||'';
  const lastName=document.getElementById('profileLastName')?.value.trim()||'';
  const nickname=normalizeNickname(document.getElementById('profileNickname')?.value);
  const displayName=getProfileDisplayName({firstName,lastName,nickname,name:getUserDisplayName(currentUser)},currentUser);
  const data={
    firstName,
    lastName,
    nickname,
    name:displayName,
    isAnonymous:currentUser.isAnonymous,
    photoURL:currentUser.photoURL||null,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  const batch=db.batch();
  batch.set(db.collection('users').doc(currentUser.uid),data,{merge:true});
  batch.set(db.collection('leaderboard').doc(currentUser.uid),data,{merge:true});
  batch.commit().then(()=>{
    return currentUser.updateProfile?currentUser.updateProfile({displayName}):null;
  }).catch(err=>console.error('Errore salvataggio profilo:',err)).finally(closeProfilePopup);
}

const GAME_LABELS={
  ruota:'la RUOTA',
  eredita:"L'EREDITA",
  intesa:"INTESA VINCENTE",
  catena:'REAZIONE A CATENA'
};

const MULTIPLAYER_GAMES=['ruota','eredita','intesa','catena'];

function isMultiplayerGame(game){
  return MULTIPLAYER_GAMES.includes(game);
}

function showPlayModePopup(game){
  pendingPlayModeGame=game;
  const text=document.getElementById('playModeText');
  const label=GAME_LABELS[game]||game;
  if(text)text.textContent=`Vuoi giocare ${label} in locale o online?`;
  document.getElementById('playModeOverlay')?.classList.remove('hidden');
}

function closePlayModePopup(){
  document.getElementById('playModeOverlay')?.classList.add('hidden');
}

function choosePlayMode(mode){
  selectedPlayMode=mode==='online'?'online':'local';
  const game=pendingPlayModeGame;
  pendingPlayModeGame=null;
  closePlayModePopup();
  if(!game)return;
  if(selectedPlayMode==='online'){
    const onlinePlayers=getOnlineParticipants();
    if(!currentUser||onlinePlayers.length<2){
      alert('Per giocare online servono almeno due giocatori registrati aggiunti alla configurazione.');
      goTo('s-setup');
      return;
    }
  }
  startGame(game,{skipModeChoice:true});
}

async function loadQuestionBank(key,fallback){
  if(selectedPlayMode!=='online'||!window.db)return fallback;
  try{
    const doc=await db.collection('questionBanks').doc(key).get();
    const data=doc.exists?doc.data():null;
    return Array.isArray(data?.items)&&data.items.length?data.items:fallback;
  }catch(err){
    console.error(`Errore caricamento questionBanks/${key}:`,err);
    return fallback;
  }
}

async function seedQuestionBanksToFirestore(){
  if(!window.db)return;
  const now=firebase.firestore.FieldValue.serverTimestamp();
  const banks={
    aua:AUA_Q,
    eredita:ERE_WORDS,
    ruota:WHEEL_PHRASES,
    catena:CHAIN_ROUNDS
  };
  const batch=db.batch();
  Object.entries(banks).forEach(([key,items])=>{
    batch.set(db.collection('questionBanks').doc(key),{
      items,
      updatedAt:now
    },{merge:true});
  });
  return batch.commit();
}

function getCurrentUserName(){
  return getProfileDisplayName(currentUserProfile||{},currentUser);
}

function getOnlineParticipants(){
  return players
    .filter(p=>p.uid)
    .map(p=>({
      uid:p.uid,
      name:p.name,
      isAnonymous:!!p.isAnonymous,
      photoURL:p.photoURL||null
    }));
}

async function sendGameInvites(game,payload={}){
  if(selectedPlayMode!=='online'||!currentUser||!window.db)return;
  const participants=getOnlineParticipants();
  const targets=participants.filter(p=>p.uid!==currentUser.uid);
  if(!targets.length)return;
  const now=firebase.firestore.FieldValue.serverTimestamp();
  const batch=db.batch();
  targets.forEach(target=>{
    const ref=db.collection('users').doc(target.uid).collection('gameInvites').doc();
    batch.set(ref,{
      game,
      status:'pending',
      fromUid:currentUser.uid,
      fromName:getCurrentUserName(),
      toUid:target.uid,
      toName:target.name,
      participants,
      payload,
      createdAt:now,
      updatedAt:now
    });
  });
  return batch.commit().catch(err=>console.error('Errore invio inviti gioco:',err));
}

function listenGameInvites(user){
  if(unsubscribeGameInvites)unsubscribeGameInvites();
  if(!user||!window.db)return;
  unsubscribeGameInvites=db.collection('users').doc(user.uid).collection('gameInvites')
    .where('status','==','pending')
    .onSnapshot(snapshot=>{
      snapshot.docChanges().forEach(change=>{
        if(change.type!=='added')return;
        pendingGameInvite={id:change.doc.id,_ref:change.doc.ref,...change.doc.data()};
        showGameInvitePopup(pendingGameInvite);
      });
    },err=>console.error('Errore inviti gioco:',err));
}

function showGameInvitePopup(invite){
  const text=document.getElementById('gameInviteText');
  const overlay=document.getElementById('gameInviteOverlay');
  if(text){
    const label=GAME_LABELS[invite.game]||invite.game||'un gioco';
    text.textContent=`${invite.fromName||'Un giocatore'} ti ha invitato a giocare ${label}. Vuoi partecipare?`;
  }
  if(overlay)overlay.classList.remove('hidden');
}

function closeGameInvitePopup(){
  document.getElementById('gameInviteOverlay')?.classList.add('hidden');
}

function declineGameInvite(){
  if(pendingGameInvite?._ref){
    pendingGameInvite._ref.update({
      status:'declined',
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err=>console.error('Errore rifiuto invito:',err));
  }
  pendingGameInvite=null;
  closeGameInvitePopup();
}

function acceptGameInvite(){
  if(!pendingGameInvite||!window.db)return;
  const invite=pendingGameInvite;
  invite._ref?.update({
    status:'accepted',
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err=>console.error('Errore accettazione invito:',err));
  pendingGameInvite=null;
  selectedPlayMode='online';
  closeGameInvitePopup();
  joinInvitedGame(invite);
}

function ensureInviteParticipants(invite){
  (invite.participants||[]).forEach(participant=>{
    if(players.some(p=>p.uid===participant.uid))return;
    players.push({
      id:nPid++,
      name:participant.name||`Anonimo ${participant.uid.slice(0,4).toUpperCase()}`,
      teamId:null,
      score:0,
      ci:players.length%TC.length,
      uid:participant.uid,
      isAnonymous:!!participant.isAnonymous,
      photoURL:participant.photoURL||null
    });
  });
  renderPlayers();
  renderTeamSection();
  renderRegisteredUserSelect();
}

function getPlayerIdByUid(uid){
  return players.find(p=>p.uid===uid)?.id||null;
}

function stopGameSessionListener(){
  if(unsubscribeGameSession)unsubscribeGameSession();
  unsubscribeGameSession=null;
  activeGameSessionId=null;
  activeGameSessionGame=null;
}

async function createGameSession(game,state={}){
  if(selectedPlayMode!=='online'||!currentUser||!window.db)return null;
  const ref=await db.collection('gameSessions').add({
    game,
    state,
    createdBy:currentUser.uid,
    updatedBy:currentUser.uid,
    createdAt:firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  });
  activeGameSessionId=ref.id;
  activeGameSessionGame=game;
  return ref.id;
}

function updateGameSession(state){
  if(!activeGameSessionId||!currentUser||!window.db||applyingRemoteWheelState||applyingRemoteSessionState)return;
  db.collection('gameSessions').doc(activeGameSessionId).set({
    state,
    updatedBy:currentUser.uid,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true}).catch(err=>console.error('Errore sync sessione gioco:',err));
}

function listenGameSession(sessionId){
  if(!sessionId||!window.db)return;
  if(unsubscribeGameSession)unsubscribeGameSession();
  activeGameSessionId=sessionId;
  unsubscribeGameSession=db.collection('gameSessions').doc(sessionId).onSnapshot(doc=>{
    if(!doc.exists)return;
    const data=doc.data();
    if(data.updatedBy&&data.updatedBy===currentUser?.uid)return;
    activeGameSessionGame=data.game||activeGameSessionGame;
    if(data.game==='ruota'&&data.state)applyRemoteWheelState(data.state);
    if(data.game==='catena'&&data.state)applyRemoteChainState(data.state);
    if(data.game==='eredita'&&data.state)applyRemoteEreditaState(data.state);
  },err=>console.error('Errore ascolto sessione gioco:',err));
}

async function cleanupOnlineGameArtifacts(){
  if(!activeGameSessionId||!window.db)return;
  const sessionId=activeGameSessionId;
  const participantUids=[
    ...new Set([
      ...getOnlineParticipants().map(p=>p.uid),
      currentUser?.uid
    ].filter(Boolean))
  ];
  try{
    const batch=db.batch();
    batch.delete(db.collection('gameSessions').doc(sessionId));
    for(const uid of participantUids){
      const snap=await db.collection('users').doc(uid).collection('gameInvites')
        .where('payload.sessionId','==',sessionId)
        .get();
      snap.docs.forEach(doc=>batch.delete(doc.ref));
    }
    await batch.commit();
  }catch(err){
    console.error('Errore pulizia sessione online:',err);
  }finally{
    stopGameSessionListener();
  }
}

function joinInvitedGame(invite){
  ensureInviteParticipants(invite);
  const payload=invite.payload||{};
  if(invite.game==='ruota'){
    const starterId=getPlayerIdByUid(payload.starterUid)||players[0]?.id;
    if(starterId){
      selWheelPid=starterId;
      beginWheel({
        fromInvite:true,
        phrase:payload.phrase,
        category:payload.category,
        participantUids:payload.participantUids,
        sessionId:payload.sessionId
      });
    }
    return;
  }
  if(invite.game==='eredita'){
    if(payload.sessionId)listenGameSession(payload.sessionId);
    selP1=getPlayerIdByUid(payload.p1Uid);
    selP2=getPlayerIdByUid(payload.p2Uid);
    if(selP1&&selP2&&selP1!==selP2)beginEredita({fromInvite:true,words:payload.words,revOrders:payload.revOrders,sessionId:payload.sessionId});
    else startGame('eredita');
    return;
  }
  if(invite.game==='intesa'){
    if(payload.sessionId)listenGameSession(payload.sessionId);
    selP1=getPlayerIdByUid(payload.p1Uid);
    selP2=getPlayerIdByUid(payload.p2Uid);
    if(selP1&&selP2&&selP1!==selP2)beginIntesa({fromInvite:true,sessionId:payload.sessionId});
    else startGame('intesa');
    return;
  }
  if(invite.game==='catena'){
    if(payload.sessionId)listenGameSession(payload.sessionId);
    selChainP1=getPlayerIdByUid(payload.p1Uid);
    selChainP2=getPlayerIdByUid(payload.p2Uid);
    if(selChainP1&&selChainP2&&selChainP1!==selChainP2)beginChain({fromInvite:true,round:payload.round,sessionId:payload.sessionId});
    else startGame('catena');
  }
}

/* ── GAME START ── */
function startGame(game,options={}){
  if(!players.length){goTo('s-setup');return;}
  if(isMultiplayerGame(game)&&!options.skipModeChoice){
    showPlayModePopup(game);
    return;
  }
  if(['eredita','intesa','ruota','catena'].includes(game)&&players.length<2){
    stopAuaAudio();
    stopRdfAudio();
    goTo('s-setup');
    return;
  }
  if(game==='catena'){
    if(players.length<2){goTo('s-setup');return;}
    stopAuaAudio();
    selChainP1=null;selChainP2=null;
    ['p1','p2'].forEach(slot=>{
      document.getElementById('pick-grid-chain-'+slot).innerHTML=players.map(p=>{
        const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
        return `<div class="player-pick" id="pp-chain-${slot}-${p.id}" onclick="selPickChain('${slot}',${p.id})" style="margin-bottom:.5rem">
          <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
          <div class="pp-name">${p.name}</div>
          <div class="pp-info">${t?t.name:'Libero'} · ${p.score}pt</div></div>`;
      }).join('');
    });
    document.getElementById('btn-pick-chain-go').disabled=true;
    document.getElementById('btn-pick-chain-go').onclick=()=>beginChain();
    goTo('s-pick-chain');
    return;
  }
  if(game==='ruota'){
    stopAuaAudio();
    selWheelPid=null;
    document.getElementById('pick-grid-wheel').innerHTML=players.map(p=>{
      const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
      return `<div class="player-pick" id="pp-wheel-${p.id}" onclick="selPickWheel(${p.id})">
        <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
        <div class="pp-name">${p.name}</div>
        <div class="pp-info">${t?t.name:'Libero'} · ${p.score}pt</div></div>`;
    }).join('');
    startRdfAudioAuto();
    goTo('s-pick-wheel');
    return;
  }
  if(game==='intesa'){
    selP1=null;selP2=null;
    ['p1','p2'].forEach(slot=>{
      document.getElementById('pick-grid-'+slot).innerHTML=players.map(p=>{
        const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
        return `<div class="player-pick" id="pp2-${slot}-${p.id}" onclick="selPick2('${slot}',${p.id})" style="margin-bottom:.5rem">
          <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
          <div class="pp-name">${p.name}</div>
          <div class="pp-info">${t?t.name:'Libero'}</div></div>`;
      }).join('');
    });
    document.getElementById('btn-pick2-go').disabled=true;
    document.getElementById('btn-pick2-go').textContent='APRI GIOCO ›';
    document.getElementById('btn-pick2-go').onclick=()=>beginIntesa();
    goTo('s-pick2');
    return;
  }
  if(game==='taboo'){
    selPid=null;
    document.getElementById('pick-grid-taboo').innerHTML=players.map(p=>{
      const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
      return `<div class="player-pick" id="pp-taboo-${p.id}" onclick="selPickTaboo(${p.id})">
        <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
        <div class="pp-name">${p.name}</div>
        <div class="pp-info">${t?t.name:'Libero'} · ${p.score}pt</div></div>`;
    }).join('');
    document.getElementById('btn-pick-taboo-go').disabled=true;
    document.getElementById('btn-pick-taboo-go').onclick=()=>beginTaboo();
    goTo('s-pick-taboo');
    return;
  }
  if(game==='aua'){
    selPid=null;
    document.getElementById('pick-grid').innerHTML=players.map(p=>{
      const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
      return `<div class="player-pick" id="pp1-${p.id}" onclick="selPick1(${p.id})">
        <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
        <div class="pp-name">${p.name}</div>
        <div class="pp-info">${t?t.name:'Libero'} · ${p.score}pt</div></div>`;
    }).join('');
    document.getElementById('btn-pick-go').disabled=true;
    document.getElementById('btn-pick-go').onclick=()=>beginAUA();
    startAuaIntro();
    goTo('s-pick');
  } else {
    selP1=null;selP2=null;
    ['p1','p2'].forEach(slot=>{
      document.getElementById('pick-grid-'+slot).innerHTML=players.map(p=>{
        const c=TC[p.ci%TC.length];const t=teams.find(t=>t.mids.includes(p.id));
        return `<div class="player-pick" id="pp2-${slot}-${p.id}" onclick="selPick2('${slot}',${p.id})" style="margin-bottom:.5rem">
          <div class="pp-avatar" style="background:${c.light};color:${c.hex}">${initials(p.name)}</div>
          <div class="pp-name">${p.name}</div>
          <div class="pp-info">${t?t.name:'Libero'}</div></div>`;
      }).join('');
    });
    document.getElementById('btn-pick2-go').disabled=true;
    document.getElementById('btn-pick2-go').textContent='INIZIA LA SFIDA ›';
    document.getElementById('btn-pick2-go').onclick=()=>beginEredita();
    goTo('s-pick2');
  }
}
function selPick1(id){
  selPid=id;
  document.querySelectorAll('#pick-grid .player-pick').forEach(e=>e.classList.remove('selected'));
  document.getElementById('pp1-'+id)?.classList.add('selected');
  document.getElementById('btn-pick-go').disabled=false;
}
function selPickTaboo(id){
  selTabooPid=id;
  document.querySelectorAll('#pick-grid-taboo .player-pick').forEach(e=>e.classList.remove('selected'));
  document.getElementById('pp-taboo-'+id)?.classList.add('selected');
  document.getElementById('btn-pick-taboo-go').disabled=false;
}
function selPick2(slot,id){
  if(slot==='p1')selP1=id;else selP2=id;
  document.querySelectorAll(`#pick-grid-${slot} .player-pick`).forEach(e=>e.classList.remove('selected'));
  document.getElementById(`pp2-${slot}-${id}`)?.classList.add('selected');
  document.getElementById('btn-pick2-go').disabled=!(selP1&&selP2&&selP1!==selP2);
}

function selPickChain(slot,id){
  if(slot==='p1')selChainP1=id;else selChainP2=id;
  document.querySelectorAll(`#pick-grid-chain-${slot} .player-pick`).forEach(e=>e.classList.remove('selected'));
  document.getElementById(`pp-chain-${slot}-${id}`)?.classList.add('selected');
  document.getElementById('btn-pick-chain-go').disabled=!(selChainP1&&selChainP2&&selChainP1!==selChainP2);
}

/* ══════════════════════════════
   REAZIONE A CATENA
══════════════════════════════ */
let chainState={};let chainInt=null;

function clearChainTimer(){
  clearInterval(chainInt);
  chainInt=null;
}

function normalizeChainWord(text){
  return (text||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^A-Z0-9]/gi,'')
    .toUpperCase();
}

async function beginChain(options={}){
  if(!selChainP1||!selChainP2||selChainP1===selChainP2)return;
  clearChainTimer();
  if(options.sessionId)listenGameSession(options.sessionId);
  const p1=players.find(p=>p.id===selChainP1);
  const p2=players.find(p=>p.id===selChainP2);
  if(!p1||!p2)return;
  const rounds=await loadQuestionBank('catena',CHAIN_ROUNDS);
  const round=options.round||rounds[Math.floor(Math.random()*rounds.length)];
  chainState={
    pids:[selChainP1,selChainP2],
    puids:[p1.uid||null,p2.uid||null],
    start:round.start,
    words:round.words,
    idx:0,
    max:getTimer('chain'),
    left:getTimer('chain'),
    revealed:round.words.map(()=>0),
    solved:round.words.map(()=>false),
    blocked:false
  };
  if(!options.fromInvite&&selectedPlayMode==='online'){
    const sessionId=await createGameSession('catena',serializeChainState());
    if(sessionId)listenGameSession(sessionId);
    sendGameInvites('catena',{p1Uid:p1.uid||null,p2Uid:p2.uid||null,round,sessionId});
  }
  document.getElementById('chain-pair').textContent=`${p1.name} + ${p2.name}`;
  document.getElementById('chain-start-word').textContent=round.start;
  renderChainPlayers();
  renderChainRows();
  setChainMessage('Partite dalla parola data e trovate il primo collegamento.');
  goTo('s-chain');
  startChainTimer();
  syncChainState();
}

function serializeChainState(){
  if(!chainState?.words)return null;
  return {
    puids:chainState.puids||chainState.pids?.map(pid=>players.find(p=>p.id===pid)?.uid||null)||[],
    names:(chainState.pids||[]).map(pid=>players.find(p=>p.id===pid)?.name||'Giocatore'),
    start:chainState.start,
    words:chainState.words,
    idx:chainState.idx||0,
    max:chainState.max,
    left:chainState.left,
    revealed:chainState.revealed||[],
    solved:chainState.solved||[],
    blocked:!!chainState.blocked,
    message:document.getElementById('chain-message')?.textContent||''
  };
}

function syncChainState(){
  const state=serializeChainState();
  if(state)updateGameSession(state);
}

function applyRemoteChainState(state){
  if(!state)return;
  applyingRemoteSessionState=true;
  chainState={
    pids:(state.puids||[]).map((uid,i)=>getPlayerIdByUid(uid)||players[i]?.id||i+1),
    puids:state.puids||[],
    start:state.start,
    words:state.words||[],
    idx:state.idx||0,
    max:state.max||getTimer('chain'),
    left:state.left||0,
    revealed:state.revealed||[],
    solved:state.solved||[],
    blocked:!!state.blocked
  };
  clearChainTimer();
  document.getElementById('chain-pair').textContent=(state.names||[]).join(' + ');
  document.getElementById('chain-start-word').textContent=state.start||'';
  renderChainPlayers();
  renderChainRows();
  updateChainTimer();
  setChainMessage(state.message||'Partita online aggiornata.');
  goTo('s-chain');
  applyingRemoteSessionState=false;
  if(canControlChainOnline()&&!chainState.blocked&&chainState.idx<chainState.words.length)startChainTimer();
}

function canControlChainOnline(){
  if(selectedPlayMode!=='online'||!activeGameSessionId)return true;
  const uid=chainState.puids?.[0]||currentUser?.uid;
  return !uid||uid===currentUser?.uid;
}

function beginTaboo(){
  if(!selTabooPid)return;
  const p=players.find(p=>p.id===selTabooPid);
  if(!p)return;
  const seconds=getTabooTimer();
  const now=Date.now();
  database.ref('currentGameState').set({
    mode:'taboo',
    status:'ready',
    wordIndex:-1,
    word:'',
    taboo:[],
    currentPlayer:p.name,
    currentPlayerId:p.id,
    currentPlayerUid:p.uid||null,
    timerSeconds:seconds,
    startedAt:0,
    endsAt:0,
    score:0,
    updatedAt:now
  }).catch(err=>console.error('Errore avvio Taboo:',err));
  window.open('host.html', '_blank');
}

function listenTabooScoreEvents(){
  if(!database||tabooScoreEventsRef)return;
  tabooScoreEventsRef=database.ref('tabooScoreEvents');
  tabooScoreEventsRef.on('child_added',snap=>{
    const id=snap.key;
    if(processedTabooScoreEvents.has(id))return;
    const ev=snap.val()||{};
    if((ev.createdAt||0)<tabooScoreEventsStartedAt)return;
    processedTabooScoreEvents.add(id);
    const points=Number(ev.points)||0;
    if(!points||!ev.playerId)return;
    awardPlayerPoints(Number(ev.playerId),points,'taboo');
    renderPlayers();
    renderTeamSection();
    renderHomeLeaderboard();
    snap.ref.remove().catch(err=>console.error('Errore pulizia evento Taboo:',err));
  });
}

function getChainTeamIds(){
  return [...new Set(chainState.pids.map(pid=>{
    const t=teams.find(tm=>tm.mids.includes(pid));
    return t?t.id:null;
  }).filter(Boolean))];
}

function addChainPairPoints(points){
  chainState.pids.forEach(pid=>{
    awardPlayerPoints(pid,points,'reazione-a-catena',false);
  });
  getChainTeamIds().forEach(tid=>{
    const t=teams.find(tm=>tm.id===tid);
    if(t)t.score+=points;
  });
}

function renderChainPlayers(){
  const el=document.getElementById('chain-players');
  if(!el)return;
  el.innerHTML=chainState.pids.map(pid=>{
    const p=players.find(pl=>pl.id===pid);
    const c=TC[(p?.ci||0)%TC.length];
    return `<div class="chain-player">
      <div class="chain-player-name" style="color:${c.hex}">${p?p.name:'—'}</div>
      <div class="chain-player-score">${p?p.score:0}</div>
    </div>`;
  }).join('');
}

function renderChainRows(){
  const cs=chainState;
  const rows=document.getElementById('chain-rows');
  if(!rows)return;
  rows.innerHTML=cs.words.map((word,i)=>{
    const isActive=i===cs.idx&&!cs.solved[i];
    const val=cs.solved[i]?word:'';
    const disabled=!isActive;
    return `<div class="chain-row">
      <div class="chain-num">${i+1}</div>
      <input class="tf chain-input${cs.solved[i]?' done':isActive?' active':' locked'}" id="chain-input-${i}"
        value="${val}" ${disabled?'disabled':''} placeholder="${isActive?'Scrivi la parola...':'—'}"
        onkeydown="if(event.key==='Enter')submitChainWord()">
    </div>`;
  }).join('');
  document.getElementById('chain-step-label').textContent=`Parola ${Math.min(cs.idx+1,cs.words.length)} / ${cs.words.length}`;
  renderChainHint();
  setTimeout(()=>document.getElementById(`chain-input-${cs.idx}`)?.focus(),0);
}

function renderChainHint(){
  const cs=chainState;
  const el=document.getElementById('chain-hint');
  if(!el)return;
  const word=cs.words[cs.idx]||'';
  const shown=cs.revealed[cs.idx]||0;
  if(!word||cs.solved[cs.idx]){
    el.textContent='';
    return;
  }
  if(!shown){
    el.textContent='Nessun aiuto sbloccato';
    return;
  }
  el.textContent='Aiuto: '+word.split('').map((ch,i)=>i<shown?ch:'_').join(' ');
}

function setChainMessage(text,color='var(--txt)'){
  const el=document.getElementById('chain-message');
  if(!el)return;
  el.textContent=text;
  el.style.color=color;
}

function startChainTimer(){
  clearChainTimer();
  if(!canControlChainOnline())return;
  chainState.left=chainState.max;
  updateChainTimer();
  chainInt=setInterval(()=>{
    if(chainState.blocked)return;
    chainState.left--;
    updateChainTimer();
    syncChainState();
    if(chainState.left<=0){
      missChainWord(true);
    }
  },1000);
}

function updateChainTimer(){
  const cs=chainState;
  const pct=Math.max(0,Math.round(cs.left/cs.max*100));
  const col=cs.left<=5?'#E74C3C':cs.left<=10?'#F5C518':'#2ECC71';
  const bar=document.getElementById('chain-tbar');
  const time=document.getElementById('chain-time');
  if(bar){bar.style.width=pct+'%';bar.style.background=col;}
  if(time){time.textContent=cs.left;time.style.color=col;}
}

function submitChainWord(){
  const cs=chainState;
  if(!canControlChainOnline())return;
  if(cs.blocked||cs.idx>=cs.words.length)return;
  const input=document.getElementById(`chain-input-${cs.idx}`);
  const guess=normalizeChainWord(input?.value);
  const answer=normalizeChainWord(cs.words[cs.idx]);
  if(!guess){
    setChainMessage('Scrivete una parola prima di confermare.', '#F5C518');
    return;
  }
  if(guess!==answer){
    missChainWord(false);
    return;
  }
  cs.solved[cs.idx]=true;
  clearChainTimer();
  setChainMessage(`Giusto: ${cs.words[cs.idx]}!`, '#2ECC71');
  cs.idx++;
  renderChainRows();
  syncChainState();
  if(cs.idx>=cs.words.length){
    completeChain();
    return;
  }
  setTimeout(()=>{
    setChainMessage('Collegate la parola appena trovata alla prossima.');
    startChainTimer();
  },450);
}

function missChainWord(fromTimer=false){
  const cs=chainState;
  if(!canControlChainOnline())return;
  if(cs.blocked||cs.idx>=cs.words.length)return;
  clearChainTimer();
  addChainPairPoints(-2);
  const word=cs.words[cs.idx];
  cs.revealed[cs.idx]=Math.min(word.length,(cs.revealed[cs.idx]||0)+1);
  renderChainPlayers();
  renderHomeLeaderboard();
  renderChainHint();
  syncChainState();
  const input=document.getElementById(`chain-input-${cs.idx}`);
  if(input){
    input.value='';
    input.focus();
  }
  const prefix=fromTimer?'Tempo scaduto.':'Parola sbagliata.';
  if(cs.revealed[cs.idx]>=word.length){
    setChainMessage(`${prefix} Parola svelata: ${word}. Si passa avanti. -2 punti.`, '#E74C3C');
    cs.solved[cs.idx]=true;
    cs.idx++;
    setTimeout(()=>{
      renderChainRows();
      syncChainState();
      if(cs.idx>=cs.words.length)completeChain();
      else startChainTimer();
    },1000);
    return;
  }
  setChainMessage(`${prefix} -2 punti e una lettera sbloccata.`, '#E74C3C');
  startChainTimer();
}

function completeChain(){
  clearChainTimer();
  chainState.blocked=true;
  addChainPairPoints(5);
  renderChainPlayers();
  renderHomeLeaderboard();
  
  setChainMessage('Catena completata! +5 punti alla coppia.', '#2ECC71');
  syncChainState();
  setTimeout(()=>{
    const p1=players.find(p=>p.id===chainState.pids[0]);
    const p2=players.find(p=>p.id===chainState.pids[1]);
    document.getElementById('win-name').textContent=`${p1?.name||'—'} + ${p2?.name||'—'}`;
    document.getElementById('win-sub').textContent='+5 punti per aver chiuso Reazione a Catena!';
    const sorted=[...players].sort((a,b)=>b.score-a.score);
    let html='<div style="font-size:.68rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-bottom:.6rem">Classifica giocatori</div>';
    html+=sorted.map((pl,i)=>{
      const c=TC[pl.ci%TC.length];const tm=teams.find(t=>t.mids.includes(pl.id));
      return `<div class="sc-row">
        <div class="sc-rank">${i+1}</div>
        <div class="avatar" style="background:${c.light};color:${c.hex};width:24px;height:24px;font-size:.62rem;border-radius:50%;flex-shrink:0">${initials(pl.name)}</div>
        <div class="sc-name">${pl.name}${tm?` <span style="font-size:.68rem;color:var(--mut)">(${tm.name})</span>`:''}</div>
        <div class="sc-pts">${pl.score}</div></div>`;
    }).join('');
    if(teams.length){
      html+='<div style="height:.5rem"></div><div style="font-size:.68rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin:.4rem 0">Squadre</div>';
      html+=[...teams].sort((a,b)=>b.score-a.score).map((tm,i)=>`<div class="sc-row">
        <div class="sc-rank">${i+1}</div>
        <div style="width:10px;height:10px;border-radius:50%;background:${tm.color.hex};flex-shrink:0"></div>
        <div class="sc-name">${tm.name}</div><div class="sc-pts">${tm.score}</div></div>`).join('');
    }
    document.getElementById('win-scores').innerHTML=html;
    goTo('s-win');
    cleanupOnlineGameArtifacts();
  },900);
}

/* ══════════════════════════════
   AUA GAME
══════════════════════════════ */
let auaState={};let auaInt=null;
async function beginAUA(){
  clearAuaAutoStart();
  hideAuaIntroEffects();
  if(!selPid)return;
  const p=players.find(p=>p.id===selPid);
  document.getElementById('aua-pname').textContent=p.name;
  const questions=await loadQuestionBank('aua',AUA_Q);
  const shuffledQuestions = shuffleArray([...questions]).slice(0, 21);
  auaState={qIdx:0,answered:0,total:21,pid:selPid,max:getTimer('aua'),left:getTimer('aua'),paused:false,questions:shuffledQuestions};
  renderAUATrack();renderAUAQ();startAUATimer();goTo('s-aua');
}
function startAUATimer(){
  clearInterval(auaInt);
  updAUATimer();
  auaInt=setInterval(()=>{
    if(auaState.paused)return;
    auaState.left--;updAUATimer();
    if(auaState.left<=0){clearInterval(auaInt);auaTimeUp();}
  },1000);
}
function updAUATimer(){
  const pct=Math.round(auaState.left/auaState.max*100);
  const col=auaState.left<=5?'#E74C3C':auaState.left<=10?'#F5C518':'#2ECC71';
  const b=document.getElementById('aua-tbar');const d=document.getElementById('aua-tdisp');
  if(b){b.style.width=pct+'%';b.style.background=col;}
  if(d){d.textContent=auaState.left;d.style.color=auaState.left<=5?'#E74C3C':auaState.left<=10?'var(--gold)':'var(--txt)';}
}
function auaTimeUp(){
  stopQuestionSpeech();
  auaState.paused=true;
  stopAuaAudio();
  goTo('s-hero');
}
function renderAUATrack(){
  document.getElementById('aua-track').innerHTML=Array.from({length:auaState.total},(_,i)=>
    `<div class="prog-dot${i<auaState.answered?' done':i===auaState.answered?' cur':''}" id="dot-${i}"></div>`).join('');
}
function updAUATrack(){
  for(let i=0;i<auaState.total;i++){
    const d=document.getElementById('dot-'+i);if(!d)continue;
    d.className='prog-dot'+(i<auaState.answered?' done':i===auaState.answered?' cur':'');
  }
}
function renderAUAQ(){
  const q=auaState.questions[auaState.qIdx];
  document.getElementById('aua-content').innerHTML=`<div class="q-card">
    <div class="q-num">Domanda ${auaState.qIdx+1} di ${auaState.total}</div>
    <div class="q-hint">⚠ Dai la risposta SBAGLIATA!</div>
    <div class="q-text">${q.q}</div>
    <div class="answers">${q.a.map((ans,i)=>`<button class="ans-btn" id="ans-${i}" onclick="answerAUA('${ans}',${i})">${ans}</button>`).join('')}</div>
  </div>`;
  speakQuestion(q.q);
}
function answerAUA(chosen,idx){
  stopQuestionSpeech();
  const q=auaState.questions[auaState.qIdx];const win=chosen===q.wrong;
  document.querySelectorAll('.ans-btn').forEach(b=>b.classList.add('disabled'));
  document.getElementById('ans-'+idx)?.classList.add(win?'correct':'wrong');
  auaState.paused=true;
  if(win){
    auaState.answered++;updAUATrack();
    setTimeout(()=>{
      auaState.paused=false;
      if(auaState.answered>=auaState.total){clearInterval(auaInt);awardAndWin(auaState.pid);}
      else{auaState.qIdx++;renderAUAQ();}
    },600);
  } else {
    q.a.forEach((a,i)=>{if(a===q.wrong)document.getElementById('ans-'+i)?.classList.add('correct');});
    setTimeout(()=>showAUAFail(),600);
  }
}
function showAUAFail(){
  stopQuestionSpeech();
  playAuaErrorSound();
  document.getElementById('aua-content').innerHTML=`<div style="text-align:center;background:rgba(231,76,60,.12);border:1px solid rgba(231,76,60,.4);border-radius:18px;padding:1.5rem">
    <div style="font-size:2rem;margin-bottom:.5rem">💥</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#E74C3C;letter-spacing:2px">HAI SBAGLIATO!</div>
    <div style="font-size:.85rem;color:var(--mut);margin:.4rem 0 0">Hai detto quella giusta... si ricomincia, ma il tempo continua!</div></div>`;
  auaState.qIdx=0;
  auaState.answered=0;
  auaState.paused=false;
  renderAUATrack();
  setTimeout(()=>{
    if(auaState.left>0&&!auaState.paused)renderAUAQ();
  },900);
}
function restartAUA(){
  auaState.qIdx=0;
  auaState.answered=0;
  auaState.left=auaState.max;
  renderAUATrack();
  renderAUAQ();
  startAUATimer();
}

/* ══════════════════════════════
   EREDITA GAME
══════════════════════════════ */
let ereState={};let ereInt=null;let spaceKH=null;

async function beginEredita(options={}){
  if(!selP1||!selP2)return;
  clearInterval(ereInt);
  if(options.sessionId)listenGameSession(options.sessionId);
  if(spaceKH){document.removeEventListener('keydown',spaceKH);spaceKH=null;}

  const p1=players.find(p=>p.id===selP1);
  const p2=players.find(p=>p.id===selP2);
  const t1=teams.find(t=>t.mids.includes(selP1));
  const t2=teams.find(t=>t.mids.includes(selP2));
  if(!p1||!p2)return;

  const words=options.words||await loadQuestionBank('eredita',ERE_WORDS);
  const wordList=options.words?[...words]:[...words].sort(()=>Math.random()-.5);
  const revOrders=options.revOrders||wordList.map(w=>w.word.split('').map((l,i)=>({l,i})).filter(x=>x.l!==' ').sort(()=>Math.random()-.5).map(x=>x.i));

  ereState={
    p:[
      {id:selP1,uid:p1.uid||null,name:p1.name,color:t1?t1.color:TC[p1.ci%TC.length],team:t1,score:0},
      {id:selP2,uid:p2.uid||null,name:p2.name,color:t2?t2.color:TC[p2.ci%TC.length],team:t2,score:0},
    ],
    active:0,
    words:wordList,
    revOrders,
    wIdx:0,
    max:getTimer('ere'),
    left:[getTimer('ere'),getTimer('ere')],
    revealed:[],
    revOrder:[],
    totalWords:wordList.length,
    blocked:false,
  };
  if(!options.fromInvite&&selectedPlayMode==='online'){
    const sessionId=await createGameSession('eredita',serializeEreditaState());
    if(sessionId)listenGameSession(sessionId);
    sendGameInvites('eredita',{p1Uid:p1.uid||null,p2Uid:p2.uid||null,words:wordList,revOrders,sessionId});
  }

  spaceKH=function(e){
    if(e.code==='Space'&&document.getElementById('s-eredita').classList.contains('active')){
      e.preventDefault();
      onSpacePress();
    }
  };
  document.addEventListener('keydown',spaceKH);

  goTo('s-eredita');
  loadEreditaWord();
  syncEreditaState();
}

function serializeEreditaState(){
  if(!ereState?.p)return null;
  return {
    p:ereState.p.map(p=>({uid:p.uid||null,name:p.name,color:p.color,score:p.score||0})),
    active:ereState.active||0,
    words:ereState.words||[],
    revOrders:ereState.revOrders||[],
    wIdx:ereState.wIdx||0,
    max:ereState.max,
    left:ereState.left||[],
    revealed:ereState.revealed||[],
    revOrder:ereState.revOrder||[],
    totalWords:ereState.totalWords,
    blocked:!!ereState.blocked
  };
}

function syncEreditaState(){
  const state=serializeEreditaState();
  if(state)updateGameSession(state);
}

function applyRemoteEreditaState(state){
  if(!state)return;
  applyingRemoteSessionState=true;
  clearInterval(ereInt);
  ereState={
    p:(state.p||[]).map((rp,i)=>{
      const local=players.find(p=>p.uid&&p.uid===rp.uid);
      return {
        id:local?.id||i+1,
        uid:rp.uid||null,
        name:rp.name||local?.name||'Giocatore',
        color:rp.color||TC[i%TC.length],
        team:local?teams.find(t=>t.mids.includes(local.id)):null,
        score:rp.score||0
      };
    }),
    active:state.active||0,
    words:state.words||[],
    revOrders:state.revOrders||[],
    wIdx:state.wIdx||0,
    max:state.max||getTimer('ere'),
    left:state.left||[getTimer('ere'),getTimer('ere')],
    revealed:state.revealed||[],
    revOrder:state.revOrder||[],
    totalWords:state.totalWords||state.words?.length||0,
    blocked:!!state.blocked
  };
  goTo('s-eredita');
  renderEreditaPanels();
  renderWordCard(false);
  applyingRemoteSessionState=false;
  if(canControlEreditaOnline()&&!ereState.blocked)startEreditaTimer();
}

function canControlEreditaOnline(){
  if(selectedPlayMode!=='online'||!activeGameSessionId)return true;
  const uid=ereState.p?.[ereState.active]?.uid;
  return !uid||uid===currentUser?.uid;
}

function loadEreditaWord(){
  clearInterval(ereInt);
  const es=ereState;
  if(es.wIdx>=es.words.length){endEredita();return;}

  document.getElementById('ere-word-counter').textContent=`Parola ${es.wIdx+1} / ${es.totalWords}`;

  const word=es.words[es.wIdx].word;
  const letters=word.split('').map((l,i)=>({l,i})).filter(x=>x.l!==' ');
  es.revOrder=es.revOrders?.[es.wIdx]||letters.sort(()=>Math.random()-.5).map(x=>x.i);
  es.revealed=[];
  es.blocked=false;

  renderEreditaPanels();
  renderWordCard();
  startEreditaTimer();
}

function renderEreditaPanels(){
  const es=ereState;
  document.getElementById('ere-panels').innerHTML=es.p.map((p,i)=>{
    const isActive=es.active===i;
    const leftTime=es.left[i];
    const pct=Math.round(leftTime/es.max*100);
    const col=leftTime<=5?'#E74C3C':leftTime<=Math.floor(es.max*.25)?'#F5C518':p.color.hex;
    return `<div class="ere-panel${isActive?' active-turn':''}" id="ere-panel-${i}">
      <div class="ep-name" style="color:${p.color.hex}">${p.name}</div>
      <div class="ep-team-badge" style="background:${p.color.light};color:${p.color.hex}">${p.team?p.team.name:'Libero'}</div>
      <div class="ep-timer" id="ere-t-${i}" style="color:${isActive?p.color.hex:'var(--mut)'}">${leftTime}</div>
      <div class="ep-bar-wrap"><div class="ep-bar" id="ere-bar-${i}" style="width:${pct}%;background:${col}"></div></div>
      <div class="ep-score-label">Punti</div>
      <div class="ep-score-val" style="color:${p.color.hex}">${p.score}</div>
    </div>`;
  }).join('');

  const ap=es.p[es.active];
  const ind=document.getElementById('ere-active-ind');
  if(ind){
    ind.textContent=`Sta indovinando: ${ap.name}`;
    ind.style.background=ap.color.light;
    ind.style.color=ap.color.hex;
  }
}

function renderWordCard(shouldSpeak=true){
  const es=ereState;
  const w=es.words[es.wIdx];
  const letters=w.word.split('');
  const boxes=letters.map((l,i)=>{
    if(l===' ')return `<div class="lbox spc"></div>`;
    const rev=es.revealed.includes(i);
    return `<div class="lbox${rev?' rev':''}" id="lb-${i}">${rev?l:''}</div>`;
  }).join('');
  const totalLetters=letters.filter(l=>l!==' ').length;
  document.getElementById('ere-word-card').innerHTML=`
    <div class="word-clue">${w.clue}</div>
    <div class="letter-row">${boxes}</div>
    <div class="rev-count" id="ere-rev-count">${es.revealed.length} / ${totalLetters} lettere rivelate</div>`;
  if(shouldSpeak)speakQuestion(w.clue);
}

function startEreditaTimer(){
  clearInterval(ereInt);
  if(!canControlEreditaOnline())return;
  const es=ereState;
  const totalLetters=es.revOrder.length;

  ereInt=setInterval(()=>{
    if(es.blocked)return;
    const ai=es.active;
    es.left[ai]--;

    const pct=Math.round(es.left[ai]/es.max*100);
    const col=es.left[ai]<=5?'#E74C3C':es.left[ai]<=Math.floor(es.max*.25)?'#F5C518':es.p[ai].color.hex;
    const te=document.getElementById(`ere-t-${ai}`);
    const be=document.getElementById(`ere-bar-${ai}`);
    if(te)te.textContent=es.left[ai];
    if(be){be.style.width=pct+'%';be.style.background=col;}

    // update inactive panel timer display too
    const other = 1-ai;
    const otherTe=document.getElementById(`ere-t-${other}`);
    const otherBe=document.getElementById(`ere-bar-${other}`);
    if(otherTe) otherTe.textContent=es.left[other];
    if(otherBe){
      const otherPct=Math.round(es.left[other]/es.max*100);
      const otherCol=es.left[other]<=5?'#E74C3C':es.left[other]<=Math.floor(es.max*.25)?'#F5C518':es.p[other].color.hex;
      otherBe.style.width=otherPct+'%';
      otherBe.style.background=otherCol;
    }

    // reveal letters evenly across the timer
    if(totalLetters>0){
      const shouldReveal=Math.floor((es.max-es.left[ai])/es.max*totalLetters);
      while(es.revealed.length<shouldReveal&&es.revealed.length<totalLetters){
        const nextIdx=es.revOrder[es.revealed.length];
        es.revealed.push(nextIdx);
        const lb=document.getElementById('lb-'+nextIdx);
        if(lb){lb.classList.add('rev');lb.textContent=es.words[es.wIdx].word[nextIdx];}
      }
      const rc=document.getElementById('ere-rev-count');
      if(rc)rc.textContent=`${es.revealed.length} / ${totalLetters} lettere rivelate`;
    }
    syncEreditaState();

    if(es.left[ai]<=0){
      clearInterval(ereInt);
      handleEreditaTimeout();
    }
  },1000);
}

function onSpacePress(){
  const es=ereState;
  if(!canControlEreditaOnline())return;
  if(es.blocked)return;
  stopQuestionSpeech();
  // current active player guessed correctly
  clearInterval(ereInt);
  es.blocked=true;

  const winner=es.p[es.active];
  winner.score++;
  awardPlayerPoints(winner.id,1,'eredita');

  // reveal full word
  const w=es.words[es.wIdx];
  w.word.split('').forEach((l,i)=>{
    if(l===' ')return;
    const lb=document.getElementById('lb-'+i);
    if(lb){lb.classList.add('rev');lb.textContent=l;}
  });

  // flash panel
  const panel=document.getElementById(`ere-panel-${es.active}`);
  if(panel)panel.classList.add('just-scored');

  // update score display
  const scoreEl=document.querySelector(`#ere-panel-${es.active} .ep-score-val`);
  if(scoreEl)scoreEl.textContent=winner.score;

  const ind=document.getElementById('ere-active-ind');
  if(ind){
    ind.textContent=`✓ Punto a ${winner.name}!`;
    ind.style.background='rgba(46,204,113,.15)';
    ind.style.color='#2ECC71';
  }

  // alternate starting player for next word
  es.active = 1 - es.active;
  syncEreditaState();

  setTimeout(()=>{
    if(ereState.wIdx+1>=ereState.words.length){
      endEredita();
    } else {
      nextEreditaWord();
    }
  },1200);
}

function handleEreditaTimeout(){
  stopQuestionSpeech();
  const es=ereState;
  if(!canControlEreditaOnline())return;
  const loserIdx=es.active;
  const winnerIdx=1-loserIdx;
  const winner=es.p[winnerIdx];
  winner.score++;
  awardPlayerPoints(winner.id,1,'eredita');

  // reveal full word
  const w=es.words[es.wIdx];
  w.word.split('').forEach((l,i)=>{
    if(l===' ')return;
    const lb=document.getElementById('lb-'+i);
    if(lb){lb.classList.add('rev');lb.textContent=l;}
  });

  const panel=document.getElementById(`ere-panel-${winnerIdx}`);
  if(panel)panel.classList.add('just-scored');
  const scoreEl=document.querySelector(`#ere-panel-${winnerIdx} .ep-score-val`);
  if(scoreEl)scoreEl.textContent=winner.score;

  const ind=document.getElementById('ere-active-ind');
  if(ind){
    ind.textContent=`⏱ Punto a ${winner.name}!`;
    ind.style.background='rgba(46,204,113,.15)';
    ind.style.color='#2ECC71';
  }

  es.blocked=true;
  clearInterval(ereInt);
  syncEreditaState();
  endEredita();
}

function nextEreditaWord(){
  const es=ereState;
  es.wIdx++;
  document.getElementById('ere-controls').innerHTML='';
  loadEreditaWord();
  syncEreditaState();
}

function endEredita(){
  clearInterval(ereInt);
  if(spaceKH){document.removeEventListener('keydown',spaceKH);spaceKH=null;}
  const es=ereState;
  const winner=es.p[0].score>=es.p[1].score?es.p[0]:es.p[1];
  awardAndWin(winner.id);
  cleanupOnlineGameArtifacts();
}

/* ══════════════════════════════
   RUOTA GAME
══════════════════════════════ */
let wheelState={};let wheelRotation=0;
const WHEEL_VOWELS=['A','E','I','O','U'];

function selPickWheel(id){
  selWheelPid=id;
  document.querySelectorAll('#pick-grid-wheel .player-pick').forEach(e=>e.classList.remove('selected'));
  document.getElementById('pp-wheel-'+id)?.classList.add('selected');
}

async function beginWheel(options={}){
  if(!selWheelPid)return;
  hideWheelIntroEffects();
  if(options.sessionId)listenGameSession(options.sessionId);
  const wheelPlayersSource=Array.isArray(options.participantUids)&&options.participantUids.length
    ? options.participantUids.map(uid=>players.find(p=>p.uid===uid)).filter(Boolean)
    : players;
  const startIdx=wheelPlayersSource.findIndex(p=>p.id===selWheelPid);
  if(startIdx<0)return;
  const phrases=await loadQuestionBank('ruota',WHEEL_PHRASES);
  const phrase=options.phrase&&options.category
    ? {text:options.phrase,cat:options.category}
    : phrases[Math.floor(Math.random()*phrases.length)];
  wheelState={
    players:wheelPlayersSource.map(p=>{
      const t=teams.find(t=>t.mids.includes(p.id));
      return {id:p.id,uid:p.uid||null,name:p.name,color:TC[p.ci%TC.length],team:t,bank:0};
    }),
    active:startIdx,
    phrase:phrase.text,
    category:phrase.cat,
    revealed:new Set(),
    spinning:false,
    lastPrize:null,
    pendingPrize:null,
    completed:false
  };
  wheelRotation=0;
  document.getElementById('wheel-pname').textContent=getActiveWheelPlayer().name;
  const disc=document.getElementById('wheel-disc');
  if(disc){
    disc.style.transition='none';
    disc.style.transform='rotate(0deg)';
    requestAnimationFrame(()=>{disc.style.transition='transform 4s cubic-bezier(.12,.78,.18,1)';});
  }
  renderWheelLabels();
  renderWheelGame();
  setWheelMessage('Gira la ruota per scoprire una lettera.');
  renderWheelLetterPanel();
  document.getElementById('wheel-solution-input').value='';
  goTo('s-wheel');
  showWheelTurnNotice();
  if(!options.fromInvite){
    const starter=players.find(p=>p.id===selWheelPid);
    const participants=getOnlineParticipants();
    let sessionId=null;
    if(selectedPlayMode==='online'){
      sessionId=await createGameSession('ruota',serializeWheelState());
      if(sessionId)listenGameSession(sessionId);
    }
    sendGameInvites('ruota',{
      starterUid:starter?.uid||null,
      participantUids:participants.map(p=>p.uid),
      sessionId,
      phrase:phrase.text,
      category:phrase.cat
    });
  }
}

function isWheelLetter(ch){
  return /^[A-Z]$/.test(ch);
}
function isWheelVowel(ch){
  return WHEEL_VOWELS.includes(ch);
}

function renderWheelLabels(){
  const el=document.getElementById('wheel-labels');
  if(!el)return;
  el.innerHTML=WHEEL_SEGMENTS.map((s,i)=>{
    const angle=i*30+15;
    return `<div class="wheel-label" style="--a:${angle}deg">${s.label}</div>`;
  }).join('');
}

function renderWheelGame(){
  const ws=wheelState;
  const active=getActiveWheelPlayer();
  if(active)document.getElementById('wheel-pname').textContent=active.name;
  document.getElementById('wheel-category').textContent=ws.category;
  document.getElementById('wheel-round-score').textContent=active?active.bank:0;
  document.getElementById('wheel-prize').textContent=ws.lastPrize?ws.lastPrize.label:'—';
  const hiddenLetters=[...ws.phrase].filter(ch=>isWheelLetter(ch)&&!ws.revealed.has(ch)).length;
  document.getElementById('wheel-left-count').textContent=hiddenLetters;
  document.getElementById('wheel-phrase').innerHTML=ws.phrase.split(' ').map(word=>{
    const tiles=[...word].map(ch=>{
      if(!isWheelLetter(ch))return `<div class="phrase-tile punct">${ch}</div>`;
      const shown=ws.revealed.has(ch);
      return `<div class="phrase-tile${shown?' revealed':''}">${shown?ch:''}</div>`;
    }).join('');
    return `<div class="phrase-word">${tiles}</div>`;
  }).join('');
  renderWheelBanks();
  renderWheelLetterPanel();
}

function getActiveWheelPlayer(){
  return wheelState.players?.[wheelState.active]||null;
}

function renderWheelBanks(){
  const el=document.getElementById('wheel-banks');
  if(!el||!wheelState.players)return;
  el.innerHTML=wheelState.players.map((p,i)=>`
    <div class="wheel-bank${i===wheelState.active?' active':''}">
      <div class="wheel-bank-name" style="color:${p.color.hex}">${p.name}</div>
      <div class="wheel-bank-score">${p.bank}</div>
    </div>
  `).join('');
}

function renderWheelLetterPanel(){
  const ws=wheelState;
  const panel=document.getElementById('wheel-letter-panel');
  const input=document.getElementById('wheel-letter-input');
  const label=document.getElementById('wheel-letter-label');
  const vowels=document.getElementById('wheel-vowels');
  if(!panel||!input||!label||!vowels)return;
  const canGuess=!!(ws.pendingPrize&&!ws.spinning&&!ws.completed);
  const active=getActiveWheelPlayer();
  const canBuy=active&&active.bank>400&&getHiddenWheelLetters().some(isWheelVowel)&&!ws.spinning&&!ws.completed;
  panel.classList.toggle('active',canGuess||canBuy);
  input.disabled=!canGuess;
  document.getElementById('wheel-letter-submit').disabled=!canGuess;
  label.textContent=canGuess?`Scegli una consonante per ${ws.pendingPrize.label} punti`:'Compra una vocale per 400 punti';
  if(canGuess){
    input.value='';
    setTimeout(()=>input.focus(),0);
  }
  vowels.innerHTML=WHEEL_VOWELS.map(v=>{
    const hidden=ws.phrase.includes(v)&&!ws.revealed.has(v);
    const disabled=!canBuy||!hidden;
    return `<button class="btn-ghost" ${disabled?'disabled':''} onclick="buyWheelVowel('${v}')">${v}</button>`;
  }).join('');
}

function setWheelMessage(text){
  if(wheelState)wheelState.message=text;
  const el=document.getElementById('wheel-message');
  if(el)el.textContent=text;
}

function serializeWheelState(){
  if(!wheelState?.players)return null;
  return {
    players:wheelState.players.map(p=>({
      uid:p.uid||null,
      name:p.name,
      color:p.color,
      bank:p.bank||0
    })),
    active:wheelState.active||0,
    phrase:wheelState.phrase,
    category:wheelState.category,
    revealed:[...(wheelState.revealed||new Set())],
    spinning:!!wheelState.spinning,
    lastPrize:wheelState.lastPrize||null,
    pendingPrize:wheelState.pendingPrize||null,
    completed:!!wheelState.completed,
    message:wheelState.message||''
  };
}

function syncWheelState(){
  const state=serializeWheelState();
  if(state)updateGameSession(state);
}

function canControlWheelOnline(){
  if(selectedPlayMode!=='online'||!activeGameSessionId)return true;
  const uid=getActiveWheelPlayer()?.uid;
  return !uid||uid===currentUser?.uid;
}

function applyRemoteWheelState(state){
  if(!state||!document.getElementById('s-wheel'))return;
  applyingRemoteWheelState=true;
  wheelState={
    players:(state.players||[]).map((rp,i)=>{
      const local=players.find(p=>p.uid&&p.uid===rp.uid);
      const color=rp.color||TC[i%TC.length];
      return {
        id:local?.id||i+1,
        uid:rp.uid||local?.uid||null,
        name:rp.name||local?.name||'Giocatore',
        color,
        team:local?teams.find(t=>t.mids.includes(local.id)):null,
        bank:rp.bank||0
      };
    }),
    active:state.active||0,
    phrase:state.phrase||'',
    category:state.category||'',
    revealed:new Set(state.revealed||[]),
    spinning:!!state.spinning,
    lastPrize:state.lastPrize||null,
    pendingPrize:state.pendingPrize||null,
    completed:!!state.completed,
    message:state.message||''
  };
  goTo('s-wheel');
  renderWheelLabels();
  renderWheelGame();
  setWheelMessage(wheelState.message||'Partita online aggiornata.');
  applyingRemoteWheelState=false;
}

function showWheelTurnNotice(){
  const active=getActiveWheelPlayer();
  const alert=document.getElementById('wheel-turn-alert');
  const name=document.getElementById('wheel-turn-name');
  if(!active||!alert||!name)return;
  name.textContent=active.name;
  alert.classList.add('active');
  setTimeout(()=>alert.classList.remove('active'),1200);
}

function passWheelTurn(reason){
  const ws=wheelState;
  if(!ws.players?.length||ws.completed)return;
  ws.pendingPrize=null;
  ws.lastPrize=null;
  ws.active=(ws.active+1)%ws.players.length;
  const active=getActiveWheelPlayer();
  renderWheelGame();
  setWheelMessage(`${reason} Tocca a ${active.name}.`);
  showWheelTurnNotice();
  syncWheelState();
}

function normalizeWheelSolution(text){
  return (text||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^A-Z0-9]/gi,'')
    .toUpperCase();
}

function getHiddenWheelLetters(){
  return [...new Set([...wheelState.phrase].filter(ch=>isWheelLetter(ch)&&!wheelState.revealed.has(ch)))];
}
function getHiddenWheelConsonants(){
  return getHiddenWheelLetters().filter(ch=>!isWheelVowel(ch));
}

function spinWheel(){
  const ws=wheelState;
  if(!canControlWheelOnline())return;
  if(ws.spinning||ws.pendingPrize)return;
  const hidden=getHiddenWheelLetters();
  const hiddenConsonants=getHiddenWheelConsonants();
  if(!hidden.length){completeWheelPhrase();return;}
  if(!hiddenConsonants.length){
    const active=getActiveWheelPlayer();
    setWheelMessage(active&&active.bank>400?'Restano solo vocali: comprane una o risolvi.':'Restano solo vocali: puoi risolvere la frase.');
    renderWheelLetterPanel();
    return;
  }
  ws.spinning=true;
  ws.pendingPrize=null;
  renderWheelLetterPanel();
  setWheelMessage('La ruota gira...');
  syncWheelState();

  const idx=Math.floor(Math.random()*WHEEL_SEGMENTS.length);
  const prize=WHEEL_SEGMENTS[idx];
  const segmentSize=360/WHEEL_SEGMENTS.length;
  const center=idx*segmentSize+(segmentSize/2);
  const jitter=(Math.random()-.5)*(segmentSize*.55);
  const target=360-(center+jitter);
  wheelRotation+=360*5+target-(wheelRotation%360);
  const disc=document.getElementById('wheel-disc');
  if(disc)disc.style.transform=`rotate(${wheelRotation}deg)`;

  setTimeout(()=>{
    ws.lastPrize=prize;
    if(prize.bankrupt){
      const active=getActiveWheelPlayer();
      if(active)active.bank=0;
      ws.pendingPrize=null;
      passWheelTurn('Bancarotta!');
    } else if(prize.pass){
      ws.pendingPrize=null;
      passWheelTurn('Passa turno.');
    } else {
      ws.pendingPrize=prize;
      setWheelMessage(`Premio ${prize.label}: scegli una consonante.`);
    }
    ws.spinning=false;
    renderWheelGame();
    syncWheelState();
  },4200);
}

function submitWheelLetter(){
  const ws=wheelState;
  if(!canControlWheelOnline())return;
  const prize=ws.pendingPrize;
  if(!prize||ws.spinning)return;
  const input=document.getElementById('wheel-letter-input');
  const letter=(input?.value||'').trim().toUpperCase();
  if(!isWheelLetter(letter)){
    setWheelMessage('Inserisci una lettera valida.');
    return;
  }
  if(isWheelVowel(letter)){
    setWheelMessage('Dopo il giro puoi scegliere solo consonanti. Le vocali si comprano.');
    return;
  }
  if(ws.revealed.has(letter)){
    setWheelMessage(`${letter} è già stata scoperta. Scegli un'altra consonante.`);
    return;
  }
  const count=[...ws.phrase].filter(ch=>ch===letter).length;
  ws.pendingPrize=null;
  if(count>0){
    const active=getActiveWheelPlayer();
    ws.revealed.add(letter);
    if(active)active.bank+=prize.points*count;
    setWheelMessage(`${letter}: ${count} ${count===1?'lettera':'lettere'}! +${prize.points} x ${count} = +${prize.points*count} punti.`);
  } else {
    passWheelTurn(`${letter} non c'è nella frase.`);
  }
  renderWheelGame();
  syncWheelState();
  if(!getHiddenWheelLetters().length){
    setTimeout(()=>completeWheelPhrase(),700);
  }
}

function buyWheelVowel(vowel){
  const ws=wheelState;
  if(!canControlWheelOnline())return;
  const active=getActiveWheelPlayer();
  if(ws.spinning||ws.pendingPrize||!active||active.bank<=400||ws.completed)return;
  if(ws.revealed.has(vowel))return;
  const count=[...ws.phrase].filter(ch=>ch===vowel).length;
  if(!count)return;
  active.bank-=400;
  ws.revealed.add(vowel);
  setWheelMessage(`Hai comprato la vocale ${vowel}: ${count} ${count===1?'presenza':'presenze'}. -400 punti.`);
  renderWheelGame();
  syncWheelState();
  if(!getHiddenWheelLetters().length){
    setTimeout(()=>completeWheelPhrase(),700);
  }
}

function submitWheelSolution(){
  const ws=wheelState;
  if(!canControlWheelOnline())return;
  if(!ws.phrase||ws.spinning||ws.completed)return;
  const input=document.getElementById('wheel-solution-input');
  const guess=input?.value||'';
  if(!guess.trim()){
    setWheelMessage('Scrivi una soluzione prima di provare.');
    return;
  }
  if(normalizeWheelSolution(guess)!==normalizeWheelSolution(ws.phrase)){
    if(input){
      input.value='';
    }
    passWheelTurn('Soluzione sbagliata.');
    return;
  }
  solveWheelPhrase();
}

function solveWheelPhrase(){
  if(!wheelState.phrase||wheelState.spinning)return;
  wheelState.pendingPrize=null;
  [...wheelState.phrase].forEach(ch=>{if(isWheelLetter(ch))wheelState.revealed.add(ch);});
  renderWheelGame();
  syncWheelState();
  completeWheelPhrase();
}

document.addEventListener('keydown',e=>{
  if(e.code!=='Space')return;
  if(!document.getElementById('s-wheel')?.classList.contains('active'))return;
  const tag=(e.target?.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select'||e.target?.isContentEditable)return;
  e.preventDefault();
  spinWheel();
});

function completeWheelPhrase(){
  const ws=wheelState;
  if(ws.completed)return;
  ws.completed=true;
  const active=getActiveWheelPlayer();
  if(!active)return;
  const bonus=Math.max(1,active?active.bank:0);
  setWheelMessage(`Frase completata! +${bonus} punti in classifica.`);
  syncWheelState();
  renderHomeLeaderboard();
  setTimeout(()=>awardAndWin(active.id,bonus,`+${bonus} punti con la ruota!`),900);
}

/* ── WIN ── */
function awardAndWin(pid,points=1,subText=null){
  const p=players.find(p=>p.id===pid);
  const t=teams.find(t=>t.mids.includes(pid));
  awardPlayerPoints(pid,points,'manche');
  document.getElementById('win-name').textContent=p?p.name:'—';
  document.getElementById('win-sub').textContent=subText||(t?`+1 punto per ${t.name}!`:'Ha vinto questa manche!');
  const sorted=[...players].sort((a,b)=>b.score-a.score);
  const medals=['🥇','🥈','🥉'];
  let html='<div style="font-size:.68rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-bottom:.6rem">Classifica giocatori</div>';
  html+=sorted.map((pl,i)=>{
    const c=TC[pl.ci%TC.length];const tm=teams.find(t=>t.mids.includes(pl.id));
    return `<div class="sc-row">
      <div class="sc-rank">${medals[i]||i+1}</div>
      <div class="avatar" style="background:${c.light};color:${c.hex};width:24px;height:24px;font-size:.62rem;border-radius:50%;flex-shrink:0">${initials(pl.name)}</div>
      <div class="sc-name">${pl.name}${tm?` <span style="font-size:.68rem;color:var(--mut)">(${tm.name})</span>`:''}</div>
      <div class="sc-pts">${pl.score}</div></div>`;
  }).join('');
  if(teams.length){
    html+='<div style="height:.5rem"></div><div style="font-size:.68rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin:.4rem 0">Squadre</div>';
    html+=[...teams].sort((a,b)=>b.score-a.score).map((tm,i)=>`<div class="sc-row">
      <div class="sc-rank">${medals[i]||i+1}</div>
      <div style="width:10px;height:10px;border-radius:50%;background:${tm.color.hex};flex-shrink:0"></div>
      <div class="sc-name">${tm.name}</div><div class="sc-pts">${tm.score}</div></div>`).join('');
  }
  document.getElementById('win-scores').innerHTML=html;
  renderHomeLeaderboard();
  stopAuaAudio();
  goTo('s-win');
  cleanupOnlineGameArtifacts();
}

// LOGIN
const firebaseConfig = {
        apiKey: "AIzaSyAs9kwrZnnBTOaBzkLn6ZhLN5mfWWmXcl4",
        authDomain: "tv-game-night.firebaseapp.com",
        databaseURL: "https://tv-game-night-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "tv-game-night",
        storageBucket: "tv-game-night.firebasestorage.app",
        messagingSenderId: "570468387403",
        appId: "1:570468387403:web:1bcd29c85f8e8d00539bce"
    };

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
const db = firebase.firestore();
window.db = db;
window.seedQuestionBanksToFirestore = seedQuestionBanksToFirestore;
let currentUser = null;
listenTabooScoreEvents();

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("authOverlay");
  renderRegisteredUserSelect();
  auth.onAuthStateChanged(user => {
    console.log("USER:", user);
    currentUser = user;

    if(user){
      if(overlay){
        overlay.style.display = "none"; // forza nascondimento
      }
      updateUserUI(user);
      saveUserIfNew(user);
      addCurrentUserAsPlayer(user);
      loadLeaderboard();
      loadRegisteredUsers();
      listenCurrentUserProfile(user);
      listenGameInvites(user);
    } else {
      if(unsubscribeLeaderboard)unsubscribeLeaderboard();
      if(unsubscribeRegisteredUsers)unsubscribeRegisteredUsers();
      if(unsubscribeCurrentUserProfile)unsubscribeCurrentUserProfile();
      if(unsubscribeGameInvites)unsubscribeGameInvites();
      stopGameSessionListener();
      globalLeaderboard=[];
      registeredUsers=[];
      currentUserProfile=null;
      pendingGameInvite=null;
      renderRegisteredUserSelect();
      renderHomeLeaderboard();
      closeProfilePopup();
      closeGameInvitePopup();
      if(overlay){
        overlay.style.display = "flex";
      }
    }
  });
});

function loginWithGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function loginAnonymously(){
  auth.signInAnonymously();
}

function updateUserUI(user){
  const box = document.getElementById("userBox");
  const name = document.getElementById("userName");

  if(box && name){
    if(!user){
      box.classList.add("hidden");
      return;
    }
    box.classList.remove("hidden");
    name.innerText = getProfileDisplayName(currentUserProfile||{},user);
  }
}

function logout(){
  auth.signOut();
}
