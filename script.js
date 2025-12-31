// Enhanced mood data with descriptions
const moods = [
  { 
    name: "Great", 
    emoji: "😄", 
    color: "#22c55e",
    desc: "Feeling fantastic! Everything's going well.",
    value: 5
  },
  { 
    name: "Good", 
    emoji: "🙂", 
    color: "#84cc16",
    desc: "Having a positive day. Things are looking up.",
    value: 4
  },
  { 
    name: "Okay", 
    emoji: "😐", 
    color: "#eab308",
    desc: "Average day. Not bad, not great.",
    value: 3
  },
  { 
    name: "Low", 
    emoji: "😕", 
    color: "#f97316",
    desc: "Feeling down. Could use some cheering up.",
    value: 2
  },
  { 
    name: "Rough", 
    emoji: "😣", 
    color: "#ef4444",
    desc: "Having a tough time. Hang in there.",
    value: 1
  }
];

// Enhanced habits data
const habits = [
  { name: "Shower", icon: "🚿", category: "Self-care" },
  { name: "Walk", icon: "🚶", category: "Exercise" },
  { name: "Exercise", icon: "💪", category: "Exercise" },
  { name: "Meditate", icon: "🧘", category: "Mindfulness" },
  { name: "Read", icon: "📚", category: "Learning" },
  { name: "Water", icon: "💧", category: "Health" },
  { name: "Sleep", icon: "😴", category: "Health" },
  { name: "Journal", icon: "📝", category: "Mindfulness" }
];

const todayKey = new Date().toISOString().slice(0, 10);

// DOM Elements
let currentStreak = 0;

// Initialize data storage
function initializeData() {
  const data = JSON.parse(localStorage.getItem("tracker") || "{}");
  
  if (Object.keys(data).length === 0) {
    const today = new Date();
    
    // Create realistic sample data for past 30 days showing improvement
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      
      // Simulate improvement over time
      const progressFactor = 1 - (i / 29);
      const moodIndex = Math.min(
        Math.floor((progressFactor + Math.random() * 0.3) * 5), 
        4
      );
      
      data[key] = {
        mood: moods[moodIndex].name,
        habits: {},
        notes: "",
        date: key,
        completedHabits: 0
      };
      
      // Habits completion increases over time
      habits.forEach(habit => {
        const baseChance = 0.3 + (progressFactor * 0.6);
        data[key].habits[habit.name] = Math.random() < baseChance;
        if (data[key].habits[habit.name]) data[key].completedHabits++;
      });
      
      // Add realistic notes showing improvement
      if (i <= 7) {
        data[key].notes = getSampleNote(moodIndex, data[key].completedHabits, i);
      }
    }
    
    saveData(data);
  }
  
  return data;
}

function getSampleNote(moodIndex, completedHabits, daysAgo) {
  const notes = [
    `Day ${30-daysAgo}: Completed ${completedHabits} habits. ${moods[moodIndex].desc}`,
    `Feeling ${moods[moodIndex].name.toLowerCase()} today. ${completedHabits}/8 habits done.`,
    `Made progress on ${['exercise', 'reading', 'meditation'][Math.floor(Math.random()*3)]} today.`,
    `Tracked my mood and habits consistently. Building momentum!`,
    `Noticed improvement in ${['energy', 'focus', 'mood'][Math.floor(Math.random()*3)]}.`,
    `Struggled with ${['motivation', 'sleep', 'routine'][Math.floor(Math.random()*3)]} but pushed through.`
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

// Data management
function loadData() {
  return JSON.parse(localStorage.getItem("tracker") || "{}");
}

function saveData(data) {
  localStorage.setItem("tracker", JSON.stringify(data));
  showToast("Progress saved!", "success");
  updateLastUpdated();
}

function getToday(data) {
  if (!data[todayKey]) {
    data[todayKey] = { 
      mood: null, 
      habits: {}, 
      notes: "",
      date: todayKey,
      completedHabits: 0
    };
  }
  return data[todayKey];
}

// UI Helpers
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function updateLastUpdated() {
  document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// View Management
function setupViewNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Show selected view
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById(btn.dataset.view).classList.add("active");
      
      // Render the selected view
      if (btn.dataset.view === 'today') renderToday();
      else if (btn.dataset.view === 'history') renderHistory();
      else if (btn.dataset.view === 'progress') renderProgress();
    });
  });
}

