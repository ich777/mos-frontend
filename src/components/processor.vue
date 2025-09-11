<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('processor') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p><b>{{ info.manufacturer }}, {{ info.brand }}</b></p>
        <p><b>{{ $t('cores') }}:</b> {{ info.cores }}</p>
        <p><b>{{ $t('physicalcores') }}:</b> {{ info.physicalCores }}</p>
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

const info = ref({});
const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) }
})
const { cpu } = toRefs(props)
const processor = computed(() => cpu.value ?? { load: 0 })

onMounted(() => {
  fetchInfo();
});

const fetchInfo = async () => {
  try {
    const res = await fetch('/api/v1/system/info', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    info.value = result.cpu;

  } catch (e) {

  }
}

</script>
