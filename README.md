# 🔴 Pokédex Kevin

![Pokédex Banner](public/img/poke-ball.png) Una aplicación web moderna e interactiva para explorar el mundo Pokémon. Este proyecto consume la **PokéAPI** para mostrar información detallada de más de 1000 Pokémon, permitiendo filtrar por generaciones, buscar globalmente y gestionar tu propio equipo.

🔗 **[Ver Demo en Vercel](https://pokedex-kevin.vercel.app)**

## ✨ Características Principales

- **🔍 Buscador Global Inteligente:** Encuentra cualquier Pokémon (de la Gen 1 a la 9) al instante, incluso si no estás en su región.
- **⚔️ Constructor de Equipos (Team Builder):** Arma tu equipo de ensueño ("Los Juanes"). Los datos persisten aunque cierres el navegador (LocalStorage).
- **🎮 Minijuego "¿Quién es ese Pokémon?":** Pon a prueba tus conocimientos con el clásico juego de adivinanzas (con siluetas y sonidos).
- **📊 Estadísticas en Tiempo Real:** Gráficos de radar interactivos (Chart.js) para visualizar HP, Ataque, Defensa, etc.
- **🧬 Transformaciones:** Visualiza las formas **Shiny** y **Mega Evoluciones** con un solo clic.
- **🎵 Experiencia Inmersiva:** Reproduce los "gritos" (cries) oficiales de cada Pokémon.
- **📱 Diseño Responsive:** Totalmente funcional en escritorio y móviles.

## 🛠️ Tecnologías Usadas

- **Core:** HTML5, CSS3, JavaScript (ES6+).
- **Build Tool:** [Vite](https://vitejs.dev/) (para un entorno de desarrollo ultrarrápido).
- **API:** [PokéAPI](https://pokeapi.co/) (RESTful API).
- **Librerías:** [Chart.js](https://www.chartjs.org/) (para los gráficos de estadísticas).
- **Despliegue:** Vercel.

## 🚀 Instalación y Uso Local

Si deseas correr este proyecto en tu máquina local:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/KevinGianmarco/pokedex-kevin.git](https://github.com/KevinGianmarco/pokedex-kevin.git)
    ```
2.  **Entra a la carpeta:**
    ```bash
    cd pokedex-kevin
    ```
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
5.  Abre tu navegador en `http://localhost:5173`.

## 📂 Estructura del Proyecto

- `/src`: Contiene la lógica principal (`main.js`) y estilos (`style.css`).
- `/public`: Recursos estáticos (imágenes, iconos).
- `index.html`: Punto de entrada de la aplicación.

## 👤 Autor

**Kevin** - _Ingeniero de Sistemas_

- Ubicación: Chiclayo, Perú 🇵🇪
- GitHub: [@KevinGianmarco](https://github.com/KevinGianmarco)

---

Hecho con ❤️ y mucho código.
