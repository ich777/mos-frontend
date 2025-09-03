<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('vm') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item v-for="vm in vms">
                    <v-list-item-title>{{ vm.name }}</v-list-item-title>
                    <v-list-item-subtitle :style="{ color: vm.state === 'started' ? 'green' : 'red' }">
                      {{ vm.state }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer']);
const vms = ref([]);

onMounted(() => {
  fetchVMs();
});

const fetchVMs = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error('API-Error');
    vms.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

</script>
