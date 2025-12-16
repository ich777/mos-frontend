<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('disks') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list class="bg-transparent">
              <template v-for="(disk, index) in disks" :key="disk.device">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon class="cursor-pointer" :color="disk.powerStatus === 'active' ? 'green' : disk.powerStatus === 'standby' ? 'blue' : 'red'" @dblclick="disk.powerStatus === 'active' ? sleepDisk(disk) : wakeDisk(disk)">
                      {{ getDiskIcon(disk.type) }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ disk.name }}
                    <v-chip v-if="disk.partitions?.some((p) => p.mountpoint === '/boot')" color="onPrimary" size="small" class="ml-2" label>
                      {{ $t('boot') }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ disk.device }}, Size {{ disk.size_human }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item>
                          <template #prepend>
                            <v-icon>mdi-motion-pause</v-icon>
                          </template>
                          <v-list-item-title @click="sleepDisk(disk)">
                            {{ $t('sleep') }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <template #prepend>
                            <v-icon>mdi-motion-play</v-icon>
                          </template>
                          <v-list-item-title @click="wakeDisk(disk)">
                            {{ $t('wake up') }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <template #prepend>
                            <v-icon>mdi-broom</v-icon>
                          </template>
                          <v-list-item-title @click="openFormatDialog(disk)">
                            {{ $t('format') }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
                <v-divider v-if="index < disks.length - 1" />
              </template>
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
        <v-spacer />
        <v-btn color="onPrimary" @click="formatDialog.value = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="red" :disabled="!formatDialog.filesystem" @click="formatDisk(formatDialog.disk)">
          {{ $t('format') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const disks = ref([]);
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const overlay = ref(false);
const formatDialog = reactive({
  value: false,
  disk: null,
  filesystem: '',
  partition: true,
  wipeExisting: true,
});
const filesystems = ref([]);

onMounted(() => {
  getDisks();
  getFilesystems();
});

const openFormatDialog = (disk) => {
  formatDialog.value = true;
  formatDialog.disk = disk;
};

const getDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('disks could not be loaded'));
    disks.value = (await res.json()) || [];
  } catch (e) {
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

const wakeDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/wake`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('disk could not be woken up'));
    showSnackbarSuccess(t('disk successfully woken up'));
    getDisks();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const sleepDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/sleep`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('disk could not be put to sleep'));
    showSnackbarSuccess(t('disk successfully put to sleep'));
    getDisks();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const formatDisk = async (disk) => {
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
    overlay.value = false;
    if (!res.ok) throw new Error(t('disk could not be formatted'));
    showSnackbarSuccess(t('disk formatted successfully'));

    clearFormatDialog();
    getDisks();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const getFilesystems = async () => {
  try {
    const res = await fetch('/api/v1/disks/availablefilesystems', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('filesystems could not be loaded'));
    const Result = await res.json();
    filesystems.value = Result || [];
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const clearFormatDialog = () => {
  formatDialog.value = false;
  formatDialog.disk = null;
  formatDialog.filesystem = '';
  formatDialog.partition = true;
  formatDialog.wipeExisting = true;
};
</script>