// TODAY VIEW
function renderToday() {
  const data = loadData();
  const today = getToday(data);
  
  // Update current date display
  document.getElementById('currentDate').textContent = formatDate(todayKey);
  
  // Render Enhanced Mood Selection with better feedback
  renderMoodSelection(data, today);
  
  // Render habits with enhanced progress tracking
  renderHabitsWithProgress(data, today);
  
  // Render notes with auto-save
  setupNotesAutoSave(data, today);
  
  // Update streak display
  updateStreakDisplay(data);
}

function renderMoodSelection(data, today) {
  const moodBox = document.getElementById("moods");
  moodBox.innerHTML = "";
  
  moods.forEach(m => {
    const card = document.createElement("div");
    card.className = "mood-card";
    if (today.mood === m.name) {
      card.classList.add("selected");
    }
    
    card.innerHTML = `
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-title">${m.name}</div>
      <div class="mood-desc">${m.desc}</div>
    `;
    
    card.style.color = m.color;
    
    card.onclick = () => {
      // Add click animation with ripple effect
      createRippleEffect(card, m.color);
      
      // Remove selection from other cards
      document.querySelectorAll('.mood-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      // Add slight delay for better UX
      setTimeout(() => {
        card.classList.add('selected');
        today.mood = m.name;
        
        // Add pulse animation to selected emoji
        const emoji = card.querySelector('.mood-emoji');
        emoji.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
          emoji.style.animation = '';
        }, 600);
        
        saveData(data);
        updateMoodStreak(data, m.name);
        
        // Show success message with emoji
        showToast(`${m.emoji} Mood set to ${m.name}!`, "success");
      }, 150);
    };
    
    moodBox.appendChild(card);
  });
}

function createRippleEffect(element, color) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color}20;
    transform: scale(0);
    animation: ripple 0.6s linear;
    width: ${size}px;
    height: ${size}px;
    top: ${(rect.height - size) / 2}px;
    left: ${(rect.width - size) / 2}px;
    pointer-events: none;
    z-index: 1;
  `;
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function renderHabitsWithProgress(data, today) {
  const habitBox = document.getElementById("habits");
  habitBox.innerHTML = "";
  
  // Calculate weekly completion for each habit
  const weeklyStats = calculateWeeklyStats(data);
  let completedToday = 0;
  
  habits.forEach((habit, index) => {
    const habitCard = document.createElement("div");
    habitCard.className = "habit-card";
    
    const weeklyCompletion = weeklyStats[habit.name] || 0;
    const progressPercent = Math.round(weeklyCompletion * 100);
    const isChecked = today.habits[habit.name] || false;
    
    if (isChecked) completedToday++;
    
    habitCard.innerHTML = `
      <div class="habit-header">
        <div class="habit-icon">${habit.icon}</div>
        <div class="habit-info">
          <h3>${habit.name}</h3>
          <span class="category">${habit.category}</span>
        </div>
      </div>
      
      <div class="habit-toggle">
        <label for="habit-${habit.name}">
          ${isChecked ? '✅ Completed today' : '◻️ Mark as done'}
        </label>
        <div class="checkbox-container">
          <input type="checkbox" id="habit-${habit.name}" ${isChecked ? 'checked' : ''}>
          <span class="checkbox-slider"></span>
        </div>
      </div>
      
      <div class="habit-progress">
        <div class="progress-label">
          <span>Weekly completion</span>
          <span>${progressPercent}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
    
    const checkbox = habitCard.querySelector('input');
    checkbox.onchange = () => {
      today.habits[habit.name] = checkbox.checked;
      today.completedHabits = Object.values(today.habits).filter(Boolean).length;
      
      // Animate progress bar
      const progressFill = habitCard.querySelector('.progress-fill');
      const newPercent = checkbox.checked ? 
        Math.min(progressPercent + 15, 100) : Math.max(progressPercent - 15, 0);
      
      progressFill.style.width = `${newPercent}%`;
      
      saveData(data);
      
      if (checkbox.checked) {
        showToast(`Great job! ${habit.icon} ${habit.name} completed!`, "success");
        updateHabitStreak(data, habit.name);
      }
      
      // Update today's progress
      setTimeout(() => renderToday(), 300);
    };
    
    habitBox.appendChild(habitCard);
  });
  
  // Update overall progress
  const totalHabits = habits.length;
  const progressPercent = Math.round((completedToday / totalHabits) * 100);
  document.getElementById('streakCount').textContent = `${currentStreak} day streak • ${completedToday}/${totalHabits} habits`;
}

