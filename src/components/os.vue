<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t( 'mos') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p v-if="info && info.os"><b>{{ $t('platform') }}:</b> {{ info.os.platform }}</p>
        <p v-if="info && info.os"><b>{{ $t('distribution') }}:</b> {{ info.os.distro }}</p>
        <p v-if="info && info.os"><b>{{ $t('release') }}:</b> {{ info.os.release }}</p>
        <p v-if="info && info.os"><b>{{ $t('kernel') }}:</b> {{ info.os.kernel }}</p>
        <p><b>{{ $t('hostname') }}:</b> <span v-if="detailed && detailed.os">{{ detailed.os.hostname }}</span></p>
        <p v-if="releaseInfo && releaseInfo.mos"><b>{{ $t('mos version') }}:</b> {{ releaseInfo.mos.version }}</p>
        <p v-if="releaseInfo && releaseInfo.mos"><b>{{ $t('mos channel') }}:</b> {{ releaseInfo.mos.channel }}</p>
        <p v-if="releaseInfo && releaseInfo.mos"><b>{{ $t('mos build') }}:</b> {{ releaseInfo.mos.build }}</p>
        <p v-if="releaseInfo && releaseInfo.mos"><b>{{ $t('mos kernel') }}:</b> {{ releaseInfo.mos.recommended_kernel }}</p>

      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const info = ref({});
const detailed = ref({});
const releaseInfo = ref({});

const getInfo = async () => {
  try {
    const res = await fetch('/api/v1/system/info', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    info.value = await res.json();
  } catch (e) {
    console.error('Failed to fetch system info:', e.message);
  }
}

const getDetailed = async () => {
  try {
    const res = await fetch('/api/v1/system/detailed', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    detailed.value = await res.json();

  } catch (e) {
    console.error('Failed to fetch detailed system info:', e.message);
  }
}

const getReleaseInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/releaseinfo', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) throw new Error('API-Error');
    releaseInfo.value = await res.json();

  } catch (e) {

  }
}

onMounted(() => {
  getInfo();
  getDetailed();
  getReleaseInfo();
});

</script>
