<template>
  <div v-if="props.pools && props.pools.length">
    <div v-for="(pool, poolIdx) in props.pools" :key="poolIdx" class="mb-3">
      <div class="d-flex align-center justify-space-between mb-1">
        <div class="text-subtitle-2 font-weight-medium" style="min-width: 0; line-height: 1.1">
          <span :title="pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}`" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 100%">
            <strong>{{ pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}` }}</strong>
          </span>
        </div>
        <div class="text-caption text-medium-emphasis" style="line-height: 1.1">{{ (pool.data_devices?.length ?? 0) + (pool.parity_devices?.length ?? 0) }} device(s)</div>
      </div>

      <v-row dense class="mb-0 py-0" style="flex-wrap: nowrap">
        <v-col cols="4" sm="4" class="py-0">
          <div class="text-caption text-medium-emphasis"><strong>{{ $t('device') }}</strong></div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0">
          <div class="text-caption text-medium-emphasis"><strong>{{ $t('read') }}</strong></div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0">
          <div class="text-caption text-medium-emphasis"><strong>{{ $t('write') }}</strong></div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0">
          <div class="text-caption text-medium-emphasis"><strong>{{ $t('r/s') }}</strong></div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0">
          <div class="text-caption text-medium-emphasis"><strong>{{ $t('w/s') }}</strong></div>
        </v-col>
      </v-row>

      <template v-if="(pool.data_devices && pool.data_devices.length) || (pool.parity_devices && pool.parity_devices.length)">
        <v-row v-for="(data_device, devIdx) in pool.data_devices ?? []" :key="`data-${devIdx}`" dense class="py-0" style="flex-wrap: nowrap">
          <v-col cols="4" sm="4" class="d-flex align-center py-1" style="gap: 6px; min-width: 0">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: rgba(0, 200, 255, 0.8); box-shadow: 0 0 0 2px rgba(0, 200, 255, 0.12); flex: 0 0 auto" />
            <div class="text-body-2" :title="data_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1">
              {{ data_device.device }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ data_device.performance ? data_device.performance.readBytes_total_human ?? data_device.performance.readBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ data_device.performance ? data_device.performance.writeBytes_total_human ?? data_device.performance.writeBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ data_device.performance ? data_device.performance.readSpeed_human ?? data_device.performance.readSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ data_device.performance ? data_device.performance.writeSpeed_human ?? data_device.performance.writeSpeed ?? '—' : '—' }}
            </div>
          </v-col>
        </v-row>

        <v-row v-for="(parity_device, devIdx) in pool.parity_devices ?? []" :key="`parity-${devIdx}`" dense class="py-0" style="flex-wrap: nowrap">
          <v-col cols="4" sm="4" class="d-flex align-center py-1" style="gap: 6px; min-width: 0">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: rgba(255, 180, 0, 0.9); box-shadow: 0 0 0 2px rgba(255, 180, 0, 0.16); flex: 0 0 auto" />
            <div class="text-body-2" :title="parity_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1">
              {{ parity_device.device }}
              <span class="text-caption text-medium-emphasis" style="line-height: 1.1; font-size: inherit; display: inline-block; vertical-align: baseline; margin-left: 6px">(parity)</span>
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ parity_device.performance ? parity_device.performance.readBytes_total_human ?? parity_device.performance.readBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ parity_device.performance ? parity_device.performance.writeBytes_total_human ?? parity_device.performance.writeBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ parity_device.performance ? parity_device.performance.readSpeed_human ?? parity_device.performance.readSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1">
              {{ parity_device.performance ? parity_device.performance.writeSpeed_human ?? parity_device.performance.writeSpeed ?? '—' : '—' }}
            </div>
          </v-col>
        </v-row>
      </template>

      <div v-else class="text-body-2 text-medium-emphasis">No devices</div>
    </div>
  </div>

  <div v-else class="text-body-2 text-medium-emphasis">No pools</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  pools: {
    type: Array,
    default: () => [],
  },
});

onMounted(() => {});
</script>
