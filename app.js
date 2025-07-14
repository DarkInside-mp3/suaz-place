const PASSWORD = "920583104217";
let isAdmin = false;
let savedData = {};
let editedData = {};
let searchQuery = "";

const BIN_ID = "6874d0705a9d63639737dc42";
const MASTER_KEY = "$2a$10$Op35jLJdn0V2TX13uR2A.eCiXuW69Hj/W8VYRGB4TRX2X9MuFXts2";

// Загрузка с JSONBin
async function loadData() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY
      }
    });
    const json = await res.json();
    const arrayData = json.record;

    if (!Array.isArray(arrayData)) {
      console.error("Ошибка: ожидается массив, а пришло:", arrayData);
      return;
    }

    savedData = {};
    arrayData.forEach((item, index) => {
      const id = `device_${index}`;
      savedData[id] = {
        name: item.name,
        address: item.address,
        mapLink: item.mapLink
      };
    });

    editedData = JSON.parse(JSON.stringify(savedData));
    renderButtons();
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
}

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

  const filteredKeys = keys.filter((key) => {
    const name = editedData[key].name.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  filteredKeys.forEach((key) => {
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
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        const confirmDelete = confirm(`Вы точно хотите удалить "${data.name || 'Без названия'}"?`);
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
  savedData = JSON.parse(JSON.stringify(editedData));
  localStorage.setItem("apparatusData", JSON.stringify(savedData));
  document.getElementById("save-all").style.display = "none";
  alert("Все изменения сохранены (локально)!");
  renderButtons();
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

// Загружаем с JSONBin при запуске
loadData();