function setupNotesAutoSave(data, today) {
  const notes = document.getElementById('notes');
  const noteCount = document.getElementById('noteCount');
  
  notes.value = today.notes || "";
  noteCount.querySelector('span').textContent = `${notes.value.length} characters`;
  
  notes.oninput = () => {
    const count = notes.value.length;
    noteCount.querySelector('span').textContent = `${count} characters`;
    
    // Auto-save after 2 seconds of inactivity
    clearTimeout(window.notesTimeout);
    window.notesTimeout = setTimeout(() => {
      today.notes = notes.value;
      saveData(data);
    }, 2000);
  };
  
  document.getElementById('saveNotes').onclick = () => {
    today.notes = notes.value;
    saveData(data);
    showToast("Reflection saved!", "success");
  };
}

// HISTORY VIEW
function renderHistory() {
  const data = loadData();
  const trends = calculateTrends(data);
  
  // Update statistics
  document.getElementById('avgMoodValue').textContent = trends.averageMoodValue.toFixed(1);
  document.getElementById('avgCompletion').textContent = `${trends.averageCompletion}%`;
  document.getElementById('bestStreak').textContent = trends.bestStreak || 0;
  
  // Update trend indicators
  updateTrendIndicators(trends);
  
  // Render calendar
  renderCalendar(data);
  
  // Render habit chart
  renderHabitChart(data);
}

function renderCalendar(data) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  
  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 29);
  
  // Find the first Sunday
  const startDate = new Date(firstDay);
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }
  
  // Render 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const key = currentDate.toISOString().slice(0, 10);
    const dayData = data[key];
    
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    // Highlight today
    if (key === todayKey) {
      dayDiv.classList.add('today');
    }
    
    // Add mood data if exists
    if (dayData?.mood) {
      dayDiv.classList.add('has-data');
      const mood = moods.find(m => m.name === dayData.mood);
      dayDiv.innerHTML = `
        <div class="day-number">${currentDate.getDate()}</div>
        <div class="day-mood" style="color: ${mood.color}">${mood.emoji}</div>
      `;
      
      // Add tooltip
      const completed = Object.values(dayData.habits).filter(Boolean).length;
      dayDiv.title = `${formatDate(key)}\nMood: ${dayData.mood}\nHabits: ${completed}/${habits.length}`;
      
      // Make clickable for details
      dayDiv.onclick = () => showDayDetails(key, dayData);
    } else {
      dayDiv.innerHTML = `<div class="day-number">${currentDate.getDate()}</div>`;
    }
    
    // Fade out days outside 30-day range
    if (currentDate < firstDay || currentDate > today) {
      dayDiv.style.opacity = '0.3';
    }
    
    calendar.appendChild(dayDiv);
  }
}

function renderHabitChart(data) {
  const habitChart = document.getElementById('habitChart');
  const last30Days = getLastNDays(30);
  
  // Calculate completion rate for each day
  const completionRates = last30Days.map(date => {
    const dayData = data[date];
    if (!dayData) return 0;
    const completed = Object.values(dayData.habits).filter(Boolean).length;
    return (completed / habits.length) * 100;
  });
  
  // Create SVG chart
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '200');
  svg.setAttribute('viewBox', '0 0 1000 200');
  
  // Create line
  const points = completionRates.map((rate, index) => {
    const x = (index / (completionRates.length - 1)) * 1000;
    const y = 200 - (rate / 100) * 180; // Scale to 90% of height
    return `${x},${y}`;
  }).join(' ');
  
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', 'var(--primary)');
  polyline.setAttribute('stroke-width', '3');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  
  // Add gradient area under the line
  const areaPoints = `${points} 1000,200 0,200`;
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  area.setAttribute('points', areaPoints);
  area.setAttribute('fill', 'url(#gradient)');
  area.setAttribute('opacity', '0.2');
  
  // Add gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'gradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '0%');
  gradient.setAttribute('y2', '100%');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'var(--primary)');
  stop1.setAttribute('stop-opacity', '0.5');
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', 'var(--primary)');
  stop2.setAttribute('stop-opacity', '0');
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  
  svg.appendChild(defs);
  svg.appendChild(area);
  svg.appendChild(polyline);
  
  // Add dots for data points
  completionRates.forEach((rate, index) => {
    const x = (index / (completionRates.length - 1)) * 1000;
    const y = 200 - (rate / 100) * 180;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', 'var(--primary)');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');
    
    // Add hover effect
    circle.onmouseover = () => {
      const date = last30Days[index];
      circle.setAttribute('r', '6');
      
      // Show tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      tooltip.textContent = `${formatDate(date)}: ${rate.toFixed(0)}%`;
      tooltip.style.position = 'absolute';
      tooltip.style.left = `${(index / completionRates.length) * 100}%`;
      tooltip.style.top = `${(y / 200) * 100}%`;
      tooltip.style.transform = 'translate(-50%, -100%)';
      svg.appendChild(tooltip);
    };
    
    circle.onmouseout = () => {
      circle.setAttribute('r', '4');
      const tooltip = svg.querySelector('.chart-tooltip');
      if (tooltip) tooltip.remove();
    };
    
    svg.appendChild(circle);
  });
  
  habitChart.innerHTML = '';
  habitChart.appendChild(svg);
}

