# 🎮 Integrated 3D Portfolio

A sophisticated 3D interactive portfolio with an embedded retro OS interface.

## 🏗️ Architecture

- **Main Site**: Three.js 3D room experience (`/`)
- **Inner Site**: React retro OS interface (`/inner-site/`)

## 🚀 Development

### Quick Start
```bash
# Install dependencies
npm install

# Start both servers (recommended)
npm run dev:both
```

### Individual Servers
```bash
# Main site only (localhost:5173)
npm run dev

# Inner site only (localhost:3001)
npm run dev:inner
```

## 📦 Production Build

```bash
# Build everything
npm run build:all
```

This will:
1. Build the inner site React app
2. Build the main Three.js site
3. Copy inner site to `dist/inner-site/`

## 🔧 How It Works

### Development Mode
- Main site runs on `localhost:5173`
- Inner site runs on `localhost:3001`
- Main site iframe points to `localhost:3001`

### Production Mode
- Inner site is built and copied to `dist/inner-site/`
- Main site iframe points to `./inner-site/index.html`
- Single deployable `dist/` folder

## 🎯 Features

### 3D Room (Main Site)
- Interactive piano with sound synthesis
- Computer monitor with embedded inner site
- Animated particles (fireflies, moths)
- Steam effects with custom shaders
- Rotating CPU fans
- Clickable objects (drawer, resume, social links)

### Retro OS (Inner Site)
- Desktop interface with windows
- NES game emulator
- Portfolio applications
- Wordle game
- Retro styling and fonts

## 🔗 Integration

The sites communicate via:
- **PostMessage API** for cross-frame events
- **Audio volume control** when camera focuses on monitor
- **Mouse/keyboard forwarding** from iframe to parent

## 📁 Project Structure

```
illuminati/
├── src/                    # Main 3D site source
├── inner-site/            # React OS interface
│   ├── src/
│   ├── public/
│   └── package.json
├── public/                # 3D assets, textures, models
├── dist/                  # Production build output
└── package.json           # Main dependencies
```

## 🛠️ Tech Stack

### Main Site
- Three.js + WebGL
- GSAP animations
- Web Audio API
- CSS3DRenderer
- Vite

### Inner Site
- React + TypeScript
- Framer Motion
- Nostalgist (NES emulator)
- Firebase
- Vite

## 🚀 Deployment

Deploy the `dist/` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

The inner site will be automatically included and accessible.