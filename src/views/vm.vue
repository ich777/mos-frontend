<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('vm') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="vmsloading" type="card" :width="'100%'" :height="'60px'" class="mb-2" />
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list class="bg-transparent">
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
                            <template #prepend>
                              <v-icon>mdi-play-circle</v-icon>
                            </template>
                            <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="vm.state === 'running'" @click="stopVM(vm.name)">
                            <template #prepend>
                              <v-icon>mdi-stop-circle</v-icon>
                            </template>
                            <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="vm.state === 'running'" @click="killVM(vm.name)">
                            <template #prepend>
                              <v-icon>mdi-close-octagon</v-icon>
                            </template>
                            <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="vm.state === 'running'" @click="restartVM(vm.name)">
                            <template #prepend>
                              <v-icon>mdi-restart</v-icon>
                            </template>
                            <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="vm.state === 'running'" @click="resetVM(vm.name)">
                            <template #prepend>
                              <v-icon>mdi-cached</v-icon>
                            </template>
                            <v-list-item-title>{{ $t('reset') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                    <v-list-item-title>{{ vm.name }}</v-list-item-title>
                    <v-list-item-subtitle :style="{ color: vm.state === 'running' ? 'green' : 'red' }">
                      {{ vm.state }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-switch v-model="vm.autostart" color="green" hide-details inset density="compact" @change="switchAutostart(vm)" />
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < vms.length - 1" />
                </div>
              </template>
            </draggable>
            </v-list>
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
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const vms = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const vmsloading = ref(true);

onMounted(() => {
  getVMs();
});

const getVMs = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    vms.value = await res.json();
  } catch (e) {
    showSnackbarError(t('Could not fetch VMs'));
  } finally {
    vmsloading.value = false;
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

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM shutdown initiated'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
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

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be started')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM started successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const killVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/kill`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be killed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM killed successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const resetVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/reset`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be reset')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM reset successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restartVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/restart`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be restarted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM restarted successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchAutostart = async (vm) => {
  const autostartBody = { enabled: vm.autostart };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${vm.name}/autostart`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(autostartBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not switch autostart')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('autostart setting updated'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

</script>