// PROGRESS VIEW
function renderProgress() {
  const data = loadData();
  const last30Days = getLastNDays(30);
  const progressStats = document.getElementById('progressStats');
  
  // Calculate overall improvement
  const improvement = calculateImprovement(data);
  document.getElementById('overallImprovement').textContent = `${improvement}%`;
  
  progressStats.innerHTML = '';
  
  habits.forEach(habit => {
    const completionData = last30Days.map(date => {
      return data[date]?.habits?.[habit.name] ? 1 : 0;
    });
    
    const totalCompleted = completionData.reduce((a, b) => a + b, 0);
    const completionRate = Math.round((totalCompleted / 30) * 100);
    const currentStreak = calculateCurrentStreak(completionData);
    
    const statCard = document.createElement('div');
    statCard.className = 'habit-card';
    statCard.innerHTML = `
      <div class="habit-header">
        <div class="habit-icon">${habit.icon}</div>
        <div class="habit-info">
          <h3>${habit.name}</h3>
          <span class="category">${habit.category}</span>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-secondary); font-size: 0.9rem;">Completion</span>
          <span style="font-weight: 600; color: var(--primary);">${completionRate}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${completionRate}%"></div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between;">
        <div style="text-align: center;">
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent);">${totalCompleted}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Days done</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--secondary);">${currentStreak}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Current streak</div>
        </div>
      </div>
    `;
    
    progressStats.appendChild(statCard);
  });
}

// Helper Functions
function calculateWeeklyStats(data) {
  const weeklyStats = {};
  const last7Days = getLastNDays(7);
  
  habits.forEach(habit => {
    let completed = 0;
    last7Days.forEach(date => {
      if (data[date]?.habits?.[habit.name]) {
        completed++;
      }
    });
    weeklyStats[habit.name] = completed / 7;
  });
  
  return weeklyStats;
}

function calculateTrends(data) {
  const last30Days = getLastNDays(30);
  const validDays = last30Days.filter(date => data[date]);
  
  if (validDays.length === 0) {
    return {
      averageMoodValue: 0,
      averageCompletion: 0,
      bestStreak: 0,
      improvement: 0
    };
  }
  
  // Calculate average mood
  const moodValues = validDays.map(date => {
    const mood = moods.find(m => m.name === data[date].mood);
    return mood?.value || 3;
  });
  const averageMoodValue = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
  
  // Calculate average completion
  const completionRates = validDays.map(date => {
    const completed = Object.values(data[date].habits).filter(Boolean).length;
    return (completed / habits.length) * 100;
  });
  const averageCompletion = Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length);
  
  // Calculate best streak
  let bestStreak = 0;
  let currentStreak = 0;
  validDays.forEach(date => {
    if (data[date].completedHabits >= habits.length / 2) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  // Calculate improvement
  const firstHalf = validDays.slice(0, Math.floor(validDays.length / 2));
  const secondHalf = validDays.slice(Math.floor(validDays.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, date) => {
    const completed = Object.values(data[date].habits).filter(Boolean).length;
    return sum + (completed / habits.length);
  }, 0) / firstHalf.length || 0;
  
  const secondHalfAvg = secondHalf.reduce((sum, date) => {
    const completed = Object.values(data[date].habits).filter(Boolean).length;
    return sum + (completed / habits.length);
  }, 0) / secondHalf.length || 0;
  
  const improvement = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) || 0;
  
  return {
    averageMoodValue,
    averageCompletion,
    bestStreak,
    improvement
  };
}

