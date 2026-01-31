import "./style.css";

const grid = document.getElementById("pokemon-grid");
const selector = document.getElementById("gen-selector");
const searchInput = document.getElementById("search-input");

// --- Variables del Modal ---
const modalOverlay = document.getElementById("modal-overlay");
const modalName = document.getElementById("modal-name");
const modalId = document.getElementById("modal-id");
const modalImg = document.getElementById("modal-img");
const modalDesc = document.getElementById("modal-desc");
const modalTypes = document.getElementById("modal-types");
const modalStats = document.getElementById("modal-stats");
const modalGender = document.getElementById("modal-gender"); // ✅ REFERENCIA NUEVA

// Referencias botones
const modalTop = document.getElementById("modal-top");
const shinyBtn = document.getElementById("btn-shiny");
const megaBtn = document.getElementById("btn-mega");
const soundBtn = document.getElementById("btn-sound");

// ESTADO GLOBAL
let allPokemons = [];

// --- DICCIONARIOS ---
const typeColors = {
  fire: "#FDDFDF",
  grass: "#DEFDE0",
  electric: "#FCF7DE",
  water: "#DEF3FD",
  ground: "#f4e7da",
  rock: "#d5d5d4",
  fairy: "#fceaff",
  poison: "#98d7a5",
  bug: "#f8d5a3",
  dragon: "#97b3e6",
  psychic: "#eaeda1",
  flying: "#F5F5F5",
  fighting: "#E6E0D4",
  normal: "#F5F5F5",
  ice: "#def3fd",
  ghost: "#705898",
  steel: "#b7b7ce",
  dark: "#705848",
};

const badgeColors = {
  fire: "#EE8130",
  grass: "#7AC74C",
  electric: "#F7D02C",
  water: "#6390F0",
  ground: "#E2BF65",
  rock: "#B6A136",
  fairy: "#D685AD",
  poison: "#A33EA1",
  bug: "#A6B91A",
  dragon: "#6F35FC",
  psychic: "#F95587",
  flying: "#A98FF3",
  fighting: "#C22E28",
  normal: "#A8A77A",
  ice: "#96D9D6",
  ghost: "#735797",
  steel: "#B7B7CE",
  dark: "#705746",
};

const typeTranslations = {
  fire: "Fuego",
  grass: "Planta",
  electric: "Eléctrico",
  water: "Agua",
  ground: "Tierra",
  rock: "Roca",
  fairy: "Hada",
  poison: "Veneno",
  bug: "Bicho",
  dragon: "Dragón",
  psychic: "Psíquico",
  flying: "Volador",
  fighting: "Lucha",
  normal: "Normal",
  ice: "Hielo",
  ghost: "Fantasma",
  steel: "Acero",
  dark: "Siniestro",
};

const statNames = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Atq. Esp",
  "special-defense": "Def. Esp",
  speed: "Velocidad",
};

// --- FAVORITOS ---
function getFavorites() {
  const favorites = localStorage.getItem("pokeFavorites");
  return favorites ? JSON.parse(favorites) : [];
}

function toggleFavorite(id, btnElement, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  let favorites = getFavorites();
  const index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
    btnElement.classList.add("active");
    btnElement.textContent = "❤️";
  } else {
    favorites.splice(index, 1);
    btnElement.classList.remove("active");
    btnElement.textContent = "🤍";
  }
  localStorage.setItem("pokeFavorites", JSON.stringify(favorites));
}
window.toggleFavorite = toggleFavorite;

// --- LÓGICA DE EQUIPO (TEAM BUILDER) ---
let myTeam = JSON.parse(localStorage.getItem("myTeam")) || [];

// ... (Debajo de let myTeam = ...)

// --- LÓGICA DEL NOMBRE DEL EQUIPO ---
const teamNameInput = document.getElementById("team-name");

// 1. Cargar nombre guardado (o usar "Mi Equipo" por defecto)
const savedTeamName = localStorage.getItem("pokeTeamName");
if (savedTeamName) {
  teamNameInput.value = savedTeamName;
}

// 2. Guardar automáticamente cuando el usuario escribe
teamNameInput.addEventListener("input", (e) => {
  localStorage.setItem("pokeTeamName", e.target.value);
});

