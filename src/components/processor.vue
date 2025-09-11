<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('processor') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p v-if="osInfo.cpu?.manufacturer && osInfo.cpu?.brand">
          <b>{{ osInfo.cpu.manufacturer }}, {{ osInfo.cpu.brand }}</b>
        </p>
        <p v-if="osInfo.cpu?.cores !== undefined">
          <b>{{ $t('cores') }}:</b> {{ osInfo.cpu.cores }}
        </p>
        <p v-if="osInfo.cpu?.physicalCores !== undefined">
          <b>{{ $t('physicalcores') }}:</b> {{ osInfo.cpu.physicalCores }}
        </p>
        <v-row class="align-center">
          <v-col cols="auto" class="d-flex align-center" style="width: 60px;">
            <b>{{ $t('load') }}:</b>
          </v-col>
          <v-col class="d-flex align-center" style="height: 14px;">
            <v-progress-linear :model-value="processor.load" height="14" color="primary" style="margin-top: 0;">
              <template #default>
                <span>{{ processor.load.toFixed(2) }}%</span>
              </template>
            </v-progress-linear>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toRefs, computed } from 'vue'

const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) }
})
const { cpu } = toRefs(props)
const processor = computed(() => cpu.value ?? { load: 0 })
const osInfo = ref({});

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
