<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('shares') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="sharesLoading" :loading="true" type="card" />
        <v-card v-else-if="shares.length === 0 && !poolsLoading" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no shares have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list class="bg-transparent">
              <template v-for="(share, index) in shares.smb" :key="share.id">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-folder</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ share.name }}
                    <v-chip color="onPrimary" size="small" class="ml-2" label>
                      {{ $t('smb') }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ share.path }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="openDeleteSmbDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openEditSmbDialog(share)">
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
                <v-divider v-if="index < shares.smb.length - 1 || (shares.smb.length > 0 && shares.nfs.length > 0)" />
              </template>
              <template v-for="(share, index) in shares.nfs" :key="share.id">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-folder</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ share.name }}
                    <v-chip color="onPrimary" size="small" class="ml-2" label>
                      {{ $t('nfs') }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ share.path }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon v-bind="props" color="onPrimary">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="openDeleteNfsDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openEditSmbDialog(share)">
                          <template #prepend>
                            <v-icon>mdi-text-box-edit</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
                <v-divider v-if="index < shares.nfs.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Smb Dialog -->
  <v-dialog v-model="createSmbDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('create share') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createSmbDialog.shareName" :label="$t('share name')" required autofocus />
          <v-select v-model="createSmbDialog.poolName" :items="pools" item-title="name" item-value="name" :label="$t('pool')" required />
          <v-text-field
            v-model="createSmbDialog.subPath"
            :label="$t('select directory')"
            append-inner-icon="mdi-folder"
            required
            @click:append-inner="
              openFsDialog(
                (item) => {
                  createSmbDialog.subPath = item.path;
                },
                pools.find((p) => p.name === createSmbDialog.poolName)?.mountPoint || '/',
              )
            "
          />
          <v-select v-model="createSmbDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
          <v-select v-model="createSmbDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
          <v-text-field v-model="createSmbDialog.comment" :label="$t('comment')" clearable />
          <v-divider></v-divider>
          <v-btn variant="text" @click="createSmbDialog.showAdvanced = !createSmbDialog.showAdvanced" class="mb-4">
            {{ createSmbDialog.showAdvanced ? $t('hide advanced options') : $t('show advanced options') }}
          </v-btn>
          <v-slide-y-transition>
            <div v-if="createSmbDialog.showAdvanced">
              <v-text-field v-model="createSmbDialog.create_mask" :label="$t('create mask')" required />
              <v-text-field v-model="createSmbDialog.directory_mask" :label="$t('directory mask')" required />
              <v-switch v-model="createSmbDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createSmbDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createSmbDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createSmbDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
              <v-switch v-model="createSmbDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
            </div>
          </v-slide-y-transition>
          <v-switch v-model="createSmbDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createSmbDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createSmbDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createSmbDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="createSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createShareSmb()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Nfs Dialog -->
  <v-dialog v-model="createNfsDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('add nfs share') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createNfsDialog.shareName" :label="$t('share name')" required autofocus />
          <v-select v-model="createNfsDialog.poolName" :items="pools" item-title="name" item-value="name" :label="$t('pool')" required />
          <v-text-field
            v-model="createNfsDialog.subPath"
            :label="$t('select directory')"
            append-inner-icon="mdi-folder"
            required
            @click:append-inner="
              openFsDialog(
                (item) => {
                  createNfsDialog.subPath = item.path;
                },
                pools.find((p) => p.name === createNfsDialog.poolName)?.mountPoint || '/',
              )
            "
          />
          <v-text-field v-model="createNfsDialog.source" :label="$t('source')" required />
          <v-text-field v-model="createNfsDialog.anonuid" :label="$t('anonymous uid')" type="number" />
          <v-text-field v-model="createNfsDialog.anongid" :label="$t('anonymous gid')" type="number" />
          <v-text-field v-model="createNfsDialog.write_operations" :label="$t('write operations')" />
          <v-text-field v-model="createNfsDialog.mapping" :label="$t('mapping')" />
          <v-switch v-model="createNfsDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="createNfsDialog.secure" :label="$t('secure')" inset hide-details density="compact" class="ml-4" color="green" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="createNfsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createShareNfs()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Smb Dialog -->
  <v-dialog v-model="deleteSmbDialog.value" max-width="400">
    <v-card class="pa-0">
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this share?') }}
        <v-checkbox v-model="deleteSmbDialog.deleteDirectory" :label="$t('delete directory')" class="mt-4" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="deleteSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteShareSmb(deleteSmbDialog.share, deleteSmbDialog.deleteDirectory)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Nfs Dialog -->
  <v-dialog v-model="deleteNfsDialog.value" max-width="400">
    <v-card class="pa-0">
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this nfs share?') }}
        <v-checkbox v-model="deleteNfsDialog.deleteDirectory" :label="$t('delete directory')" class="mt-4" density="compact" hide-details=""/>
        <v-checkbox v-model="deleteNfsDialog.removePathRule" :label="$t('remove path rule')" density="compact" hide-details=""/>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="deleteNfsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteShareNfs(deleteNfsDialog.share)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editSmbDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit share') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="editSmbDialog.name" :label="$t('share name')" readonly />
          <v-text-field v-model="editSmbDialog.path" :label="$t('path')" readonly />
          <v-text-field v-model="editSmbDialog.comment" :label="$t('comment')" clearable />
          <v-select v-model="editSmbDialog.valid_users" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('read rights')" multiple />
          <v-select v-model="editSmbDialog.write_list" :items="Array.isArray(smbUsers) ? smbUsers.map((user) => user.username) : []" :label="$t('write rights')" multiple />
          <v-switch v-model="editSmbDialog.enabled" :label="$t('enabled')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.browseable" :label="$t('browseable')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.read_only" :label="$t('read only')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.guest_ok" :label="$t('guest ok')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.force_root" :label="$t('force root')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.inherit_permissions" :label="$t('inherit permissions')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.hide_dot_files" :label="$t('hide dot files')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.preserve_case" :label="$t('preserve case')" inset hide-details density="compact" class="ml-4" color="green" />
          <v-switch v-model="editSmbDialog.case_sensitive" :label="$t('case sensitive')" inset hide-details density="compact" class="ml-4" color="green" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="editSmbDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="updateShareSmb(editSmbDialog)">
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
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="targetDevicesDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="setTargetDevicesSmb(targetDevicesDialog.share, targetDevicesDialog.selectedDevices)">
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
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-plus</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openCreateSmbDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add smb share') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateNfsDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add nfs share') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

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
const shares = ref([
  {
    smb: [],
    nfs: [],
  },
]);
const pools = ref([]);
const smbUsers = ref([]);
const createSmbDialog = reactive({
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
const createNfsDialog = reactive({
  value: false,
  shareName: '',
  poolName: '',
  subPath: '',
  source: '',
  enabled: true,
  read_only: false,
  anonuid: null,
  anongid: null,
  write_operations: '',
  mapping: '',
  secure: true,
});
const editSmbDialog = reactive({
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
const deleteSmbDialog = reactive({
  value: false,
  share: null,
  deleteDirectory: false,
});
const deleteNfsDialog = reactive({
  value: false,
  share: null,
  deleteDirectory: false,
  removePathRule: true
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

const getShares = async () => {
  try {
    const res = await fetch('/api/v1/shares', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();

    shares.value.smb = result.smb || [];
    shares.value.nfs = result.nfs || [];
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

const createShareSmb = async () => {
  const newShare = {
    shareName: createSmbDialog.shareName,
    poolName: createSmbDialog.poolName,
    subPath: createSmbDialog.subPath,
    comment: createSmbDialog.comment,
    enabled: createSmbDialog.enabled,
    browseable: createSmbDialog.browseable,
    read_only: createSmbDialog.read_only,
    guest_ok: createSmbDialog.guest_ok,
    force_root: createSmbDialog.force_root,
    valid_users: createSmbDialog.valid_users,
    write_list: createSmbDialog.write_list,
    create_mask: createSmbDialog.create_mask,
    directory_mask: createSmbDialog.directory_mask,
    inherit_permissions: createSmbDialog.inherit_permissions,
    hide_dot_files: createSmbDialog.hide_dot_files,
    preserve_case: createSmbDialog.preserve_case,
    case_sensitive: createSmbDialog.case_sensitive,
    policies: createSmbDialog.policies,
    createDirectory: createSmbDialog.createDirectory,
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

    createSmbDialog.value = false;
    clearCreateSmbDialog();

    getShares();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const createShareNfs = async () => {
  const newShare = {
    shareName: createNfsDialog.shareName,
    poolName: createNfsDialog.poolName,
    subPath: createNfsDialog.subPath,
    source: createNfsDialog.source,
    enabled: createNfsDialog.enabled,
    read_only: createNfsDialog.read_only,
    anonuid: createNfsDialog.anonuid,
    anongid: createNfsDialog.anongid,
    write_operations: createNfsDialog.write_operations,
    mapping: createNfsDialog.mapping,
    secure: createNfsDialog.secure,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/shares/nfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(newShare),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('nfs share could not be created'));
    showSnackbarSuccess(t('nfs share created successfully'));

    createNfsDialog.value = false;
    clearCreateNfsDialog();

    getShares();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const updateShareSmb = async (shareDialog) => {
  editSmbDialog.value = false;
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

    clearEditSmbDialog();
    getShares();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const deleteShareSmb = async () => {
  deleteSmbDialog.value = false;
  const delShare = deleteSmbDialog.deleteDirectory ? { deleteDirectory: true } : {};

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/smb/${encodeURIComponent(deleteSmbDialog.share.id)}`, {
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
    clearDeleteSmbDialog();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const deleteShareNfs = async () => {
  deleteNfsDialog.value = false;
  const payload = {
    deleteDirectory: deleteNfsDialog.deleteDirectory,
    removePathRule: deleteNfsDialog.removePathRule,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/shares/nfs/${encodeURIComponent(deleteNfsDialog.share.id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('nfs share could not be deleted'));
    showSnackbarSuccess(t('nfs share deleted successfully'));
    getShares();
    clearDeleteNfsDialog();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const getTargetDevicesSmb = async (share) => {
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

const setTargetDevicesSmb = async (share, devices) => {
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

const openCreateSmbDialog = () => {
  createSmbDialog.value = true;
  clearCreateSmbDialog();
};
const openCreateNfsDialog = () => {
  createNfsDialog.value = true;
  clearCreateNfsDialog();
};
const openDeleteSmbDialog = (share) => {
  deleteSmbDialog.value = true;
  deleteSmbDialog.share = share;
};
const openDeleteNfsDialog = (share) => {
  deleteNfsDialog.value = true;
  deleteNfsDialog.share = share;
};
const openEditSmbDialog = (share) => {
  editSmbDialog.value = true;
  editSmbDialog.share = share;
  editSmbDialog.name = share.name;
  editSmbDialog.path = share.path;
  editSmbDialog.enabled = share.enabled;
  editSmbDialog.read_only = share.read_only;
  editSmbDialog.browseable = share.browseable;
  editSmbDialog.write_list = share.write_list || [];
  editSmbDialog.valid_users = share.valid_users || [];
  editSmbDialog.guest_ok = share.guest_ok || false;
  editSmbDialog.force_root = share.force_root || false;
  editSmbDialog.inherit_permissions = share.inherit_permissions || true;
  editSmbDialog.hide_dot_files = share.hide_dot_files || false;
  editSmbDialog.preserve_case = share.preserve_case || true;
  editSmbDialog.case_sensitive = share.case_sensitive || true;
  editSmbDialog.comment = share.comment || '';
};
const openTargetDevicesDialog = async (share) => {
  targetDevicesDialog.value = true;
  targetDevicesDialog.share = share;
  targetDevicesDialog.selectedDevices = [];
  targetDevicesDialog.targetDevices = [];
  targetDevicesDialog.targetDevices = await getDevicesOfPool(share.pool);
  targetDevicesDialog.selectedDevices = await getTargetDevicesSmb(share);
};
const clearCreateSmbDialog = () => {
  createSmbDialog.shareName = '';
  createSmbDialog.poolName = null;
  createSmbDialog.subPath = '';
  createSmbDialog.valid_users = [];
  createSmbDialog.write_list = [];
  createSmbDialog.comment = '';
  createSmbDialog.enabled = true;
  createSmbDialog.browseable = true;
  createSmbDialog.read_only = false;
  createSmbDialog.guest_ok = false;
  createSmbDialog.force_root = false;
  createSmbDialog.create_mask = '0664';
  createSmbDialog.directory_mask = '0775';
  createSmbDialog.inherit_permissions = true;
  createSmbDialog.hide_dot_files = false;
  createSmbDialog.preserve_case = true;
  createSmbDialog.case_sensitive = true;
  createSmbDialog.policies = [];
  createSmbDialog.createDirectory = true;
};
const clearEditSmbDialog = () => {
  editSmbDialog.value = false;
  editSmbDialog.share = null;
  editSmbDialog.name = '';
  editSmbDialog.comment = '';
  editSmbDialog.enabled = false;
  editSmbDialog.browseable = false;
  editSmbDialog.read_only = false;
  editSmbDialog.write_list = [];
  editSmbDialog.valid_users = [];
};
const clearDeleteSmbDialog = () => {
  deleteSmbDialog.value = false;
  deleteSmbDialog.share = null;
  deleteSmbDialog.deleteDirectory = false;
};
const clearDeleteNfsDialog = () => {
  deleteNfsDialog.value = false;
  deleteNfsDialog.share = null;
};
const clearCreateNfsDialog = () => {
  createNfsDialog.shareName = '';
  createNfsDialog.poolName = '';
  createNfsDialog.subPath = '';
  createNfsDialog.source = '';
  createNfsDialog.enabled = true;
  createNfsDialog.read_only = false;
  createNfsDialog.anonuid = null;
  createNfsDialog.anongid = null;
  createNfsDialog.write_operations = '';
  createNfsDialog.mapping = '';
  createNfsDialog.secure = true;
};
</script>
