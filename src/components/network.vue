<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ $t('network') }}</span>
      <v-chip size="small" v-if="nic?.interface">{{ nic.interface }}</v-chip>
    </v-card-title>

    <v-card-text>
      <template v-if="nic">
        <p v-if="nic.type"><b>{{ $t('type') }}:</b> {{ nic.type }}</p>
        <p v-if="nic.state"><b>{{ $t('state') }}:</b> {{ nic.state }}</p>
        <p v-if="nic.ip4"><b>{{ $t('ip4') }}:</b> {{ nic.ip4 }}</p>
        <p v-if="nic.ip6"><b>{{ $t('ip6') }}:</b> {{ nic.ip6 }}</p>
        <p v-if="nic.mac"><b>{{ $t('mac') }}:</b> {{ nic.mac }}</p>
        <v-divider class="my-2" />
        <div class="chart-wrapper">
          <canvas ref="chartEl" aria-label="Network throughput history"></canvas>
        </div>
      </template>
      <template v-else>
        <p>{{ $t('no network interface found') }}</p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps({
  network: { type: Object, default: () => ({ interfaces: [] }) },
  maxPoints: { type: Number, default: 60 }
})

const { network, maxPoints } = toRefs(props)
const MAX_POINTS = maxPoints.value
const nic = ref(null)
const chartEl = ref(null)
let chart = null

let labels = []
let seriesRx = []
let seriesTx = []
let seriesTotal = []

function clampHistory() {
  const trim = (arr) => { if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS) }
  trim(labels); trim(seriesRx); trim(seriesTx); trim(seriesTotal)
}

// Bytes/s → schöner Text (B/s, KB/s, MB/s, GB/s)
function formatBytesPerSec(bytesPerSec) {
  if (bytesPerSec == null || isNaN(bytesPerSec)) return '–'
  const abs = Math.abs(bytesPerSec)
  if (abs < 1024) return `${bytesPerSec.toFixed(0)} B/s`
  const units = ['KB/s', 'MB/s', 'GB/s', 'TB/s']
  let v = bytesPerSec / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)} ${units[i]}`
}

function initChart() {
  if (!chartEl.value) return
  chart = markRaw(new Chart(chartEl.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'RX', data: seriesRx, borderColor: '#4caf50', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: 'TX', data: seriesTx, borderColor: '#2196f3', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: 'Total', data: seriesTotal, borderColor: '#ff9800', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 }
      ]
    },
options: {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  normalized: true,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'line'
      }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatBytesPerSec(ctx.parsed.y)}`
      }
    }
  },
  scales: {
    x: { ticks: { autoSkip: true, maxTicksLimit: 6 } },
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => formatBytesPerSec(v) }
    }
  }
}
  }))
}

function syncAndUpdateChart() {
  if (!chart) return
  chart.data.labels = labels
  chart.data.datasets[0].data = seriesRx
  chart.data.datasets[1].data = seriesTx
  chart.data.datasets[2].data = seriesTotal
  chart.update('none')
}

watch(
  () => network.value?.interfaces?.[0],
  (newVal) => {
    if (!newVal) {
      nic.value = null
      labels = []; seriesRx = []; seriesTx = []; seriesTotal = []
      syncAndUpdateChart()
      return
    }

    if (!nic.value) {
      nic.value = { ...newVal }
    } else {
      Object.keys(newVal).forEach(key => { nic.value[key] = newVal[key] })
    }

    const rxB = newVal?.statistics?.rx?.speed_bps
    const txB = newVal?.statistics?.tx?.speed_bps
    let totalB = newVal?.statistics?.total?.speed_bps

    if ((totalB == null || isNaN(totalB)) && (rxB != null || txB != null)) {
      totalB = (rxB || 0) + (txB || 0)
    }

    if (rxB == null && txB == null && totalB == null) return

    const ts = new Date()
    const label = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    labels.push(label)
    seriesRx.push(rxB ?? NaN)
    seriesTx.push(txB ?? NaN)
    seriesTotal.push(totalB ?? NaN)

    clampHistory()
    syncAndUpdateChart()
  },
  { immediate: true, deep: true }
)

onMounted(() => initChart())
onBeforeUnmount(() => { if (chart) { chart.destroy(); chart = null } })
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
}
</style>
