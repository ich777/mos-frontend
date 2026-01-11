<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('plugins') }}</h2>
      </v-container>

      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-container fluid class="pa-4" v-if="!loading">
              <v-row class="ma-n2">
                <v-col v-if="plugins.length > 0" cols="12" sm="6" md="4" lg="4" xl="3" v-for="plugin in plugins" :key="plugin.name" class="pa-2">
                  <v-card style="height: 250px; display: flex; flex-direction: column" class="pa-0 plugin-card" @click="openPlugin(plugin)">
                    <v-card-text class="pa-0 pt-4">
                      <div class="d-flex justify-center">
                        <v-icon v-if="hasMdiIcon(plugin)" :icon="plugin.icon" size="60" color="primary"></v-icon>
                        <v-img v-else-if="!iconErrors[plugin.name]" :src="getIconSrc(plugin)" height="60" contain style="max-width: 100%" @error="onIconError($event, plugin)">
                          <template v-slot:error>
                            <v-icon size="60" color="primary">mdi-puzzle</v-icon>
                          </template>
                        </v-img>
                        <v-icon v-else size="60" color="primary">mdi-puzzle</v-icon>
                      </div>
                      <v-chip v-if="plugin.version" size="small" class="position-absolute" style="top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        v{{ plugin.version }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="py-2 px-4" style="min-height: 96px">
                      <div class="text-h6 font-weight-bold mb-1" style="line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ plugin.displayName || plugin.name }}
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
                        {{ plugin.description }}
                      </div>
                    </v-card-text>
                    <v-spacer />
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 8px">
                      <v-btn color="red" variant="text" icon size="small" @click.stop="openDeleteDialog(plugin)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-spacer />
                      <v-btn color="secondary" prepend-icon="mdi-open-in-app" size="small" @click.stop="openPlugin(plugin)">
                        {{ $t('open') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
                <v-col v-else cols="12">
                  <div class="text-center py-8">
                    <v-icon size="80" color="grey" style="opacity: 0.5" class="mb-4">mdi-puzzle-outline</v-icon>
                    <div class="text-h5 mb-2">{{ $t('no plugins installed') }}</div>
                    <div class="text-grey">{{ $t('plugins will appear here once installed') }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-else fluid class="pa-4 d-flex justify-center">
              <v-row class="ma-n2" style="width: 100%">
                <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="4" xl="3" class="pa-2">
                  <v-skeleton-loader type="card" class="pa-0" />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('delete') }} {{ deleteDialog.plugin?.displayName || deleteDialog.plugin?.name }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete') }} <strong>{{ deleteDialog.plugin?.displayName || deleteDialog.plugin?.name }}</strong>?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deletePlugin(deleteDialog.plugin)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { usePlugins, hasMdiIcon, getPluginIconUrl, getPluginRoute } from '@/composables/usePlugins';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const { plugins, fetchPlugins } = usePlugins();
const loading = ref(true);
const overlay = ref(false);
const iconErrors = ref({});
const deleteDialog = reactive({
  value: false,
  plugin: null,
});

onMounted(async () => {
  try {
    await fetchPlugins();
  } catch {
    showSnackbarError(t('error loading plugins'));
  } finally {
    loading.value = false;
  }
});

const getIconSrc = (plugin) => {
  if (iconErrors.value[plugin.name]) {
    return '';
  }
  return getPluginIconUrl(plugin);
};

const onIconError = (event, plugin) => {
  iconErrors.value[plugin.name] = true;
};

const openPlugin = (plugin) => {
  const route = getPluginRoute(plugin);
  router.push(route);
};

const openDeleteDialog = (plugin) => {
  deleteDialog.value = true;
  deleteDialog.plugin = plugin;
};

const deletePlugin = async (plugin) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/mos/plugins/delete/${plugin.name}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });


    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('plugin could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('plugin deleted successfully'));
    await fetchPlugins();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
    deleteDialog.plugin = null;
  }
};
</script>

<style scoped>
.plugin-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plugin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}
</style>
