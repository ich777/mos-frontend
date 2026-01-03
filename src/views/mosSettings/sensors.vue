<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('sensors') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
          <v-skeleton-loader v-if="sensorsLoading" type="card" />
          <v-card v-else class="pa-4 mb-4">
            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="searchQuery"
                                :label="$t('search')"
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                hide-details
                                single-line
                                clearable />
                </v-col>
            </v-row>
              <v-data-table :v-model:sort-by="sortedBy"
                            :headers="allSensorsHeaders"
                            :items="filteredAllSensors"
                            :items-per-page="10"
                            density="compact"
                            class="mt-4">
                  <template #item.name="{ item }">
                      <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px">
                          {{ item.name }}
                      </div>
                  </template>
                  <template #item.type="{ item }">
                      {{ item.type }}
                  </template>
                  <template #item.subtype="{ item }">
                      {{ item.subtype || '-' }}
                  </template>
                  <template #item.manufacturer="{ item }">
                      {{ item.manufacturer || '-' }}
                  </template>
                  <template #item.model="{ item }">
                      {{ item.model || '-' }}
                  </template>
                  <template #item.value="{ item }">
                      <span class="text-right">
                          {{ item.value === '' || item.value === null || item.value === undefined ? '-' : formatValue(item.value) }}
                      </span>
                  </template>
                  <template #item.actions="{ item }">
                      <div class="d-flex">
                          <v-btn icon variant="text" size="small" @click="editSensor(item)">
                              <v-icon size="18">mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon variant="text" size="small" @click="deleteSensor(item)">
                              <v-icon size="18">mdi-delete</v-icon>
                          </v-btn>
                      </div>
                  </template>
              </v-data-table>
          </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="editView()">
        <template v-slot:prepend>
          <v-icon>mdi-cog</v-icon>
        </template>
        <v-list-item-title>{{ $t('edit view') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateSensorDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create sensor') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Create Sensor Dialog -->
  <v-dialog v-model="createSensorDialog.value" max-width="600">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create sensor') }}</v-card-title>
      <v-card-text>
          <v-form>
              <v-text-field v-model="createSensorDialog.name" clearable>
                  <template #label>
                      <span>{{ $t('name') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-text-field>
              <v-select v-model="createSensorDialog.type" :items="sensorTypes" dense>
                  <template #label>
                      <span>{{ $t('type') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-select>
              <v-select v-model="createSensorDialog.subtype" :items="sensorSubtypes" :label="$t('subtype')" dense clearable />
              <v-autocomplete v-model="createSensorDialog.source"
                              :items="unmappedOptions"
                              item-title="title"
                              item-value="value"
                              dense
                              hide-details="auto"
                              clearable
                              :loading="unmappedLoading">
                  <template #label>
                      <span>{{ $t('source') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-autocomplete>
              <v-text-field v-model="createSensorDialog.unit" clearable class="mt-4">
                  <template #label>
                      <span>{{ $t('unit') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-text-field>
              <v-text-field v-model="createSensorDialog.multiplier" :label="$t('multiplier')" clearable />
              <v-text-field v-model="createSensorDialog.divisor" :label="$t('divisor')" clearable />
              <v-text-field v-model="createSensorDialog.manufacturer" :label="$t('manufacturer')" clearable />
              <v-text-field v-model="createSensorDialog.model" :label="$t('model')" clearable />
              <div class="text-caption text-medium-emphasis">
                  <small><span style="color: red" aria-hidden="true">*</span> required</small>
              </div>
          </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="createSensorDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="createSensor()" color="onPrimary">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Sensor Dialog -->
  <v-dialog v-model="editSensorDialog.value" max-width="600">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit sensor') }}</v-card-title>
      <v-card-text>
          <v-form>
              <v-text-field v-model="editSensorDialog.name" clearable>
                  <template #label>
                      <span>{{ $t('name') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-text-field>
              <v-select v-model="editSensorDialog.type" :items="sensorTypes" dense>
                  <template #label>
                      <span>{{ $t('type') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-select>
              <v-select v-model="editSensorDialog.subtype" :items="sensorSubtypes" :label="$t('subtype')" dense clearable />
              <v-autocomplete v-model="editSensorDialog.source"
                              :items="unmappedOptions"
                              item-title="title"
                              item-value="value"
                              dense
                              hide-details="auto"
                              clearable
                              :loading="unmappedLoading">
                  <template #label>
                      <span>{{ $t('source') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-autocomplete>
              <v-text-field v-model="editSensorDialog.unit" clearable class="mt-4">
                  <template #label>
                      <span>{{ $t('unit') }} <span style="color: red" aria-hidden="true">*</span></span>
                  </template>
              </v-text-field>
              <v-text-field v-model="editSensorDialog.multiplier" :label="$t('multiplier')" clearable />
              <v-text-field v-model="editSensorDialog.divisor" :label="$t('divisor')" clearable />
              <v-text-field v-model="editSensorDialog.manufacturer" :label="$t('manufacturer')" clearable />
              <v-text-field v-model="editSensorDialog.model" :label="$t('model')" clearable />
          </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="editSensorDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="updateSensor()" color="onPrimary">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate />
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const overlay = ref(false);
const sensorsLoading = ref(true);
const { t } = useI18n();

const sensors = ref({
  fan: [],
  temperature: [],
  power: [],
  voltage: [],
  psu: [],
  other: [],
});

const preferredOrder = ['fan', 'temperature', 'power', 'voltage', 'psu', 'other'];
const subtypeOrder = ['voltage', 'wattage', 'temperature', 'speed', 'percentage', 'mode'];

const sensorTypes = ['fan', 'temperature', 'power', 'voltage', 'psu', 'other'];
const sensorSubtypes = ['voltage', 'wattage', 'temperature', 'speed', 'percentage', 'mode'];

const createSensorDialog = ref({
  value: false,
  name: '',
  manufacturer: null,
  model: null,
  subtype: null,
  type: null,
  source: '',
  unit: '',
  multiplier: null,
  divisor: null,
  enabled: true,
});

const editSensorDialog = ref({
  value: false,
  id: null,
  name: '',
  manufacturer: null,
  model: null,
  subtype: null,
  type: null,
  source: '',
  unit: '',
  multiplier: null,
  divisor: null,
  enabled: true,
});

function formatValue(v) {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return '-';
    return v.toFixed(1);
  }
  return v;
}

const sortedBy = ref([{ key: 'type', order: 'asc' }])
const searchQuery = ref('');

const allSensors = computed(() => {
    const all = [];
    const obj = sensors.value ?? {};

    for (const [type, items] of Object.entries(obj)) {
        if (Array.isArray(items)) {
            items.forEach(item => {
                all.push({
                    ...item,
                    type: type
                });
            });
        }
    }

    return all.sort((a, b) => {
        const aIndex = typeof a?.index === 'number' ? a.index : Infinity;
        const bIndex = typeof b?.index === 'number' ? b.index : Infinity;
        if (aIndex !== bIndex) return aIndex - bIndex;
        return (a?.name || '').localeCompare(b?.name || '');
    });
});

const filteredAllSensors = computed(() => {
    if (!searchQuery.value) return allSensors.value;

    const query = searchQuery.value.toLowerCase();
    return allSensors.value.filter(sensor => {
        return (
            sensor.name?.toLowerCase().includes(query) ||
            sensor.type?.toLowerCase().includes(query) ||
            sensor.subtype?.toLowerCase().includes(query) ||
            sensor.manufacturer?.toLowerCase().includes(query) ||
            sensor.model?.toLowerCase().includes(query) ||
            sensor.unit?.toLowerCase().includes(query)
        );
    });
});

const allSensorsHeaders = computed(() => [
    { title: '#', key: 'index', width: 60 },
    { title: t('name'), key: 'name' },
    { title: t('type'), key: 'type', width: 100 },
    { title: t('subtype'), key: 'subtype', width: 120 },
    { title: t('manufacturer'), key: 'manufacturer' },
    { title: t('model'), key: 'model' },
    { title: t('value'), key: 'value', align: 'end', width: 100 },
    { title: t('unit'), key: 'unit', width: 80 },
    { title: '', key: 'actions', sortable: false, width: 100 }
]);

const unmappedLoading = ref(false);
const unmappedRaw = ref(null);

const unmappedOptions = computed(() => {
  const root = unmappedRaw.value;
  if (!root || typeof root !== 'object') return [];

  const out = [];
  for (const [chip, chipObj] of Object.entries(root)) {
    if (!chipObj || typeof chipObj !== 'object') continue;

    for (const [group, groupObj] of Object.entries(chipObj)) {
      if (!groupObj || typeof groupObj !== 'object') continue;
      if (group === 'Adapter') continue;

      for (const [key, val] of Object.entries(groupObj)) {
        const value = `${chip}.${group}.${key}`;

        const valTxt = typeof val === 'number' ? ` = ${Number(val).toFixed(2).replace(/\.00$/, '')}` : '';

        out.push({
          value,
          title: `${chip}.${group}.${key}${valTxt}`,
        });
      }
    }
  }

  return out.sort((a, b) => a.title.localeCompare(b.title));
});

async function getUnmappedSensors() {
  try {
    unmappedLoading.value = true;
    const res = await fetch('/api/v1/mos/sensors/unmapped', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });
    if (!res.ok) throw new Error(t('unmapped sensors could not be loaded'));
    unmappedRaw.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    unmappedLoading.value = false;
  }
}

async function openCreateSensorDialog() {
  createSensorDialog.value.value = true;
  if (!unmappedRaw.value) await getUnmappedSensors();
}

const editSourceOptions = computed(() => {
  const cur = (editSensorDialog.value.source || '').trim();
  const base = unmappedOptions.value || [];

  if (!cur) return base;

  const exists = base.some((x) => x?.value === cur);
  if (exists) return base;

  return [{ value: cur, title: cur }, ...base];
});

const getSensorDetails = async (id) => {
  try {
    const res = await fetch('/api/v1/mos/sensors/config', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    });

    if (!res.ok) throw new Error(t('sensor details could not be loaded'));

    const cfg = await res.json();

    for (const [typeKey, arr] of Object.entries(cfg || {})) {
      if (!Array.isArray(arr)) continue;
      const found = arr.find((x) => String(x?.id) === String(id));
      if (found) return { ...found, type: typeKey };
    }

    throw new Error(t('sensor not found'));
  } catch (e) {
    showSnackbarError(e.message);
    return null;
  }
};

const editSensor = async (s) => {
  if (!s?.id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  if (!unmappedRaw.value) await getUnmappedSensors();

  const details = await getSensorDetails(s.id);
  if (!details) return;

  editSensorDialog.value.id = details.id;
  editSensorDialog.value.name = details.name ?? '';
  editSensorDialog.value.manufacturer = details.manufacturer ?? '';
  editSensorDialog.value.model = details.model ?? '';
  editSensorDialog.value.subtype = details.subtype ?? null;
  editSensorDialog.value.type = details.type ?? null;
  editSensorDialog.value.source = details.source ?? '';
  editSensorDialog.value.unit = details.unit ?? '';
  editSensorDialog.value.multiplier = details.multiplier ?? '';
  editSensorDialog.value.divisor = details.divisor ?? '';
  editSensorDialog.value.enabled = details.enabled ?? true;

  editSensorDialog.value.value = true;
};

const updateSensor = async () => {
  const id = editSensorDialog.value.id;
  if (!id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  if (!editSensorDialog.value.name?.trim()) {
    showSnackbarError(t('name is required'));
    return;
  }
  if (!editSensorDialog.value.type) {
    showSnackbarError(t('type is required'));
    return;
  }
  if (!editSensorDialog.value.source?.trim()) {
    showSnackbarError(t('source is required'));
    return;
  }
  if (!editSensorDialog.value.unit?.trim()) {
    showSnackbarError(t('unit is required'));
    return;
  }

  const payload = {
    name: editSensorDialog.value.name.trim(),
    manufacturer: editSensorDialog.value.manufacturer || null,
    model: editSensorDialog.value.model || null,
    subtype: editSensorDialog.value.subtype || null,
    type: editSensorDialog.value.type,
    source: editSensorDialog.value.source.trim(),
    unit: editSensorDialog.value.unit.trim(),
    multiplier: editSensorDialog.value.multiplier || null,
    divisor: editSensorDialog.value.divisor || null,
    enabled: true,
  };

  try {
    overlay.value = true;

    const res = await fetch(`/api/v1/mos/sensors/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be updated')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor updated successfully'));
    editSensorDialog.value.value = false;
    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

async function deleteSensor(s) {
  const id = s?.id;
  if (!id) {
    showSnackbarError(t('missing sensor id'));
    return;
  }

  try {
    overlay.value = true;

    const res = await fetch(`/api/v1/mos/sensors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor deleted successfully'));
    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
}

async function createSensor() {
  if (!createSensorDialog.value.name?.trim()) {
    showSnackbarError(t('name is required'));
    return;
  }
  if (!createSensorDialog.value.type) {
    showSnackbarError(t('type is required'));
    return;
  }
  if (!createSensorDialog.value.source?.trim()) {
    showSnackbarError(t('source is required'));
    return;
  }
  if (!createSensorDialog.value.unit?.trim()) {
    showSnackbarError(t('unit is required'));
    return;
  }

  const payload = [
    {
      name: createSensorDialog.value.name.trim(),
      manufacturer: createSensorDialog.value.manufacturer || null,
      model: createSensorDialog.value.model || null,
      subtype: createSensorDialog.value.subtype || null,
      type: createSensorDialog.value.type,
      source: createSensorDialog.value.source.trim(),
      unit: createSensorDialog.value.unit.trim(),
      multiplier: createSensorDialog.value.multiplier || null,
      divisor: createSensorDialog.value.divisor || null,
      enabled: true,
    },
  ];

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/mos/sensors', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('sensor could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('sensor created successfully'));

    createSensorDialog.value.value = false;
    createSensorDialog.value.name = '';
    createSensorDialog.value.manufacturer = '';
    createSensorDialog.value.model = '';
    createSensorDialog.value.subtype = null;
    createSensorDialog.value.type = null;
    createSensorDialog.value.source = '';
    createSensorDialog.value.unit = '';
    createSensorDialog.value.multiplier = null;
    createSensorDialog.value.divisor = null;
    createSensorDialog.value.enabled = true;

    await getSensors();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
}

onMounted(() => {
  getSensors();
});

const getSensors = async () => {
  try {
    sensorsLoading.value = true;

    const res = await fetch('/api/v1/mos/sensors', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('sensor mappings could not be loaded'));

    sensors.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    sensorsLoading.value = false;
  }
};

const sections = computed(() => {
  const obj = sensors.value ?? {};
  const keys = Object.keys(obj);

  const ordered = [...preferredOrder.filter((k) => keys.includes(k)), ...keys.filter((k) => !preferredOrder.includes(k))];

  return ordered.map((key) => ({
    key,
    title: key.toUpperCase(),
    items: Array.isArray(obj[key]) ? obj[key] : [],
  }));
});
</script>

<style scoped>
.sensors-table :deep(th) {
  font-weight: 600;
  white-space: nowrap;
}

.sensors-table :deep(td) {
  vertical-align: middle;
}
</style>