function updateTeamUI() {
  const container = document.getElementById("team-slots");
  const countSpan = document.getElementById("team-count");
  container.innerHTML = "";

  // Dibujamos siempre 6 huecos (llenos o vacíos)
  for (let i = 0; i < 6; i++) {
    const member = myTeam[i];
    const slot = document.createElement("div");
    slot.className = "team-slot";

    if (member) {
      // Slot Lleno
      slot.innerHTML = `
        <img src="${member.image}" alt="${member.name}">
        <div class="slot-remove" onclick="removeFromTeam(${i})">✕</div>
      `;
      slot.style.borderColor = "#4CAF50"; // Verde si está lleno
      slot.onclick = (e) => {
        // Evitar que se active al dar click en la X
        if (e.target.className !== "slot-remove") openModal(member, "", "#fff");
      };
    } else {
      // Slot Vacío
      slot.innerHTML = `<span style="opacity:0.3; font-size:20px;">+</span>`;
    }
    container.appendChild(slot);
  }

  countSpan.textContent = `${myTeam.length}/6`;
  localStorage.setItem("myTeam", JSON.stringify(myTeam));

  // Actualizamos los botones de la grilla para que se bloqueen si ya está añadido
  renderPokemons(allPokemons);
}

// --- LÓGICA DE EQUIPO ---

// ... (tu variable myTeam y updateTeamUI siguen igual) ...

function addToTeam(pokemonId, event) {
  // <--- Cambio 1: Recibe ID
  if (event) {
    event.stopPropagation();
    event.preventDefault(); // Evita que la página salte
  }

  // Buscamos el Pokémon en la lista completa usando el ID
  const poke = allPokemons.find((p) => p.id === pokemonId);

  if (!poke) return; // Seguridad por si no lo encuentra

  if (myTeam.length >= 6) {
    alert("¡Tu equipo está lleno! (Máx 6)");
    return;
  }

  if (myTeam.some((p) => p.id === poke.id)) {
    alert("Este Pokémon ya está en tu equipo.");
    return;
  }

  const teamMember = {
    id: poke.id,
    name: poke.name,
    image: poke.image,
    stats: poke.stats,
    types: poke.types,
    description: poke.description,
  };

  myTeam.push(teamMember);
  updateTeamUI();
}

// ✅ IMPORTANTE: HACERLAS PÚBLICAS PARA EL HTML
window.addToTeam = addToTeam;
window.removeFromTeam = function (index) {
  myTeam.splice(index, 1);
  updateTeamUI();
};
window.clearTeam = function () {
  if (confirm("¿Borrar todo el equipo?")) {
    myTeam = [];
    updateTeamUI();
  }
};

// Inicializamos la barra al cargar
updateTeamUI();

// --- LÓGICA PRINCIPAL ---
async function fetchGeneration(genId) {
  grid.innerHTML = '<div class="loader">Cargando...</div>';
  searchInput.value = "";

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/generation/${genId}/`,
    );
    const data = await response.json();

    const promises = data.pokemon_species.map(async (specie) => {
      const urlParts = specie.url.split("/");
      const id = urlParts[urlParts.length - 2];

      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`),
      ]);

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();

      const entry =
        speciesData.flavor_text_entries.find((e) => e.language.name === "es") ||
        speciesData.flavor_text_entries.find((e) => e.language.name === "en");

      // --- MEGA EVOLUCIONES (Filtro Estricto) ---
      const megaVarieties = speciesData.varieties.filter((v) =>
        v.pokemon.name.includes("-mega"),
      );

      const megasData = await Promise.all(
        megaVarieties.map(async (v) => {
          const res = await fetch(v.pokemon.url);
          const data = await res.json();
          return { name: v.pokemon.name, data: data };
        }),
      );

      return {
        id: parseInt(id),
        name: specie.name,
        image: pokemonData.sprites.front_default,
        shinyImage: pokemonData.sprites.front_shiny,
        types: pokemonData.types.map((t) => t.type.name),
        description: entry
          ? entry.flavor_text.replace(/[\n\f]/g, " ")
          : "Sin descripción.",
        stats: pokemonData.stats,
        sound: pokemonData.cries.latest,
        genderRate: speciesData.gender_rate, // ✅ DATO DE GÉNERO CORRECTO
        megas: megasData,
      };
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => a.id - b.id);
    allPokemons = results;
    renderPokemons(allPokemons);
  } catch (error) {
    console.error("Error cargando:", error);
    grid.innerHTML = "<p>Error cargando datos. Revisa la consola (F12).</p>";
  }
}

