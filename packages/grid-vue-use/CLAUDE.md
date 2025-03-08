# Common Commands for interact-grid

## Development

Start the development server:
```bash
npm run dev
```

## Testing & Linting

Run the linter:
```bash
npm run lint
```

Run type checking:
```bash
npm run typecheck
```

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

- `src/components/`: Contains reusable Vue components
- `src/views/`: Contains page components
- `src/stores/`: Contains Pinia stores
- `src/router/`: Contains Vue Router configuration
- `src/assets/`: Contains static assets like CSS and images

## Style Guide

- Use 2 spaces for indentation
- Use TypeScript interfaces for data models
- Use composition API with `<script setup>` syntax
- Emit events for parent components to handle state changes
- Use Pinia for global state management