# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    ````markdown
    # LevelCrafter

    LevelCrafter is a browser-based level editor and playtesting tool that lets you design, save and play custom puzzle levels.

    Features
    - Create custom levels using a simple grid editor
    - Difficulty presets (easy 5x5, medium 8x8, hard 12x12)
    - Save levels to localStorage and export JSON
    - Playtest levels with WASD controls, collision, hazards and collectibles

    Quick Start
    1. Install dependencies:

    ```bash
    npm install
    ```

    2. Start development server:

    ```bash
    npm run dev
    # Open http://localhost:5174
    ```

    3. Build for production:

    ```bash
    npm run build
    ```

    How it works
    - Create Mode: choose difficulty → generate grid → place tiles → Save Level or Export JSON
    - Play Mode: choose difficulty → load saved level → play with WASD

    Storage
    - Levels are stored in `localStorage` using keys like `easy-level`, `medium-level`, `hard-level`.

    More details
    - High level architecture: see `readme/hld.md`
    - Development workflow: see `readme/workflow.md`

    ````
      parserOptions: {
