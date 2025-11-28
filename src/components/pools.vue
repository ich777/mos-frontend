<template>
  <div v-for="(pool, index) in pools" :key="index" class="py-1">
    <div class="d-flex justify-space-between align-center w-100 mb-1">
      <div class="text-body-2 font-weight-medium">{{ pool.name }}</div>
      <div class="text-caption">{{ pool.status?.usedSpace_human || '-' }} / {{ pool.status?.totalSpace_human || '-' }}</div>
    </div>
    <v-progress-linear
      :model-value="pool.status?.usagePercent || 0"
      height="16"
      :color="pool.status?.usagePercent >= 90 ? 'error' : pool.status?.usagePercent >= 60 ? 'warning' : 'success'"
      rounded
      class="mb-1"
    >
      <template #default>
        <span><small>{{ (pool.status?.usagePercent ?? 0).toFixed(1) }}%</small></span>
      </template>
    </v-progress-linear>
  </div>
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
