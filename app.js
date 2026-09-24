import { songs } from './songs.js';
const $ = s => document.querySelector(s);
const dialog = $('#journey'), lyric = $('#lyric');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const names = Object.keys(songs), positions = Object.fromEntries(names.map(n => [n, 0]));
const tints = ['#efdfa3','#c5dfd5','#f2e6b3','#d5e5a4','#e7d8d0','#d8e3c0','#bcdaca'];
let currentSong = names[0], timer = null, transition = null, paused = reducedMotion.matches, opener = null;
function stopTimer() { clearInterval(timer); timer = null; }
function schedule() { stopTimer(); if (dialog.open && !paused && !document.hidden) timer = setInterval(() => step(1), 6500); }
function renderLyric(animate = true) {
  clearTimeout(transition);
  const paint = () => {
    lyric.replaceChildren();
    songs[currentSong].lyrics[positions[currentSong]].split(/<br\s*\/?\s*>/i).forEach((line, i) => { if(i) lyric.append(document.createElement('br')); lyric.append(document.createTextNode(line)); });
    $('#lyric-count').textContent = `${String(positions[currentSong]+1).padStart(2,'0')} / ${String(songs[currentSong].lyrics.length).padStart(2,'0')}`;
    lyric.classList.remove('changing');
  };
  if(animate && !reducedMotion.matches) { lyric.classList.add('changing'); transition = setTimeout(paint,180); } else paint();
}
function selectSong(name, animate = true) {
  if(!Object.hasOwn(songs,name)) return;
  currentSong = name; $('#journey-title').textContent = name;
  dialog.style.setProperty('--song-tint',tints[names.indexOf(name)]);
  document.querySelectorAll('#song-menu button').forEach(b => b.setAttribute('aria-pressed',String(b.textContent===name)));
  renderLyric(animate); schedule();
}
function updatePause() {
  $('#pause-lyrics').textContent = paused ? '继续流转':'暂停流转';
  $('#pause-lyrics').setAttribute('aria-pressed',String(paused));
  lyric.setAttribute('aria-live',paused?'polite':'off');
  document.body.classList.toggle('motion-paused',paused); schedule();
}
function openJourney(name,trigger) { opener=trigger; if(!dialog.open) dialog.showModal(); document.body.classList.add('dialog-open'); selectSong(name,false); updatePause(); }
function step(d) { positions[currentSong]=(positions[currentSong]+d+songs[currentSong].lyrics.length)%songs[currentSong].lyrics.length; renderLyric(); }
names.forEach(name => { const b=document.createElement('button'); b.type='button'; b.textContent=name; b.setAttribute('aria-pressed',String(name===currentSong)); b.addEventListener('click',()=>selectSong(name)); $('#song-menu').append(b); });
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openJourney(b.dataset.open,b)));
$('#random-song').addEventListener('click',e=>{const options=names.filter(n=>n!==currentSong);openJourney(options[Math.floor(Math.random()*options.length)],e.currentTarget);});
$('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{stopTimer();clearTimeout(transition);lyric.classList.remove('changing');document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
$('#previous-lyric').addEventListener('click',()=>{step(-1);schedule();});
$('#next-lyric').addEventListener('click',()=>{step(1);schedule();});
$('#pause-lyrics').addEventListener('click',()=>{paused=!paused;updatePause();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>{item.classList.toggle('active',item===b);item.setAttribute('aria-pressed',String(item===b));});
  let count=0;document.querySelectorAll('.song-card').forEach(card=>{card.hidden=b.dataset.filter!=='all'&&card.dataset.category!==b.dataset.filter;if(!card.hidden)count++;});
  $('#result-count').textContent=`${count} 段心情，等你发现`;
}));
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);schedule();});
reducedMotion.addEventListener('change',e=>{if(e.matches){paused=true;updatePause();}});
