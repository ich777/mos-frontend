<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('shares') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="sharesLoading" :loading="true" type="card" />
        <v-card v-else style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list class="bg-transparent">
              <template v-for="(share, index) in shares" :key="share.id">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-folder</v-icon>
                  </template>
                  <v-list-item-title>{{ share.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ share.path }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="openDeleteDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openEditDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-text-box-edit</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="checkMergerFs(share.pool)" @click="openTargetDevicesDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-target</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('target devices') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
                <v-divider v-if="index < shares.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Dialog -->
  <v-dialog v-model="createDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create share') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createDialog.shareName" :label="$t('share name')" required autofocus />
          <v-select v-model="createDialog.poolName" :items="pools" item-title="name" item-value="name" :label="$t('pool')" required />
          <v-text-field
            v-model="createDialog.subPath"
            :label="$t('select directory')"
            append-inner-icon="mdi-folder"
            required
            @click:append-inner="
              openFsDialog((item) => {
                createDialog.subPath = item.path;
              }, pools.find((p) => p.name === createDialog.poolName)?.mountPoint || '/')
            "
          />
          <v-select v-model="createDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
          <v-select v-model="createDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
          <v-text-field v-model="createDialog.comment" :label="$t('comment')" clearable />
          <v-divider></v-divider>
          <v-btn variant="text" @click="createDialog.showAdvanced = !createDialog.showAdvanced" class="mb-4">
            {{ createDialog.showAdvanced ? $t('hide advanced options') : $t('show advanced options') }}
          </v-btn>
          <v-slide-y-transition>
            <div v-if="createDialog.showAdvanced">
              <v-text-field v-model="createDialog.create_mask" :label="$t('create mask')" required />
              <v-text-field v-model="createDialog.directory_mask" :label="$t('directory mask')" required />
              <v-switch v-model="createDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
            </div>
          </v-slide-y-transition>
          <v-switch v-model="createDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="createDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createShare()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card class="pa-0">
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this share?') }}
        <v-checkbox v-model="deleteDialog.deleteDirectory" :label="$t('delete directory')" class="mt-4" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteShare(deleteDialog.share, deleteDialog.deleteDirectory)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit share') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="editDialog.name" :label="$t('share name')" readonly />
          <v-text-field v-model="editDialog.path" :label="$t('path')" readonly />
          <v-text-field v-model="editDialog.comment" :label="$t('comment')" clearable />
          <v-select v-model="editDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
          <v-select v-model="editDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
          <v-switch v-model="editDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="editDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="updateShare(editDialog)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Target Devices Dialog -->
  <v-dialog v-model="targetDevicesDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('target devices') }}</v-card-title>
      <v-card-text>
        <v-select
          v-model="targetDevicesDialog.selectedDevices"
          :items="targetDevicesDialog.targetDevices"
          item-title="name"
          item-value="value"
          :label="$t('target devices')"
          multiple
          chips
          clearable
          dense
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="targetDevicesDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="setTargetDevices(targetDevicesDialog.share, targetDevicesDialog.selectedDevices)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog
    v-model="fsDialog"
    :initial-path="fsDialogInitialPath"
    :roots="fsDialogInitialPath != '' ? fsDialogInitialPath : ''"
    select-type="directory"
    :title="$t('select directory')"
    @selected="handleFsSelected"
  />

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
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const fsDialogInitialPath = ref('/');
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const overlay = ref(false);
const shares = ref([]);
const pools = ref([]);
const smbUsers = ref([]);
const createDialog = reactive({
  value: false,
  shareName: '',
  poolName: null,
  subPath: '',
  write_list: [],
  valid_users: [],
  comment: '',
  enabled: true,
  browseable: true,
  read_only: false,
  guest_ok: false,
  force_root: false,
  create_mask: '0664',
  directory_mask: '0775',
  inherit_permissions: true,
  hide_dot_files: false,
  preserve_case: true,
  case_sensitive: true,
  policies: [],
  createDirectory: true,
  showAdvanced: false,
});
const editDialog = reactive({
  value: false,
  share: null,
  name: '',
  enabled: true,
  browseable: true,
  read_only: false,
  guest_ok: false,
  force_root: false,
  inherit_permissions: true,
  hide_dot_files: false,
  preserve_case: true,
  case_sensitive: true,
  write_list: [],
  valid_users: [],
});
const deleteDialog = reactive({
  value: false,
  share: null,
  deleteDirectory: false,
});
const sharesLoading = ref(true);
const openFsDialog = (cb, mntPoint = '/') => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
  fsDialogInitialPath.value = mntPoint;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    if (fsDialogInitialPath.value === '' || fsDialogInitialPath.value === '/') {
      fsDialogCallback.value(item);
    } else {
      const relativePath = item.path.replace(fsDialogInitialPath.value, '');
      const trimmedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      fsDialogCallback.value({ ...item, path: trimmedPath });
    }
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};
const targetDevicesDialog = reactive({
  value: false,
  share: null,
  selectedDevices: [],
  targetDevices: [{ name: '', value: '' }],
});

