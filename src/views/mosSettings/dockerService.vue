<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('docker service') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="dockerServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
                <v-switch :label="$t('docker service')" inset density="compact" v-model="settingsDocker.enabled" color="green"></v-switch>
                <v-text-field
                  v-model="settingsDocker.directory"
                  :label="$t('directory')"
                  append-inner-icon="mdi-folder"
                  @click:append-inner="
                    openFsDialog((item) => {
                      settingsDocker.directory = item.path;
                    })
                  "
                  required
                ></v-text-field>
                <v-text-field
                  v-model="settingsDocker.appdata"
                  :label="$t('appdata')"
                  append-inner-icon="mdi-folder"
                  @click:append-inner="
                    openFsDialog((item) => {
                      settingsDocker.appdata = item.path;
                    })
                  "
                  required
                ></v-text-field>
                <v-text-field v-model="settingsDocker.filesystem" :label="$t('filesystem')" required></v-text-field>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select v-model="settingsDocker.docker_net.mode" :items="['ipvlan', 'macvlan']" :label="$t('docker network mode')" dense hide-details="auto"></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-combobox v-model="settingsDocker.docker_net.config" :label="$t('docker start parameters')" multiple chips></v-combobox>
                  </v-col>
                </v-row>
                <v-text-field v-model.number="settingsDocker.start_wait" :label="$t('start wait')" type="number" min="0" hide-details="auto"></v-text-field>
                <v-divider class="my-4"></v-divider>
                <span class="text-subtitle-1 font-weight-medium">{{ $t('update schedule') }}</span>
                <v-row class="align-center">
                  <v-col cols="12" md="4">
                    <v-switch v-model="settingsDocker.update_check.enabled" :label="$t('update check')" inset color="green" hide-details></v-switch>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="settingsDocker.update_check.update_check_schedule"
                      :label="$t('update check schedule')"
                      :disabled="!settingsDocker.update_check.enabled"
                      dense
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row class="align-center">
                  <v-col cols="12" md="4">
                    <v-switch
                      v-model="settingsDocker.update_check.auto_update.enabled"
                      :label="$t('auto update')"
                      inset
                      density="compact"
                      :disabled="!settingsDocker.update_check.enabled"
                      color="green"
                      hide-details="auto"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="settingsDocker.update_check.auto_update.auto_update_schedule"
                      :label="$t('auto update schedule')"
                      :disabled="!settingsDocker.update_check.enabled || !settingsDocker.update_check.auto_update.enabled"
                      dense
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setDockerService()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
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
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const settingsDocker = ref({
  enabled: false,
  directory: '',
  appdata: '',
  docker_net: {
    mode: '',
    config: [],
  },
  filesystem: '',
  start_wait: 0,
  update_check: {
    enabled: false,
    update_check_schedule: '',
    auto_update: {
      enabled: false,
      auto_update_schedule: '',
    },
  },
});
const dockerServiceLoading = ref(true);
const overlay = ref(false);
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);

onMounted(() => {
  getDockerService();
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

const getDockerService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/docker', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('docker service could not be loaded'));
    settingsDocker.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    dockerServiceLoading.value = false;
  }
};

const setDockerService = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/docker', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsDocker.value),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker service could not be changed'));
    showSnackbarSuccess(t('docker service changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};
</script>
