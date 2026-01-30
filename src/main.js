import "./style.css";

const grid = document.getElementById("pokemon-grid");
const selector = document.getElementById("gen-selector");
const searchInput = document.getElementById("search-input");

const modalOverlay = document.getElementById("modal-overlay");
const modalName = document.getElementById("modal-name");
const modalId = document.getElementById("modal-id");
const modalImg = document.getElementById("modal-img");
const modalDesc = document.getElementById("modal-desc");
const modalTypes = document.getElementById("modal-types");
const modalStats = document.getElementById("modal-stats");

const modalTop = document.getElementById("modal-top");
const shinyBtn = document.getElementById("btn-shiny");
const megaBtn = document.getElementById("btn-mega");
const soundBtn = document.getElementById("btn-sound");

let allPokemons = [];

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
        sound: pokemonData.cries.latest,
        megas: megasData,
      };
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => a.id - b.id);
    allPokemons = results;
    renderPokemons(allPokemons);
  } catch (error) {
    console.error("Error:", error);
    grid.innerHTML = "<p>Error cargando datos.</p>";
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

    card.innerHTML = `
      <button class="favorite-btn ${isFav ? "active" : ""}" onclick="toggleFavorite(${poke.id}, this, event)">${isFav ? "❤️" : "🤍"}</button>
      <span style="opacity: 0.6; font-weight:bold;">#${poke.id}</span>
      <img src="${poke.image}" alt="${poke.name}" loading="lazy">
      <h3>${poke.name}</h3>
      <div class="types">${typesHtml}</div>
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

  let currentMegaIndex = -1;
  let esShiny = false;

  function getCurrentImage() {
    if (currentMegaIndex === -1) {
      if (esShiny) return poke.shinyImage || poke.image;
      return poke.image;
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
        modalTypes.innerHTML = typesHtml;
        internalDrawChart(poke.stats);

        megaBtn.textContent = "🧬 Mega Evolución";
        megaBtn.classList.remove("active");
      } else {
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

        // Texto Botón
        let btnText = "Mega";
        if (selectedMega.name.includes("-x")) btnText = "Mega X 🔵";
        if (selectedMega.name.includes("-y")) btnText = "Mega Y 🔴";
        megaBtn.textContent = `🧬 ${btnText}`;
        megaBtn.classList.add("active");
      }

      modalImg.src = getCurrentImage();
    };
  }

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
