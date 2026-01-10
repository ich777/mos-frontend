<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-btn variant="text" color="primary" to="/plugins" class="mb-2">
          <v-icon start>mdi-arrow-left</v-icon>
          {{ $t('back to plugins') }}
        </v-btn>
      </v-container>

      <div v-if="loading" class="d-flex flex-column align-center justify-center" style="min-height: 400px">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
        <p class="text-grey">{{ $t('loading plugin') }}...</p>
      </div>

      <v-card v-else-if="error" class="text-center py-8">
        <v-icon size="80" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <v-card-title class="text-h5">{{ $t('plugin error') }}</v-card-title>
        <v-card-text class="text-grey">
          {{ errorMessage }}
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="tonal" to="/plugins">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ $t('back to plugins') }}
          </v-btn>
          <v-btn color="primary" variant="tonal" @click="retryLoad">
            <v-icon start>mdi-refresh</v-icon>
            {{ $t('retry') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="!plugin" class="text-center py-8">
        <v-icon size="80" color="warning" class="mb-4">mdi-puzzle-remove-outline</v-icon>
        <v-card-title class="text-h5">{{ $t('plugin not found') }}</v-card-title>
        <v-card-text class="text-grey">
          {{ $t('the requested plugin could not be found') }}
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="tonal" to="/plugins">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ $t('back to plugins') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <component v-else-if="pluginComponent" :is="pluginComponent" :plugin="plugin"></component>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, shallowRef } from 'vue';
import { usePlugins } from '@/composables/usePlugins';

const props = defineProps({
  pluginName: {
    type: String,
    required: true,
  },
});

const { plugins, fetchPlugins, loadPluginComponent, pluginsLoaded } = usePlugins();

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const plugin = ref(null);
const pluginComponent = shallowRef(null);

const loadPlugin = async () => {
  loading.value = true;
  error.value = false;
  errorMessage.value = '';
  pluginComponent.value = null;

  try {
    if (!pluginsLoaded.value) {
      await fetchPlugins();
    }

    plugin.value = plugins.value.find((p) => p.name === props.pluginName || p.name.toLowerCase() === props.pluginName.toLowerCase());

    if (!plugin.value) {
      loading.value = false;
      return;
    }

    const component = await loadPluginComponent(plugin.value);

    if (!component) {
      throw new Error('Component could not be loaded');
    }

    pluginComponent.value = component;
  } catch (e) {
    error.value = true;
    errorMessage.value = e.message || 'Unknown error loading plugin';
  } finally {
    loading.value = false;
  }
};

const retryLoad = () => {
  loadPlugin();
};

onMounted(() => {
  loadPlugin();
});

watch(
  () => props.pluginName,
  () => {
    loadPlugin();
  }
);
</script>
