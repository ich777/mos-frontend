<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('settings') }}</h2>
      </v-container>
      <v-container class="pa-0" fluid>
        <v-row>
          <!-- Power Management Card -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-power</v-icon>
                {{ $t('power management') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded @click="rebootDialog = true">
                  <v-icon start>mdi-restart</v-icon>
                  {{ $t('reboot') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded @click="shutdownDialog = true">
                  <v-icon start>mdi-power</v-icon>
                  {{ $t('shutdown') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

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
                <v-btn color="primary" block class="mb-2" rounded to="/mosSettings/drivers">
                  <v-icon start>mdi-expansion-card</v-icon>
                  {{ $t('drivers') }}
                </v-btn>
                <v-btn color="primary" block  class="mb-2" rounded to="/mosSettings/boot">
                  <v-icon start>mdi-usb-flash-drive</v-icon>
                  {{ $t('boot') }}
                </v-btn>
                <v-btn color="primary" block rounded to="/mosSettings/sensors">
                  <v-icon start>mdi-access-point</v-icon>
                  {{ $t('sensors') }}
                </v-btn>                
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-star-face</v-icon>
                {{ $t('special') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded @click="updateAPI()">
                  <v-icon start>mdi-api</v-icon>
                  {{ $t('update api') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded @click="updateUI()">
                  <v-icon start>mdi-monitor</v-icon>
                  {{ $t('update ui') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <!-- Update OS Dialog -->
  <v-dialog v-model="updateOsDialog.value" width="auto">
    <v-card max-width="600" prepend-icon="mdi-update" :title="t('update system')" class="pa-0">
      <v-card-text>
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
        <v-switch v-model="updateOsDialog.update_kernel" :label="t('update kernel')" inset density="compact" color="green" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateOsDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Update Kernel Dialog -->
  <v-dialog v-model="updateKernelDialog.value" width="auto">
    <v-card max-width="600" prepend-icon="mdi-engine" :title="t('update kernel')" class="pa-0">
      <v-card-text>
        <p class="mb-4">{{ t('please select your target kernel release!') }}</p>
        <v-select v-model="updateKernelDialog.version" :items="['recommended', ...mosKernel.map((k) => k.tag_name)]" :label="t('kernel release')" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateKernelDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateKernel(updateKernelDialog.version)"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rollback Kernel Dialog -->
  <v-dialog v-model="rollbackKernelDialog" width="auto">
    <v-card max-width="600" prepend-icon="mdi-undo" :title="t('rollback kernel')" class="pa-0">
      <v-card-text>
        <p class="mb-4">{{ t('are you sure you want to rollback to the previous kernel version?') }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rollbackKernelDialog = false"></v-btn>
        <v-btn color="red" :text="t('ok')" @click="rollbackKernel()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Reboot Dialog -->
  <v-dialog v-model="rebootDialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to reboot your system?')" :title="t('reboot')" class="pa-0">
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rebootDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="rebootOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Shutdown Dialog -->
  <v-dialog v-model="shutdownDialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to shutdown your system?')" :title="t('shutdown')" class="pa-0">
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="shutdownDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="shutdownOS"></v-btn>
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
const rebootDialog = ref(false);
const shutdownDialog = ref(false);
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
      }
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

const rebootOS = async () => {
  rebootDialog.value = false;

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/system/power/reboot', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('reboot could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('reboot initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const shutdownOS = async () => {
  shutdownDialog.value = false;

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/system/power/shutdown', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('shutdown could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }
    
    showSnackbarSuccess(t('shutdown initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateAPI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_api', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update api could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update api initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateUI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_ui', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update ui could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update ui initiated successfully'));
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
