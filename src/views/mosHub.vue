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
                        v-if="tpl.type == 'docker' && mosServices && mosServices.docker"
                        color="secondary"
                        prepend-icon="mdi-docker"
                        size="small"
                        @click="$router.push({ path: '/docker/create', query: { path: tpl.files.template } })"
                        :disabled="!mosServices.docker.enabled"
                      >
                        {{ $t('install') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <!-- Pagination -->
                <v-col v-if="mosHubCount > 0" cols="12" class="pt-4 d-flex justify-center">
                  <v-pagination
                    v-model="currentPage"
                    :length="Math.ceil(mosHubCount / pageLimit)"
                    :total-visible="7"
                    @update:model-value="(page) => { currentPage = page; getMosHub(searchOnlineTemplate, pageLimit, (page - 1) * pageLimit); }"
                  />
                </v-col>
                <v-col v-else cols="12">
                  <div class="text-center grey--text text--darken-1">
                    {{ $t('no templates found matching your search') }}
                  </div>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-else fluid class="pa-4 d-flex justify-center">
              <v-row class="ma-n2" style="width: 100%">
                <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3" xl="2" class="pa-2">
                  <v-skeleton-loader type="card" class="pa-0" />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Repositories Dialog -->
  <v-dialog v-model="mosHubRepositoriesDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ $t('repositories') }}</v-card-title>
      <v-card-text class="pa-0">
        <v-container fluid>
          <v-row class="pa-0">
            <v-col cols="12" v-for="(repo, index) in mosHubRepositoriesDialog.repositories" :key="index" class="d-flex align-center">
              <v-text-field
                v-model="mosHubRepositoriesDialog.repositories[index]"
                :label="$t('repository') + ' ' + (index + 1)"
                outlined
                dense
                class="flex-grow-1 mr-2"
                append-icon="mdi-delete"
                @click:append="mosHubRepositoriesDialog.repositories.splice(index, 1)"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex justify-end mt-2">
              <v-btn color="primary" variant="text" prepend-icon="mdi-plus" @click="mosHubRepositoriesDialog.repositories.push('')">
                {{ $t('add repository') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="mosHubRepositoriesDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setHubRepositories(mosHubRepositoriesDialog.repositories)">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openHubRepositoriesDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('repositories') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="refreshRepositories()">
        <template v-slot:prepend>
          <v-icon>mdi-refresh</v-icon>
        </template>
        <v-list-item-title>{{ $t('refresh repositories') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

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
const overlay = ref(false);
const mosServices = ref({});
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
    repository: '',
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
const mosHubCount = ref(0);

const mosHubRepositoriesDialog = reactive({
  value: false,
  repositories: [''],
});
const currentPage = ref(1);
const pageLimit = 24;
onMounted(() => {
  getMosHub();
  getMosServices();
});

const getMosHub = async (search, limit = 24, skip = 0) => {
  hubLoading.value = true;
  try {
    const res = await fetch(`/api/v1/mos/hub/index?search=${encodeURIComponent(search || '')}&order=asc&limit=${limit}&skip=${skip}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();
    mosHub.value = result.results || [];
    mosHubCount.value = result.count || 0;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    hubLoading.value = false;
  }
};

const refreshRepositories = async () => {
  hubLoading.value = true;
  try {
    const res = await fetch('/api/v1/mos/hub/update', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(t('repositories could not be refreshed'));

    showSnackbarSuccess(t('repositories refreshed successfully'));
    getMosHub(searchOnlineTemplate.value);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    hubLoading.value = false;
  }
};

const getHubRepositories = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/repositories', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('repositories could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const repositories = await res.json();
    return repositories;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setHubRepositories = async (repositories) => {
  overlay.value = true;
  mosHubRepositoriesDialog.value = false;
  try {
    const res = await fetch('/api/v1/mos/hub/repositories', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repositories),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('repositories could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('repositories changed successfully'));
    refreshRepositories();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getMosServices = async () => {
  try {
    const res = await fetch('/api/v1/mos/services', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    mosServices.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const openHubRepositoriesDialog = async () => {
  mosHubRepositoriesDialog.value = true;
  mosHubRepositoriesDialog.repositories = await getHubRepositories();
};
</script>
