<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('sensor settings') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="sensorsLoading" type="card" class="w-100">
          <v-card class="w-100">
            <v-card-text>
              <v-form>

            </v-form>
            </v-card-text>
          </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="setSensorsSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
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
const settingsSensors = ref({
  enabled: false,
});
const overlay = ref(false);
const { t } = useI18n();
const sensorsLoading = ref(true);

onMounted(() => {
  getSensorsSettings();
});

const getSensorsSettings = async () => {
  try {

  } catch (error) {
    showSnackbarError(t('failed to load sensor settings'));
  } finally {
    sensorsLoading.value = false;
  }
};

const setSensorsSettings = async () => {
  try {
    overlay.value = true;

    showSnackbarSuccess(t('sensor settings saved successfully'));
  } catch (error) {
    showSnackbarError(t('failed to save sensor settings'));
  } finally {
    overlay.value = false;
  }
};

</script>