const PASSWORD = "920583104217";
const FIREBASE_URL = "https://suaz-map-7ec10-default-rtdb.firebaseio.com/apparatusData.json";

let isAdmin = false;
let savedData = [];       // данные с Firebase
let editedData = [];      // копия для редактирования
let searchQuery = "";

// Получение данных из Firebase
async function fetchData() {
  try {
    const response = await fetch(FIREBASE_URL);
    const data = await response.json();
    if (Array.isArray(data)) {
      savedData = data.filter(Boolean); // убираем пустые элементы
    } else if (typeof data === "object" && data !== null) {
      // В случае если вдруг данные в формате объекта
      savedData = Object.values(data).filter(Boolean);
    } else {
      savedData = [];
    }
    editedData = JSON.parse(JSON.stringify(savedData));
    renderButtons();
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
}

// Отправка данных в Firebase
async function uploadData() {
  try {
    await fetch(FIREBASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedData),
    });
    alert("Все изменения сохранены!");
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error);
    alert("Произошла ошибка при сохранении!");
  }
}

// Рендер кнопок
function renderButtons() {
  const container = document.getElementById("buttons-container");
  container.innerHTML = "";

  if (isAdmin) {
    const addButton = document.createElement("button");
    addButton.textContent = "➕ Добавить аппарат";
    addButton.className = "add-button";
    addButton.onclick = () => {
      editedData.push({ name: "", address: "", mapLink: "" });
      renderButtons();
      showSaveButton();
    };
    container.appendChild(addButton);
  }

  editedData.forEach((data, index) => {
    const name = (data.name || "").toLowerCase();
    if (searchQuery && !name.includes(searchQuery.toLowerCase())) return;

    const block = document.createElement("div");
    block.className = "button-block";

    if (isAdmin) {
      const nameInput = document.createElement("input");
      nameInput.value = data.name || "";
      nameInput.placeholder = "Название аппарата";
      nameInput.oninput = () => {
        editedData[index].name = nameInput.value;
        showSaveButton();
      };

      const addressInput = document.createElement("textarea");
      addressInput.value = data.address || "";
      addressInput.placeholder = "Адрес аппарата";
      addressInput.oninput = () => {
        editedData[index].address = addressInput.value;
        showSaveButton();
      };

      const mapInput = document.createElement("input");
      mapInput.value = data.mapLink || "";
      mapInput.placeholder = "Ссылка на карту";
      mapInput.oninput = () => {
        editedData[index].mapLink = mapInput.value;
        showSaveButton();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.className = "delete-button";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        const confirmDelete = confirm(`Удалить автомат "${data.name || 'Без названия'}"?`);
        if (confirmDelete) {
          editedData.splice(index, 1);
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

// Проверка пароля
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

// Показать кнопку сохранения
function showSaveButton() {
  document.getElementById("save-all").style.display = "block";
}

// Сохранить изменения
function saveAllChanges() {
  savedData = JSON.parse(JSON.stringify(editedData));
  uploadData();
  document.getElementById("save-all").style.display = "none";
  renderButtons();
}

// Очистка поиска
function clearSearch() {
  searchQuery = "";
  document.getElementById("search-input").value = "";
  renderButtons();
}

// Поиск
document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderButtons();
});

// Старт
fetchData();