function updateTrendIndicators(trends) {
  const moodTrend = document.querySelector('#history .trend-indicator');
  const completionTrend = document.querySelectorAll('#history .trend-indicator')[1];
  
  if (trends.improvement > 0) {
    moodTrend.innerHTML = '<i class="fas fa-arrow-up"></i><span>Improved by ' + Math.abs(trends.improvement) + '%</span>';
    moodTrend.className = 'trend-indicator trend-up';
  } else if (trends.improvement < 0) {
    moodTrend.innerHTML = '<i class="fas fa-arrow-down"></i><span>Decreased by ' + Math.abs(trends.improvement) + '%</span>';
    moodTrend.className = 'trend-indicator trend-down';
  } else {
    moodTrend.innerHTML = '<i class="fas fa-minus"></i><span>No change</span>';
    moodTrend.className = 'trend-indicator trend-neutral';
  }
}

function calculateImprovement(data) {
  const last30Days = getLastNDays(30);
  const firstWeek = last30Days.slice(0, 7);
  const lastWeek = last30Days.slice(-7);
  
  const firstWeekAvg = firstWeek.reduce((sum, date) => {
    const completed = data[date] ? Object.values(data[date].habits).filter(Boolean).length : 0;
    return sum + (completed / habits.length);
  }, 0) / 7;
  
  const lastWeekAvg = lastWeek.reduce((sum, date) => {
    const completed = data[date] ? Object.values(data[date].habits).filter(Boolean).length : 0;
    return sum + (completed / habits.length);
  }, 0) / 7;
  
  return Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100) || 0;
}

