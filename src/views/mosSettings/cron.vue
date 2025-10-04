<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('cron jobs') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card variant="tonal">
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item v-for="(cronJob, index) in cronJobs" :key="index">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer" :color="cronJob.enabled ? 'green' : 'blue'">
                    mdi-calendar-clock
                  </v-icon>
                </template>
                <v-list-item-title>{{ cronJob.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ cronJob.schedule }} - {{ cronJob.command }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn icon @click="openChangeCronJobDialog(cronJob)">
                    <v-icon>mdi-content-save</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create Cron Job Dialog -->
  <v-dialog v-model="createCronJobDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ $t('create cron job') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="createCronJobDialog.schedule" :label="$t('schedule')" required></v-text-field>
          <v-text-field v-model="createCronJobDialog.command" :label="$t('command')" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="createCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn text @click="createCronJob()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Cron Job Dialog -->
  <v-dialog v-model="changeCronJobDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ $t('change cron job') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="changeCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="changeCronJobDialog.schedule" :label="$t('schedule')" required></v-text-field>
          <v-text-field v-model="changeCronJobDialog.command" :label="$t('command')" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="changeCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn text @click="changeCronJob()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="openCreateCronJobDialog()" color="primary"
    style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const cronJobs = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const createCronJobDialog = ref({
  value: false,
  name: '',
  schedule: '',
  command: ''
});
const changeCronJobDialog = ref({
  value: false,
  id: '',
  name: '',
  schedule: '',
  command: ''
});

onMounted(() => {
  getCron();
});

const getCron = async () => {
  try {
    const res = await fetch('/api/v1/cron', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('cron jobs could not be loaded'));
    }
    cronJobs.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const createCronJob = async (cronJob) => {
  try {
    const res = await fetch('/api/v1/cron', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cronJob)
    });

    if (!res.ok) throw new Error(t('cron jobs could not be changed'));
    showSnackbarSuccess(t('cron jobs changed successfully'));

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeCronJob = async (cronJob) => {
  try {
    const res = await fetch('/api/v1/cron/' + cronJob.id, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cronJob)
    });

    if (!res.ok) throw new Error(t('cron jobs could not be changed'));
    showSnackbarSuccess(t('cron jobs changed successfully'));

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const openCreateCronJobDialog = () => {
  createCronJobDialog.value = true;
  createCronJobDialog.name = '';
  createCronJobDialog.schedule = '';
  createCronJobDialog.command = '';
};

const openChangeCronJobDialog = (cronJob) => {
  changeCronJobDialog.value = true;
  changeCronJobDialog.id = cronJob.id;
  changeCronJobDialog.name = cronJob.name;
  changeCronJobDialog.schedule = cronJob.schedule;
  changeCronJobDialog.command = cronJob.command;
};

</script>