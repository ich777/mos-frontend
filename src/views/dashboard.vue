<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
      <h2>{{ $t('dashboard') }}</h2>
      </v-container>
      <v-row>
        <v-col cols="12" md="6">
          <OS />
        </v-col>
        <v-col cols="12" md="6">
          <Network v-if="network" :network="network" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <Processor v-if="cpu" :cpu="cpu" />
        </v-col>
        <v-col cols="12" md="6">
          <Memory v-if="memory" :memory="memory" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Processor from '../components/processor.vue'
import Memory from '../components/memory.vue'
import OS from '../components/os.vue'
import Network from '../components/network.vue'

const cpu = ref(null);
const network = ref(null);
const error = ref(null);
const memory = ref(null);
let timer = null;

const getLoad = async () => {
  try {
    const res = await fetch('/api/v1/system/load', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    const result = await res.json();
    network.value = result.network;
    cpu.value = result.cpu;
    memory.value = result.memory;

  } catch (e) {
    error.value = e.message;
  }
}

onMounted(() => {
  getLoad();
  timer = setInterval(getLoad, 2000);
})

onUnmounted(() => { clearInterval(timer) })

</script>