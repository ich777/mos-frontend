<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('pools') }}
    </v-card-title>
    <v-card-text>
      <div v-for="(pool, index) in pools" :key="index">
        <div class="text-subtitle-1">{{ pool.name }}</div>
        <div class="d-flex flex-column">
          <v-progress-linear
            :model-value="pool.status?.usagePercent || 0"
            height="14"
            :color="pool.status?.usagePercent >= 90 ? 'red' : pool.status?.usagePercent >= 60 ? 'orange' : 'green'"
            style="margin-top: 0; border-radius: 7px; overflow: hidden"
          >
            <template #default>
              <span>{{ pool.status?.usagePercent?.toFixed(2) || 0 }}%</span>
            </template>
          </v-progress-linear>
          <div class="d-flex justify-space-between align-center mb-2">
            <div>{{ pool.status?.usedSpace_human || '-' }} / {{ pool.status?.totalSpace_human || '-' }}</div>
          </div>
        </div>
      </div>
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
