(() => {


const mf = $('#mood-freq'); mf.innerHTML='';
MOODS.forEach(m=>{
const item = document.createElement('div'); item.className='mood-item';
const count = res.moodFreq.find(x=>x.mood===m.key)?.count || 0;
const pct = res.listLen? Math.round((count/res.listLen)*100) : 0;
item.innerHTML = `<div style="font-size:18px">${m.emoji} ${m.label}</div><div style="font-size:12px;color:var(--muted)">${count} days • ${pct}%</div><div class="rate-bar" style="margin-top:8px"><div class="rate-bar-inner" style="width:${pct}%"></div></div>`;
mf.appendChild(item);
});


const wt = $('#weekly-trend'); wt.innerHTML='';
res.weeks.forEach(pct=>{
const col = document.createElement('div'); col.className='wbar';
const inner = document.createElement('div'); inner.className='wbar-inner'; inner.style.height = pct + '%'; inner.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
col.appendChild(inner); wt.appendChild(col);
});


const stats = $('#stats-list'); stats.innerHTML='';
const s1 = document.createElement('div'); s1.className='stat'; s1.innerHTML = `<div style="font-weight:700">Best Habit</div><div style="font-size:14px">${res.bestHabit ? res.bestHabit.habit + ' — ' + res.bestHabit.rate + '%' : '—'}</div>`;
const s2 = document.createElement('div'); s2.className='stat'; s2.innerHTML = `<div style="font-weight:700">Average Mood</div><div style="font-size:14px">${res.avgMoodScore}</div>`;
stats.appendChild(s1); stats.appendChild(s2);
}


// full render
function renderAll(){
entries = loadEntries();
renderDate();
const todayEntry = getTodayEntry();
renderMoodPicker(todayEntry.mood);
renderHabits(todayEntry);
renderCalendarGrid(entries);
renderAnalytics(entries);
}


// Tab switching
function initTabs(){
$$('.tab').forEach(b=>b.addEventListener('click', ()=>{
const t = b.getAttribute('data-tab');
$$('.tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
b.classList.add('active'); b.setAttribute('aria-selected','true');
$$('.panel').forEach(p=>{p.classList.remove('active');p.setAttribute('aria-hidden','true')});
$(`#${t}`).classList.add('active'); $(`#${t}`).setAttribute('aria-hidden','false');
}));
}


// Save button
function initSave(){
$('#save-btn').addEventListener('click', ()=>{
saveEntries(entries);
// flash saved
const btn = $('#save-btn'); btn.textContent='Saved ✓'; setTimeout(()=>btn.textContent='Save',900);
renderAll();
});
}


// modal events
function initModal(){
$('#modal-close').addEventListener('click', closeModal);
$('#detail-modal').addEventListener('click', (e)=>{ if(e.target.id==='detail-modal') closeModal(); });
}


// init
function init(){
initTabs(); initSave(); initModal(); renderAll();


// keyboard escape closes modal
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
}


init();


})();
