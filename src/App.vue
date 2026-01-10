<template>
  <v-app id="app">
    <template v-if="!loginChecked">
      <v-progress-circular indeterminate color="onPrimary" class="ma-5"></v-progress-circular>
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
        <v-toolbar-title>{{ hostname || $t('mos') }}</v-toolbar-title>
        <v-badge :model-value="notificationsBadge" color="green" dot floating bordered location="bottom end" offset-x="25" offset-y="16">
          <v-btn icon variant="text" aria-label="Notifications" to="/notifications" class="mr-2">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
        <v-btn icon variant="text" to="/profile">
          <v-icon>
            mdi-account-circle
          </v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer v-if="!$route.meta.hideAppBar" v-model="drawer" :temporary="!display.mdAndUp.value">
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
          <v-list-item v-if="mosServices.remote_mounting?.enabled" to="/remoteMounting" prepend-icon="mdi-cloud-sync">
            <v-list-item-title>{{ $t('remote mounting') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.hub?.enabled" to="/mosHub" prepend-icon="mdi-hub">
            <v-list-item-title>{{ $t('mos hub') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.docker?.running" to="/docker" prepend-icon="mdi-docker">
            <v-list-item-title>{{ $t('docker') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.lxc?.enabled" to="/lxc" prepend-icon="mdi-arrange-send-backward">
            <v-list-item-title>{{ $t('lxc') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="mosServices.vm?.running" to="/vm" prepend-icon="mdi-monitor-account">
            <v-list-item-title>{{ $t('vm') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/users" prepend-icon="mdi-account">
            <v-list-item-title>{{ $t('users') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/webTerminal" prepend-icon="mdi-powershell">
            <v-list-item-title>{{ $t('webterminal') }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/plugins" prepend-icon="mdi-puzzle">
            <v-list-item-title>{{ $t('plugins') }}</v-list-item-title>
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
          <component :is="Component" @refresh-drawer="getMosServices()" @refresh-notifications-badge="getNotificationsBadge()" />
        </router-view>
      </v-main>
    </template>
    <!-- Top Toaster -->
    <Toaster id="top-toaster"
      position="top-center"
      :richColors="true"
      :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'"
      :expand="true"
      :visibleToasts="3"
      :offset="16"
    />

    <!-- Bottom Toaster -->
    <Toaster id="bottom-toaster"
      position="bottom-center"
      :richColors="true"
      :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'"
      :expand="true"
      :visibleToasts="3"
      :offset="16"
    />
  </v-app>

  <v-dialog v-model="logoutDialog" width="auto" min-width="400">
    <v-card max-width="400" prepend-icon="mdi-logout" :text="$t('do you want to logout?')" :title="$t('logout')">
      <template v-slot:actions>
        <v-btn color="onPrimary" :text="$t('cancel')" @click="logoutDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="$t('ok')" @click="doLogout"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Login from './views/login.vue';
import FirstSetup from './views/firstSetup.vue';
import { showSnackbarError, showSnackbarSuccess, showSnackbarInfo, showSnackbarWarning } from './composables/snackbar';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { getContrast } from 'vuetify/lib/util/colorUtils';
import { Toaster } from 'vue-sonner';
import mosBlack from '/mos_black.png';
import mosWhite from '/mos_white.png';
import { useDisplay } from 'vuetify';

const display = useDisplay()
const theme = useTheme();
const { locale, t } = useI18n();
const tab = ref('');
const drawer = ref(false);
const isWideScreen = computed(() => display.mdAndUp.value)
const loggedIn = ref(false);
const token = ref('');
const logoutDialog = ref(false);
const loginChecked = ref(false);
const mosServices = ref({});
const appBarColor = 'primary';
const notificationsBadge = ref(false);
const hostname = ref('');
const RECONNECT_MAX_DELAY = 15000;
const RECONNECT_BASE_DELAY = 1000;

let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

watch(drawer, (val) => {
  localStorage.setItem('drawer', String(val))
})

onMounted(async () => {
  if (tab.value === '') {
    tab.value = 'dashboard';
  }
  await checkLoggedIn();
  if (loggedIn.value) {
    getNotificationsBadge();
    connectNotificationWS();
    await getMosServices();
    await getHostname();
    getDrawerState();
  }
});

onUnmounted(() => {
  cleanupWS();
});

const backgroundColor = computed(() => {
  return theme.current.value.colors[appBarColor];
});
const isDark = computed(() => {
  const contrast = getContrast(backgroundColor.value, '#fff');
  return contrast < 2.7;
});
const logoSrc = computed(() => {
  return isDark.value ? mosBlack : mosWhite;
});

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
};

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
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('Not logged in');

    const result = await res.json();

    if(result.darkmode) {
      theme.change('dark');
    } else {
      theme.change('light');
    }
    locale.value = result.language || 'en';
    theme.themes.value[theme.global.name.value].colors.primary = result.primary_color || '#1976D2';
    localStorage.setItem('userid', result.id);

    loggedIn.value = true;
  } catch (e) {
    loggedIn.value = false;
  }
};

function handleLoginSuccess() {
  loggedIn.value = true;
  getMosServices();
}

function handleSetupComplete() {
  loggedIn.value = false;
  token.value = '';
}

function doLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userid');
  tab.value = 'dashboard';
  loggedIn.value = false;
  drawer.value = false;
  logoutDialog.value = false;
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
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ darkmode: targetTheme === 'dark' ? true : false }),
    });

    if (!res.ok) throw new Error('API-Error');

    const result = await res.json();

    theme.global.name.value = result.darkmode ? 'dark' : 'light';
    locale.value = result.language || 'en';
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
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    mosServices.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getHostname = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    hostname.value = result.hostname || '';
  } catch (e) {
    hostname.value = '';
  }
};

const checkFirstSetup = async () => {
  try {
    const res = await fetch('/api/v1/auth/firstsetup', {
      method: 'GET',
    });

    if (!res.ok) throw new Error('API-Error');

    const result = await res.json();
    return result.firstsetup;
  } catch (e) {
    return false;
  }
};

const getNotificationsBadge = async () => {
  try {
    const res = await fetch('/api/v1/notifications?read=false&limit=1', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    let notification = await res.json();

    notificationsBadge.value = notification.length > 0;
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

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

// WS START --------------------------------------
function connectNotificationWS() {
  cleanupWS();
  ws = new WebSocket('/api/v1/notify');

  ws.onopen = () => {
    reconnectAttempts = 0;
    try {
      ws.send(JSON.stringify({ type: 'subscribe-notifications' }));
    } catch {}
  };

  ws.onerror = (ev) => {
    //showSnackbarError('Notification connection error');
  };

  ws.onclose = (ev) => {
    scheduleReconnect();
  };

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg?.type === 'ping') {
      ws?.send?.(JSON.stringify({ type: 'pong' }));
    } else {
      notificationsBadge.value = true;
      window.dispatchEvent(new CustomEvent('notification-received'));
      if (msg?.priority === 'error' || msg?.priority === 'alert') {
        showSnackbarError(msg?.message || 'New notification received', '', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'warning') {
        showSnackbarWarning(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'success') {
        showSnackbarSuccess(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else if (msg?.priority === 'info') {
        showSnackbarInfo(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      } else {
        showSnackbarInfo(msg?.message || 'New notification received', 'mdi-bell-ring', 'top-toaster');
      }
    }
  };
}

function scheduleReconnect() {
  cleanupWS(false);
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts++), RECONNECT_MAX_DELAY);
  reconnectTimer = window.setTimeout(connectNotificationWS, delay);
}

function cleanupWS(clearTimer = true) {
  try {
    ws?.close();
  } catch {}
  ws = null;
  if (clearTimer && reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
// WS ENDE --------------------------------------
</script>
