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
      </v-card-text>
    </v-card>
        </v-container>
      </v-container>
    </v-container>

  <!-- Floating Action Button -->
  <v-fab color="primary" @click="createComposeStack()" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon color="onPrimary">mdi-content-save</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const composeStack = reactive({
  name: '',
  yaml: '',
  env: '',
  icon: '',
});

const { wsIsConnected, wsError, wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {},
});

const createComposeStack = async () => {
  sendDockerWSCommand('compose-create', composeStack);
};

</script>