function renderPokemons(list) {
  grid.innerHTML = "";
  const favorites = getFavorites();

  list.forEach((poke, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${index * 0.05}s`;

    const mainType = poke.types[0];
    const bgColor = typeColors[mainType] || "#f4f4f4";
    card.style.backgroundColor = bgColor;

    const isFav = favorites.includes(poke.id);
    const typesHtml = poke.types
      .map((type) => {
        const iconUrl = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`;
        return `<span class="type-badge" style="background-color: ${badgeColors[type]}">
        <img src="${iconUrl}" style="width: 14px; filter: brightness(0) invert(1);" /> ${typeTranslations[type] || type}
      </span>`;
      })
      .join("");

    // ... dentro del bucle de renderPokemons ...

    // Verificamos si ya está en el equipo para deshabilitar el botón
    const isInTeam = myTeam.some((p) => p.id === poke.id);
    const teamBtnText = isInTeam ? "En equipo ✅" : "Añadir +";
    const disabledAttr = isInTeam ? "disabled" : "";
    // ... dentro de renderPokemons ...

    // CAMBIAR ESTA PARTE:
    // Antes era: onclick="addToTeam(allPokemons.find(...))"
    // AHORA ES MÁS SIMPLE:

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
          <button class="favorite-btn ${isFav ? "active" : ""}" onclick="toggleFavorite(${poke.id}, this, event)">${isFav ? "❤️" : "🤍"}</button>
          <span style="opacity: 0.6; font-weight:bold;">#${poke.id}</span>
      </div>
      
      <img src="${poke.image}" alt="${poke.name}" loading="lazy">
      <h3>${poke.name}</h3>
      <div class="types">${typesHtml}</div>
      
      <button class="add-team-btn" ${disabledAttr} onclick="addToTeam(${poke.id}, event)">
        ${teamBtnText}
      </button>
    `;

    // ... resto del código ...

    // ... resto del código ...
    card.addEventListener("click", () => openModal(poke, typesHtml, bgColor));
    grid.appendChild(card);
  });
}

// --- MODAL ---
function openModal(poke, typesHtml, bgColor) {
  modalName.textContent = poke.name;
  modalId.textContent = `#${poke.id}`;
  modalImg.src = poke.image;
  modalDesc.textContent = poke.description;
  modalTypes.innerHTML = typesHtml;

  if (modalTop) {
    modalTop.style.background = `linear-gradient(to bottom right, ${bgColor}, #ffffff)`;
  }

  // --- LÓGICA DE GÉNERO (VISUAL) ---
  if (modalGender) {
    let genderHtml = "";
    const rate = poke.genderRate;

    if (rate === -1) {
      // Caso: Sin Género (Magnemite)
      genderHtml = `<span class="gender-less-badge">Sin Género</span>`;
    } else {
      // Calculamos porcentajes
      const femalePercent = (rate / 8) * 100;
      const malePercent = 100 - femalePercent;

      // Renderizamos: Texto arriba + Barra abajo
      genderHtml = `
          <div class="gender-text">
            <span class="male-text">♂ ${malePercent}%</span>
            <span class="female-text">♀ ${femalePercent}%</span>
          </div>
          <div class="gender-bar">
            <div class="bar-male" style="width: ${malePercent}%"></div>
            <div class="bar-female" style="width: ${femalePercent}%"></div>
          </div>
        `;
    }
    modalGender.innerHTML = genderHtml;
  }
  // GRÁFICO
  if (typeof Chart !== "undefined") {
    let chartInstance = null;
    function drawChart(statsData) {
      const ctx = document.getElementById("statsChart").getContext("2d");
      const existingChart = Chart.getChart("statsChart");
      if (existingChart) existingChart.destroy();

      chartInstance = new Chart(ctx, {
        type: "radar",
        data: {
          labels: statsData.map((s) => statNames[s.stat.name]),
          datasets: [
            {
              label: "Stats",
              data: statsData.map((s) => s.base_stat),
              backgroundColor: `${bgColor}80`,
              borderColor: bgColor,
              pointBackgroundColor: "white",
            },
          ],
        },
        options: {
          layout: { padding: 10 },
          scales: {
            r: {
              pointLabels: {
                font: { size: 10, family: "'Poppins', sans-serif" },
                color: "#666",
              },
              suggestedMin: 0,
              suggestedMax: 160,
              ticks: { display: false, stepSize: 40 },
            },
          },
          plugins: { legend: { display: false } },
          maintainAspectRatio: false,
        },
      });
    }
    modalStats.innerHTML = '<canvas id="statsChart"></canvas>';
    drawChart(poke.stats);
    var internalDrawChart = drawChart;
  } else {
    modalStats.innerHTML = "<p>Gráfico no disponible</p>";
    var internalDrawChart = () => {};
  }

  // --- LÓGICA MEGA EVOLUCIÓN ---
  let currentMegaIndex = -1; // -1 = Normal
  let esShiny = false;

  function getCurrentImage() {
    if (currentMegaIndex === -1) {
      if (esShiny) return poke.shinyImage || poke.image;
      return poke.image;
    }
    const megaData = poke.megas[currentMegaIndex].data;
    const sprites = megaData.sprites;

    if (esShiny) {
      // Fallback inteligente para Mega Shiny
      return (
        sprites.other?.home?.front_shiny ||
        sprites.front_shiny ||
        sprites.other?.["official-artwork"]?.front_default ||
        sprites.front_default
      );
    } else {
      return (
        sprites.other?.["official-artwork"]?.front_default ||
        sprites.front_default ||
        poke.image
      );
    }
  }

  if (megaBtn) {
    if (poke.megas && poke.megas.length > 0) {
      megaBtn.style.display = "block";
      megaBtn.textContent = "🧬 Mega Evolución";
      megaBtn.classList.remove("active");
    } else {
      megaBtn.style.display = "none";
    }

    megaBtn.onclick = () => {
      currentMegaIndex++;
      if (currentMegaIndex >= poke.megas.length) currentMegaIndex = -1;

      if (currentMegaIndex === -1) {
        // NORMAL
        modalTypes.innerHTML = typesHtml;
        internalDrawChart(poke.stats);
        megaBtn.textContent = "🧬 Mega Evolución";
        megaBtn.classList.remove("active");
      } else {
        // MEGA
        const selectedMega = poke.megas[currentMegaIndex];
        internalDrawChart(selectedMega.data.stats);

        // Tipos Mega
        const megaTypesHtml = selectedMega.data.types
          .map((t) => {
            const type = t.type.name;
            const iconUrl = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`;
            return `<span class="type-badge" style="background-color: ${badgeColors[type]}">
                    <img src="${iconUrl}" style="width: 14px; filter: brightness(0) invert(1);" /> ${typeTranslations[type] || type}
                </span>`;
          })
          .join("");
        modalTypes.innerHTML = megaTypesHtml;

        let btnText = "Mega";
        if (selectedMega.name.includes("-x")) btnText = "Mega X 🔵";
        if (selectedMega.name.includes("-y")) btnText = "Mega Y 🔴";
        megaBtn.textContent = `🧬 ${btnText}`;
        megaBtn.classList.add("active");
      }
      modalImg.src = getCurrentImage();
    };
  }

  // --- LÓGICA SHINY ---
  shinyBtn.textContent = "✨ Shiny: OFF";
  shinyBtn.classList.remove("active");

  shinyBtn.onclick = () => {
    esShiny = !esShiny;
    if (esShiny) {
      shinyBtn.textContent = "🌟 Shiny: ON";
      shinyBtn.classList.add("active");
    } else {
      shinyBtn.textContent = "✨ Shiny: OFF";
      shinyBtn.classList.remove("active");
    }
    modalImg.src = getCurrentImage();
  };

  soundBtn.onclick = () => {
    if (poke.sound) {
      new Audio(poke.sound).play();
    }
  };

  modalOverlay.style.display = "flex";
}

window.closeModal = function () {
  modalOverlay.style.display = "none";
};

// --- EVENTOS ---
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allPokemons.filter(
    (poke) =>
      poke.name.toLowerCase().includes(query) || poke.id.toString() === query,
  );
  renderPokemons(filtered);
});
selector.addEventListener("change", (e) => fetchGeneration(e.target.value));

fetchGeneration(1);

// Dark Mode
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.textContent = document.body.classList.contains("dark-mode")
      ? "☀️"
      : "🌙";
  });
}

// --- LÓGICA DEL MINIJUEGO ---
const gameOverlay = document.getElementById("game-overlay");
const gameImg = document.getElementById("game-img");
const gameOptions = document.getElementById("game-options");
const gameMessage = document.getElementById("game-message");
const nextRoundBtn = document.getElementById("btn-next-round");
const btnGame = document.getElementById("btn-game");

let correctAnswer = null;

// Abrir juego
if (btnGame) {
  btnGame.addEventListener("click", () => {
    gameOverlay.style.display = "flex";
    initGame();
  });
}

window.closeGame = function () {
  gameOverlay.style.display = "none";
};

// Iniciar Ronda
window.initGame = function () {
  // Limpiamos estado anterior
  gameMessage.textContent = "";
  nextRoundBtn.style.display = "none";
  gameImg.classList.add("silhouette"); // Ponemos la silueta negra
  gameOptions.innerHTML = "";

  // 1. Elegir Pokémon Correcto (Random)
  const randomIndex = Math.floor(Math.random() * allPokemons.length);
  correctAnswer = allPokemons[randomIndex];

  // Asignar imagen
  gameImg.src = correctAnswer.image;

  // 2. Elegir 3 Incorrectos (Distintos al correcto)
  let options = [correctAnswer];

  while (options.length < 4) {
    const randomWrong =
      allPokemons[Math.floor(Math.random() * allPokemons.length)];
    // Evitar repetidos
    if (!options.some((p) => p.id === randomWrong.id)) {
      options.push(randomWrong);
    }
  }

  // 3. Barajar opciones (Shuffle)
  options.sort(() => Math.random() - 0.5);

  // 4. Crear botones
  options.forEach((poke) => {
    const btn = document.createElement("button");
    btn.textContent = poke.name;
    btn.className = "game-btn";
    btn.onclick = () => checkAnswer(poke, btn);
    gameOptions.appendChild(btn);
  });
};

function checkAnswer(selected, btnElement) {
  // Revelar imagen
  gameImg.classList.remove("silhouette");

  // Bloquear todos los botones
  const allBtns = document.querySelectorAll(".game-btn");
  allBtns.forEach((b) => (b.disabled = true));

  if (selected.id === correctAnswer.id) {
    // ACIERTO
    btnElement.classList.add("correct");
    gameMessage.textContent = "¡Correcto! 🎉";
    gameMessage.style.color = "#4CAF50";

    // Reproducir sonido si existe
    if (correctAnswer.sound) new Audio(correctAnswer.sound).play();
  } else {
    // ERROR
    btnElement.classList.add("wrong");
    gameMessage.textContent = `¡Oh no! Era ${correctAnswer.name}`;
    gameMessage.style.color = "#ff5252";

    // Resaltar la correcta para que sepa cuál era
    allBtns.forEach((b) => {
      if (b.textContent === correctAnswer.name) b.classList.add("correct");
    });
  }

  nextRoundBtn.style.display = "inline-block";
}
// --- BOTÓN ALEATORIO (SORPRÉNDEME) ---
const btnRandom = document.getElementById("btn-random");

if (btnRandom) {
  btnRandom.addEventListener("click", async () => {
    // 1. Efecto visual de carga en el botón
    btnRandom.textContent = "⏳";
    btnRandom.disabled = true;

    try {
      // 2. Generar ID random (1 al 1025)
      const randomId = Math.floor(Math.random() * 1025) + 1;

      // 3. Fetch de los datos de ese Pokémon específico (reutilizamos lógica)
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}/`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}/`),
      ]);

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();
      const entry =
        speciesData.flavor_text_entries.find((e) => e.language.name === "es") ||
        speciesData.flavor_text_entries.find((e) => e.language.name === "en");

      // 4. Preparamos el objeto para el modal
      const randomPoke = {
        id: randomId,
        name: pokemonData.name,
        image: pokemonData.sprites.other["official-artwork"].front_default,
        // shinyImage y megas los omitimos para hacerlo rápido, usará defaults
        types: pokemonData.types.map((t) => t.type.name),
        description: entry ? entry.flavor_text.replace(/[\n\f]/g, " ") : "...",
        stats: pokemonData.stats,
        sound: pokemonData.cries.latest,
        genderRate: speciesData.gender_rate,
      };

      // 5. Generamos el HTML de tipos para el modal
      const typesHtml = randomPoke.types
        .map((type) => {
          const iconUrl = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`;
          return `<span class="type-badge" style="background-color: ${badgeColors[type]}">
          <img src="${iconUrl}" style="width: 14px; filter: brightness(0) invert(1);" /> ${typeTranslations[type] || type}
        </span>`;
        })
        .join("");

      // 6. Obtener color de fondo (usamos el primer tipo)
      const bgColor = typeColors[randomPoke.types[0]] || "#f4f4f4";

      // 7. ¡Abrir el modal!
      openModal(randomPoke, typesHtml, bgColor);
    } catch (error) {
      console.error("Error al buscar random:", error);
      alert("Error al buscar un Pokémon aleatorio. Intenta de nuevo.");
    } finally {
      // Restaurar el botón
      btnRandom.textContent = "🎲";
      btnRandom.disabled = false;
    }
  });
}
