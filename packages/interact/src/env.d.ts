// Import Vite client types instead of using triple slash reference
import 'vite/client';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
  export default component;
}
