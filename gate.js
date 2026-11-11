/* Steady Ground access code.
   The app asks for this code the first time it is opened on a phone. Once the right code is
   entered, that phone stays unlocked. To change the code, edit ACCESS_CODE below and commit:
   every phone is then asked for the new code once, and no patient data is lost.
   This keeps casual visitors out of the app. It is not encryption: anyone who reads this file
   can see the code, and entries on the phone are stored the same way as before. */
(function(){
'use strict';
var ACCESS_CODE = '2468';
var STORE = 'steady-ground-access';
var MAX_TRIES = 5, WAIT_SECONDS = 30;

function stored(){ try { return localStorage.getItem(STORE); } catch(e){ return null; } }
function remember(){ try { localStorage.setItem(STORE, ACCESS_CODE); } catch(e){} }
if (stored() === ACCESS_CODE) return;

var shut = [document.querySelector('.wrap'), document.getElementById('tabs')];
function lockApp(on){
  shut.forEach(function(el){
    if (!el) return;
    if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
    else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
  });
  document.documentElement.classList.toggle('gate-on', on);
}

var box = document.createElement('div');
box.className = 'gate';
box.setAttribute('role', 'dialog');
box.setAttribute('aria-modal', 'true');
box.setAttribute('aria-labelledby', 'gateTitle');
box.innerHTML =
  '<form class="gate-in" novalidate>' +
    '<svg class="gate-mark" viewBox="0 0 64 64" aria-hidden="true"><clipPath id="sgg"><circle cx="32" cy="32" r="30"/></clipPath><g clip-path="url(#sgg)"><rect width="64" height="64" fill="#DCE8DF"/><circle cx="41" cy="29" r="9" fill="#C9856B"/><path d="M-2 47C14 35 34 33 66 42V66H-2Z" fill="#24584F"/></g></svg>' +
    '<h1 id="gateTitle">Welcome to Steady Ground</h1>' +
    '<p class="gate-sub">Enter the access code your care team gave you.</p>' +
    '<div class="field">' +
      '<label class="lbl" for="gateCode">Access code</label>' +
      '<input id="gateCode" type="password" inputmode="numeric" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="20" aria-describedby="gateMsg">' +
    '</div>' +
    '<p id="gateMsg" class="gate-msg" role="alert" aria-live="assertive"></p>' +
    '<button type="submit" class="btn btn-primary btn-wide">Enter</button>' +
    '<p class="gate-hint">You only need to do this once on this phone. If you don’t have the code, ask your clinic.</p>' +
    '<p class="gate-crisis">If you are thinking about harming yourself, call or text <a href="tel:988">9-8-8</a> in Canada, or contact your local crisis line.</p>' +
  '</form>';
document.body.appendChild(box);
lockApp(true);

var form = box.querySelector('form'), input = box.querySelector('#gateCode'),
    msg = box.querySelector('#gateMsg'), btn = box.querySelector('button[type="submit"]');
var tries = 0, waitTimer = null;
setTimeout(function(){ try { input.focus(); } catch(e){} }, 50);

function wait(){
  var left = WAIT_SECONDS;
  input.disabled = true; btn.disabled = true;
  (function tick(){
    if (left <= 0) {
      input.disabled = false; btn.disabled = false; tries = 0; msg.textContent = '';
      input.focus(); return;
    }
    msg.textContent = 'Too many tries. Please wait ' + left + ' second' + (left === 1 ? '' : 's') + ' and try again.';
    left--; waitTimer = setTimeout(tick, 1000);
  })();
}

form.addEventListener('submit', function(e){
  e.preventDefault();
  var v = (input.value || '').replace(/\s+/g, '');
  if (!v) { msg.textContent = 'Please enter the access code.'; input.focus(); return; }
  if (v === ACCESS_CODE) {
    remember(); clearTimeout(waitTimer);
    box.parentNode.removeChild(box);
    lockApp(false);
    try { document.getElementById('view').focus(); } catch(err){}
    return;
  }
  tries++; input.value = '';
  if (tries >= MAX_TRIES) { wait(); return; }
  msg.textContent = 'That code didn’t match. Please check it and try again.';
  input.focus();
});
})();