function calculateCurrentStreak(completionData) {
  let streak = 0;
  for (let i = completionData.length - 1; i >= 0; i--) {
    if (completionData[i] === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getLastNDays(n) {
  const days = [];
  const today = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  
  return days;
}

function updateStreakDisplay(data) {
  const today = getToday(data);
  const last30Days = getLastNDays(30);
  let streak = 0;
  
  // Calculate current streak of completing at least half the habits
  for (let i = 0; i < 30; i++) {
    const date = last30Days[29 - i];
    const dayData = data[date];
    
    if (dayData && dayData.completedHabits >= habits.length / 2) {
      streak++;
    } else {
      break;
    }
  }
  
  currentStreak = streak;
  const streakDisplay = document.getElementById('currentStreak');
  streakDisplay.innerHTML = `
    <i class="fas fa-fire" style="color: ${streak > 0 ? '#f59e0b' : '#94a3b8'}"></i>
    <span>${streak} day streak</span>
  `;
}

function updateMoodStreak(data, mood) {
  const yesterdayKey = new Date();
  yesterdayKey.setDate(yesterdayKey.getDate() - 1);
  const yesterday = data[yesterdayKey.toISOString().slice(0, 10)];
  
  if (yesterday && yesterday.mood === mood) {
    // Streak continues
    showToast(`Continuing your ${mood} streak!`, "success");
  } else {
    // New streak started
    showToast(`Started a new ${mood} streak!`, "success");
  }
}

function updateHabitStreak(data, habitName) {
  const today = getToday(data);
  const yesterdayKey = new Date();
  yesterdayKey.setDate(yesterdayKey.getDate() - 1);
  const yesterday = data[yesterdayKey.toISOString().slice(0, 10)];
  
  if (yesterday && yesterday.habits[habitName]) {
    // Streak continues
    showToast(`Nice! ${habitName} streak continues!`, "success");
  } else {
    // New streak started
    showToast(`Started your ${habitName} streak!`, "success");
  }
}

function showDayDetails(date, dayData) {
  const modal = document.getElementById('dayModal');
  const modalContent = document.querySelector('#dayModal .modal-content');
  const mood = moods.find(m => m.name === dayData.mood);
  
  modalContent.innerHTML = `
    <h2 style="margin-bottom: 24px; color: var(--primary);">
      <i class="fas fa-calendar-day"></i> ${formatDate(date)}
    </h2>
    
    ${mood ? `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; 
           background: ${mood.color}10; border-radius: var(--radius-lg);">
        <div style="font-size: 3rem;">${mood.emoji}</div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 700; color: ${mood.color}">${mood.name}</div>
          <div style="color: var(--text-secondary);">${mood.desc}</div>
        </div>
      </div>
    ` : ''}
    
    <div style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px; color: var(--text-primary);">
        <i class="fas fa-tasks"></i> Habits Completed
        <span style="color: var(--text-secondary); font-size: 1rem; margin-left: 8px;">
          (${dayData.completedHabits}/${habits.length})
        </span>
      </h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${habits.map(habit => {
          const completed = dayData.habits[habit.name];
          return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; 
                 background: ${completed ? '#d1fae5' : '#f1f5f9'}; 
                 border-radius: var(--radius-md); border-left: 4px solid ${completed ? '#10b981' : '#94a3b8'};">
              <div style="font-size: 1.5rem;">${habit.icon}</div>
              <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary);">${habit.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${habit.category}</div>
              </div>
              <div style="font-size: 1.2rem; color: ${completed ? '#10b981' : '#94a3b8'};">
                ${completed ? '✅' : '❌'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    ${dayData.notes ? `
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 12px; color: var(--text-primary);">
          <i class="fas fa-sticky-note"></i> Reflection
        </h3>
        <div style="background: var(--bg-surface); padding: 20px; border-radius: var(--radius-lg); 
             border-left: 4px solid var(--primary); white-space: pre-wrap; line-height: 1.6;">
          ${dayData.notes}
        </div>
      </div>
    ` : ''}
    
    <button id="closeModal" class="save-btn" style="width: 100%; justify-content: center;">
      <i class="fas fa-times"></i> Close
    </button>
  `;
  
  modal.classList.add('active');
  
  document.getElementById('closeModal').onclick = () => {
    modal.classList.remove('active');
  };
  
  // Close modal when clicking outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  };
}

// Settings and Data Management
function setupDataManagement() {
  // Export Data
  document.getElementById('exportData').onclick = () => {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindful-tracker-backup-${todayKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
  };
  
  // Import Data
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
          showToast('Data imported successfully!', 'success');
          renderToday();
        } catch (error) {
          showToast('Error importing data. Invalid format.', 'error');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Settings
  document.getElementById('settingsBtn').onclick = () => {
    const modal = document.getElementById('settingsModal');
    const modalContent = document.querySelector('#settingsModal .modal-content');
    
    modalContent.innerHTML = `
      <h2 style="margin-bottom: 24px; color: var(--primary);">
        <i class="fas fa-cog"></i> Settings
      </h2>
      
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--text-primary);">Data Management</h3>
        <button id="clearData" class="save-btn" style="background: var(--danger); width: 100%; justify-content: center;">
          <i class="fas fa-trash"></i> Clear All Data
        </button>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 12px;">
          This will permanently delete all your tracking data.
        </p>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--text-primary);">Appearance</h3>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="color: var(--text-secondary);">Theme:</span>
          <select id="themeSelect" class="save-btn" style="background: var(--bg-surface); color: var(--text-primary);">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      
      <button id="closeSettings" class="save-btn" style="width: 100%; justify-content: center;">
        <i class="fas fa-check"></i> Done
      </button>
    `;
    
    modal.classList.add('active');
    
    // Clear data confirmation
    document.getElementById('clearData').onclick = () => {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('tracker');
        showToast('All data cleared.', 'warning');
        setTimeout(() => location.reload(), 1000);
      }
    };
    
    // Theme selection
    const themeSelect = document.getElementById('themeSelect');
    const currentTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = currentTheme;
    
    themeSelect.onchange = () => {
      localStorage.setItem('theme', themeSelect.value);
      document.body.classList.toggle('dark-theme', themeSelect.value === 'dark');
      showToast('Theme updated!', 'success');
    };
    
    document.getElementById('closeSettings').onclick = () => {
      modal.classList.remove('active');
    };
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    };
  };
}

// Initialize App
function initializeApp() {
  // Initialize data
  initializeData();
  
  // Set up navigation
  setupViewNavigation();
  
  // Set up data management
  setupDataManagement();
  
  // Set up theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Add ripple animation to CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .dark-theme {
      --bg-gradient: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      --bg-card: #1e293b;
      --bg-surface: #334155;
      --bg-hover: #475569;
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-tertiary: #94a3b8;
      --border: #475569;
    }
    
    .chart-tooltip {
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      box-shadow: var(--shadow-lg);
      white-space: nowrap;
      z-index: 100;
    }
  `;
  document.head.appendChild(style);
  
  // Render initial view
  renderToday();
  updateLastUpdated();
  
  // Auto-save notes
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

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
