<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('settings') }}</h2>
      </v-container>
      <v-container fluid>
        <v-row>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn color="primary" width="250px" @click="updateOsDialog.value = true">
              {{ $t('update system') }}
            </v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn color="primary" width="250px" @click="rebootDialog = true">{{
              $t('reboot') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn color="primary" width="250px" @click="shutdownDialog = true">{{
              $t('shutdown') }}</v-btn>
          </v-col>
        </v-row>
        <v-divider class="mb-4 mt-4"></v-divider>
        <v-row>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/docker">{{ $t('docker service') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/lxc">{{ $t('lxc service') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/vm">{{ $t('vm service') }}</v-btn>
          </v-col>
        </v-row>
        <v-divider class="mb-4 mt-4"></v-divider>
        <v-row>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/network">{{ $t('network') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/system">{{ $t('system') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" to="/mosSettings/cron">{{ $t('cron jobs') }}</v-btn>
          </v-col>
        </v-row>
        <v-divider class="mb-4 mt-4"></v-divider>
        <v-row>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" @click="updateAPI()">{{ $t('update api') }}</v-btn>
          </v-col>
          <v-col xl="2" l="2" md="3" sm="6" xs="12" class="d-flex justify-center">
            <v-btn width="250px" @click="updateUI()">{{ $t('update ui') }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="updateOsDialog.value" width="auto">
    <v-card max-width="600" prepend-icon="mdi-update":title="t('update firmware')">
      <v-card-text>
        <p class="mb-4">{{ t('please select your target firmware!') }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos version') }}:</b> {{ osInfo.mos.version }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos channel') }}:</b> {{ osInfo.mos.channel }}</p>
        <p v-if="osInfo && osInfo.mos" class="mb-4"><b>{{ $t('mos kernel') }}:</b> {{ osInfo.mos.running_kernel }}</p>
        <v-select v-model="updateOsDialog.channel" :items="getMosChannels()" :label="t('channel')"></v-select>
        <v-select v-model="updateOsDialog.release" :items="getMosReleasesOfChannel()" :label="t('release')"></v-select>
        <v-switch v-model="updateOsDialog.update_kernel" :label="t('update kernel')" inset density="compact"
          color="primary" />
      </v-card-text>
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('cancel')" @click="updateOsDialog.value = false"></v-btn>
        <v-btn class="ms-auto" :text="t('ok')" @click="updateOS"></v-btn>
      </template>
    </v-card>
  </v-dialog>

  <v-dialog v-model="rebootDialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to reboot your system?')"
      :title="t('reboot')">
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('cancel')" @click="rebootDialog = false"></v-btn>
        <v-btn class="ms-auto" :text="t('ok')" @click="rebootOS"></v-btn>
      </template>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shutdownDialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to shutdown your system?')"
      :title="t('shutdown')">
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('cancel')" @click="shutdownDialog = false"></v-btn>
        <v-btn class="ms-auto" :text="t('ok')" @click="shutdownOS"></v-btn>
      </template>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>

</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const mosReleases = ref({});
const updateOsDialog = reactive({
  value: false,
  channel: null,
  release: null,
  update_kernel: true
});
const rebootDialog = ref(false);
const shutdownDialog = ref(false);
const osInfo = ref({});
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getMosReleases();
  getOsInfo();
});

const getMosReleases = async () => {
  try {
    const res = await fetch('/api/v1/mos/getreleases', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error(t('failed to fetch releases'));
    const data = await res.json();
    mosReleases.value = data;

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    osInfo.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
}

const getMosChannels = () => {
  return Object.keys(mosReleases.value);
};

const getMosReleasesOfChannel = () => {
  if (!updateOsDialog.channel) return [];

  const releases = mosReleases.value[updateOsDialog.channel] || [];
  const tags = releases.map(item => item.tag_name);
  if (releases.length > 0) {
    tags.unshift('latest');
  }
  return tags;
};

const updateOS = async () => {

  updateOsDialog.value = false;
  const updateBody = {
    version: updateOsDialog.release,
    channel: updateOsDialog.channel,
    update_kernel: updateOsDialog.update_kernel
  }

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/updateos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('update could not be initiated'));
    const result = await res.json();
    clearUpdateOsDialog();
    showSnackbarSuccess(t('update initiated successfully'));

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const rebootOS = async () => {
  rebootDialog.value = false;

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/system/power/reboot', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    overlay.value = false;

    if (!res.ok) throw new Error(t('reboot could not be initiated'));
    showSnackbarSuccess(t('reboot initiated successfully'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const shutdownOS = async () => {
  shutdownDialog.value = false;

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/system/power/shutdown', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    overlay.value = false;

    if (!res.ok) throw new Error(t('shutdown could not be initiated'));
    showSnackbarSuccess(t('shutdown initiated successfully'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const updateAPI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_api', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error(t('update api could not be initiated'));
    showSnackbarSuccess(t('update api initiated successfully'));
  } catch (e) {
    showSnackbarError(e.message);
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
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error(t('update ui could not be initiated'));
    showSnackbarSuccess(t('update ui initiated successfully'));
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const clearUpdateOsDialog = () => {
  updateOsDialog.value = false;
  updateOsDialog.release = null;
  updateOsDialog.channel = null;
  updateOsDialog.update_kernel = true;
};

</script>