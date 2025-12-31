(() => {
else emoji.textContent = '';
content.appendChild(emoji);
cell.appendChild(dateEl); cell.appendChild(content);
cell.addEventListener('click', ()=> showDayModal(k));
calendarGrid.appendChild(cell);
}
}


function showDayModal(key){
const entry = store[key];
modalDate.textContent = new Date(key).toLocaleDateString(undefined,{weekday:'long', month:'long', day:'numeric', year:'numeric'});
modalMood.innerHTML = '';
modalHabits.innerHTML = '';
modalNotes.innerHTML = '';
if(entry){
modalMood.innerHTML = `<strong>Mood:</strong> ${MOODS[entry.mood].emoji} ${MOODS[entry.mood].label}`;
const habitsList = document.createElement('div');
HABITS.forEach(h =>{
const p = document.createElement('div'); p.textContent = `${entry.habits && entry.habits[h] ? '✅' : '⬜'} ${h}`;
habitsList.appendChild(p);
});
modalHabits.innerHTML = '<strong>Habits:</strong>'; modalHabits.appendChild(habitsList);
modalNotes.innerHTML = `<strong>Notes:</strong><div style="margin-top:8px">${entry.notes || '<em>No notes</em>'}</div>`;
} else {
modalMood.innerHTML = '<em>No data for this day</em>';
}
dayModal.classList.remove('hidden');
}


closeModalBtn.addEventListener('click', ()=> dayModal.classList.add('hidden'));
dayModal.addEventListener('click', (e)=>{ if(e.target === dayModal) dayModal.classList.add('hidden'); });


// PROGRESS
function renderProgress(){
progressList.innerHTML = '';
const days = 30; const keys = [];
for(let i=0;i<days;i++){ const d = new Date(); d.setDate(d.getDate()-i); keys.push(dateKey(d)); }
HABITS.forEach(h =>{
let done = 0; let total = 0;
keys.forEach(k =>{ if(store[k]){ total++; if(store[k].habits && store[k].habits[h]) done++; } });
// If no entries, base total on days
const effectiveTotal = Math.max(total, days);
const percent = Math.round((done / effectiveTotal) * 100) || 0;
const item = document.createElement('div'); item.className = 'progress-item card';
item.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong>${h}</strong><span>${percent}%</span></div>`;
const bar = document.createElement('div'); bar.className = 'progress-bar';
const inner = document.createElement('div'); inner.className = 'progress-bar-inner'; inner.style.width = '0%';
// color accent
inner.style.background = 'linear-gradient(90deg,var(--accent), #5ec6ff)';
bar.appendChild(inner); item.appendChild(bar);
const stats = document.createElement('div'); stats.style.marginTop='8px'; stats.style.color='var(--muted)'; stats.textContent = `${done} days completed • ${effectiveTotal} days considered`;
item.appendChild(stats);
progressList.appendChild(item);
// animate to percent
setTimeout(()=> inner.style.width = percent + '%', 80);
});
}


// Navigation handler
navButtons.forEach(btn=> btn.addEventListener('click', ()=>{
navButtons.forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
const v = btn.dataset.view;
Object.values(views).forEach(el=>el.classList.add('hidden'));
views[v].classList.remove('hidden');
// render view-specific content
if(v==='history') renderHistory();
if(v==='progress') renderProgress();
}));


// Init
function init(){
loadStore(); renderToday(); renderHistory(); renderProgress();


// set up initial mood selection based on store
updateMoodSelection();
}


// Expose some utilities for debugging (optional)
window.__tracker = {store, loadStore, saveStore};


init();
})();
