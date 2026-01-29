<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('filebrowser') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0">
          <v-card-subtitle class="pb-0">
            <div class="d-flex align-center ga-2">
              <v-btn size="small" variant="text" icon="mdi-home" @click="goRoot" color="secondary" :disabled="loading" />
              <v-btn size="small" variant="text" icon="mdi-arrow-up" @click="goUp" color="secondary" :disabled="!canGoUp || loading" />
              <v-btn size="small" variant="text" icon="mdi-refresh" @click="reload" color="secondary" :disabled="loading" />
              <v-chip size="small" class="ml-2" variant="tonal">
                {{ currentPath || '/' }}
              </v-chip>
              <v-spacer />
              <v-progress-circular v-if="loading" indeterminate size="20" color="secondary" />
            </div>
          </v-card-subtitle>

          <v-card-text class="pt-2" style="min-height: 300px; max-height: 60vh; overflow-y: auto">
            <v-alert v-if="errorMessage" type="error" density="compact" class="mb-2">
              {{ errorMessage }}
            </v-alert>

            <v-table density="compact">
              <thead>
                <tr>
                  <th>{{ t('name') }}</th>
                  <th style="width: 40%">{{ t('path') }}</th>
                  <th style="width: 60px" class="text-center">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && items.length === 0">
                  <td colspan="3" class="text-center text-medium-emphasis">
                    {{ t('no entries') }}
                  </td>
                </tr>

                <tr
                  v-for="item in items"
                  :key="item.path"
                  :class="['cursor-pointer', activeItem && activeItem.path === item.path ? 'bg-primary bg-opacity-10' : '']"
                  @click="setActiveItem(item)"
                  @dblclick.stop.prevent="handleRowDblClick(item)"
                >
                  <td>
                    <div class="d-flex align-center ga-2">
                      <v-icon size="18">
                        {{ item.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}
                      </v-icon>
                      <span>{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.displayPath || item.path }}</span>
                  </td>
                  <td class="text-center">
                    <v-btn v-if="item.type === 'directory'" size="small" icon="mdi-folder-open" variant="text" @click.stop="navigateInto(item)" :disabled="loading" />
                    <v-btn v-else-if="isSelectable(item)" size="small" icon="mdi-check" variant="text" @click.stop="confirmSelect(item)" :disabled="loading" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <v-divider />

          <v-card-actions class="d-flex align-center">
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError } from '@/composables/snackbar';

const modelValue = ref(true);
const title = ref('');
const selectType = ref('directory');
const persistent = ref(false);
const showSelectButton = ref(true);
const roots = ref('');
const emit = defineEmits(['update:modelValue', 'selected', 'cancel']);
const { t } = useI18n();
const internalVisible = computed({
  get: () => modelValue.value,
  set: (val) => emit('update:modelValue', val),
});
const loading = ref(false);
const currentPath = ref('/');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const errorMessage = ref('');
const activeItem = ref(null);

onMounted(() => {
  loadPath(currentPath.value);
});

const loadPath = async (path = '/') => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const url = new URL('/api/v1/mos/fsnavigator', window.location.origin);
    if (path && path !== '/') {
      url.searchParams.set('path', path);
    }

    const typeParam = selectType.value === 'directory' ? 'directories' : 'all';
    url.searchParams.set('type', typeParam);

    if (roots.value !== '' && roots.value !== '/') {
      url.searchParams.set('roots', roots.value);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let apiError = '';
      try {
        const data = await res.json();
        apiError = data.error || '';
      } catch {
        // ignore
      }
      const msg = apiError || t('filesystem could not be loaded');
      throw new Error(msg);
    }

    const data = await res.json();

    currentPath.value = data.currentPath || path || '/';
    canGoUp.value = !!data.canGoUp;
    parentPath.value = data.parentPath;
    items.value = Array.isArray(data.items) ? data.items : [];
    activeItem.value = null;
  } catch (e) {
    const msg = e?.message || t('unknown error');
    errorMessage.value = msg;
    showSnackbarError?.(t('filesystem could not be loaded'), msg);
  } finally {
    loading.value = false;
  }
};

const isSelectable = (item) => {
  if (!item) return false;
  if (selectType.value === 'directory') return item.type === 'directory';
  if (selectType.value === 'file') return item.type !== 'directory';
  return true; // 'both'
};

const setActiveItem = (item) => {
  activeItem.value = item;
};

const navigateInto = (item) => {
  if (!item || item.type !== 'directory') return;
  loadPath(item.path);
};

const handleRowDblClick = (item) => {
  if (!item) return;
  if (item.type === 'directory') {
    navigateInto(item);
  } else if (isSelectable(item)) {
    confirmSelect(item);
  }
};

const goRoot = () => {
  loadPath('/');
};

const goUp = () => {
  if (!canGoUp.value || !parentPath.value) return;
  loadPath(parentPath.value);
};

const reload = () => {
  loadPath(currentPath.value || '/');
};

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};

const confirmSelect = (explicitItem) => {
  const item = explicitItem || activeItem.value;
  if (!item || !isSelectable(item)) return;

  emit('selected', {
    name: item.name,
    path: item.path,
    type: item.type,
    displayPath: item.displayPath ?? item.path,
  });

  internalVisible.value = false;
};

watch(
  () => internalVisible.value,
  (visible) => {
    if (visible) {
      const startPath = initialPath.value || '/';
      loadPath(startPath);
    }
  },
);
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
