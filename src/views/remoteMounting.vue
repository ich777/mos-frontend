<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('remote mounting') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item v-for="remote in remotes" :key="remote.id">
                    <v-list-item-title>
                      {{ remote.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ remote.server }}</v-list-item-subtitle>
                    <template v-slot:prepend>
                      <v-icon :color="remote.status === 'mounted' ? 'green' : 'red'">mdi-network</v-icon>
                    </template>
                    <template v-slot:append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn variant="text" icon v-bind="props" color="onPrimary">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="openChangeDialog(remote)">
                            <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="openDeleteDialog(remote)">
                            <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="remote.status === 'mounted'" @click="unmountRemote(remote)">
                            <v-list-item-title>{{ $t('unmount remote') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="remote.status !== 'mounted'" @click="mountRemote(remote)">
                            <v-list-item-title>{{ $t('mount remote') }}</v-list-item-title>
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

  <!-- New Remote Dialog -->
  <v-dialog v-model="newRemoteDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ $t('create remote mount') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="newRemoteDialog.name" :label="$t('name')" required></v-text-field>
          <v-select v-model="newRemoteDialog.type" :items="['smb']" :label="$t('type')" required></v-select>
          <v-text-field v-model="newRemoteDialog.server" :label="$t('ip')" required></v-text-field>
          <v-text-field
            v-model="newRemoteDialog.share"
            :label="$t('share')"
            append-inner-icon="mdi-magnify"
            :loading="loadingShares"
            @click:append-inner="listShares(newRemoteDialog)"
            required
          ></v-text-field>
          <v-text-field v-model="newRemoteDialog.username" :label="$t('username')"></v-text-field>
          <v-text-field v-model="newRemoteDialog.password" :label="$t('password')" type="password"></v-text-field>
          <v-text-field v-model="newRemoteDialog.domain" :label="$t('domain')"></v-text-field>
          <v-select v-model="newRemoteDialog.version" :items="['1.0', '2.0', '2.1', '3.0', '3.02', '3.1.1', '3.2']" :label="$t('version')" required></v-select>
          <!--<v-text-field v-model.number="newRemoteDialog.uid" :label="$t('uid')" type="number" required></v-text-field>
          <v-text-field v-model.number="newRemoteDialog.gid" :label="$t('gid')" type="number" required></v-text-field>-->
          <v-switch v-model="newRemoteDialog.auto_mount" :label="$t('automount')" inset color="onPrimary"></v-switch>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" :disabled="!newRemoteDialog.type || !newRemoteDialog.server || !newRemoteDialog.share" @click="testConnection(newRemoteDialog)">{{ $t('test connection') }}</v-btn>
        <v-btn color="onPrimary" @click="newRemoteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createRemote()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Dialog -->
  <v-dialog v-model="changeDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ $t('edit remote mount') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="changeDialog.name" :label="$t('name')" required></v-text-field>
          <v-select v-model="changeDialog.type" :items="['smb']" :label="$t('type')" required></v-select>
          <v-text-field v-model="changeDialog.server" :label="$t('ip')" required></v-text-field>
          <v-text-field
            v-model="changeDialog.share"
            :label="$t('share')"
            append-inner-icon="mdi-magnify"
            :loading="loadingShares"
            @click:append-inner="listShares(changeDialog)"
            required
          ></v-text-field>
          <v-text-field v-model="changeDialog.username" :label="$t('username')"></v-text-field>
          <v-text-field v-model="changeDialog.password" :label="$t('password')" type="password"></v-text-field>
          <v-text-field v-model="changeDialog.domain" :label="$t('domain')"></v-text-field>
          <v-select v-model="changeDialog.version" :items="['1.0', '2.0', '2.1', '3.0', '3.02', '3.1.1', '3.2']" :label="$t('version')" required></v-select>
          <!--<v-text-field v-model.number="changeDialog.uid" :label="$t('uid')" type="number" required></v-text-field>
          <v-text-field v-model.number="changeDialog.gid" :label="$t('gid')" type="number" required></v-text-field>-->
          <v-switch v-model="changeDialog.auto_mount" :label="$t('automount')" inset color="onPrimary"></v-switch>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" :disabled="!changeDialog.type || !changeDialog.server || !changeDialog.share" @click="testConnection(changeDialog)">{{ $t('test connection') }}</v-btn>
        <v-btn color="onPrimary" @click="changeDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="updateRemote()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this remote mount?') }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteRemote(deleteDialog.remote)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Shares Dialog -->
  <v-dialog v-model="sharesDialog" max-width="500px">
    <v-card>
      <v-card-title>{{ $t('available shares') }}</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(share, idx) in listAllShares"
            :key="idx"
            @click="
              newRemoteDialog.share = share;
              sharesDialog = false;
            "
          >
            <v-list-item-title>{{ share }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" text @click="sharesDialog = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon @click="openCreateMountDialog()">
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <!-- Loading Overlay -->
  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const overlay = ref(false);
const loadingShares = ref(false);
const listAllShares = ref([]);
const sharesDialog = ref(false);
const { t } = useI18n();
const remotes = ref([]);
const newRemoteDialog = reactive({
  value: false,
  name: '',
  type: 'smb',
  server: '',
  share: '',
  username: '',
  password: '',
  domain: '',
  version: '3.0',
  uid: 500,
  gid: 500,
  auto_mount: true,
});
const deleteDialog = reactive({
  value: false,
  remote: null,
});
const changeDialog = reactive({
  value: false,
  id: null,
  name: '',
  type: 'smb',
  server: '',
  share: '',
  username: '',
  password: '',
  domain: '',
  version: '',
  uid: 0,
  gid: 0,
  auto_mount: true,
});

onMounted(() => {
  getRemotes();
});

const openCreateMountDialog = () => {
  newRemoteDialog.value = true;
};

const openDeleteDialog = (remote) => {
  deleteDialog.remote = remote;
  deleteDialog.value = true;
};

const openChangeDialog = (remote) => {
  changeDialog.value = true;
  changeDialog.id = remote.id;
  changeDialog.name = remote.name;
  changeDialog.type = remote.type;
  changeDialog.server = remote.server;
  changeDialog.share = remote.share;
  //changeDialog.username = remote.username;
  //changeDialog.password = remote.password;
  changeDialog.domain = remote.domain;
  changeDialog.version = remote.version;
  //changeDialog.uid = remote.uid;
  //changeDialog.gid = remote.gid;
  changeDialog.auto_mount = remote.auto_mount;
};

const clearRemoteDialog = () => {
  newRemoteDialog.name = '';
  newRemoteDialog.type = 'smb';
  newRemoteDialog.server = '';
  newRemoteDialog.share = '';
  newRemoteDialog.username = '';
  newRemoteDialog.password = '';
  newRemoteDialog.domain = '';
  newRemoteDialog.version = '3.0';
  //newRemoteDialog.uid = 500;
  //newRemoteDialog.gid = 500;
  newRemoteDialog.auto_mount = true;
};
const clearChangeDialog = () => {
  changeDialog.name = '';
  changeDialog.type = 'smb';
  changeDialog.server = '';
  changeDialog.share = '';
  changeDialog.username = '';
  changeDialog.password = '';
  changeDialog.domain = '';
  changeDialog.version = '3.0';
  //changeDialog.uid = 500;
  //changeDialog.gid = 500;
  changeDialog.auto_mount = true;
};

const getRemotes = async () => {
  try {
    const res = await fetch('/api/v1/remotes', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mounts could not be fetched')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    remotes.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const createRemote = async () => {
  const newRemote = {
    name: newRemoteDialog.name,
    type: newRemoteDialog.type,
    server: newRemoteDialog.server,
    share: newRemoteDialog.share,
    username: newRemoteDialog.username,
    password: newRemoteDialog.password,
    domain: newRemoteDialog.domain,
    version: newRemoteDialog.version,
    //uid: newRemoteDialog.uid,
    //gid: newRemoteDialog.gid,
    auto_mount: newRemoteDialog.auto_mount,
  };

  overlay.value = true;
  try {
    const res = await fetch('/api/v1/remotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(newRemote),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mount could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('remote mount created successfully'));
    getRemotes();
    newRemoteDialog.value = false;
    clearRemoteDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteRemote = async (remote) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/remotes/${remote.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mount could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('remote mount deleted successfully'));
    getRemotes();
    deleteDialog.value = false;
    deleteDialog.remote = null;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateRemote = async () => {
  const updatedRemote = {
    name: changeDialog.name,
    type: changeDialog.type,
    server: changeDialog.server,
    share: changeDialog.share,
    username: changeDialog.username,
    password: changeDialog.password,
    domain: changeDialog.domain,
    version: changeDialog.version,
    //uid: changeDialog.uid,
    //gid: changeDialog.gid,
    auto_mount: changeDialog.auto_mount,
  };

  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/remotes/${changeDialog.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(updatedRemote),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mount could not be updated')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('remote mount updated successfully'));
    getRemotes();
    changeDialog.value = false;
    clearChangeDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const mountRemote = async (remote) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/remotes/${remote.id}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mount could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('remote mount mounted successfully'));
    getRemotes();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const unmountRemote = async (remote) => {
  overlay.value = true;
  try {
    const res = await fetch(`/api/v1/remotes/${remote.id}/unmount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('remote mount could not be unmounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('remote mount unmounted successfully'));
    getRemotes();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const listShares = async (remote) => {
  if (!remote.server || !remote.type) {
    showSnackbarError(t('please enter type and server ip first'));
    return;
  }

  const newListShares = {
    ...(remote.server ? { server: remote.server } : {}),
    ...(remote.type ? { type: remote.type } : {}),
    ...(remote.username ? { username: remote.username } : {}),
    ...(remote.password ? { password: remote.password } : {}),
    ...(remote.domain ? { domain: remote.domain } : {}),
  };

  loadingShares.value = true;
  try {
    const res = await fetch(`/api/v1/remotes/listshares`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newListShares),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('could not load shares')}|$| ${errorDetails.error || t('unknown error')}`);
    } else {
      listAllShares.value = await res.json();
      if (listAllShares.value.success === false) {
        throw new Error(`${t('connection failed')}|$| ${listAllShares.value.message || t('unknown error')}`);
      }
    }

    sharesDialog.value = true;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    loadingShares.value = false;
  }
};

const testConnection = async (remote) => {
  listAllShares.value = [];

  const testRemote = {
    type: remote.type,
    server: remote.server,
    share: remote.share,
    username: remote.username,
    password: remote.password,
    domain: remote.domain,
  };

  overlay.value = true;
  try {
    const res = await fetch('/api/v1/remotes/connectiontest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify(testRemote),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('connection failed')}|$| ${errorDetails.error || t('unknown error')}`);
    } else {
      const result = await res.json();
      if (result.success === false) {
        throw new Error(`${t('connection failed')}|$| ${result.message || t('unknown error')}`);
      }
    }
    showSnackbarSuccess(t('connection successful'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>
