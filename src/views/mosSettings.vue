<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('settings') }}</h2>
      </v-container>
      <v-container class="pa-0" fluid>
        <v-row>
          <!-- System Updates Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-update</v-icon>
                {{ $t('system updates') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded @click="openUpdateOsDialog()">
                  <v-icon start>mdi-package-up</v-icon>
                  {{ $t('update system') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded @click="openUpdateKernelDialog()">
                  <v-icon start>mdi-engine</v-icon>
                  {{ $t('update kernel') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded @click="rollbackKernelDialog = true">
                  <v-icon start>mdi-undo</v-icon>
                  {{ $t('rollback kernel') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- System Configuration Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-cog</v-icon>
                {{ $t('system configuration') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/users">
                  <v-icon start>mdi-account</v-icon>
                  {{ $t('users') }}
                </v-btn>                
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/system">
                  <v-icon start>mdi-desktop-classic</v-icon>
                  {{ $t('system') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/cron">
                  <v-icon start>mdi-clock-outline</v-icon>
                  {{ $t('cron jobs') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/logs">
                  <v-icon start>mdi-text-box-outline</v-icon>
                  {{ $t('logs') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/mosHub">
                  <v-icon start>mdi-hub</v-icon>
                  {{ $t('mos hub') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Virtualization Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-server</v-icon>
                {{ $t('virtualization') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/docker">
                  <v-icon start>mdi-docker</v-icon>
                  {{ $t('docker service') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/lxc">
                  <v-icon start>mdi-package-variant</v-icon>
                  {{ $t('lxc service') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/vm">
                  <v-icon start>mdi-desktop-tower</v-icon>
                  {{ $t('vm service') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Network Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-network</v-icon>
                {{ $t('network') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/networkInterfaces">
                  <v-icon start>mdi-ethernet</v-icon>
                  {{ $t('network interfaces') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/networkServices">
                  <v-icon start>mdi-network-outline</v-icon>
                  {{ $t('network services') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/token">
                  <v-icon start>mdi-key</v-icon>
                  {{ $t('token') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Hardware Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-chip</v-icon>
                {{ $t('hardware') }}
              </v-card-title>
              <v-card-text>
                <!--<v-btn color="primary" block class="mb-2" rounded to="/mosSettings/drivers">
                  <v-icon start>mdi-expansion-card</v-icon>
                  {{ $t('drivers') }}
                </v-btn>-->
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/boot">
                  <v-icon start>mdi-usb-flash-drive</v-icon>
                  {{ $t('boot') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/sensors">
                  <v-icon start>mdi-thermometer</v-icon>
                  {{ $t('sensors') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/zram">
                  <v-icon start>mdi-memory</v-icon>
                  {{ $t('zram') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Others Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-help-box</v-icon>
                {{ $t('others') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" class="mb-2" block rounded @click="thanksDialog = true">
                  <v-icon start>mdi-handshake</v-icon>
                  {{ $t('thanks') }}
                </v-btn>
                <v-btn color="primary" class="mb-2" block rounded @click="aboutDialog = true">
                  <v-icon start>mdi-information</v-icon>
                  {{ $t('about') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <!-- Update OS Dialog -->
  <v-dialog v-model="updateOsDialog.value" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-update" :title="t('update system')" class="pa-0">
      <v-card-text class="pa-0">
        <div style="max-height: 60vh; overflow-y: auto; padding: 16px; padding-bottom: 32px">
          <p class="mb-4">{{ t('please select your target firmware!') }}</p>
          <p v-if="osInfo && osInfo.mos">
            <b>{{ $t('mos version') }}:</b>
            {{ osInfo.mos.version }}
          </p>
          <p v-if="osInfo && osInfo.mos">
            <b>{{ $t('mos channel') }}:</b>
            {{ osInfo.mos.channel }}
          </p>
          <p v-if="osInfo && osInfo.mos" class="mb-4">
            <b>{{ $t('mos kernel') }}:</b>
            {{ osInfo.mos.running_kernel }}
          </p>
          <v-select v-model="updateOsDialog.channel" :items="getMosChannels()" :label="t('channel')"></v-select>
          <v-select v-model="updateOsDialog.release" :items="getMosReleasesOfChannel()" :label="t('release')"></v-select>
          <v-switch v-model="updateOsDialog.update_kernel" :label="t('update kernel')" inset density="compact" color="green" hide-details="auto" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateOsDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Update Kernel Dialog -->
  <v-dialog v-model="updateKernelDialog.value" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-engine" :title="t('update kernel')" class="pa-0">
      <v-card-text class="pa-0">
        <div style="max-height: 60vh; overflow-y: auto; padding: 16px; padding-bottom: 32px">
          <p class="mb-4">{{ t('please select your target kernel release!') }}</p>
          <v-select v-model="updateKernelDialog.version" :items="['recommended', ...mosKernel.map((k) => k.tag_name)]" :label="t('kernel release')" hide-details="auto" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateKernelDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateKernel(updateKernelDialog.version)"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rollback Kernel Dialog -->
  <v-dialog v-model="rollbackKernelDialog" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-undo" :title="t('rollback kernel')" class="pa-0">
      <v-card-text>
        <p class="mb-4">{{ t('are you sure you want to rollback to the previous kernel version?') }}</p>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rollbackKernelDialog = false"></v-btn>
        <v-btn color="red" :text="t('ok')" @click="rollbackKernel()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Thanks Dialog -->
  <v-dialog v-model="thanksDialog" max-width="500">
    <v-card max-width="600" class="pa-0" style="max-height: 80vh; display: flex; flex-direction: column" :title="t('thanks')" prepend-icon="mdi-handshake">
      <v-card-text style="padding-right: 16px; padding-bottom: 0">
        <p>{{ t('the mos team') }},</p>
        <p>{{ t('thanks you for your use and feedback') }}!</p>
      </v-card-text>
      <v-card-text class="font-weight-bold py-0 pt-2 pb-2">{{ t('used software and packages') }}:</v-card-text>
      <div style="overflow-y: auto; flex: 1 1 auto; padding-right: 16px; padding-left: 16px">
        <v-container v-if="osInfo && osInfo.base && osInfo.base.length" class="pa-0">
          <div v-for="(baseItem, i) in osInfo.base" :key="i" class="pa-0 mb-4">
            <div class="text-subtitle-1 font-weight-medium">
              {{ baseItem.os_name }}
              <span v-if="baseItem.os_version">({{ baseItem.os_version }})</span>
            </div>
            <v-list class="pa-0">
              <v-list-item v-for="pkg in baseItem.packages" :key="pkg.name">
                <div class="v-list-item-content">
                  <v-list-item-title class="text-body-1">{{ pkg.name }}</v-list-item-title>
                  <v-list-item-subtitle class="text--secondary">{{ pkg.version }}</v-list-item-subtitle>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </v-container>
      </div>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff)">
        <v-btn color="onPrimary" :text="t('close')" @click="thanksDialog = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- About Dialog -->
  <v-dialog v-model="aboutDialog" max-width="600">
    <v-card class="pa-0" style="max-height: 80vh; display: flex; flex-direction: column" prepend-icon="mdi-information" :title="t('about')">
      <div style="overflow-y: auto; flex: 1 1 auto; padding-right: 16px">
        <v-card-text class="py-0">
          <v-row class="align-center" no-gutters>
            <v-col cols="auto" class="pr-4">
              <v-img src="/mos_black.png" alt="MOS Logo" height="56" width="56" contain />
            </v-col>
            <v-col>
              <div class="text-h6 font-weight-medium">{{ $t('mos') }}</div>
              <div class="text-body-2 text-medium-emphasis">
                <span v-if="osInfo?.mos">{{ $t('version') }}: {{ osInfo.mos.version }} · {{ $t('channel') }}: {{ osInfo.mos.channel }}</span>
              </div>
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-chip color="green" variant="tonal" size="small">
                {{ $t('open source') }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-4">
          <div class="font-weight-bold mb-2">{{ $t('the team') }}:</div>
          <v-row class="d-flex" dense>
            <v-col cols="12">
              <v-chip
                v-for="(c, idx) in ['alturismo', 'anym001', 'giganode', 'Christoph Hummer (ich777)', 'j0k3r', 'Joly0', 'Mainfrezzer', 'RiDDiX', 'Harald Wiesinger (s3ppo)', 'Sonic6']"
                :key="idx"
                class="ma-1"
                size="small"
                variant="outlined"
              >
                <v-icon start size="16">mdi-account</v-icon>
                {{ c }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-2">
          <div class="font-weight-bold mb-2">{{ $t('official channels') }}:</div>
          <v-row dense class="align-center">
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://discord.gg/fcTMbuygTV" target="_blank" rel="noopener" :aria-label="'Discord'" title="Discord">
                <v-icon color="#7289DA">mdi-headphones</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://www.reddit.com/r/mos_official" target="_blank" rel="noopener" :aria-label="'Reddit'" title="Reddit">
                <v-icon color="#FF4500">mdi-reddit</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://x.com/mos_offi" target="_blank" rel="noopener" :aria-label="'X'" title="X">
                <v-icon color="#1DA1F2">mdi-twitter</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-2">
          <div class="font-weight-bold mb-2">{{ $t('source & license') }}:</div>
          <v-row class="mt-2" dense>
            <v-col cols="auto">
              <v-btn variant="outlined" size="small" href="https://github.com/ich777/mos-releases" target="_blank" rel="noopener">
                <v-icon start>mdi-github</v-icon>
                GitHub
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="outlined" size="small" href="https://github.com/ich777/mos-frontend?tab=AGPL-3.0-1-ov-file" target="_blank" rel="noopener">
                <v-icon start>mdi-file-document-outline</v-icon>
                AGPL-3.0
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </div>

      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff)">
        <v-spacer />
        <v-btn variant="text" color="onPrimary" @click="aboutDialog = false">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const mosReleases = ref({});
const mosKernel = ref([]);
const thanksDialog = ref(false);
const aboutDialog = ref(false);
const rollbackKernelDialog = ref(false);
const osInfo = ref({});
const overlay = ref(false);
const { t } = useI18n();
const updateOsDialog = reactive({
  value: false,
  channel: null,
  release: null,
  update_kernel: true,
});
const updateKernelDialog = reactive({
  value: false,
  version: null,
});

onMounted(() => {
  getMosReleases();
  getOsInfo();
  getMosKernel();
});

const getMosReleases = async () => {
  try {
    const res = await fetch('/api/v1/mos/getreleases', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch releases')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    mosReleases.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getMosKernel = async () => {
  try {
    const res = await fetch('/api/v1/mos/getkernel', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch kernel releases')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    mosKernel.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('API-Error')}|$| ${error.error || t('unknown error')}`);
    }

    osInfo.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getMosChannels = () => {
  return Object.keys(mosReleases.value);
};
const getMosReleasesOfChannel = () => {
  if (!updateOsDialog.channel) return [];

  const releases = mosReleases.value[updateOsDialog.channel] || [];
  const tags = releases.map((item) => item.tag_name);
  if (releases.length > 0) {
    tags.unshift('latest');
  }
  return tags;
};

const updateOS = async () => {
  const updateBody = {
    version: updateOsDialog.release,
    channel: updateOsDialog.channel,
    update_kernel: updateOsDialog.update_kernel,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/updateos', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    updateOsDialog.value = false;
    showSnackbarSuccess(t('update initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateKernel = async (kernelVersion) => {
  const updateBody = {
    version: kernelVersion,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/updatekernel', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('kernel update could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    updateKernelDialog.value = false;
    showSnackbarSuccess(t('kernel update initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const rollbackKernel = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/rollbackkernel', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('kernel rollback could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('kernel rollback initiated successfully'));
    rollbackKernelDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openUpdateOsDialog = () => {
  updateOsDialog.value = true;
  clearUpdateOsDialog();
};
const clearUpdateOsDialog = () => {
  updateOsDialog.release = null;
  updateOsDialog.channel = null;
  updateOsDialog.update_kernel = true;
};
const openUpdateKernelDialog = () => {
  updateKernelDialog.value = true;
};

</script>
