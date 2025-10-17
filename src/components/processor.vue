<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ $t('processor') }}</span>
      <v-chip v-if="temp && temp.main !== null" size="small">{{ temp.main }}°C / {{ temp.min }} °C / {{ temp.max }} °C</v-chip>
    </v-card-title>
    <v-card-text>
      <div>
        <p v-if="osInfo && osInfo.cpu">
          <b>{{ osInfo.cpu.manufacturer }}, {{ osInfo.cpu.brand }}</b>
        </p>
        <p v-if="processor.info.architecture !== undefined">
          <b>{{ $t('architecture') }}:</b>
          {{ processor.info.architecture }}
        </p>
        <p v-if="osInfo.cpu?.cores !== undefined && osInfo.cpu?.physicalCores !== undefined">
          <b>{{ $t('cores') }}:</b>
          {{ osInfo.cpu.physicalCores }} / {{ osInfo.cpu.cores }}
        </p>
        <v-divider class="mt-2 mb-2"></v-divider>
        <v-row class="align-center">
          <v-col cols="auto" class="d-flex align-center" style="width: 60px">
            <b>{{ $t('load') }}:</b>
          </v-col>
          <v-col class="d-flex align-center" style="height: 14px">
            <v-progress-linear
              :model-value="processor.load"
              height="14"
              :color="processor.load >= 90 ? 'red' : processor.load >= 60 ? 'orange' : 'green'"
              style="margin-top: 0; border-radius: 7px; overflow: hidden"
            >
              <template #default>
                <span>{{ processor.load.toFixed(2) }}%</span>
              </template>
            </v-progress-linear>
          </v-col>
        </v-row>
        <div v-if="processor.cores && processor.cores.length">
          <details class="mt-2">
            <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline">{{ $t('cores') }}</summary>
            <v-row dense class="ma-2">
              <v-col v-for="(core, i) in processor.cores" :key="i" cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="d-flex align-center ma-0 pa-0" style="margin-top: 6px">
                <div style="width: 48px; display: flex; align-items: center">
                  <small>
                    <b>CPU {{ i }}</b>
                  </small>
                </div>
                <div style="flex: 1; display: flex; align-items: center; height: 12px">
                  <v-progress-linear
                    :model-value="core.load?.total ?? 0"
                    height="12"
                    :color="core.load?.total >= 90 ? 'red' : core.load?.total >= 75 ? 'orange' : 'green'"
                    style="margin-top: 2px; border-radius: 6px; overflow: hidden; width: 100%"
                  >
                    <template #default>
                      <span>{{ Number(core.load?.total ?? 0).toFixed(2) }}%</span>
                    </template>
                  </v-progress-linear>
                </div>
                <span style="width: 12px"></span>
              </v-col>
            </v-row>
          </details>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toRefs, computed } from 'vue';

const osInfo = ref({});
const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) },
  temperature: { type: Object, default: () => ({}) },
});
const { cpu, temperature } = toRefs(props);
const processor = computed(() => cpu.value ?? { load: 0 });
const temp = computed(() => temperature.value ?? {});

onMounted(() => {
  getOsInfo();
});

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    osInfo.value = await res.json();
  } catch (e) {
    console.log(e);
  }
};
</script>
