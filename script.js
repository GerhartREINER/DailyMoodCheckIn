const moods = [
  { name: "Great", emoji: "😄", color: "#22c55e" },
  { name: "Good", emoji: "🙂", color: "#84cc16" },
  { name: "Okay", emoji: "😐", color: "#eab308" },
  { name: "Low", emoji: "😕", color: "#f97316" },
  { name: "Rough", emoji: "😣", color: "#ef4444" }
];

const habits = ["Shower", "Walk", "Exercise", "Meditate", "Read"];

const todayKey = new Date().toISOString().slice(0, 10);

function loadData() {
  return JSON.parse(localStorage.getItem("tracker") || "{}");
}

function saveData(data) {
  localStorage.setItem("tracker", JSON.stringify(data));
}

function getToday(data) {
  data[todayKey] ??= { mood: null, habits: {}, notes: "" };
  return data[todayKey];
}

/* Views */
document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(btn.dataset.view).classList.add("active");
    render();
  };
});

function renderToday() {
  const data = loadData();
  const today = getToday(data);

  const moodBox = document.getElementById("moods");
  moodBox.innerHTML = "";
  moods.forEach(m => {
    const b = document.createElement("button");
    b.textContent = m.emoji;
    b.style.color = m.color;
    b.onclick = () => {
      today.mood = m.name;
      saveData(data);
      render();
    };
    moodBox.appendChild(b);
  });

  const habitBox = document.getElementById("habits");
  habitBox.innerHTML = "";
  habits.forEach(h => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = today.habits[h] || false;
    cb.onchange = () => {
      today.habits[h] = cb.checked;
      saveData(data);
    };
    label.append(cb, " ", h);
    habitBox.appendChild(label);
  });

  const notes = document.getElementById("notes");
  notes.value = today.notes;
  notes.oninput = () => {
    today.notes = notes.value;
    saveData(data);
  };
}

function renderHistory() {
  const data = loadData();
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = d.getDate();
    if (data[key]?.mood) {
      day.textContent += " " + moods.find(m => m.name === data[key].mood).emoji;
    }
    cal.appendChild(day);
  }
}

function renderProgress() {
  const data = loadData();
  const stats = document.getElementById("stats");
  stats.innerHTML = "";

  habits.forEach(h => {
    const count = Object.values(data).filter(d => d.habits?.[h]).length;
    const div = document.createElement("div");
    div.innerHTML = `<strong>${h}</strong> (${count})`;
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = Math.min(count * 3, 100) + "%";
    div.appendChild(bar);
    stats.appendChild(div);
  });
}

function render() {
  renderToday();
  renderHistory();
  renderProgress();
}

render();
