<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <h2>{{ $t('docker service') }}</h2>
            </v-container>
            <v-container fluid class="pa-0">
                <v-card variant="tonal">
                    <v-card-text>
                        <v-form>
                            <v-switch :label="$t('docker service enabled')" color="primary" inset density="compact"
                                v-model="settingsDocker.enabled"></v-switch>
                            <v-text-field v-model="settingsDocker.directory" :label="$t('directory')"
                                required></v-text-field>
                            <v-text-field v-model="settingsDocker.appdata" :label="$t('appdata')"
                                required></v-text-field>
                            <v-text-field v-model="settingsDocker.filesystem" :label="$t('filesystem')"
                                required></v-text-field>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-container>
            <v-col class="d-flex justify-end">
                <v-btn color="primary" @click="setDockerService()" class="ml-2">
                    <v-icon left>mdi-content-save</v-icon>
                    {{ $t('save') }}
                </v-btn>
            </v-col>
        </v-container>
    </v-container>

    <v-overlay :model-value="overlay" class="align-center justify-center">
        <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const settingsDocker = ref({
    enabled: false,
    directory: '',
    appdata: '',
    filesystem: ''
});
const overlay = ref(false);
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer']);

onMounted(() => {
    getDockerService();
});

const getDockerService = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/docker', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('docker service could not be loaded'));
        settingsDocker.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

const setDockerService = async () => {
    try {
        overlay.value = true;
        const res = await fetch('/api/v1/mos/settings/docker', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsDocker.value)
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('docker service could not be changed'));
        showSnackbarSuccess(t('docker service changed successfully'));
        emit('refresh-drawer');

    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

</script>