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

// Initialize with enhanced sample data
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
      const progressFactor = 1 - (i / 29); // Increases from 0 to 1
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
      if (i <= 7) { // Last 7 days get detailed notes
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

/* Enhanced Mood Selection */
function renderToday() {
  const data = loadData();
  const today = getToday(data);
  
  // Update current date display
  document.getElementById('currentDate').textContent = formatDate(todayKey);
  
  // Render Enhanced Mood Selection
  const moodBox = document.getElementById("moods");
  moodBox.innerHTML = "";
  moodBox.className = "mood-grid";
  
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
      // Add click animation
      card.classList.add("animating");
      setTimeout(() => card.classList.remove("animating"), 300);
      
      // Remove selection from other cards
      document.querySelectorAll('.mood-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      // Add selection to clicked card with delay
      setTimeout(() => {
        card.classList.add('selected');
        today.mood = m.name;
        saveData(data);
        showNotification(`Mood set to ${m.name}!`, 1500);
        
        // Update streak if applicable
        updateMoodStreak(data, m.name);
      }, 150);
    };
    
    moodBox.appendChild(card);
  });
  
  // Render habits with progress tracking
  renderHabitsWithProgress(data, today);
  
  // Render notes with auto-save
  setupNotesAutoSave(data, today);
}

/* Enhanced Habit Tracking with Progress */
function renderHabitsWithProgress(data, today) {
  const habitBox = document.getElementById("habits");
  habitBox.innerHTML = "";
  
  // Calculate weekly completion for each habit
  const weeklyStats = calculateWeeklyStats(data);
  
  habits.forEach((h, index) => {
    const habitItem = document.createElement("div");
    habitItem.className = "habit-item";
    
    const weeklyCompletion = weeklyStats[h.name] || 0;
    const progressPercent = Math.round(weeklyCompletion * 100);
    
    const isChecked = today.habits[h.name] || false;
    
    habitItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
        <input type="checkbox" id="habit-${h.name}" ${isChecked ? 'checked' : ''}>
        <label for="habit-${h.name}" style="flex: 1;">
          <span style="font-size: 1.2rem;">${h.icon}</span>
          <span style="margin-left: 8px;">${h.name}</span>
          <span style="color: var(--text-light); font-size: 0.9rem; margin-left: 8px;">
            ${h.category}
          </span>
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
            <div style="width: ${progressPercent}%; height: 100%; background: ${isChecked ? '#10b981' : '#6366f1'}; 
                 border-radius: 3px; transition: width 0.5s ease;"></div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-light); min-width: 40px;">
            ${progressPercent}%
          </span>
        </div>
      </div>
      ${isChecked ? `
        <div style="margin-top: 8px; color: #10b981; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
          <i class="fas fa-check-circle"></i> Completed today!
        </div>
      ` : ''}
    `;
    
    const checkbox = habitItem.querySelector('input');
    checkbox.onchange = () => {
      today.habits[h.name] = checkbox.checked;
      
      // Update completed habits count
      today.completedHabits = Object.values(today.habits).filter(Boolean).length;
      
      saveData(data);
      
      if (checkbox.checked) {
        showNotification(`Great job! ${h.name} completed!`, 1500);
        updateHabitStreak(data, h.name);
      }
      
      // Re-render to show updated progress
      renderToday();
    };
    
    habitBox.appendChild(habitItem);
  });
  
  // Add daily summary
  const completedCount = Object.values(today.habits).filter(Boolean).length;
  const totalHabits = habits.length;
  const dailyProgress = document.createElement("div");
  dailyProgress.className = "stat-card";
  dailyProgress.innerHTML = `
    <div class="stat-label">Today's Progress</div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0;">
      <div class="stat-value">${completedCount}/${totalHabits}</div>
      <div style="font-size: 2rem;">${getProgressEmoji(completedCount/totalHabits)}</div>
    </div>
    <div style="height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden;">
      <div style="width: ${(completedCount/totalHabits)*100}%; height: 100%; 
           background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.5s ease;"></div>
    </div>
    <div style="margin-top: 10px; color: var(--text-light); font-size: 0.9rem;">
      ${getProgressMessage(completedCount, totalHabits)}
    </div>
  `;
  
  habitBox.appendChild(dailyProgress);
}

function getProgressEmoji(ratio) {
  if (ratio >= 0.8) return "🏆";
  if (ratio >= 0.6) return "🎯";
  if (ratio >= 0.4) return "👍";
  if (ratio > 0) return "👏";
  return "💪";
}

function getProgressMessage(completed, total) {
  const ratio = completed / total;
  if (ratio === 1) return "Perfect! All habits completed!";
  if (ratio >= 0.8) return "Excellent work! Almost perfect!";
  if (ratio >= 0.6) return "Good job! Keep it up!";
  if (ratio >= 0.4) return "Making progress!";
  if (ratio > 0) return "Every bit counts!";
  return "Let's start strong!";
}

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

/* Enhanced History View with Detailed Stats */
function renderHistory() {
  const data = loadData();
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";
  
  // Calculate overall trends
  const trends = calculateTrends(data);
  
  // Add trend overview
  const trendCard = document.createElement("div");
  trendCard.className = "stat-card";
  trendCard.style.marginBottom = "20px";
  trendCard.innerHTML = `
    <h3 style="margin-bottom: 10px; color: var(--accent);">
      <i class="fas fa-chart-line"></i> 30-Day Overview
    </h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0;">
      <div style="text-align: center;">
        <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent);">
          ${trends.averageMoodValue.toFixed(1)}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-light);">Avg Mood</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.8rem; font-weight: 700; color: var(--accent);">
          ${trends.averageCompletion}%
        </div>
        <div style="font-size: 0.8rem; color: var(--text-light);">Habit Completion</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 1.8rem; font-weight: 700; color: ${trends.improvement > 0 ? '#10b981' : '#ef4444'}">
          ${trends.improvement > 0 ? '+' : ''}${trends.improvement}%
        </div>
        <div style="font-size: 0.8rem; color: var(--text-light);">Improvement</div>
      </div>
    </div>
    <div style="color: var(--text-light); font-size: 0.9rem; margin-top: 10px;">
      <i class="fas fa-${trends.improvement > 0 ? 'arrow-up' : 'arrow-down'}"></i>
      ${getTrendMessage(trends)}
    </div>
  `;
  
  cal.appendChild(trendCard);
  
  // Add habit improvement chart
  const habitChart = document.createElement("div");
  habitChart.className = "habit-chart";
  habitChart.innerHTML = `
    <h4 style="margin-bottom: 15px; color: var(--accent);">
      <i class="fas fa-tasks"></i> Habit Improvement
    </h4>
    <div id="habit-improvement-chart"></div>
  `;
  
  cal.appendChild(habitChart);
  renderHabitImprovementChart(data);
  
  // Add detailed day-by-day view
  const daysHeader = document.createElement("div");
  daysHeader.innerHTML = `<h3 style="margin: 20px 0 10px 0; color: var(--accent);">
    <i class="fas fa-calendar-alt"></i> Daily Breakdown
  </h3>`;
  cal.appendChild(daysHeader);
  
  // Create a grid for the last 30 days
  const daysGrid = document.createElement("div");
  daysGrid.className = "history-days-grid";
  daysGrid.style.display = "grid";
  daysGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
  daysGrid.style.gap = "15px";
  daysGrid.style.marginTop = "15px";
  
  const last30Days = getLastNDays(30).reverse();
  
  last30Days.forEach(date => {
    const dayData = data[date];
    const dayElement = createHistoryDayElement(date, dayData, data);
    daysGrid.appendChild(dayElement);
  });
  
  cal.appendChild(daysGrid);
}

function createHistoryDayElement(date, dayData, allData) {
  const day = new Date(date);
  const dayElement = document.createElement("div");
  dayElement.className = "history-day";
  
  if (!dayData) {
    dayElement.innerHTML = `
      <div class="day-header">
        <div class="day-date">${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div>📭</div>
      </div>
      <div style="color: var(--text-light); font-size: 0.9rem; text-align: center; padding: 20px;">
        No data recorded
      </div>
    `;
    return dayElement;
  }
  
  const mood = moods.find(m => m.name === dayData.mood);
  const completedHabits = Object.values(dayData.habits).filter(Boolean).length;
  const completionPercent = Math.round((completedHabits / habits.length) * 100);
  
  // Calculate streak for this day
  const moodStreak = calculateMoodStreak(allData, date);
  const habitStreak = calculateHabitStreak(allData, date);
  
  // Compare with previous day
  const prevDate = getPreviousDay(date);
  const prevDayData = allData[prevDate];
  let trendIndicator = "";
  if (prevDayData) {
    const prevCompleted = Object.values(prevDayData.habits).filter(Boolean).length;
    const improvement = completedHabits - prevCompleted;
    if (improvement > 0) trendIndicator = `<span class="trend-up">↑ ${improvement}</span>`;
    else if (improvement < 0) trendIndicator = `<span class="trend-down">↓ ${Math.abs(improvement)}</span>`;
    else trendIndicator = `<span class="trend-neutral">→</span>`;
  }
  
  dayElement.innerHTML = `
    <div class="day-header">
      <div class="day-date">
        ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <div class="day-mood" style="color: ${mood?.color || '#ccc'}">
        ${mood?.emoji || '❓'}
      </div>
    </div>
    
    <div class="habit-progress">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-weight: 600;">Habits: ${completedHabits}/${habits.length}</span>
        <span style="color: var(--accent); font-weight: 600;">${completionPercent}%</span>
      </div>
      <div class="habit-bar">
        <div class="habit-fill" style="width: ${completionPercent}%"></div>
      </div>
      ${trendIndicator ? `<div style="font-size: 0.8rem; margin-top: 5px;">${trendIndicator} from previous day</div>` : ''}
    </div>
    
    ${dayData.completedHabits > 0 ? `
      <div class="habit-list">
        ${habits.slice(0, 4).map(h => `
          <span class="habit-badge ${dayData.habits[h.name] ? 'completed' : 'missed'}">
            ${h.icon} ${dayData.habits[h.name] ? '✓' : '✗'}
          </span>
        `).join('')}
        ${habits.length > 4 ? `<span class="habit-badge">+${habits.length - 4} more</span>` : ''}
      </div>
    ` : ''}
    
    ${moodStreak > 1 ? `
      <div style="margin-top: 8px;">
        <span class="streak-counter">
          <i class="fas fa-fire"></i> ${moodStreak} day mood streak
        </span>
      </div>
    ` : ''}
    
    ${habitStreak > 1 ? `
      <div style="margin-top: 5px;">
        <span style="background: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">
          <i class="fas fa-bolt"></i> ${habitStreak} day habit streak
        </span>
      </div>
    ` : ''}
    
    ${dayData.notes ? `
      <div class="day-notes" title="${dayData.notes}">
        <i class="fas fa-sticky-note"></i> ${dayData.notes.substring(0, 60)}${dayData.notes.length > 60 ? '...' : ''}
      </div>
    ` : ''}
  `;
  
  // Add click to view details
  dayElement.onclick = () => showDayDetails(date, dayData);
  
  return dayElement;
}

function renderHabitImprovementChart(data) {
  const last30Days = getLastNDays(30);
  const container = document.getElementById('habit-improvement-chart');
  
  // Calculate improvement for each habit
  const improvementData = habits.map(habit => {
    const firstHalf = last30Days.slice(0, 15);
    const secondHalf = last30Days.slice(15);
    
    const firstHalfCompletion = firstHalf.filter(date => 
      data[date]?.habits?.[habit.name]
    ).length / 15;
    
    const secondHalfCompletion = secondHalf.filter(date => 
      data[date]?.habits?.[habit.name]
    ).length / 15;
    
    const improvement = secondHalfCompletion - firstHalfCompletion;
    
    return {
      habit: habit.name,
      icon: habit.icon,
      firstHalf: Math.round(firstHalfCompletion * 100),
      secondHalf: Math.round(secondHalfCompletion * 100),
      improvement: Math.round(improvement * 100),
      category: habit.category
    };
  });
  
  // Sort by improvement
  improvementData.sort((a, b) => b.improvement - a.improvement);
  
  container.innerHTML = improvementData.map(item => `
    <div class="chart-bar">
      <div class="chart-label">
        <span style="font-size: 1.2rem;">${item.icon}</span>
        <span style="margin-left: 8px;">${item.habit}</span>
      </div>
      <div class="chart-track">
        <div class="chart-progress" style="width: ${Math.max(item.secondHalf, 10)}%;">
          ${item.secondHalf}%
        </div>
      </div>
      <div style="width: 60px; text-align: right; font-weight: 600; 
           color: ${item.improvement > 0 ? '#10b981' : item.improvement < 0 ? '#ef4444' : '#6b7280'}">
        ${item.improvement > 0 ? '+' : ''}${item.improvement}%
      </div>
    </div>
  `).join('');
}

/* Helper Functions */
function calculateTrends(data) {
  const last30Days = getLastNDays(30);
  const validDays = last30Days.filter(date => data[date]);
  
  if (validDays.length === 0) return { averageMoodValue: 0, averageCompletion: 0, improvement: 0 };
  
  // Calculate average mood value
  const totalMoodValue = validDays.reduce((sum, date) => {
    const mood = moods.find(m => m.name === data[date].mood);
    return sum + (mood?.value || 3);
  }, 0);
  const averageMoodValue = totalMoodValue / validDays.length;
  
  // Calculate habit completion
  const totalCompletion = validDays.reduce((sum, date) => {
    const completed = Object.values(data[date].habits).filter(Boolean).length;
    return sum + (completed / habits.length);
  }, 0);
  const averageCompletion = Math.round((totalCompletion / validDays.length) * 100);
  
  // Calculate improvement (compare first half vs second half of period)
  const firstHalf = validDays.slice(0, Math.floor(validDays.length / 2));
  const secondHalf = validDays.slice(Math.floor(validDays.length / 2));
  
  const firstHalfAvg = firstHalf.length > 0 ? 
    firstHalf.reduce((sum, date) => sum + (moods.find(m => m.name === data[date].mood)?.value || 3), 0) / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? 
    secondHalf.reduce((sum, date) => sum + (moods.find(m => m.name === data[date].mood)?.value || 3), 0) / secondHalf.length : 0;
  
  const improvement = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) || 0;
  
  return { averageMoodValue, averageCompletion, improvement };
}

function getTrendMessage(trends) {
  if (trends.improvement > 20) return "Excellent progress! You're improving rapidly!";
  if (trends.improvement > 10) return "Great improvement! Keep up the good work!";
  if (trends.improvement > 0) return "Steady improvement. You're on the right track!";
  if (trends.improvement === 0) return "Maintaining consistency. That's important too!";
  return "Don't worry about setbacks. Every day is a new opportunity!";
}

function calculateMoodStreak(data, date) {
  let streak = 0;
  let currentDate = date;
  
  while (data[currentDate]?.mood) {
    streak++;
    currentDate = getPreviousDay(currentDate);
  }
  
  return streak;
}

function calculateHabitStreak(data, date) {
  let streak = 0;
  let currentDate = date;
  
  while (data[currentDate] && Object.values(data[currentDate].habits).some(v => v)) {
    streak++;
    currentDate = getPreviousDay(currentDate);
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

function getPreviousDay(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function showDayDetails(date, dayData) {
  // Create modal for detailed view
  const modal = document.createElement('div');
  modal.className = 'day-detail-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      <h2 style="color: var(--accent); margin-bottom: 20px;">
        <i class="fas fa-calendar-day"></i> ${formatDate(date)}
      </h2>
      
      ${dayData.mood ? `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 15px; 
             background: ${moods.find(m => m.name === dayData.mood)?.color || '#f3f4f6'}10; border-radius: 12px;">
          <div style="font-size: 3rem;">${moods.find(m => m.name === dayData.mood)?.emoji}</div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 600;">${dayData.mood}</div>
            <div style="color: var(--text-light);">${moods.find(m => m.name === dayData.mood)?.desc}</div>
          </div>
        </div>
      ` : ''}
      
      <h3 style="margin-bottom: 15px;"><i class="fas fa-tasks"></i> Habits Completed</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 25px;">
        ${habits.map(habit => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px; 
               background: ${dayData.habits[habit.name] ? '#d1fae5' : '#f3f4f6'}; border-radius: 8px;">
            <div style="font-size: 1.5rem;">${habit.icon}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600;">${habit.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-light);">${habit.category}</div>
            </div>
            <div style="font-size: 1.2rem;">
              ${dayData.habits[habit.name] ? '✅' : '❌'}
            </div>
          </div>
        `).join('')}
      </div>
      
      ${dayData.notes ? `
        <h3 style="margin-bottom: 10px;"><i class="fas fa-sticky-note"></i> Notes</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; white-space: pre-wrap;">
          ${dayData.notes}
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="editDay" class="save-btn">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button id="closeDayModal" class="save-btn" style="background: var(--text-light);">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => modal.classList.add('active'), 10);
  
  modal.querySelector('.close-modal').onclick = 
  modal.querySelector('#closeDayModal').onclick = () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  };
}

/* Add these new functions to script.js */
function updateMoodStreak(data, mood) {
  const today = getToday(data);
  const yesterdayKey = getPreviousDay(todayKey);
  const yesterday = data[yesterdayKey];
  
  if (yesterday && yesterday.mood === mood) {
    today.moodStreak = (yesterday.moodStreak || 1) + 1;
    if (today.moodStreak > 1) {
      showNotification(`That's ${today.moodStreak} days in a row feeling ${mood}!`, 2000);
    }
  } else {
    today.moodStreak = 1;
  }
}

function updateHabitStreak(data, habitName) {
  const today = getToday(data);
  const yesterdayKey = getPreviousDay(todayKey);
  const yesterday = data[yesterdayKey];
  
  if (yesterday && yesterday.habits[habitName]) {
    today.habitStreaks = today.habitStreaks || {};
    today.habitStreaks[habitName] = (yesterday.habitStreaks?.[habitName] || 1) + 1;
    
    const streak = today.habitStreaks[habitName];
    if (streak > 2) {
      showNotification(`${streak}-day streak for ${habitName}!`, 2000);
    }
  } else {
    today.habitStreaks = today.habitStreaks || {};
    today.habitStreaks[habitName] = 1;
  }
}

/* Update the initializeApp function to include streak tracking */
function initializeApp() {
  initializeData();
  renderToday();
  
  // Auto-save notes every 5 seconds
  setInterval(() => {
    const data = loadData();
    const today = getToday(data);
    const notes = document.getElementById('notes');
    if (notes && notes.value !== today.notes) {
      today.notes = notes.value;
      saveData(data);
      document.getElementById('noteCount').textContent = `${notes.value.length} characters`;
    }
  }, 5000);
}
