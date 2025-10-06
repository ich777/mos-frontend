<template>
  <v-app id="app">
    <template v-if="!loginChecked">
      <v-progress-circular indeterminate color="primary" class="ma-5"></v-progress-circular>
    </template>
    <template v-if="loginChecked && !loggedIn && !token">
      <Login @login-success="handleLoginSuccess" />
    </template>
    <template v-if="loginChecked && !loggedIn && token">
      <FirstSetup @setup-complete="handleSetupComplete" :token="token" />
    </template>
    <template v-else-if="loginChecked && loggedIn && !token">
      <v-app-bar v-if="!$route.meta.hideAppBar" :color="appBarColor" app>
        <v-app-bar-nav-icon variant="text" @click.stop="toggleDrawer"></v-app-bar-nav-icon>
        <v-img :src="logoSrc" alt="MOS Logo" max-width="50" class="ml-3 mr-3" contain />
        <v-toolbar-title>{{ $t('mos') }}</v-toolbar-title>
        <v-badge :model-value="notificationsBadge" color="green" dot floating bordered location="bottom end"
          :offset-x="14" :offset-y="14">
          <v-btn icon to="/notifications" variant="text" aria-label="Notifications">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
        <v-btn icon variant="text" @click="changeDarkMode()">
          <v-icon>
            {{ theme.global.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
          </v-icon>
        </v-btn>
        <v-btn icon="mdi-account-circle" variant="text" to="/profile"></v-btn>
      </v-app-bar>
      <v-navigation-drawer v-if="!$route.meta.hideAppBar" v-model="drawer">
        <v-list>
          <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard">
            <v-list-item-title>{{ $t('dashboard') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/disks" prepend-icon="mdi-harddisk">
            <v-list-item-title>{{ $t('disks') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/pools" prepend-icon="mdi-view-array">
            <v-list-item-title>{{ $t('pools') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/shares" prepend-icon="mdi-share">
            <v-list-item-title>{{ $t('shares') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.docker?.enabled" to="/docker" prepend-icon="mdi-docker">
            <v-list-item-title>{{ $t('docker') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.lxc?.enabled" to="/lxc" prepend-icon="mdi-arrange-send-backward">
            <v-list-item-title>{{ $t('lxc') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.vm?.enabled" to="/vm" prepend-icon="mdi-monitor-account">
            <v-list-item-title>{{ $t('vm') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/users" prepend-icon="mdi-account">
            <v-list-item-title>{{ $t('users') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/webTerminal" prepend-icon="mdi-powershell">
            <v-list-item-title>{{ $t('webterminal') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/mosSettings" prepend-icon="mdi-tools">
            <v-list-item-title>{{ $t('settings') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-on:click="logoutDialog = true" prepend-icon="mdi-logout">
            <v-list-item-title>{{ $t('logout') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" @refresh-drawer="getMosServices()" />
        </router-view>
      </v-main>
    </template>
  </v-app>

  <v-dialog v-model="logoutDialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-logout" :text="$t('do you want to logout?')" :title="$t('logout')">
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="$t('cancel')" @click="logoutDialog = false"></v-btn>
        <v-btn class="ms-auto" :text="$t('ok')" @click="doLogout"></v-btn>
      </template>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
    <template #actions>
      <v-icon v-if="snackbarIcon" class="me-2">{{ snackbarIcon }}</v-icon>
    </template>
    {{ snackbarText }}
  </v-snackbar>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Login from './views/login.vue'
import FirstSetup from './views/firstSetup.vue'
import { useSnackbar, showSnackbarError, showSnackbarSuccess } from './composables/snackbar'
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { getContrast } from 'vuetify/lib/util/colorUtils';

const { snackbar, snackbarText, snackbarColor, snackbarIcon } = useSnackbar()
const theme = useTheme();
const { locale, t } = useI18n();
const tab = ref('');
const drawer = ref(false);
const isWideScreen = computed(() => typeof window !== 'undefined' && window.innerWidth > 600);
const loggedIn = ref(false);
const token = ref('');
const logoutDialog = ref(false);
const loginChecked = ref(false);
const mosServices = ref({});
const appBarColor = 'primary';
const notificationsBadge = ref(false);

onMounted(async () => {
  if (tab.value === '') {
    tab.value = 'dashboard'
  }
  await checkLoggedIn();
  if (loggedIn.value) {
    getNotificationsBadge();
    await getMosServices();
    getDrawerState();
  }
})

const backgroundColor = computed(() => {
  return theme.current.value.colors[appBarColor];
})
const isDark = computed(() => {
  const contrast = getContrast(backgroundColor.value, '#fff');
  return contrast < 2.7;
})
const logoSrc = computed(() => {
  return isDark.value
    ? 'mos_black.png'
    : 'mos_white.png'
})

const checkLoggedIn = async () => {
  if (localStorage.getItem('authToken')) {
    checkTokenExpired(localStorage.getItem('authToken'));
    if (loggedIn.value) {
      await getUserProfile();
    } else {
      loggedIn.value = false;
    }
  } else {
    token.value = await checkFirstSetup();
    loggedIn.value = false;
  }
  loginChecked.value = true;
}

function checkTokenExpired(token) {
  if (token) {
    const payload = token.split('.')[1];
    try {
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        localStorage.removeItem('authToken');
        loggedIn.value = false;
        return;
      }
    } catch (e) {
      loggedIn.value = false;
      return;
    }
  }
  loggedIn.value = true;
  return;
}

const getUserProfile = async () => {
  try {
    const res = await fetch('/api/v1/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('Not logged in');

    const result = await res.json();

    theme.global.name.value = result.darkmode ? 'dark' : 'light';
    locale.value = result.language || 'en';
    theme.themes.value[theme.global.name.value].colors.primary = result.primary_color || '#1976D2';
    localStorage.setItem('userid', result.id);

    loggedIn.value = true;

  } catch (e) {
    loggedIn.value = false;
  }
}

function handleLoginSuccess() {
  loggedIn.value = true
  getMosServices();
}

function handleSetupComplete() {
  loggedIn.value = false;
  token.value = '';
}

function doLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userid');
  tab.value = 'dashboard'
  loggedIn.value = false
  drawer.value = false
  logoutDialog.value = false
}

const changeDarkMode = async () => {
  const currentTheme = theme.global.name.value;
  let targetTheme;
  if (currentTheme === 'dark') {
    targetTheme = 'light';
  } else {
    targetTheme = 'dark';
  }

  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'darkmode': targetTheme === 'dark' ? true : false })
    })

    if (!res.ok) throw new Error('API-Error');

    // Response in JSON umwandeln
    const result = await res.json();

    theme.global.name.value = result.darkmode ? 'dark' : 'light';
    locale.value = result.language || 'en'
    theme.themes.value[theme.global.name.value].colors.primary = result.primary_color || '#1976D2';

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getMosServices = async () => {
  try {
    const res = await fetch('/api/v1/mos/services', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    mosServices.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
}

const checkFirstSetup = async () => {
  try {
    const res = await fetch('/api/v1/auth/firstsetup', {
      method: 'GET'
    });

    if (!res.ok) throw new Error('API-Error');

    const result = await res.json();
    return result.firstsetup;

  } catch (e) {
    return false;
  }
}

const getNotificationsBadge = async () => {
  try {
    const res = await fetch('/api/v1/notifications?read=false&limit=1', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error('API-Error');
    let notification = await res.json();

    if (notification.length > 0) {
      notificationsBadge.value = true;
    } else {
      notificationsBadge.value = false;
    }

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
  localStorage.setItem('drawer', drawer.value);
};

const getDrawerState = () => {
  if (localStorage.getItem('drawer')) {
    if (localStorage.getItem('drawer') === 'true' && isWideScreen.value) {
      drawer.value = true;
    } else {
      drawer.value = false;
    }
  } else {
    drawer.value = true;
  }
};

</script>