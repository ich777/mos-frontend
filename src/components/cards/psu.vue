<template>
    <v-row dense v-if="psuSensors.length > 0">
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('model') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ modelDisplayed }}
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('VRM Temp') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ vrmTemp ?? '-' }} {{ tempUnit }}
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('Case Temp') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ caseTemp ?? '-' }} {{ tempUnit }}
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('fan') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ fanRPM ?? '-' }} rpm
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('load') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ wattageTotal ?? '-' }} W
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('12V Utilization') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ wattage12V ?? '-' }} W
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('5V Utilization') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ wattage5V ?? '-' }} W
            </div>
        </v-col>
        <v-col cols="3" sm="3" md="3" xl="3">
            <div class="text-caption text-medium-emphasis"><strong>{{ $t('3.3V Utilization') }}</strong></div>
            <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ wattage3_3V ?? '-' }} W
            </div>
        </v-col>
    </v-row>
    <v-divider class="my-2" v-if="psuSensors.length > 0"></v-divider>
    <v-row dense v-if="psuSensors.length > 0">
        <v-col cols="12">
            <v-progress-linear :model-value="loadPercent"
                               height="16"
                               :color="loadPercent >= 90 ? 'error' : loadPercent >= 60 ? 'warning' : 'success'"
                               rounded
                               class="mb-1">
                <template #default>
                    <span><small>{{ loadPercent }}%</small></span>
                </template>
            </v-progress-linear>
        </v-col>
    </v-row>
    <div v-else class="text-body-2 text-medium-emphasis pa-4 text-center">
        {{ $t('no psu data available') }}
    </div>
</template>

<script setup>
    import { computed, toRefs } from 'vue'

    const props = defineProps({
        sensors: { type: Object, default: () => ({}) },
    })
    const { sensors } = toRefs(props)

    const psuSensors = computed(() => sensors.value?.psu ?? [])

    const manufacturer = computed(() => byName('Power Total')?.manufacturer ?? null)
    const model = computed(() => byName('Power Total')?.model ?? null)

    const modelDisplayed = computed(() => {
        const psuManufacturer = manufacturer.value
        const psuModel = model.value
        if (!psuManufacturer && !psuModel) return '-'
        if (psuManufacturer && psuModel) return `${psuManufacturer} ${psuModel}`
        return psuManufacturer || psuModel
    })

    const wattageMax = 750
    const wattageTotal = computed(() => byName('Power Total')?.value ?? null)
    const wattage12V = computed(() => byName('Power 12V')?.value ?? null)
    const wattage5V = computed(() => byName('Power 5V')?.value ?? null)
    const wattage3_3V = computed(() => byName('Power 3.3V')?.value ?? null)

    const vrmTemp = computed(() => byName('VRM Temp')?.value ?? null)
    const caseTemp = computed(() => byName('Case Temp')?.value ?? null)
    const tempUnit = computed(() => byName('VRM Temp')?.unit ?? null)

    const fanRPM = computed(() => byName('Fan Speed')?.value ?? null)

    const loadPercent = computed(() => {
        const w = Number(wattageTotal.value)
        if (!Number.isFinite(w) || wattageMax <= 0) return '0.0'
        const p = (w / wattageMax) * 100
        const clamped = Math.max(0, Math.min(100, p))
        return clamped.toFixed(1)
    })

    function byName(name) {
        const sensor = psuSensors.value.find((s) => s?.name === name) ?? null
        if (!sensor) return null
        const result = { ...sensor }

        if (result.value !== undefined && result.value !== null) {
            const v = Number(result.value)
            if (!isNaN(v)) {
                if (v === 0) {
                    result.value = "0"
                } else {
                    result.value = v.toFixed(1)
                }
            }
        }
        return sensor
    }
</script>