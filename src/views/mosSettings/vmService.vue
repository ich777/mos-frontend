<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('vm service') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="vmServiceLoading" type="card" class="w-100">
        <v-card class="w-100">
          <v-card-text>
            <v-form>
              <v-switch :label="$t('enabled')" color="onPrimary" inset density="compact" v-model="vmSettings.enabled">
              </v-switch>
              <v-text-field :label="$t('directory')" v-model="vmSettings.directory" append-inner-icon="mdi-folder" @click:append-inner="openFsDialog((item) => { vmSettings.directory = item.path })"></v-text-field>
              <v-text-field :label="$t('vdisk directory')" v-model="vmSettings.vdisk_directory" append-inner-icon="mdi-folder" @click:append-inner="openFsDialog((item) => { vmSettings.vdisk_directory = item.path })"></v-text-field>
            </v-form>
          </v-card-text>
        </v-card>
        </v-skeleton-loader>
      </v-container>
    </v-container>
  </v-container>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" @selected="handleFsSelected" />

  <!-- Floating Action Button -->
  <v-fab @click="setVMService()" color="primary"
    style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
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
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const vmSettings = ref({
  enabled: false,
  directory: '',
  vdisk_directory: ''
});
const { t } = useI18n();
const overlay = ref(false);
const vmServiceLoading = ref(true);

onMounted(() => {
  getVMService();
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

const getVMService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/vm', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('vm service could not be loaded'));
    vmSettings.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    vmServiceLoading.value = false;
  }
};

const setVMService = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/vm', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vmSettings.value)
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('vm service could not be changed'));
    showSnackbarSuccess(t('vm service changed successfully'));
    emit('refresh-drawer');

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

</script>