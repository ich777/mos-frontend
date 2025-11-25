<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('community templates') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-text-field
              v-model="searchOnlineTemplate"
              :label="$t('search templates')"
              clearable
              append-inner-icon="mdi-magnify"
              outlined
              dense
              hide-details
              class="ma-4"
              @click:append-inner="searchStringInTemplates()"
              @click:clear="
                searchOnlineTemplate = '';
                searchStringInTemplates();
              "
              @keyup.enter="searchStringInTemplates()"
            ></v-text-field>
            <v-divider class="mt-2" />
            <v-container fluid class="pa-4">
              <v-row class="ma-n2">
                <v-col v-if="onlineTemplates.length > 0" cols="12" sm="6" md="4" lg="3" xl="2" v-for="(tpl, i) in onlineTemplates" :key="tpl.name || i" class="pa-2">
                  <v-card style="height: 250px; display: flex; flex-direction: column" class="pa-0">
                    <v-card-text class="pa-0 pt-4">
                      <v-img v-if="tpl.logo" :src="tpl.logo" height="60" contain style="max-width: 100%"></v-img>
                      <v-icon v-else size="60" color="grey" style="opacity: 0.5">mdi-package-variant</v-icon>
                      <v-chip v-if="tpl.version" size="small" style="position: absolute; top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        {{ tpl.version }}
                      </v-chip>
                    </v-card-text>
                    <v-card-title class="pb-1">
                      <div class="text-h6 font-weight-bold" style="line-height: 1.3">
                        {{ tpl.name || $t('unknown') }}
                      </div>
                    </v-card-title>
                    <v-card-text style="flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; padding-top: 0; max-height: 120px; white-space: pre-wrap">
                      {{ tpl.description }}
                    </v-card-text>
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 8px">
                      <v-btn color="secondary" :href="tpl.url" target="_blank" v-if="tpl.url" prepend-icon="mdi-web" size="small">
                        {{ $t('webpage') }}
                      </v-btn>
                      <v-btn color="secondary" v-if="tpl.link" prepend-icon="mdi-docker" size="small">
                        {{ $t('install') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col v-else cols="12">
                  <div class="text-center grey--text text--darken-1">
                    {{ $t('no templates found matching your search') }}
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const { t } = useI18n();
const searchOnlineTemplate = ref('');
const onlineTemplates = ref([
  {
    type: '',
    name: '',
    version: '',
    description: '',
    url: '',
    logo: '',
    documentation: '',
    languages: [],
    license: '',
    repository: '',
    link: '',
  },
]);

onMounted(() => {
  getOnlineTemplates();
});

const getOnlineTemplates = async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/s3ppo/docker_json_templates/refs/heads/main/index.json', {
      method: 'GET',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not fetch online templates')}|$| ${error.error || t('unknown error')}`);
    }
    onlineTemplates.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const searchStringInTemplates = () => {
  if (!searchOnlineTemplate.value || searchOnlineTemplate.value.trim() === '') {
    getOnlineTemplates();
    return;
  }

  const searchString = searchOnlineTemplate.value.toLowerCase().trim();
  onlineTemplates.value = onlineTemplates.value.filter((tpl) => {
    return (
      (tpl.name && tpl.name.toLowerCase().includes(searchString)) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchString)) ||
      (tpl.type && tpl.type.toLowerCase().includes(searchString)) ||
      (tpl.languages && tpl.languages.some((lang) => lang.toLowerCase().includes(searchString))) ||
      (tpl.license && tpl.license.toLowerCase().includes(searchString))
    );
  });

  if (onlineTemplates.value.length === 0) {
    showSnackbarSuccess(t('no templates found matching your search'));
  }
};
</script>
