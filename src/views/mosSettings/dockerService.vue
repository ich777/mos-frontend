<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('docker service') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card  >
          <v-card-text>
            <v-form>
              <v-switch :label="$t('docker service')" inset density="compact" v-model="settingsDocker.enabled" color="green"></v-switch>
              <v-text-field v-model="settingsDocker.directory" :label="$t('directory')" required></v-text-field>
              <v-text-field v-model="settingsDocker.appdata" :label="$t('appdata')" required></v-text-field>
              <v-text-field v-model="settingsDocker.filesystem" :label="$t('filesystem')" required></v-text-field>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="settingsDocker.docker_net.mode" :items="['bridge', 'host', 'none']" :label="$t('docker network mode')" dense></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox v-model="settingsDocker.docker_net.config" :label="$t('docker network config')" multiple chips dense></v-combobox>
                </v-col>
              </v-row>
              <v-text-field v-model.number="settingsDocker.start_wait" :label="$t('start wait')" type="number" min="0" dense></v-text-field>
              <v-divider class="my-2"></v-divider>
              <v-row class="align-center">
                <v-col cols="12" md="4">
                  <v-switch v-model="settingsDocker.update_check.enabled" :label="$t('update check')" inset density="compact" color="green"></v-switch>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field v-model="settingsDocker.update_check.update_check_schedule" :label="$t('update check schedule')" :disabled="!settingsDocker.update_check.enabled" dense></v-text-field>
                </v-col>
              </v-row>
              <v-row class="align-center">
                <v-col cols="12" md="4">
                  <v-switch v-model="settingsDocker.update_check.auto_update.enabled" :label="$t('auto update')" inset density="compact" :disabled="!settingsDocker.update_check.enabled" color="green"></v-switch>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="settingsDocker.update_check.auto_update.auto_update_schedule"
                    :label="$t('auto update schedule')"
                    :disabled="!settingsDocker.update_check.enabled || !settingsDocker.update_check.auto_update.enabled"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

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
const overlay = ref(false);
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer']);

onMounted(() => {
  getDockerService();
});

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
