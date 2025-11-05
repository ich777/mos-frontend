<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('logs') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card  >
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="selectedLog" :items="logs" :label="$t('select log file')" outlined dense
                hide-details @update:modelValue="getLogFileContent(selectedLog, lines)" />
              </v-col>
              <v-col cols="12" md="6">
              <v-text-field v-model="lines" :label="$t('lines')" type="number" outlined dense
                @keyup.enter="getLogFileContent(selectedLog)" />
              </v-col>
            </v-row>
            <div
              style="flex-grow: 1; height: calc(100vh - 340px); overflow: auto; white-space: pre; font-family: monospace; border: 1px solid rgba(0,0,0,0.12); border-radius: 4px;"
            >
              <div
              v-for="(line, idx) in logFileContent.split('\n')"
              :key="idx"
              :style=" /error/i.test(line)
                ? { background: '#ffebee', color: '#b71c1c', padding: '2px 6px', display: 'block' }
                : /warn(?:ing)?/i.test(line)
                ? { background: '#fff8e1', color: '#ff6f00', padding: '2px 6px', display: 'block' }
                : { padding: '2px 6px', display: 'block' } "
              >
              {{ line }}
              </div>
            </div>
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
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const logs = ref([]);
const selectedLog = ref('');
const logFileContent = ref('');
const lines = ref(10000);
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
  getLogFiles();
});

const getLogFiles = async () => {
  try {
    const res = await fetch('/api/v1/system/logs', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('log files could not be loaded'));
    logs.value = await res.json();

  } catch (error) {
    showSnackbarError(error.message);
  }
};

const getLogFileContent = async (logFile) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/system/logs/content?path=${logFile}&tail=true&lines=${lines.value}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error(t('log files could not be loaded'));
    const result = await res.json();
    logFileContent.value = result.content.join('\n');
    logFileContent.value = logFileContent.value.split('\n').reverse().join('\n');

    overlay.value = false;

  } catch (error) {
    overlay.value = false;
    showSnackbarError(error.message);
  }
};

</script>