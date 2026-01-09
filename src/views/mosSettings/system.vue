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
            <v-text-field :label="$t('global spindown (min)')" type="number" v-model="settingsSystem.global_spindown" hide-details="auto"></v-text-field>
            <v-switch :label="$t('persist history')" color="green" inset v-model="settingsSystem.persist_history" hide-details="auto"></v-switch>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('display settings') }}</span>
            <v-select :items="['on', 'off']" :label="$t('powersave')" v-model="settingsSystem.display.powersave" class="pt-4"></v-select>
            <v-text-field :label="$t('powerdown (min)')" type="number" v-model="settingsSystem.display.powerdown"></v-text-field>
            <v-text-field :label="$t('timeout (min)')" type="number" v-model="settingsSystem.display.timeout"></v-text-field>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('notification sounds') }}</span>
            <v-switch :label="$t('sound on reboot')" color="green" inset v-model="settingsSystem.notification_sound.reboot" hide-details="auto"></v-switch>
            <v-switch :label="$t('sound on shutdown')" color="green" inset v-model="settingsSystem.notification_sound.shutdown" hide-details="auto"></v-switch>
            <v-switch :label="$t('sound on startup')" color="green" inset v-model="settingsSystem.notification_sound.startup" hide-details="auto"></v-switch>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('swapfile') }}</span>
            <v-switch :label="$t('enable swapfile')" color="green" inset v-model="settingsSystem.swapfile.enabled" hide-details="auto"></v-switch>
            <v-text-field
              :label="$t('swapfile path')"
              v-model="settingsSystem.swapfile.path"
              :disabled="!settingsSystem.swapfile.enabled"
              append-inner-icon="mdi-folder"
              @click:append-inner="
                openFsDialog((item) => {
                  settingsSystem.swapfile.path = item.path;
                })
              "
            ></v-text-field>
            <v-text-field :label="$t('swapfile size')" v-model="settingsSystem.swapfile.size" :disabled="!settingsSystem.swapfile.enabled"></v-text-field>
            <v-text-field :label="$t('swapfile priority')" type="number" v-model="settingsSystem.swapfile.priority" :disabled="!settingsSystem.swapfile.enabled" hide-details="auto"></v-text-field>
            <v-switch :label="$t('zswap enabled')" color="green" inset v-model="settingsSystem.swapfile.config.zswap" :disabled="!settingsSystem.swapfile.enabled" hide-details="auto"></v-switch>
            <v-switch :label="$t('shrinker enabled')" color="green" inset v-model="settingsSystem.swapfile.config.shrinker" :disabled="!settingsSystem.swapfile.enabled" hide-details="auto"></v-switch>
            <v-text-field :label="$t('zswap max pool percent')" type="number" v-model="settingsSystem.swapfile.config.max_pool_percent" :disabled="!settingsSystem.swapfile.enabled"></v-text-field>
            <v-select
              :items="zswapAlgorithms"
              :label="$t('zswap compressor')"
              v-model="settingsSystem.swapfile.config.compressor"
              :disabled="!settingsSystem.swapfile.enabled"
              dense
              outlined
            ></v-select>
            <v-text-field
              :label="$t('zswap accept threshold percent')"
              type="number"
              v-model="settingsSystem.swapfile.config.accept_threshold_percent"
              :disabled="!settingsSystem.swapfile.enabled"
            ></v-text-field>
            <v-divider class="my-2"></v-divider>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('date & time') }}</span>
            <v-text-field class="mt-4" :label="$t('currently')" :model-value="`${currentTimeDate.date} ${currentTimeDate.time}`" readonly></v-text-field>
            <v-text-field
              v-if="!settingsSystem.ntp.enabled"
              :label="$t('set date or leave empty to keep current')"
              v-model="timedate.date"
              placeholder="YYYY-MM-DD"
              hint="Format: YYYY-MM-DD"
            ></v-text-field>
            <v-text-field
              v-if="!settingsSystem.ntp.enabled"
              :label="$t('set time or leave empty to keep current')"
              v-model="timedate.time"
              placeholder="HH:mm:ss"
              hint="Format: HH:mm:ss"
            ></v-text-field>
            <v-switch :label="$t('ntp enabled')" color="green" inset v-model="settingsSystem.ntp.enabled" density="compact"></v-switch>
            <v-text-field :label="$t('ntp mode')" v-model="settingsSystem.ntp.mode" :disabled="!settingsSystem.ntp.enabled"></v-text-field>
            <v-row>
              <v-col cols="12" v-for="(server, i) in settingsSystem.ntp.servers" :key="`ntp-${i}`">
                <v-text-field
                  :label="$t('ntp servers')"
                  v-model="settingsSystem.ntp.servers[i]"
                  :disabled="!settingsSystem.ntp.enabled"
                  :hint="i === 0 ? 'First NTP server' : undefined"
                  append-inner-icon="mdi-delete"
                  @click:append-inner="settingsSystem.ntp.servers.splice(i, 1)"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0 mb-2">
                <div class="d-flex align-center my-2">
                  <v-divider class="flex-grow-1"></v-divider>
                  <v-btn
                    class="mx-4"
                    color="green"
                    size="small"
                    density="comfortable"
                    variant="tonal"
                    icon
                    aria-label="Add NTP server"
                    @click="settingsSystem.ntp.servers.push('')"
                    :disabled="!settingsSystem.ntp.enabled"
                  >
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-divider class="flex-grow-1"></v-divider>
                </div>
              </v-col>
            </v-row>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('proxy') }}</span>
            <v-text-field :label="$t('http proxy')" v-model="proxies.http_proxy" :placeholder="proxies.http_proxy" class="mt-4"></v-text-field>
            <v-text-field :label="$t('https proxy')" v-model="proxies.https_proxy" :placeholder="proxies.https_proxy"></v-text-field>
            <v-text-field :label="$t('ftp proxy')" v-model="proxies.ftp_proxy" :placeholder="proxies.ftp_proxy"></v-text-field>
            <v-text-field :label="$t('no proxy')" v-model="proxies.no_proxy" :placeholder="proxies.no_proxy"></v-text-field>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/mnt'" :roots="'/mnt'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setSystemSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
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
  swapfile: {
    enabled: true,
    path: '/mnt/backup',
    size: '10G',
    priority: 0,
    config: {
      zswap: true,
      shrinker: true,
      max_pool_percent: 20,
      compressor: 'zstd',
      accept_threshold_percent: 90,
    },
  },
});
const zswapAlgorithms = ref([]);
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
  getZswapAlgorithms();
  dateTimeInterval = setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (dateTimeInterval) {
    clearInterval(dateTimeInterval);
  }
});

