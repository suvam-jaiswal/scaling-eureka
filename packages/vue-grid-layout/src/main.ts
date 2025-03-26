import { createApp } from 'vue';

import App from './App.vue';
// --- Library Exports (Keep these for build process) ---
// These won't be used when running `npm run dev` but are needed for `npm run build`
import Board from './components/Board.vue';
// Import base styles if needed globally for the example app
// import './styles/variables.css';
// import './styles/board.css';

createApp(App).mount('#app');

export { Board };
export * from './types';
