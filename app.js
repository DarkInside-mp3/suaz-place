const PASSWORD = "920583104217";
let isAdmin = false;
let editedData = [];
let savedData = [];
let searchQuery = "";

const firebaseUrl = "https://suaz-map-7ec10-default-rtdb.firebaseio.com/apparatusData.json";

// 🔁 Загрузка данных из Firebase
async function loadData() {
  try {
    const res = await fetch(firebaseUrl);
    const data = await res.json();

    if (Array.isArray(data)) {
      savedData = data.filter(Boolean); // удалим возможные пустые
    } else {
      savedData = [];
    }

    editedData = JSON.parse(JSON.stringify(savedData));
    renderButtons();
  } catch (e) {
    console.error("Ошибка загрузки данных:", e);
  }
}

// 💾 Сохранение в Firebase
async function saveAllChanges() {
  try {
    const res = await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedData),
    });

    if (!res.ok) throw new Error("Ошибка сохранения");

    savedData = JSON.parse(JSON.stringify(editedData));
    document.getElementById("save-all").style.display = "none";
    alert("Все изменения сохранены!");
    renderButtons();
  } catch (e) {
    alert("Ошибка при сохранении данных");
    console.error(e);
  }
}

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

  const filtered = editedData.filter((item) =>
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  filtered.forEach((data, index) => {
    const block = document.createElement("div");
    block.className = "button-block";

    if (isAdmin) {
      const nameInput = document.createElement("input");
      nameInput.value = data.name;
      nameInput.placeholder = "Название аппарата";
      nameInput.oninput = () => {
        editedData[index].name = nameInput.value;
        showSaveButton();
      };

      const addressInput = document.createElement("textarea");
      addressInput.value = data.address;
      addressInput.placeholder = "Адрес аппарата";
      addressInput.oninput = () => {
        editedData[index].address = addressInput.value;
        showSaveButton();
      };

      const mapInput = document.createElement("input");
      mapInput.value = data.mapLink;
      mapInput.placeholder = "Ссылка на карту";
      mapInput.oninput = () => {
        editedData[index].mapLink = mapInput.value;
        showSaveButton();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.className = "delete-button";
      deleteBtn.onclick = () => {
        if (confirm(`Удалить "${data.name || "Без названия"}"?`)) {
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

function showSaveButton() {
  document.getElementById("save-all").style.display = "block";
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

function clearSearch() {
  searchQuery = "";
  document.getElementById("search-input").value = "";
  renderButtons();
}

document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderButtons();
});

// 🚀 Старт
loadData();
