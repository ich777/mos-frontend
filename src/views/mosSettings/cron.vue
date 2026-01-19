<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('cron jobs') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card v-if="cronJobs.length === 0" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no cron jobs have been created yet') }}
          </v-card-text>
        </v-card>
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item v-for="(cronJob, index) in cronJobs" :key="index">
                <template v-slot:prepend>
                  <v-icon class="cursor-pointer" :color="cronJob.enabled ? 'green' : 'blue'">mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title class="d-flex align-center">
                  {{ cronJob.name }}
                  <v-chip v-if="cronJob.status === 'running'" class="ml-2" small color="green" text-color="white">
                    {{ t('running') }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>{{ cronJob.schedule }} - {{ cronJob.command }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn variant="text" icon v-bind="props" color="onPrimary">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openChangeCronJobDialog(cronJob)">
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteCronJobDialog(cronJob)">
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item @click="openChangeScriptDialog(cronJob)">
                        <v-list-item-title>{{ $t('change script') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="startScript(cronJob.id)">
                        <v-list-item-title>{{ $t('start script') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="stopScript(cronJob.id)">
                        <v-list-item-title>{{ $t('stop script') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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
    <v-card class="pa-0">
      <v-card-title>{{ $t('create cron job') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-switch v-model="createCronJobDialog.enabled" :label="$t('enabled')" inset color="green"></v-switch>
          <v-text-field v-model="createCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="createCronJobDialog.schedule" :label="$t('schedule')" required></v-text-field>
          <v-text-field v-model="createCronJobDialog.command" :label="$t('command')" required></v-text-field>
          <v-textarea v-model="createCronJobDialog.script" :label="$t('script')" rows="5" required></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="createCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createCronJob()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Cron Job Dialog -->
  <v-dialog v-model="changeCronJobDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('change cron job') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-switch v-model="changeCronJobDialog.enabled" :label="$t('enabled')" inset color="green"></v-switch>
          <v-text-field v-model="changeCronJobDialog.name" :label="$t('name')" required></v-text-field>
          <v-text-field v-model="changeCronJobDialog.schedule" :label="$t('schedule')" required></v-text-field>
          <v-text-field v-model="changeCronJobDialog.command" :label="$t('command')" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="changeCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="changeCronJob()">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Cron Job Dialog -->
  <v-dialog v-model="deleteCronJobDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('delete cron job') }} - {{ deleteCronJobDialog.name }}</v-card-title>
      <v-card-text>
        <p>{{ $t('are you sure you want to delete the cron job') }}?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="onPrimary" @click="deleteCronJobDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteCronJob()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Script Dialog -->
  <v-dialog v-model="changeScriptDialog.value" max-width="800px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('change script') }} - {{ changeScriptDialog.name }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="changeScriptDialog.path" :label="$t('path')" readonly></v-text-field>
          <v-text-field v-model="changeScriptDialog.size" :label="$t('size')" readonly></v-text-field>
          <v-textarea v-model="changeScriptDialog.content" :label="$t('script')" rows="10"></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="changeScriptDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="changeScript(changeScriptDialog.id)">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="openCreateCronJobDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const cronJobs = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const createCronJobDialog = reactive({
  value: false,
  enabled: false,
  name: '',
  schedule: '',
  command: '',
  script: '',
});
const changeCronJobDialog = reactive({
  value: false,
  enabled: false,
  id: '',
  name: '',
  schedule: '',
  command: '',
});
const deleteCronJobDialog = reactive({
  value: false,
  id: '',
  name: '',
});
const changeScriptDialog = reactive({
  value: false,
  id: '',
  name: '',
  path: '',
  size: 0,
  created: '',
  modified: '',
  content: '',
});

onMounted(() => {
  getCron();
});

const getCron = async () => {
  try {
    const res = await fetch('/api/v1/cron', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
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

const createCronJob = async () => {
  const newCronJob = {
    name: createCronJobDialog.name,
    schedule: createCronJobDialog.schedule,
    command: createCronJobDialog.command,
    enabled: createCronJobDialog.enabled,
    script: createCronJobDialog.script,
  };
  try {
    const res = await fetch('/api/v1/cron', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCronJob),
    });

    if (!res.ok) throw new Error(t('cron job could not be created'));
    showSnackbarSuccess(t('cron job created successfully'));
    createCronJobDialog.value = false;
    getCron();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeCronJob = async () => {
  const changeCronJob = {
    name: changeCronJobDialog.name,
    schedule: changeCronJobDialog.schedule,
    command: changeCronJobDialog.command,
    enabled: changeCronJobDialog.enabled,
  };
  try {
    const res = await fetch('/api/v1/cron/' + changeCronJobDialog.id, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changeCronJob),
    });

    if (!res.ok) throw new Error(t('cron job could not be changed'));
    showSnackbarSuccess(t('cron job changed successfully'));
    changeCronJobDialog.value = false;
    getCron();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const deleteCronJob = async () => {
  try {
    const res = await fetch('/api/v1/cron/' + deleteCronJobDialog.id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error(t('cron jobs could not be deleted'));
    showSnackbarSuccess(t('cron job deleted successfully'));
    deleteCronJobDialog.value = false;
    getCron();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/scripts/' + encodeURIComponent(cronId), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('script could not be loaded'));
    }
    const data = await res.json();
    return data.script;
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const changeScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/scripts/' + encodeURIComponent(cronId), {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: changeScriptDialog.content }),
    });
    overlay.value = false;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('script could not be changed'));
    }
    showSnackbarSuccess(t('script changed successfully'));
    changeScriptDialog.value = false;
  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const startScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/' + encodeURIComponent(cronId) + '/start', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('script could not be started'));
    }
    showSnackbarSuccess(t('script started successfully'));
    getCron();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const stopScript = async (cronId) => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/cron/' + encodeURIComponent(cronId) + '/stop', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('script could not be stopped'));
    }
    showSnackbarSuccess(t('script stopped successfully'));
    getCron();
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
  }
};

const openCreateCronJobDialog = () => {
  createCronJobDialog.value = true;
  createCronJobDialog.enabled = false;
  createCronJobDialog.name = '';
  createCronJobDialog.schedule = '';
  createCronJobDialog.command = '';
  createCronJobDialog.script = '';
};

const openChangeCronJobDialog = (cronJob) => {
  changeCronJobDialog.value = true;
  changeCronJobDialog.id = cronJob.id;
  changeCronJobDialog.enabled = cronJob.enabled;
  changeCronJobDialog.name = cronJob.name;
  changeCronJobDialog.schedule = cronJob.schedule;
  changeCronJobDialog.command = cronJob.command;
};

const openDeleteCronJobDialog = (cronJob) => {
  deleteCronJobDialog.value = true;
  deleteCronJobDialog.id = cronJob.id;
  deleteCronJobDialog.name = cronJob.name;
};

const openChangeScriptDialog = async (cronJob) => {
  changeScriptDialog.value = true;
  try {
    const script = await getScript(cronJob.id);
    changeScriptDialog.id = cronJob.id;
    changeScriptDialog.name = script.name;
    changeScriptDialog.path = script.path;
    changeScriptDialog.size = script.size;
    changeScriptDialog.created = script.created;
    changeScriptDialog.modified = script.modified;
    changeScriptDialog.content = script.content;
  } catch (e) {
    showSnackbarError(e.message);
  }
};
</script>
