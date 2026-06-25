# RFTimer

RFTimer is a Rubik's Cube timer and solver built with React, TypeScript, and Vite. It supports both 2x2 and 3x3 training, stores solve history locally, and includes a dedicated 2x2 solver page for painting cube states and generating solutions.

## Features

- 2x2 and 3x3 scramble generation
- Hold-to-start timer with keyboard and touch support
- Session stats such as current time, best time, mo3, ao5, ao12, and ao50
- Local solve history saved in the browser
- CSV export for recorded solves
- Custom scramble input for manual practice
- Theme toggle for light and dark modes
- 2x2 solver page with editable cube stickers and solution generation

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Web workers for the in-browser 2x2 solver
- Express and C++ in the optional backend solver flow

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Then open the Vite URL shown in the terminal, usually http://localhost:5173.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Optional Backend Solver

The `backend` folder contains an Express server and a C++ solver entry point. The front-end 2x2 solver uses a web worker, so this backend is optional for the current UI flow.

To run the backend solver path:

1. Build the C++ solver binary so it is available as `backend/solver`.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Start the server:

```bash
npm start
```

The server listens on port `3000` by default and exposes a `POST /solve` endpoint.

## Project Structure

```text
src/
	Timer.tsx          Main timer UI and solve history
	Solver.tsx         2x2 solver page
	Scramble.ts        Scramble generation and cube logic
	workers/           Web worker used by the solver page
backend/
	server.js          Express server for the solver endpoint
	solver.cpp         C++ solver used by the backend
```

## Notes

- Solve history, theme, mode, and hold duration are stored in `localStorage`.
- The app is designed for speedcubing practice, so keyboard and touch interactions are both supported.
