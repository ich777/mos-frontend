<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('pools') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card variant="tonal" v-for="pool in pools" :key="pool.id" fluid class="mb-4 ml-4 mr-4 pa-0">
                <v-card-title class="d-flex align-center">
                  <span>{{ pool.name }}</span>
                </v-card-title>
                <v-card-subtitle>{{ $t('type') }}: {{ pool.type }}</v-card-subtitle>
                <v-card-text>
                  <v-list class="pa-0">
                    <v-list-item-title>{{ $t('disks') }}</v-list-item-title>
                    <v-list-item v-for="data_device in pool.data_devices" :key="data_device.id"
                      @click="selectedDisk = data_device">
                      <v-list-item-title>{{ data_device.device }}</v-list-item-title>
                      <v-list-item-subtitle>{{ data_device.filesystem }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-list v-if="pool.parity_devices && pool.parity_devices.length > 0" class="pa-0">
                    <v-list-item-title>{{ $t('parities') }}</v-list-item-title>
                    <v-list-item v-for="parity_device in pool.parity_devices" :key="parity_device.id">
                      <v-list-item-title>{{ parity_device.device }}</v-list-item-title>
                      <v-list-item-subtitle>{{ parity_device.filesystem }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn icon @click="openDeletePoolDialog(pool)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-switch v-model="pool.automount" label="Automount" inset hide-details density="compact" class="mr-4"
                    color="primary" />
                </v-card-actions>
              </v-card>
            </v-card>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('unassigned disks') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list class="pa-0">
                  <template v-if="unassignedDisks.length === 0">
                    <v-list-item>
                      <v-list-item-title>{{ $t('no unassigned disks found') }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-list-item v-for="unassignedDisk in unassignedDisks" :key="unassignedDisk.name">
                    <v-list-item-title>{{ unassignedDisk.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ unassignedDisk.type }} ({{ unassignedDisk.sizeHuman
                    }})</v-list-item-subtitle>
                    <template v-slot:prepend>
                      <v-icon class="cursor-pointer">
                        {{ getDiskIcon(unassignedDisk.type) }}
                      </v-icon>
                    </template>
                    <template v-slot:append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn variant="text" icon v-bind="props">
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
          </v-col>
        </v-row>
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
            <v-select v-model="formatDialog.filesystem" :items="filesystems" :label="$t('filesystem')" dense
              :rules="[v => !!v || $t('filesystem is required')]" />
          </v-col>
          <v-col cols="12">
            <v-switch v-model="formatDialog.partition" :label="$t('create partition')" inset hide-details
              density="compact" color="primary" />
          </v-col>
          <v-col cols="12">
            <v-switch v-model="formatDialog.wipeExisting" :label="$t('wipe existing data')" inset hide-details
              density="compact" color="primary" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="formatDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" :disabled="!formatDialog.filesystem" @click="formatDisk(formatDialog.disk)">
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
        <v-spacer />
        <v-btn text @click="deletePoolDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deletePool(deletePoolDialog.pool.id)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="createPoolDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('create pool') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createPoolDialog.name" :label="$t('name')" />
          <v-select v-model="createPoolDialog.type" :items="['single', 'mergerfs', 'multi']" :label="$t('type')"
            dense />
          <v-select v-model="createPoolDialog.devices"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map(disk => disk.device) : []"
            :label="$t('devices')" :multiple="createPoolDialog.type !== 'single'" dense />
          <v-select v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.snapraidDevice"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map(disk => disk.device) : []"
            :label="$t('snapraid device')" dense />
          <v-text-field v-if="createPoolDialog.type === 'multi'" v-model="createPoolDialog.raidLevel"
            :label="$t('raid level')" />
          <v-select v-model="createPoolDialog.filesystem" :items="filesystems" :label="$t('filesystem')" dense />
          <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.comment"
            :label="$t('comment')" />
          <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.mergerfsOptions"
            :label="$t('mergerfs options')" />
          <v-switch v-model="createPoolDialog.automount" :label="$t('automount')" hide-details density="compact" color="primary" inset />
          <v-switch v-model="createPoolDialog.format" :label="$t('format')" hide-details density="compact" color="primary"
            inset />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createPoolDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createPool()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>

</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const pools = ref([]);
const unassignedDisks = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const filesystems = ref([]);
const formatDialog = reactive({
  value: false,
  disk: null,
  filesystem: '',
  partition: true,
  wipeExisting: true
});
const createPoolDialog = reactive({
  value: false,
  disk: null,
  name: '',
  type: 'single',
  devices: [],
  filesystem: '',
  format: false,
  automount: true,
  comment: '',
  mergerfsOptions: "defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,category.create=mfs",
  snapraidDevice: "",
  raidLevel: ""
});
const deletePoolDialog = reactive({
  value: false,
  pool: null,
  filesystem: ''
});

onMounted(() => {
  getPools();
  getUnassignedDisks();
  getFilesystems();
});

const openFormatDialog = (disk) => {
  formatDialog.value = true;
  formatDialog.disk = disk;
};

const openCreatePoolDialog = (disk) => {
  createPoolDialog.value = true;
  createPoolDialog.disk = disk;
  createPoolDialog.single = 'single';
  createPoolDialog.devices = [disk.device];
  createPoolDialog.name = '';
  createPoolDialog.format = false;
  createPoolDialog.automount = true;
  createPoolDialog.comment = '';
  createPoolDialog.mergerfsOptions = "defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,category.create=mfs";
  createPoolDialog.snapraidDevice = "";
  createPoolDialog.raidLevel = "raid1";
};

const openDeletePoolDialog = (pool) => {
  deletePoolDialog.value = true;
  deletePoolDialog.pool = pool;
};

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('pools could not be loaded'));
    pools.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getUnassignedDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks/unassigned', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('unassigned disks could not be loaded'));
    const Result = await res.json();
    unassignedDisks.value = Result.unassignedDisks || [];

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getFilesystems = async () => {
  try {
    const res = await fetch('/api/v1/disks/availablefilesystems', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('filesystems could not be loaded'));
    const Result = await res.json();
    filesystems.value = Result || [];

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const formatDisk = async (disk) => {
  formatDialog.value = false;

  const formatDiskData = {
    device: formatDialog.disk.name,
    filesystem: formatDialog.filesystem,
    partition: formatDialog.partition,
    wipeExisting: formatDialog.wipeExisting
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/disks/format`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formatDiskData)
    });
    overlay.value = false;
    if (!res.ok) throw new Error(t('disk could not be formatted'));
    showSnackbarSuccess(t('disk formatted successfully'));

    clearFormatDialog();
    getPools();
    getUnassignedDisks();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
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

}

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
      snapraid: { device: createPoolDialog.snapraidDevice }
    }
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/mergerfs`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPoolData)
    });
    overlay.value = false;
    if (!res.ok) throw new Error(t('pool could not be created'));
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }

}

const createPoolMulti = async () => {

  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    raidLevel: createPoolDialog.raidLevel,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
    }
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/multi`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPoolData)
    });
    overlay.value = false;
    if (!res.ok) throw new Error(t('pool could not be created'));
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const createPoolSingle = async () => {

  const createPoolData = {
    name: createPoolDialog.name,
    device: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount
    }
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/single`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPoolData)
    });
    overlay.value = false;
    if (!res.ok) throw new Error(t('pool could not be created'));
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const deletePool = async (poolId) => {
  deletePoolDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/pools/${poolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;
    if (!res.ok) throw new Error(t('pool could not be deleted'));
    showSnackbarSuccess(t('pool deleted successfully'));

    clearDeletePoolDialog();
    getPools();
    getUnassignedDisks();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
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
  createPoolDialog.raidLevel = "";
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

</script>
