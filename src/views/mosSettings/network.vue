<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('network services') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card variant="tonal">
          <v-card-text>
            <v-form>
              <h3 class="mb-2 pb-4">{{ $t('interfaces') }}</h3>
              <v-row v-for="(iface, idx) in settingsNetwork.interfaces" :key="idx">
                <v-col cols="12" class="pt-0 pb-0">
                  <v-text-field :label="$t('interface')" v-model="iface.name"></v-text-field>
                </v-col>
                <v-col cols="12" class="pt-0 pb-0">
                  <v-text-field :label="$t('type')" v-model="iface.type"></v-text-field>
                </v-col>
                <v-col cols="12" class="pt-0 pb-0">
                  <v-text-field
                    :label="$t('sub-interfaces (comma separated)')"
                    :value="iface.interfaces && iface.interfaces.length ? iface.interfaces.join(', ') : ''"
                    @change="iface.interfaces = $event.target.value ? $event.target.value.split(',').map((i) => i.trim()) : []"
                  ></v-text-field>
                </v-col>
                <v-col v-if="iface.ipv4.length > 0" cols="12" class="pt-0 pb-0">
                  <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="primary"></v-switch>
                </v-col>
                <template v-if="iface.ipv4.length > 0 && !iface.ipv4[0].dhcp">
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                    <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                    <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                    <v-text-field
                      :label="$t('ipv4 dns (comma separated)')"
                      :value="iface.ipv4[0].dns && iface.ipv4[0].dns.length ? iface.ipv4[0].dns.join(', ') : ''"
                      @change="iface.ipv4[0].dns = $event.target.value ? $event.target.value.split(',').map((ip) => ip.trim()) : []"
                    ></v-text-field>
                  </v-col>
                </template>
                <v-col  v-if="iface.ipv6.length > 0" cols="12" class="pt-0 pb-0">
                  <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="primary"></v-switch>
                </v-col>
                <template v-if="iface.ipv6.length > 0 &&!iface.ipv6[0].dhcp">
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv6[0].dhcp">
                    <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv6[0].dhcp">
                    <v-text-field :label="$t('ipv6 gateway')" v-model="iface.ipv6[0].gateway"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv6[0].dhcp">
                    <v-text-field
                      :label="$t('ipv6 dns (comma separated)')"
                      :value="iface.ipv6[0].dns && iface.ipv6[0].dns.length ? iface.ipv6[0].dns.join(', ') : ''"
                      @change="iface.ipv6[0].dns = $event.target.value ? $event.target.value.split(',').map((ip) => ip.trim()) : []"
                    ></v-text-field>
                  </v-col>
                </template>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('services') }}</h3>
              <v-switch :label="$t('ssh')" color="primary" inset density="compact" v-model="settingsNetwork.services.ssh.enabled"></v-switch>
              <v-switch :label="$t('samba')" color="primary" inset density="compact" v-model="settingsNetwork.services.samba.enabled"></v-switch>
              <v-switch :label="$t('nmbd')" color="primary" inset density="compact" v-model="settingsNetwork.services.nmbd.enabled"></v-switch>
              <v-switch :label="$t('nfs')" color="primary" inset density="compact" v-model="settingsNetwork.services.nfs.enabled"></v-switch>
              <v-switch :label="$t('nut')" color="primary" inset density="compact" v-model="settingsNetwork.services.nut.enabled"></v-switch>
              <v-switch :label="$t('remote mounting')" color="primary" inset density="compact" v-model="settingsNetwork.services.remote_mounting.enabled"></v-switch>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('tailscale') }}</h3>
              <v-switch :label="$t('tailscale')" color="primary" inset density="compact" v-model="settingsNetwork.services.tailscale.enabled"></v-switch>
              <v-switch :label="$t('tailscale update check')" color="primary" inset density="compact" v-model="settingsNetwork.services.tailscale.update_check"></v-switch>
              <v-text-field :label="$t('tailscale params')" v-model="settingsNetwork.services.tailscale.tailscaled_params"></v-text-field>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('netbird') }}</h3>
              <v-switch :label="$t('netbird')" color="primary" inset density="compact" v-model="settingsNetwork.services.netbird.enabled"></v-switch>
              <v-switch :label="$t('netbird update check')" color="primary" inset density="compact" v-model="settingsNetwork.services.netbird.update_check"></v-switch>
              <v-text-field :label="$t('netbird service params')" v-model="settingsNetwork.services.netbird.netbird_service_params"></v-text-field>
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
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const settingsNetwork = ref({
  interfaces: [
    {
      name: '',
      type: '',
      mode: null,
      ipv4: [
        {
          dhcp: false,
          address: null,
          gateway: null,
          dns: [],
        },
      ],
      ipv6: [
        {
          dhcp: false,
          address: null,
          gateway: null,
          dns: [],
        },
      ],
      interfaces: [],
    },
  ],
  services: {
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
    },
  },
});
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getNetworkSettings();
});

const getNetworkSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/network', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsNetwork.value = await res.json(); console.log(settingsNetwork.value);
    if (settingsNetwork.value.interfaces[0].ipv4.length === 0) settingsNetwork.value.interfaces[0].ipv4 = [{ dhcp: false, address: null, gateway: null, dns: [] }];
    if (settingsNetwork.value.interfaces[0].ipv6.length === 0) settingsNetwork.value.interfaces[0].ipv6 = [{ dhcp: false, address: null, gateway: null, dns: [] }];

  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setNetworkSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network', {
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
