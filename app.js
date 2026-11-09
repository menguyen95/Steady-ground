(function(){
'use strict';

/* ---------- storage (per device, this browser only) ---------- */
var KEY = 'steady-ground-v2';
var OLD_KEY = 'steady-ground-v1';
function testStore(){ try { localStorage.setItem('sg-t','1'); localStorage.removeItem('sg-t'); return true; } catch(e){ return false; } }
var canStore = testStore();
function blank(){
  return { setup:{done:false, mode:''}, episodes:[], grounding:[], thoughts:[], checkins:{}, weeks:{}, goals:[], activity:[], plan:{},
           flare:{signs:'',helps:'',contacts:'',pause:''}, read:{}, course:{answers:{}, done:{}, read:{}}, learn:{read:{}, answers:{}},
           badges:{}, badgesInit:false, prefs:{textSize:'normal', theme:'system', calm:false, voice:''}, stats:{shares:0}, lastOpen:0, pins:['breath','ground'],
           feelings:[], moments:[], profile:{name:'', colour:'teal', vision:'', about:'', team:'', joined:0, presentation:[], difficulties:[], matters:''},
           fgoals:[], wins:{}, patterns:[] };
}
var state = blank();
function mergeInto(p){
  var b = blank();
  for (var k in b) {
    if (p && p[k] !== undefined && p[k] !== null) {
      if (k === 'course' || k === 'learn' || k === 'setup' || k === 'flare' || k === 'prefs' || k === 'stats' || k === 'profile') { for (var kk in b[k]) if (p[k][kk] !== undefined) b[k][kk] = p[k][kk]; }
      else b[k] = p[k];
    }
  }
  return b;
}
(function load(){
  if (!canStore) return;
  try {
    var raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
    if (!raw) return;
    state = mergeInto(JSON.parse(raw));
  } catch(e){}
})();
var saveTimer = null;
function save(){ if (!canStore) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
function saveSoon(){ clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
/* Where the patient was: the open tab, session, homework and any half-filled form are kept on the phone,
   so closing the app mid-task loses nothing and it reopens on the same screen. Timed exercises are not resumed. */
var UI_KEY = 'steady-ground-where';
var UI_KEEP = ['tab','sub','learnTopic','lesson','goalDetail','draftEp','draftTh','thStep','draftFeel','feelStep','draftMoment','momentStep','draftGr','draftFgoal','fgoalForm','draftAttempt','draftGoal','goalForm','patternSel','reflectOpen','planKind','setupStep','welcomeMode','draftSetup'];
function saveUi(){
  if (!canStore) return;
  try { var o = {}; UI_KEEP.forEach(function(k){ o[k] = ui[k]; }); localStorage.setItem(UI_KEY, JSON.stringify(o)); } catch(e){}
}
var uiTimer = null;
function saveUiSoon(){ clearTimeout(uiTimer); uiTimer = setTimeout(saveUi, 300); }
function restoreUi(){
  if (!canStore) return;
  try {
    var raw = localStorage.getItem(UI_KEY); if (!raw) return;
    var o = JSON.parse(raw), keys = state.setup.done ? UI_KEEP : ['setupStep','welcomeMode','draftSetup'];
    keys.forEach(function(k){ if (o[k] !== undefined && o[k] !== null) { if (k === 'sub') { for (var kk in o.sub) ui.sub[kk] = o.sub[kk]; } else ui[k] = o[k]; } });
    if (ui.draftFeel) { ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.panel = {type:'feel', before:-1, done:false}; }
    else if (ui.draftMoment) { ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.panel = {type:'moment', before:-1, done:false}; }
    if (ui.sub.path === 'course') ui.sub.path = 'learn';
    if (ui.learnTopic && !findTopic(ui.learnTopic)) ui.learnTopic = null;
    /* Short-lived screens (the toolkit, a pattern check, sharing, settings) reopen on Home instead. */
    if (['today','path','tools','progress','me','course','plan','track'].indexOf(ui.tab) < 0) ui.tab = 'today';
  } catch(e){}
}

/* ---------- helpers ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function pad(n){ return n < 10 ? '0' + n : '' + n; }
function dayKey(d){ d = (d instanceof Date) ? d : new Date(d); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function lastDays(n){ var out = [], t = new Date(); for (var i = n-1; i >= 0; i--) out.push(dayKey(addDays(t, -i))); return out; }
function parseKey(key){ var p = key.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
function fmtDay(key){ return parseKey(key).toLocaleDateString(undefined, {month:'short', day:'numeric'}); }
function fmtWhen(ts){
  var d = new Date(ts);
  return d.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'}) + ' at ' + d.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
}
function fmtISO(ts){ var d = new Date(ts); return dayKey(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function localInput(d){ return dayKey(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function weekKey(d){ d = (d instanceof Date) ? d : new Date(d); var x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); } /* Monday */
function greeting(){ var h = new Date().getHours(), g = h < 5 ? 'Hello' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; var n = (state.profile && state.profile.name || '').trim().split(/\s+/)[0]; return n ? g + ', ' + esc(n) : g; }
function joinList(a){ return (a || []).join(', '); }
function avg(a){ return a.length ? a.reduce(function(s,x){ return s + x; }, 0) / a.length : 0; }
function toast(msg){
  var t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('toast-on');
  clearTimeout(toast._t); toast._t = setTimeout(function(){ t.classList.remove('toast-on'); }, 2600);
}
function cssVar(name){ try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#2D6878'; } catch(e){ return '#2D6878'; } }
/* A brief, gentle congratulatory burst shown each time a task is completed.
   Non-blocking, auto-removes, and respects reduced-motion (a quiet static tick, no confetti). */
function fxTick(msg){
  if (msg) toast(msg);
  if (state.prefs && state.prefs.calm) return;
  try {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var layer = document.createElement('div'); layer.className = 'fx-layer';
    var check = document.createElement('div'); check.className = 'fx-check';
    check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
    layer.appendChild(check);
    document.body.appendChild(layer);
    setTimeout(function(){ try { document.body.removeChild(layer); } catch(e){} }, reduce ? 800 : 1050);
  } catch(e){}
}
function logActivity(o){
  state.activity.push({ id: uid(), ts: Date.now(), goalId: o.goalId || null, minutes: o.minutes, kind: o.kind, label: o.label || '' });
  save();
}
function minutesOn(key, pred){
  return state.activity.reduce(function(s,a){ return s + ((dayKey(a.ts) === key && (!pred || pred(a))) ? a.minutes : 0); }, 0);
}
function topCounts(list, key, limit){
  var c = {};
  list.forEach(function(e){ (e[key] || []).forEach(function(x){ c[x] = (c[x] || 0) + 1; }); });
  return Object.keys(c).map(function(k){ return [k, c[k]]; })
    .sort(function(a,b){ return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); }).slice(0, limit);
}

/* ---------- content ---------- */
var SYMPTOMS = ['Weakness','Shaking or tremor','Difficulty walking','Seizure-like episode','Speech difficulty','Numbness or tingling','Pain','Fatigue','Brain fog','Dizziness','Other'];
var TRIGGERS = ['Stress or worry','Conflict','Poor sleep','Overdid it','Noise, crowds or screens','Pain','Fatigue','Strong emotion','Body sensation','Nothing obvious'];
var WARNINGS = ['Subtle physical shift','Change in breathing','Muscle tension','Change in mood','Racing thoughts','Feeling off','Nothing noticeable'];
var HELPS = ['Paced breathing','5-4-3-2-1 grounding','Muscle relaxation','Rest','Gentle movement','Shifted my attention','Talked to someone','Prescribed medication','Nothing yet'];
var SKILLS = ['Paced breathing','5-4-3-2-1 grounding','Progressive muscle relaxation','Body scan','Shifting attention','Other'];
var EMOTIONS = ['Anxious','Scared','Sad','Frustrated','Ashamed','Angry','Numb','Overwhelmed','Hopeless'];
var TRAPS = [
  ['Catastrophising','Expecting the worst possible outcome.'],
  ['All-or-nothing','Seeing things as a total success or a total failure.'],
  ['Mind reading','Assuming you know what others think of you.'],
  ['Fortune telling','Predicting that it will go badly.'],
  ['Should rules','Rigid rules about what you must or mustn\'t do.'],
  ['Focusing on the negative','Missing what went okay.']
];
var KINDS = [['activity','Activity'],['rest','Rest'],['move','Movement'],['social','Social']];
var PACES = { '4-6':[4,6], '4-4':[4,4], '5-5':[5,5] };
var PACE_LABELS = { '4-6':'In 4, out 6', '4-4':'In 4, out 4', '5-5':'In 5, out 5' };
var GROUND = [
  ['5','Look around and name 5 things you can see.','Notice small details: colours, shapes, light.'],
  ['4','Name 4 things you can feel.','Your feet on the floor, your clothes, the chair, the air on your skin.'],
  ['3','Name 3 things you can hear.','Start with the farthest sound, then come closer.'],
  ['2','Name 2 things you can smell.','Or two smells you like. Take your time.'],
  ['1','Name 1 thing you can taste.','Or take one slow sip of water.']
];
var PMR = [
  ['Hands','Make a fist with both hands. Squeeze, hold, then let go.'],
  ['Arms','Bend your elbows and tense your upper arms. Hold, then let your arms drop loose.'],
  ['Shoulders','Lift your shoulders up toward your ears. Hold, then let them sink down.'],
  ['Face','Scrunch your face: eyes, nose, jaw. Hold, then let it go slack.'],
  ['Chest and stomach','Take a breath in and tighten your stomach. Hold, then breathe out and soften.'],
  ['Thighs','Press your knees together and tense your thighs. Hold, then release.'],
  ['Calves and feet','Point your toes down and tense your calves. Hold, then release and wiggle your toes.']
];
var EXERCISES = [
  {id:'ankle', name:'Seated ankle circles', mins:3, dose:'10 slow circles each way, each foot', standing:false,
   steps:['Sit tall with your back supported and both feet flat on the floor.','Lift one foot just off the floor.','Draw slow circles with your toes, 10 one way and 10 the other. Then swap feet.'],
   tip:'Chat to someone or listen to music while you do it, instead of watching your foot.'},
  {id:'march', name:'Seated marching', mins:2, dose:'About 20 steps at an easy, steady beat', standing:false,
   steps:['Sit near the front of a sturdy chair with your feet flat.','Lift one knee, put it down, then lift the other.','Keep a steady rhythm, like a slow march.'],
   tip:'Count out loud or hum. Let the rhythm run on its own.'},
  {id:'reach', name:'Reach and roll', mins:3, dose:'8 reaches each arm, then 8 shoulder rolls', standing:false,
   steps:['Sit tall with your feet on the floor.','Reach one arm forward and up, then lower it slowly. Repeat 8 times, then switch arms.','Roll both shoulders backwards in slow circles 8 times.'],
   tip:'Look at a spot across the room rather than at your arm.'},
  {id:'heel', name:'Heel raises', mins:3, dose:'2 sets of 10, with a rest between', standing:true,
   steps:['Stand facing a kitchen counter and rest your hands on it lightly.','Rise up onto your toes, pause, then lower slowly.','Do 10, rest, then do another 10.'],
   tip:'Have a conversation or play a podcast while you do it.'},
  {id:'sit', name:'Sit to stand', mins:3, dose:'5 to 8 times, resting as needed', standing:true,
   steps:['Sit on a sturdy chair placed against a wall, feet hip-width apart.','Lean slightly forward and stand up. Pause for a moment.','Sit back down slowly and with control.'],
   tip:'Look straight ahead at a fixed point. Keep your breathing easy.'},
  {id:'shift', name:'Weight shifting', mins:2, dose:'1 to 2 minutes', standing:true,
   steps:['Stand next to a counter with your feet hip-width apart and one hand resting on it.','Slowly shift your weight to the right foot, then to the left.','Keep it smooth and small. Let your knees stay soft.'],
   tip:'Fix your eyes on a point ahead of you and count the shifts out loud.'},
  {id:'walk', name:'Rhythm walk', mins:5, dose:'2 to 5 minutes at a steady pace', standing:true,
   steps:['Choose a clear, safe path.','Walk at an even pace and count your steps to a beat, such as 1-2-3-4.','Look ahead at a point in the distance, not down at your feet.'],
   tip:'Let your legs do the work on their own. Notice the scenery instead of your steps.'}
];
var LESSONS = [
  {id:'fnd', title:'What FND is', sum:'A real condition with real symptoms that can change', mins:2,
   body:[
    'Functional neurological disorder (FND) is a real medical condition. The nervous system is not sending or receiving signals in the usual way, so movement, sensation, thinking or awareness can be affected.',
    'A helpful picture is software versus hardware. The brain and nerves are structurally fine, which is why scans and blood tests are often normal, but the way the system is running has changed.',
    'Clinicians diagnose FND from specific signs found on examination. It is not a diagnosis of exclusion, and it does not mean symptoms are faked, imagined or all in your head.',
    'Because it is a problem with how the system works, it can change. Treatments such as CBT and specialist physiotherapy help many people.']},
  {id:'attention', title:'Attention and automatic movement', sum:'Why distraction can ease symptoms', mins:2,
   body:[
    'Most movement runs on autopilot. In FND, paying close attention to a body part often makes symptoms stronger. When your attention is somewhere else, symptoms often ease.',
    'That is good news. It shows the system can work normally. It is not a sign that you were exaggerating. It is how FND behaves.',
    'In physiotherapy you practise moving smoothly while your attention is on something else, like a conversation, a song or a spot on the wall. Your physiotherapist can guide you on what is right for you.']},
  {id:'alarm', title:'Calming the alarm system', sum:'Slow breathing and grounding', mins:2,
   body:[
    'The body\'s alarm system raises muscle tension and speeds up breathing, which can make symptoms worse. You can turn it down on purpose.',
    'Slow breathing with a longer breath out signals safety to the body. Grounding with your senses brings attention back to the room. Both work best when you practise them while calm, so they feel familiar when you need them.',
    'If breathing exercises make you dizzy or more anxious, stop and breathe normally, and try grounding instead.']},
  {id:'setbacks', title:'Setbacks and flare-ups', sum:'Planning ahead so a rough patch stays small', mins:2,
   body:[
    'Symptoms often rise and fall. A flare-up does not mean you are back at the start or that treatment has failed.',
    'Notice your early warning signs, drop back to a smaller steady amount of activity for a few days, keep using your calming skills, and tell someone on your care team if it lasts.',
    'Be as kind to yourself as you would be to a friend. Write your plan now, while you are feeling well.']}
];

/* ---------- feelings: families, words, sensations, urges, helpful actions ----------
   Original vocabulary, structured the way emotion wheels teach it: core feeling, a more
   specific word, what it feels like in the body, what it pushes you to do, and what helps. */
var FAMILIES = [
  {id:'angry', name:'Angry', words:['Irritated','Frustrated','Resentful','Defensive','Hurt and angry','Furious'],
   urges:['Snap at someone','Shut the conversation down','Push harder','Replay it over and over','Withdraw and seethe'],
   help:['Pause before replying: three slow breaths out','Walk or move for a few minutes, then decide','Name the need underneath the anger','Say one honest sentence instead of ten']},
  {id:'afraid', name:'Afraid', words:['Nervous','Worried','On edge','Panicky','Dreading','Helpless'],
   urges:['Avoid the thing','Check my symptoms','Ask for reassurance','Freeze and wait','Leave early'],
   help:['Ground with 5-4-3-2-1','Stay two more minutes, then choose','Paced breathing with a longer breath out','Do a small version of the thing you are avoiding']},
  {id:'sad', name:'Sad', words:['Low','Lonely','Disappointed','Grieving','Hopeless','Drained'],
   urges:['Stay in bed','Cancel plans','Go quiet with people','Stop doing the things that help','Say I am fine'],
   help:['Message one person, even a short hello','One small activity from your plan','Gentle movement or fresh air','Let the feeling be there without fixing it for a few minutes']},
  {id:'ashamed', name:'Ashamed or disgusted', words:['Embarrassed','Self-critical','Unworthy','Exposed','Guilty','Put off'],
   urges:['Hide','Apologise again and again','Cover it up','Punish myself','Avoid their eyes'],
   help:['Say what you would say to a friend in this spot','Stay in the room and keep your head up','Check the facts: what actually happened?','Repair if needed, then let it go']},
  {id:'surprised', name:'Surprised or confused', words:['Startled','Thrown','Unsure','Overwhelmed','Curious','Amazed'],
   urges:['React before thinking','Go blank','Grab for an answer','Shut down'],
   help:['Pause and name what just happened','Ask a question instead of guessing','Give yourself a minute before deciding','Let it be new for a moment']},
  {id:'happy', name:'Happy or calm', words:['Content','Relieved','Proud','Hopeful','Warm','Settled'],
   urges:['Do everything at once','Skip my rest','Tell everyone','Savour it quietly'],
   help:['Savour it for thirty seconds on purpose','Note what led here so you can repeat it','Keep to your steady amount even on a good day','Share it with someone who will be glad']}
];
var SENSATIONS = ['Tight chest','Racing heart','Shallow breathing','Lump in throat','Tense jaw','Tight shoulders','Churning stomach','Shaky','Hot face','Cold hands','Heavy limbs','Restless legs','Light-headed','Numb','Tired all over','Headache','Warm and loose','Light and open','Steady'];
var BODYSCAN = [
  ['Feet and legs','Notice your feet on the floor. Is there pressure, warmth, tingling, nothing? Then your calves and thighs.'],
  ['Hips and lower back','Notice how you are sitting. Any tightness, heaviness or ease?'],
  ['Stomach','Rest your attention on your belly as it moves with your breath. Churning, soft, tight?'],
  ['Chest and breath','Feel the breath come and go. Fast or slow, high or low, tight or easy.'],
  ['Shoulders and arms','Are your shoulders near your ears? Let them drop if they want to. Notice your hands.'],
  ['Throat, jaw and face','Notice your jaw, your tongue, the space between your eyebrows. Soften what softens.'],
  ['Whole body','Take in the whole body at once. Give what you notice one or two words, with no need to change it.']
];
function familyById(id){ return FAMILIES.filter(function(f){ return f.id === id; })[0]; }
function newFeel(){ return { family:'', word:'', sensations:[], intensity:5, urges:[], action:'', note:'' }; }

/* ---------- practice stats and milestones ---------- */
function practiceDaySet(){ var s = {}; state.grounding.forEach(function(g){ s[dayKey(g.ts)] = 1; }); return s; }
function practiceRun(){
  var set = practiceDaySet(), d = new Date(), i = set[dayKey(d)] ? 0 : 1, run = 0;
  for (; i < 400; i++) { if (set[dayKey(addDays(d, -i))]) run++; else break; }
  return run;
}
function practiceLast7(){ var set = practiceDaySet(); return lastDays(7).filter(function(k){ return set[k]; }).length; }
function practicedToday(){ return !!practiceDaySet()[dayKey(new Date())]; }
function paceDaysMet(){
  var n = 0, today = dayKey(new Date());
  state.goals.forEach(function(g){ var d = parseKey(g.since || today); for (var i = 0; i < 400; i++) { var k = dayKey(addDays(d, i)); if (k > today) break; if (goalMins(g, k) >= g.target) n++; } });
  return n;
}

function stats(){
  var lp = learnProgress();
  var maxDrop = 0; state.grounding.forEach(function(g){ if (g.before >= 0 && g.after >= 0) maxDrop = Math.max(maxDrop, g.before - g.after); });
  var f = state.flare;
  return {
    ground: state.grounding.length, maxDrop: maxDrop, last7: practiceLast7(), run: practiceRun(),
    episodes: state.episodes.length, checkins: Object.keys(state.checkins).filter(function(k){ var c = state.checkins[k]; return c.mood || c.energy; }).length,
    weeks: Object.keys(state.weeks).filter(function(k){ var w = state.weeks[k]; return w.functioning != null || w.signs || w.stopped; }).length,
    thoughts: state.thoughts.length, learnRead: lp.read, learnTotal: lp.total, reflections: reflectionCount(),
    moves: state.activity.filter(function(a){ return a.kind === 'move'; }).length, paceDays: paceDaysMet(),
    flare: !!(f.signs && f.helps), shares: state.stats.shares || 0,
    skills: Object.keys(state.grounding.reduce(function(o,g){ o[g.skill] = 1; return o; }, {})).length,
    practiceDays: Object.keys(practiceDaySet()).length,
    tries: allAttempts().length, approached: allAttempts().filter(function(x){ return x.a.result !== 'not'; }).length,
    goalsDone: state.fgoals.filter(function(g){ return g.done; }).length, returns: state.stats.returns || 0,
    feelings: state.feelings.length, patterns: state.patterns.length, wins: Object.keys(state.wins).length
  };
}
var BADGES = [
  {id:'ground1', cat:'calm', name:'First calming practice', how:'Use a calming skill once', test:function(s){ return s.ground >= 1; }},
  {id:'skills3', cat:'calm', name:'Three ways to settle', how:'Use three different calming skills', test:function(s){ return s.skills >= 3; }},
  {id:'ground10', cat:'calm', name:'Calming, ten times', how:'Practise a calming skill 10 times in total', test:function(s){ return s.ground >= 10; }},
  {id:'ground25', cat:'calm', name:'Calming, twenty-five times', how:'Practise 25 times in total', test:function(s){ return s.ground >= 25; }},
  {id:'ground100', cat:'calm', name:'Calming, one hundred times', how:'Practise 100 times in total', test:function(s){ return s.ground >= 100; }},
  {id:'drop3', cat:'calm', name:'Felt the shift', how:'A practice where your stress fell by 3 points or more', test:function(s){ return s.maxDrop >= 3; }},
  {id:'days10', cat:'calm', name:'Ten practice days', how:'Practise on 10 different days, in any order', test:function(s){ return s.practiceDays >= 10; }},
  {id:'days30', cat:'calm', name:'Thirty practice days', how:'Practise on 30 different days, in any order', test:function(s){ return s.practiceDays >= 30; }},
  {id:'step1', cat:'plan', name:'First real-world step', how:'Try a step toward a goal', test:function(s){ return s.tries >= 1; }},
  {id:'approach3', cat:'plan', name:'Approached, not avoided', how:'Do all or part of a step three times', test:function(s){ return s.approached >= 3; }},
  {id:'step10', cat:'plan', name:'Ten tries', how:'Try a goal step 10 times', test:function(s){ return s.tries >= 10; }},
  {id:'goal1', cat:'plan', name:'Goal reached', how:'Reach a real-world goal', test:function(s){ return s.goalsDone >= 1; }},
  {id:'pace1', cat:'plan', name:'Steady amount met', how:'Meet a pacing target for a day', test:function(s){ return s.paceDays >= 1; }},
  {id:'pace7', cat:'plan', name:'Seven steady days', how:'Meet pacing targets on 7 days', test:function(s){ return s.paceDays >= 7; }},
  {id:'return1', cat:'plan', name:'Came back', how:'Return after a break of a few days. Coming back is a recovery skill', test:function(s){ return s.returns >= 1; }},
  {id:'feel1', cat:'track', name:'Named a feeling', how:'Name a feeling, where it sits, and the urge', test:function(s){ return s.feelings >= 1; }},
  {id:'feel5', cat:'track', name:'Five feelings named', how:'Name five feelings', test:function(s){ return s.feelings >= 5; }},
  {id:'pattern3', cat:'track', name:'Pattern spotter', how:'Do three pattern checks', test:function(s){ return s.patterns >= 3; }},
  {id:'th1', cat:'track', name:'First thought record', how:'Work a thought through to a fairer view', test:function(s){ return s.thoughts >= 1; }},
  {id:'th5', cat:'track', name:'Five thought records', how:'Complete 5 thought records', test:function(s){ return s.thoughts >= 5; }},
  {id:'wins7', cat:'track', name:'Seven good things', how:'Note what went well on 7 days', test:function(s){ return s.wins >= 7; }},
  {id:'week1', cat:'track', name:'Week in review', how:'Fill in a weekly summary', test:function(s){ return s.weeks >= 1; }},
  {id:'learn1', cat:'course', name:'Understanding FND', how:'Read a Learn topic', test:function(s){ return s.learnRead >= 1; }},
  {id:'learnall', cat:'course', name:'The whole picture', how:'Read all four Learn topics', test:function(s){ return s.learnTotal && s.learnRead >= s.learnTotal; }},
  {id:'reflect1', cat:'course', name:'Looking inward', how:'Answer a reflection question', test:function(s){ return s.reflections >= 1; }},
  {id:'move1', cat:'move', name:'First movement practice', how:'Complete a movement exercise', test:function(s){ return s.moves >= 1; }},
  {id:'move10', cat:'move', name:'Ten movement practices', how:'Complete 10 movement exercises', test:function(s){ return s.moves >= 10; }},
  {id:'flare', cat:'share', name:'Plan in place', how:'Write your flare plan', test:function(s){ return s.flare; }},
  {id:'share1', cat:'share', name:'Shared with my team', how:'Share a report with your clinic', test:function(s){ return s.shares >= 1; }}
];
var CAT_NAMES = { plan:'Real-world steps', calm:'Calming skills', track:'Noticing', course:'Understanding', move:'Movement', share:'Working with your team' };
var CAT_ICONS = {
  calm:'<path d="M3 12c3-3 6-3 9 0s6 3 9 0M3 17c3-3 6-3 9 0s6 3 9 0M3 7c3-3 6-3 9 0s6 3 9 0"/>',
  track:'<path d="M6 4h10l3 3v13H6zM9 11h7M9 15h5"/>',
  course:'<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5zM12 6v13.5"/>',
  move:'<circle cx="13" cy="4" r="1.5"/><path d="M9 20l3-7 3 3 1 4M8 11l4-3 3 2 2 3"/>',
  plan:'<path d="M4 19h5v-5h5v-5h6"/>',
  share:'<path d="M12 16V4M7 9l5-5 5 5M5 14v6h14v-6"/>'
};
function badgeIcon(cat){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (CAT_ICONS[cat] || CAT_ICONS.calm) + '</svg>'; }
var ENCOURAGE = [
  'You took a meaningful step today.',
  'Each practice teaches your nervous system that it can settle.',
  'Regular and small does more than rare and large.',
  'Practising while calm makes the skill easier to reach when you need it.',
  'This is the work that changes things over time.'
];
function encourage(){ return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]; }
function checkMilestones(){
  var s = stats(), fresh = [];
  if (!state.badgesInit) {
    BADGES.forEach(function(b){ if (b.test(s)) state.badges[b.id] = Date.now(); });
    state.badgesInit = true; save(); return;
  }
  BADGES.forEach(function(b){ if (!state.badges[b.id] && b.test(s)) { state.badges[b.id] = Date.now(); fresh.push(b); } });
  if (fresh.length) { save(); ui.celebrate = ui.celebrate.concat(fresh); }
}
function viewCelebration(){
  var b = ui.celebrate[0];
  return '<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="celTitle"><div class="cel-card">' +
    '<div class="medal medal-' + b.cat + '">' + badgeIcon(b.cat) + '</div>' +
    '<p class="eyebrow">Milestone reached</p><h2 id="celTitle">' + esc(b.name) + '</h2><p>' + esc(b.how) + '.</p><p class="hint">' + esc(encourage()) + '</p>' +
    '<div class="row"><button type="button" class="btn btn-primary" data-action="cel-next">' + (ui.celebrate.length > 1 ? 'Next' : 'Continue') + '</button><button type="button" class="btn btn-quiet" data-action="goto-milestones">See all milestones</button></div></div></div>';
}
function ring(pct, label, sub){
  var r = 34, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, pct));
  return '<div class="ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ring-bg" cx="40" cy="40" r="' + r + '"/><circle class="ring-fg" cx="40" cy="40" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><div class="ring-txt"><span class="ring-big">' + label + '</span><span class="ring-sub">' + sub + '</span></div></div>';
}
function viewProgress(){
  var h = '<div class="stack"><h1>My progress</h1>' + seg('progress', [['function','Function'],['progression','Symptoms'],['milestones','Milestones'],['completed','Done']], ui.sub.progress);
  if (ui.sub.progress === 'function' || ui.sub.progress === 'trends') h += viewFunction();
  else if (ui.sub.progress === 'progression') h += viewProgression();
  else if (ui.sub.progress === 'milestones') h += viewMilestones();
  else h += viewCompleted();
  return h + '</div>';
}
function weekList(n){ var weeks = [], d = parseKey(weekKey(new Date())); for (var i = n - 1; i >= 0; i--) weeks.push(dayKey(addDays(d, -7 * i))); return weeks; }
function inWeekOf(ts, wk){ var k = dayKey(ts); return k >= wk && k < dayKey(addDays(parseKey(wk), 7)); }
function viewFunction(){
  var weeks = weekList(8), tries = allAttempts();
  var tr = weeks.map(function(wk){ return tries.filter(function(x){ return inWeekOf(x.ts, wk); }).length; });
  var ap = weeks.map(function(wk){ return tries.filter(function(x){ return inWeekOf(x.ts, wk) && x.a.result !== 'not'; }).length; });
  var pl = weeks.map(function(wk){ var n = 0; for (var i = 0; i < 7; i++) { var k = dayKey(addDays(parseKey(wk), i)); (state.plan[k] || []).forEach(function(it){ if (it.done) n++; }); } return n; });
  var pr = weeks.map(function(wk){ return state.grounding.filter(function(g){ return inWeekOf(g.ts, wk); }).length; });
  var fn = weeks.map(function(wk){ var w = state.weeks[wk]; return w && w.functioning != null ? w.functioning : 0; });
  var stepsDone = 0, stepsAll = 0; state.fgoals.forEach(function(g){ g.steps.forEach(function(st){ stepsAll++; if (st.done) stepsDone++; }); });
  var h = '<section class="card"><h2>What you are getting back</h2><p>' + (stepsAll ? stepsDone + ' of ' + stepsAll + ' goal steps done across ' + state.fgoals.length + ' ' + (state.fgoals.length === 1 ? 'goal' : 'goals') + ', ' : '') + tries.length + ' real-world ' + (tries.length === 1 ? 'try' : 'tries') + ' in all, ' + Object.keys(state.wins).length + ' days with something that went well.</p>' +
          (state.fgoals.filter(function(g){ return g.done; }).length ? '<p class="meta">Goals reached: ' + esc(joinList(state.fgoals.filter(function(g){ return g.done; }).map(function(g){ return g.name; }))) + '.</p>' : '') + '</section>';
  if (!tries.length && !pl.some(function(x){ return x; }) && !pr.some(function(x){ return x; })) return h + '<section class="card empty"><h2>Your progress will show here</h2><p class="hint">Real-world tries, planned activities completed, calming practices and your weekly functioning rating, week by week. Function and participation are what recovery looks like; symptom counts are kept separately.</p><div><button type="button" class="btn" data-action="goto-plan-goals">Set a goal</button></div></section>';
  h += '<section class="card"><h2>Real-world tries per week</h2><p class="hint">Any try counts; the darker bars are tries where you did all or part of the step.</p>' + chartBars(weeks, tr, Math.max(5, Math.max.apply(null, tr)), 'Goal step tries per week over the last 8 weeks') + '</section>';
  h += '<section class="card"><h2>Planned activities completed</h2>' + chartBars(weeks, pl, Math.max(5, Math.max.apply(null, pl)), 'Planned activities completed per week') + '</section>';
  h += '<section class="card"><h2>Calming practices per week</h2>' + chartBars(weeks, pr, Math.max(7, Math.max.apply(null, pr)), 'Calming practices per week') + '</section>';
  if (fn.some(function(x){ return x > 0; })) h += '<section class="card"><h2>Overall functioning</h2><p class="hint">Your weekly summary rating, 0 to 10.</p>' + chartBars(weeks, fn, 10, 'Weekly functioning rating') + '</section>';
  var days = lastDays(14), mood = days.map(function(d){ var c = state.checkins[d]; return c && c.mood ? c.mood : null; }), energy = days.map(function(d){ var c = state.checkins[d]; return c && c.energy ? c.energy : null; });
  if (mood.some(function(x){ return x; }) || energy.some(function(x){ return x; })) h += '<section class="card"><h2>Mood and energy</h2><p class="hint">Last 14 days, 1 is lowest and 5 is highest.</p>' + chartLines(days, mood, energy, 'Mood and energy over the last 14 days') + '<div class="legend"><span><i class="sw sw1"></i>Mood</span><span><i class="sw sw2"></i>Energy</span></div></section>';
  return h;
}
function viewProgression(){
  var weeks = [], d = parseKey(weekKey(new Date()));
  for (var i = 7; i >= 0; i--) weeks.push(dayKey(addDays(d, -7 * i)));
  function inWeek(ts, wk){ var k = dayKey(ts); return k >= wk && k < dayKey(addDays(parseKey(wk), 7)); }
  var eps = weeks.map(function(wk){ return state.episodes.filter(function(e){ return inWeek(e.ts, wk); }).length; });
  var sev = weeks.map(function(wk){ var s = state.episodes.filter(function(e){ return inWeek(e.ts, wk) && e.severity; }).map(function(e){ return e.severity; }); return s.length ? +avg(s).toFixed(2) : 0; });
  var pr = weeks.map(function(wk){ return state.grounding.filter(function(g){ return inWeek(g.ts, wk); }).length; });
  var fn = weeks.map(function(wk){ var w = state.weeks[wk]; return w && w.functioning != null ? w.functioning : 0; });
  var intro = '<section class="card"><p class="hint">Look at this about once a week, not every day. Paying close attention to symptoms tends to turn them up; the Function view is the one that shows recovery.</p></section>';
  if (!state.episodes.length) return intro + '<section class="card empty"><h2>Symptom progression will appear here</h2><p class="hint">Once you have logged episodes across a few weeks, this shows how often they happen, how severe they are, and how much you are practising, week by week.</p></section>';
  var h = intro + '<section class="card"><h2>Episodes per week</h2><p class="hint">Last 8 weeks, Monday to Sunday.</p>' + chartBars(weeks, eps, Math.max(4, Math.max.apply(null, eps)), 'Episodes per week over the last 8 weeks') + '</section>';
  h += '<section class="card"><h2>Average severity</h2><p class="hint">1 mild, 2 moderate, 3 severe. Weeks with no episodes show nothing.</p>' + chartBars(weeks, sev, 3, 'Average episode severity per week') + '</section>';
  var first = weeks.slice(0,4), last = weeks.slice(4), e1 = first.reduce(function(s,w,i){ return s + eps[i]; }, 0), e2 = last.reduce(function(s,w,i){ return s + eps[i+4]; }, 0);
  var p1 = first.reduce(function(s,w,i){ return s + pr[i]; }, 0), p2 = last.reduce(function(s,w,i){ return s + pr[i+4]; }, 0);
  h += '<section class="card"><h2>Last four weeks against the four before</h2><p>Episodes: ' + e2 + ' (' + e1 + ' before). Practices: ' + p2 + ' (' + p1 + ' before).</p><p class="hint">Symptoms rise and fall. The useful question is whether the practice is building, not whether every week is better than the last.</p></section>';
  return h;
}
function viewCompleted(){
  var ev = [];
  state.grounding.forEach(function(g){ ev.push({ ts:g.ts, cat:'calm', text:g.skill + (g.before >= 0 && g.after >= 0 ? ', stress ' + g.before + ' to ' + g.after : '') }); });
  state.episodes.forEach(function(e){ ev.push({ ts:e.ts, cat:'track', text:'Logged an episode' + (e.types.length ? ': ' + joinList(e.types) : '') }); });
  state.thoughts.forEach(function(t){ ev.push({ ts:t.ts, cat:'track', text:'Thought record' + (t.thought ? ': ' + t.thought : '') }); });
  state.moments.forEach(function(m){ ev.push({ ts:m.ts, cat:'track', text:'Unpacked a moment' }); });
  state.feelings.forEach(function(f){ var fam = familyById(f.family); ev.push({ ts:f.ts, cat:'track', text:'Named a feeling: ' + (fam ? fam.name.toLowerCase() : '') + (f.word ? ', ' + f.word.toLowerCase() : '') }); });
  state.activity.forEach(function(a){ if (a.kind === 'move') ev.push({ ts:a.ts, cat:'move', text:a.label + ', ' + a.minutes + ' min' }); if (a.kind === 'goal') ev.push({ ts:a.ts, cat:'plan', text:'+' + a.minutes + ' min of ' + a.label }); });
  Object.keys(state.learn.read).forEach(function(id){ var t = findTopic(id); if (t && state.learn.read[id]) ev.push({ ts:state.learn.read[id], cat:'course', text:'Read: ' + t.title }); });
  allAttempts().forEach(function(x){ var st = byId(x.goal.steps, x.a.stepId); ev.push({ ts:x.ts, cat:'plan', text:(x.a.result === 'did' ? 'Did a step: ' : x.a.result === 'part' ? 'Did part of a step: ' : 'Tried a step: ') + (st ? st.text : x.goal.name) }); });
  state.fgoals.forEach(function(g){ if (g.done && g.doneTs) ev.push({ ts:g.doneTs, cat:'plan', text:'Goal reached: ' + g.name }); });
  Object.keys(state.wins).forEach(function(k){ ev.push({ ts:parseKey(k).getTime() + 20 * 3600000, cat:'track', text:'Went well: ' + state.wins[k] }); });
  state.patterns.forEach(function(pt){ ev.push({ ts:pt.ts, cat:'track', text:'Pattern check: ' + joinList(pt.items).toLowerCase() }); });
  BADGES.forEach(function(b){ if (state.badges[b.id]) ev.push({ ts:state.badges[b.id], cat:'share', text:'Milestone: ' + b.name }); });
  ev = ev.filter(function(e){ return e.ts > 0; }).sort(function(a,b){ return b.ts - a.ts; }).slice(0, 150);
  if (!ev.length) return '<section class="card empty"><h2>Completed tasks will appear here</h2><p class="hint">Every practice, log entry, topic read and milestone, day by day.</p></section>';
  var days = {}, order = [];
  ev.forEach(function(e){ var k = dayKey(e.ts); if (!days[k]) { days[k] = []; order.push(k); } days[k].push(e); });
  var total = ev.length, wk = lastDays(7), n7 = ev.filter(function(e){ return wk.indexOf(dayKey(e.ts)) > -1; }).length;
  var h = '<section class="card"><p><strong>' + n7 + '</strong> things done in the last 7 days, <strong>' + total + '</strong> in your recent history.</p></section>';
  h += '<section class="card"><ul class="timeline">' + order.map(function(k){
    return '<li class="tl-day"><p class="eyebrow">' + esc(parseKey(k).toLocaleDateString(undefined, {weekday:'long', month:'short', day:'numeric'})) + '</p>' + days[k].map(function(e){
      return '<div class="tl-item"><span class="tl-ic">' + badgeIcon(e.cat) + '</span><span class="tl-text">' + esc(e.text) + '<span class="meta"> · ' + esc(new Date(e.ts).toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'})) + '</span></span></div>';
    }).join('') + '</li>';
  }).join('') + '</ul></section>';
  return h;
}
function viewMilestones(){
  var earned = BADGES.filter(function(b){ return state.badges[b.id]; }).length, s = stats();
  var h = '<section class="card"><div class="row" style="align-items:center">' + ring(s.last7 / 7, s.last7 + '/7', 'days') + '<div class="stack-s" style="flex:1; min-width:160px"><p><strong>' + s.ground + '</strong> calming ' + (s.ground === 1 ? 'practice' : 'practices') + ' in total</p><p><strong>' + s.last7 + '</strong> of the last 7 days with a practice</p><p><strong>' + s.practiceDays + '</strong> practice days in all; they add up and never reset</p></div></div>' +
    '<p class="hint">' + earned + ' of ' + BADGES.length + ' milestones reached. These mark skills and real-world steps, not time spent in the app. Missed days take nothing away.</p></section>';
  Object.keys(CAT_NAMES).forEach(function(cat){
    var list = BADGES.filter(function(b){ return b.cat === cat; });
    h += '<section class="card"><h2>' + CAT_NAMES[cat] + '</h2><div class="badges">' + list.map(function(b){
      var on = !!state.badges[b.id];
      return '<div class="badge-tile ' + (on ? 'on' : '') + '"><div class="medal medal-' + cat + '">' + badgeIcon(cat) + '</div><div class="badge-body"><strong>' + esc(b.name) + '</strong><span class="meta">' + (on ? 'Reached ' + esc(fmtDay(dayKey(state.badges[b.id]))) : esc(b.how)) + '</span></div></div>';
    }).join('') + '</div></section>';
  });
  return h;
}

/* ---------- ME (profile) ---------- */
function applyPrefs(){
  try {
    var r = document.documentElement, pr = state.prefs || {};
    if (pr.theme === 'light' || pr.theme === 'dark') r.setAttribute('data-theme', pr.theme); else r.removeAttribute('data-theme');
    r.classList.toggle('text-large', pr.textSize === 'large'); r.classList.toggle('text-larger', pr.textSize === 'larger'); r.classList.toggle('calm-ui', !!pr.calm);
  } catch(e){}
}
function applyColour(){ applyPrefs(); }
function guided(){ return state.setup.mode === 'course'; }
function initials(name){ var p = (name || '').trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase() : '•'; }
function viewMe(){
  var pr = state.profile, s = stats(), earned = BADGES.filter(function(b){ return state.badges[b.id]; }), recent = earned.sort(function(a,b){ return state.badges[b.id] - state.badges[a.id]; }).slice(0,3);
  var vision = pr.vision || (state.course.answers && state.course.answers.s1d2_4) || '';
  var joined = pr.joined ? fmtDay(dayKey(pr.joined)) : '';
  var h = '<div class="stack">' + backBtn('goto-today', 'Back') + '<h1>Me</h1>';
  h += '<section class="card"><div class="row" style="align-items:center"><div class="avatar">' + esc(initials(pr.name)) + '</div><div class="stack-s" style="flex:1; min-width:160px"><h2>' + esc(pr.name || 'Your name') + '</h2><p class="meta">' + (joined ? 'Using Steady Ground since ' + esc(joined) + '. ' : '') + s.ground + ' practices, ' + earned.length + ' milestones.</p></div></div>' +
       lineField('profile','name','Name or nickname',pr.name,'How you would like to be greeted') + '</section>';
  h += '<section class="card"><h2>How you are using Steady Ground</h2><div class="seg" role="group" aria-label="Mode">' + [['course','Guided treatment'],['tools','Independent use']].map(function(t){ return '<button type="button" aria-selected="' + (state.setup.mode === t[0]) + '" data-action="mode-set" data-val="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><p class="hint">' + (state.setup.mode === 'course' ? 'Guided: the course, homework and goals stay in view on Home and My Path. Switch to independent use when your programme ends.' : 'Independent: a simpler toolkit with your goals and plans. The course stays available under My Path as a reference.') + '</p></section>';
  h += '<section class="card"><div class="item-head"><h2>My milestones</h2><button type="button" class="link" data-action="goto-milestones">See all ' + earned.length + '/' + BADGES.length + '</button></div>' +
       (recent.length ? '<div class="badges">' + recent.map(function(b){ return '<div class="badge-tile on"><div class="medal medal-' + b.cat + '">' + badgeIcon(b.cat) + '</div><div class="badge-body"><strong>' + esc(b.name) + '</strong><span class="meta">Reached ' + esc(fmtDay(dayKey(state.badges[b.id]))) + '</span></div></div>'; }).join('') + '</div>' : '<p class="hint">Your first milestone is one calming practice away.</p>') +
       '<div class="row" style="align-items:center">' + ring(s.last7 / 7, s.last7 + '/7', 'days') + '<p style="flex:1; min-width:160px">' + s.last7 + ' of the last 7 days with a practice, ' + s.practiceDays + ' practice days in all.</p></div></section>';
  h += '<section class="card"><h2>My FND</h2><p class="hint">Used to choose which tools come first when you tap "I\'m having symptoms".</p><div class="field"><span class="lbl">How it shows up</span>' + chipGroup('profile','presentation',PRESENTATIONS.map(function(x){ return x[1]; }),pr.presentation) + '</div><div class="field"><span class="lbl">What gets in the way most</span>' + chipGroup('profile','difficulties',DIFFICULTIES,pr.difficulties) + '</div>' + textField('profile','matters','If symptoms got in the way less, I would be',pr.matters,2,'') + '</section>';
  h += '<section class="card"><h2>The version of me I am working toward</h2><p class="hint">From Session 1, Day 2. Read it on a hard day.</p>' + textField('profile','vision','',vision,3,'Someone who has FND but it does not run my life') + '</section>';
  h += '<section class="card"><h2>About me</h2><p class="hint">Anything you want the app, or a clinician reading your report, to know: what your symptoms look like, what helps, what you enjoy.</p>' + textField('profile','about','',pr.about,4,'') + '</section>';
  h += '<section class="card"><h2>My care team</h2><p class="hint">Names and numbers. Also used by your flare plan.</p>' + textField('profile','team','',pr.team || state.flare.contacts,3,'Dr, therapist, physiotherapist, a friend') + '</section>';
  h += '<section class="card"><h2>My plans</h2><div class="row"><button type="button" class="btn" data-action="goto-plan-pacing">Pacing goals</button><button type="button" class="btn" data-action="goto-plan-flare">Flare plan</button><button type="button" class="btn" data-action="goto-plan">Today\'s plan</button></div></section>';
  h += '<section class="card"><h2>Your data and privacy</h2><p><strong>What is saved:</strong> everything you enter, on this phone only.</p><p><strong>What is shared:</strong> nothing, until you tap Share with my clinic and choose where it goes.</p><p><strong>Monitoring:</strong> none. No one at the clinic can see what you enter, and the app cannot call anyone for you. In an emergency, call 911 or your local emergency number.</p><div class="row"><button type="button" class="btn btn-primary" data-action="goto-export">Share with my clinic</button><button type="button" class="btn" data-action="goto-settings">Appearance, voice, reminders, backup</button></div></section>';
  return h + '</div>';
}

/* ---------- ui state ---------- */
var ui = {
  tab:'today', sub:{track:'episodes', tools:'calm', plan:'pacing', export:'pdf', progress:'trends'}, draftFeel:null, feelStep:1, draftMoment:null, momentStep:1,
  panel:null, draftEp:null, draftTh:null, thStep:1, draftGoal:null, goalForm:false, draftGr:null,
  example:false, confirmDel:null, confirmClear:false, summaryText:null,
  planKind:'activity', lesson:null, learnTopic:null, scrollTop:false, refocus:null,
  exp:{range:28, pdf:true, csv:true, backup:false, reflect:false, moments:false, busy:false, links:null}, importMsg:'',
  celebrate:[], welcomeBack:false, remindTime:'09:00', remindLinks:null,
  setupStep:0, draftSetup:{presentation:[], difficulties:[], matters:'', goal:''}, goalDetail:null, fgoalForm:false, draftFgoal:null, draftAttempt:null, patternSel:[], reflectOpen:false
};
var timers = { loop:null, ex:null, wl:null, raf:null };
try { if (window.speechSynthesis) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = function(){ voiceCache = null; }; } } catch(e){}
function stopTimers(){
  if (timers.loop){ clearInterval(timers.loop); timers.loop = null; }
  if (timers.ex){ clearInterval(timers.ex); timers.ex = null; }
  if (timers.raf){ try { cancelAnimationFrame(timers.raf); } catch(e){} timers.raf = null; }
  /* The tone keeps playing across a redraw while its own session is still running, and stops the moment it is not. */
  var bp = ui.panel;
  if (!(bp && bp.type === 'move' && bp.id === 'walk' && bp.metro)) stopMetro();
  stopBird();
  if (!(bp && bp.type === 'shift' && bp.running)) stopNature();
  if (!(bp && bp.type === 'bls' && bp.running && bp.mode === 'sound') && !metroRunning()) stopTone();
  if (timers.wl){ try { timers.wl.release(); } catch(e){} timers.wl = null; }
}

/* ---------- small view helpers ---------- */
function seg(group, items, cur){
  return '<div class="seg" role="tablist">' + items.map(function(i){
    return '<button type="button" role="tab" aria-selected="' + (cur === i[0]) + '" data-action="sub" data-group="' + group + '" data-val="' + i[0] + '">' + esc(i[1]) + '</button>';
  }).join('') + '</div>';
}
function chipGroup(draft, field, opts, sel){
  return '<div class="chips" role="group">' + opts.map(function(o){
    var v = Array.isArray(o) ? o[0] : o;
    var on = (sel || []).indexOf(v) > -1;
    return '<button type="button" class="chip" aria-pressed="' + on + '" data-action="chip" data-draft="' + draft + '" data-field="' + field + '" data-val="' + esc(v) + '">' + esc(v) + '</button>';
  }).join('') + '</div>';
}
function radioGroup(draft, field, opts, cur){
  return '<div class="chips" role="group">' + opts.map(function(v){
    return '<button type="button" class="chip chip-radio" aria-pressed="' + (cur === v) + '" data-action="radio" data-draft="' + draft + '" data-field="' + field + '" data-val="' + esc(v) + '">' + esc(v) + '</button>';
  }).join('') + '</div>';
}
function scaleButtons(draft, field, min, max, cur, small){
  var b = '', n = max - min + 1, cls = n === 11 ? 'scale-11' : n <= 3 ? 'scale-3' : '';
  for (var i = min; i <= max; i++) b += '<button type="button" class="sc ' + (small ? 'sc-s' : '') + '" aria-pressed="' + (cur === i) + '" data-action="scalepick" data-draft="' + draft + '" data-field="' + field + '" data-val="' + i + '">' + i + '</button>';
  return '<div class="scale ' + cls + '" role="group">' + b + '</div>';
}
function backBtn(action, label){
  return '<div><button type="button" class="btn btn-quiet" data-action="' + action + '">' + esc(label || 'Back') + '</button></div>';
}
function rangeField(draft, field, label, min, max, val, suffix){
  return '<div class="field"><div class="lbl-row"><label class="lbl" for="f-' + field + '">' + esc(label) + '</label><output class="val" data-out="' + field + '">' + val + suffix + '</output></div>' +
    '<input type="range" id="f-' + field + '" min="' + min + '" max="' + max + '" value="' + val + '" data-draft="' + draft + '" data-field="' + field + '" data-suffix="' + esc(suffix) + '"></div>';
}
function textField(draft, field, label, val, rows, ph){
  return '<div class="field"><label class="lbl" for="f-' + field + '">' + esc(label) + '</label>' +
    '<textarea id="f-' + field + '" rows="' + (rows || 3) + '" placeholder="' + esc(ph || '') + '" data-draft="' + draft + '" data-field="' + field + '">' + esc(val) + '</textarea></div>';
}
function lineField(draft, field, label, val, ph, type){
  return '<div class="field"><label class="lbl" for="f-' + field + '">' + esc(label) + '</label>' +
    '<input type="' + (type || 'text') + '" ' + (type === 'number' ? 'inputmode="numeric" min="0" ' : '') + 'id="f-' + field + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '" data-draft="' + draft + '" data-field="' + field + '"></div>';
}

/* ---------- WELCOME (first run) ---------- */
function viewWelcome(){
  var m = ui.welcomeMode || '', st = ui.setupStep || 0, pr = state.profile, d = ui.draftSetup;
  var h = '<div class="welcome">';
  if (st === 0) {
    return h + logoSvg('mark mark-lg', 'sgw') +
      '<div><p class="eyebrow">Welcome to</p><h1>Steady Ground</h1></div>' +
      '<p>Support for living with functional neurological disorder: help in the moment, small real-world steps, and short topics to read and reflect on at your own pace. Everything you enter stays on this phone until you choose to share it with your clinic.</p>' +
      '<div class="stack-s">' +
      '<button type="button" class="optbtn" aria-pressed="' + (m === 'course') + '" data-action="welcome-pick" data-val="course"><span class="t">I am working with a clinician</span><span class="meta">Use the app alongside your treatment, and bring what you notice to your appointments.</span></button>' +
      '<button type="button" class="optbtn" aria-pressed="' + (m === 'tools') + '" data-action="welcome-pick" data-val="tools"><span class="t">I am using it on my own</span><span class="meta">Tools for symptoms, a first real-world goal, and topics to read whenever you want.</span></button>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-wide" data-action="setup-next" ' + (m ? '' : 'disabled') + '>Continue</button>' +
      '<p class="hint">Everything you enter is saved on this phone only and is not monitored by anyone. This app supports your care. It does not replace your clinical team. Call 911 or your local emergency number for chest pain, new weakness on one side, new trouble speaking or seeing, a severe headache, an injury, or a seizure that does not stop.</p></div>';
  }
  h += '<p class="eyebrow">Set-up, step ' + st + ' of 3</p>';
  if (st === 1) {
    h += '<h1>How does your FND show up?</h1><p class="hint">Pick everything that applies. The app uses this to choose which tools to offer first. You can change it later under Me.</p>' + chipGroup('setup','presentation',PRESENTATIONS.map(function(p){ return p[1]; }),d.presentation) +
         '<div class="row"><button type="button" class="btn btn-quiet" data-action="setup-back">Back</button><button type="button" class="btn btn-primary" data-action="setup-next">Next</button></div>';
  } else if (st === 2) {
    h += '<h1>What gets in the way most?</h1>' + chipGroup('setup','difficulties',DIFFICULTIES,d.difficulties) +
         textField('setup','matters','If symptoms got in the way less, what would you be doing?',d.matters,3,'For example: walking to the shops on my own, seeing friends, going back to work two days a week') +
         '<div class="row"><button type="button" class="btn btn-quiet" data-action="setup-back">Back</button><button type="button" class="btn btn-primary" data-action="setup-next">Next</button></div>';
  } else {
    h += '<h1>One real-world goal to start</h1><p class="hint">Something you have been avoiding or want back, small enough to try this week. The app will help you break it into steps. Optional; you can add goals any time.</p>' +
         lineField('setup','goal','My first goal',d.goal,goalIdeas(d.presentation)[0] || 'Walk to the end of the street') +
         '<div class="chips">' + goalIdeas(d.presentation).map(function(g){ return '<button type="button" class="chip" data-action="setup-idea" data-val="' + esc(g) + '">' + esc(g) + '</button>'; }).join('') + '</div>' +
         '<div class="row"><button type="button" class="btn btn-quiet" data-action="setup-back">Back</button><button type="button" class="btn btn-primary" data-action="welcome-go">Finish set-up</button></div>';
  }
  return h + '</div>';
}
var PRESENTATIONS = [['seizure','Seizure-like episodes'],['movement','Weakness, tremor or walking'],['sensory','Numbness, pain or tingling'],['speech','Speech or swallowing'],['cognitive','Brain fog or memory'],['fatigue','Fatigue'],['dizzy','Dizziness'],['unsure','Not sure or mixed']];
var DIFFICULTIES = ['Avoiding places or activities','Boom and bust','Checking my symptoms','Worry and dread','Low mood','Sleep','Relationships','Confidence','Work or study'];
function presKeys(){ var names = state.profile.presentation || []; return PRESENTATIONS.filter(function(p){ return names.indexOf(p[1]) > -1; }).map(function(p){ return p[0]; }); }
function goalIdeas(presNames){
  var names = presNames || state.profile.presentation || [], keys = PRESENTATIONS.filter(function(p){ return names.indexOf(p[1]) > -1; }).map(function(p){ return p[0]; });
  var ideas = [];
  if (keys.indexOf('movement') > -1 || keys.indexOf('dizzy') > -1) ideas.push('Walk outside on my own for 10 minutes');
  if (keys.indexOf('seizure') > -1) ideas.push('Go to a cafe with a friend for half an hour');
  if (keys.indexOf('fatigue') > -1) ideas.push('Cook one simple meal without crashing after');
  if (keys.indexOf('cognitive') > -1) ideas.push('Read for 15 minutes a day');
  if (keys.indexOf('speech') > -1) ideas.push('Make one phone call I have been putting off');
  if (keys.indexOf('sensory') > -1) ideas.push('Take a short bus ride');
  ideas.push('Meet a friend outside the house', 'Do one shop on my own');
  return ideas.slice(0, 4);
}
function toolkitFor(){
  var keys = presKeys(), list = [], seen = {};
  function add(type, why, extra){ var id = type + (extra ? ':' + extra : ''); if (seen[id]) return; seen[id] = 1; list.push({ type:type, why:why, extra:extra }); }
  keys.forEach(function(k){
    if (k === 'seizure') { add('ground', 'Bring attention to the room at the first warning sign'); add('breath', 'A longer breath out settles the alarm'); add('feel', 'Name what is building before it builds'); }
    if (k === 'movement') { add('shift', 'Give your attention a job so the movement can run on its own'); add('move', 'Rhythm walking lets your legs move without being watched', 'walk'); add('breath', 'Slow the body first'); }
    if (k === 'sensory') { add('ground', 'Senses outward, not inward'); add('scan', 'Notice without fighting the sensation'); add('breath', 'Steady the breath'); }
    if (k === 'speech') { add('breath', 'A slow breath out before you speak'); add('shift', 'Hum or sing a line; speech often follows'); add('ground', 'Back to the room'); }
    if (k === 'cognitive') { add('shift', 'One small mental task, then rest'); add('scan', 'Find where the tension sits'); add('pace', 'Fog is often a pacing signal: do less, sooner'); }
    if (k === 'fatigue') { add('pace', 'Rest before you need it, then a small step'); add('breath', 'Two minutes of slow breathing'); add('move', 'Gentle seated movement keeps the system going', 'march'); }
    if (k === 'dizzy') { add('ground', 'Press your feet into the floor and name five things'); add('breath', 'Even breathing, in 4 and out 4', '4-4'); add('scan', 'Notice without bracing'); }
  });
  if (!list.length) { add('breath', 'Slow the body down first'); add('ground', 'Bring attention back to the room'); add('shift', 'Give your mind a different job'); }
  return list.slice(0, 4);
}
function pinInfo(k){
  if (k === 'feel') return { label:'Name the feeling', action:'feel-new', attrs:'' };
  if (k === 'moment') return { label:'Unpack a moment', action:'moment-new', attrs:'' };
  if (k === 'pattern') return { label:'Understand a pattern', action:'goto-pattern', attrs:'' };
  if (k === 'urges') return { label:'Urges and opposite action', action:'panel', attrs:' data-type="urges"' };
  if (k.indexOf('move:') === 0) { var x = findEx(k.slice(5)); return x ? { label:x.name, action:'panel', attrs:' data-type="move" data-id="' + x.id + '"' } : null; }
  if (TOOL_NAMES[k]) return { label:TOOL_NAMES[k], action:'open-tool', attrs:' data-type="' + k + '"' };
  return null;
}
/* Read aloud uses the phone's own speech, so the app cannot install a voice of its own.
   What it can do is choose well: the default is the most natural-sounding woman's voice
   the phone offers, and the picker in settings lets anyone change it. Both iPhone and
   Android offer better voices as a free download, which the settings card explains. */
var VOICE_FEMALE = ['samantha','ava','allison','susan','zoe','serena','karen','moira','tessa','fiona','nicky','joelle','kate','stephanie','martha','catherine','clara','libby','sonia','natasha','aria','jenny','michelle','emma','amy','zira','hazel','eva','linda','heera','female','woman'];
var VOICE_MALE = ['david','mark','daniel','alex','fred','thomas','oliver','ryan','guy','aaron','george','james','william','arthur','brian','male','man'];
var VOICE_NOVELTY = ['albert','jester','organ','bells','boing','bubbles','cellos','deranged','good news','bad news','pipe','trinoids','whisper','wobble','zarvox','junior','ralph','bahh','grandma','grandpa','rocko','shelley','eddy','flo','reed','sandy','superstar','espeak','pico','compact'];
var VOICE_RICH = ['natural','neural','premium','enhanced','online','siri','google'];
var voiceCache = null;
function allVoices(){
  try { return (window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || []; } catch(e){ return []; }
}
function englishVoices(){
  return allVoices().filter(function(v){ return /^en/i.test(v.lang || ''); });
}
function voiceScore(v){
  var n = (v.name || '').toLowerCase(), s = 0, i;
  for (i = 0; i < VOICE_NOVELTY.length; i++) if (n.indexOf(VOICE_NOVELTY[i]) > -1) s -= 120;
  for (i = 0; i < VOICE_MALE.length; i++) if (n.indexOf(VOICE_MALE[i]) > -1) { s -= 70; break; }
  for (i = 0; i < VOICE_FEMALE.length; i++) if (n.indexOf(VOICE_FEMALE[i]) > -1) { s += 70; break; }
  for (i = 0; i < VOICE_RICH.length; i++) if (n.indexOf(VOICE_RICH[i]) > -1) s += 9;
  var lang = (v.lang || '').toLowerCase().replace('_', '-');
  if (lang === 'en-ca') s += 12; else if (lang === 'en-gb') s += 10; else if (lang === 'en-us') s += 8; else s += 2;
  if (v.localService) s += 20;
  if (v['default']) s += 2;
  return s;
}
function sortedVoices(){
  return englishVoices().slice().sort(function(a, b){ return voiceScore(b) - voiceScore(a); });
}
function pickVoice(){
  var list = englishVoices(); if (!list.length) return null;
  var want = state.prefs && state.prefs.voice, i;
  if (want) { for (i = 0; i < list.length; i++) if (list[i].voiceURI === want) return list[i]; }
  if (voiceCache) { for (i = 0; i < list.length; i++) if (list[i].voiceURI === voiceCache) return list[i]; }
  var best = sortedVoices()[0];
  if (best) voiceCache = best.voiceURI;
  return best || null;
}
/* A voice the phone keeps on itself is one it can definitely speak with; the ones it
   would have to fetch are the ones that go quiet. */
function setReadLabel(on){
  var bs = document.querySelectorAll('[data-action="read-aloud"]');
  for (var i = 0; i < bs.length; i++) bs[i].textContent = on ? 'Stop reading' : 'Read aloud';
}
function stopReading(){
  ui.speaking = false;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e){}
  setReadLabel(false);
}
/* Browsers cut a long utterance off part way through, so the text goes out a sentence or
   two at a time and each piece queues the next. */
/* Phones list voices they cannot always play: on an iPhone the Enhanced and Premium
   entries appear in the list whether or not they have been downloaded, and asking for
   one that is not there produces silence with no error at all. So the first piece is
   watched, and if nothing has begun shortly after asking, the whole thing is tried
   again on whatever voice the phone uses by default, which always speaks. */
function speakText(text, voice, done){
  var synth = window.speechSynthesis;
  var parts = text.match(/[^.!?]+[.!?]*\s*/g) || [text], chunks = [], cur = '';
  parts.forEach(function(p){
    if (cur && (cur + p).length > 170) { chunks.push(cur.trim()); cur = p; } else cur += p;
  });
  if (cur.trim()) chunks.push(cur.trim());
  if (!chunks.length) { if (done) done(); return; }
  var i = 0, pick = voice, began = false, guard = null, retried = false;
  function giveUp(){
    clearTimeout(guard); stopReading();
    toast('Read aloud did not start. Check the side switch and the volume.');
  }
  function fallback(){
    if (!ui.speaking || began) return;
    clearTimeout(guard);
    if (retried || !pick) { giveUp(); return; }
    /* The chosen voice stayed silent, so drop back to the phone's own. */
    retried = true; pick = null; i = 0;
    try { synth.cancel(); } catch(e){}
    say();
  }
  function say(){
    if (!ui.speaking) return;
    if (i >= chunks.length) { clearTimeout(guard); if (done) done(); return; }
    var u = new SpeechSynthesisUtterance(chunks[i]);
    if (pick) { try { u.voice = pick; if (pick.lang) u.lang = pick.lang; } catch(e){} }
    u.rate = 0.92; u.pitch = 1.02;
    u.onstart = function(){ began = true; clearTimeout(guard); };
    u.onend = function(){ began = true; clearTimeout(guard); i++; say(); };
    u.onerror = function(){ if (began) { stopReading(); } else fallback(); };
    try { synth.resume(); } catch(e){}
    try { synth.speak(u); } catch(e){ fallback(); return; }
    if (i === 0 && !began) { clearTimeout(guard); guard = setTimeout(fallback, 1500); }
  }
  say();
}
function readAloud(id){
  try {
    var el = document.getElementById(id);
    if (!el || !window.speechSynthesis) { toast('Read aloud is not available on this phone'); return; }
    if (ui.speaking) {
      /* A voice that went quiet without ever ending leaves the flag set, and every later
         tap would then only switch it off again. Trust the engine over the flag. */
      var busy = false; try { busy = window.speechSynthesis.speaking || window.speechSynthesis.pending; } catch(e){}
      if (busy) { stopReading(); return; }
      ui.speaking = false; setReadLabel(false);
    }
    var text = el.textContent.replace(/\s+/g, ' ').trim(); if (!text) return;
    try { window.speechSynthesis.cancel(); } catch(e){}
    ui.speaking = true; setReadLabel(true);
    speakText(text, pickVoice(), function(){ stopReading(); });
  } catch(e){}
}
function testVoice(){
  try {
    if (!window.speechSynthesis) { toast('Read aloud is not available on this phone'); return; }
    stopReading();
    ui.speaking = true;
    speakText('This is the voice that will read the app to you. Take a slow breath, and let your shoulders drop.', pickVoice(), function(){ stopReading(); });
  } catch(e){}
}
function voiceCard(){
  var list = sortedVoices(), cur = pickVoice();
  var h = '<section class="card"><h2>Read aloud</h2>';
  if (!list.length) {
    return h + '<p class="hint">Your phone has not offered the app any voices yet. Tap a Read aloud button once anywhere in the app, then come back here to choose one.</p></section>';
  }
  h += '<div class="field"><label class="lbl" for="voicePick">Voice</label>' +
       '<select id="voicePick" data-voice-pick="1">' +
       list.map(function(v){
         return '<option value="' + esc(v.voiceURI) + '"' + (cur && v.voiceURI === cur.voiceURI ? ' selected' : '') + '>' + esc(v.name) + '</option>';
       }).join('') + '</select></div>' +
       '<div class="row"><button type="button" class="btn" data-action="voice-test">Hear this voice</button>' +
       (state.prefs.voice ? '<button type="button" class="btn btn-quiet" data-action="voice-auto">Use the suggested voice</button>' : '') + '</div>';
  h += '<p class="hint">Voices come from your phone, not from the app, so the choice here is whatever your phone has. If they all sound flat, your phone can download a better one for free: on iPhone, Settings, then Accessibility, then Spoken Content, then Voices. On Android, Settings, then Accessibility, then Text-to-speech.</p></section>';
  return h;
}
var TOOL_LABELS = { breath:'Paced breathing', ground:'5-4-3-2-1 grounding', shift:'Shifting attention', feel:'Name the feeling', moment:'Unpack a moment', scan:'Body scan', move:'Movement', bls:'Side to side', pace:'Pacing: rest, then a small step' };
function viewToolkit(){ return '<div class="stack">' + backBtn('goto-today', 'Back') + toolkitBody() + '</div>'; }
function toolkitBody(){
  var kit = toolkitFor(), f = state.flare, helps = topCounts(state.episodes, 'helped', 3);
  var h = '<div><p class="eyebrow">Help right now</p><h2 style="font-size:24px">One thing, two minutes</h2><p class="hint">Chosen for how your FND shows up. Pick whichever feels doable. You can stop at any point.</p></div>';
  h += '<div class="stack-s">' + kit.map(function(t){
    var label = t.type === 'move' ? (findEx(t.extra) || {}).name || 'Movement' : TOOL_LABELS[t.type];
    var action = t.type === 'feel' ? 'feel-new' : t.type === 'pace' ? 'goto-plan-pacing' : t.type === 'move' ? 'panel' : 'open-tool';
    var attrs = t.type === 'move' ? ' data-type="move" data-id="' + t.extra + '"' : t.type === 'feel' || t.type === 'pace' ? '' : ' data-type="' + t.type + '"' + (t.extra ? ' data-pace="' + t.extra + '"' : '');
    return '<button type="button" class="tool-btn" data-action="' + action + '"' + attrs + '><span class="t">' + esc(label) + '</span><span class="meta">' + esc(t.why) + '</span></button>';
  }).join('') + '</div>';
  if (f.helps || helps.length) h += '<section class="card card-good"><h2>What has helped you before</h2>' + (f.helps ? '<p>' + esc(f.helps) + '</p>' : '') + (helps.length ? '<p class="meta">From your log: ' + esc(joinList(helps.map(function(x){ return x[0].toLowerCase(); }))) + '.</p>' : '') + '</section>';
  h += '<section class="card"><p class="hint">Afterwards, if you want to, note it in your symptom log. Logging is optional; the tool comes first.</p><div><button type="button" class="btn btn-quiet" data-action="goto-track" data-sub="episodes">Open symptom log</button></div></section>';
  h += '<section class="card card-alert"><p class="hint">This app is not monitored and cannot call anyone for you. Call 911 for chest pain, new weakness on one side, new trouble speaking or seeing, a severe headache, an injury, or a seizure that does not stop.</p></section>';
  return h;
}

/* ---------- functional goals (real-world steps) ---------- */
function currentGoal(){ return state.fgoals.filter(function(g){ return !g.done; })[0] || null; }
function nextStep(g){ return (g.steps || []).filter(function(s){ return !s.done; })[0] || null; }
function attemptsIn(g, days){ var set = {}; lastDays(days).forEach(function(d){ set[d] = 1; }); return (g.attempts || []).filter(function(a){ return set[dayKey(a.ts)]; }); }
function allAttempts(){ var out = []; state.fgoals.forEach(function(g){ (g.attempts || []).forEach(function(a){ out.push({ ts:a.ts, goal:g, a:a }); }); }); return out; }
function newGoalDraft(){ return { name:'', why:'', steps:['','',''] }; }
function makeGoal(name, why, steps){ return { id:uid(), name:name, why:why || '', created:Date.now(), done:false, doneTs:0, steps:(steps || []).map(function(t){ return { id:uid(), text:t, done:false }; }), attempts:[] }; }
function viewGoals(){
  var h = '';
  if (ui.goalDetail) { var g = byId(state.fgoals, ui.goalDetail); if (g) return viewGoalDetail(g); ui.goalDetail = null; }
  h += '<section class="card"><h2>Real-world goals</h2><p class="hint">Things you have been avoiding or want back. Break each into small steps, try a step, and record what happened. Progress here is the point of the whole programme.</p></section>';
  if (ui.fgoalForm) {
    var d = ui.draftFgoal;
    h += '<section class="card"><h2>New goal</h2>' + lineField('fgoal','name','The goal',d.name,'For example: walk to the shops on my own') + textField('fgoal','why','Why it matters to me',d.why,2,'Optional') +
      '<p class="lbl">Small steps toward it</p><p class="hint">Start with something you could try this week. Three steps is plenty to begin; you can add more later.</p>' +
      d.steps.map(function(s, i){ return '<input type="text" aria-label="Step ' + (i+1) + '" placeholder="Step ' + (i+1) + (i === 0 ? ': the easiest version' : '') + '" value="' + esc(s) + '" data-draft="fgoal" data-field="step' + i + '">'; }).join('') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="fgoal-save">Save goal</button><button type="button" class="btn btn-quiet" data-action="fgoal-cancel">Cancel</button></div></section>';
  } else {
    h += '<div><button type="button" class="btn btn-primary" data-action="fgoal-new">Add a goal</button></div>';
  }
  state.fgoals.forEach(function(g){
    var stepsDone = g.steps.filter(function(s){ return s.done; }).length, pct = g.steps.length ? Math.round(stepsDone / g.steps.length * 100) : 0, n7 = attemptsIn(g, 7).length;
    h += '<button type="button" class="tool-btn" data-action="fgoal-open" data-id="' + g.id + '"><span class="item-head"><span class="t">' + esc(g.name) + '</span>' + (g.done ? '<span class="pill pill-good">Reached</span>' : '') + '</span><span class="bar" aria-hidden="true"><span style="width:' + pct + '%"></span></span><span class="meta">' + stepsDone + ' of ' + g.steps.length + ' steps, ' + n7 + ' ' + (n7 === 1 ? 'try' : 'tries') + ' this week</span></button>';
  });
  if (!state.fgoals.length && !ui.fgoalForm) h += '<section class="card"><p class="hint">No goals yet. Ideas for you: ' + esc(goalIdeas().join('; ')) + '.</p></section>';
  return h;
}
function viewGoalDetail(g){
  var ns = nextStep(g), d = ui.draftAttempt, att = (g.attempts || []).slice().sort(function(a,b){ return b.ts - a.ts; });
  var h = backBtn('fgoal-close', 'All goals') + '<div><h2>' + esc(g.name) + '</h2>' + (g.why ? '<p class="hint">' + esc(g.why) + '</p>' : '') + '</div>';
  h += '<section class="card"><h3>Steps</h3><div class="stack-s">' + g.steps.map(function(s){
    return '<div class="plan-row"><button type="button" class="check" aria-pressed="' + !!s.done + '" aria-label="Step done: ' + esc(s.text) + '" data-action="step-toggle" data-goal="' + g.id + '" data-id="' + s.id + '">' + (s.done ? '✓' : '') + '</button><span class="plan-text">' + esc(s.text) + (ns && ns.id === s.id ? ' <span class="pill">Next</span>' : '') + '</span></div>';
  }).join('') + '</div><div class="row"><input type="text" id="stepText" placeholder="Add a step" aria-label="New step" style="flex:1; min-width:160px"><button type="button" class="btn" data-action="step-add" data-goal="' + g.id + '">Add</button></div></section>';
  if (d && d.goalId === g.id) {
    h += '<section class="card"><h3>What happened?</h3><div class="field"><span class="lbl">Which step?</span>' + radioGroup('attempt','stepId',g.steps.map(function(s){ return s.text; }),(byId(g.steps, d.stepId) || {}).text || '') + '</div>' +
      '<div class="field"><span class="lbl">How did it go?</span>' + radioGroup('attempt','result',['I did it','I did part of it','I did not manage it today'],d.result) + '</div>' +
      textField('attempt','note','What did you notice?',d.note,2,'Symptoms, thoughts, what helped. A line is enough.') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="attempt-save" data-goal="' + g.id + '">Save</button><button type="button" class="btn btn-quiet" data-action="attempt-cancel">Cancel</button></div></section>';
  } else if (!g.done) {
    h += '<section class="card card-accent"><p class="eyebrow">Next step</p><p class="bigtext">' + esc(ns ? ns.text : 'All steps done. Is the goal reached?') + '</p><div class="row">' + (ns ? '<button type="button" class="btn btn-primary" data-action="attempt-new" data-goal="' + g.id + '">I tried it</button>' : '') + '<button type="button" class="btn" data-action="fgoal-reached" data-goal="' + g.id + '">Goal reached</button></div></section>';
  }
  if (att.length) h += '<section class="card"><h3>Tries</h3><ul class="list">' + att.slice(0, 20).map(function(a){ var s = byId(g.steps, a.stepId); return '<li class="item"><div class="item-head"><strong>' + esc(s ? s.text : 'Step') + '</strong><span class="pill ' + (a.result === 'did' ? 'pill-good' : a.result === 'part' ? '' : 'pill-warn') + '">' + ({did:'Did it', part:'Part of it', not:'Not today'})[a.result] + '</span></div><div class="meta">' + esc(fmtWhen(a.ts)) + '</div>' + (a.note ? '<div>' + esc(a.note) + '</div>' : '') + '</li>'; }).join('') + '</ul></section>';
  h += '<div><button type="button" class="link link-danger" data-action="fgoal-del" data-id="' + g.id + '">' + (ui.confirmDel === 'fgoal:' + g.id ? 'Tap again to remove this goal' : 'Remove goal') + '</button></div>';
  return h;
}

/* ---------- pattern check (interactive) ---------- */
var PATTERNS = [
  ['avoid','I avoided something', 'Avoidance brings relief now and keeps the fear for later. The way through is a smaller version of the thing, not a bigger push.', 'Add it as a step on a goal', 'goto-plan-goals'],
  ['crash','I pushed through and crashed', 'Boom and bust: a good day spent at full speed, then days lost. The fix is a steady amount you can repeat tomorrow.', 'Check my steady amount', 'goto-plan-pacing'],
  ['check','I kept checking my symptoms', 'Attention on the symptom turns the volume up. Attention elsewhere lets the system settle.', 'Shift my attention now', 'open-tool:shift'],
  ['reassure','I looked for reassurance', 'Reassurance eases worry for an hour and feeds it for a week. Try tolerating the not-knowing for a short while instead.', 'Name the feeling under it', 'feel-new'],
  ['cancel','I cancelled on people', 'Pulling back is understandable and it shrinks the world. One small contact keeps the door open.', 'Message someone today', 'goto-plan'],
  ['bed','I stayed in bed or on the sofa longer than I meant to', 'Rest you did not plan tends to be a crash, not recovery. Planned rest, then one gentle thing.', 'Plan one activity and one rest', 'goto-plan'],
  ['none','None of these today', 'Good. Notice what you did instead; that is the pattern worth keeping.', 'Note what went well', 'reflect-open']
];
function viewPattern(){
  var sel = ui.patternSel || [], picked = PATTERNS.filter(function(p){ return sel.indexOf(p[1]) > -1; });
  var h = '<div class="stack">' + backBtn('goto-today', 'Back') + '<div><p class="eyebrow">Understand a pattern</p><h1>Which of these happened recently?</h1><p class="hint">A one-minute check. Patterns are not failures; they are the things the course teaches you to change.</p></div>';
  h += '<div class="chips" role="group">' + PATTERNS.map(function(p){ return '<button type="button" class="chip" aria-pressed="' + (sel.indexOf(p[1]) > -1) + '" data-action="pattern-pick" data-val="' + esc(p[1]) + '">' + esc(p[1]) + '</button>'; }).join('') + '</div>';
  if (picked.length) {
    h += picked.map(function(p){
      var act = p[4].split(':'), attrs = act[1] ? ' data-type="' + act[1] + '"' : '';
      return '<section class="card card-accent"><h2>' + esc(p[1]) + '</h2><p>' + esc(p[2]) + '</p><div><button type="button" class="btn btn-primary" data-action="pattern-go" data-next="' + act[0] + '"' + attrs + '>' + esc(p[3]) + '</button></div></section>';
    }).join('');
    h += '<div><button type="button" class="btn btn-quiet" data-action="pattern-save">Save and close</button></div>';
  }
  h += '<section class="card"><p class="eyebrow">Go deeper</p><p>The Learn topics explain why patterns like these build up, and what tends to loosen them.</p><div><button type="button" class="btn" data-action="goto-learn">Open Learn</button></div></section>';
  return h + '</div>';
}

/* ---------- TODAY (need-first) ---------- */
function weekFeedback(){
  var wk = lastDays(7), prev = []; for (var i = 13; i >= 7; i--) prev.push(dayKey(addDays(new Date(), -i)));
  function inSet(set, ts){ return set.indexOf(dayKey(ts)) > -1; }
  var tries = allAttempts().filter(function(x){ return inSet(wk, x.ts); }), triesPrev = allAttempts().filter(function(x){ return inSet(prev, x.ts); });
  var did = tries.filter(function(x){ return x.a.result !== 'not'; }).length;
  var planned = 0, plannedDone = 0; wk.forEach(function(d){ (state.plan[d] || []).forEach(function(i){ planned++; if (i.done) plannedDone++; }); });
  var calm = state.grounding.filter(function(g){ return inSet(wk, g.ts); }).length, calmPrev = state.grounding.filter(function(g){ return inSet(prev, g.ts); }).length;
  var eps = state.episodes.filter(function(e){ return inSet(wk, e.ts); }).length;
  var lines = [];
  if (tries.length) lines.push('You tried a real-world step ' + tries.length + ' ' + (tries.length === 1 ? 'time' : 'times') + ' this week' + (did ? ' and managed all or part of it ' + did + ' ' + (did === 1 ? 'time' : 'times') : '') + (eps ? ', despite ' + eps + ' ' + (eps === 1 ? 'episode' : 'episodes') : '') + '.');
  else if (triesPrev.length) lines.push('No real-world tries yet this week. Last week you made ' + triesPrev.length + '. One small step would restart it.');
  if (planned) lines.push('You completed ' + plannedDone + ' of ' + planned + ' planned activities.');
  if (calm) lines.push(calm + ' calming ' + (calm === 1 ? 'practice' : 'practices') + (calmPrev ? ' (' + calmPrev + ' last week)' : '') + '.');
  var distinct = {}; state.grounding.forEach(function(g){ if (inSet(wk, g.ts)) distinct[g.skill] = 1; });
  if (Object.keys(distinct).length >= 2) lines.push('You used ' + Object.keys(distinct).length + ' different calming skills.');
  if (!lines.length) lines.push('Nothing logged yet this week. Whatever you do next counts.');
  return lines;
}
function viewToday(){
  var k = dayKey(new Date()), ci = state.checkins[k] || {}, g = currentGoal(), ns = g ? nextStep(g) : null, lp = learnProgress();
  var MOOD = ['','Very low','Low','Okay','Good','Very good'], ENERGY = ['','Drained','Low','Okay','Good','High'];
  function scale(kind, label, words){
    var cur = ci[kind] || 0, b = '';
    for (var i = 1; i <= 5; i++) b += '<button type="button" class="sc sc-s" aria-pressed="' + (cur === i) + '" aria-label="' + i + ', ' + words[i] + '" data-action="checkin" data-kind="' + kind + '" data-val="' + i + '">' + i + '</button>';
    return '<div class="field"><div class="lbl-row"><span class="lbl">' + label + '</span><span class="val">' + (cur ? words[cur] : 'Not set') + '</span></div><div class="scale" role="group" aria-label="' + label + '">' + b + '</div></div>';
  }
  var h = '<div class="stack">';
  h += '<section><p class="eyebrow">' + esc(new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})) + '</p><h1>' + greeting() + '</h1></section>';
  if (ui.welcomeBack) h += '<section class="card card-accent"><h2>Welcome back</h2><p>It has been a few days. That is normal, and coming back is itself a recovery skill. Nothing has been lost.</p><div class="row"><button type="button" class="btn btn-primary" data-action="goto-toolkit">Something small now</button><button type="button" class="btn btn-quiet" data-action="wb-dismiss">Thanks</button></div></section>';

  var chev = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  h += '<section><p class="eyebrow">Your recovery space</p><h2 style="font-size:24px">What would help you today?</h2></section>' +
       '<div class="stack-s">' +
       '<button type="button" class="tool-btn door" data-action="goto-toolkit"><span class="t">I need help right now<span class="meta">A strategy that fits how your FND shows up</span></span>' + chev + '</button>' +
       '<button type="button" class="tool-btn door door-soft" data-action="quick-two"><span class="t">I have 2 minutes<span class="meta">Paced breathing, two minutes, then carry on</span></span>' + chev + '</button>' +
       '<button type="button" class="tool-btn door door-soft" data-action="goto-tools"><span class="t">I want to practise<span class="meta">Calming skills, feelings and gentle movement, at your own pace</span></span>' + chev + '</button>' +
       '</div>';
  var pinned = state.pins.map(function(k){ return pinInfo(k); }).filter(Boolean);
  if (pinned.length) h += '<section><p class="eyebrow">Your pinned tools</p><div class="chips">' + pinned.map(function(t){ return '<button type="button" class="chip" data-action="' + t.action + '"' + t.attrs + '>' + esc(t.label) + '</button>'; }).join('') + '</div></section>';
  h += '<section class="card"><div class="item-head"><h2>Reflect on my day</h2>' + (!ui.reflectOpen ? '<button type="button" class="link" data-action="reflect-open">' + (state.wins[k] ? 'Edit' : 'Open') + '</button>' : '') + '</div>' + (!ui.reflectOpen ? '<p class="hint">' + (state.wins[k] ? 'Went well: ' + esc(state.wins[k]) : 'Two taps and one thing that went well.') + '</p></section>' : '');
  if (ui.reflectOpen) {
    h += '<div class="item-head"><span></span><button type="button" class="link" data-action="reflect-close">Close</button></div>' + scale('mood', 'Mood', MOOD) + scale('energy', 'Energy', ENERGY) +
         '<div class="field"><label class="lbl" for="winText">One thing that went well, however small</label><input type="text" id="winText" value="' + esc(state.wins[k] || '') + '" placeholder="I went outside. I rested before I needed to. I asked for help." autocomplete="off"></div><div><button type="button" class="btn btn-primary" data-action="win-save">Save</button></div></section>';
  }

  if (g) {
    var n7 = attemptsIn(g, 7).length, stepsDone = g.steps.filter(function(s){ return s.done; }).length;
    h += '<section class="card"><p class="eyebrow">Your current goal</p><h2>' + esc(g.name) + '</h2><div class="bar" aria-hidden="true"><span style="width:' + (g.steps.length ? Math.round(stepsDone / g.steps.length * 100) : 0) + '%"></span></div>' +
         '<p class="meta">' + stepsDone + ' of ' + g.steps.length + ' steps done. ' + (n7 ? 'You have worked on this ' + n7 + ' ' + (n7 === 1 ? 'time' : 'times') + ' this week.' : 'Not tried yet this week.') + '</p>' +
         (ns ? '<p><strong>Next step:</strong> ' + esc(ns.text) + '</p><div class="row"><button type="button" class="btn btn-primary" data-action="attempt-new" data-goal="' + g.id + '">I tried it</button><button type="button" class="btn btn-quiet" data-action="fgoal-open" data-id="' + g.id + '">Open goal</button></div>' : '<div><button type="button" class="btn" data-action="fgoal-open" data-id="' + g.id + '">Open goal</button></div>') + '</section>';
  }

  if (!g) h += '<section class="card"><p class="eyebrow">Real-world goal</p><p>Something you have been avoiding or want back, broken into small steps.</p><div><button type="button" class="btn" data-action="goto-plan-goals">Set a goal</button></div></section>';
  h += '<section class="card"><h2>This week</h2>' + weekFeedback().map(function(l){ return '<p>' + esc(l) + '</p>'; }).join('') + '<div><button type="button" class="link" data-action="goto-progress">See my progress</button></div></section>';

  var items = state.plan[k] || [], done = items.filter(function(i){ return i.done; }).length;
  if (items.length) {
    h += '<section class="card"><div class="item-head"><h2>Today\'s plan</h2><span class="val">' + done + ' of ' + items.length + ' done</span></div><div class="stack-s">' + items.slice(0,5).map(function(i){
      return '<div class="plan-row"><button type="button" class="check" aria-pressed="' + !!i.done + '" aria-label="Mark done: ' + esc(i.text) + '" data-action="plan-toggle" data-id="' + i.id + '">' + (i.done ? '✓' : '') + '</button><span class="plan-text">' + esc(i.text) + '</span></div>';
    }).join('') + '</div><div><button type="button" class="btn btn-quiet" data-action="goto-plan">Open plan</button></div></section>';
  }

  if (lp.next) {
    h += '<section class="card"><div class="item-head"><h2>Learn</h2><span class="val">' + lp.read + ' of ' + lp.total + ' read</span></div>' +
         '<button type="button" class="learn-row" data-action="learn-open" data-id="' + lp.next.id + '">' + learnArt(lp.next.art, 'thumb') +
         '<span class="learn-row-text"><span class="t">' + esc(lp.next.title) + '</span><span class="meta">' + esc(lp.next.sum) + '</span></span></button></section>';
  }

  h += '<section class="card card-alert"><h2>When to get urgent help</h2>' +
       '<p>This app supports your care and is not monitored by anyone. Call 911 or your local emergency number for chest pain, a new weakness on one side of the body, trouble speaking or seeing that is new for you, a severe headache, an injury, or a seizure that does not stop.</p>' +
       '<p>If you are thinking about harming yourself, call or text 9-8-8 in Canada, or contact your local crisis line.</p></section>';
  if (!canStore) h += '<section class="card"><p class="hint">This browser is not saving entries, so they will be lost when you close this page. Share a report before you leave.</p></section>';
  return h + '</div>';
}

/* ---------- SETTINGS ---------- */
function viewSettings(){
  var h = '<div class="stack">' + backBtn('goto-today', 'Back') + '<h1>Backup and settings</h1>';
  h += '<section class="card"><h2>Appearance</h2><div class="field"><span class="lbl">Theme</span><div class="seg" role="group" aria-label="Theme">' + [['system','Match phone'],['light','Light'],['dark','Dark']].map(function(t){ return '<button type="button" aria-selected="' + ((state.prefs.theme || 'system') === t[0]) + '" data-action="pref-set" data-key="theme" data-val="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>' +
       '<div class="field"><span class="lbl">Text size</span><div class="seg" role="group" aria-label="Text size">' + [['normal','Normal'],['large','Large'],['larger','Largest']].map(function(t){ return '<button type="button" aria-selected="' + (state.prefs.textSize === t[0]) + '" data-action="pref-set" data-key="textSize" data-val="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>' +
       '<div class="plan-row"><button type="button" class="check" aria-pressed="' + !!state.prefs.calm + '" aria-label="Reduce visual stimulation" data-action="pref-toggle" data-key="calm">' + (state.prefs.calm ? '\u2713' : '') + '</button><span class="plan-text">Reduce visual stimulation<br><span class="meta">No animations or completion marks. The breathing circle and the bilateral dot still move, because in those two the movement is the exercise.</span></span></div></section>';
  h += voiceCard();
  h += '<section class="card"><h2>Daily reminder</h2><p class="hint">Phones do not let a web app send notifications, so this adds a repeating event to your calendar instead. Pick a time, then choose Calendar from the share sheet.</p>' +
       '<div class="chips" role="group" aria-label="Reminder time">' + [['09:00','9:00 am'],['12:30','12:30 pm'],['19:00','7:00 pm']].map(function(t){ return '<button type="button" class="chip chip-radio" aria-pressed="' + (ui.remindTime === t[0]) + '" data-action="remind-time" data-val="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
       '<div class="row"><button type="button" class="btn" data-action="remind-make">Add to my calendar</button></div>' +
       (ui.remindLinks ? '<div class="row">' + ui.remindLinks.map(function(l){ return '<a class="btn" href="' + l.url + '" download="' + esc(l.name) + '">' + esc(l.name) + '</a>'; }).join('') + '</div>' : '') +
       '<p class="hint">Or set a repeating alarm in your Clock app named "Steady Ground".</p></section>';
  h += '<section class="card"><h2>Backup</h2><p class="hint">A backup file holds everything in the app. Keep one in your Files app or iCloud Drive. If you get a new phone, restore it here.</p>' +
       '<div class="row"><button type="button" class="btn btn-primary" data-action="backup-share">Save a backup</button></div></section>';
  h += '<section class="card"><h2>Restore</h2><p class="hint">Choose a backup file. This adds its entries to what is already here and skips duplicates.</p>' +
       '<div class="field"><label class="lbl" for="importFile">Backup file</label><input type="file" id="importFile" accept=".json,application/json"></div>' +
       (ui.importMsg ? '<p>' + esc(ui.importMsg) + '</p>' : '') + '</section>';
  h += '<section class="card"><h2>Start over</h2>';
  if (!ui.confirmClear) {
    h += '<div><button type="button" class="link link-danger" data-action="clear-ask">Clear all my data</button></div>';
  } else {
    h += '<p><strong>Remove everything saved here?</strong> This cannot be undone. Save a backup first if you might want it later.</p><div class="row"><button type="button" class="btn btn-danger" data-action="clear-yes">Yes, clear it</button><button type="button" class="btn btn-quiet" data-action="clear-no">Keep my data</button></div>';
  }
  h += '</section>';
  h += '<section class="card"><h2>About</h2><p class="hint">Steady Ground is a self-help companion for people with FND, based on a CBT–DBT psychotherapy workbook. It is general information, not personal medical advice. Your care team knows your situation best.</p>' +
       '<p class="hint">Tip: if you opened this in Safari, add it to your home screen (Share, then Add to Home Screen). The home-screen app keeps its own data, so enter your entries there.</p></section>';
  return h + '</div>';
}

/* ---------- TRACK ---------- */
function newEp(){ return { when: localInput(new Date()), types:[], severity:0, duration:'', durUnit:'min', description:'', location:'', triggers:[], triggerText:'', warnings:[], warningText:'', helped:[], helpedText:'', impactDay:'', impactOthers:'' }; }
function newTh(){ return { situation:'', thought:'', emotions:[], before:60, traps:[], evFor:'', evAgainst:'', balanced:'', after:40 }; }
function newGr(){ return { when: localInput(new Date()), skill:'Paced breathing', before:-1, after:-1, note:'' }; }
var SEV = ['', 'Mild', 'Moderate', 'Severe'];

function viewTrack(){
  var h = '<div class="stack">' + '<h1>Track</h1>' + seg('track', [['episodes','Episodes'],['grounding','Grounding'],['thoughts','Thoughts'],['feelings','Feelings'],['moments','Moments']], ui.sub.track);
  if (ui.sub.track === 'episodes') h += viewEpisodes();
  else if (ui.sub.track === 'grounding') h += viewGrounding();
  else if (ui.sub.track === 'thoughts') h += viewThoughts();
  else if (ui.sub.track === 'moments') h += viewMoments();
  else h += viewFeelings();
  return h + '</div>';
}
function viewFeelings(){
  var h = '<section class="card"><h2>Feelings log</h2><p class="hint">Each time you pause and name a shift in mood, it lands here. Session 3 asks for this on Day 2 and Day 5; you can do it any time.</p><div><button type="button" class="btn btn-primary" data-action="feel-new">Name a feeling</button></div></section>';
  if (!state.feelings.length) return h + '<section class="card"><p class="hint">No feelings logged yet.</p></section>';
  var set = {}; lastDays(14).forEach(function(d){ set[d] = 1; });
  var recent = state.feelings.filter(function(f){ return set[dayKey(f.ts)]; });
  var fams = {}; recent.forEach(function(f){ fams[f.family] = (fams[f.family] || 0) + 1; });
  var top = Object.keys(fams).sort(function(a,b){ return fams[b] - fams[a]; }).slice(0,3);
  var sens = topCounts(recent, 'sensations', 3);
  if (recent.length) h += '<section class="card"><h2>Last 14 days</h2><p>' + recent.length + ' ' + (recent.length === 1 ? 'entry' : 'entries') + '. Most often: ' + esc(top.map(function(k){ var f = familyById(k); return (f ? f.name.toLowerCase() : k) + ' (' + fams[k] + ')'; }).join(', ')) + '.</p>' + (sens.length ? '<p class="meta">Body signals that keep showing up: ' + esc(joinList(sens.map(function(x){ return x[0].toLowerCase(); }))) + '.</p>' : '') + '</section>';
  h += '<section class="card"><h2>Recent</h2><ul class="list">' + state.feelings.slice(0,40).map(function(f){
    var fam = familyById(f.family), confirm = ui.confirmDel === 'feel:' + f.id;
    return '<li class="item"><div class="item-head"><strong>' + esc((fam ? fam.name : 'Feeling') + (f.word ? ': ' + f.word.toLowerCase() : '')) + '</strong><span class="pill">' + f.intensity + '/10</span></div><div class="meta">' + esc(fmtWhen(f.ts)) + '</div>' +
      (f.sensations.length ? '<div><span class="meta">In the body: </span>' + esc(joinList(f.sensations)) + '</div>' : '') +
      (f.urges.length ? '<div><span class="meta">Urge: </span>' + esc(joinList(f.urges)) + '</div>' : '') +
      (f.action ? '<div><span class="meta">Chose: </span>' + esc(f.action) + '</div>' : '') + (f.note ? '<div>' + esc(f.note) + '</div>' : '') +
      '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="feel-del" data-id="' + f.id + '">' + (confirm ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
  }).join('') + '</ul></section>';
  return h;
}

function viewEpisodes(){
  var d = ui.draftEp, h = '';
  if (d) {
    h += '<section class="card"><h2>Symptom log</h2><p class="hint">Fill in what you can. A few words per line is plenty.</p>' +
      '<div class="field"><label class="lbl" for="f-when">When did it start?</label><input type="datetime-local" id="f-when" value="' + esc(d.when) + '" data-draft="ep" data-field="when"></div>' +
      '<div class="field"><span class="lbl">What happened?</span>' + chipGroup('ep','types',SYMPTOMS,d.types) + '</div>' +
      textField('ep','description','Description',d.description,2,'What it looked and felt like') +
      lineField('ep','location','Location in body',d.location,'If applicable') +
      '<div class="field"><div class="lbl-row"><span class="lbl">Severity</span><span class="val">' + (d.severity ? SEV[d.severity] : 'Not set') + '</span></div>' + scaleButtons('ep','severity',1,3,d.severity) + '<div class="anchors"><span>1 mild</span><span>2 moderate</span><span>3 severe</span></div></div>' +
      '<div class="field"><label class="lbl" for="f-duration">How long did it last?</label><div class="row"><input type="number" inputmode="decimal" min="0" id="f-duration" value="' + esc(d.duration) + '" placeholder="Optional" data-draft="ep" data-field="duration" style="flex:1; min-width:120px">' +
        '<div class="seg" style="flex:1; min-width:160px">' + ['sec','min','hr'].map(function(u){ return '<button type="button" aria-selected="' + (d.durUnit === u) + '" data-action="radio" data-draft="ep" data-field="durUnit" data-val="' + u + '">' + ({sec:'seconds',min:'minutes',hr:'hours'})[u] + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="field"><span class="lbl">Triggers</span>' + chipGroup('ep','triggers',TRIGGERS,d.triggers) + '<input type="text" id="f-triggerText" value="' + esc(d.triggerText) + '" placeholder="Anything else?" data-draft="ep" data-field="triggerText" aria-label="Other triggers"></div>' +
      '<div class="field"><span class="lbl">Early warning signs</span>' + chipGroup('ep','warnings',WARNINGS,d.warnings) + '<input type="text" id="f-warningText" value="' + esc(d.warningText) + '" placeholder="Anything else?" data-draft="ep" data-field="warningText" aria-label="Other early warning signs"></div>' +
      '<div class="field"><span class="lbl">Improved with</span>' + chipGroup('ep','helped',HELPS,d.helped) + '<input type="text" id="f-helpedText" value="' + esc(d.helpedText) + '" placeholder="Anything else?" data-draft="ep" data-field="helpedText" aria-label="Other things that helped"></div>' +
      textField('ep','impactDay','Impact on your day',d.impactDay,2,'') +
      textField('ep','impactOthers','Impact on others',d.impactOthers,2,'') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="ep-save">Save episode</button><button type="button" class="btn btn-quiet" data-action="ep-cancel">Cancel</button></div></section>';
    return h;
  }
  h += '<section class="card"><h2>Symptom log</h2><p class="hint">Log each episode or flare in the workbook format. Once it is logged, you can move on with your day.</p><div><button type="button" class="btn btn-primary" data-action="ep-new">Log an episode</button></div></section>';
  h += viewWeekSummary();
  if (!state.episodes.length) {
    h += '<section class="card"><p class="hint">No episodes logged yet.</p></section>';
  } else {
    h += '<section class="card"><h2>Recent</h2><ul class="list">' + state.episodes.slice(0,40).map(function(e){
      var confirm = ui.confirmDel === 'ep:' + e.id;
      var trig = (e.triggers || []).concat(e.triggerText ? [e.triggerText] : []);
      var warn = (e.warnings || []).concat(e.warningText ? [e.warningText] : []);
      var help = (e.helped || []).concat(e.helpedText ? [e.helpedText] : []);
      return '<li class="item"><div class="item-head"><strong>' + esc(joinList(e.types) || e.description || 'Episode') + '</strong>' + (e.severity ? '<span class="pill ' + (e.severity === 3 ? 'pill-alert' : e.severity === 2 ? 'pill-warn' : '') + '">' + SEV[e.severity] + '</span>' : '') + '</div>' +
        '<div class="meta">' + esc(fmtWhen(e.ts)) + (e.duration != null ? ', ' + e.duration + ' ' + (e.durUnit || 'min') : '') + (e.location ? ', ' + esc(e.location) : '') + '</div>' +
        (e.description ? '<div>' + esc(e.description) + '</div>' : '') +
        (trig.length ? '<div><span class="meta">Triggers: </span>' + esc(joinList(trig)) + '</div>' : '') +
        (warn.length ? '<div><span class="meta">Warning signs: </span>' + esc(joinList(warn)) + '</div>' : '') +
        (help.length ? '<div><span class="meta">Improved with: </span>' + esc(joinList(help)) + '</div>' : '') +
        (e.impactDay ? '<div><span class="meta">Impact on day: </span>' + esc(e.impactDay) + '</div>' : '') +
        (e.impactOthers ? '<div><span class="meta">Impact on others: </span>' + esc(e.impactOthers) + '</div>' : '') +
        '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="ep-del" data-id="' + e.id + '">' + (confirm ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
    }).join('') + '</ul></section>';
  }
  return h;
}
function viewWeekSummary(){
  var wk = weekKey(new Date()), w = state.weeks[wk] || {}, days = [], d = parseKey(wk);
  for (var i = 0; i < 7; i++) days.push(dayKey(addDays(d, i)));
  var eps = state.episodes.filter(function(e){ return days.indexOf(dayKey(e.ts)) > -1; });
  var top = topCounts(eps.map(function(e){ return { t: (e.triggers || []).concat(e.triggerText ? [e.triggerText] : []) }; }), 't', 1);
  return '<section class="card"><div class="item-head"><h2>Weekly summary</h2><span class="val">week of ' + esc(fmtDay(wk)) + '</span></div>' +
    '<dl class="kv"><dt>Episodes this week</dt><dd>' + eps.length + '</dd><dt>Most common trigger</dt><dd>' + (top.length ? esc(top[0][0]) : 'none logged') + '</dd></dl>' +
    '<div class="field"><span class="lbl">Did you recognise early warning signs?</span>' + radioGroup('week','signs',['Yes','No'],w.signs || '') + '</div>' +
    '<div class="field"><span class="lbl">Were you able to shorten or stop any episodes?</span>' + radioGroup('week','stopped',['Yes','No'],w.stopped || '') + '</div>' +
    '<div class="field"><div class="lbl-row"><span class="lbl">Overall functioning this week</span><span class="val">' + (w.functioning != null ? w.functioning + ' / 10' : 'Not set') + '</span></div>' + scaleButtons('week','functioning',0,10,w.functioning != null ? w.functioning : -1, true) + '</div>' +
    textField('week','notes','Additional significant information',w.notes || '',2,'') + '</section>';
}

function viewGrounding(){
  var d = ui.draftGr, h = '';
  if (d) {
    h += '<section class="card"><h2>Grounding activity record</h2>' +
      '<div class="field"><label class="lbl" for="f-when">Date and time</label><input type="datetime-local" id="f-when" value="' + esc(d.when) + '" data-draft="gr" data-field="when"></div>' +
      '<div class="field"><span class="lbl">What grounding skill did you use?</span>' + radioGroup('gr','skill',SKILLS,d.skill) + '</div>' +
      '<div class="field"><div class="lbl-row"><span class="lbl">Stress level before</span><span class="val">' + (d.before >= 0 ? d.before + ' / 10' : 'Not set') + '</span></div>' + scaleButtons('gr','before',0,10,d.before,true) + '</div>' +
      '<div class="field"><div class="lbl-row"><span class="lbl">Stress level after</span><span class="val">' + (d.after >= 0 ? d.after + ' / 10' : 'Not set') + '</span></div>' + scaleButtons('gr','after',0,10,d.after,true) + '</div>' +
      textField('gr','note','Notes',d.note,2,'Optional') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="gr-save">Save record</button><button type="button" class="btn btn-quiet" data-action="gr-cancel">Cancel</button></div></section>';
    return h;
  }
  h += '<section class="card"><h2>Grounding activity record</h2><p class="hint">The workbook asks you to practise a grounding skill at least once a day, at the first sign of symptoms, and before stressful events. Using a tool in the Tools tab adds a record automatically; you can also add one by hand.</p>' +
       '<div class="row"><button type="button" class="btn btn-primary" data-action="gr-new">Add a record</button><button type="button" class="btn" data-action="goto-tools">Open the tools</button></div></section>';
  var wk = lastDays(7), n = state.grounding.filter(function(g){ return wk.indexOf(dayKey(g.ts)) > -1; });
  var drops = n.filter(function(g){ return g.before >= 0 && g.after >= 0; }).map(function(g){ return g.before - g.after; });
  h += '<section class="card"><h2>Last 7 days</h2><div class="dots" role="img" aria-label="Days with a grounding record">' + wk.map(function(d){
      var on = state.grounding.some(function(g){ return dayKey(g.ts) === d; });
      return '<div class="dotcol"><span class="dot ' + (on ? 'dot-on' : '') + '"></span><span>' + parseKey(d).toLocaleDateString(undefined, {weekday:'narrow'}) + '</span></div>';
    }).join('') + '</div><p>' + n.length + ' ' + (n.length === 1 ? 'record' : 'records') + (drops.length ? ', stress fell by ' + avg(drops).toFixed(1) + ' points on average' : '') + '.</p></section>';
  if (state.grounding.length) {
    h += '<section class="card"><h2>Recent</h2><ul class="list">' + state.grounding.slice(0,40).map(function(g){
      var confirm = ui.confirmDel === 'gr:' + g.id;
      return '<li class="item"><div class="item-head"><strong>' + esc(g.skill) + '</strong><span class="pill ' + (g.before >= 0 && g.after >= 0 && g.after < g.before ? 'pill-good' : '') + '">' + (g.before >= 0 ? g.before : '–') + ' → ' + (g.after >= 0 ? g.after : '–') + '</span></div>' +
        '<div class="meta">' + esc(fmtWhen(g.ts)) + (g.minutes ? ', ' + g.minutes + ' min' : '') + '</div>' + (g.note ? '<div>' + esc(g.note) + '</div>' : '') +
        '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="gr-del" data-id="' + g.id + '">' + (confirm ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
    }).join('') + '</ul></section>';
  }
  return h;
}

function viewThoughts(){
  var d = ui.draftTh, h = '';
  if (d) {
    var s = ui.thStep, pct = Math.round(s / 4 * 100);
    h += '<section class="card"><div class="item-head"><h2>Thought record</h2><span class="val">Step ' + s + ' of 4</span></div><div class="bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>';
    if (s === 1) {
      h += textField('th','situation','What was happening?',d.situation,4,'Where, when, who with');
    } else if (s === 2) {
      h += textField('th','thought','What went through your mind?',d.thought,3,'The exact thought, as it came') +
           '<div class="field"><span class="lbl">What did you feel?</span>' + chipGroup('th','emotions',EMOTIONS,d.emotions) + '</div>' +
           rangeField('th','before','How strong was the feeling?',0,100,d.before,'%');
    } else if (s === 3) {
      h += '<div class="field"><span class="lbl">Any thinking traps?</span>' + chipGroup('th','traps',TRAPS,d.traps) +
           '<dl class="defs">' + TRAPS.map(function(t){ return '<div><dt>' + esc(t[0]) + '</dt><dd>' + esc(t[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
           textField('th','evFor','What supports this thought?',d.evFor,3,'') +
           textField('th','evAgainst','What does not fit it, or what else could be true?',d.evAgainst,3,'');
    } else {
      h += textField('th','balanced','A fairer way to see it',d.balanced,4,'What would you say to a friend in this situation?') +
           rangeField('th','after','How strong is the feeling now?',0,100,d.after,'%');
    }
    h += '<div class="row">' + (s > 1 ? '<button type="button" class="btn btn-quiet" data-action="th-back">Back</button>' : '<button type="button" class="btn btn-quiet" data-action="th-cancel">Cancel</button>') +
         (s < 4 ? '<button type="button" class="btn btn-primary" data-action="th-next">Next</button>' : '<button type="button" class="btn btn-primary" data-action="th-save">Save</button>') + '</div></section>';
    return h;
  }
  h += '<section class="card"><h2>Thought records</h2><p class="hint">When a frightening or harsh thought sticks, write it down and look at it from another angle. It takes about five minutes.</p><div><button type="button" class="btn btn-primary" data-action="th-new">New thought record</button></div></section>';
  if (!state.thoughts.length) {
    h += '<section class="card"><p class="hint">No thought records yet.</p></section>';
  } else {
    h += '<section class="card"><h2>Recent</h2><ul class="list">' + state.thoughts.slice(0,30).map(function(t){
      var confirm = ui.confirmDel === 'th:' + t.id;
      return '<li class="item"><div class="item-head"><strong>' + esc(t.thought || t.situation) + '</strong><span class="pill">' + t.before + '% to ' + t.after + '%</span></div>' +
        '<div class="meta">' + esc(fmtWhen(t.ts)) + (t.emotions && t.emotions.length ? ', ' + esc(joinList(t.emotions)) : '') + '</div>' +
        (t.situation ? '<div><span class="meta">Situation: </span>' + esc(t.situation) + '</div>' : '') +
        (t.balanced ? '<div><span class="meta">Fairer thought: </span>' + esc(t.balanced) + '</div>' : '') +
        '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="th-del" data-id="' + t.id + '">' + (confirm ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
    }).join('') + '</ul></section>';
  }
  return h;
}

/* trends */
var EX = {
  episodes:[1,0,2,1,0,0,1,3,1,0,1,0,0,1],
  activity:[15,20,15,20,25,0,15,10,20,25,25,30,0,25],
  mood:[2,3,3,null,3,4,3,2,3,3,4,null,4,4],
  energy:[2,2,3,null,3,3,3,2,2,3,3,null,3,4]
};
function chartBars(days, vals, max, label){
  var W = 320, H = 150, L = 30, R = 6, T = 10, B = 24, iw = W - L - R, ih = H - T - B, n = days.length;
  var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '">';
  var ticks = [0, max]; if (max % 2 === 0 && max >= 4) ticks.splice(1, 0, max / 2);
  ticks.forEach(function(t){
    var y = T + ih - (t / max) * ih;
    s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ax" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + t + '</text>';
  });
  var slot = iw / n, bw = Math.min(slot * 0.62, 18);
  vals.forEach(function(v, i){
    if (v > 0) {
      var hh = (v / max) * ih, x = L + slot * i + (slot - bw) / 2;
      s += '<rect class="barr" x="' + x.toFixed(1) + '" y="' + (T + ih - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="3"/>';
    }
  });
  [0, Math.floor((n - 1) / 2), n - 1].forEach(function(i, j){
    var x = j === 0 ? L : (j === 2 ? W - R : L + slot * i + slot / 2);
    s += '<text class="ax" x="' + x + '" y="' + (H - 6) + '" text-anchor="' + (j === 0 ? 'start' : j === 2 ? 'end' : 'middle') + '">' + fmtDay(days[i]) + '</text>';
  });
  return s + '</svg>';
}
function chartLines(days, a, b, label){
  var W = 320, H = 160, L = 30, R = 10, T = 12, B = 24, iw = W - L - R, ih = H - T - B, n = days.length, slot = iw / n;
  function X(i){ return L + slot * i + slot / 2; }
  function Y(v){ return T + ih - ((v - 1) / 4) * ih; }
  var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '">';
  [1, 3, 5].forEach(function(t){ var y = Y(t); s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ax" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + t + '</text>'; });
  function series(vals, lineCls, markCls, square){
    var run = [], out = '';
    function flush(){ if (run.length > 1) out += '<path class="' + lineCls + '" d="M' + run.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + '"/>'; run = []; }
    vals.forEach(function(v, i){
      if (v == null) { flush(); return; }
      run.push([X(i), Y(v)]);
      out += square ? '<rect class="' + markCls + '" x="' + (X(i) - 3.5).toFixed(1) + '" y="' + (Y(v) - 3.5).toFixed(1) + '" width="7" height="7"/>' : '<circle class="' + markCls + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5"/>';
    });
    flush(); return out;
  }
  s += series(b, 'ln2', 'm2', true) + series(a, 'ln1', 'm1', false);
  [0, Math.floor((n - 1) / 2), n - 1].forEach(function(i, j){
    var x = j === 0 ? L : (j === 2 ? W - R : X(i));
    s += '<text class="ax" x="' + x + '" y="' + (H - 6) + '" text-anchor="' + (j === 0 ? 'start' : j === 2 ? 'end' : 'middle') + '">' + fmtDay(days[i]) + '</text>';
  });
  return s + '</svg>';
}
function viewTrends(){
  var days = lastDays(14), hasData = state.episodes.length || Object.keys(state.checkins).length || state.activity.length;
  if (!hasData && !ui.example) {
    return '<section class="card empty"><h2>Trends will appear here</h2><p class="hint">After a few days of check-ins, logged episodes and activity, you will see how things move over two weeks.</p><button type="button" class="btn" data-action="ex-toggle">See an example</button></section>';
  }
  var showEx = !hasData && ui.example;
  var eps, act, mood, energy;
  if (showEx) { eps = EX.episodes; act = EX.activity; mood = EX.mood; energy = EX.energy; }
  else {
    eps = days.map(function(d){ return state.episodes.filter(function(e){ return dayKey(e.ts) === d; }).length; });
    act = days.map(function(d){ return minutesOn(d, function(a){ return a.kind !== 'calm'; }); });
    mood = days.map(function(d){ var c = state.checkins[d]; return c && c.mood ? c.mood : null; });
    energy = days.map(function(d){ var c = state.checkins[d]; return c && c.energy ? c.energy : null; });
  }
  var epMax = Math.max(2, Math.max.apply(null, eps)), actMax = Math.max(30, Math.ceil(Math.max.apply(null, act) / 10) * 10);
  var h = '';
  if (showEx) h += '<div class="row"><span class="badge">Example data, not yours</span><button type="button" class="btn btn-quiet" data-action="ex-toggle">Hide example</button></div>';
  h += '<section class="card"><h2>Mood and energy</h2><p class="hint">Daily check-ins, 1 is lowest and 5 is highest.</p>' +
       chartLines(days, mood, energy, 'Mood and energy check-ins over the last 14 days') +
       '<div class="legend"><span><i class="sw sw1"></i>Mood</span><span><i class="sw sw2"></i>Energy</span></div></section>';
  h += '<section class="card"><h2>Activity</h2><p class="hint">Minutes of activity and movement per day.</p>' + chartBars(days, act, actMax, 'Minutes of activity per day over the last 14 days') + '</section>';
  h += '<section class="card"><h2>Episodes</h2><p class="hint">Episodes logged per day.</p>' + chartBars(days, eps, epMax, 'Episodes logged per day over the last 14 days') + '</section>';
  if (!showEx) {
    var set = {}; days.forEach(function(d){ set[d] = 1; });
    var recent = state.episodes.filter(function(e){ return set[dayKey(e.ts)]; });
    var c = topCounts(recent, 'triggers', 3), hp = topCounts(recent, 'helped', 3), w = topCounts(recent, 'warnings', 3);
    if (c.length || hp.length || w.length) {
      h += '<section class="card"><h2>Patterns in the last 14 days</h2>' +
        (c.length ? '<div><p class="lbl">Common triggers</p><p>' + esc(joinList(c.map(function(x){ return x[0] + ' (' + x[1] + ')'; }))) + '</p></div>' : '') +
        (w.length ? '<div><p class="lbl">Early warning signs</p><p>' + esc(joinList(w.map(function(x){ return x[0] + ' (' + x[1] + ')'; }))) + '</p></div>' : '') +
        (hp.length ? '<div><p class="lbl">What helped</p><p>' + esc(joinList(hp.map(function(x){ return x[0] + ' (' + x[1] + ')'; }))) + '</p></div>' : '') + '</section>';
    }
  }
  return h;
}

/* ---------- TOOLS ---------- */
function viewTools(){
  var p = ui.panel;
  if (p) {
    if (p.before === undefined) return panelBefore(p);
    if (p.type === 'breath') return panelBreath(p);
    if (p.type === 'ground') return panelGround(p);
    if (p.type === 'pmr') return panelPMR(p);
    if (p.type === 'scan') return panelScan(p);
    if (p.type === 'shift') return panelShift(p);
    if (p.type === 'bls') return panelBls(p);
    if (p.type === 'move') return panelMove(p);
    if (p.type === 'urges') return panelUrges(p);
    if (p.type === 'feel') return panelFeel(p);
    if (p.type === 'moment') return panelMoment(p);
  }
  var h = '<div class="stack"><h1>Tools</h1>' + seg('tools', [['now','Now'],['calm','Calm'],['feel','Feel'],['move','Move'],['log','Log']], ui.sub.tools);
  function toolRow(action, attrs, key, title, meta){ return '<div class="tool-row"><button type="button" class="tool-btn" data-action="' + action + '"' + attrs + '><span class="t">' + esc(title) + '</span><span class="meta">' + esc(meta) + '</span></button><button type="button" class="pin" aria-pressed="' + (state.pins.indexOf(key) > -1) + '" aria-label="' + (state.pins.indexOf(key) > -1 ? 'Unpin from Home: ' : 'Pin to Home: ') + esc(title) + '" data-action="pin-toggle" data-key="' + key + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 6 3 3v2H7v-2l3-3zM12 15v5"/></svg></button></div>'; }
  if (ui.sub.tools === 'now') { h += toolkitBody(); return h + '</div>'; }
  if (ui.sub.tools === 'log') { h += '<p class="hint">Logging is here when you want it. It helps you and your clinician spot patterns; it is not something to do every hour.</p>' + viewTrack().replace('<h1>Track</h1>', ''); return h + '</div>'; }
  if (ui.sub.tools === 'feel') {
    h += '<section class="card"><p>Feelings show up in the body first. Naming the feeling, where it sits, and what it pushes you to do gives you a choice about what happens next.</p></section>' +
         toolRow('feel-new', '', 'feel', 'Name the feeling', 'Core feeling, body sensations, the urge, and what would help. About two minutes.') +
         toolRow('moment-new', '', 'moment', 'Unpack a moment', 'One moment that stirred something up: your body, your feelings, what you needed. About three minutes.') +
         toolRow('panel', ' data-type="scan"', 'scan', 'Body scan', 'Seven slow stops from feet to face, noticing without changing') +
         toolRow('panel', ' data-type="urges"', 'urges', 'Urges and opposite action', 'What each feeling pushes you to do, and what helps instead') +
         toolRow('goto-pattern', '', 'pattern', 'Understand a pattern', 'A one-minute check, then one thing to try');
  } else if (ui.sub.tools === 'calm') {
    h += toolRow('panel', ' data-type="breath"', 'breath', 'Paced breathing', 'A gentle pacer with a longer breath out') +
         toolRow('panel', ' data-type="ground"', 'ground', '5-4-3-2-1 sensory grounding', 'Bring your attention back to the room, one sense at a time') +
         toolRow('panel', ' data-type="pmr"', 'pmr', 'Progressive muscle relaxation', 'Tense and release, one muscle group at a time') +
         toolRow('panel', ' data-type="shift"', 'shift', 'Shifting attention', 'Two minutes with a songbird, moving your attention between what you see and what you hear') +
         toolRow('panel', ' data-type="bls"', 'bls', 'Side to side', 'A dot to follow with your eyes, or a soft chime moving ear to ear') +
         '<p class="hint">Each calming tool asks for your stress level before and after and saves it to your grounding record. You can stop any exercise at any point; what you did still counts. Pin the ones you use most to Home.</p>';
  } else {
    h += '<section class="card"><p>Gentle movements to practise smooth, automatic movement. Do any exercises your physiotherapist has given you first. Stop if you feel sharp pain, chest pain or faint.</p></section>' +
         '<div class="stack-s">' + EXERCISES.map(function(x){ return toolRow('panel', ' data-type="move" data-id="' + x.id + '"', 'move:' + x.id, x.name, x.dose + (x.standing ? ', standing' : ', seated')); }).join('') + '</div>';
  }
  return h + '</div>';
}
var TOOL_NAMES = { breath:'Paced breathing', ground:'5-4-3-2-1 grounding', pmr:'Progressive muscle relaxation', shift:'Shifting attention', scan:'Body scan', bls:'Side to side' };
function panelBefore(p){
  return '<div class="stack">' + backBtn('panel-close', 'Back to tools') + '<h1>' + esc(TOOL_NAMES[p.type]) + '</h1>' +
    '<section class="card"><p class="lbl">Before you start, how stressed do you feel right now?</p>' + scaleButtons('panel','before',0,10,-1,true) +
    '<div class="anchors"><span>0 calm</span><span>10 overwhelmed</span></div>' +
    '<div><button type="button" class="link" data-action="before-skip">Skip the rating</button></div></section></div>';
}
function panelAfter(p, bodyHtml){
  var h = '<section class="card card-good">' + bodyHtml;
  if (p.before >= 0 || p.after === -1) {
    h += '<p class="lbl">How stressed do you feel now?</p>' + scaleButtons('panel','after',0,10,p.after,true) + '<div class="anchors"><span>0 calm</span><span>10 overwhelmed</span></div>';
  }
  if (p.before >= 0 && p.after >= 0) h += '<p>Stress went from ' + p.before + ' to ' + p.after + '. ' + (p.after < p.before ? 'Your record has been saved.' : 'Your record has been saved. It is still practice, and practice counts.') + '</p>';
  if (p.saved) {
    var n = state.grounding.length, l7 = practiceLast7();
    h += '<div class="feedback"><strong>That is practice number ' + n + '.</strong> ' + l7 + ' of the last 7 days now have a practice.' + '</div><p class="hint">' + esc(p.encourage || (p.encourage = encourage())) + '</p>';
  }
  return h;
}
function saveGrounding(p, minutes){
  if (p.saved) return;
  p.saved = true; if (ui.welcomeBack) { state.stats.returns = (state.stats.returns || 0) + 1; ui.welcomeBack = false; }
  state.grounding.unshift({ id: uid(), ts: Date.now(), skill: TOOL_NAMES[p.type], before: p.before >= 0 ? p.before : -1, after: p.after >= 0 ? p.after : -1, minutes: minutes || 0, note: '' });
  state.grounding.sort(function(a,b){ return b.ts - a.ts; });
  if (minutes >= 1) logActivity({ kind:'calm', minutes:minutes, label:TOOL_NAMES[p.type] });
  save(); fxTick();
}

/* ---------- bilateral stimulation ---------- */
/* Something steady alternating left and right: a dot to follow with the eyes, or two
   quiet tones a few cycles apart, one in each ear. Offered as a settling exercise, not
   as memory work, and the copy says so. The dot is moved from script rather than by a
   CSS animation so that it still works when animations are switched off everywhere
   else, for the same reason the breathing circle does: here the movement is the exercise. */
var BLS_SPEED = { slow:1.9, steady:1.2 };
var BLS_LEN = [[30,'30 seconds'],[60,'1 minute'],[120,'2 minutes']];
var audioCtx = null, audioMaster = null;
function audioReady(){
  try {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch(e){} }
    if (!audioMaster) { audioMaster = audioCtx.createGain(); audioMaster.gain.value = 0.9; audioMaster.connect(audioCtx.destination); }
    return true;
  } catch(e){ return false; }
}
/* One soft chime, landing in a single ear. A struck bell is a short burst of quiet
   partials that fade at different rates, so each partial gets its own decay, and the
   whole thing is rolled off at the top to take any hardness out of it. */
function chime(pan){
  if (!audioReady()) return;
  try {
    var t = audioCtx.currentTime;
    var filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 2400; filt.Q.value = 0.5;
    if (audioCtx.createStereoPanner) { var sp = audioCtx.createStereoPanner(); sp.pan.value = pan; filt.connect(sp); sp.connect(audioMaster); }
    else { var mg = audioCtx.createChannelMerger(2); filt.connect(mg, 0, pan < 0 ? 0 : 1); mg.connect(audioMaster); }
    var base = 587.33, parts = [[1, 0.20, 1.7], [2.01, 0.065, 1.1], [2.76, 0.03, 0.7]];
    parts.forEach(function(pt){
      var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = base * pt[0];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(pt[1], t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + pt[2]);
      osc.connect(g); g.connect(filt);
      osc.start(t); osc.stop(t + pt[2] + 0.05);
    });
    setTimeout(function(){ try { filt.disconnect(); } catch(e){} }, 2400);
  } catch(e){}
}
/* The chimes are one-shot, so there is no drone to switch off: this only quiets
   whatever is still ringing when the patient leaves the screen. */
function stopTone(){
  if (!audioCtx || !audioMaster) return;
  try {
    var t = audioCtx.currentTime;
    audioMaster.gain.cancelScheduledValues(t);
    audioMaster.gain.setValueAtTime(Math.max(audioMaster.gain.value, 0.0001), t);
    audioMaster.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  } catch(e){}
  setTimeout(function(){ try { if (audioMaster) audioMaster.gain.value = 0.9; } catch(e){} }, 400);
}
function panelBls(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.done) {
    return h + panelAfter(p, '<h1>Done</h1><p>Take a moment before you move on. Look around the room, feel your feet on the floor, and notice how your body is now compared with a minute ago.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="bls-again">Go again</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  if (p.running) {
    if (p.mode === 'eyes') {
      return h + '<section class="card"><p class="bigtext">Follow the dot with your eyes. Keep your head still and let your breathing stay easy.</p>' +
        '<div class="bls-track" id="blstrack" aria-hidden="true"><span class="bls-dot" id="blsdot"></span></div>' +
        '<p class="hint" style="text-align:center" id="blsleft"></p>' +
        '<div class="row"><button type="button" class="btn btn-quiet btn-wide" data-action="bls-stop">Stop</button></div>' +
        '<p class="hint">Stop if your eyes ache or you start to feel dizzy or sick.</p></section></div>';
    }
    return h + '<section class="card"><p class="bigtext">Follow the dot if you like, or let your eyes close. Each chime sounds in the ear on the side the dot has reached.</p>' +
      '<div class="bls-track" id="blstrack" aria-hidden="true"><span class="bls-dot" id="blsdot"></span></div>' +
      '<div class="bls-ears" aria-hidden="true"><span class="bls-ear">Left ear</span><span class="bls-ear">Right ear</span></div>' +
      '<p class="hint" style="text-align:center" id="blsleft"></p>' +
      '<div class="row"><button type="button" class="btn btn-quiet btn-wide" data-action="bls-stop">Stop</button></div>' +
      '<p class="hint">Keep the volume low. Stop if it becomes unpleasant or you start to feel dizzy.</p></section></div>';
  }
  h += '<h1>Side to side</h1>' +
    '<section class="card"><p>Something steady that alternates between your left and your right: a dot to follow with your eyes, or a soft chime that lands in one ear and then the other. Many people find it settling when they feel wound up, or stuck going round the same thought.</p>' +
    '<p class="hint">This is here for settling, not for working through a difficult memory. If something upsetting comes up while you are doing it, stop, do a minute of paced breathing, and mention it to your clinician. If you have seizure-like episodes that start with something you see or hear, check with your clinician before using this one.</p></section>';
  h += '<section class="card"><div class="field"><span class="lbl">Which one</span><div class="chips" role="group" aria-label="Type">' +
    '<button type="button" class="chip" aria-pressed="' + (p.mode === 'eyes') + '" data-action="bls-pick" data-key="mode" data-val="eyes">Eye movements</button>' +
    '<button type="button" class="chip" aria-pressed="' + (p.mode === 'sound') + '" data-action="bls-pick" data-key="mode" data-val="sound">Sound</button>' +
    '</div></div>';
  if (p.mode) {
    h += '<div class="field"><span class="lbl">' + (p.mode === 'sound' ? 'Pace' : 'Speed') + '</span><div class="chips" role="group" aria-label="Pace">' +
      [['slow','Slow'],['steady','Steady']].map(function(t){
        return '<button type="button" class="chip" aria-pressed="' + (p.speed === t[0]) + '" data-action="bls-pick" data-key="speed" data-val="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div></div>';
  }
  if (p.mode === 'sound') {
    h += '<div class="field"><span class="lbl">Put your headphones in first</span>' +
      '<p class="hint">Use headphones or earbuds if you can, so each chime lands clearly in one ear; through a speaker the left and right run together. Turn the volume down before you start, then bring it up only until the chime is soft and clear.</p></div>';
  }
  h += '<div class="field"><span class="lbl">Length</span><div class="chips" role="group" aria-label="Length">' +
    BLS_LEN.map(function(t){
      return '<button type="button" class="chip" aria-pressed="' + (p.secs === t[0]) + '" data-action="bls-pick" data-key="secs" data-val="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div></div>' +
    '<button type="button" class="btn btn-primary btn-wide" data-action="bls-start"' + (p.mode ? '' : ' disabled') + '>Start</button>' +
    (p.mode ? '' : '<p class="hint">Choose eye movements or sound to begin.</p>') +
    '</section></div>';
  return h;
}
function startBlsLoop(){
  var p = ui.panel, total = p.secs * 1000, sweep = (BLS_SPEED[p.speed] || BLS_SPEED.slow) * 1000;
  var dot = $('#blsdot'), track = $('#blstrack'), left = $('#blsleft'), wave = $('#blswave');
  var useRaf = typeof requestAnimationFrame === 'function', lastBeat = -1;
  try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function(l){ timers.wl = l; }).catch(function(){}); } catch(e){}
  function frame(){
    var q = ui.panel;
    if (!q || q.type !== 'bls' || !q.running) return;
    var el = Date.now() - p.t0;
    if (el >= total) { finishBls(true); return; }
    var beat = Math.floor(el / sweep);
    if (p.mode === 'sound' && beat !== lastBeat) { lastBeat = beat; chime(beat % 2 ? 1 : -1); }
    var cyc = el % (sweep * 2), x = cyc <= sweep ? cyc / sweep : 2 - cyc / sweep;
    var eased = (1 - Math.cos(Math.PI * x)) / 2;
    if (dot && track) {
      var span = track.clientWidth - dot.offsetWidth - 20;
      if (span > 0) dot.style.transform = 'translateX(' + (10 + eased * span).toFixed(1) + 'px)';
    }
    if (wave) wave.style.transform = 'translateX(' + ((eased - 0.5) * 52).toFixed(1) + 'px)';
    var rem = Math.ceil((total - el) / 1000);
    if (left) left.textContent = (rem >= 60 ? Math.floor(rem / 60) + ':' + pad(rem % 60) : rem + 's') + ' left';
    if (useRaf) timers.raf = requestAnimationFrame(frame);
  }
  frame();
  if (!useRaf) timers.loop = setInterval(frame, 60);
}
function finishBls(complete){
  var p = ui.panel; if (!p || p.type !== 'bls') return;
  var el = Date.now() - p.t0, mins = Math.round((complete ? p.secs * 1000 : el) / 60000);
  stopTone();
  p.running = false; p.done = true; p.minutesDone = mins; p.after = -1;
  if (p.before < 0) saveGrounding(p, mins);
  render();
}

function panelBreath(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.done) {
    return h + panelAfter(p, '<h1>Well done</h1><p>You breathed slowly for ' + p.mins + ' minutes. Notice how your body feels now. Your shoulders, your jaw, your hands.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="breath-again">Do another</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  if (p.running) {
    return h + '<section class="card"><div class="breath" role="timer" aria-live="off"><div class="orb-glow" id="orbglow"></div><div class="orb" id="orb"></div><div class="breath-text"><span class="ph" id="bphase">Breathe in</span><span class="big" id="bcount"></span></div></div>' +
      '<p class="hint" style="text-align:center" id="bleft"></p><div class="row"><button type="button" class="btn btn-quiet btn-wide" data-action="breath-stop">Stop</button></div></section></div>';
  }
  h += '<h1>Paced breathing</h1><section class="card"><p>Breathe in through your nose and out gently through your lips. Keep the breaths low and easy, with no need to take big ones. A longer breath out helps your body settle.</p>' +
    '<div class="field"><span class="lbl">Pace</span><div class="chips" role="group">' + Object.keys(PACES).map(function(k){
      return '<button type="button" class="chip" aria-pressed="' + (p.pace === k) + '" data-action="breath-pick" data-key="pace" data-val="' + k + '">' + PACE_LABELS[k] + (k === '4-6' ? ' (suggested)' : '') + '</button>';
    }).join('') + '</div></div>' +
    '<div class="field"><span class="lbl">Length</span><div class="chips" role="group">' + [2,3,5].map(function(m){
      return '<button type="button" class="chip" aria-pressed="' + (p.mins === m) + '" data-action="breath-pick" data-key="mins" data-val="' + m + '">' + m + ' minutes</button>';
    }).join('') + '</div></div>' +
    '<button type="button" class="btn btn-primary btn-wide" data-action="breath-start">Start</button>' +
    '<p class="hint">If this makes you dizzy or more anxious, stop and breathe normally, then try grounding instead.</p></section></div>';
  return h;
}
function startBreathLoop(){
  var p = ui.panel, pace = PACES[p.pace], inMs = pace[0] * 1000, outMs = pace[1] * 1000, cyc = inMs + outMs, total = p.mins * 60000;
  var orb = $('#orb'), glow = $('#orbglow'), ph = $('#bphase'), ct = $('#bcount'), left = $('#bleft'), lastPhase = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function(l){ timers.wl = l; }).catch(function(){}); } catch(e){}
  /* The circle grows for the whole in-breath and shrinks for the whole out-breath: one smooth CSS transition per phase, timed to that phase. */
  function setPhase(inh){
    var dur = (inh ? inMs : outMs) / 1000, target = inh ? 1 : 0.55, glowT = inh ? 1.12 : 0.6;
    [orb, glow].forEach(function(e, i){ if (!e) return; if (reduce) { e.style.transition = 'none'; e.style.transform = 'scale(' + (i ? 1.05 : 1) + ')'; return; } e.style.transition = 'transform ' + dur.toFixed(1) + 's cubic-bezier(.45,0,.55,1)'; e.style.transform = 'scale(' + (i ? glowT : target) + ')'; });
  }
  if (orb && !reduce) { orb.style.transition = 'none'; orb.style.transform = 'scale(0.55)'; if (glow) { glow.style.transition = 'none'; glow.style.transform = 'scale(0.6)'; } void orb.offsetWidth; }
  function tick(){
    var el = Date.now() - p.t0;
    if (el >= total) { finishBreath(true); return; }
    var t = el % cyc, inh = t < inMs, sec;
    if (inh) sec = Math.ceil((inMs - t) / 1000); else sec = Math.ceil((outMs - (t - inMs)) / 1000);
    if (inh !== lastPhase) { lastPhase = inh; setPhase(inh); }
    var word = inh ? 'Breathe in' : 'Breathe out';
    if (ph && ph.textContent !== word) ph.textContent = word;
    if (ct) ct.textContent = sec;
    var rem = Math.ceil((total - el) / 1000);
    if (left) left.textContent = Math.floor(rem / 60) + ':' + pad(rem % 60) + ' left';
  }
  tick();
  if (ui.panel && ui.panel.running) timers.loop = setInterval(tick, 100);
}
function finishBreath(complete){
  var p = ui.panel; if (!p || p.type !== 'breath') return;
  var el = Date.now() - p.t0, mins = complete ? p.mins : Math.floor(el / 60000);
  p.running = false; p.done = true; p.minutesDone = mins; p.after = -1;
  if (p.before < 0) saveGrounding(p, mins);
  render();
}

/* ---------- artwork ---------- */
/* Small flat illustrations for the step-by-step tools and the Learn topics. They use the theme
   colours through classes (see .art in styles.css), so they follow light and dark mode, and they
   are decorative only: every one is aria-hidden and carries no information the text does not. */
function art(vb, body, cls){ return '<svg class="art ' + (cls || '') + '" viewBox="' + vb + '" aria-hidden="true" focusable="false">' + body + '</svg>'; }
var SENSE_ART = {
  see: '<path class="ln" d="M150 60c14-20 30-30 46-30s32 10 46 30c-14 20-30 30-46 30s-32-10-46-30z" transform="translate(-26 0)"/><circle class="a" cx="170" cy="60" r="13"/><circle class="iv" cx="174" cy="56" r="4"/>',
  feel: '<rect class="a" x="150" y="58" width="42" height="42" rx="15"/><g class="hand"><path d="M156 66 152 36"/><path d="M166 64V28"/><path d="M177 64 179.5 31"/><path d="M187 68 192 44"/><path class="thumb" d="M157 92 140 72"/></g>' +
    '<path class="ln lnt thin" d="M136 30l-6-5M139 46h-8M200 34l6-5M203 50h8M166 14v-4"/>',
  hear: '<path class="ln" d="M160 84c0 8 8 10 12 4 3-5 6-8 10-13 6-7 8-12 8-19 0-14-10-24-22-24s-22 10-22 22"/><path class="ln" d="M160 58c0-6 5-10 10-10s10 4 10 10c0 4-4 7-7 9"/><path class="ln lnt" d="M202 44c5 5 5 27 0 32M212 36c9 9 9 39 0 48"/>',
  smell: '<g transform="translate(170 64)"><circle class="t" cx="0" cy="-16" r="10"/><circle class="t" cx="15" cy="-5" r="10"/><circle class="t" cx="10" cy="13" r="10"/><circle class="t" cx="-10" cy="13" r="10"/><circle class="t" cx="-15" cy="-5" r="10"/><circle class="a" cx="0" cy="0" r="8"/></g><path class="ln" d="M170 86v22"/><path class="ln lnt" d="M196 30c4-4 0-8 4-12M206 36c4-4 0-8 4-12"/>',
  taste: '<path class="ln" d="M152 34h40l-6 66h-28z"/><path class="s" d="M155 58h34l-4 40h-26z"/><path class="ln lnt" d="M200 40c6 0 8 6 8 10"/>'
};
function groundArt(step){
  var keys = ['see','feel','hear','smell','taste'], n = 5 - step, dots = '';
  for (var i = 0; i < n; i++) dots += '<circle class="t" cx="' + (34 + i * 16) + '" cy="96" r="5"/>';
  return art('0 0 240 120', '<rect class="bg" x="0" y="0" width="240" height="120" rx="20"/><circle class="iv" cx="66" cy="52" r="32"/>' +
    '<text class="num" x="66" y="66" text-anchor="middle">' + n + '</text>' + dots + SENSE_ART[keys[step]], 'art-step');
}
/* One smooth figure drawn once in a soft colour; the area being worked on is laid over it
   in terracotta, clipped to the body's outline so it follows the shape. */
var BODY_BASE = '<circle cx="60" cy="24" r="15"/><rect x="54" y="36" width="12" height="12" rx="4"/>' +
  '<path d="M33 54Q60 42 87 54L85 92Q84 112 81 126H39Q36 112 35 92Z"/>' +
  '<path class="limb" d="M35 58 27 90 23 118M85 58l8 32 4 28"/><circle cx="22" cy="124" r="7"/><circle cx="98" cy="124" r="7"/>' +
  '<path class="limb thick" d="M49 124l-2 36M71 124l2 36"/><path class="limb" d="M47 160l-1 28M73 160l1 28"/>' +
  '<ellipse cx="42" cy="194" rx="9" ry="5"/><ellipse cx="78" cy="194" rx="9" ry="5"/>';
var BODY_PARTS = {
  head:'<circle cx="60" cy="24" r="15"/>', neck:'<rect x="54" y="36" width="12" height="12" rx="4"/>',
  shoulders:'<rect clip-path="url(#torsoClip)" x="20" y="40" width="80" height="20"/><circle cx="35" cy="58" r="5.5"/><circle cx="85" cy="58" r="5.5"/>',
  chest:'<rect clip-path="url(#torsoClip)" x="20" y="58" width="80" height="29"/>',
  stomach:'<rect clip-path="url(#torsoClip)" x="20" y="87" width="80" height="22"/>',
  hips:'<rect clip-path="url(#torsoClip)" x="20" y="109" width="80" height="20"/>',
  arms:'<path class="limb" d="M35 58 27 90 23 118M85 58l8 32 4 28"/>', hands:'<circle cx="22" cy="124" r="7"/><circle cx="98" cy="124" r="7"/>',
  thighs:'<path class="limb thick" d="M49 124l-2 36M71 124l2 36"/>', calves:'<path class="limb" d="M47 160l-1 28M73 160l1 28"/>',
  feet:'<ellipse cx="42" cy="194" rx="9" ry="5"/><ellipse cx="78" cy="194" rx="9" ry="5"/>'
};
function bodyArt(on){
  var all = on === 'all', hi = '';
  Object.keys(BODY_PARTS).forEach(function(k){ if (all || on.indexOf(k) > -1) hi += BODY_PARTS[k]; });
  return art('-70 -6 260 212', '<defs><clipPath id="torsoClip"><path d="M33 54Q60 42 87 54L85 92Q84 112 81 126H39Q36 112 35 92Z"/></clipPath></defs>' +
    '<rect class="bg" x="-70" y="-6" width="260" height="212" rx="20"/>' + (all ? '<circle class="glow" cx="60" cy="100" r="98"/>' : '') +
    '<g class="part">' + BODY_BASE + '</g><g class="part on">' + hi + '</g>', 'art-step art-body');
}
var PMR_PARTS = [['hands'],['arms'],['shoulders'],['head'],['chest','stomach'],['thighs'],['calves','feet']];
var SCAN_PARTS = [['feet','calves','thighs'],['hips'],['stomach'],['chest'],['shoulders','arms','hands'],['head','neck'],'all'];
var TOPIC_ART = {
  attention: '<path class="ln" d="M14 70c8 0 8-10 16-10s8 10 16 10 8-10 16-10"/><circle class="iv" cx="76" cy="54" r="30"/><circle class="ln" cx="76" cy="54" r="30"/><path class="ln lnt" d="M54 58c6 0 6-18 11-18s5 30 11 30 6-22 11-22 5 10 11 10"/><path class="ln" d="M98 76l18 18"/>',
  agency: '<path class="s" d="M0 104c24-34 64-52 120-40v56H0z"/><path class="ln" d="M22 112c18-6 18-16 34-22s22-12 30-24" stroke-dasharray="3 7"/><path class="ln" d="M90 64V28"/><path class="t" d="M90 28h22l-6 8 6 8H90z"/><circle class="a" cx="30" cy="38" r="9"/>',
  thinking: '<path class="iv" d="M14 24h56a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10H40l-14 12V68H14a10 10 0 0 1-10-10V34a10 10 0 0 1 10-10z"/><path class="ln lnt" d="M18 46c6-12 12 12 18 0s10-10 14 0 8 8 14-4"/><path class="ln" d="M80 82h28M98 72l10 10-10 10"/><path class="ln" d="M44 94h40" />',
  emotion: '<circle class="glow" cx="60" cy="56" r="40"/><circle class="t" cx="60" cy="52" r="14"/><path class="ln" d="M34 52c2 26 14 38 26 38s24-12 26-38"/><path class="ln" d="M24 50c-4 6-2 14 6 18M96 50c4 6 2 14-6 18"/><path class="ln lnt" d="M60 26v-8M42 32l-5-6M78 32l5-6"/>'
};
function learnArt(key, size){
  return art('0 0 120 120', '<rect class="bg" x="0" y="0" width="120" height="120" rx="' + (size === 'thumb' ? 26 : 22) + '"/>' + (TOPIC_ART[key] || ''), 'art-topic art-' + size);
}
function logoSvg(cls, id){
  return '<svg class="' + cls + '" viewBox="0 0 64 64" aria-hidden="true"><clipPath id="' + id + '"><circle cx="32" cy="32" r="30"/></clipPath><g clip-path="url(#' + id + ')"><rect width="64" height="64" fill="#DCE8DF"/><circle cx="41" cy="29" r="9" fill="#C9856B"/><path d="M-2 47C14 35 34 33 66 42V66H-2Z" fill="#24584F"/></g></svg>';
}

function panelGround(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.step >= GROUND.length) {
    return h + panelAfter(p, '<h1>Back in the room</h1><p>Your body can settle at its own pace. Take one more slow breath out when you are ready.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="ground-again">Go again</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  var g = GROUND[p.step];
  return h + '<section class="card"><div class="item-head"><span class="eyebrow">5-4-3-2-1 grounding</span><span class="val">Step ' + (p.step + 1) + ' of 5</span></div>' +
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / 5 * 100) + '%"></span></div>' + groundArt(p.step) +
    '<div id="stepText"><p class="bigtext">' + esc(g[1]) + '</p><p class="hint">' + esc(g[2]) + '</p></div>' + '<div><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="stepText">Read aloud</button></div>' +
    '<div class="row">' + (p.step > 0 ? '<button type="button" class="btn btn-quiet" data-action="ground-prev">Back</button>' : '') +
    '<button type="button" class="btn btn-primary" data-action="ground-next">' + (p.step === GROUND.length - 1 ? 'Finish' : 'Next') + '</button></div></section></div>';
}
function panelPMR(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.step >= PMR.length) {
    return h + panelAfter(p, '<h1>Let it all go</h1><p>Sit for a moment and notice the difference between tense and relaxed. That difference is what you are learning to feel early.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="pmr-again">Go again</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  var g = PMR[p.step];
  return h + '<section class="card"><div class="item-head"><span class="eyebrow">Progressive muscle relaxation</span><span class="val">' + (p.step + 1) + ' of ' + PMR.length + '</span></div>' +
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / PMR.length * 100) + '%"></span></div>' + bodyArt(PMR_PARTS[p.step]) +
    '<div id="stepText"><h2>' + esc(g[0]) + '</h2><p class="bigtext">' + esc(g[1]) + '</p><p class="hint">Tense for about 5 seconds, then release for 10 to 15 seconds. Keep breathing. Skip any area that hurts.</p></div>' + '<div><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="stepText">Read aloud</button></div>' +
    '<div class="row">' + (p.step > 0 ? '<button type="button" class="btn btn-quiet" data-action="pmr-prev">Back</button>' : '') +
    '<button type="button" class="btn btn-primary" data-action="pmr-next">' + (p.step === PMR.length - 1 ? 'Finish' : 'Next') + '</button></div></section></div>';
}
function panelScan(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.step >= BODYSCAN.length) {
    return h + panelAfter(p, '<h1>Scan complete</h1><p>Whatever you noticed is information, not a problem to solve. Naming it is the skill.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="feel-new">Name the feeling</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  var g = BODYSCAN[p.step];
  return h + '<section class="card"><div class="item-head"><span class="eyebrow">Body scan</span><span class="val">' + (p.step + 1) + ' of ' + BODYSCAN.length + '</span></div>' +
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / BODYSCAN.length * 100) + '%"></span></div>' + bodyArt(SCAN_PARTS[p.step]) +
    '<div id="stepText"><h2>' + esc(g[0]) + '</h2><p class="bigtext">' + esc(g[1]) + '</p><p class="hint">Take two or three slow breaths here before moving on. There is no right thing to feel.</p></div>' + '<div><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="stepText">Read aloud</button></div>' +
    '<div class="row">' + (p.step > 0 ? '<button type="button" class="btn btn-quiet" data-action="scan-prev">Back</button>' : '') +
    '<button type="button" class="btn btn-primary" data-action="scan-next">' + (p.step === BODYSCAN.length - 1 ? 'Finish' : 'Next') + '</button></div></section></div>';
}
function panelUrges(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools') + '<h1>Urges and opposite action</h1>' +
    '<section class="card"><p class="hint">Every feeling comes with an urge. The urge is not wrong, but acting on it often keeps the feeling going. Opposite action means doing what the feeling does not want, gently, when the feeling does not fit the facts or is not helping.</p></section>';
  FAMILIES.forEach(function(f){
    var open = p.open === f.id;
    h += '<section class="card"><button type="button" class="link" style="text-decoration:none; color:var(--fg); font-size:18px; width:100%; text-align:left" data-action="urges-open" data-id="' + f.id + '" aria-expanded="' + open + '">' + esc(f.name) + (open ? ' ▴' : ' ▾') + '</button>' +
      (open ? '<p class="lbl">It pushes you to</p><ul class="prose" style="padding-left:22px">' + f.urges.map(function(u){ return '<li>' + esc(u) + '</li>'; }).join('') + '</ul><p class="lbl">What tends to help</p><ul class="prose" style="padding-left:22px">' + f.help.map(function(u){ return '<li>' + esc(u) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
  });
  return h + '</div>';
}
function panelFeel(p){
  var d = ui.draftFeel, s = ui.feelStep, fam = familyById(d.family), h = '<div class="stack">' + backBtn('feel-cancel', 'Cancel');
  if (p.done) {
    return h + '<section class="card card-good"><h1>Named and noted</h1><p>' + esc(fam ? fam.name : 'A feeling') + (d.word ? ', ' + esc(d.word.toLowerCase()) : '') + ', ' + d.intensity + ' out of 10. Saved to your feelings log.</p>' +
      (d.action ? '<p><strong>Your next step:</strong> ' + esc(d.action) + '</p>' : '') +
      '<div class="row">' + (d.family === 'afraid' || d.family === 'angry' ? '<button type="button" class="btn btn-primary" data-action="open-tool" data-type="breath">Paced breathing now</button>' : '') + '<button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  h += '<section class="card"><div class="item-head"><h2>Name the feeling</h2><span class="val">Step ' + s + ' of 5</span></div><div class="bar" aria-hidden="true"><span style="width:' + (s * 20) + '%"></span></div>';
  if (s === 1) {
    h += '<p class="lbl">What is the closest family?</p><div class="feel-grid">' + FAMILIES.map(function(f){ return '<button type="button" class="feel-btn" aria-pressed="' + (d.family === f.id) + '" data-action="feel-family" data-id="' + f.id + '">' + esc(f.name) + '<small>' + esc(f.words.slice(0,3).join(', ').toLowerCase()) + '</small></button>'; }).join('') + '</div>';
  } else if (s === 2) {
    h += '<p class="lbl">Closer to which word?</p>' + radioGroup('feel','word',fam.words,d.word) + '<input type="text" id="f-wordOther" value="' + esc(fam.words.indexOf(d.word) > -1 ? '' : d.word) + '" placeholder="Or your own word" data-draft="feel" data-field="word" aria-label="Your own word">' +
         '<div class="field"><div class="lbl-row"><span class="lbl">How strong is it?</span><span class="val">' + d.intensity + ' / 10</span></div>' + scaleButtons('feel','intensity',0,10,d.intensity,true) + '</div>';
  } else if (s === 3) {
    h += '<p class="lbl">Where is it in your body, and what does it feel like?</p><p class="hint">Pick anything that fits. In FND, spotting the body signal early is the warning sign you can act on.</p>' + chipGroup('feel','sensations',SENSATIONS,d.sensations);
  } else if (s === 4) {
    h += '<p class="lbl">What does it push you to do?</p>' + chipGroup('feel','urges',fam.urges,d.urges) + '<p class="hint">Urges are information. You do not have to follow them.</p>';
  } else {
    h += '<p class="lbl">What would help right now?</p>' + radioGroup('feel','action',fam.help,d.action) + textField('feel','note','Anything else?',d.note,2,'Optional');
  }
  h += '<div class="row">' + (s > 1 ? '<button type="button" class="btn btn-quiet" data-action="feel-back">Back</button>' : '') +
       (s < 5 ? '<button type="button" class="btn btn-primary" data-action="feel-next"' + (s === 1 && !d.family ? ' disabled' : '') + '>Next</button>' : '<button type="button" class="btn btn-primary" data-action="feel-save">Save</button>') + '</div></section></div>';
  return h;
}
/* ---------- shifting attention: the songbird practice ----------
   Mindfulness as attention with purpose. Two minutes with a songbird on a branch and a
   soundscape around it, in four 30-second turns: look, listen, look again, listen again.
   A soft chime marks each switch so it still works with eyes closed during the listening turns.
   The bird is drawn once and brought to life with the Web Animations API: it breathes and
   blinks on its own, and every few seconds does something new (tilts its head, hops, turns,
   preens, flutters, sings). Its song is synthesised at the same moment it opens its beak.
   The soundscape (a stream, wind in the leaves, distant birds, a far-off dove) is synthesised
   too, so nothing is downloaded, and it has its own volume so other tools cannot silence it. */
var SHIFT_SECS = 120, SHIFT_TURN = 30;
var SHIFT_TURNS = [
  { kind:'look', title:'Look at the bird', text:'Let your eyes rest on the bird. Notice its colours and the pattern of its feathers. Watch what it does, how it moves, the expression on its face.' },
  { kind:'listen', title:'Now listen', text:'Shift your attention to the sounds. You can close your eyes. What can you hear? Try to name each sound, and notice whether it is near or far.' },
  { kind:'look', title:'Back to the bird', text:'Open your eyes and look again. Is there anything you did not notice the first time? A colour, a marking, a small movement?' },
  { kind:'listen', title:'Back to the sounds', text:'Close your eyes again if you like. Is there a sound you missed before? Notice how each one rises, fades and changes.' }
];
function birdScene(){
  /* A songbird facing right on a branch. Natural colours that stay the same in light and dark mode. */
  return '<svg class="bird-scene" id="birdScene" viewBox="0 0 320 210" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sky1"/><stop offset="1" class="sky2"/></linearGradient></defs>' +
    '<rect width="320" height="210" rx="22" fill="url(#skyG)"/>' +
    '<g class="cloud" id="cloud1"><ellipse cx="70" cy="40" rx="26" ry="9"/><ellipse cx="86" cy="34" rx="16" ry="9"/></g>' +
    '<g class="cloud" id="cloud2"><ellipse cx="250" cy="28" rx="20" ry="7"/><ellipse cx="262" cy="24" rx="12" ry="7"/></g>' +
    '<path class="hill" d="M0 186C60 166 120 172 170 180S270 170 320 160V210H0Z"/>' +
    '<g class="leafy" id="leavesBack"><ellipse cx="292" cy="112" rx="18" ry="8" transform="rotate(-30 292 112)"/><ellipse cx="300" cy="140" rx="16" ry="7" transform="rotate(20 300 140)"/><ellipse cx="22" cy="132" rx="16" ry="7" transform="rotate(25 22 132)"/></g>' +
    '<path class="branch" d="M-4 166C40 158 80 156 120 156S220 154 262 148 300 136 326 126" />' +
    '<path class="twig" d="M232 152C244 140 250 128 252 116M70 158C62 146 58 136 60 124" />' +
    '<g class="leafy" id="leavesA" style="transform-origin:252px 118px"><ellipse cx="252" cy="108" rx="7" ry="13" transform="rotate(20 252 108)"/><ellipse cx="262" cy="118" rx="6" ry="11" transform="rotate(70 262 118)"/></g>' +
    '<g class="leafy" id="leavesB" style="transform-origin:60px 126px"><ellipse cx="58" cy="114" rx="6.5" ry="12" transform="rotate(-15 58 114)"/><ellipse cx="48" cy="124" rx="6" ry="11" transform="rotate(-70 48 124)"/></g>' +
    '<g transform="translate(160 157) scale(1.6) translate(-160 -157)"><g id="birdMove"><g id="birdFace" style="transform-origin:160px 0">' +
      '<g id="tail" style="transform-origin:134px 128px"><path class="b-dark" d="M136 124 98 146 104 152 140 134Z"/><path class="b-back" d="M136 126 100 150 108 154 141 133Z"/></g>' +
      '<g class="b-legs"><path d="M154 140 152 156M166 140 168 156"/><path d="M146 157h12M162 157h12"/></g>' +
      '<g id="birdBody" style="transform-origin:158px 140px">' +
        '<ellipse class="b-back" cx="156" cy="120" rx="31" ry="23" transform="rotate(-12 156 120)"/>' +
        '<ellipse class="b-breast" cx="168" cy="125" rx="20" ry="18"/>' +
        '<ellipse class="b-belly" cx="158" cy="137" rx="17" ry="7"/>' +
        '<g id="wing" style="transform-origin:160px 108px"><path class="b-dark" d="M134 112C146 100 166 102 172 112 168 126 150 134 132 132 126 126 128 118 134 112Z"/>' +
          '<path class="b-bar" d="M140 116C148 112 158 112 164 116M138 123C146 120 154 120 160 123"/></g>' +
      '</g>' +
      '<g id="birdHead" style="transform-origin:172px 108px">' +
        '<circle class="b-back" cx="178" cy="96" r="15"/>' +
        '<path class="b-breast" d="M168 104C172 112 184 112 190 102 188 108 180 113 172 111Z"/>' +
        '<circle class="b-ring" cx="184" cy="92" r="4.8"/><circle class="b-eye" cx="184.5" cy="92" r="3.3"/><circle class="b-shine" cx="185.6" cy="90.8" r="1"/>' +
        '<ellipse class="b-lid" id="eyelid" cx="184.5" cy="92" rx="5" ry="5" style="transform-origin:184.5px 87px;transform:scaleY(0)"/>' +
        '<path class="b-beak" d="M191 92 205 95.5 191 98Z"/>' +
        '<path class="b-beak b-beak-lo" id="beakLo" d="M191 97 203 97 191 100Z" style="transform-origin:191px 97px"/>' +
      '</g>' +
    '</g></g>' +
    '<g id="notes" class="notes"></g></g>' +
  '</svg>';
}
/* ---------- unpack a moment ----------
   A short, repeatable look at one moment that stirred something up: who it was with, what the
   body noticed, what showed on the surface, what might be underneath, the need, and what the
   patient did. The body comes before emotions because many people with FND notice the body
   first, or only. "Not sure" and "Nothing I noticed" are full answers, and every step can be
   skipped. The summary says what happened together and never that one thing caused another. */
var MOMENT_WHO = ['Partner','Family','Friend','Healthcare provider','Work','Just me','Other'];
var MOMENT_BODY = ['Symptoms flared','Shaky','Tense','Heavy or weak','Foggy','Spaced out / far away','Exhausted','Nothing I noticed'];
var MOMENT_SURFACE = ['Angry','Defensive','Irritated','Shut down','Numb','Anxious','Not sure'];
var MOMENT_UNDER = ['Hurt','Scared','Ashamed','Sad','Lonely','Dismissed','Like a burden','Not sure'];
var MOMENT_NEEDS = ['That I\'m believed','That I\'m not a burden','That you\'ll still be here','That you see how I feel','That I\'m loved even when I\'m struggling','That we\'re okay','That I can still do things for myself','That someone will help when I need it'];
var MOMENT_DID = ['Pushed through','Hid my symptoms','Pulled away','Tried to please','Sought reassurance','Handled it alone','Downplayed it','Other'];
/* Options that stand alone: choosing one clears the others, and choosing another clears it. */
var MOMENT_ALONE = ['Nothing I noticed','Not sure'];
var MOMENT_LIMIT = { body:2, surface:2, under:2, did:2 };
var MOMENT_STEPS = 7;
function newMoment(){ return { what:'', who:'', whoOther:'', body:[], surface:[], under:[], need:'', did:[], didOther:'' }; }
function lowerFirst(s){ return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function andList(a){ return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function momentSummary(m){
  var out = [];
  var whoPh = { 'Partner':'with my partner', 'Family':'with family', 'Friend':'with a friend', 'Healthcare provider':'with a healthcare provider', 'Work':'at work', 'Just me':'when I was on my own' }[m.who];
  if (m.who === 'Other' && m.whoOther && m.whoOther.trim()) whoPh = 'with ' + m.whoOther.trim();
  if (whoPh) out.push('This was ' + whoPh + '.');
  var body = (m.body || []).filter(function(b){ return b !== 'Nothing I noticed'; });
  if ((m.body || []).indexOf('Nothing I noticed') > -1) out.push('I did not notice anything in my body.');
  else if (body.length) {
    var flare = body.indexOf('Symptoms flared') > -1, adj = body.filter(function(b){ return b !== 'Symptoms flared'; }).map(function(b){ return b === 'Spaced out / far away' ? 'spaced out' : b.toLowerCase(); });
    out.push(flare ? 'My symptoms flared' + (adj.length ? ' and my body felt ' + andList(adj) : '') + '.' : 'My body felt ' + andList(adj) + '.');
  }
  var sNS = (m.surface || []).indexOf('Not sure') > -1, uNS = (m.under || []).indexOf('Not sure') > -1;
  var s = (m.surface || []).filter(function(x){ return x !== 'Not sure'; }).map(function(x){ return x.toLowerCase(); });
  var u = (m.under || []).filter(function(x){ return x !== 'Not sure'; }).map(function(x){ return x.toLowerCase(); });
  if (s.length && u.length) out.push('I felt ' + andList(s) + ' on the surface and ' + andList(u) + ' underneath.');
  else if (s.length) out.push('I felt ' + andList(s) + ' on the surface' + (uNS ? ', and I am not sure what was underneath.' : '.'));
  else if (u.length) out.push((sNS ? 'I was not sure what showed on the surface, but underneath I felt ' : 'Underneath, I felt ') + andList(u) + '.');
  else if (sNS || uNS) out.push('I was not sure what I was feeling, and that is okay.');
  if (m.need) out.push('I needed to know ' + m.need.replace(/^That /, '') + '.');
  var did = (m.did || []).map(function(d){ return d === 'Other' ? (m.didOther && m.didOther.trim() ? lowerFirst(m.didOther.trim()) : '') : lowerFirst(d); }).filter(Boolean);
  if (did.length) out.push('I ' + andList(did) + '.');
  return out.join(' ');
}
function momentChips(field, opts){
  var d = ui.draftMoment, sel = d[field] || [];
  return '<div class="chips" role="group">' + opts.map(function(v){
    return '<button type="button" class="chip" aria-pressed="' + (sel.indexOf(v) > -1) + '" data-action="moment-chip" data-field="' + field + '" data-val="' + esc(v) + '">' + esc(v) + '</button>';
  }).join('') + '</div>';
}
function panelMoment(p){
  var d = ui.draftMoment, s = ui.momentStep || 1, h = '<div class="stack">' + (p.done ? backBtn('panel-close', 'Back to tools') : backBtn('moment-cancel', 'Cancel'));
  if (p.done) {
    var m = byId(state.moments, p.savedId) || d;
    return h + '<section class="card card-good"><h1>Saved</h1>' +
      '<div class="moment-card">' + (m.what ? '<p class="moment-what">' + esc(m.what) + '</p>' : '') + '<p>' + esc(momentSummary(m)) + '</p></div>' +
      '<p class="hint">Saved to your moments log. Over time, the moments you unpack can show patterns in what you need. Looking at them with your clinician can help.</p>' +
      '<p class="lbl">What would help a little right now?</p>' +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="open-tool" data-type="ground">A short grounding exercise</button><button type="button" class="btn" data-action="open-tool" data-type="breath">Paced breathing</button><button type="button" class="btn btn-quiet" data-action="panel-close">I am okay for now</button></div></section></div>';
  }
  h += '<section class="card"><div class="item-head"><h2>Unpack a moment</h2><span class="val">Step ' + s + ' of ' + MOMENT_STEPS + '</span></div><div class="bar" aria-hidden="true"><span style="width:' + Math.round(s / MOMENT_STEPS * 100) + '%"></span></div>';
  if (s === 1) {
    h += '<p class="hint">Think of one recent moment that stirred something up. Everything here is optional, and "not sure" is always a fine answer. If you feel an episode coming on, use your grounding or flare plan first and come back to this later.</p>' +
      lineField('moment', 'what', 'What happened?', d.what, 'One line is plenty. For example: after my appointment') +
      '<p class="hint">Optional. To speak instead of type, tap the microphone on your keyboard.</p>' +
      '<div class="field"><span class="lbl">Who was it with?</span>' + radioGroup('moment', 'who', MOMENT_WHO, d.who) + '</div>' +
      (d.who === 'Other' ? lineField('moment', 'whoOther', 'Who?', d.whoOther, 'Optional') : '');
  } else if (s === 2) {
    h += '<p class="lbl">What did your body notice?</p><p class="hint">Pick up to 2. Many people with FND notice changes in the body before, or instead of, emotions. "Nothing I noticed" is a fine answer.</p>' + momentChips('body', MOMENT_BODY);
  } else if (s === 3) {
    h += '<p class="lbl">What showed on the surface?</p><p class="hint">Pick up to 2. This is the feeling other people might have seen.</p>' + momentChips('surface', MOMENT_SURFACE) +
      '<p class="hint">Naming feelings can be hard, especially with FND. There is no wrong answer here.</p>';
  } else if (s === 4) {
    h += '<p class="lbl">What might be underneath?</p><p class="hint">Pick up to 2, or skip. This is the softer feeling that can sit below the surface one.</p>' + momentChips('under', MOMENT_UNDER) +
      '<p class="hint">Naming feelings can be hard, especially with FND. There is no wrong answer here.</p>';
  } else if (s === 5) {
    h += '<p class="lbl">What I needed to know</p><p class="hint">Pick the one that fits best.</p>' + radioGroup('moment', 'need', MOMENT_NEEDS, d.need);
  } else if (s === 6) {
    h += '<p class="lbl">What I did</p><p class="hint">Pick up to 2. These are ways of protecting yourself, and they all make sense. Noticing them gives you more choice next time.</p>' + momentChips('did', MOMENT_DID) +
      ((d.did || []).indexOf('Other') > -1 ? lineField('moment', 'didOther', 'What did you do?', d.didOther, 'For example: went quiet') : '');
  } else {
    var sum = momentSummary(d);
    h += '<p class="lbl">Your summary</p><div class="moment-card">' + (d.what ? '<p class="moment-what">' + esc(d.what) + '</p>' : '') + '<p>' + (sum ? esc(sum) : 'You skipped every question, and that is okay. You can still save this moment, or go back and add anything that feels right.') + '</p></div>' +
      '<p class="hint">This describes what happened together in one moment. It does not mean one thing caused another.</p>';
  }
  h += '<div class="row">' + (s > 1 ? '<button type="button" class="btn btn-quiet" data-action="moment-back">Back</button>' : '') +
    (s < MOMENT_STEPS ? '<button type="button" class="btn btn-primary" data-action="moment-next">' + (momentStepEmpty(d, s) && s > 1 ? 'Skip' : 'Next') + '</button>' : '<button type="button" class="btn btn-primary" data-action="moment-save">Save</button>') + '</div></section></div>';
  return h;
}
function momentStepEmpty(d, s){
  var f = { 2:'body', 3:'surface', 4:'under', 5:'need', 6:'did' }[s];
  if (!f) return false;
  return Array.isArray(d[f]) ? !d[f].length : !d[f];
}
function viewMoments(){
  var h = '<section class="card"><h2>Moments log</h2><p class="hint">Each moment you unpack lands here. These stay on your phone and are only added to a report if you tick the box on the share screen.</p><div><button type="button" class="btn btn-primary" data-action="moment-new">Unpack a moment</button></div></section>';
  if (!state.moments.length) return h + '<section class="card"><p class="hint">No moments yet.</p></section>';
  var recent = state.moments.slice(0, 30), needs = {};
  recent.forEach(function(m){ if (m.need) needs[m.need] = (needs[m.need] || 0) + 1; });
  var topNeed = Object.keys(needs).sort(function(a,b){ return needs[b] - needs[a]; })[0];
  if (recent.length >= 3 && topNeed && needs[topNeed] >= 2) h += '<section class="card card-accent"><p class="eyebrow">A pattern</p><p>The need that comes up most often in your recent moments: <strong>' + esc(lowerFirst(topNeed)) + '</strong> (' + needs[topNeed] + ' of ' + recent.length + ').</p></section>';
  h += '<section class="card"><h2>Recent</h2><ul class="list">' + recent.map(function(m){
    var confirm = ui.confirmDel === 'moment:' + m.id;
    return '<li class="item"><div class="meta">' + esc(fmtWhen(m.ts)) + '</div>' + (m.what ? '<strong>' + esc(m.what) + '</strong>' : '') + '<div>' + esc(momentSummary(m)) + '</div>' +
      '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="moment-del" data-id="' + m.id + '">' + (confirm ? 'Tap again to delete' : 'Delete') + '</button></div></li>';
  }).join('') + '</ul></section>';
  return h;
}

function panelShift(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.done) {
    return h + panelAfter(p, '<h1>Well done</h1><p>You chose where to put your attention four times. Each time it wandered and you brought it back, that was the practice.</p>' +
      '<p>You can do this anywhere: with a candle, your breath, a cup of tea, or the sounds in a room.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="shift-again">Go again</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  if (p.running) {
    return h + '<section class="card shift-card"><div class="item-head"><span class="eyebrow">Shifting attention</span><span class="val" id="shiftLeft"></span></div>' +
      '<div class="shift-steps" aria-hidden="true">' + SHIFT_TURNS.map(function(t, i){ return '<span class="shift-step" data-turn="' + i + '">' + (t.kind === 'look' ? 'Look' : 'Listen') + '</span>'; }).join('') + '</div>' +
      birdScene() +
      '<div class="shift-prompt" aria-live="polite"><p class="shift-kind" id="shiftKind"></p><p class="bigtext" id="shiftTitle"></p><p id="shiftText"></p></div>' +
      '<p class="hint">Your attention may drift to something else. That is natural. Notice where it went, then gently bring it back.</p>' +
      '<div class="row"><button type="button" class="btn btn-quiet" data-action="shift-sound">' + (p.sound ? 'Sound off' : 'Sound on') + '</button><button type="button" class="btn btn-quiet" data-action="shift-stop">Finish early</button></div></section></div>';
  }
  return h + '<h1>Shifting attention</h1><section class="card">' +
    '<div id="stepText"><p>Mindfulness is attention with purpose. It means choosing where to direct your attention, towards a certain thing or object, like a candle or your breath, and gently keeping it there.</p>' +
    '<p>In this practice you will spend two minutes with a songbird and the sounds of nature around it. You will move your attention four times, every 30 seconds:</p>' +
    '<ol class="prose" style="margin:0; padding-left:22px"><li>Look at the bird: its colours, feathers, behaviour and expressions.</li><li>Listen to the sounds and name what you hear.</li><li>Look again for things you did not notice before.</li><li>Listen again for sounds you missed.</li></ol>' +
    '<p>Your attention will probably wander to something else. That is natural, and noticing it is part of the skill.</p></div>' +
    '<div><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="stepText">Read aloud</button></div>' +
    '<p class="hint">Turn your sound on, or use headphones. A soft chime marks each switch.</p>' +
    '<button type="button" class="btn btn-primary btn-wide" data-action="shift-start">Start, 2 minutes</button></section></div>';
}

/* --- the bird's behaviour --- */
var bird = { x:0, face:1, busy:false, next:0, blinkAt:0, anims:[] };
function birdAnim(el, frames, opts){
  if (!el || !el.animate) return null;
  try { var a = el.animate(frames, opts); bird.anims.push(a); return a; } catch(e){ return null; }
}
function birdSet(){
  var m = $('#birdMove'), f = $('#birdFace');
  if (m) m.style.transform = 'translate(' + bird.x + 'px,0)';
  if (f) f.style.transform = 'scaleX(' + bird.face + ')';
}
function birdBlink(){
  birdAnim($('#eyelid'), [{transform:'scaleY(0)'},{transform:'scaleY(1)', offset:0.45},{transform:'scaleY(1)', offset:0.55},{transform:'scaleY(0)'}], {duration:220, easing:'ease-in-out'});
}
function birdDo(kind, sound){
  var head = $('#birdHead'), body = $('#birdBody'), wing = $('#wing'), tail = $('#tail'), beak = $('#beakLo'), move = $('#birdMove'), face = $('#birdFace');
  var ms = 1200;
  if (kind === 'tilt') {
    var d = Math.random() < 0.5 ? 16 : -12;
    birdAnim(head, [{transform:'rotate(0)'},{transform:'rotate(' + d + 'deg)', offset:0.2},{transform:'rotate(' + d + 'deg)', offset:0.75},{transform:'rotate(0)'}], {duration:1800, easing:'ease-in-out'}); ms = 1900;
  } else if (kind === 'look') {
    birdAnim(head, [{transform:'rotate(0)'},{transform:'rotate(-14deg)', offset:0.15},{transform:'rotate(-14deg)', offset:0.4},{transform:'rotate(10deg)', offset:0.55},{transform:'rotate(10deg)', offset:0.85},{transform:'rotate(0)'}], {duration:1700, easing:'ease-in-out'}); ms = 1800;
  } else if (kind === 'preen') {
    birdAnim(head, [{transform:'rotate(0)'},{transform:'rotate(-58deg) translate(-6px,6px)', offset:0.25},{transform:'rotate(-52deg) translate(-6px,6px)', offset:0.4},{transform:'rotate(-60deg) translate(-6px,7px)', offset:0.55},{transform:'rotate(-54deg) translate(-6px,6px)', offset:0.7},{transform:'rotate(0)'}], {duration:2200, easing:'ease-in-out'});
    birdAnim(wing, [{transform:'rotate(0)'},{transform:'rotate(-8deg)', offset:0.4},{transform:'rotate(0)'}], {duration:2200}); ms = 2300;
  } else if (kind === 'flutter') {
    birdAnim(wing, [{transform:'rotate(0)'},{transform:'rotate(-30deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-26deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-20deg)'},{transform:'rotate(0)'}], {duration:700, easing:'ease-in-out'});
    birdAnim(tail, [{transform:'rotate(0)'},{transform:'rotate(-14deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0)'}], {duration:700});
    birdAnim(body, [{transform:'scale(1)'},{transform:'scale(1.06,1.03)', offset:0.4},{transform:'scale(1)'}], {duration:700}); ms = 900;
  } else if (kind === 'tail') {
    birdAnim(tail, [{transform:'rotate(0)'},{transform:'rotate(-18deg)', offset:0.3},{transform:'rotate(4deg)', offset:0.6},{transform:'rotate(0)'}], {duration:600, easing:'ease-out'}); ms = 700;
  } else if (kind === 'turn') {
    var to = -bird.face;
    birdAnim(face, [{transform:'scaleX(' + bird.face + ')'},{transform:'scaleX(0.1)', offset:0.5},{transform:'scaleX(' + to + ')'}], {duration:360, easing:'ease-in-out'});
    bird.face = to; setTimeout(birdSet, 340); ms = 600;
  } else if (kind === 'hop') {
    /* Hop along the branch, turning first if the bird is facing away from where it goes. */
    var dir = bird.x > 14 ? -1 : bird.x < -14 ? 1 : (Math.random() < 0.5 ? -1 : 1);
    if (dir !== bird.face) { birdDo('turn'); setTimeout(function(){ hop(dir); }, 450); return 1500; }
    hop(dir); ms = 1000;
  } else if (kind === 'sing') {
    var n = 3 + Math.floor(Math.random() * 4), gap = 190;
    for (var i = 0; i < n; i++) (function(i){
      setTimeout(function(){
        birdAnim(beak, [{transform:'rotate(0)'},{transform:'rotate(26deg)', offset:0.35},{transform:'rotate(0)'}], {duration:170});
        birdAnim(body, [{transform:'scale(1)'},{transform:'scale(1.04)', offset:0.4},{transform:'scale(1)'}], {duration:170});
        if (i % 2 === 0) floatNote();
      }, i * gap);
    })(i);
    birdAnim(head, [{transform:'rotate(0)'},{transform:'rotate(-10deg)', offset:0.1},{transform:'rotate(-10deg)', offset:0.9},{transform:'rotate(0)'}], {duration:n * gap + 300});
    if (sound) birdSong(n, gap / 1000);
    ms = n * gap + 600;
  }
  return ms;
  function hop(dir){
    var from = bird.x, to = Math.max(-30, Math.min(30, from + dir * (14 + Math.random() * 10)));
    birdAnim(move, [{transform:'translate(' + from + 'px,0)'},{transform:'translate(' + ((from + to) / 2) + 'px,-16px)', offset:0.45},{transform:'translate(' + to + 'px,0)', offset:0.85},{transform:'translate(' + to + 'px,1.5px)', offset:0.92},{transform:'translate(' + to + 'px,0)'}], {duration:520, easing:'ease-in-out'});
    birdAnim(wing, [{transform:'rotate(0)'},{transform:'rotate(-22deg)', offset:0.4},{transform:'rotate(0)'}], {duration:520});
    bird.x = to; setTimeout(birdSet, 500);
  }
}
function floatNote(){
  var g = $('#notes'); if (!g) return;
  var bx = 160 + bird.x + bird.face * 44, by = 86, ns = 'http://www.w3.org/2000/svg';
  var n = document.createElementNS(ns, 'path');
  n.setAttribute('d', 'M0 0v-12l7 -2v10M0 0a3 2.4 0 1 1 -0.1 0M7 -4a3 2.4 0 1 1 -0.1 0');
  n.setAttribute('class', 'note'); n.setAttribute('transform', 'translate(' + bx + ' ' + by + ')');
  g.appendChild(n);
  var dx = bird.face * (14 + Math.random() * 16);
  var a = birdAnim(n, [{transform:'translate(0,0)', opacity:0},{transform:'translate(' + (dx * 0.3) + 'px,-6px)', opacity:1, offset:0.2},{transform:'translate(' + dx + 'px,-34px)', opacity:0}], {duration:1500, easing:'ease-out'});
  setTimeout(function(){ if (n.parentNode) n.parentNode.removeChild(n); }, 1550);
}
/* Each behaviour is picked at random, with singing and small head movements the most common. */
function birdTick(now, sound){
  if (now >= bird.blinkAt) { birdBlink(); bird.blinkAt = now + 2200 + Math.random() * 3200; }
  if (now < bird.next) return;
  var pool = ['sing','sing','sing','tilt','tilt','look','look','hop','hop','preen','flutter','tail','tail','turn'];
  var k = pool[Math.floor(Math.random() * pool.length)];
  var ms = birdDo(k, sound);
  bird.next = now + ms + 700 + Math.random() * 1800;
}
function stopBird(){ bird.anims.forEach(function(a){ try { a.cancel(); } catch(e){} }); bird.anims = []; }

/* --- the soundscape --- */
var nature = { gain:null, nodes:[], timer:null, nextBird:0, nextDove:0, babble:null, wind:null, leaves:null };
function natureNoise(secs, brown){
  var len = Math.floor(audioCtx.sampleRate * secs), b = audioCtx.createBuffer(1, len, audioCtx.sampleRate), d = b.getChannelData(0), last = 0;
  for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  return b;
}
function natureLoop(buf, filterType, freq, q, level){
  var c = audioCtx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = buf; s.loop = true; f.type = filterType; f.frequency.value = freq; f.Q.value = q; g.gain.value = level;
  s.connect(f); f.connect(g); g.connect(nature.gain); s.start();
  nature.nodes.push(s);
  return { src:s, filter:f, gain:g };
}
function natureOut(pan){
  if (audioCtx.createStereoPanner) { var sp = audioCtx.createStereoPanner(); sp.pan.value = pan; sp.connect(nature.gain); return sp; }
  return nature.gain;
}
/* One bird phrase: short whistled notes that sweep in pitch, with a little warble. */
function chirp(t, f0, f1, dur, peak, out, warble){
  var c = audioCtx, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  if (warble) { var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = warble; lg.gain.value = f0 * 0.04; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05); }
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function birdSong(n, gap){
  if (!nature.gain) return;
  var t = audioCtx.currentTime + 0.02, out = natureOut(bird.x / 60);
  for (var i = 0; i < n; i++) {
    var hi = 2900 + Math.random() * 900;
    if (i === n - 1 && n > 3) { for (var j = 0; j < 5; j++) chirp(t + i * gap + j * 0.045, hi * 1.25, hi * 0.9, 0.04, 0.12, out); }
    else chirp(t + i * gap, hi, hi * (Math.random() < 0.5 ? 1.35 : 0.72), 0.11 + Math.random() * 0.05, 0.16, out, 38);
  }
}
function distantBird(){
  var t = audioCtx.currentTime + 0.05, out = natureOut(Math.random() < 0.5 ? -0.7 : 0.7), kind = Math.floor(Math.random() * 3), base = 2400 + Math.random() * 1400;
  if (kind === 0) { for (var i = 0; i < 2; i++) chirp(t + i * 0.32, base * 1.2, base, 0.18, 0.028, out, 24); }
  else if (kind === 1) { for (var k = 0; k < 7; k++) chirp(t + k * 0.07, base * 1.3, base * 0.95, 0.05, 0.022, out); }
  else { chirp(t, base * 0.8, base * 1.3, 0.35, 0.026, out, 18); chirp(t + 0.42, base * 1.3, base * 0.7, 0.3, 0.022, out); }
}
function dove(){
  /* A far-off dove: soft, low hoots. */
  var c = audioCtx, t = c.currentTime + 0.05, out = natureOut(-0.4 + Math.random() * 0.8);
  [[0, 0.5, 520, 470], [0.62, 0.32, 600, 560], [1.05, 0.45, 520, 480], [1.6, 0.45, 520, 480]].forEach(function(h){
    var o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; f.type = 'lowpass'; f.frequency.value = 900;
    o.frequency.setValueAtTime(h[2], t + h[0]); o.frequency.linearRampToValueAtTime(h[3], t + h[0] + h[1]);
    g.gain.setValueAtTime(0.0001, t + h[0]); g.gain.exponentialRampToValueAtTime(0.05, t + h[0] + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + h[0] + h[1]);
    o.connect(f); f.connect(g); g.connect(out); o.start(t + h[0]); o.stop(t + h[0] + h[1] + 0.05);
  });
}
function startNature(on){
  if (!audioReady()) return false;
  stopNature();
  var c = audioCtx;
  nature.gain = c.createGain(); nature.gain.gain.value = 0.0001; nature.gain.connect(c.destination);
  if (on) nature.gain.gain.exponentialRampToValueAtTime(0.9, c.currentTime + 2);
  var white = natureNoise(3, false), brown = natureNoise(4, true);
  nature.babble = natureLoop(white, 'bandpass', 1400, 0.7, 0.05);   /* water moving over stones */
  natureLoop(brown, 'lowpass', 500, 0.5, 0.35);                      /* the low rush of the stream */
  nature.wind = natureLoop(brown, 'lowpass', 260, 0.4, 0.15);        /* wind */
  nature.leaves = natureLoop(white, 'highpass', 3200, 0.3, 0.004);   /* leaves rustling */
  var t0 = Date.now(); nature.nextBird = t0 + 1500; nature.nextDove = t0 + 9000 + Math.random() * 8000;
  nature.timer = setInterval(function(){
    if (!nature.gain) return;
    var t = c.currentTime, now = Date.now();
    try {
      nature.babble.filter.frequency.setTargetAtTime(900 + Math.random() * 1800, t, 0.05);
      nature.babble.gain.gain.setTargetAtTime(0.025 + Math.random() * 0.05, t, 0.04);
      if (Math.random() < 0.05) nature.wind.gain.gain.setTargetAtTime(0.06 + Math.random() * 0.28, t, 1.4);
      if (Math.random() < 0.05) nature.leaves.gain.gain.setTargetAtTime(Math.random() < 0.4 ? 0.02 + Math.random() * 0.02 : 0.003, t, 0.6);
      if (now >= nature.nextBird) { distantBird(); nature.nextBird = now + 2500 + Math.random() * 5000; }
      if (now >= nature.nextDove) { dove(); nature.nextDove = now + 16000 + Math.random() * 14000; }
    } catch(e){}
  }, 90);
  return true;
}
function natureVolume(on){
  if (!nature.gain) return;
  try { var t = audioCtx.currentTime; nature.gain.gain.cancelScheduledValues(t); nature.gain.gain.setValueAtTime(Math.max(0.0001, nature.gain.gain.value), t); nature.gain.gain.exponentialRampToValueAtTime(on ? 0.9 : 0.0001, t + 0.6); } catch(e){}
}
function stopNature(){
  if (nature.timer) { clearInterval(nature.timer); nature.timer = null; }
  var g = nature.gain, nodes = nature.nodes;
  nature.gain = null; nature.nodes = [];
  if (!g) return;
  try { var t = audioCtx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); } catch(e){}
  setTimeout(function(){ nodes.forEach(function(s){ try { s.stop(); } catch(e){} }); try { g.disconnect(); } catch(e){} }, 1000);
}
function natureRunning(){ return !!nature.gain; }

/* --- the two-minute timer --- */
function startShiftLoop(){
  var p = ui.panel, lastTurn = -1;
  try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function(l){ timers.wl = l; }).catch(function(){}); } catch(e){}
  birdSet(); bird.next = Date.now() + 900; bird.blinkAt = Date.now() + 1500;
  function tick(){
    var el = Date.now() - p.t0;
    if (el >= SHIFT_SECS * 1000) { finishShift(true); return; }
    var turn = Math.min(SHIFT_TURNS.length - 1, Math.floor(el / (SHIFT_TURN * 1000))), tt = SHIFT_TURNS[turn];
    if (turn !== lastTurn) {
      if (lastTurn !== -1 && p.sound) chime(0);
      lastTurn = turn; p.turn = turn;
      var k = $('#shiftKind'), ti = $('#shiftTitle'), tx = $('#shiftText'), card = $('.shift-card');
      if (k) k.textContent = (tt.kind === 'look' ? 'Look' : 'Listen') + ' · ' + (turn + 1) + ' of 4';
      if (ti) ti.textContent = tt.title; if (tx) tx.textContent = tt.text;
      if (card) card.setAttribute('data-kind', tt.kind);
      Array.prototype.forEach.call(document.querySelectorAll('.shift-step'), function(s){ var i = +s.getAttribute('data-turn'); s.className = 'shift-step' + (i < turn ? ' done' : i === turn ? ' on' : ''); });
    }
    var turnLeft = Math.ceil((SHIFT_TURN * 1000 - (el % (SHIFT_TURN * 1000))) / 1000), left = $('#shiftLeft');
    if (left) left.textContent = turnLeft + ' s';
    birdTick(Date.now(), p.sound);
  }
  tick();
  timers.loop = setInterval(tick, 100);
}
function finishShift(complete){
  var p = ui.panel; if (!p || p.type !== 'shift') return;
  var el = Date.now() - p.t0, mins = complete ? 2 : Math.max(0, Math.round(el / 60000));
  p.running = false; p.done = true; p.minutesDone = mins; p.after = -1;
  stopNature(); stopBird();
  if (p.before < 0) saveGrounding(p, mins);
  render();
}
function findEx(id){ return EXERCISES.filter(function(x){ return x.id === id; })[0]; }
function panelMove(p){
  var x = findEx(p.id), secs = x.mins * 60;
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to exercises') + '<h1>' + esc(x.name) + '</h1>' +
    '<section class="card"><div id="stepText"><p class="lbl">' + esc(x.dose) + '</p><ol class="prose" style="margin:0; padding-left:22px">' + x.steps.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
    '<p><strong>Tip:</strong> ' + esc(x.tip) + '</p></div>' + '<div><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="stepText">Read aloud</button></div>';
  if (x.standing) h += '<p class="hint">Only do standing exercises if your physiotherapist or doctor has said they are safe for you. Keep a counter or sturdy chair within reach.</p>';
  h += '<p class="hint">Stop if you feel sharp pain, chest pain or faint.</p></section>';
  if (x.id === 'walk') h += walkMetronome(p);
  h += '' +
    '<section class="card"><p class="eyebrow">Optional timer</p><div class="exnum" id="extime">' + (p.exRunning ? '' : Math.floor(secs / 60) + ':' + pad(secs % 60)) + '</div>' +
    '<div class="row">' + (p.exRunning ? '<button type="button" class="btn btn-quiet" data-action="ex-stop">Stop timer</button>' : '<button type="button" class="btn" data-action="ex-start">Start timer</button>') +
    '<button type="button" class="btn btn-primary" data-action="ex-done">Mark done</button></div></section></div>';
  return h;
}
/* ---------- rhythm walk metronome ---------- */
/* An optional beat to walk to, one beat per step: a higher tock for one foot and a lower one
   for the other, like the two sides of a wooden metronome. The sound is built the way a
   woodblock sounds: a very short, slightly pitch-dropping tone for the body of the knock,
   a quieter inharmonic overtone, and a click of filtered noise for the strike itself.
   Beats are scheduled ahead on the audio clock, not by timers, so the tempo stays even. */
var WALK_MIN = 20, WALK_MAX = 130, metro = { next:0, beat:0, timer:null, noise:null };
function walkMetronome(p){
  return '<section class="card"><div class="item-head"><h2>Walking beat</h2><span class="tag">Optional</span></div>' +
    '<p class="hint">A steady tick and tock to step to. Let your feet land on the beat and keep your eyes ahead. Headphones are not needed.</p>' +
    '<div class="walk-feet" aria-hidden="true"><span class="foot" id="footL">' + footSvg(false) + '<span>Tick</span></span><span class="foot" id="footR">' + footSvg(true) + '<span>Tock</span></span></div>' +
    '<div class="field"><div class="lbl-row"><label class="lbl" for="bpm">Speed</label><span class="val" id="bpmVal">' + p.bpm + ' steps a minute</span></div>' +
    '<div class="bpm-row"><button type="button" class="btn btn-quiet bpm-step" data-action="bpm-step" data-val="-5" aria-label="Slower">−</button>' +
    '<input type="range" id="bpm" min="' + WALK_MIN + '" max="' + WALK_MAX + '" step="1" value="' + p.bpm + '" data-bpm="1">' +
    '<button type="button" class="btn btn-quiet bpm-step" data-action="bpm-step" data-val="5" aria-label="Faster">+</button></div>' +
    '<div class="anchors"><span>Slow, ' + WALK_MIN + '</span><span>Brisk, ' + WALK_MAX + '</span></div>' +
    '<p class="hint">Start slower than feels natural. Around 80 to 100 suits most people at first.</p></div>' +
    '<button type="button" class="btn ' + (p.metro ? 'btn-quiet' : 'btn-primary') + ' btn-wide" data-action="metro-toggle">' + (p.metro ? 'Stop the beat' : 'Start the beat') + '</button></section>';
}
function footSvg(right){
  return '<svg viewBox="0 0 40 64" width="52" height="82"><g' + (right ? ' transform="translate(40 0) scale(-1 1)"' : '') + '>' +
    '<path d="M12 60c-6-1-8-8-7-16 1-9 2-17 9-22 6-4 12 0 12 8 0 7-3 11-4 17-1 6 0 13-10 13z"/>' +
    '<circle cx="9" cy="12" r="4.2"/><circle cx="17" cy="8" r="3.6"/><circle cx="24" cy="9" r="3.2"/><circle cx="29" cy="13" r="2.8"/><circle cx="32" cy="19" r="2.4"/></g></svg>';
}
function noiseBuffer(){
  if (metro.noise) return metro.noise;
  var len = Math.floor(audioCtx.sampleRate * 0.05), b = audioCtx.createBuffer(1, len, audioCtx.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  metro.noise = b; return b;
}
function woodKnock(t, high){
  var f = high ? 1660 : 1080, c = audioCtx;
  function tone(freq, peak, decay){
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.06, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.015);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(audioMaster); o.start(t); o.stop(t + decay + 0.02);
  }
  tone(f, high ? 0.42 : 0.46, 0.085);
  tone(f * 2.71, high ? 0.07 : 0.08, 0.035);
  var n = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain();
  n.buffer = noiseBuffer(); bp.type = 'bandpass'; bp.frequency.value = f * 1.6; bp.Q.value = 4;
  ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.28, t + 0.001); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  n.connect(bp); bp.connect(ng); ng.connect(audioMaster); n.start(t); n.stop(t + 0.03);
}
function lightFoot(high, delayMs){
  setTimeout(function(){
    var on = $(high ? '#footL' : '#footR'), off = $(high ? '#footR' : '#footL');
    if (on) on.classList.add('on'); if (off) off.classList.remove('on');
  }, Math.max(0, delayMs));
}
function metroRunning(){ return !!metro.timer; }
function startMetro(){
  if (!audioReady()) return false;
  try { var t0 = audioCtx.currentTime; audioMaster.gain.cancelScheduledValues(t0); audioMaster.gain.setValueAtTime(0.9, t0); } catch(e){}
  stopMetro();
  metro.next = audioCtx.currentTime + 0.1; metro.beat = 0;
  metro.timer = setInterval(function(){
    var q = ui.panel;
    if (!q || q.type !== 'move' || q.id !== 'walk' || !q.metro) { stopMetro(); return; }
    var spb = 60 / Math.max(WALK_MIN, Math.min(WALK_MAX, q.bpm || 90));
    while (metro.next < audioCtx.currentTime + 0.12) {
      var high = metro.beat % 2 === 0;
      woodKnock(metro.next, high);
      lightFoot(high, (metro.next - audioCtx.currentTime) * 1000);
      metro.next += spb; metro.beat++;
    }
  }, 25);
  return true;
}
function stopMetro(){ if (metro.timer) { clearInterval(metro.timer); metro.timer = null; } }
function setBpm(v){
  var p = ui.panel; if (!p) return;
  p.bpm = Math.max(WALK_MIN, Math.min(WALK_MAX, Math.round(v)));
  var lbl = $('#bpmVal'), r = $('#bpm');
  if (lbl) lbl.textContent = p.bpm + ' steps a minute';
  if (r && +r.value !== p.bpm) r.value = p.bpm;
}

function startExLoop(){
  var p = ui.panel, el = $('#extime');
  function tick(){
    var rem = Math.ceil((p.exEnd - Date.now()) / 1000);
    if (rem <= 0) { p.exRunning = false; if (timers.ex) { clearInterval(timers.ex); timers.ex = null; } if (el) el.textContent = 'Time'; render(); return; }
    if (el) el.textContent = Math.floor(rem / 60) + ':' + pad(rem % 60);
  }
  tick();
  if (p.exRunning) timers.ex = setInterval(tick, 250);
}

/* ---------- LEARN ---------- */
/* Four topics to read and reflect on (learn.js), plus the short quick reads. Reflections are
   saved as the patient types, stay on the phone, and only reach the clinic report when the
   patient ticks the box for them on the share screen. */
function learnTopics(){ return window.LEARN_TOPICS || []; }
function findTopic(id){ return learnTopics().filter(function(t){ return t.id === id; })[0]; }
function learnProgress(){
  var T = learnTopics(), read = T.filter(function(t){ return state.learn.read[t.id]; }).length;
  return { total:T.length, read:read, next:T.filter(function(t){ return !state.learn.read[t.id]; })[0] || null };
}
function reflectionCount(){ var n = 0, A = state.learn.answers; for (var k in A) if (A[k] && String(A[k]).trim()) n++; return n; }
function topicAnswered(t){ return t.reflect.filter(function(r){ var v = state.learn.answers[r.id]; return v && String(v).trim(); }).length; }
function viewLearn(){
  if (ui.lesson) return viewLesson();
  if (ui.learnTopic) { var t = findTopic(ui.learnTopic); if (t) return viewTopic(t); ui.learnTopic = null; }
  var T = learnTopics(), lp = learnProgress();
  var h = '<section class="card"><p>Short topics about how FND works and what helps, each with a few questions to reflect on. Read them in any order, as often as you like.</p>' +
          (guided() ? '<p class="hint">If something here connects with your own experience, it may be worth bringing to your next appointment.</p>' : '') + '</section>';
  if (!T.length) return h + '<section class="card"><p class="hint">The topics have not loaded. Close the app and open it again.</p></section>';
  h += '<div class="stack-s">' + T.map(function(t){
    var read = !!state.learn.read[t.id], ans = topicAnswered(t);
    return '<button type="button" class="learn-row" data-action="learn-open" data-id="' + t.id + '">' + learnArt(t.art, 'thumb') +
      '<span class="learn-row-text"><span class="t">' + esc(t.title) + '</span><span class="meta">' + esc(t.sum) + '</span>' +
      '<span class="meta learn-status">' + t.mins + ' min read' + (read ? ' · Read' : '') + (ans ? ' · ' + ans + ' of ' + t.reflect.length + ' reflections' : '') + '</span></span></button>';
  }).join('') + '</div>';
  h += '<h2>Quick reads</h2><div class="stack-s">' + LESSONS.map(function(l){
    return '<button type="button" class="tool-btn" data-action="lesson-open" data-id="' + l.id + '"><span class="item-head"><span class="t">' + esc(l.title) + '</span>' + (state.read[l.id] ? '<span class="tag">Read</span>' : '') + '</span><span class="meta">' + esc(l.sum) + ', ' + l.mins + ' min</span></button>';
  }).join('') + '</div>';
  h += '<section class="card"><p class="hint">This is general information, not a substitute for treatment. If something you read is upsetting, stop, use a grounding tool, and talk to your clinician.</p></section>';
  return h;
}
function topicSection(sec){
  var h = '<h2>' + esc(sec.h) + '</h2>' + (sec.p || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');
  if (sec.bullets) h += '<ul>' + sec.bullets.map(function(b){ return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>';
  if (sec.cards) h += '<div class="trap-list">' + sec.cards.map(function(c){
    return '<div class="trap"><p class="trap-name">' + esc(c.name) + '</p><p class="trap-what">' + esc(c.what) + '</p>' +
      '<p class="trap-ex"><span class="lbl-inline">The trap: </span>“' + esc(c.ex) + '”</p><p class="trap-bal"><span class="lbl-inline">More balanced: </span>“' + esc(c.bal) + '”</p></div>';
  }).join('') + '</div>';
  if (sec.note) h += '<p class="learn-note">' + esc(sec.note) + '</p>';
  return h;
}
function viewTopic(t){
  var T = learnTopics(), i = T.indexOf(t), next = T[i + 1], read = !!state.learn.read[t.id], A = state.learn.answers;
  var h = backBtn('learn-close', 'All topics') +
    '<div class="learn-hero">' + learnArt(t.art, 'hero') + '</div>' +
    '<div><p class="eyebrow">Learn · ' + t.mins + ' min read</p><h1>' + esc(t.title) + '</h1><p class="meta">' + esc(t.sum) + '</p></div>';
  if (t.care) h += '<section class="card card-care"><p>' + esc(t.care) + '</p><div class="row"><button type="button" class="btn btn-quiet" data-action="open-tool" data-type="ground">Ground myself now</button></div></section>';
  h += '<section class="card"><div class="row"><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="learnText">Read aloud</button></div>' +
       '<div class="prose learn-prose" id="learnText">' + t.sections.map(topicSection).join('') + '</div></section>';
  if (t.tools && t.tools.length) h += '<section class="card"><h2>Put it into practice</h2><div class="row">' + t.tools.map(function(x){
    return '<button type="button" class="btn" data-action="' + x[0] + '"' + (x[1] ? ' data-type="' + x[1] + '"' : '') + '>' + esc(x[2]) + '</button>';
  }).join('') + '</div></section>';
  h += '<section class="card"><h2>Reflect</h2><p class="hint">Optional. Write as much or as little as you like, now or another day. Your answers are saved as you type and stay on this phone. They are only included in a report to your clinic if you choose to include them when you share.</p>' +
       t.reflect.map(function(r){ return textField('learn', r.id, r.q, A[r.id] || '', 3, r.hint || ''); }).join('') + '</section>';
  h += '<div class="row"><button type="button" class="btn ' + (read ? 'btn-quiet' : 'btn-primary') + '" data-action="learn-read" data-id="' + t.id + '">' + (read ? 'Marked as read' : 'Mark as read') + '</button>' +
       (next ? '<button type="button" class="btn btn-quiet" data-action="learn-open" data-id="' + next.id + '">Next: ' + esc(next.title) + '</button>' : '') + '</div>';
  if (t.sources && t.sources.length) h += '<details class="card sources"><summary>Where this comes from</summary><ul>' + t.sources.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
  return h;
}
function viewLesson(){
  var l = LESSONS.filter(function(x){ return x.id === ui.lesson; })[0];
  if (!l) { ui.lesson = null; return viewLearn(); }
  var read = !!state.read[l.id];
  return backBtn('lesson-close', 'All topics') + '<h1>' + esc(l.title) + '</h1>' +
    '<section class="card"><div class="row"><button type="button" class="btn btn-quiet" data-action="read-aloud" data-text-id="lessonText">Read aloud</button></div><div class="prose" id="lessonText">' + l.body.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') + '</div></section>' +
    '<div class="row"><button type="button" class="btn ' + (read ? 'btn-quiet' : 'btn-primary') + '" data-action="lesson-read" data-id="' + l.id + '">' + (read ? 'Marked as read' : 'Mark as read') + '</button></div>';
}

/* ---------- MY PATH ---------- */
function viewPath(){
  var cur = ui.sub.path === 'course' ? 'learn' : (ui.sub.path || 'goals');
  var segs = [['goals','Goals'],['pacing','Pacing'],['daily','Today'],['flare','Flare plan'],['learn','Learn']];
  var h = '<div class="stack"><h1>My path</h1>' + seg('path', segs, cur);
  if (cur === 'learn') h += viewLearn();
  else if (cur === 'goals') h += viewGoals();
  else if (cur === 'pacing') h += viewPacing();
  else if (cur === 'daily') h += viewPlanToday();
  else h += viewFlare();
  return h + '</div>';
}

/* ---------- PLAN ---------- */
function goalMins(g, key){ return minutesOn(key, function(a){ return a.goalId === g.id; }); }
function goalRun(g){
  var d = new Date(), i = goalMins(g, dayKey(d)) >= g.target ? 0 : 1, run = 0;
  for (; i < 30; i++) {
    var key = dayKey(addDays(d, -i));
    if (key < g.since) break;
    if (goalMins(g, key) >= g.target) run++; else break;
  }
  return run;
}
function newGoal(){ return { name:'', target:'10', step:'5' }; }

function viewPlan(){
  var h = '<div class="stack"><h1>Plan</h1>' + seg('plan', [['goals','Goals'],['pacing','Pacing'],['today','Today'],['flare','Flare plan']], ui.sub.plan);
  if (ui.sub.plan === 'goals') h += viewGoals();
  else if (ui.sub.plan === 'pacing') h += viewPacing();
  else if (ui.sub.plan === 'today') h += viewPlanToday();
  else h += viewFlare();
  return h + '</div>';
}
function viewPacing(){
  var k = dayKey(new Date()), h = '';
  h += '<section class="card"><h2>Steady amounts</h2><p class="hint">Choose an amount you can do on a bad day and a good day alike. Do that much, then stop, even if you feel you could do more. Rest before you need it. Raise the amount in small steps.</p></section>';
  state.goals.forEach(function(g){
    var done = goalMins(g, k), pct = Math.min(100, Math.round(done / g.target * 100)), run = goalRun(g);
    var days = lastDays(7), confirm = ui.confirmDel === 'goal:' + g.id;
    h += '<article class="card"><div class="item-head"><h3>' + esc(g.name) + '</h3><span class="pill">' + g.target + ' min</span></div>' +
      '<div class="lbl-row"><span>Today</span><span class="val">' + done + ' of ' + g.target + ' min</span></div><div class="bar" role="img" aria-label="' + pct + ' percent of today\'s steady amount"><span style="width:' + pct + '%"></span></div>' +
      (done >= g.target ? '<p class="meta">You have reached your steady amount. Stopping here is part of the plan.</p>' : '') +
      '<div class="dots" role="img" aria-label="Last 7 days">' + days.map(function(d){
        var on = goalMins(g, d) >= g.target;
        return '<div class="dotcol"><span class="dot ' + (on ? 'dot-on' : '') + '" title="' + esc(fmtDay(d)) + (on ? ', met' : ', not met') + '"></span><span>' + parseKey(d).toLocaleDateString(undefined, {weekday:'narrow'}) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="row">' + [5,10,15].map(function(m){ return '<button type="button" class="btn" data-action="goal-add" data-id="' + g.id + '" data-min="' + m + '">+' + m + ' min</button>'; }).join('') +
      '<button type="button" class="btn btn-quiet" data-action="goal-undo" data-id="' + g.id + '">Undo last</button></div>';
    if (run >= 3 && g.dismissed !== k) {
      h += '<div class="card card-good"><p>You have met this target ' + run + ' days in a row. If it has felt manageable, you could raise it from ' + g.target + ' to ' + (g.target + g.step) + ' min.</p>' +
        '<div class="row"><button type="button" class="btn btn-primary" data-action="goal-step" data-id="' + g.id + '">Raise to ' + (g.target + g.step) + ' min</button><button type="button" class="btn btn-quiet" data-action="goal-dismiss" data-id="' + g.id + '">Not yet</button></div></div>';
    }
    h += '<div><button type="button" class="link ' + (confirm ? 'link-danger' : '') + '" data-action="goal-del" data-id="' + g.id + '">' + (confirm ? 'Tap again to remove goal' : 'Remove goal') + '</button></div></article>';
  });
  if (ui.goalForm) {
    var d = ui.draftGoal;
    h += '<section class="card"><h2>New steady amount</h2>' +
      '<div class="field"><label class="lbl" for="f-name">Activity</label><input type="text" id="f-name" value="' + esc(d.name) + '" placeholder="For example, walking or cooking" data-draft="goal" data-field="name"></div>' +
      '<div class="field"><label class="lbl" for="f-target">Steady amount, in minutes a day</label><input type="number" inputmode="numeric" min="1" id="f-target" value="' + esc(d.target) + '" data-draft="goal" data-field="target"><span class="hint">Start lower than you think you need to.</span></div>' +
      '<div class="field"><label class="lbl" for="f-step">Small step up, in minutes</label><input type="number" inputmode="numeric" min="1" id="f-step" value="' + esc(d.step) + '" data-draft="goal" data-field="step"></div>' +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="goal-save">Save goal</button><button type="button" class="btn btn-quiet" data-action="goal-cancel">Cancel</button></div></section>';
  } else {
    h += '<div><button type="button" class="btn btn-primary" data-action="goal-new">Add an activity</button></div>';
  }
  return h;
}
function viewPlanToday(){
  var k = dayKey(new Date()), items = state.plan[k] || [];
  var h = '<section class="card"><h2>Today\'s plan</h2><p class="hint">Mix activity with rest, and put rest in before you need it.</p>';
  if (items.length) {
    h += '<div class="stack-s">' + items.map(function(i){
      var kindLabel = (KINDS.filter(function(x){ return x[0] === i.kind; })[0] || ['', ''])[1];
      return '<div class="plan-row"><button type="button" class="check" aria-pressed="' + !!i.done + '" aria-label="Mark done: ' + esc(i.text) + '" data-action="plan-toggle" data-id="' + i.id + '">' + (i.done ? '✓' : '') + '</button>' +
        '<span class="plan-text">' + esc(i.text) + ' <span class="pill ' + (i.kind === 'rest' ? 'pill-good' : '') + '">' + esc(kindLabel) + '</span></span>' +
        '<button type="button" class="x" aria-label="Remove ' + esc(i.text) + '" data-action="plan-del" data-id="' + i.id + '">×</button></div>';
    }).join('') + '</div>';
  } else {
    h += '<p class="hint">Nothing planned yet.</p>';
  }
  h += '</section><section class="card"><h3>Add to today</h3>' +
    '<div class="field"><label class="lbl" for="planText">What</label><input type="text" id="planText" placeholder="For example, short walk or 20 minute rest" autocomplete="off"></div>' +
    '<div class="chips" role="group" aria-label="Type">' + KINDS.map(function(x){
      return '<button type="button" class="chip" aria-pressed="' + (ui.planKind === x[0]) + '" data-action="pick" data-key="planKind" data-val="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div><div><button type="button" class="btn btn-primary" data-action="plan-add">Add</button></div></section>';
  return h;
}
function viewFlare(){
  var f = state.flare;
  return '<section class="card"><h2>If symptoms flare</h2><p class="hint">Setbacks are common and do not mean you are back at the start. Write this while you are feeling well so it is ready when you need it. Session 10 of the course builds a fuller maintenance plan.</p>' +
    textField('flare','signs','My early warning signs',f.signs,3,'For example, poor sleep, tense shoulders, avoiding things') +
    textField('flare','helps','What usually helps',f.helps,3,'For example, paced breathing, short walk, calling a friend') +
    textField('flare','pause','What I can put on hold for a few days',f.pause,3,'') +
    textField('flare','contacts','Who I can contact',f.contacts,3,'Names and numbers for my care team and support people') + '</section>';
}

/* ---------- EXPORT ---------- */
function viewExport(){
  var e = ui.exp;
  var h = '<div class="stack">' + backBtn('goto-today', 'Back') + '<h1>Share with my clinic</h1>';
  if (window.SG_PREVIEW) h += '<div><span class="badge">Preview</span> <span class="hint">Sharing and saving files work in the installed app, not in this preview.</span></div>';
  h += '<section class="card"><p>Build a report from your entries and send it with the share sheet: email, AirDrop, Messages, or save to Files. Nothing is sent until you choose where it goes.</p>' +
    '<div class="field"><span class="lbl">Time period</span><div class="chips" role="group">' + [[14,'Last 2 weeks'],[28,'Last 4 weeks'],[84,'Last 12 weeks'],[0,'Everything']].map(function(r){
      return '<button type="button" class="chip chip-radio" aria-pressed="' + (e.range === r[0]) + '" data-action="exp-range" data-val="' + r[0] + '">' + r[1] + '</button>';
    }).join('') + '</div></div>' +
    '<div class="field"><span class="lbl">What to send</span><div class="chips" role="group">' +
      '<button type="button" class="chip" aria-pressed="' + e.pdf + '" data-action="exp-toggle" data-key="pdf">PDF report, easy to read</button>' +
      '<button type="button" class="chip" aria-pressed="' + e.csv + '" data-action="exp-toggle" data-key="csv">CSV files, for spreadsheets</button>' +
      '<button type="button" class="chip" aria-pressed="' + e.backup + '" data-action="exp-toggle" data-key="backup">Backup file, to restore on a new phone</button>' +
    '</div></div>' +
    (reflectionCount() ? '<div class="field"><span class="lbl">Your Learn reflections</span><label class="check-row"><input type="checkbox" data-exp-reflect="1"' + (e.reflect ? ' checked' : '') + '> Include my written reflections in this report</label>' +
      '<p class="hint">Off by default. Your reflections are private unless you tick this. You have answered ' + reflectionCount() + ' reflection question' + (reflectionCount() === 1 ? '' : 's') + '.</p></div>' : '') +
    (state.moments.length ? '<div class="field"><span class="lbl">Your unpacked moments</span><label class="check-row"><input type="checkbox" data-exp-moments="1"' + (e.moments ? ' checked' : '') + '> Include my unpacked moments in this report</label>' +
      '<p class="hint">Off by default. These can mention the people in your life, so they stay private unless you tick this.</p></div>' : '') +
    '<button type="button" class="btn btn-primary btn-wide" data-action="exp-share" ' + (e.busy || !(e.pdf || e.csv || e.backup) ? 'disabled' : '') + '>' + (e.busy ? 'Preparing…' : 'Share') + '</button>';
  if (e.links) {
    h += '<p class="hint">Sharing is not available in this browser, so here are the files to save instead.</p><div class="row">' + e.links.map(function(l){
      return '<a class="btn" href="' + l.url + '" download="' + esc(l.name) + '">' + esc(l.name) + '</a>';
    }).join('') + '</div>';
  }
  h += '</section>';
  h += '<section class="card"><h2>What is in the report</h2><ul class="prose" style="padding-left:22px"><li>Summary: episodes, average severity, common triggers and warning signs, what helped</li><li>Symptom log, one entry per episode</li><li>Grounding activity record with stress before and after</li><li>Weekly summaries and daily mood and energy check-ins</li><li>Thought records</li><li>Your Learn reflections, only if you tick the box above</li><li>Your unpacked moments, only if you tick the box above</li><li>Pacing goals and activity minutes</li><li>Course homework answers</li></ul>' +
       '<p class="hint">The report carries no name. Add your name in the message when you send it, or your clinic may ask you to.</p></section>';
  return h + '</div>';
}
function inRange(ts, days){ if (!days) return true; return ts >= Date.now() - days * 86400000; }
function rangeLabel(days){ return days ? 'Last ' + days + ' days, ' + fmtDay(dayKey(addDays(new Date(), -days + 1))) + ' to ' + fmtDay(dayKey(new Date())) : 'All entries'; }
function csvCell(v){
  if (v == null) return '';
  if (Array.isArray(v)) v = v.join('; ');
  v = String(v);
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
function csv(rows){ return '﻿' + rows.map(function(r){ return r.map(csvCell).join(','); }).join('\r\n') + '\r\n'; }
function buildCSVs(days){
  var out = [];
  var eps = state.episodes.filter(function(e){ return inRange(e.ts, days); });
  out.push({ name:'symptom-log.csv', text: csv([['date_time','symptoms','description','location','severity_1_3','duration','unit','triggers','early_warning_signs','improved_with','impact_on_day','impact_on_others']].concat(eps.map(function(e){
    return [fmtISO(e.ts), e.types, e.description, e.location, e.severity || '', e.duration == null ? '' : e.duration, e.durUnit || '', (e.triggers || []).concat(e.triggerText ? [e.triggerText] : []), (e.warnings || []).concat(e.warningText ? [e.warningText] : []), (e.helped || []).concat(e.helpedText ? [e.helpedText] : []), e.impactDay, e.impactOthers];
  }))) });
  var gr = state.grounding.filter(function(g){ return inRange(g.ts, days); });
  out.push({ name:'grounding-record.csv', text: csv([['date_time','skill','stress_before_0_10','stress_after_0_10','minutes','notes']].concat(gr.map(function(g){ return [fmtISO(g.ts), g.skill, g.before >= 0 ? g.before : '', g.after >= 0 ? g.after : '', g.minutes || '', g.note]; }))) });
  var ck = Object.keys(state.checkins).sort().filter(function(k){ return inRange(parseKey(k).getTime() + 43200000, days); });
  out.push({ name:'daily-checkins.csv', text: csv([['date','mood_1_5','energy_1_5']].concat(ck.map(function(k){ var c = state.checkins[k]; return [k, c.mood || '', c.energy || '']; }))) });
  var wk = Object.keys(state.weeks).sort().filter(function(k){ return inRange(parseKey(k).getTime() + 6 * 86400000, days); });
  out.push({ name:'weekly-summary.csv', text: csv([['week_starting','recognised_warning_signs','shortened_or_stopped_episodes','overall_functioning_0_10','notes']].concat(wk.map(function(k){ var w = state.weeks[k]; return [k, w.signs, w.stopped, w.functioning == null ? '' : w.functioning, w.notes]; }))) });
  var th = state.thoughts.filter(function(t){ return inRange(t.ts, days); });
  out.push({ name:'thought-records.csv', text: csv([['date_time','situation','thought','emotions','feeling_before_pct','thinking_traps','evidence_for','evidence_against','balanced_thought','feeling_after_pct']].concat(th.map(function(t){ return [fmtISO(t.ts), t.situation, t.thought, t.emotions, t.before, t.traps, t.evFor, t.evAgainst, t.balanced, t.after]; }))) });
  var fe = state.feelings.filter(function(f){ return inRange(f.ts, days); });
  out.push({ name:'feelings-log.csv', text: csv([['date_time','feeling_family','feeling_word','intensity_0_10','body_sensations','urges','chosen_action','notes']].concat(fe.map(function(f){ var fam = familyById(f.family); return [fmtISO(f.ts), fam ? fam.name : f.family, f.word, f.intensity, f.sensations, f.urges, f.action, f.note]; }))) });
  var at = allAttempts().filter(function(x){ return inRange(x.ts, days); });
  out.push({ name:'goal-steps.csv', text: csv([['date_time','goal','step','result','notes']].concat(at.map(function(x){ var st = byId(x.goal.steps, x.a.stepId); return [fmtISO(x.ts), x.goal.name, st ? st.text : '', x.a.result, x.a.note]; }))) });
  var wn = Object.keys(state.wins).sort().filter(function(k){ return inRange(parseKey(k).getTime() + 43200000, days); });
  out.push({ name:'went-well.csv', text: csv([['date','what_went_well']].concat(wn.map(function(k){ return [k, state.wins[k]]; }))) });
  var pt = state.patterns.filter(function(x){ return inRange(x.ts, days); });
  out.push({ name:'pattern-checks.csv', text: csv([['date_time','patterns']].concat(pt.map(function(x){ return [fmtISO(x.ts), x.items]; }))) });
  var act = state.activity.filter(function(a){ return inRange(a.ts, days); });
  out.push({ name:'activity.csv', text: csv([['date_time','kind','label','minutes']].concat(act.map(function(a){ return [fmtISO(a.ts), a.kind, a.label, a.minutes]; }))) });
  if (ui.exp.moments) {
    var mo = state.moments.filter(function(m){ return inRange(m.ts, days); });
    out.push({ name:'moments-log.csv', text: csv([['date_time','what_happened','who','body_noticed','on_the_surface','underneath','what_i_needed','what_i_did','summary']].concat(mo.map(function(m){ return [fmtISO(m.ts), m.what, m.who === 'Other' && m.whoOther ? m.whoOther : m.who, m.body, m.surface, m.under, m.need, (m.did || []).map(function(x){ return x === 'Other' && m.didOther ? m.didOther : x; }), momentSummary(m)]; }))) });
  }
  if (ui.exp.reflect) {
    var rows = [['topic','question','answer']];
    learnTopics().forEach(function(t){ t.reflect.forEach(function(r){ var v = state.learn.answers[r.id]; if (v && String(v).trim()) rows.push([t.title, r.q, v]); }); });
    out.push({ name:'learn-reflections.csv', text: csv(rows) });
  }
  return out;
}
function buildPDF(days){
  var J = window.jspdf && window.jspdf.jsPDF; if (!J) return null;
  var doc = new J({ unit:'pt', format:'letter' }), W = 612, M = 54, y = M, LH = 14;
  function page(){ doc.addPage(); y = M; }
  function need(n){ if (y + n > 792 - M) page(); }
  function h1(t){ need(40); doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.text(t, M, y); y += 26; }
  function h2(t){ need(34); y += 8; doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text(t, M, y); y += 18; }
  function h3(t){ need(24); y += 4; doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(t, M, y); y += 14; }
  function p(t, size, style){
    doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size || 10.5);
    var lines = doc.splitTextToSize(String(t), W - 2 * M);
    lines.forEach(function(l){ need(LH); doc.text(l, M, y); y += LH; });
  }
  function kv(k, v){ if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; p(k + ': ' + (Array.isArray(v) ? v.join(', ') : v)); }
  function hr(){ need(10); doc.setDrawColor(190); doc.line(M, y, W - M, y); y += 8; }

  h1('Steady Ground report');
  p('Generated ' + new Date().toLocaleString() + '. ' + rangeLabel(days) + '.', 10);
  p('Self-reported entries from the Steady Ground app, for discussion with the care team. No name is attached; the sender should identify themselves in their message.', 10, 'italic');
  if (state.profile.about) { h2('About me, in my words'); p(state.profile.about); }

  var pr0 = state.profile;
  if (pr0.presentation && pr0.presentation.length || pr0.matters) { h2('How my FND shows up'); kv('Presentation', pr0.presentation); kv('Gets in the way most', pr0.difficulties); kv('If symptoms got in the way less, I would be', pr0.matters); }
  var at = allAttempts().filter(function(x){ return inRange(x.ts, days); });
  h2('Real-world goals');
  if (!state.fgoals.length) p('No goals set yet.');
  state.fgoals.forEach(function(g){ h3(g.name + (g.done ? ' (reached)' : '')); kv('Why it matters', g.why); kv('Steps', g.steps.map(function(st){ return (st.done ? '[done] ' : '[ ] ') + st.text; })); var ga = at.filter(function(x){ return x.goal.id === g.id; }); kv('Tries in this period', ga.length + (ga.length ? ' (' + ga.filter(function(x){ return x.a.result !== 'not'; }).length + ' did all or part)' : '')); ga.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(x){ var st = byId(g.steps, x.a.stepId); p(fmtWhen(x.ts) + ' \u2014 ' + (st ? st.text : '') + ' \u2014 ' + ({did:'did it', part:'did part', not:'did not manage'})[x.a.result] + (x.a.note ? ' \u2014 ' + x.a.note : '')); }); });
  var wn = Object.keys(state.wins).sort().filter(function(k){ return inRange(parseKey(k).getTime() + 43200000, days); });
  if (wn.length) { h2('What went well'); wn.forEach(function(k){ p(fmtDay(k) + ': ' + state.wins[k]); }); }
  var pt = state.patterns.filter(function(x){ return inRange(x.ts, days); });
  if (pt.length) { h2('Pattern checks'); pt.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(x){ p(fmtWhen(x.ts) + ': ' + joinList(x.items).toLowerCase()); }); }
  var eps = state.episodes.filter(function(e){ return inRange(e.ts, days); });
  h2('Symptom summary');
  kv('Episodes logged', eps.length);
  if (eps.length) {
    var sev = eps.filter(function(e){ return e.severity; }).map(function(e){ return e.severity; });
    if (sev.length) kv('Average severity (1 mild to 3 severe)', avg(sev).toFixed(1));
    var byDay = {}; eps.forEach(function(e){ byDay[dayKey(e.ts)] = 1; }); kv('Days with at least one episode', Object.keys(byDay).length);
    var s = topCounts(eps, 'types', 5); if (s.length) kv('Most common symptoms', s.map(function(x){ return x[0] + ' (' + x[1] + ')'; }));
    var c = topCounts(eps, 'triggers', 5); if (c.length) kv('Most common triggers', c.map(function(x){ return x[0] + ' (' + x[1] + ')'; }));
    var w = topCounts(eps, 'warnings', 5); if (w.length) kv('Early warning signs noticed', w.map(function(x){ return x[0] + ' (' + x[1] + ')'; }));
    var hp = topCounts(eps, 'helped', 5); if (hp.length) kv('Improved with', hp.map(function(x){ return x[0] + ' (' + x[1] + ')'; }));
  }
  var gr = state.grounding.filter(function(g){ return inRange(g.ts, days); });
  kv('Grounding practice records', gr.length);
  var drops = gr.filter(function(g){ return g.before >= 0 && g.after >= 0; });
  if (drops.length) kv('Average stress change after grounding', (avg(drops.map(function(g){ return g.before; })).toFixed(1) + ' to ' + avg(drops.map(function(g){ return g.after; })).toFixed(1) + ' out of 10'));
  var ck = Object.keys(state.checkins).filter(function(k){ return inRange(parseKey(k).getTime() + 43200000, days); });
  var moods = [], energies = []; ck.forEach(function(k){ var c = state.checkins[k]; if (c.mood) moods.push(c.mood); if (c.energy) energies.push(c.energy); });
  if (moods.length) kv('Average mood (1 to 5)', avg(moods).toFixed(1) + ' over ' + moods.length + ' days');
  if (energies.length) kv('Average energy (1 to 5)', avg(energies).toFixed(1) + ' over ' + energies.length + ' days');
  var act = state.activity.filter(function(a){ return inRange(a.ts, days) && a.kind !== 'calm'; });
  kv('Activity minutes logged', act.reduce(function(s,a){ return s + a.minutes; }, 0));
  state.goals.forEach(function(g){ var met = lastDays(days || 28).filter(function(d){ return goalMins(g, d) >= g.target; }).length; kv('Pacing goal "' + g.name + '"', g.target + ' min a day, met on ' + met + ' days'); });
  var lpr = learnProgress(); if (lpr.total) kv('Learn topics read', lpr.read + ' of ' + lpr.total);
  kv('Thought records completed', state.thoughts.filter(function(t){ return inRange(t.ts, days); }).length);

  var wk = Object.keys(state.weeks).sort().filter(function(k){ return inRange(parseKey(k).getTime() + 6 * 86400000, days); });
  if (wk.length) { h2('Weekly summaries'); wk.forEach(function(k){ var w = state.weeks[k]; h3('Week of ' + fmtDay(k)); kv('Recognised early warning signs', w.signs); kv('Shortened or stopped episodes', w.stopped); kv('Overall functioning (0 to 10)', w.functioning); kv('Notes', w.notes); }); }

  h2('Symptom log');
  if (!eps.length) p('No episodes logged in this period.');
  eps.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(e){
    h3(fmtWhen(e.ts) + (e.severity ? ' — ' + SEV[e.severity].toLowerCase() : ''));
    kv('Symptoms', e.types); kv('Description', e.description); kv('Location in body', e.location);
    if (e.duration != null) kv('Duration', e.duration + ' ' + (e.durUnit || 'min'));
    kv('Triggers', (e.triggers || []).concat(e.triggerText ? [e.triggerText] : []));
    kv('Early warning signs', (e.warnings || []).concat(e.warningText ? [e.warningText] : []));
    kv('Improved with', (e.helped || []).concat(e.helpedText ? [e.helpedText] : []));
    kv('Impact on day', e.impactDay); kv('Impact on others', e.impactOthers);
  });

  h2('Grounding activity record');
  if (!gr.length) p('No grounding records in this period.');
  gr.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(g){ p(fmtWhen(g.ts) + ' — ' + g.skill + ' — stress before ' + (g.before >= 0 ? g.before : 'n/a') + ', after ' + (g.after >= 0 ? g.after : 'n/a') + (g.minutes ? ' (' + g.minutes + ' min)' : '') + (g.note ? ' — ' + g.note : '')); });

  if (ck.length) { h2('Daily check-ins'); ck.sort().forEach(function(k){ var c = state.checkins[k]; p(fmtDay(k) + ': mood ' + (c.mood || '-') + ' / 5, energy ' + (c.energy || '-') + ' / 5'); }); }

  var fe = state.feelings.filter(function(f){ return inRange(f.ts, days); });
  if (fe.length) { h2('Feelings log'); fe.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(f){ var fam = familyById(f.family); h3(fmtWhen(f.ts) + ' — ' + (fam ? fam.name : '') + (f.word ? ', ' + f.word.toLowerCase() : '') + ' (' + f.intensity + '/10)'); kv('In the body', f.sensations); kv('Urge', f.urges); kv('Chose', f.action); kv('Notes', f.note); }); }
  var th = state.thoughts.filter(function(t){ return inRange(t.ts, days); });
  if (th.length) { h2('Thought records'); th.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(t){ h3(fmtWhen(t.ts)); kv('Situation', t.situation); kv('Thought', t.thought); kv('Feelings', t.emotions); kv('Feeling strength before', t.before + '%'); kv('Thinking traps', t.traps); kv('Supports the thought', t.evFor); kv('Does not fit', t.evAgainst); kv('Fairer thought', t.balanced); kv('Feeling strength after', t.after + '%'); }); }

  var mo = ui.exp.moments ? state.moments.filter(function(m){ return inRange(m.ts, days); }) : [];
  if (mo.length) {
    h2('Unpacked moments');
    p('Shared at the patient\'s choice.', 9.5, 'italic');
    mo.slice().sort(function(a,b){ return a.ts - b.ts; }).forEach(function(m){ h3(fmtWhen(m.ts) + (m.what ? ' — ' + m.what : '')); p(momentSummary(m)); });
  }
  if (ui.exp.reflect && reflectionCount()) {
    h2('Learn reflections');
    p('Shared at the patient\'s choice.', 9.5, 'italic');
    learnTopics().forEach(function(t){
      var lines = t.reflect.filter(function(r){ var v = state.learn.answers[r.id]; return v && String(v).trim(); });
      if (!lines.length) return;
      h3(t.title);
      lines.forEach(function(r){ kv(r.q, state.learn.answers[r.id]); });
    });
  }
  var f = state.flare;
  if (f.signs || f.helps || f.pause || f.contacts) { h2('Flare plan'); kv('Early warning signs', f.signs); kv('What usually helps', f.helps); kv('What I can put on hold', f.pause); kv('Who I can contact', f.contacts); }

  var n = doc.getNumberOfPages();
  for (var i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(120); doc.text('Steady Ground — page ' + i + ' of ' + n, W - M, 792 - 30, {align:'right'}); doc.setTextColor(0); }
  return doc.output('blob');
}
function buildBackup(){ return JSON.stringify({ app:'steady-ground', version:2, exported:new Date().toISOString(), data:state }); }
function doExport(){
  var e = ui.exp, days = e.range, files = [], stamp = dayKey(new Date());
  try {
    if (e.pdf) { var b = buildPDF(days); if (b) files.push(new File([b], 'steady-ground-report-' + stamp + '.pdf', {type:'application/pdf'})); }
    if (e.csv) buildCSVs(days).forEach(function(c){ files.push(new File([c.text], c.name.replace('.csv', '-' + stamp + '.csv'), {type:'text/csv'})); });
    if (e.backup) files.push(new File([buildBackup()], 'steady-ground-backup-' + stamp + '.json', {type:'application/json'}));
  } catch(err){ e.busy = false; toast('Could not build the report'); render(); return; }
  if (!files.length) { e.busy = false; render(); return; }
  var finish = function(msg){ e.busy = false; if (msg) toast(msg); render(); };
  if (navigator.share && navigator.canShare && navigator.canShare({files:files})) {
    navigator.share({ files:files, title:'Steady Ground report', text:'Steady Ground report, ' + rangeLabel(days) }).then(function(){ state.stats.shares = (state.stats.shares || 0) + 1; save(); finish('Shared'); }, function(err){ finish(err && err.name === 'AbortError' ? '' : 'Sharing did not complete'); });
  } else {
    if (e.links) e.links.forEach(function(l){ try { URL.revokeObjectURL(l.url); } catch(x){} });
    e.links = files.map(function(f){ return { name:f.name, url:URL.createObjectURL(f) }; });
    state.stats.shares = (state.stats.shares || 0) + 1; save();
    finish('');
  }
}
function buildICS(time){
  var hm = time.split(':'), d = new Date(); d.setHours(+hm[0], +hm[1], 0, 0); if (d < new Date()) d = addDays(d, 1);
  var start = dayKey(d).replace(/-/g, '') + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  var end = dayKey(d).replace(/-/g, '') + 'T' + pad(d.getHours()) + pad(d.getMinutes() + 5 > 59 ? d.getMinutes() : d.getMinutes() + 5) + '00';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Steady Ground//EN','BEGIN:VEVENT','UID:steady-ground-daily-' + time.replace(':','') + '@local','DTSTAMP:' + start + 'Z','DTSTART:' + start,'DTEND:' + end,'RRULE:FREQ=DAILY','SUMMARY:' + (currentGoal() ? 'Steady Ground: ' + currentGoal().name.replace(/[,;\\]/g, ' ') : 'Steady Ground practice'),'DESCRIPTION:' + (currentGoal() ? 'Ready to try the step you planned? Open Steady Ground on your home screen.' : 'Two minutes of paced breathing or grounding. Open Steady Ground on your home screen.'),'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Steady Ground practice','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
}
function importBackup(file){
  var r = new FileReader();
  r.onload = function(){
    try {
      var j = JSON.parse(r.result); if (!j || j.app !== 'steady-ground' || !j.data) throw new Error('bad');
      var d = mergeInto(j.data), added = 0;
      function mergeList(a, b){ var ids = {}; a.forEach(function(x){ ids[x.id] = 1; }); b.forEach(function(x){ if (!ids[x.id]) { a.push(x); added++; } }); }
      mergeList(state.episodes, d.episodes); state.episodes.sort(function(a,b){ return b.ts - a.ts; });
      mergeList(state.grounding, d.grounding); state.grounding.sort(function(a,b){ return b.ts - a.ts; });
      mergeList(state.thoughts, d.thoughts); state.thoughts.sort(function(a,b){ return b.ts - a.ts; });
      mergeList(state.goals, d.goals); mergeList(state.activity, d.activity);
      mergeList(state.feelings, d.feelings); state.feelings.sort(function(a,b){ return b.ts - a.ts; });
      mergeList(state.moments, d.moments || []); state.moments.sort(function(a,b){ return b.ts - a.ts; });
      mergeList(state.fgoals, d.fgoals || []); mergeList(state.patterns, d.patterns || []);
      for (k in d.wins) if (!state.wins[k]) { state.wins[k] = d.wins[k]; added++; }
      for (k in d.profile) if (!state.profile[k] && d.profile[k]) state.profile[k] = d.profile[k];
      for (k in d.badges) if (!state.badges[k]) state.badges[k] = d.badges[k];
      var k;
      for (k in d.checkins) if (!state.checkins[k]) { state.checkins[k] = d.checkins[k]; added++; }
      for (k in d.weeks) if (!state.weeks[k]) { state.weeks[k] = d.weeks[k]; added++; }
      for (k in d.plan) if (!state.plan[k]) { state.plan[k] = d.plan[k]; added++; }
      for (k in d.course.answers) if (state.course.answers[k] == null || state.course.answers[k] === '') { state.course.answers[k] = d.course.answers[k]; added++; }
      for (k in d.course.done) if (!state.course.done[k]) state.course.done[k] = d.course.done[k];
      for (k in d.course.read) if (!state.course.read[k]) state.course.read[k] = d.course.read[k];
      for (k in d.read) if (!state.read[k]) state.read[k] = d.read[k];
      if (d.learn) { for (k in d.learn.read || {}) if (!state.learn.read[k]) state.learn.read[k] = d.learn.read[k]; for (k in d.learn.answers || {}) if (!state.learn.answers[k]) { state.learn.answers[k] = d.learn.answers[k]; added++; } }
      for (k in d.flare) if (!state.flare[k] && d.flare[k]) state.flare[k] = d.flare[k];
      state.setup.done = true; save();
      ui.importMsg = 'Restored ' + added + ' entries from the backup.';
    } catch(err){ ui.importMsg = 'That file is not a Steady Ground backup.'; }
    render();
  };
  r.readAsText(file);
}

/* ---------- render ---------- */
function render(){
  stopTimers();
  var v = $('#view'), h, tabs = $('#tabs'), header = $('#header');
  applyPrefs();
  try { if (window.speechSynthesis && ui.speaking) { window.speechSynthesis.cancel(); ui.speaking = false; } } catch(e){}
  if (ui.tab === 'course' || ui.tab === 'learn') { ui.tab = 'path'; ui.sub.path = 'learn'; }
  if (ui.tab === 'plan') { ui.tab = 'path'; ui.sub.path = ui.sub.plan === 'today' ? 'daily' : ui.sub.plan; }
  if (ui.tab === 'track') { ui.tab = 'tools'; ui.sub.tools = 'log'; }
  if (ui.tab === 'milestones') { ui.tab = 'progress'; ui.sub.progress = 'milestones'; }
  if (!state.setup.done) { h = viewWelcome(); if (tabs) tabs.hidden = true; if (header) header.hidden = true; }
  else {
    checkMilestones();
    if (tabs) tabs.hidden = false; if (header) header.hidden = false;
    if (ui.tab === 'today') h = viewToday();
    else if (ui.tab === 'progress') h = viewProgress();
    else if (ui.tab === 'path') h = viewPath();
    else if (ui.tab === 'toolkit') h = viewToolkit();
    else if (ui.tab === 'pattern') h = viewPattern();
    else if (ui.tab === 'me') h = viewMe();
    else if (ui.tab === 'track') h = viewTrack();
    else if (ui.tab === 'tools') h = viewTools();
    else if (ui.tab === 'plan') h = viewPlan();
    else if (ui.tab === 'export') h = viewExport();
    else if (ui.tab === 'settings') h = viewSettings();
    else h = viewToday();
    if (ui.celebrate.length) h += viewCelebration();
  }
  v.innerHTML = h;
  applyColour();
  var navTab = ({ plan:'path', course:'path', track:'tools', toolkit:'today', pattern:'today', milestones:'progress' })[ui.tab] || ui.tab;
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function(b){
    if (b.getAttribute('data-tab') === navTab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  saveUi();
  if (ui.scrollTop) { try { window.scrollTo(0, 0); } catch(e){} ui.scrollTop = false; }
  if (ui.refocus) { var f = $(ui.refocus); if (f) { try { f.focus({preventScroll:true}); } catch(e){} } ui.refocus = null; }
  var p = ui.panel;
  if (ui.tab === 'tools' && p && p.before !== undefined) {
    if (p.type === 'breath' && p.running) startBreathLoop();
    if (p.type === 'bls' && p.running) startBlsLoop();
    if (p.type === 'shift' && p.running) startShiftLoop();
    if (p.type === 'move' && p.exRunning) startExLoop();
  }
}
function go(tab, sub){ ui.tab = tab; if (sub) { for (var k in sub) ui.sub[k] = sub[k]; } ui.panel = null; ui.lesson = null; ui.learnTopic = null; ui.scrollTop = true; render(); }
function openTool(type){
  ui.tab = 'tools'; ui.sub.tools = 'calm'; ui.lesson = null; ui.learnTopic = null; ui.scrollTop = true;
  var preset = (ui.pacePreset && PACES[ui.pacePreset]) ? ui.pacePreset : '4-6'; ui.pacePreset = null;
  if (type === 'breath') ui.panel = {type:'breath', pace:preset, mins:3, running:false, done:false};
  else if (type === 'ground') ui.panel = {type:'ground', step:0};
  else if (type === 'pmr') ui.panel = {type:'pmr', step:0};
  else if (type === 'scan') { ui.sub.tools = 'feel'; ui.panel = {type:'scan', step:0}; }
  else if (type === 'shift') ui.panel = {type:'shift', running:false, done:false, sound:true};
  else if (type === 'bls') ui.panel = {type:'bls', mode:null, secs:60, speed:'slow', running:false, done:false};
  render();
}

/* ---------- actions ---------- */
function draftFor(name){
  if (name === 'ep') return ui.draftEp;
  if (name === 'th') return ui.draftTh;
  if (name === 'gr') return ui.draftGr;
  if (name === 'goal') return ui.draftGoal;
  if (name === 'feel') return ui.draftFeel;
  if (name === 'moment') return ui.draftMoment;
  if (name === 'setup') return ui.draftSetup;
  if (name === 'fgoal') return ui.draftFgoal;
  if (name === 'attempt') return ui.draftAttempt;
  if (name === 'profile') return state.profile;
  if (name === 'flare') return state.flare;
  if (name === 'learn') return state.learn.answers;
  if (name === 'week') { var k = weekKey(new Date()); state.weeks[k] = state.weeks[k] || {}; return state.weeks[k]; }
  if (name === 'panel') return ui.panel;
  return null;
}
function persistent(name){ return name === 'flare' || name === 'learn' || name === 'week' || name === 'profile'; }
function byId(list, id){ return list.filter(function(x){ return x.id === id; })[0]; }
var A = {
  tab: function(el){ go(el.getAttribute('data-tab')); },
  sub: function(el){ ui.sub[el.getAttribute('data-group')] = el.getAttribute('data-val'); ui.panel = null; ui.scrollTop = false; render(); },
  'goto-plan': function(){ go('path', {path:'daily'}); },
  'goto-tools': function(){ go('tools', {tools:'calm'}); },
  'goto-tools-now': function(){ go('tools', {tools:'now'}); },
  'goto-track': function(el){ go('tools', {tools:'log', track: el.getAttribute('data-sub') || 'episodes'}); },
  'goto-today': function(){ go('today'); },
  'goto-export': function(){ ui.exp.links = null; go('export'); },
  'goto-settings': function(){ ui.importMsg = ''; ui.confirmClear = false; ui.remindLinks = null; go('settings'); },
  'goto-milestones': function(){ ui.celebrate = []; go('progress', {progress:'milestones'}); },
  'goto-plan-pacing': function(){ go('path', {path:'pacing'}); },
  'goto-plan-flare': function(){ go('path', {path:'flare'}); },
  colour: function(el){ state.profile.colour = el.getAttribute('data-val'); save(); ui.refocus = '[data-action="colour"][data-val="' + state.profile.colour + '"]'; render(); },
  'cel-next': function(){ ui.celebrate.shift(); render(); },
  'wb-dismiss': function(){ ui.welcomeBack = false; render(); },
  'goto-toolkit': function(){ ui.welcomeBack = false; go('toolkit'); },
  'goto-pattern': function(){ ui.patternSel = []; go('pattern'); },
  'goto-progress': function(){ go('progress', {progress:'function'}); },
  'goto-plan-goals': function(){ ui.goalDetail = null; go('path', {path:'goals'}); },
  'reflect-open': function(){ ui.reflectOpen = true; go('today'); ui.refocus = '#winText'; render(); },
  'reflect-close': function(){ ui.reflectOpen = false; render(); },
  'win-save': function(){ var inp = $('#winText'), k = dayKey(new Date()); var v = inp ? inp.value.trim() : ''; if (v) { state.wins[k] = v; save(); fxTick('Noted'); } else { delete state.wins[k]; save(); } ui.reflectOpen = false; render(); },
  'fgoal-new': function(){ ui.fgoalForm = true; ui.draftFgoal = newGoalDraft(); render(); },
  'fgoal-cancel': function(){ ui.fgoalForm = false; render(); },
  'fgoal-save': function(){
    var d = ui.draftFgoal, name = (d.name || '').trim(); if (!name) { toast('Name the goal'); return; }
    var steps = [0,1,2].map(function(i){ return (d['step' + i] !== undefined ? d['step' + i] : d.steps[i]) || ''; }).map(function(x){ return x.trim(); }).filter(Boolean);
    var g = makeGoal(name, (d.why || '').trim(), steps); state.fgoals.push(g); ui.fgoalForm = false; save(); fxTick('Goal added'); ui.goalDetail = g.id; render();
  },
  'fgoal-open': function(el){ ui.tab = 'path'; ui.sub.path = 'goals'; ui.goalDetail = el.getAttribute('data-id'); ui.draftAttempt = null; ui.panel = null; ui.scrollTop = true; render(); },
  'fgoal-close': function(){ ui.goalDetail = null; ui.draftAttempt = null; ui.scrollTop = true; render(); },
  'fgoal-reached': function(el){ var g = byId(state.fgoals, el.getAttribute('data-goal')); if (!g) return; g.done = true; g.doneTs = Date.now(); g.steps.forEach(function(s){ s.done = true; }); save(); fxTick('Goal reached'); render(); },
  'fgoal-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'fgoal:' + id) { state.fgoals = state.fgoals.filter(function(g){ return g.id !== id; }); ui.confirmDel = null; ui.goalDetail = null; save(); toast('Goal removed'); }
    else ui.confirmDel = 'fgoal:' + id;
    render();
  },
  'step-add': function(el){ var g = byId(state.fgoals, el.getAttribute('data-goal')), inp = $('#stepText'), t = inp ? inp.value.trim() : ''; if (!g || !t) return; g.steps.push({ id:uid(), text:t, done:false }); save(); render(); },
  'step-toggle': function(el){ var g = byId(state.fgoals, el.getAttribute('data-goal')), st = g && byId(g.steps, el.getAttribute('data-id')); if (!st) return; st.done = !st.done; save(); if (st.done) fxTick('Step done'); ui.refocus = '[data-action="step-toggle"][data-id="' + st.id + '"]'; render(); },
  'attempt-new': function(el){ var g = byId(state.fgoals, el.getAttribute('data-goal')); if (!g) return; var ns = nextStep(g); ui.tab = 'path'; ui.sub.path = 'goals'; ui.goalDetail = g.id; ui.draftAttempt = { goalId:g.id, stepId: ns ? ns.id : (g.steps[0] || {}).id, result:'did', note:'' }; ui.scrollTop = true; render(); },
  'attempt-cancel': function(){ ui.draftAttempt = null; render(); },
  'attempt-save': function(el){
    var g = byId(state.fgoals, el.getAttribute('data-goal')), d = ui.draftAttempt; if (!g || !d) return;
    var r = d.result === 'I did it' || d.result === 'did' ? 'did' : d.result === 'I did part of it' || d.result === 'part' ? 'part' : 'not';
    g.attempts = g.attempts || []; g.attempts.push({ id:uid(), ts:Date.now(), stepId:d.stepId, result:r, note:(d.note || '').trim() });
    if (r === 'did') { var st = byId(g.steps, d.stepId); if (st) st.done = true; }
    ui.draftAttempt = null; save();
    fxTick(r === 'not' ? 'Trying counts. Noted.' : 'You approached something you were avoiding'); render();
  },
  'pattern-pick': function(el){ var v = el.getAttribute('data-val'), i = ui.patternSel.indexOf(v); if (i > -1) ui.patternSel.splice(i, 1); else ui.patternSel.push(v); render(); },
  'pattern-save': function(){ if (ui.patternSel.length) { state.patterns.unshift({ id:uid(), ts:Date.now(), items:ui.patternSel.slice() }); save(); fxTick('Pattern noted'); } ui.patternSel = []; go('today'); },
  'pattern-go': function(el){
    if (ui.patternSel.length) { state.patterns.unshift({ id:uid(), ts:Date.now(), items:ui.patternSel.slice() }); save(); }
    var next = el.getAttribute('data-next'); ui.patternSel = [];
    if (next === 'open-tool') { ui.pacePreset = null; openTool(el.getAttribute('data-type')); } else if (A[next]) A[next](el);
  },
  'text-size': function(el){ state.prefs.textSize = el.getAttribute('data-val'); save(); render(); },
  'pref-set': function(el){ state.prefs[el.getAttribute('data-key')] = el.getAttribute('data-val'); save(); render(); },
  'pref-toggle': function(el){ var k = el.getAttribute('data-key'); state.prefs[k] = !state.prefs[k]; save(); render(); },
  'mode-set': function(el){ state.setup.mode = el.getAttribute('data-val'); save(); render(); },
  'goto-me': function(){ go('me'); },
  'pin-toggle': function(el){ var k = el.getAttribute('data-key'), i = state.pins.indexOf(k); if (i > -1) state.pins.splice(i, 1); else state.pins.push(k); save(); ui.refocus = '[data-action="pin-toggle"][data-key="' + k + '"]'; render(); },
  'quick-two': function(){ ui.pacePreset = null; openTool('breath'); ui.panel.mins = 2; render(); },
  'read-aloud': function(el){ readAloud(el.getAttribute('data-text-id')); },
  'remind-time': function(el){ ui.remindTime = el.getAttribute('data-val'); ui.remindLinks = null; render(); },
  'remind-make': function(){
    var f = new File([buildICS(ui.remindTime)], 'steady-ground-reminder.ics', {type:'text/calendar'});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[f]})) {
      navigator.share({ files:[f], title:'Steady Ground reminder' }).then(function(){ toast('Choose Calendar to add it'); }, function(){});
    } else { ui.remindLinks = [{ name:f.name, url:URL.createObjectURL(f) }]; render(); }
  },
  'welcome-pick': function(el){ ui.welcomeMode = el.getAttribute('data-val'); render(); },
  'setup-next': function(){ if (ui.setupStep === 0 && !ui.welcomeMode) return; ui.setupStep = Math.min(3, ui.setupStep + 1); ui.scrollTop = true; render(); },
  'setup-back': function(){ ui.setupStep = Math.max(0, ui.setupStep - 1); ui.scrollTop = true; render(); },
  'setup-idea': function(el){ ui.draftSetup.goal = el.getAttribute('data-val'); render(); },
  'welcome-go': function(){
    if (!ui.welcomeMode) return;
    var d = ui.draftSetup;
    state.profile.presentation = d.presentation.slice(); state.profile.difficulties = d.difficulties.slice(); state.profile.matters = (d.matters || '').trim();
    if ((d.goal || '').trim()) state.fgoals.push(makeGoal((d.goal || '').trim(), '', []));
    state.setup.done = true; state.setup.mode = ui.welcomeMode; if (!state.profile.joined) state.profile.joined = Date.now(); save();
    ui.tab = 'today';
    ui.scrollTop = true; render();
  },
  checkin: function(el){
    var k = dayKey(new Date()), kind = el.getAttribute('data-kind'), val = +el.getAttribute('data-val');
    state.checkins[k] = state.checkins[k] || {};
    state.checkins[k][kind] = state.checkins[k][kind] === val ? 0 : val;
    save(); ui.refocus = '[data-action="checkin"][data-kind="' + kind + '"][data-val="' + val + '"]'; render();
  },
  'open-tool': function(el){ ui.pacePreset = el.getAttribute('data-pace'); openTool(el.getAttribute('data-type')); },
  chip: function(el){
    var d = draftFor(el.getAttribute('data-draft')); if (!d) return;
    var f = el.getAttribute('data-field'), v = el.getAttribute('data-val');
    if (!Array.isArray(d[f])) d[f] = [];
    var i = d[f].indexOf(v);
    if (i > -1) d[f].splice(i, 1); else d[f].push(v);
    el.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
    if (persistent(el.getAttribute('data-draft'))) save();
  },
  radio: function(el){
    var name = el.getAttribute('data-draft'), d = draftFor(name); if (!d) return;
    var f = el.getAttribute('data-field'), v = el.getAttribute('data-val');
    d[f] = d[f] === v && name !== 'ep' && name !== 'gr' ? '' : v;
    if (persistent(name)) save();
    ui.refocus = '[data-action="radio"][data-field="' + f + '"][data-val="' + v.replace(/"/g, '\\"') + '"]'; render();
  },
  scalepick: function(el){
    var name = el.getAttribute('data-draft'), d = draftFor(name); if (!d) return;
    var f = el.getAttribute('data-field'), v = +el.getAttribute('data-val');
    d[f] = v;
    if (persistent(name)) save();
    if (name === 'panel') {
      var p = ui.panel;
      if (f === 'after') saveGrounding(p, p.minutesDone || (p.type === 'ground' ? 2 : p.type === 'pmr' ? 5 : 1));
      ui.refocus = null; render(); return;
    }
    ui.refocus = '[data-action="scalepick"][data-field="' + f + '"][data-val="' + v + '"]'; render();
  },
  pick: function(el){ ui[el.getAttribute('data-key')] = el.getAttribute('data-val'); ui.refocus = '[data-action="pick"][data-val="' + el.getAttribute('data-val') + '"]'; render(); },

  'ep-new': function(){ ui.draftEp = newEp(); ui.scrollTop = true; render(); },
  'ep-cancel': function(){ ui.draftEp = null; ui.scrollTop = true; render(); },
  'ep-save': function(){
    var d = ui.draftEp;
    if (!d.types.length && !(d.description || '').trim()) { toast('Pick a symptom or write a short description'); return; }
    var ts = new Date(d.when).getTime(); if (isNaN(ts)) ts = Date.now();
    state.episodes.push({ id: uid(), ts: ts, types: d.types.slice(), severity: d.severity || 0, duration: d.duration === '' ? null : Math.max(0, +d.duration || 0), durUnit: d.durUnit, description: (d.description || '').trim(), location: (d.location || '').trim(),
      triggers: d.triggers.slice(), triggerText: (d.triggerText || '').trim(), warnings: d.warnings.slice(), warningText: (d.warningText || '').trim(), helped: d.helped.slice(), helpedText: (d.helpedText || '').trim(), impactDay: (d.impactDay || '').trim(), impactOthers: (d.impactOthers || '').trim() });
    state.episodes.sort(function(a, b){ return b.ts - a.ts; });
    ui.draftEp = null; save(); fxTick('Episode saved'); ui.scrollTop = true; render();
  },
  'ep-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'ep:' + id) { state.episodes = state.episodes.filter(function(e){ return e.id !== id; }); ui.confirmDel = null; save(); toast('Deleted'); }
    else ui.confirmDel = 'ep:' + id;
    render();
  },
  'gr-new': function(){ ui.draftGr = newGr(); ui.scrollTop = true; render(); },
  'gr-cancel': function(){ ui.draftGr = null; render(); },
  'gr-save': function(){
    var d = ui.draftGr, ts = new Date(d.when).getTime(); if (isNaN(ts)) ts = Date.now();
    state.grounding.push({ id: uid(), ts: ts, skill: d.skill, before: d.before, after: d.after, minutes: 0, note: (d.note || '').trim() });
    state.grounding.sort(function(a,b){ return b.ts - a.ts; });
    ui.draftGr = null; save(); fxTick('Record saved'); render();
  },
  'gr-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'gr:' + id) { state.grounding = state.grounding.filter(function(g){ return g.id !== id; }); ui.confirmDel = null; save(); toast('Deleted'); }
    else ui.confirmDel = 'gr:' + id;
    render();
  },
  'th-new': function(){ ui.draftTh = newTh(); ui.thStep = 1; ui.scrollTop = true; render(); },
  'th-cancel': function(){ ui.draftTh = null; ui.scrollTop = true; render(); },
  'th-back': function(){ ui.thStep = Math.max(1, ui.thStep - 1); ui.scrollTop = true; render(); },
  'th-next': function(){
    var d = ui.draftTh;
    if (ui.thStep === 2 && !(d.thought || '').trim()) { toast('Write the thought first'); return; }
    ui.thStep = Math.min(4, ui.thStep + 1); ui.scrollTop = true; render();
  },
  'th-save': function(){
    var d = ui.draftTh;
    state.thoughts.unshift({ id: uid(), ts: Date.now(), situation: (d.situation || '').trim(), thought: (d.thought || '').trim(), emotions: d.emotions.slice(), before: +d.before, traps: d.traps.slice(), evFor: (d.evFor || '').trim(), evAgainst: (d.evAgainst || '').trim(), balanced: (d.balanced || '').trim(), after: +d.after });
    ui.draftTh = null; ui.thStep = 1; save(); fxTick('Thought record saved'); ui.scrollTop = true; render();
  },
  'th-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'th:' + id) { state.thoughts = state.thoughts.filter(function(t){ return t.id !== id; }); ui.confirmDel = null; save(); toast('Deleted'); }
    else ui.confirmDel = 'th:' + id;
    render();
  },
  'ex-toggle': function(){ ui.example = !ui.example; render(); },

  panel: function(el){
    var t = el.getAttribute('data-type');
    /* The movement and urges panels live on the Tools tab. They used to be set up without moving
       there, so opening one from Home or the "help right now" list showed nothing at all. */
    if (t === 'move') { ui.tab = 'tools'; ui.sub.tools = 'move'; ui.lesson = null; ui.learnTopic = null; ui.panel = {type:'move', id: el.getAttribute('data-id'), exRunning:false, exEnd:0, before:-1, metro:false, bpm:90}; ui.scrollTop = true; render(); }
    else if (t === 'urges') { ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.lesson = null; ui.learnTopic = null; ui.panel = {type:'urges', open:'', before:-1}; ui.scrollTop = true; render(); }
    else openTool(t);
  },
  'urges-open': function(el){ var id = el.getAttribute('data-id'); ui.panel.open = ui.panel.open === id ? '' : id; ui.refocus = '[data-action="urges-open"][data-id="' + id + '"]'; render(); },
  'scan-next': function(){
    var p = ui.panel; p.step++;
    if (p.step >= BODYSCAN.length) { p.after = -1; p.minutesDone = 3; if (p.before < 0) saveGrounding(p, 3); }
    render();
  },
  'scan-prev': function(){ ui.panel.step = Math.max(0, ui.panel.step - 1); render(); },
  'feel-new': function(){ ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.lesson = null; ui.learnTopic = null; ui.draftFeel = newFeel(); ui.feelStep = 1; ui.panel = {type:'feel', before:-1, done:false}; ui.scrollTop = true; render(); },
  'moment-new': function(){ ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.lesson = null; ui.learnTopic = null; ui.draftMoment = newMoment(); ui.momentStep = 1; ui.panel = {type:'moment', before:-1, done:false}; ui.scrollTop = true; render(); },
  'moment-cancel': function(){ ui.draftMoment = null; ui.panel = null; ui.scrollTop = true; render(); },
  'moment-next': function(){ ui.momentStep = Math.min(MOMENT_STEPS, (ui.momentStep || 1) + 1); ui.scrollTop = true; render(); },
  'moment-back': function(){ ui.momentStep = Math.max(1, (ui.momentStep || 1) - 1); ui.scrollTop = true; render(); },
  'moment-chip': function(el){
    var d = ui.draftMoment; if (!d) return;
    var f = el.getAttribute('data-field'), v = el.getAttribute('data-val'), cur = (d[f] || []).slice(), i = cur.indexOf(v), lim = MOMENT_LIMIT[f] || 2;
    if (i > -1) cur.splice(i, 1);
    else if (MOMENT_ALONE.indexOf(v) > -1) cur = [v];
    else {
      cur = cur.filter(function(x){ return MOMENT_ALONE.indexOf(x) < 0; });
      if (cur.length >= lim) { toast('Up to ' + lim + '. Tap one to change it.'); return; }
      cur.push(v);
    }
    d[f] = cur; saveUiSoon();
    ui.refocus = '[data-action="moment-chip"][data-field="' + f + '"][data-val="' + v.replace(/"/g, '\\"') + '"]'; render();
  },
  'moment-save': function(){
    var d = ui.draftMoment; if (!d) return;
    var m = { id: uid(), ts: Date.now(), what: (d.what || '').trim(), who: d.who, whoOther: (d.whoOther || '').trim(), body: d.body.slice(), surface: d.surface.slice(), under: d.under.slice(), need: d.need, did: d.did.slice(), didOther: (d.didOther || '').trim() };
    if (m.who !== 'Other') m.whoOther = '';
    if (m.did.indexOf('Other') < 0) m.didOther = '';
    state.moments.unshift(m); ui.draftMoment = null; ui.momentStep = 1;
    save(); ui.panel.done = true; ui.panel.savedId = m.id; fxTick('Moment saved'); ui.scrollTop = true; render();
  },
  'moment-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'moment:' + id) { state.moments = state.moments.filter(function(m){ return m.id !== id; }); ui.confirmDel = null; save(); toast('Deleted'); }
    else ui.confirmDel = 'moment:' + id;
    render();
  },
  'feel-cancel': function(){ ui.draftFeel = null; ui.panel = null; ui.scrollTop = true; render(); },
  'feel-family': function(el){ ui.draftFeel.family = el.getAttribute('data-id'); ui.draftFeel.word = ''; ui.draftFeel.urges = []; ui.draftFeel.action = ''; ui.refocus = '[data-action="feel-family"][data-id="' + ui.draftFeel.family + '"]'; render(); },
  'feel-next': function(){ if (ui.feelStep === 1 && !ui.draftFeel.family) return; ui.feelStep = Math.min(5, ui.feelStep + 1); ui.scrollTop = true; render(); },
  'feel-back': function(){ ui.feelStep = Math.max(1, ui.feelStep - 1); ui.scrollTop = true; render(); },
  'feel-save': function(){
    var d = ui.draftFeel;
    state.feelings.unshift({ id: uid(), ts: Date.now(), family: d.family, word: (d.word || '').trim(), intensity: +d.intensity, sensations: d.sensations.slice(), urges: d.urges.slice(), action: d.action, note: (d.note || '').trim() });
    save(); ui.panel.done = true; fxTick('Feeling saved'); render();
  },
  'feel-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'feel:' + id) { state.feelings = state.feelings.filter(function(f){ return f.id !== id; }); ui.confirmDel = null; save(); toast('Deleted'); }
    else ui.confirmDel = 'feel:' + id;
    render();
  },
  'voice-test': function(){ testVoice(); },
  'voice-auto': function(){ state.prefs.voice = ''; voiceCache = null; save(); render(); },
  'before-skip': function(){ ui.panel.before = -1; render(); },
  'panel-close': function(){ ui.panel = null; ui.scrollTop = true; render(); },
  'breath-pick': function(el){
    var key = el.getAttribute('data-key'), val = el.getAttribute('data-val');
    ui.panel[key] = key === 'mins' ? +val : val;
    ui.refocus = '[data-action="breath-pick"][data-key="' + key + '"][data-val="' + val + '"]'; render();
  },
  'breath-start': function(){ ui.panel.running = true; ui.panel.done = false; ui.panel.t0 = Date.now(); render(); },
  'breath-stop': function(){ finishBreath(false); },
  'breath-again': function(){ ui.panel = {type:'breath', pace:ui.panel.pace, mins:ui.panel.mins, running:false, done:false, before:ui.panel.before}; render(); },
  'ground-next': function(){
    var p = ui.panel; p.step++;
    if (p.step >= GROUND.length) { p.after = -1; p.minutesDone = 2; if (p.before < 0) saveGrounding(p, 2); }
    render();
  },
  'ground-prev': function(){ ui.panel.step = Math.max(0, ui.panel.step - 1); render(); },
  'ground-again': function(){ ui.panel = {type:'ground', step:0, before:ui.panel.before}; render(); },
  'pmr-next': function(){
    var p = ui.panel; p.step++;
    if (p.step >= PMR.length) { p.after = -1; p.minutesDone = 5; if (p.before < 0) saveGrounding(p, 5); }
    render();
  },
  'pmr-prev': function(){ ui.panel.step = Math.max(0, ui.panel.step - 1); render(); },
  'pmr-again': function(){ ui.panel = {type:'pmr', step:0, before:ui.panel.before}; render(); },
  'bls-pick': function(el){
    var k = el.getAttribute('data-key'), v = el.getAttribute('data-val');
    ui.panel[k] = k === 'secs' ? +v : v;
    ui.refocus = '[data-action="bls-pick"][data-key="' + k + '"][data-val="' + v + '"]'; render();
  },
  'bls-start': function(){
    var p = ui.panel;
    if (!p.mode) { toast('Choose eye movements or sound first'); return; }
    if (p.mode === 'sound' && !audioReady()) { toast('Sound is not available on this phone. Try eye movements instead.'); return; }
    p.running = true; p.done = false; p.t0 = Date.now(); render();
  },
  'bls-stop': function(){ finishBls(false); },
  'bls-again': function(){ ui.panel = {type:'bls', mode:ui.panel.mode, secs:ui.panel.secs, speed:ui.panel.speed, running:false, done:false, before:ui.panel.before}; render(); },
  'shift-start': function(){
    var p = ui.panel; p.running = true; p.done = false; p.t0 = Date.now(); p.turn = 0;
    bird.x = 0; bird.face = 1;
    if (p.sound && !startNature(true)) { p.sound = false; toast('Sound is not available on this phone. You can still do the practice.'); }
    ui.scrollTop = true; render();
  },
  'shift-sound': function(){
    var p = ui.panel; p.sound = !p.sound;
    if (p.sound) { if (natureRunning()) natureVolume(true); else if (!startNature(true)) { p.sound = false; toast('Sound is not available on this phone.'); } }
    else natureVolume(false);
    render();
  },
  'shift-stop': function(){ finishShift(false); },
  'shift-again': function(){ ui.panel = {type:'shift', running:false, done:false, sound:true}; ui.scrollTop = true; render(); },
  'metro-toggle': function(){
    var p = ui.panel;
    if (p.metro) { p.metro = false; stopMetro(); render(); return; }
    p.metro = true;
    if (!startMetro()) { p.metro = false; toast('Sound is not available on this phone.'); }
    render();
  },
  'bpm-step': function(el){ setBpm((ui.panel.bpm || 90) + +el.getAttribute('data-val')); },
  'ex-start': function(){ var x = findEx(ui.panel.id); ui.panel.exRunning = true; ui.panel.exEnd = Date.now() + x.mins * 60000; render(); },
  'ex-stop': function(){ ui.panel.exRunning = false; render(); },
  'ex-done': function(){
    var x = findEx(ui.panel.id); stopMetro();
    logActivity({ kind:'move', minutes:x.mins, label:x.name });
    ui.panel = null; ui.scrollTop = true; fxTick('Logged ' + x.mins + ' min of movement'); render();
  },

  'goal-new': function(){ ui.goalForm = true; ui.draftGoal = newGoal(); render(); },
  'goal-cancel': function(){ ui.goalForm = false; render(); },
  'goal-save': function(){
    var d = ui.draftGoal, name = (d.name || '').trim(), target = Math.round(+d.target), step = Math.round(+d.step);
    if (!name) { toast('Name the activity'); return; }
    if (!(target >= 1)) { toast('Enter a steady amount of at least 1 minute'); return; }
    if (!(step >= 1)) step = 5;
    state.goals.push({ id: uid(), name: name, target: target, step: step, since: dayKey(new Date()), dismissed: '' });
    ui.goalForm = false; save(); toast('Goal added'); render();
  },
  'goal-add': function(el){
    var g = byId(state.goals, el.getAttribute('data-id')); if (!g) return;
    var k = dayKey(new Date()), was = goalMins(g, k) >= g.target;
    var m = +el.getAttribute('data-min'); logActivity({ kind:'goal', goalId:g.id, minutes:m, label:g.name });
    if (!was && goalMins(g, k) >= g.target) fxTick('Steady amount reached'); else toast('Added ' + m + ' min');
    render();
  },
  'goal-undo': function(el){
    var id = el.getAttribute('data-id'), k = dayKey(new Date());
    for (var i = state.activity.length - 1; i >= 0; i--) {
      var a = state.activity[i];
      if (a.goalId === id && dayKey(a.ts) === k) { state.activity.splice(i, 1); save(); toast('Removed last entry'); break; }
    }
    render();
  },
  'goal-step': function(el){
    var g = byId(state.goals, el.getAttribute('data-id')); if (!g) return;
    g.target += g.step; g.since = dayKey(new Date()); g.dismissed = ''; save(); toast('Target is now ' + g.target + ' min'); render();
  },
  'goal-dismiss': function(el){ var g = byId(state.goals, el.getAttribute('data-id')); if (!g) return; g.dismissed = dayKey(new Date()); save(); render(); },
  'goal-del': function(el){
    var id = el.getAttribute('data-id');
    if (ui.confirmDel === 'goal:' + id) {
      state.goals = state.goals.filter(function(g){ return g.id !== id; });
      state.activity = state.activity.filter(function(a){ return a.goalId !== id; });
      ui.confirmDel = null; save(); toast('Goal removed');
    } else ui.confirmDel = 'goal:' + id;
    render();
  },
  'plan-add': function(){
    var inp = $('#planText'), text = inp ? inp.value.trim() : '';
    if (!text) { toast('Write what you plan to do'); return; }
    var k = dayKey(new Date()); state.plan[k] = state.plan[k] || [];
    state.plan[k].push({ id: uid(), text: text, kind: ui.planKind, done: false });
    save(); render(); var n = $('#planText'); if (n) n.focus();
  },
  'plan-toggle': function(el){
    var k = dayKey(new Date()), id = el.getAttribute('data-id'), nowDone = false;
    (state.plan[k] || []).forEach(function(i){ if (i.id === id) { i.done = !i.done; nowDone = i.done; } });
    save(); if (nowDone) fxTick(); ui.refocus = '[data-action="plan-toggle"][data-id="' + id + '"]'; render();
  },
  'plan-del': function(el){
    var k = dayKey(new Date()), id = el.getAttribute('data-id');
    state.plan[k] = (state.plan[k] || []).filter(function(i){ return i.id !== id; });
    save(); render();
  },

  'goto-learn': function(){ go('path', {path:'learn'}); },
  'learn-open': function(el){ ui.tab = 'path'; ui.sub.path = 'learn'; ui.panel = null; ui.lesson = null; ui.learnTopic = el.getAttribute('data-id'); ui.scrollTop = true; render(); },
  'learn-close': function(){ ui.learnTopic = null; ui.scrollTop = true; render(); },
  'learn-read': function(el){ var id = el.getAttribute('data-id'); if (state.learn.read[id]) delete state.learn.read[id]; else state.learn.read[id] = Date.now(); save(); if (state.learn.read[id]) fxTick('Topic read'); render(); },
  'lesson-open': function(el){ ui.tab = 'path'; ui.sub.path = 'learn'; ui.learnTopic = null; ui.lesson = el.getAttribute('data-id'); ui.panel = null; ui.scrollTop = true; render(); },
  'lesson-close': function(){ ui.lesson = null; ui.scrollTop = true; render(); },
  'lesson-read': function(el){ var id = el.getAttribute('data-id'); state.read[id] = !state.read[id]; save(); if (state.read[id]) fxTick(); render(); },

  'exp-range': function(el){ ui.exp.range = +el.getAttribute('data-val'); ui.exp.links = null; render(); },
  'exp-toggle': function(el){ var k = el.getAttribute('data-key'); ui.exp[k] = !ui.exp[k]; ui.exp.links = null; render(); },
  'exp-share': function(){ ui.exp.busy = true; ui.exp.links = null; render(); setTimeout(doExport, 30); },
  'backup-share': function(){
    var f = new File([buildBackup()], 'steady-ground-backup-' + dayKey(new Date()) + '.json', {type:'application/json'});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[f]})) {
      navigator.share({ files:[f], title:'Steady Ground backup' }).then(function(){ toast('Backup shared'); }, function(){});
    } else {
      ui.exp.pdf = false; ui.exp.csv = false; ui.exp.backup = true; ui.exp.links = [{ name:f.name, url:URL.createObjectURL(f) }]; go('export');
    }
  },
  'clear-ask': function(){ ui.confirmClear = true; render(); },
  'clear-no': function(){ ui.confirmClear = false; render(); },
  'clear-yes': function(){
    state = blank(); state.setup.done = true; save(); try { localStorage.removeItem(UI_KEY); } catch(e){} ui.confirmClear = false; ui.draftEp = null; ui.draftTh = null; ui.draftGr = null; ui.example = false;
    toast('Data cleared'); go('today');
  }
};

document.addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('[data-action]') : null;
  if (!el) return;
  var a = el.getAttribute('data-action');
  if (a.indexOf('-del') < 0) ui.confirmDel = null;
  if (A[a]) A[a](el);
});
document.addEventListener('input', function(e){
  var t = e.target, name = t.getAttribute && t.getAttribute('data-draft');
  if (!name) return;
  var d = draftFor(name), f = t.getAttribute('data-field'); if (!d || !f) return;
  d[f] = t.type === 'range' ? +t.value : t.value;
  if (name === 'profile' && f === 'team') state.flare.contacts = t.value;
  if (t.type === 'range') { var out = $('[data-out="' + f + '"]'); if (out) out.textContent = t.value + (t.getAttribute('data-suffix') || ''); }
  if (persistent(name)) saveSoon(); else saveUiSoon();
});
document.addEventListener('input', function(e){
  if (e.target && e.target.getAttribute && e.target.getAttribute('data-bpm')) setBpm(+e.target.value);
});
document.addEventListener('change', function(e){
  if (e.target && e.target.id === 'importFile' && e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
  if (e.target && e.target.getAttribute && e.target.getAttribute('data-exp-reflect')) { ui.exp.reflect = !!e.target.checked; }
  if (e.target && e.target.getAttribute && e.target.getAttribute('data-exp-moments')) { ui.exp.moments = !!e.target.checked; }
  if (e.target && e.target.getAttribute && e.target.getAttribute('data-voice-pick')) {
    state.prefs.voice = e.target.value; voiceCache = null; save(); testVoice();
  }
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Enter' && e.target && e.target.id === 'planText') { e.preventDefault(); A['plan-add'](); }
});
window.addEventListener('pagehide', function(){ clearTimeout(saveTimer); save(); clearTimeout(uiTimer); saveUi(); stopReading(); stopMetro(); stopNature(); stopTone(); });

(function visit(){
  var now = Date.now();
  if (state.setup.done && state.lastOpen && now - state.lastOpen > 3 * 86400000) ui.welcomeBack = true;
  state.lastOpen = now; save();
})();
restoreUi();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  /* updateViaCache:'none' stops the browser serving itself a stale copy of sw.js, which
     would hide a new version indefinitely; update() then asks on every open. When a new
     worker does take over, the files already on screen are the old ones, so the page is
     reloaded once, but never out from under a running exercise. */
  try {
    navigator.serviceWorker.register('sw.js', { updateViaCache:'none' }).then(function(reg){
      try { reg.update(); } catch(e){}
    }).catch(function(){});
    var swSwapped = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if (swSwapped || (ui.panel && ui.panel.running)) return;
      swSwapped = true; try { location.reload(); } catch(e){}
    });
  } catch(e){}
}
render();
})();
