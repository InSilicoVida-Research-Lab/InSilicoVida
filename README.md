# InSilicoVida Research Group Website

A modern, animated website for the InSilicoVida Research Group showcasing research, publications, team members, and software tools.

## Features

- 🎨 Modern UI with GSAP animations
- 🎯 Automatic highlighting of technical terms
- 📱 Fully responsive design
- ⚡ Built with Vite and React
- 🎭 Smooth scroll-triggered animations
- 🌈 Dynamic color highlighting

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Pushes to `main` and `update-website-features` build the site and publish it to GitHub Pages.

The site is served from the repository path, so the build sets `VITE_BASE_PATH` to `/InSilicoVida/`. A copy of `index.html` is published as `404.html` so routes such as `/team` still load after a refresh.

One-time setup in the GitHub repository:

1. Commit and push `.github/workflows/deploy.yml`.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

After the workflow succeeds, the site is at `https://insilicovida-research-lab.github.io/InSilicoVida/`. The Actions tab shows the run and the published URL.

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── data/          # Data files
└── lib/           # Library utilities
```

## Technologies

- React 18
- TypeScript
- Vite
- GSAP (animations)
- Tailwind CSS
- React Router
