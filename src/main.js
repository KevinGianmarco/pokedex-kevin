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
const modalGender = document.getElementById("modal-gender");

// Referencias botones
const modalTop = document.getElementById("modal-top");
const shinyBtn = document.getElementById("btn-shiny");
const megaBtn = document.getElementById("btn-mega");
const soundBtn = document.getElementById("btn-sound");

// --- ESTADO GLOBAL ---
let allPokemons = []; // Guarda la generación actual
let globalPokemonList = []; // Guarda los nombres de TODOS los Pokémon del mundo

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

// --- LÓGICA DEL NOMBRE DEL EQUIPO ---
const teamNameInput = document.getElementById("team-name");

const savedTeamName = localStorage.getItem("pokeTeamName");
if (savedTeamName) {
  teamNameInput.value = savedTeamName;
}

teamNameInput.addEventListener("input", (e) => {
  localStorage.setItem("pokeTeamName", e.target.value);
});

function updateTeamUI() {
  const container = document.getElementById("team-slots");
  const countSpan = document.getElementById("team-count");
  container.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const member = myTeam[i];
    const slot = document.createElement("div");
    slot.className = "team-slot";

    if (member) {
      slot.innerHTML = `
        <img src="${member.image}" alt="${member.name}">
        <div class="slot-remove" onclick="removeFromTeam(${i})">✕</div>
      `;
      slot.style.borderColor = "#4CAF50";
      slot.onclick = (e) => {
        if (e.target.className !== "slot-remove") openModal(member, "", "#fff");
      };
    } else {
      slot.innerHTML = `<span style="opacity:0.3; font-size:20px;">+</span>`;
    }
    container.appendChild(slot);
  }

  countSpan.textContent = `${myTeam.length}/6`;
  localStorage.setItem("myTeam", JSON.stringify(myTeam));
  renderPokemons(allPokemons);
}

