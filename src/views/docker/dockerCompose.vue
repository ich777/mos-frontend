<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2 class="mb-0">{{ $t('docker compose') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="px-0" style="margin-bottom: 80px">
          <v-card-text>
            <v-text-field v-model="composeStack.name" :label="$t('stack name')" required></v-text-field>
            <v-textarea v-model="composeStack.yaml" :label="$t('compose yaml')" rows="10" required></v-textarea>
            <v-textarea v-model="composeStack.env" :label="$t('environment variables')" rows="5"></v-textarea>
            <v-text-field v-model="composeStack.icon" :label="$t('icon url')"></v-text-field>
            <v-text-field v-model="composeStack.webui" :label="$t('web ui url')"></v-text-field>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- WebSocket Operation Dialog -->
  <v-dialog v-model="wsOperationDialog.value" max-width="800" persistent>
    <v-card>
      <v-card-text class="pa-1">
        <div
          ref="wsScrollContainer"
          :style="{
            flexGrow: 1,
            height: 'calc(100vh - 340px)',
            overflow: 'auto',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            border: '1px solid ' + ($vuetify.theme && $vuetify.theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'),
            borderRadius: '4px',
            backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#121212' : '#fafafa',
            color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
          }"
        >
          <div
            v-for="(line, index) in wsOperationDialog.data"
            :key="index"
            :style="{
              paddingLeft: '4px',
              paddingRight: '4px',
              whiteSpace: 'pre-wrap',
              backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? 'transparent' : '#fafafa',
              color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
            }"
          >
            <small>{{ line.output }}</small>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="onPrimary"
          text
          @click="
            closeWsDialog();
            goBackSafely();
          "
        >
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab color="primary" @click="createComposeStack()" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon color="onPrimary">mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const overlay = ref(false);
const props = defineProps({
  template: String,
  yaml: String,
  env: String,
});
const composeStack = reactive({
  name: '',
  yaml: '',
  env: '',
  icon: '',
  webui: '',
});

onMounted(() => {
  if (props.template || props.yaml || props.env) {
    const template = props.template ? decodeURIComponent(props.template) : props.template;
    const yaml = props.yaml ? decodeURIComponent(props.yaml) : props.yaml;
    const env = props.env ? decodeURIComponent(props.env) : props.env;
    getComposeHubTemplate(template, yaml, env);
  }
});

const { wsIsConnected, wsError, wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {},
});

const createComposeStack = async () => {
  sendDockerWSCommand('compose-create', composeStack);
};

const getComposeHubTemplate = async (template, yaml, env) => {
  const newFilesBody = { template: template, yaml: yaml, env: env };
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/hub/compose/template', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFilesBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('compose template could not be fetched')}|$| ${error.error || t('unknown error')}`);
    }

    const jsonData = await res.json();
    composeStack.name = jsonData.name || '';
    composeStack.yaml = jsonData.yaml || '';
    composeStack.env = jsonData.env || '';
    composeStack.icon = jsonData.icon || '';
    composeStack.webui = jsonData.webui || '';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const goBackSafely = () => {
  const canGoBack = window.history.length > 1 && document.referrer && new URL(document.referrer).origin === window.location.origin;

  if (canGoBack) {
    router.back();
  } else {
    router.push('/docker');
  }
};
</script>
