<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('mos hub settings') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="mosHubLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-switch :label="$t('mos hub')" color="green" inset density="compact" v-model="settingsMosHub.enabled" hide-details="auto"></v-switch>
              <v-switch :label="$t('initial update')" color="green" inset density="compact" v-model="settingsMosHub.initial_update"></v-switch>
              <v-text-field :label="$t('update schedule')" v-model="settingsMosHub.schedule" hide-details="auto"></v-text-field>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="setMosHubSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
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
const settingsMosHub = ref({
  enabled: false,
  initial_update: false,
  schedule: '',
});
const overlay = ref(false);
const { t } = useI18n();
const mosHubLoading = ref(true);

onMounted(() => {
  getMosHubSettings();
});

const getMosHubSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/settings', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('mos hub settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    settingsMosHub.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    mosHubLoading.value = false;
  }
};

const setMosHubSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/hub/settings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsMosHub.value),
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('mos hub settings could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('mos hub settings changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};
</script>
