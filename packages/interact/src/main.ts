import { createApp } from 'vue';
import type { App as AppType } from 'vue';
import App from './App.vue';
import router from './router';

// Import syntax highlighting
import 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

import './assets/main.css';
import './examples/common-styles.css';

createApp(App as unknown as AppType)
  .use(router)
  .mount('#app');
