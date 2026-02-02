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

          <v-card-text class="pa-0" style="min-height: 300px; max-height: 75vh; overflow-y: auto">
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
                    <div v-if="item.type === 'directory'">
                      <v-icon size="18" class="cursor-pointer" @click.stop="navigateInto(item)" :disabled="loading">mdi-folder-open</v-icon>
                    </div>
                    <div v-else>
                      <v-icon size="18" class="cursor-pointer" @click.stop="openEditFileDialog(item)" :disabled="loading">mdi-file-edit</v-icon>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-divider />
          <v-card-actions class="d-flex align-center">
            <v-btn rounded variant="flat" color="primary" @click="openCreateFolderDialog(currentPath)">{{ $t('create folder') }}</v-btn>
            <v-btn rounded variant="flat" color="primary" @click="openCreateFileDialog(currentPath)">{{ $t('create file') }}</v-btn>
            <v-btn rounded variant="flat" :disabled="!activeItem" color="primary" @click="openDeleteFileDialog(activeItem)">{{ $t('delete') }}</v-btn>
            <v-btn rounded variant="flat" :disabled="!activeItem" color="primary" @click="openChModDialog(activeItem)">{{ $t('adjust permissions') }}</v-btn>
            <v-btn rounded variant="flat" :disabled="!activeItem" color="primary" @click="openChOwnDialog(activeItem)">{{ $t('adjust ownership') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Delete File Dialog -->
  <v-dialog v-model="deleteFileDialog.value" max-width="500">
    <v-card class="pa-0" :title="`${$t('delete')} - ${deleteFileDialog.path}`" prepend-icon="mdi-delete">
      <v-card-text>
        <v-container class="pb-4 pt-0 px-0">{{ $t('are you sure you want to delete this file') }}?</v-container>
        <v-checkbox v-if="deleteFileDialog.pathType === 'directory'" v-model="deleteFileDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        <v-checkbox v-model="deleteFileDialog.force" :label="$t('force')" :disabled="loading" hide-details="auto" density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteFile(deleteFileDialog.path, deleteFileDialog.force, deleteFileDialog.recursive)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Folder Dialog -->
  <v-dialog v-model="createFolderDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('create folder')" prepend-icon="mdi-folder-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFolderDialog.folderName" :label="$t('folder name')" :disabled="loading" />
          <v-select
            v-model="createFolderDialog.userddsel"
            :label="$t('user')"
            :items="createFolderDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFolderDialog.user = createFolderDialog.group = '500';
                else if (val === 'admin') createFolderDialog.user = createFolderDialog.group = '0';
                else createFolderDialog.user = createFolderDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFolderDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFolderDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createFolder(createFolderDialog.currentPath, createFolderDialog.folderName, createFolderDialog.user, createFolderDialog.group, createFolderDialog.permissions)">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create File Dialog -->
  <v-dialog v-model="createFileDialog.value" max-width="600">
    <v-card class="pa-0" :title="$t('create file')" prepend-icon="mdi-file-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFileDialog.fileName" :label="$t('file name')" :disabled="loading" />
          <v-textarea v-model="createFileDialog.content" :label="$t('content')" :disabled="loading" rows="6" />
          <v-select
            v-model="createFileDialog.userddsel"
            :label="$t('user')"
            :items="createFileDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFileDialog.user = createFileDialog.group = '500';
                else if (val === 'admin') createFileDialog.user = createFileDialog.group = '0';
                else createFileDialog.user = createFileDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFileDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn
          color="primary"
          @click="createFile(createFileDialog.currentPath, createFileDialog.fileName, createFileDialog.content, createFileDialog.user, createFileDialog.group, createFileDialog.permissions)"
        >
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chmod Dialog -->
  <v-dialog v-model="setChmodDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('adjust permissions')" prepend-icon="mdi-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="setChmodDialog.permissions" :label="$t('permissions')" :disabled="loading" />
          <v-checkbox v-model="setChmodDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChmodDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setChmod(setChmodDialog.path, setChmodDialog.permissions, setChmodDialog.recursive)">
          {{ $t('adjust') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chown Dialog -->
  <v-dialog v-model="setChownDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('adjust ownership')" prepend-icon="mdi-account-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-select
            v-model="setChownDialog.userddsel"
            :label="$t('user')"
            :items="setChownDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') setChownDialog.user = setChownDialog.group = '500';
                else if (val === 'admin') setChownDialog.user = setChownDialog.group = '0';
                else setChownDialog.user = setChownDialog.group = '';
              }
            "
          />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.group" :label="$t('group')" :disabled="loading" />
          <v-checkbox v-model="setChownDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChownDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setChown(setChownDialog.path, setChownDialog.user, setChownDialog.group, setChownDialog.recursive)">
          {{ $t('adjust') }}
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
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import FileEditDialog from '@/components/fileEditDialog.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge', 'update:modelValue', 'selected', 'cancel']);
const modelValue = ref(true);
const selectType = ref('all');
const roots = ref('');
const { t } = useI18n();
const loading = ref(false);
const currentPath = ref('/');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const activeItem = ref(null);
const overlay = ref(false);
const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');
const deleteFileDialog = reactive({
  value: false,
  path: null,
  pathType: '',
  recursive: false,
  force: true,
});
const createFolderDialog = reactive({
  value: false,
  folderName: '',
  currentPath: '',
  userddsel: 'mos',
  userdd: ['mos', 'admin', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const createFileDialog = reactive({
  value: false,
  fileName: '',
  currentPath: '',
  content: '',
  userddsel: 'mos',
  userdd: ['mos', 'admin', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const setChmodDialog = reactive({
  value: false,
  path: '',
  permissions: '777',
  recursive: false,
});
const setChownDialog = reactive({
  value: false,
  path: '',
  userddsel: 'mos',
  userdd: ['mos', 'admin', 'custom'],
  user: '500',
  group: '500',
  recursive: false,
});

const internalVisible = computed({
  get: () => modelValue.value,
  set: (val) => emit('update:modelValue', val),
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

const deleteFile = async (path, force = true, recursive = false) => {
  const payload = { path: path, force: force, recursive: recursive };
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
      throw new Error(`${t('file could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('successfully deleted'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    clearDeleteDialog();
    overlay.value = false;
  }
};

const createFolder = async (path, folderName, user = '500', group = '500', permissions = '777') => {
  if (!folderName || folderName.trim() === '') {
    showSnackbarError(t('folder name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + folderName, user: user, group: group, permissions: permissions };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/createfolder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('folder could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('successfully created folder'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    createFolderDialog.value = false;
    overlay.value = false;
  }
};

const createFile = async (path, fileName, content = '', user = '500', group = '500', permissions = '777') => {
  if (!fileName || fileName.trim() === '') {
    showSnackbarError(t('file name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + fileName, content: content, user: user, group: group, permissions: permissions };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/createfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('file could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('successfully created file'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    createFileDialog.value = false;
    overlay.value = false;
  }
};

const setChmod = async (path, permissions = '777', recursive = false) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path, permissions: permissions, recursive: recursive };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/chmod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('permissions could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('permissions successfully set'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    setChmodDialog.value = false;
    overlay.value = false;
  }
};

const setChown = async (path, user = '500', group = '500', recursive = false) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path, user: user, group: group, recursive: recursive };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/chown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ownership could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('ownership successfully set'));
    reload();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    setChownDialog.value = false;
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

const openDeleteFileDialog = (item) => {
  if (!item) return;
  deleteFileDialog.value = true;
  deleteFileDialog.path = item.path;
  deleteFileDialog.pathType = item.type;
};
const clearDeleteDialog = () => {
  deleteFileDialog.value = false;
  deleteFileDialog.path = null;
  deleteFileDialog.pathType = '';
  deleteFileDialog.recursive = false;
  deleteFileDialog.force = true;
};
const openEditFileDialog = (item) => {
  if (!item || item.type === 'directory') return;
  selectedFilePath.value = item.path;
  editFileDialogVisible.value = true;
};
const openCreateFolderDialog = (currentPath) => {
  createFolderDialog.value = true;
  createFolderDialog.currentPath = currentPath;
  createFolderDialog.folderName = '';
  createFolderDialog.userddsel = 'mos';
  createFolderDialog.user = '500';
  createFolderDialog.group = '500';
  createFolderDialog.permissions = '777';
};
const openCreateFileDialog = (currentPath) => {
  createFileDialog.value = true;
  createFileDialog.currentPath = currentPath;
  createFileDialog.fileName = '';
  createFileDialog.content = '';
  createFileDialog.userddsel = 'mos';
  createFileDialog.user = '500';
  createFileDialog.group = '500';
  createFileDialog.permissions = '777';
};
const openChModDialog = (item) => {
  setChmodDialog.value = true;
  setChmodDialog.path = item.path;
  setChmodDialog.permissions = '777';
  setChmodDialog.recursive = false;
};
const openChOwnDialog = (item) => {
  setChownDialog.value = true;
  setChownDialog.path = item.path;
  setChownDialog.userddsel = 'mos';
  setChownDialog.user = '500';
  setChownDialog.group = '500';
  setChownDialog.recursive = false;
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
