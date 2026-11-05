(function(){
'use strict';

/* ---------- storage (per device, this browser only) ---------- */
var KEY = 'steady-ground-v2';
var OLD_KEY = 'steady-ground-v1';
function testStore(){ try { localStorage.setItem('sg-t','1'); localStorage.removeItem('sg-t'); return true; } catch(e){ return false; } }
var canStore = testStore();
function blank(){
  return { setup:{done:false, mode:''}, episodes:[], grounding:[], thoughts:[], checkins:{}, weeks:{}, goals:[], activity:[], plan:{},
           flare:{signs:'',helps:'',contacts:'',pause:''}, read:{}, course:{answers:{}, done:{}, read:{}},
           badges:{}, badgesInit:false, prefs:{textSize:'normal'}, stats:{shares:0}, lastOpen:0,
           feelings:[], profile:{name:'', colour:'teal', vision:'', about:'', team:'', joined:0} };
}
var state = blank();
function mergeInto(p){
  var b = blank();
  for (var k in b) {
    if (p && p[k] !== undefined && p[k] !== null) {
      if (k === 'course' || k === 'setup' || k === 'flare' || k === 'prefs' || k === 'stats' || k === 'profile') { for (var kk in b[k]) if (p[k][kk] !== undefined) b[k][kk] = p[k][kk]; }
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
  try {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var layer = document.createElement('div'); layer.className = 'fx-layer';
    var check = document.createElement('div'); check.className = 'fx-check';
    check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
    layer.appendChild(check);
    if (!reduce) {
      var cols = [cssVar('--good'), cssVar('--accent'), cssVar('--warn')];
      for (var i = 0; i < 14; i++) {
        var b = document.createElement('span'); b.className = 'fx-bit';
        var ang = Math.random() * Math.PI * 2, dist = 55 + Math.random() * 95;
        b.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
        b.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(0) + 'px');
        b.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
        b.style.background = cols[i % cols.length];
        b.style.animationDelay = (Math.random() * 0.1).toFixed(2) + 's';
        layer.appendChild(b);
      }
    }
    document.body.appendChild(layer);
    try { if (navigator.vibrate) navigator.vibrate(15); } catch(e){}
    setTimeout(function(){ try { document.body.removeChild(layer); } catch(e){} }, reduce ? 850 : 1150);
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
/* Workbook forms that the Track tab already provides as live trackers are routed there instead of shown as static homework. */
var TRACK_RE = /^(Daily symptom log|Grounding activity record|Weekly symptom summary)$/i;
var _sessions = null;
function sessions(){
  if (_sessions) return _sessions;
  _sessions = (window.SESSIONS_PART || []).slice().sort(function(a,b){ return a.n - b.n; }).map(function(s){
    var hw = s.homework || [], keep = hw.filter(function(h){ return !TRACK_RE.test(h.title || ''); });
    var c = {}; for (var k in s) c[k] = s[k];
    c.homework = keep; c.tracking = keep.length !== hw.length;
    return c;
  });
  return _sessions;
}
function findSession(n){ return sessions().filter(function(s){ return s.n === +n; })[0]; }

/* ---------- content ---------- */
var SYMPTOMS = ['Weakness','Shaking or tremor','Difficulty walking','Seizure-like episode','Speech difficulty','Numbness or tingling','Pain','Fatigue','Brain fog','Dizziness','Other'];
var TRIGGERS = ['Stress or worry','Conflict','Poor sleep','Overdid it','Noise, crowds or screens','Pain','Fatigue','Strong emotion','Body sensation','Nothing obvious'];
var WARNINGS = ['Subtle physical shift','Change in breathing','Muscle tension','Change in mood','Racing thoughts','Feeling off','Nothing noticeable'];
var HELPS = ['Paced breathing','5-4-3-2-1 grounding','Muscle relaxation','Rest','Gentle movement','Shifted my attention','Talked to someone','Prescribed medication','Nothing yet'];
var SKILLS = ['Paced breathing','5-4-3-2-1 grounding','Progressive muscle relaxation','Body scan','Attention shift','Other'];
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
var SHIFTS = [
  'Count backwards from 100 in sevens. If you lose your place, start again with no hurry.',
  'Pick a category, like animals or foods, and name one for each letter of the alphabet.',
  'Look at one object near you and describe it in detail: colour, shape, texture, what it is made of.',
  'Name three sounds you can hear right now, starting with the farthest one.',
  'Press your feet into the floor. Notice the pressure, then the temperature.',
  'Think of a place you like. Walk through it slowly in your mind and name what you pass.',
  'Go through the words of a song you know well, quietly in your head.',
  'Message or call someone and ask about their day.'
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
  var cp = courseProgress(), s1 = findSession(1), s1done = false;
  if (s1) s1done = !!state.course.read[1] && (s1.homework || []).every(function(h){ return state.course.done[hwKey(s1, h)]; });
  var maxDrop = 0; state.grounding.forEach(function(g){ if (g.before >= 0 && g.after >= 0) maxDrop = Math.max(maxDrop, g.before - g.after); });
  var f = state.flare;
  return {
    ground: state.grounding.length, maxDrop: maxDrop, last7: practiceLast7(), run: practiceRun(),
    episodes: state.episodes.length, checkins: Object.keys(state.checkins).filter(function(k){ var c = state.checkins[k]; return c.mood || c.energy; }).length,
    weeks: Object.keys(state.weeks).filter(function(k){ var w = state.weeks[k]; return w.functioning != null || w.signs || w.stopped; }).length,
    thoughts: state.thoughts.length, s1done: s1done, coursePct: cp.pct, courseTotal: cp.total,
    moves: state.activity.filter(function(a){ return a.kind === 'move'; }).length, paceDays: paceDaysMet(),
    flare: !!(f.signs && f.helps), shares: state.stats.shares || 0
  };
}
var BADGES = [
  {id:'ground1', cat:'calm', name:'First practice', how:'Complete one calming practice', test:function(s){ return s.ground >= 1; }},
  {id:'ground10', cat:'calm', name:'Ten practices', how:'Complete 10 calming practices', test:function(s){ return s.ground >= 10; }},
  {id:'ground25', cat:'calm', name:'Twenty-five practices', how:'Complete 25 calming practices', test:function(s){ return s.ground >= 25; }},
  {id:'ground50', cat:'calm', name:'Fifty practices', how:'Complete 50 calming practices', test:function(s){ return s.ground >= 50; }},
  {id:'ground100', cat:'calm', name:'One hundred practices', how:'Complete 100 calming practices', test:function(s){ return s.ground >= 100; }},
  {id:'drop3', cat:'calm', name:'Felt the shift', how:'A practice where your stress fell by 3 points or more', test:function(s){ return s.maxDrop >= 3; }},
  {id:'week5', cat:'calm', name:'Five of seven', how:'Practise on 5 of the last 7 days', test:function(s){ return s.last7 >= 5; }},
  {id:'run3', cat:'calm', name:'Three days running', how:'Practise three days in a row', test:function(s){ return s.run >= 3; }},
  {id:'run7', cat:'calm', name:'A week running', how:'Practise seven days in a row', test:function(s){ return s.run >= 7; }},
  {id:'ep1', cat:'track', name:'First entry', how:'Log your first episode', test:function(s){ return s.episodes >= 1; }},
  {id:'ep10', cat:'track', name:'Pattern finder', how:'Log 10 episodes, enough to start seeing patterns', test:function(s){ return s.episodes >= 10; }},
  {id:'check7', cat:'track', name:'Seven check-ins', how:'Do the daily check-in on 7 days', test:function(s){ return s.checkins >= 7; }},
  {id:'check30', cat:'track', name:'Thirty check-ins', how:'Do the daily check-in on 30 days', test:function(s){ return s.checkins >= 30; }},
  {id:'week1', cat:'track', name:'Week in review', how:'Fill in a weekly summary', test:function(s){ return s.weeks >= 1; }},
  {id:'th1', cat:'track', name:'First thought record', how:'Complete a thought record', test:function(s){ return s.thoughts >= 1; }},
  {id:'th5', cat:'track', name:'Five thought records', how:'Complete 5 thought records', test:function(s){ return s.thoughts >= 5; }},
  {id:'s1', cat:'course', name:'Session 1 complete', how:'Read Session 1 and finish its homework', test:function(s){ return s.s1done; }},
  {id:'course25', cat:'course', name:'A quarter of the way', how:'Complete 25% of the course', test:function(s){ return s.courseTotal && s.coursePct >= 25; }},
  {id:'course50', cat:'course', name:'Halfway there', how:'Complete half the course', test:function(s){ return s.courseTotal && s.coursePct >= 50; }},
  {id:'course100', cat:'course', name:'Course complete', how:'Finish all ten sessions', test:function(s){ return s.courseTotal && s.coursePct >= 100; }},
  {id:'move1', cat:'move', name:'First movement', how:'Complete a movement exercise', test:function(s){ return s.moves >= 1; }},
  {id:'move10', cat:'move', name:'Ten movements', how:'Complete 10 movement exercises', test:function(s){ return s.moves >= 10; }},
  {id:'pace1', cat:'plan', name:'Steady amount met', how:'Meet a pacing target for a day', test:function(s){ return s.paceDays >= 1; }},
  {id:'pace7', cat:'plan', name:'Seven steady days', how:'Meet pacing targets on 7 days', test:function(s){ return s.paceDays >= 7; }},
  {id:'flare', cat:'plan', name:'Plan in place', how:'Write your flare plan', test:function(s){ return s.flare; }},
  {id:'share1', cat:'share', name:'Shared with clinic', how:'Share a report with your clinic', test:function(s){ return s.shares >= 1; }}
];
var CAT_NAMES = { calm:'Calming practice', track:'Tracking', course:'Course', move:'Movement', plan:'Planning', share:'Sharing' };
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
  'Every practice teaches your nervous system that it can settle.',
  'You did the work. That is what changes things over time.',
  'Showing up on an ordinary day counts just as much.',
  'Small and regular beats big and rare.',
  'That is one more piece of evidence that you can influence how you feel.',
  'Practising while calm makes the skill easier to reach when you need it.'
];
function encourage(){ return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]; }
function checkMilestones(){
  var s = stats(), fresh = [];
  if (!state.badgesInit) {
    BADGES.forEach(function(b){ if (b.test(s)) state.badges[b.id] = Date.now(); });
    state.badgesInit = true; save(); return;
  }
  BADGES.forEach(function(b){ if (!state.badges[b.id] && b.test(s)) { state.badges[b.id] = Date.now(); fresh.push(b); } });
  if (fresh.length) { save(); ui.celebrate = ui.celebrate.concat(fresh); try { if (navigator.vibrate) navigator.vibrate(30); } catch(e){} }
}
function viewCelebration(){
  var b = ui.celebrate[0];
  return '<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="celTitle"><div class="cel-card">' +
    '<div class="medal medal-' + b.cat + '">' + badgeIcon(b.cat) + '</div>' +
    '<p class="eyebrow">Milestone</p><h2 id="celTitle">' + esc(b.name) + '</h2><p>' + esc(b.how) + '.</p><p class="hint">' + esc(encourage()) + '</p>' +
    '<div class="row"><button type="button" class="btn btn-primary" data-action="cel-next">' + (ui.celebrate.length > 1 ? 'Next' : 'Keep going') + '</button><button type="button" class="btn btn-quiet" data-action="goto-milestones">See all milestones</button></div></div></div>';
}
function ring(pct, label, sub){
  var r = 34, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, pct));
  return '<div class="ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ring-bg" cx="40" cy="40" r="' + r + '"/><circle class="ring-fg" cx="40" cy="40" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><div class="ring-txt"><span class="ring-big">' + label + '</span><span class="ring-sub">' + sub + '</span></div></div>';
}
function viewProgress(){
  var h = '<div class="stack"><h1>My progress</h1>' + seg('progress', [['trends','Trends'],['progression','Symptoms'],['milestones','Milestones'],['completed','Done']], ui.sub.progress);
  if (ui.sub.progress === 'trends') h += viewTrends();
  else if (ui.sub.progress === 'progression') h += viewProgression();
  else if (ui.sub.progress === 'milestones') h += viewMilestones();
  else h += viewCompleted();
  return h + '</div>';
}
function viewProgression(){
  var weeks = [], d = parseKey(weekKey(new Date()));
  for (var i = 7; i >= 0; i--) weeks.push(dayKey(addDays(d, -7 * i)));
  function inWeek(ts, wk){ var k = dayKey(ts); return k >= wk && k < dayKey(addDays(parseKey(wk), 7)); }
  var eps = weeks.map(function(wk){ return state.episodes.filter(function(e){ return inWeek(e.ts, wk); }).length; });
  var sev = weeks.map(function(wk){ var s = state.episodes.filter(function(e){ return inWeek(e.ts, wk) && e.severity; }).map(function(e){ return e.severity; }); return s.length ? +avg(s).toFixed(2) : 0; });
  var pr = weeks.map(function(wk){ return state.grounding.filter(function(g){ return inWeek(g.ts, wk); }).length; });
  var fn = weeks.map(function(wk){ var w = state.weeks[wk]; return w && w.functioning != null ? w.functioning : 0; });
  if (!state.episodes.length && !state.grounding.length) return '<section class="card empty"><h2>Symptom progression will appear here</h2><p class="hint">Once you have logged episodes across a few weeks, this shows how often they happen, how severe they are, and how much you are practising, week by week.</p></section>';
  var h = '<section class="card"><h2>Episodes per week</h2><p class="hint">Last 8 weeks, Monday to Sunday.</p>' + chartBars(weeks, eps, Math.max(4, Math.max.apply(null, eps)), 'Episodes per week over the last 8 weeks') + '</section>';
  h += '<section class="card"><h2>Average severity</h2><p class="hint">1 mild, 2 moderate, 3 severe. Weeks with no episodes show nothing.</p>' + chartBars(weeks, sev, 3, 'Average episode severity per week') + '</section>';
  h += '<section class="card"><h2>Calming practices per week</h2>' + chartBars(weeks, pr, Math.max(7, Math.max.apply(null, pr)), 'Calming practices per week') + '</section>';
  if (fn.some(function(x){ return x > 0; })) h += '<section class="card"><h2>Overall functioning</h2><p class="hint">Your weekly summary rating, 0 to 10.</p>' + chartBars(weeks, fn, 10, 'Weekly functioning rating') + '</section>';
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
  state.feelings.forEach(function(f){ var fam = familyById(f.family); ev.push({ ts:f.ts, cat:'track', text:'Named a feeling: ' + (fam ? fam.name.toLowerCase() : '') + (f.word ? ', ' + f.word.toLowerCase() : '') }); });
  state.activity.forEach(function(a){ if (a.kind === 'move') ev.push({ ts:a.ts, cat:'move', text:a.label + ', ' + a.minutes + ' min' }); if (a.kind === 'goal') ev.push({ ts:a.ts, cat:'plan', text:'+' + a.minutes + ' min of ' + a.label }); });
  var S = sessions();
  Object.keys(state.course.done).forEach(function(k){ var p = k.split(':'), s = findSession(+p[0]); var hw = s && s.homework.filter(function(h){ return String(h.day) === p[1]; })[0]; ev.push({ ts:state.course.done[k], cat:'course', text:'Session ' + p[0] + ' homework done' + (hw ? ': ' + hwTitle(hw) : '') }); });
  BADGES.forEach(function(b){ if (state.badges[b.id]) ev.push({ ts:state.badges[b.id], cat:'share', text:'Milestone: ' + b.name }); });
  ev = ev.filter(function(e){ return e.ts > 0; }).sort(function(a,b){ return b.ts - a.ts; }).slice(0, 150);
  if (!ev.length) return '<section class="card empty"><h2>Completed tasks will appear here</h2><p class="hint">Every practice, log entry, homework and milestone, day by day.</p></section>';
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
  var h = '<section class="card"><div class="row" style="align-items:center">' + ring(s.last7 / 7, s.last7 + '/7', 'days') + '<div class="stack-s" style="flex:1; min-width:160px"><p><strong>' + s.ground + '</strong> calming ' + (s.ground === 1 ? 'practice' : 'practices') + ' in total</p><p><strong>' + s.last7 + '</strong> of the last 7 days with a practice</p>' + (s.run >= 2 ? '<p><strong>' + s.run + '</strong> days running</p>' : '') + '</div></div>' +
    '<p class="hint">' + earned + ' of ' + BADGES.length + ' milestones reached. A missed day is not a reset; the next practice simply starts the next run.</p></section>';
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
var COLOURS = { teal:['#2D6878','#6FB6C6'], green:['#3F7350','#8CC79A'], plum:['#6B4C7A','#B99BC9'], rust:['#9A4A2E','#E0956F'], navy:['#2F4A7A','#8FA8D8'] };
function applyColour(){
  try {
    var c = COLOURS[state.profile.colour] || COLOURS.teal, dark = document.documentElement.getAttribute('data-theme') === 'dark' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.getAttribute('data-theme') !== 'light');
    var r = document.documentElement.style;
    if (state.profile.colour && state.profile.colour !== 'teal') { r.setProperty('--accent', dark ? c[1] : c[0]); r.setProperty('--accent-soft', dark ? c[0] + '55' : c[1] + '55'); }
    else { r.removeProperty('--accent'); r.removeProperty('--accent-soft'); }
  } catch(e){}
}
function initials(name){ var p = (name || '').trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase() : '•'; }
function viewMe(){
  var pr = state.profile, s = stats(), earned = BADGES.filter(function(b){ return state.badges[b.id]; }), recent = earned.sort(function(a,b){ return state.badges[b.id] - state.badges[a.id]; }).slice(0,3);
  var vision = pr.vision || state.course.answers.s1d2_4 || '';
  var joined = pr.joined ? fmtDay(dayKey(pr.joined)) : '';
  var h = '<div class="stack"><h1>Me</h1>';
  h += '<section class="card"><div class="row" style="align-items:center"><div class="avatar">' + esc(initials(pr.name)) + '</div><div class="stack-s" style="flex:1; min-width:160px"><h2>' + esc(pr.name || 'Your name') + '</h2><p class="meta">' + (joined ? 'Using Steady Ground since ' + esc(joined) + '. ' : '') + s.ground + ' practices, ' + earned.length + ' milestones.</p></div></div>' +
       lineField('profile','name','Name or nickname',pr.name,'How you would like to be greeted') +
       '<div class="field"><span class="lbl">Colour</span><div class="swatches" role="group" aria-label="Accent colour">' + Object.keys(COLOURS).map(function(k){ return '<button type="button" class="swatch" style="background:' + COLOURS[k][0] + '" aria-label="' + k + '" aria-pressed="' + ((pr.colour || 'teal') === k) + '" data-action="colour" data-val="' + k + '"></button>'; }).join('') + '</div></div></section>';
  h += '<section class="card"><div class="item-head"><h2>My milestones</h2><button type="button" class="link" data-action="goto-milestones">See all ' + earned.length + '/' + BADGES.length + '</button></div>' +
       (recent.length ? '<div class="badges">' + recent.map(function(b){ return '<div class="badge-tile on"><div class="medal medal-' + b.cat + '">' + badgeIcon(b.cat) + '</div><div class="badge-body"><strong>' + esc(b.name) + '</strong><span class="meta">Reached ' + esc(fmtDay(dayKey(state.badges[b.id]))) + '</span></div></div>'; }).join('') + '</div>' : '<p class="hint">Your first milestone is one calming practice away.</p>') +
       '<div class="row" style="align-items:center">' + ring(s.last7 / 7, s.last7 + '/7', 'days') + '<p style="flex:1; min-width:160px">' + s.last7 + ' of the last 7 days with a practice' + (s.run >= 2 ? ', ' + s.run + ' days running' : '') + '.</p></div></section>';
  h += '<section class="card"><h2>The version of me I am working toward</h2><p class="hint">From Session 1, Day 2. Read it on a hard day.</p>' + textField('profile','vision','',vision,3,'Someone who has FND but it does not run my life') + '</section>';
  h += '<section class="card"><h2>About me</h2><p class="hint">Anything you want the app, or a clinician reading your report, to know: what your symptoms look like, what helps, what you enjoy.</p>' + textField('profile','about','',pr.about,4,'') + '</section>';
  h += '<section class="card"><h2>My care team</h2><p class="hint">Names and numbers. Also used by your flare plan.</p>' + textField('profile','team','',pr.team || state.flare.contacts,3,'Dr, therapist, physiotherapist, a friend') + '</section>';
  h += '<section class="card"><h2>My plans</h2><div class="row"><button type="button" class="btn" data-action="goto-plan-pacing">Pacing goals</button><button type="button" class="btn" data-action="goto-plan-flare">Flare plan</button><button type="button" class="btn" data-action="goto-plan">Today\'s plan</button></div></section>';
  h += '<section class="card"><h2>Settings and data</h2><div class="row"><button type="button" class="btn btn-primary" data-action="goto-export">Share with my clinic</button><button type="button" class="btn" data-action="goto-settings">Text size, reminders, backup</button></div></section>';
  return h + '</div>';
}

/* ---------- ui state ---------- */
var ui = {
  tab:'today', sub:{track:'episodes', tools:'calm', plan:'pacing', export:'pdf', progress:'trends'}, draftFeel:null, feelStep:1,
  panel:null, draftEp:null, draftTh:null, thStep:1, draftGoal:null, goalForm:false, draftGr:null,
  example:false, confirmDel:null, confirmClear:false, summaryText:null,
  planKind:'activity', lesson:null, session:null, hw:null, scrollTop:false, refocus:null,
  exp:{range:28, pdf:true, csv:true, backup:false, busy:false, links:null}, importMsg:'',
  celebrate:[], welcomeBack:false, remindTime:'09:00', remindLinks:null
};
var timers = { loop:null, ex:null, wl:null };
function stopTimers(){
  if (timers.loop){ clearInterval(timers.loop); timers.loop = null; }
  if (timers.ex){ clearInterval(timers.ex); timers.ex = null; }
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
  var m = ui.welcomeMode || '';
  return '<div class="welcome">' +
    '<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="9" width="32" height="6" rx="3"/><rect x="8" y="19" width="24" height="6" rx="3" opacity=".6"/><rect x="12" y="29" width="16" height="6" rx="3" opacity=".35"/></svg>' +
    '<div><p class="eyebrow">Welcome to</p><h1>Steady Ground</h1></div>' +
    '<p>Skills, tracking and a self-paced course for living with functional neurological disorder. Everything you enter stays on this phone until you choose to share it with your clinic.</p>' +
    '<div class="stack-s">' +
    '<button type="button" class="optbtn" aria-pressed="' + (m === 'course') + '" data-action="welcome-pick" data-val="course"><span class="t">Start the first-time course</span><span class="meta">Ten sessions based on the FND psychotherapy workbook, with teaching and daily homework. Go at your own pace.</span></button>' +
    '<button type="button" class="optbtn" aria-pressed="' + (m === 'tools') + '" data-action="welcome-pick" data-val="tools"><span class="t">Explore the tools first</span><span class="meta">Symptom log, calming skills, pacing and thought records. The course is always there under the Course tab.</span></button>' +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-wide" data-action="welcome-go" ' + (m ? '' : 'disabled') + '>Continue</button>' +
    '<p class="hint">This app supports your care. It does not replace your clinical team. Call 911 or your local emergency number for chest pain, new weakness on one side, new trouble speaking or seeing, a severe headache, an injury, or a seizure that does not stop.</p>' +
    '</div>';
}

/* ---------- TODAY ---------- */
function courseProgress(){
  var S = sessions(), total = 0, done = 0, next = null;
  S.forEach(function(s){
    total++; if (state.course.read[s.n]) done++; else if (!next) next = {s:s, what:'teach'};
    (s.homework || []).forEach(function(h){
      total++; var k = s.n + ':' + h.day;
      if (state.course.done[k]) done++; else if (!next) next = {s:s, what:'hw', day:h.day, title:h.title};
    });
  });
  return { total: total, done: done, next: next, pct: total ? Math.round(done / total * 100) : 0 };
}
function oneThing(ci){
  var k = dayKey(new Date());
  if (!practicedToday()) return { title:'One calming practice', why:'Two or three minutes is enough. Practising before symptoms build is when it helps most.', action:'open-tool', attrs:' data-type="breath"', btn:'Start paced breathing' };
  var cp = courseProgress();
  if (cp.next) return { title: cp.next.what === 'teach' ? 'Read Session ' + cp.next.s.n : 'Session ' + cp.next.s.n + ' homework', why: cp.next.what === 'teach' ? cp.next.s.title + ', about ' + cp.next.s.minutes + ' minutes.' : cp.next.title + '. A few lines is plenty.', action:'course-open', attrs:' data-n="' + cp.next.s.n + '"' + (cp.next.what === 'hw' ? ' data-day="' + cp.next.day + '"' : ''), btn:'Open' };
  if (!(state.plan[k] || []).length) return { title:'Plan one activity and one rest', why:'Putting rest in before you need it is the pacing habit.', action:'goto-plan', btn:'Plan my day' };
  return null;
}
function viewToday(){
  var k = dayKey(new Date()), ci = state.checkins[k] || {};
  var MOOD = ['','Very low','Low','Okay','Good','Very good'], ENERGY = ['','Drained','Low','Okay','Good','High'];
  function scale(kind, label, words){
    var cur = ci[kind] || 0, b = '';
    for (var i = 1; i <= 5; i++) {
      b += '<button type="button" class="sc" aria-pressed="' + (cur === i) + '" aria-label="' + i + ', ' + words[i] + '" data-action="checkin" data-kind="' + kind + '" data-val="' + i + '">' + i + '</button>';
    }
    return '<div class="field"><div class="lbl-row"><span class="lbl">' + label + '</span><span class="val">' + (cur ? words[cur] : 'Not set') + '</span></div><div class="scale" role="group" aria-label="' + label + '">' + b + '</div></div>';
  }
  var items = state.plan[k] || [], done = items.filter(function(i){ return i.done; }).length;
  var wk = lastDays(7);
  var wkMin = wk.reduce(function(s,d){ return s + minutesOn(d, function(a){ return a.kind !== 'calm'; }); }, 0);
  var wkCalm = state.grounding.filter(function(g){ return wk.indexOf(dayKey(g.ts)) > -1; }).length;
  var wkEp = state.episodes.filter(function(e){ return wk.indexOf(dayKey(e.ts)) > -1; }).length;
  var cp = courseProgress();

  var st = stats(), earned = BADGES.filter(function(b){ return state.badges[b.id]; }).length;
  var h = '<div class="stack">';
  h += '<section><p class="eyebrow">' + esc(new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})) + '</p><h1>' + greeting() + '</h1></section>';

  if (ui.welcomeBack) {
    h += '<section class="card card-accent"><h2>Welcome back</h2><p>It has been a few days. That is normal. Picking it up again is the skill, and one small practice today is enough to restart.</p><div class="row"><button type="button" class="btn btn-primary" data-action="open-tool" data-type="breath">Two minutes of breathing</button><button type="button" class="btn btn-quiet" data-action="wb-dismiss">Thanks</button></div></section>';
  }

  var one = oneThing(ci);
  if (one) h += '<section class="card"><p class="eyebrow">Today\'s one thing</p><h2>' + esc(one.title) + '</h2><p class="hint">' + esc(one.why) + '</p><div><button type="button" class="btn btn-primary" data-action="' + one.action + '"' + (one.attrs || '') + '>' + esc(one.btn) + '</button></div></section>';

  h += '<section class="card"><h2>Quick check-in</h2><p class="hint">Two taps is enough. You don\'t need to track more than this.</p>' +
       scale('mood', 'Mood', MOOD) + scale('energy', 'Energy', ENERGY) + '</section>';

  h += '<section class="card"><div class="item-head"><h2>Your practice</h2><button type="button" class="link" data-action="goto-milestones">Milestones ' + earned + '/' + BADGES.length + '</button></div>' +
       '<div class="row" style="align-items:center">' + ring(st.last7 / 7, st.last7 + '/7', 'days') +
       '<div class="stack-s" style="flex:1; min-width:160px"><p>' + (practicedToday() ? 'Practised today. ' : '') + '<strong>' + st.last7 + '</strong> of the last 7 days with a calming practice.</p>' +
       '<p class="meta">' + st.ground + ' practices in total' + (st.run >= 2 ? ', ' + st.run + ' days running' : '') + '.</p></div></div>' +
       '<div class="row"><button type="button" class="btn" data-action="open-tool" data-type="breath">Paced breathing</button><button type="button" class="btn btn-quiet" data-action="goto-track" data-sub="episodes">Log an episode</button></div></section>';

  h += '<section class="card card-good"><h2>Feeling it build?</h2><p>Slow your body down first. Thoughts can wait a few minutes.</p>' +
       '<div class="row"><button type="button" class="btn btn-primary" data-action="open-tool" data-type="breath">Paced breathing</button>' +
       '<button type="button" class="btn" data-action="open-tool" data-type="ground">Ground with 5-4-3-2-1</button></div></section>';

  if (sessions().length) {
    h += '<section class="card"><div class="item-head"><h2>Course</h2><span class="val">' + cp.pct + '%</span></div><div class="bar" aria-hidden="true"><span style="width:' + cp.pct + '%"></span></div>';
    if (cp.next) {
      h += '<p>Next: <strong>Session ' + cp.next.s.n + '</strong>, ' + (cp.next.what === 'teach' ? 'read the session' : esc(cp.next.title)) + '.</p>' +
           '<div><button type="button" class="btn btn-primary" data-action="course-open" data-n="' + cp.next.s.n + '"' + (cp.next.what === 'hw' ? ' data-day="' + cp.next.day + '"' : '') + '>Continue</button></div>';
    } else {
      h += '<p>You have completed the course. Your maintenance plan is in Session 10.</p><div><button type="button" class="btn" data-action="course-open" data-n="10">Open my plan</button></div>';
    }
    h += '</section>';
  }

  h += '<section class="card"><div class="item-head"><h2>Today\'s plan</h2>' + (items.length ? '<span class="val">' + done + ' of ' + items.length + ' done</span>' : '') + '</div>';
  if (!items.length) {
    h += '<p class="hint">Nothing planned yet. One gentle activity and one rest is a good start.</p><div><button type="button" class="btn" data-action="goto-plan">Plan my day</button></div>';
  } else {
    h += '<div class="stack-s">' + items.slice(0,5).map(function(i){
      return '<div class="plan-row"><button type="button" class="check" aria-pressed="' + !!i.done + '" aria-label="Mark done: ' + esc(i.text) + '" data-action="plan-toggle" data-id="' + i.id + '">' + (i.done ? '✓' : '') + '</button><span class="plan-text">' + esc(i.text) + '</span></div>';
    }).join('') + '</div><div><button type="button" class="btn btn-quiet" data-action="goto-plan">Open plan</button></div>';
  }
  h += '</section>';

  var prev = []; for (var pi = 13; pi >= 7; pi--) prev.push(dayKey(addDays(new Date(), -pi)));
  var prevCalm = state.grounding.filter(function(g){ return prev.indexOf(dayKey(g.ts)) > -1; }).length;
  var drops = state.grounding.filter(function(g){ return wk.indexOf(dayKey(g.ts)) > -1 && g.before >= 0 && g.after >= 0; }).map(function(g){ return g.before - g.after; });
  h += '<section class="card"><h2>This week</h2><p>' + wkCalm + ' calming ' + (wkCalm === 1 ? 'practice' : 'practices') + (prevCalm ? ' (' + prevCalm + ' the week before)' : '') + ', ' + wkMin + ' min of activity, ' + wkEp + ' ' + (wkEp === 1 ? 'episode' : 'episodes') + ' logged.</p>' +
       (drops.length ? '<p class="meta">Stress fell by ' + avg(drops).toFixed(1) + ' points on average after a practice.</p>' : '') + '</section>';

  h += '<section class="card card-alert"><h2>When to get urgent help</h2>' +
       '<p>This app supports your care. It does not replace your clinical team. Call 911 or your local emergency number for chest pain, a new weakness on one side of the body, trouble speaking or seeing that is new for you, a severe headache, an injury, or a seizure that does not stop.</p>' +
       '<p>If you are thinking about harming yourself, call or text 9-8-8 in Canada, or contact your local crisis line.</p></section>';

  h += '<section class="card"><h2>Your data</h2>';
  h += canStore ? '<p class="hint">Entries are saved on this phone only. Nothing is sent anywhere unless you share it. Sharing a report with your clinic also makes a backup.</p>'
                : '<p class="hint">This browser is not saving entries, so they will be lost when you close this page. Share a report before you leave.</p>';
  h += '<div class="row"><button type="button" class="btn btn-primary" data-action="goto-export">Share with my clinic</button><button type="button" class="btn" data-action="goto-settings">Backup and settings</button></div>';
  h += '</section>';
  h += '</div>';
  return h;
}

