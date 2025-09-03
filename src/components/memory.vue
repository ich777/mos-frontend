<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('memory') }}
    </v-card-title>
    <v-card-text>
      <div>
        <p><b>{{ $t('total') }}:</b> {{ mem.total_human }}</p>
        <p><b>{{ $t('used') }}:</b> {{ mem.used_human }}</p>
        <p><b>{{ $t('free') }}:</b> {{ mem.free_human }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs, computed } from 'vue'

const props = defineProps({
  memory: { type: Object, default: () => ({ total_human: '', used_human: '', free_human: '' }) }
})
const { memory } = toRefs(props)
const mem = computed(() => memory.value ? memory.value : { total_human: '', used_human: '', free_human: '' })
</script>
