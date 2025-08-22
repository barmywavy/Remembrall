// ---- Storage helpers ----
const STORAGE_KEY = "classes";

function loadClasses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveClasses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- Day sorting ----
const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ---- Rendering helpers ----
function renderClassCard(cls, options = {}) {
  const { showDelete = false } = options;
  const card = document.createElement("div");
  card.className = "class-card";

  // Three dots menu
  const menuBtn = document.createElement("button");
  menuBtn.className = "card-menu-btn";
  menuBtn.textContent = "⋮";
  menuBtn.title = "Edit Class";
  card.appendChild(menuBtn);

  menuBtn.addEventListener("click", () => {
    const newName = prompt("Edit class name:", cls.name);
    if (newName) {
      const list = loadClasses();
      const cIdx = list.findIndex((c) => c.id === cls.id);
      if (cIdx > -1) {
        list[cIdx].name = newName;
        saveClasses(list);
        card.replaceWith(renderClassCard(list[cIdx], options));
      }
    }
  });

  const title = document.createElement("h3");
  title.textContent = `${cls.name} (${cls.day})`;
  card.appendChild(title);

  // Items
  if (!cls.items || cls.items.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No items yet.";
    card.appendChild(p);
  } else {
    const ul = document.createElement("ul");
    cls.items.forEach((item) => {
      const li = document.createElement("li");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!item.done;
      cb.addEventListener("change", () => {
        const list = loadClasses();
        const cIdx = list.findIndex((c) => c.id === cls.id);
        if (cIdx > -1) {
          const iIdx = list[cIdx].items.findIndex((it) => it.id === item.id);
          if (iIdx > -1) {
            list[cIdx].items[iIdx].done = cb.checked;
            saveClasses(list);
          }
        }
      });
      li.appendChild(cb);
      li.appendChild(document.createTextNode(" " + item.name));
      ul.appendChild(li);
    });
    card.appendChild(ul);
  }

  if (showDelete) {
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete Class";
    delBtn.style.marginTop = "0.5rem";
    delBtn.addEventListener("click", () => {
      if (!confirm(`Delete class "${cls.name}"?`)) return;
      let list = loadClasses();
      list = list.filter((c) => c.id !== cls.id);
      saveClasses(list);
      card.remove();
      renderAllClassesPage();
    });
    card.appendChild(delBtn);
  }

  return card;
}

// ---- Pages ----
function renderAllClassesPage() {
  const container = document.getElementById("all-classes");
  if (!container) return;
  const list = loadClasses();
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = `<div class="class-card"><p class="muted">No classes added yet.</p></div>`;
    return;
  }

  WEEKDAY_ORDER.forEach((day) => {
    const dayClasses = list.filter((c) => c.day === day);
    if (dayClasses.length === 0) return;
    const dayHeader = document.createElement("h2");
    dayHeader.textContent = day;
    dayHeader.style.textAlign = "left";
    container.appendChild(dayHeader);
    dayClasses.forEach((cls) =>
      container.appendChild(renderClassCard(cls, { showDelete: true }))
    );
  });
}

function renderTodayClassesPage() {
  const container = document.getElementById("today-classes");
  if (!container) return;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const list = loadClasses().filter((c) => c.day === today);
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = `<div class="class-card"><p class="muted">No classes today.</p></div>`;
    return;
  }
  list.forEach((cls) => container.appendChild(renderClassCard(cls)));
}

function initAddClassPage() {
  const form = document.getElementById("add-class-form");
  if (!form) return;
  const nameInput = document.getElementById("class-name");
  const daySelect = document.getElementById("class-day");
  const itemInput = document.getElementById("item-input");
  const addItemBtn = document.getElementById("add-item-btn");
  const chipList = document.getElementById("item-chip-list");
  const successMsg = document.getElementById("success-msg");

  let items = [];
  function renderChips() {
    chipList.innerHTML = "";
    items.forEach((it) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = it;
      const xBtn = document.createElement("button");
      xBtn.className = "chip-x";
      xBtn.textContent = "x";
      xBtn.addEventListener("click", () => {
        items = items.filter((i) => i !== it);
        renderChips();
      });
      chip.appendChild(xBtn);
      chipList.appendChild(chip);
    });
  }

  addItemBtn.addEventListener("click", () => {
    const val = itemInput.value.trim();
    if (val === "") return;
    items.push(val);
    itemInput.value = "";
    renderChips();
  });
  itemInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addItemBtn.click();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim(),
      day = daySelect.value;
    if (!name || !day) return;
    const newCls = {
      id: uid(),
      name,
      day,
      items: items.map((it) => ({ id: uid(), name: it, done: false })),
    };
    const list = loadClasses();
    list.push(newCls);
    saveClasses(list);
    successMsg.textContent = "Class saved!";
    nameInput.value = "";
    daySelect.value = "";
    items = [];
    renderChips();
    setTimeout(() => {
      successMsg.textContent = "";
    }, 2000);
  });
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  renderAllClassesPage();
  renderTodayClassesPage();
  initAddClassPage();
});
