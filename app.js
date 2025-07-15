import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
const dataRef = ref(db, "/");

const PASSWORD = "920583104217";
let isAdmin = false;
let editedData = {};
let searchQuery = "";

// 🔁 Получаем данные из Firebase
onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
  if (Array.isArray(data)) {
    // Преобразуем массив в объект
    editedData = {};
    data.forEach((entry, index) => {
      if (entry && typeof entry === "object") {
        editedData[`device_${index}`] = entry;
      }
    });
  } else {
    editedData = data || {};
  }

  console.log("Данные для рендера:", editedData);
  renderButtons();
});

// 🎨 Рендер кнопок
function renderButtons() {
  const container = document.getElementById("buttons-container");
  container.innerHTML = "";

  const keys = Object.keys(editedData || {});
  console.log("Ключи для рендера:", keys);

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

  const filteredKeys = keys.filter((key) => {
    const entry = editedData[key];
    if (!entry || !entry.name) return false;
    return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  filteredKeys.forEach((key) => {
    const data = editedData[key];
    if (!data) return;

    const block = document.createElement("div");
    block.className = "button-block";

    if (isAdmin) {
      const nameInput = document.createElement("input");
      nameInput.value = data.name || "";
      nameInput.placeholder = "Название аппарата";
      nameInput.oninput = () => {
        editedData[key].name = nameInput.value;
        showSaveButton();
      };

      const addressInput = document.createElement("textarea");
      addressInput.value = data.address || "";
      addressInput.placeholder = "Адрес аппарата";
      addressInput.oninput = () => {
        editedData[key].address = addressInput.value;
        showSaveButton();
      };

      const mapInput = document.createElement("input");
      mapInput.value = data.mapLink || "";
      mapInput.placeholder = "Ссылка на карту";
      mapInput.oninput = () => {
        editedData[key].mapLink = mapInput.value;
        showSaveButton();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.className = "delete-button";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        const confirmDelete = confirm(`Удалить "${data.name || 'Без названия'}"?`);
        if (confirmDelete) {
          delete editedData[key];
          renderButtons();
          showSaveButton();
        }
      };

      block.appendChild(deleteBtn);
      block.appendChild(nameInput);
      block.appendChild(addressInput);
      block.appendChild(mapInput);
    } else {
      if (!data.name && !data.address) return;

      const title = document.createElement("h3");
      title.textContent = data.name || "Без названия";

      const address = document.createElement("p");
      address.textContent = data.address || "Адрес не указан";

      block.appendChild(title);
      block.appendChild(address);

      if (data.mapLink) {
        const linkButton = document.createElement("a");
        linkButton.href = data.mapLink;
        linkButton.textContent = "Открыть в карте";
        linkButton.target = "_blank";
        linkButton.className = "map-link-button";
        block.appendChild(linkButton);
      }
    }

    container.appendChild(block);
  });
}

function checkPassword() {
  const input = document.getElementById("admin-password");
  if (input.value === PASSWORD) {
    isAdmin = true;
    input.value = "";
    document.getElementById("login-area").style.display = "none";
    renderButtons();
  } else {
    alert("Неверный пароль");
  }
}

function showSaveButton() {
  document.getElementById("save-all").style.display = "block";
}

function saveAllChanges() {
  set(dataRef, editedData)
    .then(() => {
      document.getElementById("save-all").style.display = "none";
      alert("Изменения сохранены!");
    })
    .catch((error) => {
      console.error("Ошибка сохранения:", error);
      alert("Ошибка сохранения: " + error.message);
    });
}

function clearSearch() {
  searchQuery = "";
  document.getElementById("search-input").value = "";
  renderButtons();
}

document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderButtons();
});
