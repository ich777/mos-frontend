<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('filebrowser') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0">
          <v-card-title class="pb-0">
            <div class="d-flex align-center ga-2">
              <v-btn size="small" variant="text" icon="mdi-home" @click="goRoot()" color="primary" :disabled="loading" />
              <v-btn size="small" variant="text" icon="mdi-arrow-up" @click="goUp()" color="primary" :disabled="!canGoUp || loading" />
              <v-btn size="small" variant="text" icon="mdi-refresh" @click="reload()" color="primary" :disabled="loading" />
              <v-chip size="small" class="ml-2" variant="tonal">
                {{ currentPath || '/' }}
              </v-chip>
              <v-spacer />
              <v-progress-circular v-if="loading" indeterminate size="20" color="primary" />
            </div>
          </v-card-title>

          <v-card-text class="pt-2" style="min-height: 300px; max-height: 75vh; overflow-y: auto">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>{{ t('name') }}</th>
                  <th style="width: 40%">{{ t('path') }}</th>
                  <th style="width: 60px" class="text-center">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && items.length === 0">
                  <td colspan="3" class="text-center text-medium-emphasis">
                    {{ t('no entries') }}
                  </td>
                </tr>
                <tr
                  v-for="item in items"
                  :key="item.path"
                  :class="['cursor-pointer', activeItem && activeItem.path === item.path ? 'bg-primary bg-opacity-10' : '']"
                  @click="setActiveItem(item)"
                  @dblclick.stop.prevent="handleRowDblClick(item)"
                >
                  <td>
                    <div class="d-flex align-center ga-2">
                      <v-icon size="18">
                        {{ item.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}
                      </v-icon>
                      <span>{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.displayPath || item.path }}</span>
                  </td>
                  <td class="text-center">
                    <v-icon v-if="item.type === 'directory'" size="18" class="cursor-pointer" @click.stop="navigateInto(item)" :disabled="loading">mdi-folder-open</v-icon>
                    <v-icon
                      v-if="item.type !== 'directory'"
                      size="18"
                      class="cursor-pointer"
                      @click.stop="
                        deleteFileDialog.value = true;
                        deleteFileDialog.path = item.path;
                      "
                      :disabled="loading"
                    >
                      mdi-delete
                    </v-icon>
                    <span v-if="item.type !== 'directory'">&nbsp;</span>
                    <v-icon
                      v-if="item.type !== 'directory'"
                      size="18"
                      class="cursor-pointer"
                      @click.stop="
                        editFileDialogVisible = true;
                        selectedFilePath = item.path;
                      "
                      :disabled="loading"
                    >
                      mdi-file-edit
                    </v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-divider />
          <v-card-actions class="d-flex align-center">
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Delete File Dialog -->
  <v-dialog v-model="deleteFileDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6" v-if="deleteFileDialog.path">{{ $t('delete') }} - {{ deleteFileDialog.path }}</v-card-title>
      <v-card-text>{{ $t('are you sure you want to delete this file') }}?</v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteFileOrFolder(deleteFileDialog.path); deleteFileDialog.value = false">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" @saved="onFileSaved" />

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary" />
  </v-overlay>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import FileEditDialog from '@/components/fileEditDialog.vue';

const modelValue = ref(true);
const title = ref('');
const selectType = ref('all');
const persistent = ref(false);
const showSelectButton = ref(true);
const roots = ref('');
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge', 'update:modelValue', 'selected', 'cancel']);
const { t } = useI18n();
const internalVisible = computed({
  get: () => modelValue.value,
  set: (val) => emit('update:modelValue', val),
});
const loading = ref(false);
const currentPath = ref('/');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const activeItem = ref(null);
const overlay = ref(false);
const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');
const deleteFileDialog = ref({
  value: false,
  path: null,
});

onMounted(() => {
  loadPath(currentPath.value);
});

const loadPath = async (path = '/') => {
  loading.value = true;
  try {
    const url = new URL('/api/v1/mos/fsnavigator', window.location.origin);
    if (path && path !== '/') {
      url.searchParams.set('path', path);
    }

    const typeParam = selectType.value === 'directory' ? 'directories' : 'all';
    url.searchParams.set('type', typeParam);

    if (roots.value !== '' && roots.value !== '/') {
      url.searchParams.set('roots', roots.value);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('filesystem could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();

    currentPath.value = data.currentPath || path || '/';
    canGoUp.value = !!data.canGoUp;
    parentPath.value = data.parentPath;
    items.value = Array.isArray(data.items) ? data.items : [];
    activeItem.value = null;
  } catch (e) {
    const [mainMessage, detailMessage] = e.message.split('|$|');
    showSnackbarError(t(mainMessage.trim()), detailMessage ? detailMessage.trim() : '');
  } finally {
    loading.value = false;
  }
};

const deleteFileOrFolder = async (path, force = true, recursive = false) => {
  const payload = { path: path, force: true, recursive };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('file or folder could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('successfully deleted'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const isSelectable = (item) => {
  if (!item) return false;
  if (selectType.value === 'directory') return item.type === 'directory';
  if (selectType.value === 'file') return item.type !== 'directory';
  return true;
};

const setActiveItem = (item) => {
  activeItem.value = item;
  selectedFilePath.value = item?.path || '';
};

const navigateInto = (item) => {
  if (!item || item.type !== 'directory') return;
  loadPath(item.path);
};

const handleRowDblClick = (item) => {
  if (!item) return;
  if (item.type === 'directory') {
    navigateInto(item);
  } else if (isSelectable(item)) {
    confirmSelect(item);
  }
};

const goRoot = () => {
  loadPath('/');
};

const goUp = () => {
  if (!canGoUp.value || !parentPath.value) return;
  loadPath(parentPath.value);
};

const reload = () => {
  loadPath(currentPath.value || '/');
};

const onFileSaved = () => {
  loadPath(currentPath.value || '/');
};

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};

const confirmSelect = (explicitItem) => {
  const item = explicitItem || activeItem.value;
  if (!item || !isSelectable(item)) return;

  emit('selected', {
    name: item.name,
    path: item.path,
    type: item.type,
    displayPath: item.displayPath ?? item.path,
  });

  internalVisible.value = false;
};

watch(
  () => internalVisible.value,
  (visible) => {
    if (visible) {
      const startPath = initialPath.value || '/';
      loadPath(startPath);
    }
  },
);
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
