// main.js
import { createApp } from 'vue'
import App from './App.vue'
import '@mdi/font/css/materialdesignicons.css'
import { createI18n } from 'vue-i18n'
import de from './locales/de.json'
import en from './locales/en.json'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'
import { md3 } from 'vuetify/blueprints';

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#1976D2',
        }
      }
    }
  }  
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
