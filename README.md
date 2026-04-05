# Focus App

A minimal, high-performance focus timer designed for deep work sessions. Built with React 19, TypeScript, and Tailwind CSS, Focus App provides a distraction-free environment with integrated soundscapes to help you maintain flow.

![Focus App Hero](./src/assets/hero.png)

## Features

- **Adaptive Focus Modes**:
  - **Focus**: 25-minute Pomodoro sessions.
  - **Deep**: 50-minute blocks for complex tasks.
  - **Ultra**: 90-minute extended sessions for maximum immersion.
- **Ambient Soundscapes**: Built-in audio environments including Cafe, Forest, Rain, and White Noise to mask distractions.
- **Visual Progress**: Real-time progress tracking with smooth animations powered by Framer Motion.
- **Modern Aesthetic**: A dark-themed, minimalist UI optimized for concentration.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/focus-app.git
   cd focus-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```text
src/
├── components/      # UI Components (Timer, Soundscape, Modes)
├── hooks/           # Custom React hooks (useTimer, useSound)
├── music/           # Audio assets for soundscapes
├── styles/          # Global and variable CSS definitions
└── App.tsx          # Main application entry point
```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code quality.
- `npm run preview`: Preview the production build locally.

## License

MIT &copy; 2026 Focus App
