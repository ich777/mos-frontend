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
                <v-col v-if="mosHub.length > 0" cols="12" sm="6" md="4" lg="4" xl="3" v-for="(tpl, i) in mosHub" :key="tpl.name || i" class="pa-2">
                  <v-card style="height: 250px; display: flex; flex-direction: column" class="pa-0">
                    <v-card-text class="pa-0 pt-4">
                      <div class="d-flex justify-center">
                        <v-img v-if="tpl.icon" :src="tpl.icon" height="60" contain style="max-width: 100%"></v-img>
                        <v-icon v-else size="60" color="grey" style="opacity: 0.5">mdi-package-variant</v-icon>
                      </div>
                      <v-chip
                        v-if="tpl.maintainer"
                        size="small"
                        class="position-absolute"
                        style="top: 12px; left: 12px; background: var(--v-theme-secondary); color: var(--v-theme-on-secondary)"
                        :href="tpl.maintainer_donate"
                        target="_blank"
                        prepend-icon="mdi-github"
                      >
                        {{ tpl.maintainer || $t('unknown') }}
                      </v-chip>
                      <v-chip v-if="tpl.type" size="small" class="position-absolute" style="top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        {{ $t(tpl.type) }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="py-2 px-4" style="min-height: 96px">
                      <div class="text-h6 font-weight-bold mb-1" style="line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ tpl.name || $t('unknown') }}
                      </div>
                      <div
                        style="
                          max-height: 3.6em;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          display: -webkit-box;
                          line-clamp: 2;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                          white-space: normal;
                          font-size: 0.9rem;
                        "
                      >
                        {{ tpl.description }}
                      </div>
                    </v-card-text>
                    <v-spacer />
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 8px">
                      <v-spacer />
                      <v-btn color="secondary" :href="tpl.website" target="_blank" v-if="tpl.website" prepend-icon="mdi-web" size="small">
                        {{ $t('webpage') }}
                      </v-btn>
                      <v-btn
                        v-if="tpl.type == 'docker' && mosServices && mosServices.docker"
                        color="secondary"
                        prepend-icon="mdi-docker"
                        size="small"
                        @click="
                          installDialog.tpl = tpl;
                          installDialog.type = 'docker';
                          installDialog.value = true;
                        "
                        :disabled="!mosServices.docker.running"
                      >
                        {{ $t('install') }}
                      </v-btn>
                      <v-btn
                        v-else-if="tpl.type == 'compose' && mosServices && mosServices.docker"
                        color="secondary"
                        prepend-icon="mdi-toy-brick-plus"
                        size="small"
                        @click="
                          installDialog.tpl = tpl;
                          installDialog.type = 'compose';
                          installDialog.value = true;
                        "
                        :disabled="!mosServices.docker.running"
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
                    @update:model-value="
                      (page) => {
                        currentPage = page;
                        getMosHub(searchOnlineTemplate, pageLimit, (page - 1) * pageLimit);
                      }
                    "
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
                <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="4" xl="3" class="pa-2">
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
    <v-card class="pa-0">
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

  <!-- Install/Details Dialog -->
  <v-dialog v-model="installDialog.value" max-width="760" scrollable>
    <v-card rounded="lg" class="pa-0">
      <v-card-title class="px-6 pt-6 pb-4">
        <div class="d-flex align-center w-100" style="gap: 16px">
          <div class="d-flex align-center me-4" style="min-width: 60px">
            <v-img v-if="installDialog.tpl?.icon" :src="installDialog.tpl?.icon" height="60" contain style="max-width: 100%"></v-img>
            <v-icon v-else size="28" color="on-surface-variant">mdi-package-variant</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="text-h6 font-weight-bold text-truncate">
              {{ installDialog.tpl?.name || $t('unknown') }}
            </div>
            <div class="text-body-2 text-medium-emphasis text-truncate">
              {{ installDialog.tpl?.maintainer || $t('unknown') }}
            </div>
          </div>
          <v-chip v-if="installDialog.tpl?.type" size="small" variant="tonal" color="primary" class="text-uppercase">
            {{ $t(installDialog.tpl.type) }}
          </v-chip>
        </div>
      </v-card-title>
      <v-divider />
      <v-card-text class="px-3 py-3">
        <v-row class="align-stretch" dense>
          <v-col cols="12" md="8">
            <div v-if="installDialog.tpl?.description" class="text-body-2 mb-4 pr-8" style="white-space: pre-line">
              {{ installDialog.tpl.description }}
            </div>
            <v-list density="compact" lines="one" class="pa-0">
              <v-list-item v-if="installDialog.tpl?.website" :href="installDialog.tpl.website" target="_blank" rel="noopener noreferrer" class="text-truncate" style="text-transform: none">
                <template #prepend>
                  <v-icon>mdi-web</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ $t('webpage') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.donate" :href="installDialog.tpl.donate" target="_blank" rel="noopener noreferrer" class="text-truncate" style="text-transform: none">
                <template #prepend>
                  <v-icon>mdi-gift</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ $t('donate') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.repository">
                <template #prepend>
                  <v-icon>mdi-source-repository</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ installDialog.tpl.repository }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" color="surface-variant" rounded="lg" class="pa-4">
              <div class="text-caption text-medium-emphasis mb-3">
                {{ $t('template') }}
              </div>
              <div class="text-body-2">
                <div class="d-flex justify-space-between" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('type') }}</span>
                  <span class="font-weight-medium">{{ installDialog.tpl?.type || $t('unknown') }}</span>
                </div>
                <div v-if="installDialog.tpl?.maintainer" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('maintainer') }}</span>
                  <span class="font-weight-medium text-truncate">{{ installDialog.tpl.maintainer }}</span>
                </div>
                <div v-if="installDialog.tpl?.maintainer_donate" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('donate') }}</span>
                  <a :href="installDialog.tpl.maintainer_donate" target="_blank" class="font-weight-medium text-truncate">
                    <v-icon>mdi-gift</v-icon>
                  </a>
                </div>
                <div v-if="installDialog.tpl?.created_at" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('created') }}</span>
                  <span class="font-weight-medium">
                    {{ new Date(installDialog.tpl.created_at * 1000).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </v-card>
            <v-alert v-if="mosServices?.docker && !mosServices.docker.running" class="mt-4" type="warning" variant="tonal" density="compact">
              {{ $t('service not available') }}
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn color="onPrimary" variant="text" @click="installDialog.value = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          color="onPrimary"
          :disabled="!mosServices?.docker?.running"
          :prepend-icon="installDialog.type === 'docker' ? 'mdi-docker' : 'mdi-toy-brick-plus'"
          @click="
            installDialog.type === 'docker'
              ? $router.push({ path: '/docker/create', query: { template: installDialog.tpl.files.template } })
              : $router.push({
                  path: '/docker/compose',
                  query: {
                    template: encodeURIComponent(installDialog.tpl.files?.template ?? ''),
                    yaml: encodeURIComponent(installDialog.tpl.files?.yaml ?? ''),
                    env: encodeURIComponent(installDialog.tpl.files?.env ?? ''),
                  },
                })
          "
        >
          {{ $t('install') }}
        </v-btn>
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

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const overlay = ref(false);
const mosServices = ref({});
const searchOnlineTemplate = ref('');
const hubLoading = ref(true);
const installDialog = reactive({
  value: false,
  tpl: null,
  type: '',
});

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

const getMosHub = async (search, limit = 24, skip = 0, order = 'asc', sort = 'name') => {
  hubLoading.value = true;
  try {
    const res = await fetch(`/api/v1/mos/hub/index?search=${encodeURIComponent(search || '')}&order=${order}&sort=${sort}&limit=${limit}&skip=${skip}`, {
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
