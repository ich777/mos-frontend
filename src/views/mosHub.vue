<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('mos hub') }}</h2>
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
              @click:append-inner="getMosHub(searchOnlineTemplate)"
              @click:clear="
                searchOnlineTemplate = '';
                getMosHub(searchOnlineTemplate);
              "
              @keyup.enter="getMosHub(searchOnlineTemplate)"
            ></v-text-field>
            <v-divider class="mt-2" />
            <v-container fluid class="pa-4" v-if="!hubLoading">
              <v-row class="ma-n2">
                <v-col v-if="mosHub.length > 0" cols="12" sm="6" md="4" lg="3" xl="2" v-for="(tpl, i) in mosHub" :key="tpl.name || i" class="pa-2">
                  <v-card style="height: 250px; display: flex; flex-direction: column" class="pa-0">
                    <v-card-text class="pa-0 pt-4">
                      <div class="d-flex justify-center">
                        <v-img v-if="tpl.icon" :src="tpl.icon" height="60" contain style="max-width: 100%"></v-img>
                        <v-icon v-else size="60" color="grey" style="opacity: 0.5">mdi-package-variant</v-icon>
                      </div>
                      <v-chip v-if="tpl.type" size="small" style="position: absolute; top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        {{ $t(tpl.type) }}
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
                      <v-btn color="secondary" :href="tpl.website" target="_blank" v-if="tpl.website" prepend-icon="mdi-web" size="small">
                        {{ $t('webpage') }}
                      </v-btn>
                      <v-btn
                        v-if="tpl.type == 'docker'"
                        color="secondary"
                        prepend-icon="mdi-docker"
                        size="small"
                        @click="$router.push({ path: '/docker/create', query: { path: tpl.files.template } })"
                      >
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
            <v-container v-else fluid class="pa-4 d-flex justify-center">
              <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
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
const hubLoading = ref(true);
const mosHub = ref([
  {
    name: '',
    maintainer: '',
    maintainer_donate: '',
    donate: null,
    type: '',
    category: ['network'],
    description: '',
    website: null,
    icon: '',
    repository: 'a',
    created_at: 0,
    updated_at: 0,
    stack_images: [],
    files: {
      template: '',
      yaml: null,
      env: null,
    },
  },
]);

onMounted(() => {
  getMosHub();
});

const getMosHub = async (search) => {
  hubLoading.value = true;
  try {
    const res = await fetch(`/api/v1/mos/hub/index?search=${encodeURIComponent(search || '')}&order=asc`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    mosHub.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    hubLoading.value = false;
  }
};
</script>
