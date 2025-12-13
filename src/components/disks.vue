<template>
  <div v-if="props.disks && props.disks.length" style="overflow: hidden">
    <div v-for="(pool, poolIdx) in props.disks" :key="poolIdx" class="mb-1" style="overflow: hidden">
      <div class="d-flex align-center justify-space-between mb-0 mt-2" style="overflow: hidden">
        <div class="text-subtitle-2 font-weight-medium" style="min-width: 0; line-height: 1; overflow: hidden">
          <span :title="pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}`" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 100%">
            <strong>{{ pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}` }}</strong>
          </span>
        </div>
        <div class="text-caption text-medium-emphasis" style="line-height: 1; overflow: hidden">{{ (pool.data_devices?.length ?? 0) + (pool.parity_devices?.length ?? 0) }} {{ $t('device(s)') }}</div>
      </div>

      <v-divider class="my-2" />

      <v-row dense class="mb-0 py-0" style="flex-wrap: nowrap; overflow: hidden">
        <v-col cols="3" sm="3" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('device') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('read') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('written') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('r/s') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('w/s') }}</strong>
          </div>
        </v-col>
        <v-col cols="1" sm="1" class="py-0" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('temperature') }}</strong>
          </div>
        </v-col>        
      </v-row>

      <template v-if="(pool.data_devices && pool.data_devices.length) || (pool.parity_devices && pool.parity_devices.length)">
        <v-row v-for="(data_device, devIdx) in pool.data_devices ?? []" :key="`data-${devIdx}`" dense class="py-0" style="flex-wrap: nowrap; overflow: hidden">
          <v-col cols="3" sm="3" class="d-flex align-center py-1" style="gap: 3px; min-width: 0; overflow: hidden">
            <span
              style="display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: rgba(0, 200, 255, 0.8); box-shadow: 0 0 0 2px rgba(0, 200, 255, 0.12); flex: 0 0 auto"
            ></span>
            <div class="text-body-2" :title="data_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; min-width: 0">
              {{ data_device.device }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? data_device.performance.readBytes_total_human ?? data_device.performance.readBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? data_device.performance.writeBytes_total_human ?? data_device.performance.writeBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? data_device.performance.readSpeed_human ?? data_device.performance.readSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? data_device.performance.writeSpeed_human ?? data_device.performance.writeSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="1" sm="1" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.temperature ?? '—' }}
            </div>
          </v-col>
        </v-row>

        <v-row v-for="(parity_device, devIdx) in pool.parity_devices ?? []" :key="`parity-${devIdx}`" dense class="py-0" style="flex-wrap: nowrap; overflow: hidden">
          <v-col cols="3" sm="3" class="d-flex align-center py-1" style="gap: 6px; min-width: 0; overflow: hidden">
            <span
              style="display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: rgba(255, 180, 0, 0.9); box-shadow: 0 0 0 2px rgba(255, 180, 0, 0.16); flex: 0 0 auto"
            ></span>
            <div class="text-body-2" :title="parity_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; min-width: 0">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: baseline">
                {{ parity_device.device }}
                <span class="text-caption text-medium-emphasis" style="line-height: 1.1; font-size: inherit; display: inline; vertical-align: baseline; margin-left: 6px; overflow: hidden">
                  (parity)
                </span>
              </span>
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? parity_device.performance.readBytes_total_human ?? parity_device.performance.readBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? parity_device.performance.writeBytes_total_human ?? parity_device.performance.writeBytes_total ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? parity_device.performance.readSpeed_human ?? parity_device.performance.readSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? parity_device.performance.writeSpeed_human ?? parity_device.performance.writeSpeed ?? '—' : '—' }}
            </div>
          </v-col>
          <v-col cols="1" sm="1" class="py-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.temperature ?? '—' }}
            </div>
          </v-col>          
        </v-row>
      </template>

      <div v-else class="text-body-2 text-medium-emphasis">No devices</div>
    </div>
  </div>

  <div v-else class="text-body-2 text-medium-emphasis">No disks</div>
</template>

<script setup>

const props = defineProps({
  disks: {
    type: Array,
    default: () => [],
  },
});

</script>
