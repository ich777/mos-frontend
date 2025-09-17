<template>
  <v-card variant="tonal">
    <v-card-title>{{ $t('network') }}</v-card-title>
    <v-card-text>
      <template v-if="nic">
        <p v-if="nic.interface"><b>{{ $t('interface') }}:</b> {{ nic.interface }}</p>
        <p v-if="nic.statistics?.rx?.speed_human"><b>{{ $t('rx') }}:</b> {{ nic.statistics.rx.speed_human }}</p>
        <p v-if="nic.statistics?.tx?.speed_human"><b>{{ $t('tx') }}:</b> {{ nic.statistics.tx.speed_human }}</p>
        <p v-if="nic.statistics?.total?.speed_human"><b>{{ $t('total') }}:</b> {{ nic.statistics.total.speed_human }}</p>
        <p v-if="nic.type"><b>{{ $t('type') }}:</b> {{ nic.type }}</p>
        <p v-if="nic.state"><b>{{ $t('state') }}:</b> {{ nic.state }}</p>
        <p v-if="nic.ip4"><b>{{ $t('ip4') }}:</b> {{ nic.ip4 }}</p>
        <p v-if="nic.ip6"><b>{{ $t('ip6') }}:</b> {{ nic.ip6 }}</p>
        <p v-if="nic.mac"><b>{{ $t('mac') }}:</b> {{ nic.mac }}</p>
      </template>
      <template v-else>
        <p>{{ $t('no network interface found') }}</p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs, ref, watch } from 'vue'

const props = defineProps({
  network: { type: Object, default: () => ({ interfaces: [] }) }
})
const { network } = toRefs(props)
const nic = ref(null)

watch(
  () => network.value?.interfaces?.[0],
  (newVal) => {
    if (!newVal) {
      nic.value = null
      return
    }
    if (!nic.value) {
      nic.value = { ...newVal }
      return
    }
    Object.keys(newVal).forEach(key => {
      nic.value[key] = newVal[key]
    })
  },
  { immediate: true, deep: true }
)

</script>
