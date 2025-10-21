<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t( 'mos') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p v-if="osInfo && osInfo.base && osInfo.base.length > 0"><b>{{ $t('platform') }}:</b> {{ osInfo.base[0].os_id }}</p>
        <p v-if="osInfo && osInfo.base && osInfo.base.length > 0"><b>{{ $t('name') }}:</b> {{ osInfo.base[0].os_name }}</p>
        <p v-if="osInfo && osInfo.base && osInfo.base.length > 0"><b>{{ $t('version') }}:</b> {{ osInfo.base[0].os_version }}</p>
        <p v-if="osInfo && osInfo.hostname"><b>{{ $t('hostname') }}:</b> {{ osInfo.hostname }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos version') }}:</b> {{ osInfo.mos.version }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos channel') }}:</b> {{ osInfo.mos.channel }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos build') }}:</b> {{ osInfo.mos.build }}</p>
        <p v-if="osInfo && osInfo.mos"><b>{{ $t('mos kernel') }}:</b> {{ osInfo.mos.running_kernel }}</p>
      </div>
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