onMounted(async () => {
  await getShares();
  await getPools();
  sharesLoading.value = false;
  getSmbUsers();
});

const openCreatePoolDialog = () => {
  createDialog.value = true;
  clearCreateDialog();
};

const openDeleteDialog = (share) => {
  deleteDialog.value = true;
  deleteDialog.share = share;
};

const openEditDialog = (share) => {
  editDialog.value = true;
  editDialog.share = share;
  editDialog.name = share.name;
  editDialog.path = share.path;
  editDialog.enabled = share.enabled;
  editDialog.read_only = share.read_only;
  editDialog.browseable = share.browseable;
  editDialog.write_list = share.write_list || [];
  editDialog.valid_users = share.valid_users || [];
  editDialog.guest_ok = share.guest_ok || false;
  editDialog.force_root = share.force_root || false;
  editDialog.inherit_permissions = share.inherit_permissions || true;
  editDialog.hide_dot_files = share.hide_dot_files || false;
  editDialog.preserve_case = share.preserve_case || true;
  editDialog.case_sensitive = share.case_sensitive || true;
  editDialog.comment = share.comment || '';
};

const openTargetDevicesDialog = async (share) => {
  targetDevicesDialog.value = true;
  targetDevicesDialog.share = share;
  targetDevicesDialog.selectedDevices = [];
  targetDevicesDialog.targetDevices = [];
  targetDevicesDialog.targetDevices = await getDevicesOfPool(share.pool);
  targetDevicesDialog.selectedDevices = await getTargetDevices(share);
};

const getShares = async () => {
  try {
    const res = await fetch('/api/v1/shares', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();

    if (result.length > 0) {
      shares.value = result[0].smb;
    } else {
      shares.value = [];
    }
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('pools could not be loaded'));
    const result = await res.json();
    pools.value = result;
  } catch (e) {
    showSnackbarError(e.message);
    return [];
  }
};

const getSmbUsers = async () => {
  try {
    const res = await fetch('/api/v1/auth/users?samba_user=true', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('smb users could not be loaded'));
    smbUsers.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
    return [];
  }
};

