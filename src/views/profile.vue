<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('user profile') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text>
            <v-select
              v-model="selectedLanguage"
              :items="languages"
              :item-title="(lang) => $t(lang)"
              :item-value="(lang) => lang"
              :label="$t('language')"
              required
              @update:modelValue="changeLanguage()"
            />
            <v-select
              v-model="selectedByteFormat"
              :items="byteFormats"
              :item-title="(opt) => opt.title"
              :item-value="(opt) => opt.value"
              :label="$t('byte unit')"
              required
              @update:modelValue="changeByteUnit()"
            />
            <v-text-field v-model="expiryDays" :label="$t('ui session expiry time (days)')" append-icon="mdi-content-save" type="number" min="1" max="365" @click:append="changeUiSessionExpiry()" />
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
const byteFormats = ref([{ value: 'binary', title: t('binary') }, { value: 'decimal', title: t('decimal') }]);
const selectedByteFormat = ref('');
const expiryDays = ref(1);
const byte_format = ref([t('binary'), t('decimal')]);
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
  getUiSessionExpiry();
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('profile could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const user = await res.json();
    selectedByteFormat.value = user.byte_format || 'binary';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('admin api tokens could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    adminTokens.value = await res.json();
    createAdminTokenDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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
    getAdminTokens();
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
      throw new Error(`${t('admin api tokens could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('admin api token deleted'));
    getAdminTokens();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('primary color could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    color.value = newColor;
    theme.themes.value[theme.global.name.value].colors.primary = newColor;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('language could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    locale.value = selectedLanguage.value;
    showSnackbarSuccess(t('language changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('byte unit could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('byte unit changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getUiSessionExpiry = async () => {
  try {
    const res = await fetch(`/api/v1/auth/jwt-settings`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ui session expiry could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    expiryDays.value = result.expiryDays;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const changeUiSessionExpiry = async () => {
  const daysBody = { expiryDays: parseInt(expiryDays.value) };
  try {
    const res = await fetch(`/api/v1/auth/jwt-settings`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(daysBody),
    });
    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('ui session expiry could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('ui session expiry changed'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
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
