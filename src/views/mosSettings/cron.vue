<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('cron jobs') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card variant="tonal">
          <v-card-text>
            <div v-for="(cronJob, index) in cronJobs" :key="index" class="mb-4">
              <v-row>
                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                  <v-btn icon size="x-small" color="primary" class="pa-0"
                    style="width:24px; height:24px; min-width:24px; margin-bottom:6px;"
                    @click="cronJobs.splice(index + 1, 0, { name: '', schedule: '', command: '', enabled: false })"
                    title="Add cron job" aria-label="add cron job">
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" color="error" class="pa-0" style="width:24px; height:24px; min-width:24px;"
                    @click="cronJobs.splice(index, 1)" title="Remove cron job" aria-label="remove cron job">
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="11">
                  <v-checkbox :label="$t('enabled')" v-model="cronJob.enabled" density="compact"></v-checkbox>
                  <v-text-field :label="$t('name')" v-model="cronJob.name" density="compact"></v-text-field>
                  <v-text-field :label="$t('schedule')" v-model="cronJob.schedule" density="compact"></v-text-field>
                  <v-text-field :label="$t('command')" v-model="cronJob.command" density="compact"></v-text-field>
                  <v-divider></v-divider>
                </v-col>
              </v-row>
            </div>
            <div v-if="!cronJobs || cronJobs.length === 0" class="text-center">
              {{ $t('no cron jobs available yet') }}
            </div>
            <div class="text-center">
              <v-btn icon size="x-small" color="primary" class="ma-1 pa-0"
                style="width:24px; height:24px; min-width:24px;"
                @click="cronJobs.push({ id: '', name: '', schedule: '', command: '', enabled: false })"
                title="Add cron job" aria-label="add cron job">
                <v-icon size="18">mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab color="primary" @click="setAllCrons()" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;"
    size="large" icon>
    <v-icon>mdi-content-save</v-icon>
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

const createCron = async (cronJob) => {
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

const changeCron = async (cronJob) => {
  try {
    const res = await fetch('/api/v1/cron/' + cronJob.id , {
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

const setAllCrons = async() => {
  let error = false;
  overlay.value = true;
  cronJobs.value = cronJobs.value.filter(job => job.name.trim() !== '' || job.schedule.trim() !== '' || job.command.trim() !== '');
  for (const job of cronJobs.value) {
    try {
      if (job.id && job.id !== '') {
        await changeCron(job);
      } else {
        await createCron(job);
      }
    } catch (e) {
      error = true;
    }
  }
  overlay.value = false;
  if (!error) {
    showSnackbarSuccess(t('all cron jobs changed successfully'));
    getCron();
  } else {
    showSnackbarError(t('some cron jobs could not be changed'));
  }
};

</script>