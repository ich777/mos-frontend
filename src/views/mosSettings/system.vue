<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('system') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-text-field :label="$t('hostname')" v-model="settingsSystem.hostname"></v-text-field>
            <v-select :items="keymaps" :label="$t('keymap')" v-model="settingsSystem.keymap" item-title="keymap" item-value="keymap"></v-select>
            <v-select :items="timezones" :label="$t('timezone')" v-model="settingsSystem.timezone" item-title="timezone" item-value="timezone"></v-select>
            <v-select :items="governors" :label="$t('cpu governor')" v-model="settingsSystem.cpufreq.governor" item-title="governor" item-value="governor"></v-select>
            <v-text-field :label="$t('global spindown (min)')" type="number" v-model="settingsSystem.global_spindown"></v-text-field>
            <v-switch :label="$t('persist history')" color="green" inset density="compact" v-model="settingsSystem.persist_history"></v-switch>
            <v-divider class="my-2"></v-divider>
            <h3 class="mb-2">{{ $t('display settings') }}</h3>
            <v-select :items="['on', 'off']" :label="$t('powersave')" v-model="settingsSystem.display.powersave"></v-select>
            <v-text-field :label="$t('powerdown (min)')" type="number" v-model="settingsSystem.display.powerdown"></v-text-field>
            <v-text-field :label="$t('timeout (min)')" type="number" v-model="settingsSystem.display.timeout"></v-text-field>
            <v-divider class="my-2"></v-divider>
            <h3 class="mb-2">{{ $t('notification sounds') }}</h3>
            <v-switch :label="$t('sound on reboot')" color="green" inset density="compact" v-model="settingsSystem.notification_sound.reboot"></v-switch>
            <v-switch :label="$t('sound on shutdown')" color="green" inset density="compact" v-model="settingsSystem.notification_sound.shutdown"></v-switch>
            <v-switch :label="$t('sound on startup')" color="green" inset density="compact" v-model="settingsSystem.notification_sound.startup"></v-switch>
            <v-divider class="my-2"></v-divider>
            <h3 class="mb-2">{{ $t('ntp') }}</h3>
            <v-switch :label="$t('ntp enabled')" color="green" inset density="compact" v-model="settingsSystem.ntp.enabled"></v-switch>
            <v-text-field :label="$t('ntp mode')" v-model="settingsSystem.ntp.mode"></v-text-field>
            <v-row>
              <v-col cols="12" v-for="(server, i) in settingsSystem.ntp.servers" :key="`ntp-${i}`">
                <v-text-field
                  :label="$t('ntp servers')"
                  v-model="settingsSystem.ntp.servers[i]"
                  :hint="i === 0 ? 'First NTP server' : undefined"
                  append-inner-icon="mdi-delete"
                  @click:append-inner="settingsSystem.ntp.servers.splice(i, 1)"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0 mb-6">
                <div class="d-flex align-center my-2">
                  <v-divider class="flex-grow-1"></v-divider>
                  <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add NTP server" @click="settingsSystem.ntp.servers.push('')">
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-divider class="flex-grow-1"></v-divider>
                </div>
              </v-col>
            </v-row>
            <h3 class="mb-2">{{ $t('proxy') }}</h3>
            <v-text-field :label="$t('http proxy')" v-model="proxies.http_proxy" :placeholder="proxies.http_proxy"></v-text-field>
            <v-text-field :label="$t('https proxy')" v-model="proxies.https_proxy" :placeholder="proxies.https_proxy"></v-text-field>
            <v-text-field :label="$t('ftp proxy')" v-model="proxies.ftp_proxy" :placeholder="proxies.ftp_proxy"></v-text-field>
            <v-text-field :label="$t('no proxy')" v-model="proxies.no_proxy" :placeholder="proxies.no_proxy"></v-text-field>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="setSystemSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const settingsSystem = ref({
  hostname: '',
  keymap: '',
  timezone: '',
  persist_history: true,
  ntp: {
    enabled: false,
    mode: '',
    servers: [],
  },
  global_spindown: 0,
  cpufreq: {
    governor: '',
  },
  notification_sound: {
    reboot: false,
    shutdown: false,
    startup: false,
  },
  display: {
    powerdown: 60,
    powersave: 'on',
    timeout: 30,
  },
});
const keymaps = ref([]);
const timezones = ref([]);
const proxies = ref({
  http_proxy: '',
  https_proxy: '',
  ftp_proxy: '',
  no_proxy: '',
});
const governors = ref([]);
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getSystemSettings();
  getKeymaps();
  getTimezones();
  getProxies();
  getGovernors();
});

const getSystemSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/system', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('system settings could not be loaded'));
    settingsSystem.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const setSystemSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/system', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsSystem.value),
    });
    const resProxy = await fetch('/api/v1/system/proxy', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proxies.value),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('system settings could not be changed'));
    if (!resProxy.ok) throw new Error(t('proxies could not be changed'));
    showSnackbarSuccess(t('system settings changed successfully'));
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const getKeymaps = async () => {
  try {
    const res = await fetch('/api/v1/system/keymaps', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('keymaps could not be loaded'));
    keymaps.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getTimezones = async () => {
  try {
    const res = await fetch('/api/v1/system/timezones', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('timezones could not be loaded'));
    timezones.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getProxies = async () => {
  try {
    const res = await fetch('/api/v1/system/proxy', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('proxies could not be loaded'));
    proxies.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getGovernors = async () => {
  try {
    const res = await fetch('/api/v1/system/governors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('governors could not be loaded'));
    governors.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};
</script>
