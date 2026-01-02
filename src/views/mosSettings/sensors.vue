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
        <v-card v-else class="pa-4">
          <v-row dense>
            <v-col cols="12" v-for="section in sections" :key="section.key">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-1 font-weight-medium">
                  {{ section.title }}
                  <span class="text-caption text-medium-emphasis">({{ section.items.length }})</span>
                </div>
              </div>

              <template v-if="section.items.length">
                <v-table density="compact" class="sensors-table">
                  <thead>
                    <tr>
                      <th class="text-left" style="width: 64px">#</th>
                      <th class="text-left">{{ $t('name') }}</th>
                      <th class="text-left">{{ $t('subtype') }}</th>
                      <th class="text-left">{{ $t('manufacturer') }}</th>
                      <th class="text-left">{{ $t('model') }}</th>
                      <th class="text-right" style="width: 120px">{{ $t('value') }}</th>
                      <th class="text-left" style="width: 80px">{{ $t('unit') }}</th>
                      <th class="text-left" style="width: 120px"></th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="s in section.items" :key="s.id ?? `${section.key}-${s.index}-${s.name}`">
                      <td>{{ s.index }}</td>
                      <td>
                        <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 520px">
                          {{ s.name }}
                        </div>
                      </td>
                      <td>
                        <span class="text-body-2">{{ s.subtype || '-' }}</span>
                      </td>
                      <td>
                        <span class="text-body-2">{{ s.manufacturer || '-' }}</span>
                      </td>
                      <td>
                        <span class="text-body-2">{{ s.model || '-' }}</span>
                      </td>
                      <td class="text-right">
                        <span class="text-body-2">
                          {{ s.value === '' || s.value === null || s.value === undefined ? '-' : formatValue(s.value) }}
                        </span>
                      </td>
                      <td>
                        <span class="text-body-2">{{ s.unit }}</span>
                      </td>
                      <td>
                        <v-btn icon variant="text" size="small" @click="editSensor(s)">
                          <v-icon size="18">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" size="small" @click="deleteSensor(s)">
                          <v-icon size="18">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>

              <template v-else>
                <div class="text-body-2 text-medium-emphasis">
                  {{ $t('no sensors in this category') }}
                </div>
              </template>

              <v-divider class="my-4" />
            </v-col>
          </v-row>
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
          <v-text-field v-model="createSensorDialog.name" :label="$t('name')" />
          <v-select v-model="createSensorDialog.type" :items="sensorTypes" :label="$t('type')" dense />
          <v-select v-model="createSensorDialog.subtype" :items="sensorSubtypes" :label="$t('subtype')" dense clearable />
          <v-autocomplete
            v-model="createSensorDialog.source"
            :items="unmappedOptions"
            item-title="title"
            item-value="value"
            :label="$t('source')"
            dense
            hide-details="auto"
            clearable
            :loading="unmappedLoading"
          />
          <v-text-field v-model="createSensorDialog.unit" :label="$t('unit')" clearable class="mt-4" />
          <v-text-field v-model="createSensorDialog.multiplier" :label="$t('multiplier')" clearable />
          <v-text-field v-model="createSensorDialog.manufacturer" :label="$t('manufacturer')" clearable />
          <v-text-field v-model="createSensorDialog.model" :label="$t('model')" clearable />
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
          <v-text-field v-model="editSensorDialog.name" :label="$t('name')" />
          <v-select v-model="editSensorDialog.type" :items="sensorTypes" :label="$t('type')" dense />
          <v-select v-model="editSensorDialog.subtype" :items="sensorSubtypes" :label="$t('subtype')" dense clearable />
          <v-autocomplete
            v-model="editSensorDialog.source"
            :items="editSourceOptions"
            item-title="title"
            item-value="value"
            :label="$t('source')"
            dense
            hide-details="auto"
            clearable
            :loading="unmappedLoading"
          />
          <v-text-field v-model="editSensorDialog.unit" :label="$t('unit')" clearable class="mt-4" />
          <v-text-field v-model="createSensorDialog.multiplier" :label="$t('multiplier')" clearable />
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
  editSensorDialog.value.manufacturer = details.manufacturer ?? null;
  editSensorDialog.value.model = details.model ?? null;
  editSensorDialog.value.subtype = details.subtype ?? null;
  editSensorDialog.value.type = details.type ?? null;
  editSensorDialog.value.source = details.source ?? '';
  editSensorDialog.value.unit = details.unit ?? '';
  editSensorDialog.value.multiplier = details.multiplier ?? '';
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
    createSensorDialog.value.manufacturer = null;
    createSensorDialog.value.model = null;
    createSensorDialog.value.subtype = null;
    createSensorDialog.value.type = null;
    createSensorDialog.value.source = '';
    createSensorDialog.value.unit = '';
    createSensorDialog.value.multiplier = null;
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

//function sortSensors(arr = []) {
//  const orderMap = new Map(subtypeOrder.map((s, i) => [s.toLowerCase(), i]));

//  return [...arr].sort((a, b) => {
//    const as = (a?.subtype ?? '').toLowerCase();
//    const bs = (b?.subtype ?? '').toLowerCase();
//    const aHas = !!as;
//    const bHas = !!bs;

//    if (aHas && bHas) {
//      const ai = orderMap.has(as) ? orderMap.get(as) : Number.POSITIVE_INFINITY;
//      const bi = orderMap.has(bs) ? orderMap.get(bs) : Number.POSITIVE_INFINITY;

//      if (ai !== bi) return ai - bi;
//      if (ai === Number.POSITIVE_INFINITY && as !== bs) return as.localeCompare(bs);
//    } else if (aHas !== bHas) {
//      return aHas ? -1 : 1;
//    }

//    const aidx = Number.isFinite(a?.index) ? a.index : Number.POSITIVE_INFINITY;
//    const bidx = Number.isFinite(b?.index) ? b.index : Number.POSITIVE_INFINITY;
//    if (aidx !== bidx) return aidx - bidx;

//    const an = (a?.name ?? '').toLowerCase();
//    const bn = (b?.name ?? '').toLowerCase();
//    return an.localeCompare(bn);
//  });
//}

const sections = computed(() => {
  const obj = sensors.value ?? {};
  const keys = Object.keys(obj);

  const ordered = [...preferredOrder.filter((k) => keys.includes(k)), ...keys.filter((k) => !preferredOrder.includes(k))];

  return ordered.map((key) => ({
    key,
    title: key.toUpperCase(),
    // items: sortSensors(Array.isArray(obj[key]) ? obj[key] : []),
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
