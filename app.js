// app.js (CDN-версия)

const PASSWORD = "920583104217";
let isAdmin = false;
let savedData = {};
let editedData = {};
let searchQuery = "";

const loginArea = document.getElementById("login-area");
const saveAllBtn = document.getElementById("save-all");

// Инициализация Firebase через глобальный объект firebase (CDN)
const firebaseConfig = {
  apiKey: "AIzaSyDn0YFzT9Xb2HZASgpEPna3n71IJYzrUlw",
  authDomain: "suaz-map-7ec10.firebaseapp.com",
  databaseURL: "https://suaz-map-7ec10-default-rtdb.firebaseio.com",
  projectId: "suaz-map-7ec10",
  storageBucket: "suaz-map-7ec10.firebasestorage.app",
  messagingSenderId: "636327827694",
  appId: "1:636327827694:web:89c68cdba0b15e65f93bff"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const dataRef = db.ref("apparatusData");

function renderButtons() {
  const container = document.getElementById("buttons-container");
  container.innerHTML = "";

  const keys = Object.keys(editedData).sort();

  if (isAdmin) {
    const addButton = document.createElement("button");
    addButton.textContent = "➕ Добавить аппарат";
    addButton.className = "add-button";
    addButton.onclick = () => {
      const id = `device_${Date.now()}`;
      editedData[id] = { name: "", address: "", mapLink: "" };
      renderButtons();
      showSaveButton();
    };
    container.appendChild(addButton);
  }

  const filteredKeys = keys.filter(key =>
    editedData[key].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredKeys.forEach(key => {
    const data = editedData[key];
    const block = document.createElement("div");
    block.className = "button-block";

    if (isAdmin) {
      const nameInput = document.createElement("input");
      nameInput.value = data.name;
      nameInput.placeholder = "Название аппарата";
      nameInput.oninput = () => {
        editedData[key].name = nameInput.value;
        showSaveButton();
      };

      const addressInput = document.createElement("textarea");
      addressInput.value = data.address;
      addressInput.placeholder = "Адрес аппарата";
      addressInput.oninput = () => {
        editedData[key].address = addressInput.value;
        showSaveButton();
      };

      const mapInput = document.createElement("input");
      mapInput.value = data.mapLink;
      mapInput.placeholder = "Ссылка на карту";
      mapInput.oninput = () => {
        editedData[key].mapLink = mapInput.value;
        showSaveButton();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.className = "delete-button";
      deleteBtn.onclick = e => {
        e.stopPropagation();
        if (confirm(`Удалить аппарат "${data.name || "Без названия"}"?`)) {
          delete editedData[key];
          renderButtons();
          showSaveButton();
        }
      };

      block.appendChild(deleteBtn);
      block.appendChild(nameInput);
      block.ap
