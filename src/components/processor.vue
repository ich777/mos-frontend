<template>
  <!--<v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo && osInfo.cpu">
    <v-chip v-if="temp && temp.main != null" size="small">Main {{ temp.main }}°C</v-chip>
    <v-chip v-if="temp && temp.min != null" size="small">Min {{ temp.min }} °C</v-chip>
    <v-chip v-if="temp && temp.max != null" size="small">Max {{ temp.max }} °C</v-chip>
  </div>-->
  <v-row dense>
    <v-col cols="6" sm="6" md="6" xl="6" v-if="osInfo && osInfo.cpu">
      <div class="text-caption text-medium-emphasis">
        <strong>{{ $t('brand') }}</strong>
      </div>
      <div class="text-body-2" :title="osInfo.base[0].os_id" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.cpu.manufacturer }}, {{ osInfo.cpu.brand }}</div>
    </v-col>
    <v-col cols="6" sm="6" md="6" xl="6" v-if="processor.info.architecture !== undefined">
      <div class="text-caption text-medium-emphasis">
        <strong>{{ $t('architecture') }}</strong>
      </div>
      <div class="text-body-2" :title="processor.info.architecture" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ processor.info.architecture }}</div>
    </v-col>
    <v-col cols="6" sm="6" md="3" xl="3" v-if="osInfo.cpu?.cores !== undefined && osInfo.cpu?.physicalCores !== undefined">
      <div class="text-caption text-medium-emphasis">
        <strong>{{ $t('cores') }}</strong>
      </div>
      <div class="text-body-2" :title="processor.info.architecture" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.cpu.physicalCores }} / {{ osInfo.cpu.cores }}</div>
    </v-col>
    <v-col cols="6" sm="6" md="3" xl="3" v-if="temp.main != null || temp.min != null || temp.max != null">
      <div class="text-caption text-medium-emphasis">
        <strong>{{ $t('temperature / min / max') }}</strong>
      </div>
      <span v-if="temp.main != null" class="text-body-2" :title="temp.main" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ temp.main }}°C</span> 
      <span v-if="temp.min != null" class="text-body-2" :title="temp.min" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">/ {{ temp.min }}°C</span>
      <span v-if="temp.max != null" class="text-body-2" :title="temp.max" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">/ {{ temp.max }}°C</span>
    </v-col>
    <v-divider class="mt-2 mb-2"></v-divider>
    <v-col cols="auto" class="d-flex align-center text-caption" style="width: 60px">
      <strong>{{ $t('load') }}:</strong>
    </v-col>
    <v-col class="d-flex align-center">
      <v-progress-linear
        :model-value="processor.load"
        height="14"
        :color="processor.load >= 90 ? 'red' : processor.load >= 60 ? 'orange' : 'green'"
        style="margin-top: 0; border-radius: 7px; overflow: hidden"
      >
        <template #default>
          <span><small>{{ processor.load.toFixed(2) }}%</small></span>
        </template>
      </v-progress-linear>
    </v-col>
    <v-col cols="12" sm="12" md="12" xl="12">
      <div v-if="processor.cores && processor.cores.length">
        <details class="mt-2">
          <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline">{{ $t('cores') }}</summary>
          <div class="cores-grid">
            <div class="core-row" v-for="(core, i) in processor.cores" :key="i">
              <div class="core-label text-body-2">
                <small>
                  <b>CPU {{ i }}</b>
                </small>
              </div>

              <div class="core-bar">
                <v-progress-linear
                  :model-value="core.load?.total ?? 0"
                  height="12"
                  :color="core.load?.total >= 90 ? 'red' : core.load?.total >= 75 ? 'orange' : 'green'"
                  style="margin-top: 2px; border-radius: 6px; overflow: hidden; width: 100%"
                >
                  <template #default>
                    <span><small>{{ Number(core.load?.total ?? 0).toFixed(2) }}%</small></span>
                  </template>
                </v-progress-linear>
              </div>
            </div>
          </div>
        </details>
      </div>
    </v-col>
  </v-row>
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

<style scoped>
.cores-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 6px;
  margin: 4px;
}

.core-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.core-label {
  width: 48px;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.core-bar {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 12px;
}
</style>
