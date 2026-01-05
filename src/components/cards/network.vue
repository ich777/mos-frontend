<template>
  <template v-if="network && network.interfaces && network.interfaces.length">
  <v-row dense>
    <template v-if="nic">
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.interface">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('interface') }}</strong></div>
        <div class="text-body-2" :title="nic.interface" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.interface }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.type">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('type') }}</strong></div>
        <div class="text-body-2" :title="nic.type" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.type }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.state">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('state') }}</strong></div>
        <div class="text-body-2" :title="nic.state" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.state }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.ip4">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('ip4') }}</strong></div>
        <div class="text-body-2" :title="nic.ip4" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.ip4 }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.ip6">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('ip6') }}</strong></div>
        <div class="text-body-2" :title="nic.ip6" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.ip6 }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="3" xl="2" v-if="nic.mac">
        <div class="text-caption text-medium-emphasis"><strong>{{ $t('mac') }}</strong></div>
        <div class="text-body-2" :title="nic.mac" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.mac }}</div>
      </v-col>

      <v-divider class="my-2" />

      <div class="chart-wrapper">
        <canvas ref="chartEl" aria-label="Network throughput history"></canvas>
      </div>
    </template>

    <template v-else>
      <p>{{ $t('no network interface found') }}</p>
    </template>
  </v-row>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" class="my-2" />
  </template>
</template>

<script setup>
import { toRefs, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps({
  network: { type: Object, default: () => ({ interfaces: [] }) },
  maxPoints: { type: Number, default: 60 },
})

const { network, maxPoints } = toRefs(props)
const MAX_POINTS = maxPoints.value
const nic = ref(null)
const chartEl = ref(null)
let chart = null
let themeObserver = null

let labels = []
let seriesRx = []
let seriesTx = []
let seriesTotal = []

function clampHistory() {
  const trim = (arr) => { if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS) }
  trim(labels); trim(seriesRx); trim(seriesTx); trim(seriesTotal)
}

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

function themeHost() {
  return document.querySelector('.v-theme--dark, .v-theme--light') || document.documentElement
}
function cssRgb(varName) {
  const host = themeHost()
  const v = getComputedStyle(host).getPropertyValue(varName)
  return (v || '').trim() || '255,255,255'
}
const rgba = (rgb, a) => `rgba(${rgb}, ${a})`

function applyChartTheme() {
  if (!chart) return
  const onSurface = cssRgb('--v-theme-on-surface')
  const surface   = cssRgb('--v-theme-surface')

  const gridColor   = rgba(onSurface, 0.16)
  const tickColor   = rgba(onSurface, 0.85)
  const legendColor = rgba(onSurface, 0.9)

  chart.options.scales.x.grid = { color: gridColor, drawBorder: false }
  chart.options.scales.y.grid = { color: gridColor, drawBorder: false }

  chart.options.scales.x.ticks = { ...(chart.options.scales.x.ticks || {}), color: tickColor }
  chart.options.scales.y.ticks = { ...(chart.options.scales.y.ticks || {}), color: tickColor }

  chart.options.plugins.legend.labels.color = legendColor
  chart.options.plugins.tooltip.titleColor  = rgba(onSurface, 1)
  chart.options.plugins.tooltip.bodyColor   = rgba(onSurface, 0.95)
  chart.options.plugins.tooltip.borderColor = rgba(onSurface, 0.2)
  chart.options.plugins.tooltip.backgroundColor = rgba(surface, 0.9)

  chart.update('none')
}

function observeThemeChanges() {
  const host = themeHost()
  if (themeObserver) themeObserver.disconnect()
  themeObserver = new MutationObserver(() => applyChartTheme())
  themeObserver.observe(host, { attributes: true, attributeFilter: ['class'] })
}

function initChart() {
  if (!chartEl.value) return
  chart = markRaw(new Chart(chartEl.value.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'RX',    data: seriesRx,    borderColor: '#4caf50', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: 'TX',    data: seriesTx,    borderColor: '#2196f3', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: 'Total', data: seriesTotal, borderColor: '#ff9800', fill: false, tension: 0.25, pointRadius: 0, borderWidth: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      normalized: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'line' } },
        tooltip: {
          borderWidth: 1,
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatBytesPerSec(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: { ticks: { autoSkip: true, maxTicksLimit: 6 } },
        y: { beginAtZero: true, ticks: { callback: (v) => formatBytesPerSec(v) } },
      },
    },
  }))
  applyChartTheme()
  observeThemeChanges()
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

    if (!nic.value) nic.value = { ...newVal }
    else Object.keys(newVal).forEach(k => { nic.value[k] = newVal[k] })

    const rxB = newVal?.statistics?.rx?.speed_bps
    const txB = newVal?.statistics?.tx?.speed_bps
    let totalB = newVal?.statistics?.total?.speed_bps
    if ((totalB == null || isNaN(totalB)) && (rxB != null || txB != null)) totalB = (rxB || 0) + (txB || 0)
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
onBeforeUnmount(() => {
  if (themeObserver) { themeObserver.disconnect(); themeObserver = null }
  if (chart) { chart.destroy(); chart = null }
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
}
.chart-wrapper canvas {
  background: transparent;
}
</style>
