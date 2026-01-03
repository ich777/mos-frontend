<template>
    <v-row dense v-if="groupedFans.length > 0">
        <v-col cols="12">
            <v-row dense>
                <v-col :cols="hasPercentageData ? 4 : 6">
                    <div class="text-caption text-medium-emphasis">
                        <v-icon size="small" class="mr-1">mdi-fan</v-icon>
                        <strong>{{ $t('name') }}</strong>
                    </div>
                </v-col>
                <v-col :cols="hasPercentageData ? 4 : 6">
                    <div class="text-caption text-medium-emphasis text-right">
                        <v-icon size="small" class="mr-1">mdi-speedometer</v-icon>
                        <strong>{{ $t('speed') }}</strong>
                    </div>
                </v-col>
                <v-col v-if="hasPercentageData" cols="4">
                    <div class="text-caption text-medium-emphasis text-right">
                        <v-icon size="small" class="mr-1">mdi-percent-outline</v-icon>
                        <strong>{{ $t('duty cycle') }}</strong>
                    </div>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" v-for="fan in groupedFans" :key="fan.name">
            <v-row dense align="center">
                <v-col :cols="hasPercentageData ? 4 : 6">
                    <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ fan.name }}
                    </div>
                </v-col>
                <v-col :cols="hasPercentageData ? 4 : 6">
                    <div class="text-body-2 text-right" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ fan.speed ?? '-' }} {{ fan.speedUnit ?? '' }}
                    </div>
                </v-col>
                <v-col v-if="hasPercentageData" cols="4">
                    <div class="text-body-2 text-right" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ fan.percentage ?? '-' }} {{ fan.percentageUnit ?? '' }}
                    </div>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
    <div v-else class="text-body-2 text-medium-emphasis pa-4 text-center">
        {{ $t('no fan data available') }}
    </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  sensors: { type: Object, default: () => ({}) },
});
const { sensors } = toRefs(props);

const fanSensors = computed(() => sensors.value?.fan ?? [])

const groupedFans = computed(() => {
    const grouped = {}

    fanSensors.value.forEach(sensor => {
        if (!sensor?.name) return

        if (!grouped[sensor.name]) {
            grouped[sensor.name] = {
                name: sensor.name,
                speed: null,
                speedUnit: null,
                percentage: null,
                percentageUnit: null,
                minIndex: Infinity
            }
        }

        if (typeof sensor.index === 'number' && sensor.index < grouped[sensor.name].minIndex) {
            grouped[sensor.name].minIndex = sensor.index
        }

        const roundValue = (val) => {
            const v = Number(val)
            if (!Number.isFinite(v)) return val
            return v === 0 ? 0 : Number(v.toFixed(1))
        }

        if (sensor.subtype === 'speed') {
            grouped[sensor.name].speed = roundValue(sensor.value)
            grouped[sensor.name].speedUnit = sensor.unit || 'rpm'
        } else if (sensor.subtype === 'percentage') {
            grouped[sensor.name].percentage = roundValue(sensor.value)
            grouped[sensor.name].percentageUnit = sensor.unit || '%'
        }
    })

    return Object.values(grouped).sort((a, b) => {
        if (a.minIndex !== Infinity && b.minIndex !== Infinity) {
            return a.minIndex - b.minIndex
        }
        if (a.minIndex !== Infinity) return -1
        if (b.minIndex !== Infinity) return 1
    })
})

const hasPercentageData = computed(() => {
    return groupedFans.value.some(fan => fan.percentage !== null && fan.percentage !== undefined)
})
</script>