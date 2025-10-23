<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('pools') }}
    </v-card-title>
    <v-card-text>
      <v-list density="compact">
        <v-list-item v-for="(pool, index) in pools" :key="index" class="px-0 py-1">
          <v-list-item-title class="text-body-2 font-weight-medium mb-1">
        {{ pool.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
        <v-progress-linear
          :model-value="pool.status?.usagePercent || 0"
          height="16"
          :color="pool.status?.usagePercent >= 90 ? 'error' : pool.status?.usagePercent >= 60 ? 'warning' : 'success'"
          rounded
          class="mb-1"
        >
          <template #default>
            <span class="text-caption">{{ pool.status?.usagePercent?.toFixed(1) || 0 }}%</span>
          </template>
        </v-progress-linear>
        <div class="text-caption text-medium-emphasis">{{ pool.status?.usedSpace_human || '-' }} / {{ pool.status?.totalSpace_human || '-' }}</div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const pools = ref([]);
const poolsLoading = ref(true);

onMounted(() => {
  getPools();
});

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pools could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    pools.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    poolsLoading.value = false;
  }
};
</script>
