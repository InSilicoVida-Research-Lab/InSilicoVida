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

The build sets `VITE_BASE_PATH` to `/` because the public site is [https://insilicohub.org/](https://insilicohub.org/). A copy of `index.html` is published as `404.html` so routes such as `/team` still load after a refresh.

`insilicohub.org` and `www.insilicohub.org` already point at GitHub Pages. In **Settings → Pages**, set **Source** to **GitHub Actions** and set **Custom domain** to `insilicohub.org`. Leave the base path as `/`. A value of `/${{ github.event.repository.name }}/` would request assets under `/InSilicoVida/` and the custom domain would load a blank page.

The published site includes a `CNAME` file for `insilicohub.org`, which is the repository that already owns that domain: [InSilicoVida/InSilicoVida](https://github.com/InSilicoVida/InSilicoVida). Pushing `main` there replaces the December build.

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
