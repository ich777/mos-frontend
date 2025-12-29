<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('lxc service') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader :loading="lxcServiceLoading" type="card" class="w-100">
          <v-card fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text>
              <v-form>
                <v-switch :label="$t('lxc service')" color="green" inset density="compact" v-model="settingsLXC.enabled"></v-switch>
                <v-switch :label="$t('bridge')" color="green" inset density="compact" v-model="settingsLXC.bridge"></v-switch>
                <v-text-field
                  :label="$t('directory')"
                  v-model="settingsLXC.directory"
                  append-inner-icon="mdi-folder"
                  @click:append-inner="
                    openFsDialog((item) => {
                      settingsLXC.directory = item.path;
                    })
                  "
                ></v-text-field>
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
  <v-fab @click="setLXCService()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
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
const settingsLXC = ref({
  enabled: false,
  bridge: '',
  directory: '',
});
const overlay = ref(false);
const { t } = useI18n();
const lxcServiceLoading = ref(true);

onMounted(() => {
  getLXCService();
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

const getLXCService = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/lxc', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('lxc service could not be loaded'));
    settingsLXC.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    lxcServiceLoading.value = false;
  }
};

const setLXCService = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/lxc', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsLXC.value),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc service could not be changed'));
    showSnackbarSuccess(t('lxc service changed successfully'));
    emit('refresh-drawer');
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};
</script>
