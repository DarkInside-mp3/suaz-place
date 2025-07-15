const PASSWORD = "920583104217";
let isAdmin = false;
let savedData = [];
let editedData = [];
let searchQuery = "";

const firebaseUrl = "https://suaz-map-7ec10-default-rtdb.firebaseio.com/apparatusData.json";

async function loadData() {
  try {
    const res = await fetch(firebaseUrl);
    const data = await res.json();
    savedData = Array.isArray(data) ? data.filter(Boolean) : [];
    editedData = JSON.parse(JSON.stringify(savedData));
    renderButtons();
  } catch (e) {
    console.error("Ошибка загрузки данных:", e);
  }
}

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
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Добавить аппарат";
    addBtn.className = "add-button";
    addBtn.onclick = () => {
      editedData.push({ name: "", address: "", mapLink: "" });
      renderButtons();
      showSaveButton();
    };
    container.appendChild(addBtn);
  }

  const filtered = editedData.filter(item =>
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  filtered.forEach((data, idx) => {
    const block = document.createElement("div");
    block.className = "button-block";

    if (isAdmin) {
      const nameInput = document.createElement("input");
      nameInput.placeholder = "Название аппарата";
      nameInput.value = data.name;
      nameInput.oninput = () => { editedData[idx].name = nameInput.value; showSaveButton(); };
      
      const addrInput = document.createElement("textarea");
      addrInput.placeholder = "Адрес аппарата";
      addrInput.value = data.address;
      addrInput.oninput = () => { editedData[idx].address = addrInput.value; showSaveButton(); };
      
      const mapInput = document.createElement("input");
      mapInput.placeholder = "Ссылка на карту";
      mapInput.value = data.mapLink;
      mapInput.oninput = () => { editedData[idx].mapLink = mapInput.value; showSaveButton(); };

      const delBtn = document.createElement("button");
      delBtn.className = "delete-button";
      delBtn.textContent = "🗑";
      delBtn.onclick = () => {
        if (confirm(`Удалить "${data.name || "Без названия"}"?`)) {
          editedData.splice(idx, 1);
          renderButtons();
          showSaveButton();
        }
      };

      block.append(delBtn, nameInput, addrInput, mapInput);
    } else {
      if (!data.name && !data.address) return;

      const title = document.createElement("h3");
      title.textContent = data.name || "Без названия";
      const addr = document.createElement("p");
      addr.textContent = data.address || "Адрес не указан";

      block.append(title, addr);

      if (data.mapLink) {
        const linkBtn = document.createElement("a");
        linkBtn.href = data.mapLink;
        linkBtn.target = "_blank";
        linkBtn.className = "map-link-button";
        linkBtn.textContent = "Открыть в карте";
        block.appendChild(linkBtn);
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
  } else alert("Неверный пароль");
}

function clearSearch() {
  searchQuery = "";
  document.getElementById("search-input").value = "";
  renderButtons();
}

document.getElementById("search-input").addEventListener("input", e => {
  searchQuery = e.target.value;
  renderButtons();
});

loadData();