const openFsDialog = (cb) => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const timedate = ref({
  date: '',
  time: '',
});

const currentTimeDate = ref({
  date: getCurrentDate(),
  time: getCurrentTime(),
});

const updateDateTime = () => {
  if (settingsSystem.value.ntp.enabled) {
    currentTimeDate.value.date = getCurrentDate();
    currentTimeDate.value.time = getCurrentTime();
  } else {
    getTimeDate();
  }
};

let dateTimeInterval = null;

const getSystemSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/system', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('system settings could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    settingsSystem.value = await res.json();

    if (!settingsSystem.value.ntp.enabled) {
      await getTimeDate();
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getZswapAlgorithms = async () => {
  try {
    const res = await fetch('/api/v1/mos/zswap/algorithms', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('zswap algorithms could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    zswapAlgorithms.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getTimeDate = async () => {
  try {
    const res = await fetch('/api/v1/system/timedate', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('time and date could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const data = await res.json();
    currentTimeDate.value.date = data.date;
    currentTimeDate.value.time = data.time;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setTimeDate = async () => {
  try {
    const res = await fetch('/api/v1/system/timedate', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: timedate.value.date,
        time: timedate.value.time,
      }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('time and date could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('system settings could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }    
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('proxies could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    if (!settingsSystem.value.ntp.enabled) {
      if (timedate.value.date || timedate.value.time) {
        await setTimeDate();
      }
    }

    showSnackbarSuccess(t('system settings changed successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getKeymaps = async () => {
  try {
    const res = await fetch('/api/v1/system/keymaps', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('keymaps could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    keymaps.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getTimezones = async () => {
  try {
    const res = await fetch('/api/v1/system/timezones', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('timezones could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    timezones.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getProxies = async () => {
  try {
    const res = await fetch('/api/v1/system/proxy', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('proxies could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    proxies.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getGovernors = async () => {
  try {
    const res = await fetch('/api/v1/system/governors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('governors could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    governors.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
