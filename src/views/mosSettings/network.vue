<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('network services') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card>
          <v-card-text>
            <v-form>
              <h3 class="mb-2 pb-4">{{ $t('interfaces') }}</h3>
              <v-row v-for="(iface, idx) in settingsNetwork.interfaces.filter((i) => ['ethernet', 'bridged'].includes(i.type))" :key="idx">
                <v-col cols="12" class="pt-0 pb-0">
                  <v-text-field :label="$t('interface')" v-model="iface.name"></v-text-field>
                </v-col>
                <v-col cols="12" class="pt-0 pb-0">
                  <v-select
                    :label="$t('type')"
                    v-model="iface.type"
                    :items="['ethernet', 'bridged', 'bond']"
                    item-title="type"
                    item-value="type"
                    dense
                    @update:model-value="changeInterfaceType(iface)"
                  ></v-select>
                </v-col>
                <template v-if="iface.type === 'ethernet'">
                    <v-col v-if="iface.ipv4.length > 0" cols="12" class="pt-0 pb-0">
                      <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="green"></v-switch>
                    </v-col>
                    <template v-if="iface.ipv4.length > 0 && !iface.ipv4[0].dhcp">
                      <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv4').value"></v-text-field>
                      </v-col>
                    </template>
                  <v-col cols="12" class="pt-0 pb-0">
                    <v-switch :label="$t('enable ipv6')" color="green" inset density="compact" v-model="eth0IPv6Enabled" @update:model-value="changeEthernetIPv6Enabled(eth0IPv6Enabled)"></v-switch>
                  </v-col>
                  <template v-if="eth0IPv6Enabled">
                    <v-col v-if="iface.ipv6.length > 0" cols="12" class="pt-0 pb-0">
                      <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="green"></v-switch>
                    </v-col>
                    <template v-if="iface.ipv6.length > 0 && !iface.ipv6[0].dhcp">
                      <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!iface.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv6').value"></v-text-field>
                      </v-col>
                    </template>
                  </template>
                </template>
                <template v-else-if="iface.type === 'bridged'" v-for="(bridge, idx) in settingsNetwork.interfaces.filter((i) => ['bridge'].includes(i.type))" :key="idx">
                  <v-col cols="12" class="pt-0 pb-0">
                    <v-text-field :label="$t('bridge')" v-model="bridge.name"></v-text-field>
                  </v-col>
                    <v-col v-if="bridge.ipv4.length > 0" cols="12" class="pt-0 pb-0">
                      <v-switch :label="$t('ipv4 dhcp')" v-model="bridge.ipv4[0].dhcp" inset density="compact" color="green"></v-switch>
                    </v-col>
                    <template v-if="bridge.ipv4.length > 0 && !bridge.ipv4[0].dhcp">
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 address')" v-model="bridge.ipv4[0].address"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 gateway')" v-model="bridge.ipv4[0].gateway"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv4[0].dhcp">
                        <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(bridge, 'ipv4').value"></v-text-field>
                      </v-col>
                  </template>
                  <v-col cols="12" class="pt-0 pb-0">
                    <v-switch :label="$t('enable ipv6')" color="green" inset density="compact" v-model="br0IPv6Enabled" @update:model-value="changeBridgeIPv6Enabled(br0IPv6Enabled)"></v-switch>
                  </v-col>
                  <template v-if="br0IPv6Enabled">
                    <v-col v-if="bridge.ipv6.length > 0" cols="12" class="pt-0 pb-0">
                      <v-switch :label="$t('ipv6 dhcp')" v-model="bridge.ipv6[0].dhcp" inset density="compact" color="green"></v-switch>
                    </v-col>
                    <template v-if="bridge.ipv6.length > 0 && !bridge.ipv6[0].dhcp">
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 address')" v-model="bridge.ipv6[0].address"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 gateway')" v-model="bridge.ipv6[0].gateway"></v-text-field>
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(bridge, 'ipv6').value"></v-text-field>
                      </v-col>
                    </template>
                  </template>
                </template>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('services') }}</h3>
              <v-switch :label="$t('ssh')" color="green" inset density="compact" v-model="settingsNetwork.services.ssh.enabled"></v-switch>
              <v-switch :label="$t('samba')" color="green" inset density="compact" v-model="settingsNetwork.services.samba.enabled"></v-switch>
              <v-switch :label="$t('nmbd')" color="green" inset density="compact" v-model="settingsNetwork.services.nmbd.enabled"></v-switch>
              <v-switch :label="$t('nfs')" color="green" inset density="compact" v-model="settingsNetwork.services.nfs.enabled"></v-switch>
              <v-switch :label="$t('nut')" color="green" inset density="compact" v-model="settingsNetwork.services.nut.enabled"></v-switch>
              <v-switch :label="$t('remote mounting')" color="green" inset density="compact" v-model="settingsNetwork.services.remote_mounting.enabled"></v-switch>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('tailscale') }}</h3>
              <v-switch :label="$t('tailscale')" color="green" inset density="compact" v-model="settingsNetwork.services.tailscale.enabled"></v-switch>
              <v-switch :label="$t('tailscale update check')" color="green" inset density="compact" v-model="settingsNetwork.services.tailscale.update_check"></v-switch>
              <v-text-field :label="$t('tailscale params')" v-model="settingsNetwork.services.tailscale.tailscaled_params"></v-text-field>
              <v-divider class="my-2"></v-divider>
              <h3 class="mb-2">{{ $t('netbird') }}</h3>
              <v-switch :label="$t('netbird')" color="green" inset density="compact" v-model="settingsNetwork.services.netbird.enabled"></v-switch>
              <v-switch :label="$t('netbird update check')" color="green" inset density="compact" v-model="settingsNetwork.services.netbird.update_check"></v-switch>
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
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { tr } from 'vuetify/locale';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const eth0IPv6Enabled = ref(false);
const br0IPv6Enabled = ref(false);
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

