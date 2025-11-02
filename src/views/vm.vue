<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('vm') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid>
          <v-card-title>{{ $t('overview') }}</v-card-title>
          <v-card-text class="pa-0">
            <draggable v-model="vms" item-key="Id">
              <template #item="{ element: vm, index }">
                <div>
                  <v-list-item :id="vm.Id">
                    <template v-slot:prepend>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-icon v-bind="props">mdi-server-outline</v-icon>
                        </template>
                        <v-list>
                          <v-list-item v-if="vm.state !== 'running'" @click="startVM(vm.name)">
                            <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="vm.state === 'running'" @click="stopVM(vm.name)">
                            <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                    <v-list-item-title>{{ vm.name }}</v-list-item-title>
                    <v-list-item-subtitle :style="{ color: vm.state === 'running' ? 'green' : 'red' }">
                      {{ vm.state }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-switch v-model="vm.autostart" color="onPrimary" hide-details inset density="compact" />
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < vms.length - 1" />
                </div>
              </template>
            </draggable>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer']);
const vms = ref([]);
const overlay = ref(false);
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import draggable from 'vuedraggable';

onMounted(() => {
  fetchVMs();
});

const fetchVMs = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    vms.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const stopVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/stop`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('VM could not be stopped'));
    showSnackbarSuccess(t('VM shutdown initiated'));
    fetchVMs();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const startVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/start`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('VM could not be started'));
    showSnackbarSuccess(t('VM started successfully'));
    fetchVMs();
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};
</script>
