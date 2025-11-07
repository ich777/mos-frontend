<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('user profile') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-select v-model="selectedLanguage" :items="languages" :item-title="(lang) => $t(lang)" :item-value="(lang) => lang" :label="$t('language')" required @update:modelValue="changeLanguage()" />
        <v-select v-model="selectedByteFormat" :items="byte_format" item-title="name" item-value="name" :label="$t('byte unit')" required @update:modelValue="changeByteUnit()" />
        <h3>{{ $t('uicolor') }}</h3>
        <v-color-picker v-model="color" show-swatches hide-canvas hide-sliders hide-inputs @update:modelValue="changePrimaryColor" />
        <h3 class="mt-4 d-flex align-center">
          {{ $t('admin api tokens') }}
          <v-btn icon size="small" class="ml-2" @click="openAdminTokenDialog()" color="onPrimary">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </h3>
        <v-card v-for="token in adminTokens" :key="token.id" class="mt-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              {{ token.name }}
              <v-chip v-if="token.description" class="ml-2" size="small">{{ token.description }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="token.token"
              :type="showPassword ? 'text' : 'password'"
              readonly
              label="Token"
              hide-details
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
        <div class="mt-4" v-if="adminTokens.length === 0">{{ $t('no admin api tokens created') }}</div>
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
        <v-btn variant="text" @click="createAdminTokenDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createAdminToken()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useTheme } from 'vuetify';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { availableLocales, locale, t } = useI18n();
const authToken = ref(localStorage.getItem('authToken'));
const overlay = ref(false);
const selectedLanguage = ref(locale.value);
const languages = ref(availableLocales);
const selectedByteFormat = ref('');
const byte_format = ref(['binary', 'decimal']);
const theme = useTheme();
const color = ref(theme.themes.value[theme.global.name.value].colors.primary || '#1976D2');
const adminTokens = ref([]);
const createAdminTokenDialog = reactive({
  value: false,
  name: '',
  description: '',
});
const showPassword = ref(false);

onMounted(() => {
  getUser();
  getAdminTokens();
});

const openAdminTokenDialog = () => {
  createAdminTokenDialog.value = true;
  createAdminTokenDialog.name = '';
  createAdminTokenDialog.description = '';
};

const getUser = async () => {
  try {
    const res = await fetch(`/api/v1/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const user = await res.json();
    selectedByteFormat.value = user.byte_format || 'binary';
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getAdminTokens = async () => {
  try {
    const res = await fetch(`/api/v1/auth/admin-tokens`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    adminTokens.value = await res.json();
    createAdminTokenDialog.value = false;
  } catch (e) {
    showSnackbarError(e.message);
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

    if (!res.ok) throw new Error('API-Error');
    showSnackbarSuccess(t('admin api token created'));
    getAdminTokens();
  } catch (e) {
    showSnackbarError(e.message);
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

    if (!res.ok) throw new Error('API-Error');
    showSnackbarSuccess(t('admin api token deleted'));
    getAdminTokens();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const changePrimaryColor = async (newColor) => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primary_color: newColor }),
    });

    if (!res.ok) throw new Error('API-Error');
    color.value = newColor;
    theme.themes.value[theme.global.name.value].colors.primary = newColor;
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeLanguage = async () => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language: selectedLanguage.value }),
    });

    if (!res.ok) throw new Error('API-Error');
    locale.value = selectedLanguage.value;
    showSnackbarSuccess(t('language changed'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeByteUnit = async () => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ byte_format: selectedByteFormat.value }),
    });

    if (!res.ok) throw new Error('API-Error');
    showSnackbarSuccess(t('byte unit changed'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const copyAuthToken = async (token) => {
  try {
    if (!window.isSecureContext || !navigator.clipboard) {
      throw new Error('clipboard api not available in this context');
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
        throw new Error('execCommand copy failed');
      }
    } catch (fallbackErr) {
      showSnackbarError(t('failed to copy api token') + ': ' + (err?.message || fallbackErr?.message || ''));
    }
  }
};
</script>