const getIfaceIpDnsString = (iface, type) => {
  return computed({
    get() {
      return iface[type][0].dns && iface[type][0].dns.length ? iface[type][0].dns.join(', ') : '';
    },
    set(val) {
      iface[type][0].dns = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    },
  });
};

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

    settingsNetwork.value = await res.json();
    if (settingsNetwork.value.interfaces[0].ipv6.length > 0) {
      eth0IPv6Enabled.value = true;
    }
    const bridge = settingsNetwork.value.interfaces.find((iface) => iface.type === 'bridge');
    if (bridge) {
      if (bridge.ipv6.length > 0) {
        br0IPv6Enabled.value = true;
      }
    }
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

const changeInterfaceType = (iface) => {
  const hasBridge = settingsNetwork.value.interfaces.some((iface) => iface.type === 'bridge');
  const bridgeName = 'br' + iface.name.slice(3);
  if (!hasBridge) {
    settingsNetwork.value.interfaces.push({
      name: bridgeName,
      type: 'bridge',
      mode: null,
      ipv4: [ {
        dhcp: true,
        address: null,
        gateway: null,
        dns: [],
      } ],
      ipv6: [],
      interfaces: [iface.name],
    });
  }
};

const changeBridgeIPv6Enabled = (enabled) => {
  const bridge = settingsNetwork.value.interfaces.find((iface) => iface.type === 'bridge');
  if (enabled) {
    if (bridge.ipv6.length === 0) {
      bridge.ipv6.push({
        dhcp: true,
        address: null,
        gateway: null,
        dns: [],
      });
    }
  } else {
    bridge.ipv6 = [];
  }
};

const changeEthernetIPv6Enabled = (enabled) => {
  const eth0 = settingsNetwork.value.interfaces.find((iface) => iface.name === 'eth0');
  if (enabled) {
    if (eth0.ipv6.length === 0) {
      eth0.ipv6.push({
        dhcp: true,
        address: null,
        gateway: null,
        dns: [],
      });
    }
  } else {
    bridge.ipv6 = [];
  }
};

</script>
