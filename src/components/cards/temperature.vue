<template>

</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  sensors: { type: Object, default: () => ({}) },
});
const { sensors } = toRefs(props);
</script>