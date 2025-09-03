<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('disks') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item v-for="disk in disks" :key="disk.device">
                    <template v-slot:prepend>
                      <v-icon class="cursor-pointer"
                        :color="disk.powerStatus === 'active' ? 'green' : (disk.powerStatus === 'standby' ? 'blue' : 'red')">
                        {{ getDiskIcon(disk.type) }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ disk.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ disk.device }}, Size {{ (disk.size / 1024 / 1024 /
                      1024).toFixed(2)
                    }}GB</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn variant="text" icon v-bind="props">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item>
                            <v-list-item-title @click="spinDownDisk(disk)">{{ $t('spindown') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title @click="spinUpDisk(disk)">{{ $t('spinup') }}</v-list-item-title>
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

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const disks = ref([]);
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer']);
const overlay = ref(false);

onMounted(() => {
  getDisks();
});

const getDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('disks could not be loaded'));
    disks.value = await res.json() || [];

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

const spinUpDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/wake`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
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

const spinDownDisk = async (disk) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/disks/${disk.name}/sleep`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
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

</script>
