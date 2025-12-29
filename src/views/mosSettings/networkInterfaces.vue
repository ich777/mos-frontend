<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('network interfaces') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pb-0">
            <v-form>
              <v-row v-for="(iface, idx) in settingsNetwork.filter((i) => ['ethernet', 'bridged'].includes(i.type))" :key="idx">
                <v-col cols="12">
                  <v-text-field :label="$t('interface')" v-model="iface.name" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    :label="$t('type')"
                    v-model="iface.type"
                    :items="['ethernet', 'bridged', 'bond']"
                    item-title="type"
                    item-value="type"
                    dense
                    hide-details="auto"
                    @update:model-value="changeInterfaceType(iface)"
                  ></v-select>
                </v-col>
                <template v-if="iface.type === 'ethernet'">
                  <v-col v-if="iface.ipv4.length > 0" cols="12">
                    <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                  </v-col>
                  <template v-if="iface.ipv4.length > 0 && !iface.ipv4[0].dhcp">
                    <v-col cols="12" v-if="!iface.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address" hide-details="auto"></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!iface.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway" hide-details="auto"></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!iface.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv4').value" hide-details="auto"></v-text-field>
                    </v-col>
                  </template>
                  <v-col cols="12">
                    <v-switch
                      :label="$t('enable ipv6')"
                      color="green"
                      inset
                      density="compact"
                      hide-details="auto"
                      v-model="eth0IPv6Enabled"
                      @update:model-value="changeEthernetIPv6Enabled(eth0IPv6Enabled)"
                    ></v-switch>
                  </v-col>
                  <template v-if="eth0IPv6Enabled">
                    <v-col v-if="iface.ipv6.length > 0" cols="12">
                      <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                    </v-col>
                    <template v-if="iface.ipv6.length > 0 && !iface.ipv6[0].dhcp">
                      <v-col cols="12" v-if="!iface.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" v-if="!iface.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv6').value" hide-details="auto"></v-text-field>
                      </v-col>
                    </template>
                  </template>
                </template>
                <template v-else-if="iface.type === 'bridged'" v-for="(bridge, idx) in settingsNetwork.filter((i) => ['bridge'].includes(i.type))" :key="idx">
                  <v-col cols="12">
                    <v-text-field :label="$t('bridge')" v-model="bridge.name" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col v-if="bridge.ipv4.length > 0" cols="12">
                    <v-switch :label="$t('ipv4 dhcp')" v-model="bridge.ipv4[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                  </v-col>
                  <template v-if="bridge.ipv4.length > 0 && !bridge.ipv4[0].dhcp">
                    <v-col cols="12" v-if="!bridge.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 address')" v-model="bridge.ipv4[0].address" hide-details="auto"></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!bridge.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 gateway')" v-model="bridge.ipv4[0].gateway" hide-details="auto"></v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!bridge.ipv4[0].dhcp">
                      <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(bridge, 'ipv4').value" hide-details="auto"></v-text-field>
                    </v-col>
                  </template>
                  <v-col cols="12">
                    <v-switch
                      :label="$t('enable ipv6')"
                      color="green"
                      hide-details="auto"
                      inset
                      density="compact"
                      v-model="br0IPv6Enabled"
                      @update:model-value="changeBridgeIPv6Enabled(br0IPv6Enabled)"
                    ></v-switch>
                  </v-col>
                  <template v-if="br0IPv6Enabled">
                    <v-col v-if="bridge.ipv6.length > 0" cols="12">
                      <v-switch :label="$t('ipv6 dhcp')" v-model="bridge.ipv6[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                    </v-col>
                    <template v-if="bridge.ipv6.length > 0 && !bridge.ipv6[0].dhcp">
                      <v-col cols="12" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 address')" v-model="bridge.ipv6[0].address" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 gateway')" v-model="bridge.ipv6[0].gateway" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" v-if="!bridge.ipv6[0].dhcp">
                        <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(bridge, 'ipv6').value" hide-details="auto"></v-text-field>
                      </v-col>
                    </template>
                  </template>
                </template>
              </v-row>
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
const settingsNetwork = ref([
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
]);
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
    const res = await fetch('/api/v1/mos/settings/network/interfaces', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsNetwork.value = await res.json();
    if (settingsNetwork.value[0].ipv6.length > 0) {
      eth0IPv6Enabled.value = true;
    }
    const bridge = settingsNetwork.value.find((iface) => iface.type === 'bridge');
    if (bridge) {
      if (bridge.ipv6.length > 0) {
        br0IPv6Enabled.value = true;
      }
    }
    if (settingsNetwork.value[0].ipv4.length === 0) settingsNetwork.value[0].ipv4 = [{ dhcp: false, address: null, gateway: null, dns: [] }];
    if (settingsNetwork.value[0].ipv6.length === 0) settingsNetwork.value[0].ipv6 = [{ dhcp: false, address: null, gateway: null, dns: [] }];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setNetworkSettings = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network/interfaces', {
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
  const hasBridge = settingsNetwork.value.some((i) => i.type === 'bridge');
  const bridgeName = 'br' + iface.name.slice(3);
  if (!hasBridge) {
    settingsNetwork.value.push({
      name: bridgeName,
      type: 'bridge',
      mode: null,
      ipv4: [
        {
          dhcp: true,
          address: null,
          gateway: null,
          dns: [],
        },
      ],
      ipv6: [],
      interfaces: [iface.name],
    });
  }
};
const changeBridgeIPv6Enabled = (enabled) => {
  const bridge = settingsNetwork.value.find((iface) => iface.type === 'bridge');
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
  const eth0 = settingsNetwork.value.find((iface) => iface.name === 'eth0');
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
    eth0.ipv6 = [];
  }
};
</script>
