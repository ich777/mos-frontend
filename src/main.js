// main.js
import { createApp } from 'vue'
import App from './App.vue'
import '@mdi/font/css/materialdesignicons.css'
import { createI18n } from 'vue-i18n'
import de from './locales/de.json'
import en from './locales/en.json'
import router from './router'
import 'vue-sonner/style.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'
import { md3 } from 'vuetify/blueprints';

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = prefersDark ? 'dark' : 'light';

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: colors.teal.darken4
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#1976D2',
          secondary: colors.teal.darken3
        }
      }
    }
  },
  defaults: {
      VCard: {
        style: {
          background: 'rgb(var(--v-theme-background))',
          borderRadius: '12px',
          padding: '8px 12px 12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
          border: '1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 15%, transparent)',
        },
      },
    },  
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    de,
    en
  }
})

createApp(App)
  .use(vuetify)
  .use(router)
  .use(i18n)
  .mount('#app')
