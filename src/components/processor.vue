<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('processor') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p v-if="osInfo && osInfo.cpu">
          <b>{{ osInfo.cpu.manufacturer }}, {{ osInfo.cpu.brand }}</b>
        </p>
        <p v-if="osInfo.cpu?.cores !== undefined">
          <b>{{ $t('cores') }}:</b> {{ osInfo.cpu.cores }}
        </p>
        <p v-if="osInfo.cpu?.physicalCores !== undefined">
          <b>{{ $t('physicalcores') }}:</b> {{ osInfo.cpu.physicalCores }}
        </p>
        <p v-if="temp && temp.main !== null">
          <b>{{ $t('temperature') }}:</b> {{ temp.main }}°C / {{ temp.min }} °C / {{ temp.max }} °C
        </p>
        <v-divider class="mt-2 mb-2"></v-divider>
        <v-row class="align-center">
          <v-col cols="auto" class="d-flex align-center" style="width: 60px;">
            <b>{{ $t('load') }}:</b>
          </v-col>
          <v-col class="d-flex align-center" style="height: 14px;">
            <v-progress-linear :model-value="processor.load" height="14" color="primary"
              style="margin-top: 0; border-radius: 7px; overflow: hidden;">
              <template #default>
                <span>{{ processor.load.toFixed(2) }}%</span>
              </template>
            </v-progress-linear>
          </v-col>
        </v-row>
        <div v-if="processor.cores && processor.cores.length">
          <v-row dense>
            <v-col v-for="(core, i) in processor.cores" :key="i" cols="12" sm="6" class="d-flex align-center"
              style="gap:8px; margin-top:6px;">
              <div style="width:48px; display:flex; align-items:center;">
                <small><b>CPU {{ i }}</b></small>
              </div>
              <div style="flex:1; display:flex; align-items:center; height:12px;">
                <v-progress-linear :model-value="core.load?.total ?? 0" height="12" color="primary"
                  style="margin-top:2px; border-radius:6px; overflow:hidden; width:100%;">
                  <template #default>
                    <span>{{ (Number(core.load?.total ?? 0)).toFixed(2) }}%</span>
                  </template>
                </v-progress-linear>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toRefs, computed } from 'vue'

const osInfo = ref({});
const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) },
  temperature: { type: Object, default: () => ({}) }
})
const { cpu, temperature } = toRefs(props)
const processor = computed(() => cpu.value ?? { load: 0 })
const temp = computed(() => temperature.value ?? {})

onMounted(() => {
  getOsInfo();
});

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    osInfo.value = await res.json();

  } catch (e) {
    console.log(e);
  }
}

</script>
