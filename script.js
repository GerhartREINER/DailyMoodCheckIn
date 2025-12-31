const moods = [
  { name: "Great", emoji: "😄", color: "#22c55e" },
  { name: "Good", emoji: "🙂", color: "#84cc16" },
  { name: "Okay", emoji: "😐", color: "#eab308" },
  { name: "Low", emoji: "😕", color: "#f97316" },
  { name: "Rough", emoji: "😣", color: "#ef4444" }
];

const habits = [
  { name: "Shower", icon: "🚿" },
  { name: "Walk", icon: "🚶" },
  { name: "Exercise", icon: "💪" },
  { name: "Meditate", icon: "🧘" },
  { name: "Read", icon: "📚" },
  { name: "Water", icon: "💧" },
  { name: "Sleep", icon: "😴" },
  { name: "Journal", icon: "📝" }
];

const todayKey = new Date().toISOString().slice(0, 10);

// Initialize with sample data if empty
function initializeData() {
  const data = JSON.parse(localStorage.getItem("tracker") || "{}");
  
  // Create sample data for past 7 days if empty
  if (Object.keys(data).length === 0) {
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      
      // Random sample data
      data[key] = {
        mood: moods[Math.floor(Math.random() * moods.length)].name,
        habits: {},
        notes: i === 0 ? "" : `Sample entry for ${date.toLocaleDateString()}`
      };
      
      habits.forEach(habit => {
        data[key].habits[habit.name] = Math.random() > 0.5;
      });
    }
    
    saveData(data);
  }
  
  return data;
}

function loadData() {
  return JSON.parse(localStorage.getItem("tracker") || "{}");
}

function saveData(data) {
  localStorage.setItem("tracker", JSON.stringify(data));
  showNotification("Progress saved!");
}

function getToday(data) {
  if (!data[todayKey]) {
    data[todayKey] = { 
      mood: null, 
      habits: {}, 
      notes: "",
      date: todayKey
    };
  }
  return data[todayKey];
}

function showNotification(message, duration = 3000) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/* View Management */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    
    btn.classList.add("active");
    document.getElementById(btn.dataset.view).classList.add("active");
    
    // Update render based on active view
    if (btn.dataset.view === 'today') renderToday();
    else if (btn.dataset.view === 'history') renderHistory();
    else if (btn.dataset.view === 'progress') renderProgress();
  });
});

/* Today View */
function renderToday() {
  const data = loadData();
  const today = getToday(data);
  
  // Update current date display
  document.getElementById('currentDate').textContent = formatDate(todayKey);
  
  // Render Mood Selection
  const moodBox = document.getElementById("moods");
  moodBox.innerHTML = "";
  
  moods.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "mood-btn";
    if (today.mood === m.name) btn.classList.add("selected");
    
    btn.innerHTML = `
      <span>${m.emoji}</span>
      <span class="mood-label">${m.name}</span>
    `;
    
    btn.style.color = m.color;
    btn.style.borderColor = today.mood === m.name ? m.color : "";
    
    btn.onclick = () => {
      today.mood = m.name;
      saveData(data);
      renderToday();
    };
    
    moodBox.appendChild(btn);
  });
  
  // Render Habits
  const habitBox = document.getElementById("habits");
  habitBox.innerHTML = "";
  
  habits.forEach(h => {
    const div = document.createElement("div");
    div.className = "habit-item";
    
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `habit-${h.name}`;
    cb.checked = today.habits[h.name] || false;
    
    cb.onchange = () => {
      today.habits[h.name] = cb.checked;
      saveData(data);
    };
    
    const label = document.createElement("label");
    label.htmlFor = `habit-${h.name}`;
    label.innerHTML = `${h.icon} ${h.name}`;
    
    div.appendChild(cb);
    div.appendChild(label);
    habitBox.appendChild(div);
  });
  
  // Render Notes
  const notes = document.getElementById("notes");
  const noteCount = document.getElementById("noteCount");
  
  notes.value = today.notes || "";
  noteCount.textContent = `${notes.value.length} characters`;
  
  notes.oninput = () => {
    noteCount.textContent = `${notes.value.length} characters`;
  };
  
  document.getElementById('saveNotes').onclick = () => {
    today.notes = notes.value;
    saveData(data);
  };
}

