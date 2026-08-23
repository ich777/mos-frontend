<template>
    <template v-if="!nutData || !nutData.reachable">
        <p class="text-body-2">{{ $t('no nut data available') }}</p>
        <p class="text-caption text-medium-emphasis">{{ $t('please configure nut in mos settings') }}</p>
    </template>
    <template v-else-if="nutData && nutData.reachable">
        <v-row density="compact">
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.name">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('ups name') }}</strong>
                </div>
                <div class="text-body-2" :title="nutData.name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                    {{ nutData.name }}
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.status">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('status') }}</strong>
                </div>
                <div class="text-body-2">
                    <v-chip :color="getStatusColor(nutData.status)" size="small" variant="flat">
                        {{ nutData.status }}
                    </v-chip>
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.manufacturer">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('manufacturer') }}</strong>
                </div>
                <div class="text-body-2" :title="nutData.data.manufacturer" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                    {{ nutData.data.manufacturer }}
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.model">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('model') }}</strong>
                </div>
                <div class="text-body-2" :title="nutData.data.model" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                    {{ nutData.data.model }}
                </div>
            </v-col>

            <!-- Battery Section -->
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.battery?.charge !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('battery charge') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.battery.charge }}%
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.battery?.runtime !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('battery runtime') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ formatRuntime(nutData.data.battery.runtime) }}
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.battery?.voltage !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('voltage') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.battery.voltage }}V
                </div>
            </v-col>

            <!-- Load & Power Section -->
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.load !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('load') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.load }}%
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.input?.voltage !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('input voltage') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.input.voltage }}V
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.input?.frequency !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('input frequency') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.input.frequency }}Hz
                </div>
            </v-col>
            <v-col cols="6" sm="6" md="4" xl="3" v-if="nutData?.data?.output?.voltage !== undefined">
                <div class="text-caption text-medium-emphasis">
                    <strong>{{ $t('output voltage') }}</strong>
                </div>
                <div class="text-body-2">
                    {{ nutData.data.output.voltage }}V
                </div>
            </v-col>
        </v-row>
    </template>
    <template v-else>
        <v-skeleton-loader type="article" :loading="true" height="160" />
    </template>
</template>

<script setup>
    import { computed, toRefs } from 'vue';

    const props = defineProps({
        nut: { type: Object, default: () => ({}) },
    });
    const { nut } = toRefs(props);

    const nutData = computed(() => nut.value);

    function formatRuntime(seconds) {
        if (!seconds || seconds <= 0) return '-';
        const secs = Number(seconds);
        if (!Number.isFinite(secs)) return '-';
        
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    function getStatusColor(status) {
        const statusColors = {
            'OL': 'success',      // Online
            'OB': 'warning',      // On Battery
            'LB': 'error',        // Low Battery
            'HB': 'warning',      // High Battery
            'RB': 'error',        // Replace Battery
            'CHRG': 'info',       // Charging
            'DISCHRG': 'warning', // Discharging
            'BYPASS': 'warning',  // Bypass
            'CAL': 'warning',     // Calibration
            'OFF': 'default',     // Off
            'OVER': 'error',      // Overload
        };
        return statusColors[status] || 'default';
    }
</script>