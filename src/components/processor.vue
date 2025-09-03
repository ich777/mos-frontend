<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('processor') }}
    </v-card-title>
    <v-card-text>
      <div v-if="error" style="color:red">{{ error }}</div>
      <div v-else>
        <p><b>{{ info.manufacturer }}, {{ info.brand }}</b></p>
        <p><b>{{ $t('load') }}:</b> {{ processor.load.toFixed(2) }} %</p>
        <p><b>{{ $t('cores') }}:</b> {{ info.cores }}</p>
        <p><b>{{ $t('physicalcores') }}:</b> {{ info.physicalCores }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toRefs, computed } from 'vue'

const info = ref({});
const error = ref('');
const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) }
})
const { cpu } = toRefs(props)
const processor = computed(() => cpu.value ?? null)

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
    error.value = '';

  } catch (e) {
    error.value = e.message;
  }
}

</script>
