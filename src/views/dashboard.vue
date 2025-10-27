<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ t('dashboard') }}</h2>
      </v-container>

      <div class="masonry-grid">
        <!-- Left Column -->
        <draggable
          v-model="left"
          group="widgets"
          item-key="id"
          handle=".drag-handle"
          class="column"
          ghost-class="ghost"
          animation="150"
        >
          <template #item="{ element }">
            <div class="card">
              <div class="card-head drag-handle">
                <span>⋮⋮</span>
                <span>{{ labelFor(element.kind) }}</span>
              </div>
              <component
                :is="components[element.kind]"
                v-bind="widgetProps(element.kind)"
                v-if="widgetVisible(element.kind)"
              />
            </div>
          </template>
        </draggable>

        <!-- Right Column -->
        <draggable
          v-model="right"
          group="widgets"
          item-key="id"
          handle=".drag-handle"
          class="column"
          ghost-class="ghost"
          animation="150"
        >
          <template #item="{ element }">
            <div class="card">
              <div class="card-head drag-handle">
                <span>⋮⋮</span>
                <span>{{ labelFor(element.kind) }}</span>
              </div>
              <component
                :is="components[element.kind]"
                v-bind="widgetProps(element.kind)"
                v-if="widgetVisible(element.kind)"
              />
            </div>
          </template>
        </draggable>
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { io } from 'socket.io-client'
import draggable from 'vuedraggable'
import Processor from '../components/processor.vue'
import Memory from '../components/memory.vue'
import OS from '../components/os.vue'
import Network from '../components/network.vue'
import Pools from '../components/pools.vue'

const { t } = useI18n()
const components = {
  OS,
  Processor,
  Pools,
  Network,
  Memory,
}
const cpu = ref(null)
const network = ref(null)
const memory = ref(null)
const temperature = ref(null)
const isConnected = ref(false)
const error = ref(null)
const left = ref([])
const right = ref([])
const DEFAULT_LEFT = [
  { id: 'os',        kind: 'OS' },
  { id: 'processor', kind: 'Processor' },
  { id: 'pools',     kind: 'Pools' },
]
const DEFAULT_RIGHT = [
  { id: 'network',   kind: 'Network' },
  { id: 'memory',    kind: 'Memory' },
]
const kindKeyMap = {
  OS: 'os',
  Processor: 'processor',
  Pools: 'pools',
  Network: 'network',
  Memory: 'memory',
}

let socket = null

function labelFor(kind) {
  const key = kindKeyMap[kind] || kind?.toLowerCase?.() || String(kind || '')
  return t(key)
}

function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem('dashLayout'))
    if (saved?.left && saved?.right) {
      left.value  = saved.left.map(({ id, kind }) => ({ id, kind }))
      right.value = saved.right.map(({ id, kind }) => ({ id, kind }))
      return
    }
  } catch (_) {}
  left.value  = DEFAULT_LEFT
  right.value = DEFAULT_RIGHT
}

function saveLayout() {
  localStorage.setItem(
    'dashLayout',
    JSON.stringify({
      left: left.value.map(({ id, kind }) => ({ id, kind })),
      right: right.value.map(({ id, kind }) => ({ id, kind })),
    }),
  )
}

watch([left, right], saveLayout, { deep: true })

function widgetProps(kind) {
  switch (kind) {
    case 'Processor':
      return { cpu: cpu.value, temperature: temperature.value }
    case 'Network':
      return { network: network.value }
    case 'Memory':
      return { memory: memory.value }
    default:
      return {}
  }
}

function widgetVisible(kind) {
  if (kind === 'Processor') return !!cpu.value
  if (kind === 'Network')   return !!network.value
  if (kind === 'Memory')    return !!memory.value
  return true
}

const getLoad = async () => {
  try {
    const res = await fetch('/api/v1/system/load', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('authToken') },
    })
    if (!res.ok) throw new Error('API-Error')
    const result = await res.json()
    network.value     = result.network
    cpu.value         = result.cpu
    memory.value      = result.memory
    temperature.value = result.temperature
  } catch (e) {
    error.value = e.message
  }
}

const getLoadWS = () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    error.value = 'No auth token found'
    return
  }

  socket = io('/system', { path: '/api/v1/socket.io/', transports: ['websocket'], upgrade: false })

  socket.on('connect', () => {
    isConnected.value = true
    error.value = null
    socket.emit('subscribe-load', { token: authToken })
  })

  socket.on('connect_error', (err) => {
    error.value = `Connection error: ${err.message}`
    isConnected.value = false
  })
  socket.on('disconnect', () => {
    isConnected.value = false
  })

  const apply = (data) => {
    if (data.cpu)         cpu.value = data.cpu
    if (data.memory)      memory.value = data.memory
    if (data.network)     network.value = data.network
    if (data.temperature) temperature.value = data.temperature
  }
  socket.on('get-load', apply)
  socket.on('load-update', apply)
  socket.on('error', (err) => {
    error.value = `Socket error: ${err}`
  })
}

onMounted(() => {
  loadLayout()
  getLoad()
  getLoadWS()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
})
</script>

<style scoped>
.masonry-grid {
  display: flex;
  gap: 16px;
}
.column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.card {
  background: var(--v-theme-surface);
  border-radius: 12px;
  padding: 8px 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--v-theme-outline, rgba(0, 0, 0, 0.15));
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 6px;
}
.drag-handle {
  cursor: grab;
  user-select: none;
}

.ghost {
  opacity: 0.5;
  transform: scale(0.98);
}

:deep(.v-theme--dark) .card {
  border-color: var(--v-theme-outline, rgba(255, 255, 255, 0.25));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

@media (max-width: 800px) {
  .masonry-grid {
    flex-direction: column;
  }
}
</style>