const createShare = async () => {
  const newShare = {
    shareName: createDialog.shareName,
    poolName: createDialog.poolName,
    subPath: createDialog.subPath,
    comment: createDialog.comment,
    enabled: createDialog.enabled,
    browseable: createDialog.browseable,
    read_only: createDialog.read_only,
    guest_ok: createDialog.guest_ok,
    force_root: createDialog.force_root,
    valid_users: createDialog.valid_users,
    write_list: createDialog.write_list,
    create_mask: createDialog.create_mask,
    directory_mask: createDialog.directory_mask,
    inherit_permissions: createDialog.inherit_permissions,
    hide_dot_files: createDialog.hide_dot_files,
    preserve_case: createDialog.preserve_case,
    case_sensitive: createDialog.case_sensitive,
    policies: createDialog.policies,
    createDirectory: createDialog.createDirectory,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/shares/smb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(newShare),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('share could not be created'));
    showSnackbarSuccess(t('share created successfully'));

    createDialog.value = false;
    clearCreateDialog();

    getShares();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const updateShare = async (shareDialog) => {
  editDialog.value = false;
  const editShare = {
    comment: shareDialog.comment,
    enabled: shareDialog.enabled,
    read_only: shareDialog.read_only,
    browseable: shareDialog.browseable,
    guest_ok: shareDialog.guest_ok,
    force_root: shareDialog.force_root,
    inherit_permissions: shareDialog.inherit_permissions,
    hide_dot_files: shareDialog.hide_dot_files,
    preserve_case: shareDialog.preserve_case,
    case_sensitive: shareDialog.case_sensitive,
    write_list: shareDialog.write_list,
    valid_users: shareDialog.valid_users,
  };
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(shareDialog.share.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(editShare),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('share could not be updated'));
    showSnackbarSuccess(t('share updated successfully'));

    clearEditDialog();
    getShares();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const deleteShare = async () => {
  deleteDialog.value = false;
  const delShare = deleteDialog.deleteDirectory ? { deleteDirectory: true } : {};

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(deleteDialog.share.id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(delShare),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('share could not be deleted'));
    showSnackbarSuccess(t('share deleted successfully'));
    getShares();
    clearDeleteDialog();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const getTargetDevices = async (share) => {
  try {
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(share.id)}/target-devices`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) throw new Error(t('target devices could not be loaded'));
    const result = await res.json();

    if (result.data != null && result.data.pathRule != null && result.data.pathRule.targetDevices.length > 0) {
      return result.data.pathRule.targetDevices;
    } else {
      return [];
    }
  } catch (e) {
    showSnackbarError(e.message);
    return [];
  }
};

const setTargetDevices = async (share, devices) => {
  const payload = {
    targetDevices: devices,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(share.id)}/target-devices`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(t('target devices could not be set'));
    showSnackbarSuccess(t('target devices set successfully'));
    targetDevicesDialog.value = false;
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const checkMergerFs = (pool) => {
  const mergerFsPools = pools.value.filter((p) => p.type === 'mergerfs').map((p) => p.name);
  return mergerFsPools.includes(pool);
};

const getDevicesOfPool = async (pool) => {
  try {
    const localPool = pools.value.find((p) => p.name === pool);
    const dataDevices = Array.isArray(localPool?.data_devices) ? localPool.data_devices : [];

    const normalize = (d) => {
      if (typeof d === 'string') return { name: d, value: d };
      const value = parseInt(d?.slot) || '';
      const name = d?.device || '';
      return { name, value };
    };

    return dataDevices.map(normalize);
  } catch (e) {
    return [];
  }
};

const clearCreateDialog = () => {
  createDialog.shareName = '';
  createDialog.poolName = null;
  createDialog.subPath = '';
  createDialog.valid_users = [];
  createDialog.write_list = [];
  createDialog.comment = '';
  createDialog.enabled = true;
  createDialog.browseable = true;
  createDialog.read_only = false;
  createDialog.guest_ok = false;
  createDialog.force_root = false;
  createDialog.create_mask = '0664';
  createDialog.directory_mask = '0775';
  createDialog.inherit_permissions = true;
  createDialog.hide_dot_files = false;
  createDialog.preserve_case = true;
  createDialog.case_sensitive = true;
  createDialog.policies = [];
  createDialog.createDirectory = true;
};

const clearEditDialog = () => {
  editDialog.value = false;
  editDialog.share = null;
  editDialog.name = '';
  editDialog.comment = '';
  editDialog.enabled = false;
  editDialog.browseable = false;
  editDialog.read_only = false;
  editDialog.write_list = [];
  editDialog.valid_users = [];
};

const clearDeleteDialog = () => {
  deleteDialog.value = false;
  deleteDialog.share = null;
  deleteDialog.deleteDirectory = false;
};
</script>
