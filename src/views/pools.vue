<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('pools') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="poolsLoading" type="card" />
        <v-card variant="tonal" v-for="pool in pools" :key="pool.id" fluid class="mb-4 pa-0">
          <v-card-title class="d-flex align-center">
            <span>{{ pool.name }}</span>
            <v-spacer />
            <v-chip v-if="pool.status.mounted" size="small">{{ $t('mounted') }}</v-chip>
            <v-chip v-else size="small">{{ $t('unmounted') }}</v-chip>
            <v-icon v-if="pool.config.encrypted" class="ml-2" color="grey darken-1" aria-label="locked">mdi-lock</v-icon>
          </v-card-title>
          <v-card-subtitle v-if="pool.status">{{ $t('type') }}: {{ pool.type }}</v-card-subtitle>
          <div v-if="pool.status" class="mt-2 mr-4 ml-4">
            <v-progress-linear
              :model-value="pool.status.usagePercent"
              height="8"
              class="mb-2"
              :color="getUsageColor(pool.status.usagePercent)"
              rounded
              :label="`${pool.status.usagePercent}%`"
              style="min-width: 120px"
              bg-opacity="0.35"
            />
            <span style="font-size: 0.875rem">{{ pool.status.usedSpace_human }} / {{ pool.status.totalSpace_human }}</span>
          </div>
          <v-card-text>
            <v-list v-if="pool.data_devices && pool.data_devices.length > 0" class="pa-0" style="background-color: transparent">
              <v-list-item-title>{{ $t('disks') }}</v-list-item-title>
              <v-list-item v-for="data_device in pool.data_devices" :key="data_device.id">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer" :color="data_device.powerStatus === 'active' ? 'green' : data_device.powerStatus === 'standby' ? 'blue' : 'red'">
                    {{ getDiskIcon(data_device.diskType.type) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ data_device.device }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ data_device.filesystem }}
                </v-list-item-subtitle>
                <v-progress-linear
                  v-if="data_device.storage"
                  :model-value="data_device.storage.usagePercent"
                  height="8"
                  :color="getUsageColor(data_device.storage.usagePercent)"
                  rounded
                  class="mt-2"
                  :label="`${data_device.storage.usagePercent}%`"
                  style="min-width: 120px"
                />
                <v-list-item-subtitle v-if="data_device.storage" class="mt-2">{{ data_device.storage.usedSpace_human }} / {{ data_device.storage.totalSpace_human }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-list v-if="pool.parity_devices && pool.parity_devices.length > 0" class="pa-0" style="background-color: transparent">
              <v-list-item-title>{{ $t('parities') }}</v-list-item-title>
              <v-list-item v-for="parity_device in pool.parity_devices" :key="parity_device.id">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer" :color="parity_device.powerStatus === 'active' ? 'green' : parity_device.powerStatus === 'standby' ? 'blue' : 'red'">
                    {{ getDiskIcon(parity_device.diskType.type) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ parity_device.device }}</v-list-item-title>
                <v-list-item-subtitle>{{ parity_device.filesystem }}</v-list-item-subtitle>
                <v-progress-linear
                  v-if="parity_device.storage"
                  :model-value="parity_device.storage.usagePercent"
                  height="8"
                  color="grey darken-1"
                  rounded
                  class="mt-2"
                  :label="`${parity_device.storage.usagePercent}%`"
                  style="min-width: 120px"
                />
                <v-list-item-subtitle v-if="parity_device.storage" class="mt-2">{{ parity_device.storage.usedSpace_human }} / {{ parity_device.storage.totalSpace_human }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-switch v-model="pool.automount" :label="$t('automount')" inset hide-details density="compact" color="onPrimary" @change="switchAutomount(pool)" />
            <v-spacer />
            <v-btn icon @click="openDeletePoolDialog(pool)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
            <v-menu>
              <template #activator="{ props }">
                <v-btn variant="text" icon v-bind="props" color="onPrimary">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-if="!pool.status.mounted" @click="pool.config && pool.config.encrypted ? openPassphraseDialog(pool) : mountPool(pool)">
                  <v-list-item-title>{{ $t('mount pool') }}</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="pool.status.mounted" @click="unmountPool(pool)">
                  <v-list-item-title>{{ $t('unmount pool') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
        <v-card v-if="pools.length === 0 && !poolsLoading" variant="tonal" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no pools have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card variant="tonal" fluid style="margin-bottom: 80px">
          <v-card-title>{{ $t('unassigned disks') }}</v-card-title>
          <v-skeleton-loader v-if="unassignedDisksLoading" type="list-item" />
          <v-card-text class="pa-0">
            <v-list class="pa-0" style="background-color: transparent">
              <template v-if="unassignedDisks.length === 0 && !unassignedDisksLoading">
                <v-list-item>
                  <v-list-item-title>{{ $t('no unassigned disks found') }}</v-list-item-title>
                </v-list-item>
              </template>
              <v-list-item v-for="unassignedDisk in unassignedDisks" :key="unassignedDisk.name">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer" :color="unassignedDisk.powerStatus === 'active' ? 'green' : unassignedDisk.powerStatus === 'standby' ? 'blue' : 'red'">
                    {{ getDiskIcon(unassignedDisk.type) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ unassignedDisk.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ unassignedDisk.type }} ({{ unassignedDisk.size_human }})</v-list-item-subtitle>
                <template v-slot:append>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn variant="text" icon v-bind="props" color="onPrimary">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openCreatePoolDialog(unassignedDisk)">
                        <v-list-item-title>{{ $t('create pool') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openFormatDialog(unassignedDisk)">
                        <v-list-item-title>{{ $t('format') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="formatDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('confirm format') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to format this disk?') }}
        <v-row class="mt-4">
          <v-col cols="12">
            <v-select v-model="formatDialog.filesystem" :items="filesystems" :label="$t('filesystem')" dense :rules="[(v) => !!v || $t('filesystem is required')]" />
          </v-col>
          <v-col cols="12">
            <v-switch v-model="formatDialog.partition" :label="$t('create partition')" inset hide-details density="compact" color="onPrimary" />
          </v-col>
          <v-col cols="12">
            <v-switch v-model="formatDialog.wipeExisting" :label="$t('wipe existing data')" inset hide-details density="compact" color="onPrimary" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" text @click="formatDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" :disabled="!formatDialog.filesystem" @click="formatDisk()">
          {{ $t('format') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deletePoolDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this pool?') }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="deletePoolDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deletePool(deletePoolDialog.pool.id)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="createPoolDialog.value" max-width="600">
    <v-card>
      <v-card-title>{{ $t('create pool') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-select v-model="createPoolDialog.type" :items="['single', 'mergerfs', 'multi']" :label="$t('type')" dense @update:model-value="switchPoolType()" />
          <v-text-field v-model="createPoolDialog.name" :label="$t('name')" />
          <v-select
            v-model="createPoolDialog.devices"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => disk.device) : []"
            :label="$t('devices')"
            :multiple="createPoolDialog.type !== 'single'"
            dense
          />
          <v-select
            v-if="createPoolDialog.type === 'mergerfs'"
            v-model="createPoolDialog.snapraidDevice"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => disk.device) : []"
            :label="$t('snapraid device')"
            dense
          />
          <v-select v-if="createPoolDialog.type === 'multi'" v-model="createPoolDialog.raidLevel" :items="['raid0', 'raid1', 'raid5']" :label="$t('raid level')" dense />
          <v-select v-model="createPoolDialog.filesystem" :items="filesystems" :label="$t('filesystem')" dense />
          <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.comment" :label="$t('comment')" />
          <div v-if="createPoolDialog.type === 'mergerfs'">
            <v-divider></v-divider>
            <v-btn variant="text" @click="createPoolDialog.showAdvanced = !createPoolDialog.showAdvanced" class="mb-4">
              {{ createPoolDialog.showAdvanced ? $t('hide advanced options') : $t('show advanced options') }}
            </v-btn>
            <v-slide-y-transition>
              <div v-if="createPoolDialog.showAdvanced">
                <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.mergerfsOptions" :label="$t('mergerfs options')" />
              </div>
            </v-slide-y-transition>
          </div>
          <v-switch v-model="createPoolDialog.automount" :label="$t('automount')" hide-details density="compact" color="onPrimary" inset />
          <v-switch v-model="createPoolDialog.format" :label="$t('format')" hide-details density="compact" color="onPrimary" inset />
          <v-switch v-model="createPoolDialog.encrypted" :label="$t('encrypt')" hide-details density="compact" color="onPrimary" inset />
          <v-text-field v-if="createPoolDialog.encrypted" v-model="createPoolDialog.passphrase" :label="$t('passphrase')" type="password" :rules="[(v) => !!v || $t('passphrase is required')]" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="createPoolDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="createPool()" color="onPrimary">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="passphraseDialog.value" max-width="600">
    <v-card>
      <v-card-title>{{ $t('enter passphrase') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="passphraseDialog.passphrase" :label="$t('passphrase')" type="password" :rules="[(v) => !!v || $t('passphrase is required')]" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="passphraseDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="mountPoolWithPassphrase(passphraseDialog.pool, passphraseDialog.passphrase)" color="onPrimary">
          {{ $t('mount') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon @click="openCreatePoolDialog()">
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const pools = ref([]);
const poolsLoading = ref(true);
const unassignedDisks = ref([]);
const unassignedDisksLoading = ref(true);
const overlay = ref(false);
const { t } = useI18n();
const filesystems = ref([]);
const formatDialog = reactive({
  value: false,
  disk: null,
  filesystem: '',
  partition: true,
  wipeExisting: true,
});
const createPoolDialog = reactive({
  value: false,
  disk: null,
  name: '',
  type: 'single',
  devices: [],
  filesystem: 'xfs',
  format: false,
  automount: true,
  comment: '',
  mergerfsOptions: 'defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,category.create=mfs',
  snapraidDevice: '',
  raidLevel: '',
  encrypted: false,
  passphrase: '',
  showAdvanced: false,
});
const deletePoolDialog = reactive({
  value: false,
  pool: null,
  filesystem: '',
});
const passphraseDialog = reactive({
  value: false,
  pool: null,
  passphrase: '',
});

onMounted(async () => {
  getPools();
  getUnassignedDisks();
  getFilesystems();
});

const openPassphraseDialog = (pool) => {
  passphraseDialog.value = true;
  passphraseDialog.pool = pool;
  passphraseDialog.passphrase = '';
};

const openFormatDialog = (disk) => {
  formatDialog.value = true;
  formatDialog.disk = disk;
};

const openCreatePoolDialog = (disk) => {
  createPoolDialog.value = true;
  createPoolDialog.disk = disk;
  createPoolDialog.single = 'single';
  createPoolDialog.devices = disk && disk.device ? [disk.device] : [];
  createPoolDialog.name = '';
  createPoolDialog.format = false;
  createPoolDialog.automount = true;
  createPoolDialog.comment = '';
  createPoolDialog.mergerfsOptions = 'defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,category.create=mfs';
  createPoolDialog.snapraidDevice = '';
  createPoolDialog.raidLevel = 'raid1';
};

const openDeletePoolDialog = (pool) => {
  deletePoolDialog.value = true;
  deletePoolDialog.pool = pool;
};

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pools could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    pools.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    poolsLoading.value = false;
  }
};

const getUnassignedDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks/unassigned', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('unassigned disks could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const Result = await res.json();
    unassignedDisks.value = Result.unassignedDisks || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    unassignedDisksLoading.value = false;
  }
};

const getFilesystems = async () => {
  try {
    const res = await fetch('/api/v1/disks/availablefilesystems', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('filesystems could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const Result = await res.json();
    filesystems.value = Result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const formatDisk = async () => {
  formatDialog.value = false;

  const formatDiskData = {
    device: formatDialog.disk.name,
    filesystem: formatDialog.filesystem,
    partition: formatDialog.partition,
    wipeExisting: formatDialog.wipeExisting,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/disks/format`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formatDiskData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be formatted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk formatted successfully'));

    clearFormatDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createPool = async () => {
  createPoolDialog.value = false;

  if (createPoolDialog.type === 'single') {
    createPoolSingle();
  } else if (createPoolDialog.type === 'mergerfs') {
    createPoolMergerfs();
  } else if (createPoolDialog.type === 'multi') {
    createPoolMulti();
  }
};

const createPoolMergerfs = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
      comment: createPoolDialog.comment,
      mergerfsOptions: createPoolDialog.mergerfsOptions,
      snapraid: { device: createPoolDialog.snapraidDevice },
    },
    config: {
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/mergerfs`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createPoolMulti = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    raidLevel: createPoolDialog.raidLevel,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
    },
    config: {
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/multi`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createPoolSingle = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    device: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
    },
    config: {
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/single`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deletePool = async (poolId) => {
  deletePoolDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${poolId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool deleted successfully'));

    clearDeletePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchAutomount = async (pool) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${pool.id}/automount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled: pool.automount }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('could not change automount setting')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('automount setting changed successfully'));

    getPools();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const unmountPool = async (pool) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${pool.id}/unmount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be unmounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('pool unmounted successfully'));
    getPools();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const mountPool = async (pool, passphrase) => {

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken')
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool mounted successfully'));
    getPools();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const mountPoolWithPassphrase = async (pool, passphrase) => {
  passphraseDialog.value = false;

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passphrase: passphrase }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool mounted successfully'));
    getPools();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchPoolType = () => {
  if (createPoolDialog.type === 'single' || createPoolDialog.type === 'mergerfs') {
    createPoolDialog.filesystem = 'xfs';
  } else {
    createPoolDialog.filesystem = 'btrfs';
  }
};

const getDiskIcon = (type) => {
  switch (type) {
    case 'ssd':
      return 'mdi-harddisk';
    case 'hdd':
      return 'mdi-harddisk';
    case 'usb':
      return 'mdi-usb-flash-drive';
    case 'nvme':
      return 'mdi-chip';
    default:
      return 'mdi-help-circle';
  }
};

const clearCreatePoolDialog = () => {
  createPoolDialog.value = false;
  createPoolDialog.disk = null;
  createPoolDialog.name = '';
  createPoolDialog.type = 'single';
  createPoolDialog.devices = [];
  createPoolDialog.filesystem = '';
  createPoolDialog.automount = true;
  createPoolDialog.raidLevel = '';
  createPoolDialog.comment = '';
  createPoolDialog.mergerfsOptions = 'defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,category.create=mfs';
  createPoolDialog.snapraidDevice = '';
  createPoolDialog.format = false;
  createPoolDialog.encrypted = false;
  createPoolDialog.passphrase = '';
};

const clearFormatDialog = () => {
  formatDialog.value = false;
  formatDialog.disk = null;
  formatDialog.filesystem = '';
  formatDialog.partition = true;
  formatDialog.wipeExisting = true;
};

const clearDeletePoolDialog = () => {
  deletePoolDialog.value = false;
  deletePoolDialog.pool = null;
};

const getUsageColor = (usagePercent) => {
  if (usagePercent < 70) {
    return 'green';
  } else if (usagePercent < 90) {
    return 'orange';
  } else {
    return 'red';
  }
};
</script>
