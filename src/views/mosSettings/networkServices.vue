<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('network services') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pl-0 pr-0">
          <v-card-text>
            <v-form>
              <v-switch :label="$t('ssh')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.ssh.enabled"></v-switch>
              <v-switch :label="$t('samba')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.samba.enabled"></v-switch>
              <v-switch :label="$t('nmbd')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nmbd.enabled"></v-switch>
              <v-switch :label="$t('nfs')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nfs.enabled"></v-switch>
              <v-switch :label="$t('nut')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nut.enabled"></v-switch>
              <v-switch :label="$t('remote mounting')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.remote_mounting.enabled"></v-switch>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('tailscale') }}</h3>
              <v-switch :label="$t('tailscale')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.tailscale.enabled"></v-switch>
              <v-switch :label="$t('tailscale update check')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.tailscale.update_check"></v-switch>
              <v-text-field class="mt-2" :label="$t('tailscale params')" hide-details="auto" v-model="settingsNetwork.tailscale.tailscaled_params"></v-text-field>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('netbird') }}</h3>
              <v-switch :label="$t('netbird')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.enabled"></v-switch>
              <v-switch :label="$t('netbird update check')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.update_check"></v-switch>
              <v-text-field class="mt-2" :label="$t('netbird service params')" hide-details="auto" v-model="settingsNetwork.netbird.netbird_service_params"></v-text-field>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="setNetworkSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const eth0IPv6Enabled = ref(false);
const br0IPv6Enabled = ref(false);
const settingsNetwork = ref({
    ssh: {
      enabled: false,
    },
    samba: {
      enabled: false,
    },
    nmbd: {
      enabled: false,
    },
    nfs: {
      enabled: false,
      exports: [],
    },
    nut: {
      enabled: false,
    },
    tailscale: {
      enabled: false,
      update_check: false,
      tailscaled_params: null,
    },
    netbird: {
      enabled: false,
      update_check: false,
      netbird_service_params: null,
    },
    remote_mounting: {
      enabled: false,
    }
});
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getNetworkSettings();
});

const getNetworkSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/network/services', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsNetwork.value = await res.json();

  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setNetworkSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network/services', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsNetwork.value),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('network settings changed successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

</script>
