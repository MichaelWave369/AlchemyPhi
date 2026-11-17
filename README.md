# AlchemyPhi

**Seven operations. One living cycle.** A free, static, offline-friendly-by-design workbench for thinking through ideas with a seven-stage alchemical metaphor.

[Open the GitHub Pages site](https://michaelwave369.github.io/AlchemyPhi/) (after Pages is enabled)

## What it does

- Explore **Calcination, Dissolution, Separation, Conjunction, Fermentation, Distillation, and Coagulation**.
- Compare three lenses: **Systems & design**, **Personal reflection**, and **Historical symbolism**.
- Define a project, write a goal, and journal through seven stages.
- Complete each operation, see progress, revisit prior stages, and iterate through successive cycles.
- Keep all notes in **browser localStorage**, with **JSON import/export** and **Markdown export**.
- Inspect previous completed cycles locally; load a pre-filled example to learn the interface.
- Use a responsive, keyboard-friendly interface with no frontend framework or runtime dependencies.

## Run locally

Serve the repository root with a static server:

```bash
python -m http.server 8080
```

Open <http://localhost:8080>. ES modules won't load reliably from a `file://` URL.

To run the domain tests (Node.js 22+):

```bash
npm test
```

## Deploy to GitHub Pages

A GitHub Actions workflow in `.github/workflows/pages.yml` tests each pull request and deploys `main` on push.

1. In GitHub, open **Settings → Pages**.
2. Set **Build and deployment → Source → GitHub Actions**.
3. Merge changes to `main`; the workflow will deploy the static site.

Expected Pages URL: <https://michaelwave369.github.io/AlchemyPhi/>.

## Privacy and limits

Data stays in the local browser unless you export a file yourself. There is no account, database, analytics, or AI request. Local storage can be cleared by the browser: **export backups**. The Google Fonts stylesheet is optional presentation-only, and does make a network request when online; the site uses local fallback fonts if it can't load.

The seven operations are **one familiar historical interpretation**, not the only sequence found in alchemical traditions. The modern personal and systems lenses are creative prompts, not scientifically validated transformation laws, psychological diagnoses, or laboratory methods. No operational chemical experiments are provided.

## Structure

- `index.html`: page markup
- `styles.css`: visual system and responsive layout
- `src/data.js`: seven stages and three interpretation lenses
- `src/engine.js`: state validation, completion, archives, exports
- `src/app.js`: rendering, navigation, import/export, browser storage
- `tests/engine.test.js`: Node.js unit tests
- `.github/workflows/pages.yml`: test + GitHub Pages deployment

## License

MIT. Contribute thoughtfully, keep the work open, and make the next cycle better than the last.
