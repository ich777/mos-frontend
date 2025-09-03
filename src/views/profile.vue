<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('user profile') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
          <v-form>
            <v-text-field :label="$t('api token')" v-model="authToken" readonly></v-text-field>
            <v-select v-model="selectedLanguage" :items="languages" item-title="name" item-value="name"
              :label="$t('language')" required @update:modelValue="changeLanguage()"/>
            <v-text-field
              :label="$t('uicolor')"
              v-model="color"
              @update:modelValue="changePrimaryColor(color)"
              type="color"
              hide-details
              prepend-inner-icon="mdi-palette"
            />
          </v-form>
      </v-container>
    </v-container>
  </v-container>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useTheme } from 'vuetify';

const emit = defineEmits(['refresh-drawer']);
const { availableLocales, locale, t } = useI18n();
const authToken = ref(localStorage.getItem('authToken'));
const overlay = ref(false);
const selectedLanguage = ref(locale.value);
const languages = ref(availableLocales);
const theme = useTheme();
const color = ref(theme.themes.value[theme.global.name.value].colors.primary || '#1976D2');

const changePrimaryColor = async (newColor) => {
  try {
    const res = await fetch(`/api/v1/auth/users/${localStorage.getItem('userid')}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'primary_color': newColor })
    })

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
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'language': selectedLanguage.value })
    })

    if (!res.ok) throw new Error('API-Error');
    locale.value = selectedLanguage.value;

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const copyAuthToken = () => {
  navigator.clipboard.writeText(authToken.value)
    .then(() => showSnackbarSuccess(t('api token copied to clipboard')))
    .catch(err => showSnackbarError(t('failed to copy api token')));
};

</script>