/* ---------- SETTINGS ---------- */
function viewSettings(){
  var h = '<div class="stack">' + backBtn('goto-today', 'Back') + '<h1>Backup and settings</h1>';
  h += '<section class="card"><h2>Text size</h2><div class="seg" role="group" aria-label="Text size">' + [['normal','Normal'],['large','Large']].map(function(t){ return '<button type="button" aria-selected="' + (state.prefs.textSize === t[0]) + '" data-action="text-size" data-val="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></section>';
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
  var h = '<div class="stack">' + '<h1>Track</h1>' + seg('track', [['episodes','Episodes'],['grounding','Grounding'],['thoughts','Thoughts'],['feelings','Feelings']], ui.sub.track);
  if (ui.sub.track === 'episodes') h += viewEpisodes();
  else if (ui.sub.track === 'grounding') h += viewGrounding();
  else if (ui.sub.track === 'thoughts') h += viewThoughts();
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
    if (p.type === 'move') return panelMove(p);
    if (p.type === 'urges') return panelUrges(p);
    if (p.type === 'feel') return panelFeel(p);
  }
  var h = '<div class="stack"><h1>Tools</h1>' + seg('tools', [['calm','Calm'],['feel','Feel'],['move','Move']], ui.sub.tools);
  if (ui.sub.tools === 'feel') {
    h += '<section class="card"><p>Feelings show up in the body first. Naming the feeling, where it sits, and what it pushes you to do gives you a choice about what happens next. This follows the emotion wheels used in Session 3.</p></section>' +
         '<button type="button" class="tool-btn" data-action="feel-new"><span class="t">Name the feeling</span><span class="meta">Core feeling, body sensations, the urge, and what would help. About two minutes.</span></button>' +
         '<button type="button" class="tool-btn" data-action="panel" data-type="scan"><span class="t">Body scan</span><span class="meta">Seven slow stops from feet to face, noticing without changing</span></button>' +
         '<button type="button" class="tool-btn" data-action="panel" data-type="urges"><span class="t">Urges and opposite action</span><span class="meta">What each feeling pushes you to do, and what helps instead</span></button>';
  } else if (ui.sub.tools === 'calm') {
    h += '<button type="button" class="tool-btn" data-action="panel" data-type="breath"><span class="t">Paced breathing</span><span class="meta">A gentle pacer with a longer breath out</span></button>' +
         '<button type="button" class="tool-btn" data-action="panel" data-type="ground"><span class="t">5-4-3-2-1 sensory grounding</span><span class="meta">Bring your attention back to the room, one sense at a time</span></button>' +
         '<button type="button" class="tool-btn" data-action="panel" data-type="pmr"><span class="t">Progressive muscle relaxation</span><span class="meta">Tense and release, one muscle group at a time</span></button>' +
         '<button type="button" class="tool-btn" data-action="panel" data-type="shift"><span class="t">Shift your attention</span><span class="meta">Give your mind a different job for a few minutes</span></button>' +
         '<p class="hint">Each calming tool asks for your stress level before and after, and saves it to your grounding activity record.</p>';
  } else {
    h += '<section class="card"><p>Gentle movements to practise smooth, automatic movement. Do any exercises your physiotherapist has given you first. Stop if you feel sharp pain, chest pain or faint.</p></section>' +
         '<div class="stack-s">' + EXERCISES.map(function(x){
           return '<button type="button" class="tool-btn" data-action="panel" data-type="move" data-id="' + x.id + '"><span class="t">' + esc(x.name) + '</span><span class="meta">' + esc(x.dose) + (x.standing ? ', standing' : ', seated') + '</span></button>';
         }).join('') + '</div>';
  }
  return h + '</div>';
}
var TOOL_NAMES = { breath:'Paced breathing', ground:'5-4-3-2-1 grounding', pmr:'Progressive muscle relaxation', shift:'Attention shift', scan:'Body scan' };
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
  p.saved = true; ui.welcomeBack = false;
  state.grounding.unshift({ id: uid(), ts: Date.now(), skill: TOOL_NAMES[p.type], before: p.before >= 0 ? p.before : -1, after: p.after >= 0 ? p.after : -1, minutes: minutes || 0, note: '' });
  state.grounding.sort(function(a,b){ return b.ts - a.ts; });
  if (minutes >= 1) logActivity({ kind:'calm', minutes:minutes, label:TOOL_NAMES[p.type] });
  save(); fxTick();
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

function panelGround(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools');
  if (p.step >= GROUND.length) {
    return h + panelAfter(p, '<h1>Back in the room</h1><p>Your body can settle at its own pace. Take one more slow breath out when you are ready.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary" data-action="ground-again">Go again</button><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  var g = GROUND[p.step];
  return h + '<section class="card"><div class="item-head"><span class="eyebrow">5-4-3-2-1 grounding</span><span class="val">Step ' + (p.step + 1) + ' of 5</span></div>' +
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / 5 * 100) + '%"></span></div>' +
    '<p class="bigtext">' + esc(g[1]) + '</p><p class="hint">' + esc(g[2]) + '</p>' +
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
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / PMR.length * 100) + '%"></span></div>' +
    '<h2>' + esc(g[0]) + '</h2><p class="bigtext">' + esc(g[1]) + '</p><p class="hint">Tense for about 5 seconds, then release for 10 to 15 seconds. Keep breathing. Skip any area that hurts.</p>' +
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
    '<div class="bar" aria-hidden="true"><span style="width:' + Math.round((p.step + 1) / BODYSCAN.length * 100) + '%"></span></div>' +
    '<h2>' + esc(g[0]) + '</h2><p class="bigtext">' + esc(g[1]) + '</p><p class="hint">Take two or three slow breaths here before moving on. There is no right thing to feel.</p>' +
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
function panelShift(p){
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to tools') + '<h1>Shift your attention</h1>';
  if (p.done) {
    return h + panelAfter(p, '<p>Nicely done.</p>') + '<div class="row"><button type="button" class="btn btn-quiet" data-action="panel-close">Done</button></div></section></div>';
  }
  return h + '<section class="card"><p class="hint">When symptoms flare, watching them closely can keep them going. Giving your mind a job can help. This is not about ignoring how you feel. It is a way to let your system settle.</p>' +
    '<p class="bigtext">' + esc(SHIFTS[p.i]) + '</p><div class="row"><button type="button" class="btn" data-action="shift-next">Another idea</button><button type="button" class="btn btn-primary" data-action="shift-done">I did it</button></div></section></div>';
}
function findEx(id){ return EXERCISES.filter(function(x){ return x.id === id; })[0]; }
function panelMove(p){
  var x = findEx(p.id), secs = x.mins * 60;
  var h = '<div class="stack">' + backBtn('panel-close', 'Back to exercises') + '<h1>' + esc(x.name) + '</h1>' +
    '<section class="card"><p class="lbl">' + esc(x.dose) + '</p><ol class="prose" style="margin:0; padding-left:22px">' + x.steps.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
    '<p><strong>Tip:</strong> ' + esc(x.tip) + '</p>';
  if (x.standing) h += '<p class="hint">Only do standing exercises if your physiotherapist or doctor has said they are safe for you. Keep a counter or sturdy chair within reach.</p>';
  h += '<p class="hint">Stop if you feel sharp pain, chest pain or faint.</p></section>' +
    '<section class="card"><p class="eyebrow">Optional timer</p><div class="exnum" id="extime">' + (p.exRunning ? '' : Math.floor(secs / 60) + ':' + pad(secs % 60)) + '</div>' +
    '<div class="row">' + (p.exRunning ? '<button type="button" class="btn btn-quiet" data-action="ex-stop">Stop timer</button>' : '<button type="button" class="btn" data-action="ex-start">Start timer</button>') +
    '<button type="button" class="btn btn-primary" data-action="ex-done">Mark done</button></div></section></div>';
  return h;
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

/* ---------- COURSE ---------- */
function hwKey(s, h){ return s.n + ':' + h.day; }
function hwTitle(h){ return h.day === 0 ? 'Exercise: ' + h.title : 'Day ' + h.day + ': ' + h.title; }
function viewCourse(){
  if (ui.lesson) return viewLesson();
  if (ui.session) {
    var s = findSession(ui.session); if (!s) { ui.session = null; }
    else if (ui.hw !== null) return viewHomework(s);
    else return viewSession(s);
  }
  var S = sessions(), cp = courseProgress();
  var h = '<div class="stack"><h1>Course</h1>';
  if (!S.length) return h + '<section class="card"><p class="hint">Course content is not loaded.</p></section></div>';
  h += '<section class="card"><p>Ten sessions from the FND psychotherapy workbook, adapted for working on your own. Read the session, then do the homework over the following days. There is no deadline.</p>' +
       '<div class="bar" aria-hidden="true"><span style="width:' + cp.pct + '%"></span></div><p class="meta">' + cp.done + ' of ' + cp.total + ' parts complete</p></section>';
  h += '<div class="stack-s">' + S.map(function(s){
    var hwN = (s.homework || []).length, hwDone = (s.homework || []).filter(function(x){ return state.course.done[hwKey(s, x)]; }).length;
    var read = !!state.course.read[s.n], all = read && hwDone === hwN;
    return '<button type="button" class="tool-btn" data-action="course-open" data-n="' + s.n + '"><span class="sess"><span class="sess-n ' + (all ? 'done' : '') + '">' + (all ? '✓' : s.n) + '</span><span class="sess-body"><span class="t">' + esc(s.title) + '</span><span class="meta">' + esc(s.tagline || '') + '</span><span class="meta">' + (read ? 'Read' : s.minutes + ' min read') + ' · homework ' + hwDone + ' of ' + hwN + '</span></span></span></button>';
  }).join('') + '</div>';
  h += '<h2>Quick reads</h2><div class="stack-s">' + LESSONS.map(function(l){
    return '<button type="button" class="tool-btn" data-action="lesson-open" data-id="' + l.id + '"><span class="item-head"><span class="t">' + esc(l.title) + '</span>' + (state.read[l.id] ? '<span class="pill pill-good">Read</span>' : '<span class="meta">' + l.mins + ' min</span>') + '</span><span class="meta">' + esc(l.sum) + '</span></button>';
  }).join('') + '</div>';
  h += '<section class="card"><p class="hint">This course is general information adapted from a clinical workbook. It is not a substitute for therapy. If something here does not fit your situation, talk it through with your care team.</p></section></div>';
  return h;
}
function viewSession(s){
  var read = !!state.course.read[s.n], h = '<div class="stack">' + backBtn('course-close', 'All sessions');
  h += '<div><p class="eyebrow">Session ' + s.n + ' of ' + sessions().length + '</p><h1>' + esc(s.title) + '</h1><p class="meta">About ' + s.minutes + ' min to read</p></div>';
  h += '<section class="card"><div class="prose">' + (s.teach || []).map(function(b){
    if (b.quote) return '<blockquote>' + esc(b.quote) + '</blockquote>';
    var o = b.h ? '<h2>' + esc(b.h) + '</h2>' : '';
    o += (b.p || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');
    if (b.bullets && b.bullets.length) o += '<ul>' + b.bullets.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    return o;
  }).join('') + '</div>' +
  '<div><button type="button" class="btn ' + (read ? 'btn-quiet' : 'btn-primary') + '" data-action="session-read" data-n="' + s.n + '">' + (read ? 'Marked as read' : 'Mark as read') + '</button></div></section>';
  if (s.practice) h += '<section class="card card-accent"><p class="eyebrow">Practise this week</p><p>' + esc(s.practice) + '</p><div class="row"><button type="button" class="btn" data-action="goto-tools">Open the tools</button></div></section>';
  if (s.tracking) h += '<section class="card"><p class="eyebrow">Tracking for this session</p><p>The workbook\'s daily symptom log, grounding activity record and weekly summary are live trackers in this app, so you fill them in once and they build up over time.</p><div class="row"><button type="button" class="btn" data-action="goto-track" data-sub="episodes">Symptom log</button><button type="button" class="btn" data-action="goto-track" data-sub="grounding">Grounding record</button></div></section>';
  var hw = s.homework || [];
  if (hw.length) {
    h += '<h2>Homework</h2><div class="stack-s">' + hw.map(function(x, i){
      var done = !!state.course.done[hwKey(s, x)];
      return '<button type="button" class="tool-btn" data-action="hw-open" data-n="' + s.n + '" data-i="' + i + '"><span class="item-head"><span class="t">' + esc(hwTitle(x)) + '</span>' + (done ? '<span class="pill pill-good">Done</span>' : '<span class="meta">' + x.fields.filter(function(f){ return f.type !== 'note'; }).length + ' prompts</span>') + '</span></button>';
    }).join('') + '</div>';
  }
  var next = findSession(s.n + 1), prev = findSession(s.n - 1);
  h += '<div class="row">' + (prev ? '<button type="button" class="btn btn-quiet" data-action="course-open" data-n="' + prev.n + '">Session ' + prev.n + '</button>' : '') + (next ? '<button type="button" class="btn btn-quiet" data-action="course-open" data-n="' + next.n + '">Session ' + next.n + '</button>' : '') + '</div>';
  return h + '</div>';
}
function viewHomework(s){
  var hw = s.homework[ui.hw]; if (!hw) { ui.hw = null; return viewSession(s); }
  var A = state.course.answers, done = !!state.course.done[hwKey(s, hw)];
  var h = '<div class="stack">' + backBtn('hw-close', 'Session ' + s.n) + '<div><p class="eyebrow">Session ' + s.n + ' homework</p><h1>' + esc(hwTitle(hw)) + '</h1></div>';
  h += '<section class="card">' + (hw.intro ? '<p>' + esc(hw.intro) + '</p>' : '');
  h += hw.fields.map(function(f){
    var v = A[f.id];
    if (f.type === 'note') return '<p class="hint">' + esc(f.label) + '</p>';
    if (f.type === 'long') return textField('course', f.id, f.label, v || '', 3, f.hint || '');
    if (f.type === 'text') return lineField('course', f.id, f.label, v || '', f.hint || '');
    if (f.type === 'number') return lineField('course', f.id, f.label, v == null ? '' : v, f.hint || '', 'number');
    if (f.type === 'scale') {
      var min = f.min != null ? f.min : 0, max = f.max != null ? f.max : 10, cur = v == null ? -999 : +v;
      return '<div class="field"><div class="lbl-row"><span class="lbl">' + esc(f.label) + '</span><span class="val">' + (v == null ? 'Not set' : v) + '</span></div>' + (f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '') + scaleButtons('course', f.id, min, max, cur, true) +
        (f.anchors ? '<div class="anchors"><span>' + min + ' ' + esc(f.anchors[0]) + '</span><span>' + max + ' ' + esc(f.anchors[1]) + '</span></div>' : '') + '</div>';
    }
    if (f.type === 'check') return '<div class="field"><span class="lbl">' + esc(f.label) + '</span>' + (f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '') + chipGroup('course', f.id, f.options || [], Array.isArray(v) ? v : []) + '</div>';
    if (f.type === 'choice') return '<div class="field"><span class="lbl">' + esc(f.label) + '</span>' + (f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '') + radioGroup('course', f.id, f.options || [], v || '') + '</div>';
    return '';
  }).join('');
  h += '</section>';
  h += '<div class="sticky-actions row"><button type="button" class="btn ' + (done ? 'btn-quiet' : 'btn-primary') + '" data-action="hw-done" data-n="' + s.n + '" data-i="' + ui.hw + '">' + (done ? 'Marked as done' : 'Mark as done') + '</button>' +
       (ui.hw + 1 < s.homework.length ? '<button type="button" class="btn btn-quiet" data-action="hw-open" data-n="' + s.n + '" data-i="' + (ui.hw + 1) + '">Next homework</button>' : '<button type="button" class="btn btn-quiet" data-action="hw-close">Back to session</button>') + '</div>';
  h += '<p class="hint">Answers save as you type. They are included when you share a report with your clinic.</p>';
  return h + '</div>';
}
function viewLesson(){
  var l = LESSONS.filter(function(x){ return x.id === ui.lesson; })[0];
  if (!l) { ui.lesson = null; return viewCourse(); }
  var read = !!state.read[l.id];
  return '<div class="stack">' + backBtn('lesson-close', 'Course') + '<h1>' + esc(l.title) + '</h1>' +
    '<section class="card"><div class="prose">' + l.body.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') + '</div></section>' +
    '<div class="row"><button type="button" class="btn ' + (read ? 'btn-quiet' : 'btn-primary') + '" data-action="lesson-read" data-id="' + l.id + '">' + (read ? 'Marked as read' : 'Mark as read') + '</button></div></div>';
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
  var h = '<div class="stack"><h1>Plan</h1>' + seg('plan', [['pacing','Pacing'],['today','Today'],['flare','Flare plan']], ui.sub.plan);
  if (ui.sub.plan === 'pacing') h += viewPacing();
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
    }).join('') + '</div><p class="hint">Course homework answers are always included in full.</p></div>' +
    '<div class="field"><span class="lbl">What to send</span><div class="chips" role="group">' +
      '<button type="button" class="chip" aria-pressed="' + e.pdf + '" data-action="exp-toggle" data-key="pdf">PDF report, easy to read</button>' +
      '<button type="button" class="chip" aria-pressed="' + e.csv + '" data-action="exp-toggle" data-key="csv">CSV files, for spreadsheets</button>' +
      '<button type="button" class="chip" aria-pressed="' + e.backup + '" data-action="exp-toggle" data-key="backup">Backup file, to restore on a new phone</button>' +
    '</div></div>' +
    '<button type="button" class="btn btn-primary btn-wide" data-action="exp-share" ' + (e.busy || !(e.pdf || e.csv || e.backup) ? 'disabled' : '') + '>' + (e.busy ? 'Preparing…' : 'Share') + '</button>';
  if (e.links) {
    h += '<p class="hint">Sharing is not available in this browser, so here are the files to save instead.</p><div class="row">' + e.links.map(function(l){
      return '<a class="btn" href="' + l.url + '" download="' + esc(l.name) + '">' + esc(l.name) + '</a>';
    }).join('') + '</div>';
  }
  h += '</section>';
  h += '<section class="card"><h2>What is in the report</h2><ul class="prose" style="padding-left:22px"><li>Summary: episodes, average severity, common triggers and warning signs, what helped</li><li>Symptom log, one entry per episode</li><li>Grounding activity record with stress before and after</li><li>Weekly summaries and daily mood and energy check-ins</li><li>Thought records</li><li>Pacing goals and activity minutes</li><li>Course homework answers</li></ul>' +
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
  var act = state.activity.filter(function(a){ return inRange(a.ts, days); });
  out.push({ name:'activity.csv', text: csv([['date_time','kind','label','minutes']].concat(act.map(function(a){ return [fmtISO(a.ts), a.kind, a.label, a.minutes]; }))) });
  var rows = [['session','homework','field','question','answer']];
  sessions().forEach(function(s){ (s.homework || []).forEach(function(h){ h.fields.forEach(function(f){
    if (f.type === 'note') return; var v = state.course.answers[f.id]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
    rows.push([s.n, hwTitle(h), f.id, f.label, v]);
  }); }); });
  out.push({ name:'course-homework.csv', text: csv(rows) });
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

  var eps = state.episodes.filter(function(e){ return inRange(e.ts, days); });
  h2('Summary');
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
  var cp = courseProgress(); if (cp.total) kv('Course progress', cp.pct + '% (' + cp.done + ' of ' + cp.total + ' parts)');
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

  var any = false;
  sessions().forEach(function(s){
    var blocks = [];
    (s.homework || []).forEach(function(h){
      var lines = [];
      h.fields.forEach(function(f){ if (f.type === 'note') return; var v = state.course.answers[f.id]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; lines.push([f.label, v]); });
      if (lines.length) blocks.push({ h:h, lines:lines });
    });
    if (!blocks.length) return;
    if (!any) { h2('Course homework'); any = true; }
    h3('Session ' + s.n + ': ' + s.title);
    blocks.forEach(function(b){ p(hwTitle(b.h) + (state.course.done[hwKey(s, b.h)] ? ' (marked done)' : ''), 10.5, 'bold'); b.lines.forEach(function(l){ kv(l[0], l[1]); }); y += 4; });
  });
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
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Steady Ground//EN','BEGIN:VEVENT','UID:steady-ground-daily-' + time.replace(':','') + '@local','DTSTAMP:' + start + 'Z','DTSTART:' + start,'DTEND:' + end,'RRULE:FREQ=DAILY','SUMMARY:Steady Ground practice','DESCRIPTION:Two minutes of paced breathing or grounding. Open Steady Ground on your home screen.','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Steady Ground practice','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
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
  try { document.documentElement.classList.toggle('text-large', state.prefs.textSize === 'large'); } catch(e){}
  if (!state.setup.done) { h = viewWelcome(); if (tabs) tabs.hidden = true; if (header) header.hidden = true; }
  else {
    checkMilestones();
    if (tabs) tabs.hidden = false; if (header) header.hidden = false;
    if (ui.tab === 'today') h = viewToday();
    else if (ui.tab === 'progress') h = viewProgress();
    else if (ui.tab === 'me') h = viewMe();
    else if (ui.tab === 'track') h = viewTrack();
    else if (ui.tab === 'tools') h = viewTools();
    else if (ui.tab === 'course') h = viewCourse();
    else if (ui.tab === 'plan') h = viewPlan();
    else if (ui.tab === 'export') h = viewExport();
    else if (ui.tab === 'settings') h = viewSettings();
    else h = viewToday();
    if (ui.celebrate.length) h += viewCelebration();
  }
  v.innerHTML = h;
  applyColour();
  var navTab = ({ plan:'today', export:'me', settings:'me' })[ui.tab] || ui.tab;
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function(b){
    if (b.getAttribute('data-tab') === navTab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (ui.scrollTop) { try { window.scrollTo(0, 0); } catch(e){} ui.scrollTop = false; }
  if (ui.refocus) { var f = $(ui.refocus); if (f) { try { f.focus({preventScroll:true}); } catch(e){} } ui.refocus = null; }
  var p = ui.panel;
  if (ui.tab === 'tools' && p && p.before !== undefined) {
    if (p.type === 'breath' && p.running) startBreathLoop();
    if (p.type === 'move' && p.exRunning) startExLoop();
  }
}
function go(tab, sub){ ui.tab = tab; if (sub) { for (var k in sub) ui.sub[k] = sub[k]; } ui.panel = null; ui.lesson = null; ui.session = null; ui.hw = null; ui.scrollTop = true; render(); }
function openTool(type){
  ui.tab = 'tools'; ui.sub.tools = 'calm'; ui.lesson = null; ui.session = null; ui.hw = null; ui.scrollTop = true;
  if (type === 'breath') ui.panel = {type:'breath', pace:'4-6', mins:3, running:false, done:false};
  else if (type === 'ground') ui.panel = {type:'ground', step:0};
  else if (type === 'pmr') ui.panel = {type:'pmr', step:0};
  else if (type === 'scan') { ui.sub.tools = 'feel'; ui.panel = {type:'scan', step:0}; }
  else if (type === 'shift') ui.panel = {type:'shift', i: Math.floor(Math.random() * SHIFTS.length), done:false};
  render();
}

/* ---------- actions ---------- */
function draftFor(name){
  if (name === 'ep') return ui.draftEp;
  if (name === 'th') return ui.draftTh;
  if (name === 'gr') return ui.draftGr;
  if (name === 'goal') return ui.draftGoal;
  if (name === 'feel') return ui.draftFeel;
  if (name === 'profile') return state.profile;
  if (name === 'flare') return state.flare;
  if (name === 'course') return state.course.answers;
  if (name === 'week') { var k = weekKey(new Date()); state.weeks[k] = state.weeks[k] || {}; return state.weeks[k]; }
  if (name === 'panel') return ui.panel;
  return null;
}
function persistent(name){ return name === 'flare' || name === 'course' || name === 'week' || name === 'profile'; }
function byId(list, id){ return list.filter(function(x){ return x.id === id; })[0]; }
var A = {
  tab: function(el){ go(el.getAttribute('data-tab')); },
  sub: function(el){ ui.sub[el.getAttribute('data-group')] = el.getAttribute('data-val'); ui.panel = null; ui.scrollTop = false; render(); },
  'goto-plan': function(){ go('plan', {plan:'today'}); },
  'goto-tools': function(){ go('tools', {tools:'calm'}); },
  'goto-track': function(el){ go('track', {track: el.getAttribute('data-sub') || 'episodes'}); },
  'goto-today': function(){ go('today'); },
  'goto-export': function(){ ui.exp.links = null; go('export'); },
  'goto-settings': function(){ ui.importMsg = ''; ui.confirmClear = false; ui.remindLinks = null; go('settings'); },
  'goto-milestones': function(){ ui.celebrate = []; go('progress', {progress:'milestones'}); },
  'goto-plan-pacing': function(){ go('plan', {plan:'pacing'}); },
  'goto-plan-flare': function(){ go('plan', {plan:'flare'}); },
  colour: function(el){ state.profile.colour = el.getAttribute('data-val'); save(); ui.refocus = '[data-action="colour"][data-val="' + state.profile.colour + '"]'; render(); },
  'cel-next': function(){ ui.celebrate.shift(); render(); },
  'wb-dismiss': function(){ ui.welcomeBack = false; render(); },
  'text-size': function(el){ state.prefs.textSize = el.getAttribute('data-val'); save(); render(); },
  'remind-time': function(el){ ui.remindTime = el.getAttribute('data-val'); ui.remindLinks = null; render(); },
  'remind-make': function(){
    var f = new File([buildICS(ui.remindTime)], 'steady-ground-reminder.ics', {type:'text/calendar'});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[f]})) {
      navigator.share({ files:[f], title:'Steady Ground reminder' }).then(function(){ toast('Choose Calendar to add it'); }, function(){});
    } else { ui.remindLinks = [{ name:f.name, url:URL.createObjectURL(f) }]; render(); }
  },
  'welcome-pick': function(el){ ui.welcomeMode = el.getAttribute('data-val'); render(); },
  'welcome-go': function(){
    if (!ui.welcomeMode) return;
    state.setup.done = true; state.setup.mode = ui.welcomeMode; if (!state.profile.joined) state.profile.joined = Date.now(); save();
    if (ui.welcomeMode === 'course' && sessions().length) { ui.tab = 'course'; ui.session = 1; ui.hw = null; }
    else ui.tab = 'today';
    ui.scrollTop = true; render();
  },
  checkin: function(el){
    var k = dayKey(new Date()), kind = el.getAttribute('data-kind'), val = +el.getAttribute('data-val');
    state.checkins[k] = state.checkins[k] || {};
    state.checkins[k][kind] = state.checkins[k][kind] === val ? 0 : val;
    save(); ui.refocus = '[data-action="checkin"][data-kind="' + kind + '"][data-val="' + val + '"]'; render();
  },
  'open-tool': function(el){ openTool(el.getAttribute('data-type')); },
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
    if (t === 'move') { ui.panel = {type:'move', id: el.getAttribute('data-id'), exRunning:false, exEnd:0, before:-1}; ui.scrollTop = true; render(); }
    else if (t === 'urges') { ui.panel = {type:'urges', open:'', before:-1}; ui.scrollTop = true; render(); }
    else openTool(t);
  },
  'urges-open': function(el){ var id = el.getAttribute('data-id'); ui.panel.open = ui.panel.open === id ? '' : id; ui.refocus = '[data-action="urges-open"][data-id="' + id + '"]'; render(); },
  'scan-next': function(){
    var p = ui.panel; p.step++;
    if (p.step >= BODYSCAN.length) { p.after = -1; p.minutesDone = 3; if (p.before < 0) saveGrounding(p, 3); }
    render();
  },
  'scan-prev': function(){ ui.panel.step = Math.max(0, ui.panel.step - 1); render(); },
  'feel-new': function(){ ui.tab = 'tools'; ui.sub.tools = 'feel'; ui.lesson = null; ui.session = null; ui.hw = null; ui.draftFeel = newFeel(); ui.feelStep = 1; ui.panel = {type:'feel', before:-1, done:false}; ui.scrollTop = true; render(); },
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
  'shift-next': function(){ var n; do { n = Math.floor(Math.random() * SHIFTS.length); } while (n === ui.panel.i && SHIFTS.length > 1); ui.panel.i = n; render(); },
  'shift-done': function(){ var p = ui.panel; p.done = true; p.after = -1; p.minutesDone = 1; if (p.before < 0) saveGrounding(p, 1); render(); },
  'ex-start': function(){ var x = findEx(ui.panel.id); ui.panel.exRunning = true; ui.panel.exEnd = Date.now() + x.mins * 60000; render(); },
  'ex-stop': function(){ ui.panel.exRunning = false; render(); },
  'ex-done': function(){
    var x = findEx(ui.panel.id);
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

  'course-open': function(el){ ui.tab = 'course'; ui.panel = null; ui.lesson = null; ui.session = +el.getAttribute('data-n'); ui.hw = null;
    var day = el.getAttribute('data-day'); if (day != null) { var s = findSession(ui.session); if (s) s.homework.forEach(function(h, i){ if (String(h.day) === day && ui.hw === null) ui.hw = i; }); }
    ui.scrollTop = true; render(); },
  'course-close': function(){ ui.session = null; ui.hw = null; ui.scrollTop = true; render(); },
  'session-read': function(el){ var n = el.getAttribute('data-n'); state.course.read[n] = !state.course.read[n]; save(); if (state.course.read[n]) fxTick('Session read'); render(); },
  'hw-open': function(el){ ui.tab = 'course'; ui.session = +el.getAttribute('data-n'); ui.hw = +el.getAttribute('data-i'); ui.scrollTop = true; render(); },
  'hw-close': function(){ ui.hw = null; ui.scrollTop = true; render(); },
  'hw-done': function(el){
    var s = findSession(el.getAttribute('data-n')), h = s && s.homework[+el.getAttribute('data-i')]; if (!h) return;
    var k = hwKey(s, h); if (state.course.done[k]) delete state.course.done[k]; else state.course.done[k] = Date.now();
    save(); if (state.course.done[k]) fxTick('Homework done'); else toast('Marked as not done'); render();
  },
  'lesson-open': function(el){ ui.tab = 'course'; ui.lesson = el.getAttribute('data-id'); ui.panel = null; ui.scrollTop = true; render(); },
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
    state = blank(); state.setup.done = true; save(); ui.confirmClear = false; ui.draftEp = null; ui.draftTh = null; ui.draftGr = null; ui.example = false;
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
  if (persistent(name)) saveSoon();
});
document.addEventListener('change', function(e){
  if (e.target && e.target.id === 'importFile' && e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Enter' && e.target && e.target.id === 'planText') { e.preventDefault(); A['plan-add'](); }
});
window.addEventListener('pagehide', function(){ clearTimeout(saveTimer); save(); });

(function visit(){
  var now = Date.now();
  if (state.setup.done && state.lastOpen && now - state.lastOpen > 3 * 86400000) ui.welcomeBack = true;
  state.lastOpen = now; save();
})();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(function(){}); } catch(e){}
}
render();
})();
