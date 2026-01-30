<template>
  <v-dialog v-model="internalVisible" :persistent="persistent" max-width="900">
    <v-card class="d-flex flex-column pa-0" style="max-height: 80vh">
      <v-card-title class="d-flex align-center">
        <span>{{ title }}</span>
        <v-spacer />
        <v-chip size="small" variant="tonal">{{ path }}</v-chip>
      </v-card-title>
      <v-card-subtitle>
        <v-progress-circular v-if="loading" size="20" indeterminate color="secondary" />
      </v-card-subtitle>
      <v-card-text class="flex-grow-1 d-flex flex-column py-2" style="overflow: hidden">
        <v-alert v-if="errorMessage" type="error" class="mb-3">
          {{ errorMessage }}
        </v-alert>
        <div class="flex-grow-1" style="min-height: 400px; overflow: auto">
          <v-textarea v-model="content" :loading="loading" :disabled="loading" :auto-grow="false" rows="20" style="height: 100%; max-height: 100%; font-family: monospace" hide-details="auto" />
        </div>
        <v-checkbox v-model="createBackupFile" :label="t('create backup')" density="compact" hide-details="auto" class="pt-4"/>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel" color="onPrimary">
          {{ t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" :disabled="loading" @click="saveFile">
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  path: { type: String, required: true },
  title: { type: String, default: 'Edit file' },
  persistent: { type: Boolean, default: false },
  createBackup: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'saved', 'cancel']);
const { t } = useI18n();

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);
const content = ref('');
const errorMessage = ref('');
const createBackupFile = ref(props.createBackup);

const loadFile = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const url = new URL('/api/v1/mos/readfile', window.location.origin);
    url.searchParams.set('path', props.path);

    const res = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error((await res.json()).error || 'Could not load file');

    const data = await res.json();
    content.value = data.content ?? '';
  } catch (e) {
    errorMessage.value = e.message;
    showSnackbarError(t('file could not be loaded'), e.message);
  } finally {
    loading.value = false;
  }
};

const saveFile = async () => {
  loading.value = true;

  try {
    const res = await fetch('/api/v1/mos/editfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify({
        path: props.path,
        content: content.value,
        create_backup: createBackupFile.value,
      }),
    });

    if (!res.ok) throw new Error((await res.json()).error || 'Could not save file');

    showSnackbarSuccess(t('file saved successfully'));
    emit('saved', { path: props.path, content: content.value });
    internalVisible.value = false;
  } catch (e) {
    showSnackbarError(t('file could not be saved'), e.message);
  } finally {
    loading.value = false;
  }
};

watch(
  () => internalVisible.value,
  (visible) => visible && loadFile()
);

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};
</script>

<style scoped>
textarea {
  font-family: monospace !important;
}
</style>
