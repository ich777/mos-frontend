<template>
    <v-row dense v-if="otherSensors.length > 0">
        <v-col cols="12">
            <v-row dense>
                <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">
                        <v-icon size="small" class="mr-1">mdi-lightning-bolt-circle</v-icon>
                        <strong>{{ $t('name') }}</strong>
                    </div>
                </v-col>
                <v-col cols="6">
                    <div class="text-caption text-medium-emphasis text-right">
                        <strong>{{ $t('value') }}</strong>
                    </div>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" v-for="sensor in sortedSensors" :key="sensor.id">
            <v-row dense align="center">
                <v-col cols="6">
                    <div class="text-body-2" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ sensor.name }}
                    </div>
                </v-col>
                <v-col cols="6">
                    <div class="text-body-2 text-right" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                        {{ formatValue(sensor.value) }} {{ sensor.unit ?? '' }}
                    </div>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
    <div v-else class="text-body-2 text-medium-emphasis pa-4 text-center">
        {{ $t('no custom data available') }}
    </div>
</template>

<script setup>
    import { computed, toRefs } from 'vue';

    const props = defineProps({
        sensors: { type: Object, default: () => ({}) },
    });
    const { sensors } = toRefs(props);

    const otherSensors = computed(() => sensors.value?.other ?? [])

    const sortedSensors = computed(() => {
        return [...otherSensors.value].sort((a, b) => {
            const aIndex = typeof a?.index === 'number' ? a.index : Infinity
            const bIndex = typeof b?.index === 'number' ? b.index : Infinity

            if (aIndex !== bIndex) {
                return aIndex - bIndex
            }
        })
    })

    function formatValue(value) {
        const v = Number(value)
        if (!Number.isFinite(v)) return '-'
        return v === 0 ? '0' : Number(v.toFixed(1))
    }
</script>