document.addEventListener("DOMContentLoaded", () => {
  const PASSWORD = "920583104217";
  let isAdmin = false;
  let savedData = {};
  let editedData = {};
  let searchQuery = "";

  // Здесь твой список аппаратов — замени на свой, если нужно
  const initialData = {
    device_1: {
      name: "Аппарат возле школы",
      address: "г. Баку, ул. Ясамальская 12",
      mapLink: "https://maps.google.com"
    },
    device_2: {
      name: "Аппарат в парке",
      address: "ул. Парковая, 25",
      mapLink: ""
    }
  };

  function loadData() {
    savedData = JSON.parse(JSON.stringify(initialData));
    editedData = JSON.parse(JSON.stringify(savedData));
    renderButtons();
  }

  document.getElementById("search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderButtons();
  });

  function saveAllChanges() {
    savedData = JSON.parse(JSON.stringify(editedData));
    alert("Изменения сохранены локально (не в Firebase)!");
    document.getElementById("save-all").style.display = "none";
    renderButtons();
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

    const filteredKeys = keys.filter((key) =>
      editedData[key].name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          if (confirm(`Удалить "${data.name || 'Без названия'}"?`)) {
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
          const link = document.createElement("a");
          link.href = data.mapLink;
          link.target = "_blank";
          link.textContent = "Открыть в карте";
          link.className = "map-link-button";
          block.appendChild(link);
        }
      }

      container.appendChild(block);
    });
  }

  // Глобальные функции для кнопок из HTML
  window.checkPassword = checkPassword;
  window.clearSearch = clearSearch;
  window.saveAllChanges = saveAllChanges;

  loadData();
});
