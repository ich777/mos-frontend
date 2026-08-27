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
      <v-card-text class="d-flex flex-column py-2 px-4" style="flex: 1; overflow: hidden; min-height: 400px">
        <v-alert v-if="errorMessage" type="error" class="mb-3">
          {{ errorMessage }}
        </v-alert>
        <div ref="editorContainer" class="editor-wrapper"></div>
        <v-checkbox v-model="createBackupFile" :label="t('create backup')" density="compact" hide-details="auto" class="mt-2"/>
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
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
const theme = useTheme();

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const editorContainer = ref(null);
const loading = ref(false);
const content = ref('');
const errorMessage = ref('');
const createBackupFile = ref(props.createBackup);
let editorView = null;

const createEditor = () => {
  if (!editorContainer.value) return;

  const isDark = theme.global.current.value.dark;

  const extensions = [
    basicSetup,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const value = update.state.doc.toString();
        content.value = value;
      }
    }),
    EditorView.lineWrapping,
  ];

  if (isDark) {
    extensions.push(oneDark);
  }

  const state = EditorState.create({
    doc: content.value || '',
    extensions,
  });

  editorView = new EditorView({
    state,
    parent: editorContainer.value,
  });
};

const destroyEditor = () => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
};

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
    
    // Update editor content after loading
    if (editorView) {
      const currentValue = editorView.state.doc.toString();
      if (content.value !== currentValue) {
        editorView.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: content.value,
          },
        });
      }
    }
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
  async (visible) => {
    if (visible) {
      await nextTick();
      if (!editorView) {
        createEditor();
      }
      loadFile();
    } else {
      destroyEditor();
    }
  }
);

watch(
  () => theme.global.current.value.dark,
  () => {
    if (internalVisible.value) {
      destroyEditor();
      createEditor();
    }
  }
);

onMounted(() => {
  // Editor will be created when dialog becomes visible
});

onUnmounted(() => {
  destroyEditor();
});

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};
</script>

<style scoped>
.editor-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: auto;
  background: rgb(var(--v-theme-surface));
  margin-bottom: 12px;
}

.editor-wrapper :deep(.cm-editor) {
  height: 100%;
  overflow: auto !important;
}

.editor-wrapper :deep(.cm-scroller) {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}
</style>
