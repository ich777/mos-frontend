<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2 @click="showSpecialActions++">{{ $t('tools') }}</h2>
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

          <!-- Tools -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-tools</v-icon>
                {{ $t('tools') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded to="/mosTools/webterminal">
                  <v-icon start>mdi-powershell</v-icon>
                  {{ $t('webterminal') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosTools/filebrowser">
                  <v-icon start>mdi-folder</v-icon>
                  {{ $t('filebrowser') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Special Actions Card -->
          <v-col v-if="showSpecialActions >= 3" cols="12" md="6" lg="4" xl="3" class="pb-0">
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

  <!-- Reboot Dialog -->
  <v-dialog v-model="rebootDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to reboot your system?')" :title="t('reboot')" class="pa-0">
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rebootDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="rebootOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Shutdown Dialog -->
  <v-dialog v-model="shutdownDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to shutdown your system?')" :title="t('shutdown')" class="pa-0">
      <v-divider />
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const rebootDialog = ref(false);
const shutdownDialog = ref(false);
const { t } = useI18n();
const showSpecialActions = ref(0);
const overlay = ref(false);

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

</script>
