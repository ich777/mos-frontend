<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ t('dashboard') }}</h2>
      </v-container>

      <div class="masonry-grid" style="margin-bottom: 80px">
        <!-- Left Column -->
        <draggable v-model="left" group="widgets" item-key="id" handle=".drag-handle" class="column" ghost-class="ghost" animation="150">
          <template #item="{ element }">
            <div class="card" v-if="widgetVisible(element.id)">
              <div class="card-head">
                <span class="drag-handle" aria-hidden>
                  <v-icon size="20">mdi-drag</v-icon>
                </span>
                <span>{{ labelFor(element.id) }}</span>
              </div>
              <component :is="components[element.id]" v-bind="widgetProps(element.id)" />
            </div>
          </template>
        </draggable>

        <!-- Right Column -->
        <draggable v-model="right" group="widgets" item-key="id" handle=".drag-handle" class="column" ghost-class="ghost" animation="150">
          <template #item="{ element }">
            <div class="card" v-if="widgetVisible(element.id)">
              <div class="card-head">
                <span class="drag-handle" aria-hidden>
                  <v-icon size="20">mdi-drag</v-icon>
                </span>
                <span>{{ labelFor(element.id) }}</span>
              </div>
              <component :is="components[element.id]" v-bind="widgetProps(element.id)" />
            </div>
          </template>
        </draggable>
      </div>
    </v-container>
  </v-container>

  <!-- Settings Dialog -->
  <v-dialog v-model="settingsDialog" max-width="460">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ t('visibility') }}</v-card-title>
      <v-card-text>
        <v-row class="pa-0">
          <v-col cols="12" v-for="name in ALL_WIDGETS" :key="name" class="pa-0 my-1">
            <v-checkbox hide-details="auto" :label="labelFor(name)" v-model="visibility[name]" :true-value="true" :false-value="false" density="compact" class="pa-0 ma-0" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" text @click="settingsDialog = false">{{ t('close') || 'Close' }}</v-btn>
        <v-btn
          color="onPrimary"
          @click="
            saveLayout();
            settingsDialog = false;
          "
        >
          {{ t('save') || 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="settingsDialog = true" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-tune</v-icon>
  </v-fab>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { io } from 'socket.io-client';
import draggable from 'vuedraggable';
import Processor from '../components/cards/processor.vue';
import Memory from '../components/cards/memory.vue';
import OS from '../components/cards/os.vue';
import Network from '../components/cards/network.vue';
import Pools from '../components/cards/pools.vue';
import Disks from '../components/cards/disks.vue';
import Fan from '../components/cards/fan.vue';
import Temperature from '../components/cards/temperature.vue';
import Power from '../components/cards/power.vue';
import Voltage from '../components/cards/voltage.vue';
import PSU from '../components/cards/psu.vue';
import Other from '../components/cards/other.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const components = {
  os: OS,
  processor: Processor,
  pools: Pools,
  network: Network,
  memory: Memory,
  disks: Disks,
  fan: Fan,
  temperature: Temperature,
  power: Power,
  voltage: Voltage,
  psu: PSU,
  other: Other,
};

const cpu = ref(null);
const network = ref(null);
const memory = ref(null);
const pools = ref(null);
const disks = ref(null);
const temperature = ref(null);
const osInfo = ref(null);
const sensors = ref(null);
const isConnected = ref({});
const error = ref(null);
const left = ref([]);
const right = ref([]);
const ALL_WIDGETS = ['os', 'processor', 'pools', 'network', 'memory', 'disks', 'fan', 'temperature', 'power', 'voltage', 'psu', 'other'];
const DEFAULT_LEFT = [
  { id: 'os', name: 'OS' },
  { id: 'processor', name: 'Processor' },
  { id: 'pools', name: 'Pools' },
  { id: 'fan', name: 'Fan' },
  { id: 'voltage', name: 'Voltage' },
  { id: 'psu', name: 'PSU' },
];
const DEFAULT_RIGHT = [
  { id: 'network', name: 'Network' },
  { id: 'memory', name: 'Memory' },
  { id: 'disks', name: 'Disks' },
  { id: 'temperature', name: 'Temperature' },
  { id: 'power', name: 'Power' },
  { id: 'other', name: 'Other' },
];
const DEFAULT_VISIBILITY = {
  os: true,
  processor: true,
  pools: true,
  network: true,
  memory: true,
  disks: true,
  fan: false,
  temperature: false,
  power: false,
  voltage: false,
  psu: false,
  other: false,
};
const nameKeyMap = {
  OS: 'os',
  Processor: 'processor',
  Pools: 'pools',
  Network: 'network',
  Memory: 'memory',
  Disks: 'disks',
  Fan: 'fan',
  Temperature: 'temperature',
  Power: 'power',
  Voltage: 'voltage',
  PSU: 'psu',
  Other: 'other',
};
const settingsDialog = ref(false);
const visibility = ref({
  os: true,
  processor: true,
  pools: true,
  network: true,
  memory: true,
  disks: true,
  fan: false,
  temperature: false,
  power: false,
  voltage: false,
  psu: false,
  other: false,
});
let socket = null;

onMounted(() => {
  loadLayout();
  getData();
  getLoadWS();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

const labelFor = (x) => {
  const key = nameKeyMap?.[x] || String(x || '').toLowerCase();
  return t(key);
};

const getDashboard = async () => {
  try {
    const res = await fetch(`/api/v1/mos/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('dashboard could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    return await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
  }
};

const setDashboard = async (dashboard) => {
  try {
    const res = await fetch(`/api/v1/mos/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(dashboard),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('dashboard could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
  }
};

const loadLayout = async () => {
  const toId = (item) => {
    const rawId = item?.id;
    if (typeof rawId === 'string' && rawId.trim()) return rawId.trim().toLowerCase();
    const rawName = item?.name;
    if (typeof rawName === 'string' && rawName.trim()) {
      const n = rawName.trim();
      return nameKeyMap[n] || n.toLowerCase();
    }
    return null;
  };

  const makeItem = (id) => ({ id, name: id });

  try {
    const saved = await getDashboard();
    const normalizeVisibility = (v) => {
      const out = { ...DEFAULT_VISIBILITY };
      if (v && typeof v === 'object') {
        for (const k of ALL_WIDGETS) {
          if (v[k] !== undefined) out[k] = !!v[k];
        }

        for (const [oldName, id] of Object.entries(nameKeyMap)) {
          if (v[oldName] !== undefined) out[id] = !!v[oldName];
        }
      }
      return out;
    };
    const normalizeSide = (arr) => {
      const seen = new Set();
      const out = [];
      if (Array.isArray(arr)) {
        for (const it of arr) {
          const id = toId(it);
          if (!id) continue;
          if (!ALL_WIDGETS.includes(id)) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          out.push(makeItem(id));
        }
      }
      return { out, seen };
    };
    if (!saved || typeof saved !== 'object') throw new Error('no saved');
    const leftRes = normalizeSide(saved.left);
    const rightRes = normalizeSide(saved.right);
    const seenAll = new Set([...leftRes.seen, ...rightRes.seen]);
    const normLeft = leftRes.out;
    const normRight = rightRes.out;
    const missing = ALL_WIDGETS.filter((id) => !seenAll.has(id));
    for (const id of missing) {
      if (normLeft.length <= normRight.length) normLeft.push(makeItem(id));
      else normRight.push(makeItem(id));
    }
    left.value = normLeft.length ? normLeft : DEFAULT_LEFT.map(({ id }) => makeItem(id));
    right.value = normRight.length ? normRight : DEFAULT_RIGHT.map(({ id }) => makeItem(id));
    visibility.value = normalizeVisibility(saved.visibility);
  } catch (e) {
    left.value = DEFAULT_LEFT.map(({ id }) => ({ id, name: id }));
    right.value = DEFAULT_RIGHT.map(({ id }) => ({ id, name: id }));
    visibility.value = { ...DEFAULT_VISIBILITY };
  }
};

const saveLayout = async () => {
  setDashboard({
    left: left.value.map(({ id, name }) => ({ id, name })),
    right: right.value.map(({ id, name }) => ({ id, name })),
    visibility: visibility.value,
  });
};

watch([left, right, visibility], saveLayout, { deep: true });

const widgetProps = (id) => {
  switch (id) {
    case 'processor':
      return { cpu: cpu.value, temperature: temperature.value, osInfo: osInfo.value };
    case 'network':
      return { network: network.value };
    case 'memory':
      return { memory: memory.value };
    case 'disks':
      return { disks: disks.value };
    case 'pools':
      return { pools: pools.value };
    case 'os':
      return { osInfo: osInfo.value };
    case 'fan':
      return { sensors: sensors.value };
    case 'temperature':
      return { sensors: sensors.value };
    case 'power':
      return { sensors: sensors.value };
    case 'voltage':
      return { sensors: sensors.value };
    case 'psu':
      return { sensors: sensors.value };
    case 'other':
      return { sensors: sensors.value };
    default:
      return {};
  }
};

const widgetVisible = (id) => {
  if (visibility.value && visibility.value[id] === false) return false;
  if (id === 'os') return !!visibility.value?.os;
  if (id === 'processor') return !!visibility.value?.processor;
  if (id === 'network') return !!visibility.value?.network;
  if (id === 'memory') return !!visibility.value?.memory;
  if (id === 'pools') return !!visibility.value?.pools;
  if (id === 'disks') return !!visibility.value?.disks;
  if (id === 'fan') return !!visibility.value?.fan;
  if (id === 'temperature') return !!visibility.value?.temperature && !!temperature.value;
  if (id === 'power') return !!visibility.value?.power;
  if (id === 'voltage') return !!visibility.value?.voltage;
  if (id === 'psu') return !!visibility.value?.psu;
  if (id === 'other') return !!visibility.value?.other;
  return !!visibility.value?.[id];
};

const getData = async () => {
  try {
    const auth = localStorage.getItem('authToken');
    const [res, resPools, resOs] = await Promise.all([
      fetch('/api/v1/system/load', {
        headers: { Authorization: 'Bearer ' + auth },
      }),
      fetch('/api/v1/pools', {
        headers: { Authorization: 'Bearer ' + auth },
      }),
      fetch('/api/v1/mos/osinfo', {
        headers: { Authorization: 'Bearer ' + auth },
      }),
    ]);
    const resSensors = await fetch('/api/v1/mos/sensors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    network.value = result.network;
    cpu.value = result.cpu;
    memory.value = result.memory;
    temperature.value = result.temperature;

    if (!resPools.ok) throw new Error('API-Error');
    pools.value = await resPools.json();

    if (!resOs.ok) throw new Error('API-Error');
    osInfo.value = await resOs.json();

    if (!resSensors.ok) throw new Error('API-Error');
    sensors.value = await resSensors.json();
  } catch (e) {
    error.value = e.message;
  } finally {
  }
};

const getLoadWS = () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    error.value = 'No auth token found';
    return;
  }

  socket = io('/system', { path: '/api/v1/socket.io/', transports: ['websocket'], upgrade: false });

  socket.on('connect', () => {
    isConnected.value = true;
    error.value = null;
    socket.emit('subscribe-load', { token: authToken });
  });

  socket.on('connect_error', (err) => {
    error.value = `Connection error: ${err.message}`;
    isConnected.value = false;
  });
  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  const apply = (data) => {
    if (data.cpu) cpu.value = data.cpu;
    if (data.memory) memory.value = data.memory;
    if (data.network) network.value = data.network;
    if (data.temperature) temperature.value = data.temperature;
    if (data.pools) disks.value = data.pools;
    if (data.sensors) sensors.value = data.sensors;
  };
  socket.on('get-load', apply);
  socket.on('load-update', apply);
  socket.on('error', (err) => {
    error.value = `Socket error: ${err}`;
  });
};
</script>

<style scoped>
.masonry-grid {
  display: flex;
  gap: 16px;
}
.column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.card {
  background: rgb(var(--v-theme-background));
  border-radius: 12px;
  padding: 8px 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 15%, transparent);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 6px;
}
.drag-handle {
  cursor: grab;
  user-select: none;
}

.ghost {
  opacity: 0.5;
  transform: scale(0.98);
}

@supports not (color: color-mix(in srgb, #000 50%, #fff)) {
  .card {
    border-color: rgba(0, 0, 0, 0.15);
  }
  :global(.v-theme--dark) .card {
    border-color: rgba(255, 255, 255, 0.28);
  }
}

@media (max-width: 800px) {
  .masonry-grid {
    flex-direction: column;
  }
}
</style>
