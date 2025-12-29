<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('boot') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0" style="margin-bottom: 80px">
          <v-card-text>
            <v-btn color="primary" rounded @click="installToDiskDialog.value = true">
              {{ $t('install to disk') }}
            </v-btn>
          </v-card-text>
          <v-card-text>
            <v-btn color="primary" rounded @click="openFileEditor('/boot/grub/grub.cfg')">
              {{ $t('edit grub.cfg') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Install to Disk Dialog -->
  <v-dialog v-model="installToDiskDialog.value" max-width="500">
    <v-card>
      <v-card-title>{{ $t('install to disk') }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ $t('transfer usb data to disk device') }}</p>
        <v-form>
          <v-select v-model="installToDiskDialog.disk" :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => disk.device) : []" :label="$t('device')" dense />
          <v-select v-model="installToDiskDialog.filesystem" :items="['ext4', 'btrfs', 'xfs', 'vfat']" :label="$t('filesystem')" required outlined></v-select>
          <v-switch v-model="installToDiskDialog.extra_partition" :label="$t('extra partition')" inset color="green" hide-details="auto"></v-switch>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="installToDiskDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="installToDisk()">{{ $t('install') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" @saved="onFileSaved" />

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary" />
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import FileEditDialog from '@/components/fileEditDialog.vue';

const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');

const overlay = ref(false);
const { t } = useI18n();
const unassignedDisks = ref([]);
const installToDiskDialog = reactive({
  value: false,
  disk: '',
  filesystem: '',
  extra_partition: false,
});

onMounted(() => {
  getUnassignedDisks();
});

const openFileEditor = (path) => {
  selectedFilePath.value = path;
  editFileDialogVisible.value = true;
};
const onFileSaved = (file) => {};

const installToDisk = async () => {
  const installToDiskBody = {
    disk: installToDiskDialog.disk,
    filesystem: installToDiskDialog.filesystem,
    extra_partition: installToDiskDialog.extra_partition,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/installtodisk', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(installToDiskBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('installation failed'));
    }
    showSnackbarSuccess(t('installation successfully, please make sure to reboot the system from the installed disk'));
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
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
    const result = await res.json();
    unassignedDisks.value = result.unassignedDisks || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