function addToTeam(pokemonId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // Buscamos primero en allPokemons, si no está (porque vino del buscador global), lo buscamos en el grid actual si es posible
  // Nota: Para simplificar, asumimos que si clickeaste el botón, el objeto "poke" existe en el contexto donde se renderizó.
  // Pero como 'addToTeam' solo recibe ID, necesitamos una forma segura de obtener los datos.
  // TRUCO: Si venimos de una búsqueda global, el array 'allPokemons' podría no tenerlo.
  // Vamos a intentar buscarlo en 'allPokemons' (lista actual mostrada en pantalla).

  // CORRECCIÓN: Si estamos filtrando, 'allPokemons' puede no tener el dato si venimos de otra región.
  // Pero 'renderPokemons' usa una lista. Vamos a usar una variable global temporal o confiar en que el usuario
  // no cambia de contexto tan rápido.
  // MEJORA: Buscar en el array que se está mostrando actualmente.
  // Sin embargo, para no complicar, usamos allPokemons. Si falla, es porque la lógica original dependía de ello.
  // (En tu código original, allPokemons se sobrescribía con los resultados de búsqueda, así que ESTÁ BIEN).

  const poke = allPokemons.find((p) => p.id === pokemonId);

  if (!poke) return;

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
    shinyImage: poke.shinyImage, // Guardamos shinyImage también por si acaso
    megas: poke.megas, // Guardamos megas también
    genderRate: poke.genderRate,
    sound: poke.sound,
  };

  myTeam.push(teamMember);
  updateTeamUI();
}

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
        sound: pokemonData.cries ? pokemonData.cries.latest : null, // Protección aquí también
        genderRate: speciesData.gender_rate,
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
  // Truco: Actualizamos allPokemons globalmente para que addToTeam funcione
  // si es que venimos de una búsqueda
  if (list !== allPokemons) {
    // Solo actualizamos la referencia si es una lista filtrada o buscada
    // para que el botón de "Añadir a equipo" encuentre los datos
    allPokemons = list;
  }

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

    const isInTeam = myTeam.some((p) => p.id === poke.id);
    const teamBtnText = isInTeam ? "En equipo " : "Añadir +";
    const disabledAttr = isInTeam ? "disabled" : "";

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

  // --- LÓGICA DE GÉNERO ---
  if (modalGender) {
    let genderHtml = "";
    const rate = poke.genderRate;

    if (rate === -1) {
      genderHtml = `<span class="gender-less-badge">Sin Género</span>`;
    } else {
      const femalePercent = (rate / 8) * 100;
      const malePercent = 100 - femalePercent;
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

  // GRÁFICO (Chart.js)
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

  // --- VARIABLES DE ESTADO LOCAL ---
  let currentMegaIndex = -1;
  let esShiny = false;

  function getCurrentImage() {
    if (currentMegaIndex === -1) {
      return esShiny ? poke.shinyImage || poke.image : poke.image;
    }
    const megaData = poke.megas[currentMegaIndex].data;
    const sprites = megaData.sprites;

    if (esShiny) {
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

  // --- MEGA EVOLUCIÓN ---
  const megaLabel = document.getElementById("mega-label");

  if (megaBtn) {
    if (megaLabel) megaLabel.textContent = "Mega Evolución";
    megaBtn.classList.remove("active");

    if (poke.megas && poke.megas.length > 0) {
      megaBtn.style.display = "flex";
    } else {
      megaBtn.style.display = "none";
    }

    megaBtn.onclick = () => {
      currentMegaIndex++;
      if (currentMegaIndex >= poke.megas.length) currentMegaIndex = -1;

      if (currentMegaIndex === -1) {
        // MODO NORMAL
        modalTypes.innerHTML = typesHtml;
        internalDrawChart(poke.stats);
        if (megaLabel) megaLabel.textContent = "Mega Evolución";
        megaBtn.classList.remove("active");
      } else {
        // MODO MEGA
        const selectedMega = poke.megas[currentMegaIndex];
        internalDrawChart(selectedMega.data.stats);

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

        let btnText = "Mega Evolución";
        if (selectedMega.name.includes("-x")) btnText = "Mega Evolución X";
        if (selectedMega.name.includes("-y")) btnText = "Mega Evolución Y";

        if (megaLabel) megaLabel.textContent = btnText;
        megaBtn.classList.add("active");
      }
      modalImg.src = getCurrentImage();
    };
  }

  // --- SHINY ---
  const shinyLabel = document.getElementById("shiny-label");

  if (shinyLabel) shinyLabel.textContent = "Shiny: OFF";
  shinyBtn.classList.remove("active");

  shinyBtn.onclick = () => {
    esShiny = !esShiny;

    if (shinyLabel) {
      shinyLabel.textContent = esShiny ? "Shiny: ON" : "Shiny: OFF";
    }

    if (esShiny) {
      shinyBtn.classList.add("active");
    } else {
      shinyBtn.classList.remove("active");
    }
    modalImg.src = getCurrentImage();
  };

  // Sonido
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

// --- BUSCADOR GLOBAL (BLINDADO) ---
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase().trim();

  // 1. Si borras el texto, volvemos a la generación actual
  if (query.length === 0) {
    // IMPORTANTE: Debemos volver a cargar la generación seleccionada si allPokemons cambió
    // Pero como no tenemos la data original en memoria, lo más fácil es llamar al fetchGeneration con el valor del selector
    fetchGeneration(selector.value);
    return;
  }

  // 2. Esperar al menos 2 letras
  if (query.length < 2) return;

  grid.innerHTML =
    '<div class="loader" style="color:var(--text-color)"> Buscando en todo el mundo...</div>';

  try {
    // Si la lista global aún no cargó, intentamos cargarla
    if (!globalPokemonList || globalPokemonList.length === 0) {
      await initGlobalSearch();
    }

    const filteredMatches = globalPokemonList.filter(
      (p) => p.name.includes(query) || p.url.split("/")[6] === query,
    );

    const topResults = filteredMatches.slice(0, 10);

    if (topResults.length === 0) {
      grid.innerHTML =
        '<p style="text-align:center; width:100%;">No se encontraron Pokémon.</p>';
      return;
    }

    const resultsData = await Promise.all(
      topResults.map(async (match) => {
        try {
          const urlParts = match.url.split("/");
          const id = urlParts[urlParts.length - 2];

          const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`),
          ]);

          const pokemonData = await pokemonRes.json();
          const speciesData = await speciesRes.json();

          const entry =
            speciesData.flavor_text_entries.find(
              (e) => e.language.name === "es",
            ) ||
            speciesData.flavor_text_entries.find(
              (e) => e.language.name === "en",
            );

          // Protección en Megas: Si falla un fetch de mega, no rompemos todo
          const megaVarieties = speciesData.varieties.filter((v) =>
            v.pokemon.name.includes("-mega"),
          );
          const megasData = await Promise.all(
            megaVarieties.map(async (v) => {
              try {
                const res = await fetch(v.pokemon.url);
                const data = await res.json();
                return { name: v.pokemon.name, data: data };
              } catch (err) {
                return null; // Si falla una mega, la ignoramos
              }
            }),
          );

          return {
            id: parseInt(id),
            name: match.name,
            image:
              pokemonData.sprites.other["official-artwork"].front_default ||
              pokemonData.sprites.front_default,
            shinyImage: pokemonData.sprites.front_shiny,
            types: pokemonData.types.map((t) => t.type.name),
            description: entry
              ? entry.flavor_text.replace(/[\n\f]/g, " ")
              : "...",
            stats: pokemonData.stats,
            // Protección en Sonido: Verificamos si existe 'cries'
            sound: pokemonData.cries ? pokemonData.cries.latest : null,
            genderRate: speciesData.gender_rate,
            megas: megasData.filter((m) => m !== null), // Filtramos megas fallidas
          };
        } catch (innerError) {
          console.warn("Error cargando un resultado individual:", innerError);
          return null; // Si falla un Pokémon entero, lo ignoramos
        }
      }),
    );

    // Filtramos los resultados nulos (los que fallaron)
    const validResults = resultsData.filter((p) => p !== null);

    renderPokemons(validResults);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    grid.innerHTML = `<p style="text-align:center; color:red">Error al buscar: ${error.message}</p>`;
  }
});

selector.addEventListener("change", (e) => fetchGeneration(e.target.value));

// Iniciar app
fetchGeneration(1);
initGlobalSearch(); // Cargar nombres en background

// --- LÓGICA DEL MINIJUEGO ---
const gameOverlay = document.getElementById("game-overlay");
const gameImg = document.getElementById("game-img");
const gameOptions = document.getElementById("game-options");
const gameMessage = document.getElementById("game-message");
const nextRoundBtn = document.getElementById("btn-next-round");
const btnGame = document.getElementById("btn-game");

let correctAnswer = null;

if (btnGame) {
  btnGame.addEventListener("click", () => {
    gameOverlay.style.display = "flex";
    initGame();
  });
}

window.closeGame = function () {
  gameOverlay.style.display = "none";
};

window.initGame = function () {
  gameMessage.textContent = "";
  nextRoundBtn.style.display = "none";
  gameImg.classList.add("silhouette");
  gameOptions.innerHTML = "";

  // Si estamos en búsqueda global, allPokemons tiene solo 10 resultados.
  // Para el juego, idealmente necesitamos más variedad.
  // Pero usaremos lo que haya en pantalla para no complicar.
  if (allPokemons.length < 4) {
    gameMessage.textContent =
      "Necesitas cargar más Pokémon (o una región completa) para jugar.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * allPokemons.length);
  correctAnswer = allPokemons[randomIndex];
  gameImg.src = correctAnswer.image;

  let options = [correctAnswer];

  while (options.length < 4) {
    const randomWrong =
      allPokemons[Math.floor(Math.random() * allPokemons.length)];
    if (!options.some((p) => p.id === randomWrong.id)) {
      options.push(randomWrong);
    }
  }

  options.sort(() => Math.random() - 0.5);

  options.forEach((poke) => {
    const btn = document.createElement("button");
    btn.textContent = poke.name;
    btn.className = "game-btn";
    btn.onclick = () => checkAnswer(poke, btn);
    gameOptions.appendChild(btn);
  });
};

function checkAnswer(selected, btnElement) {
  gameImg.classList.remove("silhouette");
  const allBtns = document.querySelectorAll(".game-btn");
  allBtns.forEach((b) => (b.disabled = true));

  if (selected.id === correctAnswer.id) {
    btnElement.classList.add("correct");
    gameMessage.textContent = "¡Correcto!";
    gameMessage.style.color = "#4CAF50";
    if (correctAnswer.sound) new Audio(correctAnswer.sound).play();
  } else {
    btnElement.classList.add("wrong");
    gameMessage.textContent = `¡Fallaste! Era ${correctAnswer.name}`;
    gameMessage.style.color = "#ff5252";
    allBtns.forEach((b) => {
      if (b.textContent === correctAnswer.name) b.classList.add("correct");
    });
  }
  nextRoundBtn.style.display = "inline-block";
}

// --- CARGA INICIAL DE NOMBRES ---
async function initGlobalSearch() {
  try {
    const res = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0",
    );
    const data = await res.json();
    globalPokemonList = data.results;
    console.log("Buscador global listo:", globalPokemonList.length, "Pokémon.");
  } catch (error) {
    console.error("Error cargando lista global:", error);
  }
}
