document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Set current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', options);
    
    // Data storage key
    const STORAGE_KEY = 'moodHabitTrackerData';
    
    // Initialize data structure
    let appData = {
        entries: {},
        settings: {
            lastSaved: null
        }
    };
    
    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            appData = JSON.parse(savedData);
            console.log('Data loaded from localStorage');
        } else {
            console.log('No saved data found, generating sample data');
            generateSampleData();
        }
    }
    
    // Save data to localStorage
    function saveData() {
        appData.settings.lastSaved = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        updateLastSavedDisplay();
        console.log('Data saved to localStorage');
    }
    
    // Auto-save function (called on any change)
    function autoSave() {
        // Debounce the save to prevent too frequent saves
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(saveData, 1000);
    }
    
    // Generate sample data for new users
    function generateSampleData() {
        const today = new Date();
        const moodOptions = ['great', 'good', 'okay', 'low', 'rough'];
        const habitOptions = ['shower', 'walk', 'exercise', 'meditate', 'read'];
        
        // Generate data for the last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = formatDate(date);
            
            // Random mood
            const moodIndex = Math.floor(Math.random() * moodOptions.length);
            const mood = moodOptions[moodIndex];
            
            // Random habits (more likely to have some completed)
            const habits = {};
            habitOptions.forEach(habit => {
                // Make habits more likely to be completed on better mood days
                const moodWeight = mood === 'great' ? 0.9 : 
                                  mood === 'good' ? 0.8 : 
                                  mood === 'okay' ? 0.6 : 
                                  mood === 'low' ? 0.4 : 0.3;
                habits[habit] = Math.random() < moodWeight;
            });
            
            // Random notes (sometimes)
            const notes = Math.random() > 0.7 ? 
                `Sample entry for ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. This is automatically generated data.` : '';
            
            appData.entries[dateString] = {
                mood: mood,
                habits: habits,
                notes: notes,
                date: dateString
            };
        }
        
        saveData();
    }
    
    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Get today's date string
    function getTodayDateString() {
        return formatDate(new Date());
    }
    
    // Update last saved display
    function updateLastSavedDisplay() {
        if (appData.settings.lastSaved) {
            const lastSavedDate = new Date(appData.settings.lastSaved);
            const timeString = lastSavedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('last-saved').textContent = `Last saved: ${timeString}`;
        }
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.getAttribute('data-view');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update views
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${viewId}-view`) {
                    view.classList.add('active');
                }
            });
            
            // If switching to history view, update calendar
            if (viewId === 'history') {
                updateCalendar();
            }
            
            // If switching to progress view, update stats
            if (viewId === 'progress') {
                updateProgressView();
            }
        });
    });
    
    // Today View - Mood selection
    const moodOptions = document.querySelectorAll('.mood-option');
    let selectedMood = null;
    
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update selected mood
            selectedMood = option.getAttribute('data-mood');
            
            // Update display
            const moodLabels = {
                'great': 'Great 😊',
                'good': 'Good 🙂', 
                'okay': 'Okay 😐',
                'low': 'Low 😕',
                'rough': 'Rough 😔'
            };
            document.getElementById('selected-mood-text').textContent = `Selected: ${moodLabels[selectedMood]}`;
            
            // Save to today's entry
            updateTodayEntry();
        });
    });
    
    // Today View - Habit checkboxes
    const habitCheckboxes = document.querySelectorAll('.habit-item input[type="checkbox"]');
    
    habitCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateHabitsCompleted();
            updateTodayEntry();
        });
    });
    
    // Update habits completed count
    function updateHabitsCompleted() {
        const checkedCount = document.querySelectorAll('.habit-item input[type="checkbox"]:checked').length;
        document.getElementById('habits-completed').textContent = `${checkedCount}/5 habits completed`;
    }
    
    // Today View - Notes character counter
    const notesTextarea = document.getElementById('daily-notes');
    const charCount = document.getElementById('char-count');
    
    notesTextarea.addEventListener('input', () => {
        const length = notesTextarea.value.length;
        charCount.textContent = `${length}/500`;
        
        // Change color if approaching limit
        if (length > 450) {
            charCount.style.color = '#F44336';
        } else if (length > 400) {
            charCount.style.color = '#FF9800';
        } else {
            charCount.style.color = '#666';
        }
        
        updateTodayEntry();
    });
    
    // Update today's entry in appData
    function updateTodayEntry() {
        const today = getTodayDateString();
        
        // Get selected mood
        const mood = selectedMood;
        
        // Get completed habits
        const habits = {};
        habitCheckboxes.forEach(checkbox => {
            const habitName = checkbox.getAttribute('data-habit');
            habits[habitName] = checkbox.checked;
        });
        
        // Get notes
        const notes = notesTextarea.value;
        
        // Update entry
        appData.entries[today] = {
            mood: mood,
            habits: habits,
            notes: notes,
            date: today
        };
        
        autoSave();
    }
    
    // Load today's entry if it exists
    function loadTodayEntry() {
        const today = getTodayDateString();
        const todayEntry = appData.entries[today];
        
        if (todayEntry) {
            // Load mood
            if (todayEntry.mood) {
                selectedMood = todayEntry.mood;
                const moodOption = document.querySelector(`.mood-option[data-mood="${todayEntry.mood}"]`);
                if (moodOption) {
                    moodOptions.forEach(opt => opt.classList.remove('selected'));
                    moodOption.classList.add('selected');
                    
                    const moodLabels = {
                        'great': 'Great 😊',
                        'good': 'Good 🙂', 
                        'okay': 'Okay 😐',
                        'low': 'Low 😕',
                        'rough': 'Rough 😔'
                    };
                    document.getElementById('selected-mood-text').textContent = `Selected: ${moodLabels[todayEntry.mood]}`;
                }
            }
            
            // Load habits
            if (todayEntry.habits) {
                habitCheckboxes.forEach(checkbox => {
                    const habitName = checkbox.getAttribute('data-habit');
                    checkbox.checked = todayEntry.habits[habitName] || false;
                });
                updateHabitsCompleted();
            }
            
            // Load notes
            if (todayEntry.notes) {
                notesTextarea.value = todayEntry.notes;
                charCount.textContent = `${todayEntry.notes.length}/500`;
            }
        }
    }
    
    // History View - Calendar
    let currentCalendarDate = new Date();
    
    // Update calendar display
    function updateCalendar() {
        const monthYear = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('current-month-year').textContent = monthYear;
        
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Get first day of month
        const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
        // Get last day of month
        const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
        
        // Get day of week for first day (0 = Sunday, 6 = Saturday)
        const firstDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
            const dateString = formatDate(date);
            const todayString = getTodayDateString();
            
            // Check if this day has data
            const hasData = appData.entries[dateString];
            
            if (hasData) {
                dayElement.classList.add('has-data');
            }
            
            // Check if this is today
            if (dateString === todayString) {
                dayElement.classList.add('today');
                dayElement.style.border = '2px solid #4b6cb7';
            }
            
            dayElement.setAttribute('data-date', dateString);
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Mood emoji if data exists
            if (hasData && appData.entries[dateString].mood) {
                const moodEmoji = document.createElement('div');
                moodEmoji.className = 'day-mood';
                
                const moodEmojis = {
                    'great': '😊',
                    'good': '🙂',
                    'okay': '😐',
                    'low': '😕',
                    'rough': '😔'
                };
                
                moodEmoji.textContent = moodEmojis[appData.entries[dateString].mood] || '';
                dayElement.appendChild(moodEmoji);
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Add selected class to clicked day
                dayElement.classList.add('selected');
                
                // Show day details
                showDayDetails(dateString);
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        // Clear any previously selected day details
        document.querySelector('.no-day-selected').style.display = 'flex';
        document.querySelector('.day-detail-content')?.remove();
    }
    
    // Navigation buttons for calendar
    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        updateCalendar();
    });
    
    // Show day details
    function showDayDetails(dateString) {
        const entry = appData.entries[dateString];
        const dayDetails = document.getElementById('day-details');
        
        // Hide "no day selected" message
        document.querySelector('.no-day-selected').style.display = 'none';
        
        // Remove existing details if any
        const existingDetails = document.querySelector('.day-detail-content');
        if (existingDetails) {
            existingDetails.remove();
        }
        
        if (!entry) {
            const noData = document.createElement('div');
            noData.className = 'day-detail-content active';
            noData.innerHTML = `
                <div class="detail-header">
                    <div class="detail-date">${formatDisplayDate(dateString)}</div>
                </div>
                <p>No data recorded for this day.</p>
            `;
            dayDetails.appendChild(noData);
            return;
        }
        
        // Create details content
        const details = document.createElement('div');
        details.className = 'day-detail-content active';
        
        const moodEmojis = {
            'great': '😊',
            'good': '🙂',
            'okay': '😐',
            'low': '😕',
            'rough': '😔'
        };
        
        const moodLabels = {
            'great': 'Great',
            'good': 'Good',
            'okay': 'Okay',
            'low': 'Low',
            'rough': 'Rough'
        };
        
        const moodColors = {
            'great': '#4CAF50',
            'good': '#8BC34A',
            'okay': '#FFC107',
            'low': '#FF9800',
            'rough': '#F44336'
        };
        
        // Count completed habits
        const completedHabits = Object.values(entry.habits || {}).filter(v => v).length;
        const totalHabits = 5;
        
        // Create habits list HTML
        let habitsHTML = '';
        if (entry.habits) {
            habitsHTML = '<div class="detail-habits-list">';
            
            const habitIcons = {
                'shower': 'fas fa-shower',
                'walk': 'fas fa-walking',
                'exercise': 'fas fa-dumbbell',
                'meditate': 'fas fa-spa',
                'read': 'fas fa-book'
            };
            
            const habitLabels = {
                'shower': 'Shower',
                'walk': 'Walk',
                'exercise': 'Exercise',
                'meditate': 'Meditate',
                'read': 'Read'
            };
            
            for (const [habit, completed] of Object.entries(entry.habits)) {
                habitsHTML += `
                    <div class="detail-habit ${completed ? 'completed' : 'not-completed'}">
                        <i class="${habitIcons[habit]}"></i>
                        <span>${habitLabels[habit]}: ${completed ? 'Completed' : 'Not completed'}</span>
                    </div>
                `;
            }
            
            habitsHTML += '</div>';
        }
        
        details.innerHTML = `
            <div class="detail-header">
                <div class="detail-date">${formatDisplayDate(dateString)}</div>
                <div class="detail-mood-container">
                    <div class="detail-mood">${moodEmojis[entry.mood] || ''}</div>
                    <div class="detail-mood-label" style="background-color: ${moodColors[entry.mood] || '#999'}">
                        ${moodLabels[entry.mood] || 'No mood'}
                    </div>
                </div>
            </div>
            
            <div class="detail-habits">
                <h4>Habits (${completedHabits}/${totalHabits} completed)</h4>
                ${habitsHTML}
            </div>
            
            ${entry.notes ? `
            <div class="detail-notes">
                <h4>Notes</h4>
                <p>${entry.notes}</p>
            </div>
            ` : ''}
        `;
        
        dayDetails.appendChild(details);
    }
    
    // Format date for display
    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Progress View - Update stats
    function updateProgressView() {
        // Get data from last 30 days
        const today = new Date();
        const last30Days = [];
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(formatDate(date));
        }
        
        // Filter entries from last 30 days
        const recentEntries = last30Days
            .map(date => appData.entries[date])
            .filter(entry => entry);
        
        if (recentEntries.length === 0) {
            // No data to show
            document.getElementById('avg-mood').textContent = '-';
            document.getElementById('avg-habits').textContent = '-';
            document.getElementById('consistency').textContent = '-';
            return;
        }
        
        // Calculate average mood
        const moodValues = {
            'great': 5,
            'good': 4,
            'okay': 3,
            'low': 2,
            'rough': 1
        };
        
        let totalMoodValue = 0;
        let moodCount = 0;
        const moodDistribution = {
            'great': 0,
            'good': 0,
            'okay': 0,
            '
