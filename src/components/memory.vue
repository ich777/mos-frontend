<template>
  <v-card variant="tonal">
    <v-card-title>
      {{ $t('memory') }}
    </v-card-title>
    <v-card-text>
        <p v-if="mem.total_human">
          <b>{{ $t('total') }}:</b> {{ mem.total_human }}
        </p>
        <p v-if="mem.used_human">
          <b>{{ $t('used') }}:</b> {{ mem.used_human }}
        </p>
        <p v-if="mem.free_human">
          <b>{{ $t('free') }}:</b> {{ mem.free_human }}
        </p>
        <v-divider class="my-2"></v-divider>
          <div class="memory-bar-container">
            <div class="memory-segment actual-used" :style="{ width: (mem.percentage?.actuallyUsed || 0) + '%' }"
              :title="`Actually Used: ${mem.percentage?.actuallyUsed || 0}%`">
            </div>
            <div class="memory-segment free" :style="{ width: getRealFreePercentage() + '%' }"
              :title="`Free: ${getRealFreePercentage()}%`">
            </div>
            <div class="memory-segment caches" :style="{ width: (mem.percentage?.dirtyCaches || 0) + '%' }"
              :title="`Dirty Caches: ${mem.percentage?.dirtyCaches || 0}%`">
            </div>
          </div>

          <!-- Legend -->
          <div class="memory-legend mt-2">
            <div class="legend-item">
              <div class="legend-color actual-used"></div>
              <span class="text-caption">{{ $t('actual_usage') }} ({{ mem.percentage?.actuallyUsed || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color free"></div>
              <span class="text-caption">{{ $t('free') }} ({{ getRealFreePercentage() }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color caches"></div>
              <span class="text-caption">{{ $t('dirty_caches') }} ({{ mem.percentage?.dirtyCaches || 0 }}%)</span>
            </div>
          </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs, computed } from 'vue'

const props = defineProps({
  memory: { type: Object, default: () => ({}) }
})
const { memory } = toRefs(props);
const mem = computed(() => memory.value ?? {});

// Calculate real free percentage for breakdown (100 - actuallyUsed - dirtyCaches)
const getRealFreePercentage = () => {
  const actuallyUsed = mem.value.percentage?.actuallyUsed || 0
  const dirtyCaches = mem.value.percentage?.dirtyCaches || 0
  return Math.max(0, 100 - actuallyUsed - dirtyCaches)
}
</script>

<style scoped>
.memory-overview {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 12px;
}

.memory-stack {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 12px;
}

.memory-bar-container {
  display: flex;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.memory-segment {
  height: 100%;
  transition: all 0.3s ease;
}

.memory-segment.actual-used {
  background: rgb(var(--v-theme-error));
}

.memory-segment.caches {
  background: rgb(var(--v-theme-info));
}

.memory-segment.free {
  background: rgb(var(--v-theme-success));
}

.memory-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.actual-used {
  background: rgb(var(--v-theme-error));
}

.legend-color.caches {
  background: rgb(var(--v-theme-info));
}

.legend-color.free {
  background: rgb(var(--v-theme-success));
}
</style>