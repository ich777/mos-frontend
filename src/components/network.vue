<template>
  <v-card variant="tonal">
    <v-card-title>{{ $t('network') }}</v-card-title>
    <v-card-text>
      <template v-if="nic">
        <p><b>{{ $t('interface') }}:</b> {{ nic.interface }}</p>
        <p><b>{{ $t('rx') }}:</b> {{ nic.statistics.rx.speed_human }}</p>
        <p><b>{{ $t('tx') }}:</b> {{ nic.statistics.tx.speed_human }}</p>
        <p><b>{{ $t('total') }}:</b> {{ nic.statistics.total.speed_human }}</p>
        <p><b>{{ $t('type') }}:</b> {{ nic.type }}</p>
        <p><b>{{ $t('state') }}:</b> {{ nic.state }}</p>
        <p><b>{{ $t('ip4') }}:</b> {{ nic.ip4 }}</p>
        <p><b>{{ $t('ip6') }}:</b> {{ nic.ip6 }}</p>
        <p><b>{{ $t('mac') }}:</b> {{ nic.mac }}</p>
      </template>
      <template v-else>
        <p>{{ $t('no network interface found') }}</p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs, computed } from 'vue'

const props = defineProps({
  network: { type: Object, default: () => ({ interfaces: [] }) }
})
const { network } = toRefs(props)
const nic = computed(() => network.value?.interfaces?.[0] ?? null)
</script>