/* History View */
function renderHistory() {
  const data = loadData();
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";
  
  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 29);
  
  // Find the first Sunday to start calendar
  const startDate = new Date(firstDay);
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }
  
  // Render 42 days (6 weeks) for full calendar view
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const key = currentDate.toISOString().slice(0, 10);
    const dayData = data[key];
    
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = currentDate.getDate();
    
    dayDiv.appendChild(dayNumber);
    
    if (dayData?.mood) {
      const mood = moods.find(m => m.name === dayData.mood);
      dayDiv.style.color = mood.color;
      dayDiv.classList.add("has-mood");
      
      const moodEmoji = document.createElement("div");
      moodEmoji.textContent = mood.emoji;
      moodEmoji.style.fontSize = "1.2rem";
      dayDiv.appendChild(moodEmoji);
      
      // Tooltip on hover
      dayDiv.title = `${formatDate(key)}\nMood: ${dayData.mood}\nHabits: ${Object.values(dayData.habits).filter(Boolean).length}/8`;
    }
    
    // Highlight today
    if (key === todayKey) {
      dayDiv.style.boxShadow = "0 0 0 2px var(--accent)";
    }
    
    // Fade out days not in the 30-day range
    if (currentDate < firstDay || currentDate > today) {
      dayDiv.style.opacity = "0.4";
    }
    
    cal.appendChild(dayDiv);
  }
}

/* Progress View */
function renderProgress() {
  const data = loadData();
  const stats = document.getElementById("stats");
  stats.innerHTML = "";
  
  // Calculate totals
  const last30Days = Object.entries(data)
    .filter(([date]) => {
      const dayDate = new Date(date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return dayDate >= thirtyDaysAgo;
    })
    .slice(0, 30);
  
  document.getElementById('totalDays').textContent = last30Days.length;
  
  // Calculate average mood
  const moodValues = last30Days
    .map(([_, dayData]) => {
      const moodIndex = moods.findIndex(m => m.name === dayData.mood);
      return moodIndex !== -1 ? 5 - moodIndex : null;
    })
    .filter(val => val !== null);
  
  if (moodValues.length > 0) {
    const avg = moodValues.reduce((a, b) => a + b) / moodValues.length;
    const avgMood = moods[Math.round(5 - avg)];
    document.getElementById('avgMood').innerHTML = `
      <span style="color:${avgMood.color}">${avgMood.emoji} ${avgMood.name}</span>
    `;
  }
  
  // Render habit progress
  habits.forEach(h => {
    const count = last30Days.filter(([_, dayData]) => dayData.habits?.[h.name]).length;
    const percentage = Math.round((count / last30Days.length) * 100) || 0;
    
    const statDiv = document.createElement("div");
    statDiv.className = "stat-item";
    
    statDiv.innerHTML = `
      <div class="stat-header">
        <span class="stat-name">${h.icon} ${h.name}</span>
        <span class="stat-count">${count}/30 (${percentage}%)</span>
      </div>
      <div class="bar" style="width: ${percentage}%"></div>
    `;
    
    stats.appendChild(statDiv);
  });
}

/* Data Management */
document.getElementById('exportData').onclick = () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tracker-data-${todayKey}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Data exported successfully!');
};

document.getElementById('importData').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        saveData(importedData);
        showNotification('Data imported successfully!');
        renderToday();
      } catch (error) {
        showNotification('Error importing data. Invalid format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
};

document.getElementById('clearData').onclick = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.removeItem('tracker');
    showNotification('All data cleared.');
    setTimeout(() => location.reload(), 1000);
  }
};

/* Initialize and Render */
function initializeApp() {
  initializeData();
  renderToday();
  
  // Auto-save notes every 10 seconds
  setInterval(() => {
    const data = loadData();
    const today = getToday(data);
    const notes = document.getElementById('notes');
    if (notes && notes.value !== today.notes) {
      today.notes = notes.value;
      saveData(data);
    }
  }, 10000);
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);
