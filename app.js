import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Твой конфиг
const firebaseConfig = {
  apiKey: "AIzaSyDn0YFzT9Xb2HZASgpEPna3n71IJYzrUlw",
  authDomain: "suaz-map-7ec10.firebaseapp.com",
  databaseURL: "https://suaz-map-7ec10-default-rtdb.firebaseio.com",
  projectId: "suaz-map-7ec10",
  storageBucket: "suaz-map-7ec10.appspot.com",
  messagingSenderId: "636327827694",
  appId: "1:636327827694:web:89c68cdba0b15e65f93bff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, "devices");

let devices = [];
let editMode = false;

const container = document.getElementById("device-container");
const editButton = document.getElementById("edit-button");
const saveButton = document.getElementById("save-button");

async function loadDevices() {
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      devices = snapshot.val();
    } else {
      devices = [];
    }
    renderDevices();
  } catch (err) {
    console.error("Ошибка загрузки:", err);
  }
}

function renderDevices() {
  container.innerHTML = "";

  const list = devices.length > 0 ? devices : Array(6).fill("");

  list.forEach((device, index) => {
    const el = document.createElement("div");
    el.className = "device" + (editMode ? " editable" : "");

    if (editMode) {
      const input = document.createElement("input");
      input.value = device;
      input.placeholder = "Название аппарата";
      input.addEventListener("input", (e) => {
        devices[index] = e.target.value;
        showSaveButton();
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Удалить";
      delBtn.addEventListener("click", () => {
        devices.splice(index, 1);
        showSaveButton();
        renderDevices();
      });

      el.appendChild(input);
      el.appendChild(delBtn);
    } else {
      el.textContent = device || "Пусто";
    }

    container.appendChild(el);
  });

  if (editMode) {
    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Добавить аппарат";
    addBtn.addEventListener("click", () => {
      devices.push("");
      showSaveButton();
      renderDevices();
    });
    container.appendChild(addBtn);
  }
}

function showSaveButton() {
  saveButton.style.display = "inline-block";
}

editButton.addEventListener("click", () => {
  editMode = !editMode;
  editButton.textContent = editMode ? "Отмена" : "Редактировать";
  saveButton.style.display = "none";
  renderDevices();
});

saveButton.addEventListener("click", async () => {
  const filtered = devices.filter((d) => d.trim() !== "");
  try {
    await set(dbRef, filtered);
    alert("Сохранено!");
    saveButton.style.display = "none";
    editMode = false;
    editButton.textContent = "Редактировать";
    loadDevices();
  } catch (err) {
    console.error("Ошибка сохранения:", err);
  }
});

loadDevices();
