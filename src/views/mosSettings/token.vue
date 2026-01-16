<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('token') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text class="pt-0">
            <v-row class="mt-2">
              <v-col cols="12" class="d-flex align-center justify-space-between py-0">
                <span class="text-subtitle-1 font-weight-medium">{{ $t('mos admin api token') }}</span>
                <v-btn
                  variant="text"
                  size="small"
                  color="green"
                  class="ma-1 pa-0 float-right"
                  style="min-width: 0"
                  @click="openAdminTokenDialog()"
                  :title="$t('add admin api token')"
                  :aria-label="$t('add admin api token')"
                >
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-card v-for="token in adminToken" :key="token.id" class="mt-4 pa-0">
              <v-card-title class="d-flex justify-space-between align-center">
                <div>
                  {{ token.name }}
                  <v-chip v-if="token.description" class="ml-2" size="small">{{ token.description }}</v-chip>
                </div>
              </v-card-title>
              <v-card-text class="pb-0">
                <v-text-field
                  v-model="token.token"
                  :type="showPassword ? 'text' : 'password'"
                  readonly
                  :label="$t('token')"
                  hide-details="auto"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-card-text>
              <v-card-actions>
                <v-row class="d-flex justify-end">
                  <v-btn variant="text" @click="copyAuthToken(token.token)" class="mr-4">
                    {{ $t('copy') }}
                  </v-btn>
                  <v-btn color="red" @click="deleteAdminToken(token.id)" class="mr-4">
                    {{ $t('delete') }}
                  </v-btn>
                </v-row>
              </v-card-actions>
            </v-card>
            <div class="mt-4" v-if="adminToken.length === 0">{{ $t('no admin api token created') }}</div>
          </v-card-text>

          <v-divider class="my-2"></v-divider>

          <v-card-text class="pt-0">
            <v-row class="mt-2 mb-4">
              <v-col cols="12" class="d-flex align-center justify-space-between py-0">
                <span class="text-subtitle-1 font-weight-medium">{{ $t('client token') }}</span>
              </v-col>
            </v-row>
                <v-text-field
                  v-model="clientToken.github"
                  :type="showPasswortGithub ? 'text' : 'password'"
                  :label="$t('github token')"
                  :append-inner-icon="showPasswortGithub ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPasswortGithub = !showPasswortGithub"
                />
                <v-text-field
                  v-model="clientToken.dockerhub"
                  :type="showPasswortDockerhub ? 'text' : 'password'"
                  :label="$t('dockerhub token')"
                  hide-details="auto"
                  :append-inner-icon="showPasswortDockerhub ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPasswortDockerhub = !showPasswortDockerhub"
                />
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="createAdminTokenDialog.value" max-width="600">
    <v-card>
      <v-card-title>{{ $t('create admin api token') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="createAdminTokenDialog.name" :label="$t('name')" required></v-text-field>
        <v-text-field v-model="createAdminTokenDialog.description" :label="$t('description')"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" variant="text" @click="createAdminTokenDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createAdminToken()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="setClientToken()" color="primary"
    style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>  

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const adminToken = ref([]);
const overlay = ref(false);
const showPassword = ref(false);
const showPasswortGithub = ref(false);
const showPasswortDockerhub = ref(false);
const createAdminTokenDialog = reactive({
  value: false,
  name: '',
  description: '',
});
const clientToken = ref({
  github: "",
  dockerhub: ""
});

onMounted(() => {
  getAdminToken();
  getClientToken();
});

const openAdminTokenDialog = () => {
  createAdminTokenDialog.value = true;
  createAdminTokenDialog.name = '';
  createAdminTokenDialog.description = '';
};

const getAdminToken = async () => {
  try {
    const res = await fetch(`/api/v1/auth/admin-tokens`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    adminToken.value = await res.json();
    createAdminTokenDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getClientToken = async () => {
  try {
    const res = await fetch(`/api/v1/mos/tokens`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('client token could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    clientToken.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setClientToken = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/tokens`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientToken.value),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('client token could not be set')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('client token set successfully'));
    getClientToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createAdminToken = async (name) => {
  const newAdminToken = {
    name: createAdminTokenDialog.name,
    description: createAdminTokenDialog.description,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/admin-tokens`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAdminToken),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('admin api token created'));
    getAdminToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteAdminToken = async (id) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/admin-tokens/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api token could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('admin api token deleted'));
    getAdminToken();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const copyAuthToken = async (token) => {
  try {
    if (!window.isSecureContext || !navigator.clipboard) {
      throw new Error(t('clipboard api not available in this context'));
    }
    await navigator.clipboard.writeText(token);
    showSnackbarSuccess(t('api token copied to clipboard'));
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = token;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);

      if (ok) {
        showSnackbarSuccess(t('api token copied to clipboard'));
      } else {
        throw new Error(t('execCommand copy failed'));
      }
    } catch (fallbackErr) {
      showSnackbarError(t('failed to copy api token') + ': ' + (err?.message || fallbackErr?.message || ''));
    }
  }
};
</script>
