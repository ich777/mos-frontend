<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t( 'mos') }}
    </v-card-title>
    <v-card-text>
      <v-row dense>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.base?.[0]?.os_id">
        <div class="text-caption text-medium-emphasis">{{ $t('platform') }}</div>
        <div class="text-body-2">{{ osInfo.base[0].os_id }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.base?.[0]?.os_name">
        <div class="text-caption text-medium-emphasis">{{ $t('name') }}</div>
        <div class="text-body-2">{{ osInfo.base[0].os_name }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.base?.[0]?.os_version">
        <div class="text-caption text-medium-emphasis">{{ $t('version') }}</div>
        <div class="text-body-2">{{ osInfo.base[0].os_version }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.hostname">
        <div class="text-caption text-medium-emphasis">{{ $t('hostname') }}</div>
        <div class="text-body-2">{{ osInfo.hostname }}</div>
      </v-col>
      <v-col cols="12" v-if="osInfo?.mos"><v-divider></v-divider></v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.version">
        <div class="text-caption text-medium-emphasis">{{ $t('mos version') }}</div>
        <div class="text-body-2">{{ osInfo.mos.version }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.channel">
        <div class="text-caption text-medium-emphasis">{{ $t('mos channel') }}</div>
        <div class="text-body-2">{{ osInfo.mos.channel }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.build">
        <div class="text-caption text-medium-emphasis">{{ $t('mos build') }}</div>
        <div class="text-body-2">{{ osInfo.mos.build }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.running_kernel">
        <div class="text-caption text-medium-emphasis">{{ $t('mos kernel') }}</div>
        <div class="text-body-2">{{ osInfo.mos.running_kernel }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.frontend">
        <div class="text-caption text-medium-emphasis">{{ $t('mos frontend') }}</div>
        <div class="text-body-2">{{ osInfo.mos.frontend }}</div>
      </v-col>
      <v-col cols="12" sm="6" md="4" v-if="osInfo?.mos?.api">
        <div class="text-caption text-medium-emphasis">{{ $t('mos api') }}</div>
        <div class="text-body-2">{{ osInfo.mos.api }}</div>
      </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const osInfo = ref({});

onMounted(() => {
  getOsInfo();
});

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    osInfo.value = await res.json();

  } catch (e) {

  }
}



</script>
