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
import { io } from 'socket.io-client'
import Processor from '../components/processor.vue'
import Memory from '../components/memory.vue'
import OS from '../components/os.vue'
import Network from '../components/network.vue'

const cpu = ref(null);
const network = ref(null);
const error = ref(null);
const memory = ref(null);
const isConnected = ref(false);
let socket = null;

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

const getLoadWS = () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    error.value = 'No auth token found'
    return
  }

  // Socket.io connection
  socket = io('/system', {
    path: '/api/v1/socket.io/',
    transports: ['websocket'],
    upgrade: false
  })

  // Connection successful
  socket.on('connect', () => {
    console.log('WebSocket connected')
    isConnected.value = true
    error.value = null

    // Subscribe to load updates with token
    socket.emit('subscribe-load', {
      token: authToken
    })
  })

  // Connection error
  socket.on('connect_error', (err) => {
    console.error('WebSocket connection error:', err)
    error.value = `Connection error: ${err.message}`
    isConnected.value = false
  })

  // Connection disconnected
  socket.on('disconnect', () => {
    console.log('WebSocket connection disconnected')
    isConnected.value = false
  })

  // Initial data received
  socket.on('get-load', (data) => {
    console.log('Initial system data received:', data)
    if (data.cpu) cpu.value = data.cpu
    if (data.memory) memory.value = data.memory
    if (data.network) network.value = data.network
  })

  // Live updates received
  socket.on('load-update', (data) => {
    console.log('System data update received:', data)
    if (data.cpu) cpu.value = data.cpu
    if (data.memory) memory.value = data.memory
    if (data.network) network.value = data.network
  })

  // Error handling
  socket.on('error', (err) => {
    console.error('Socket error:', err)
    error.value = `Socket error: ${err}`
  })
}

onMounted(() => {
  getLoad();
  getLoadWS();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

</script>