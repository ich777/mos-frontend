<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <h2>{{ $t('system') }}</h2>
            </v-container>
            <v-container fluid class="pa-0">
                <v-card variant="tonal">
                    <v-card-text>
                        <v-form>
                            <v-text-field :label="$t('hostname')" v-model="settingsSystem.hostname"></v-text-field>
                            <v-select :items="keymaps" :label="$t('keymap')" v-model="settingsSystem.keymap"
                                item-title="keymap" item-value="keymap"></v-select>
                            <v-text-field :label="$t('timezone')" v-model="settingsSystem.timezone"></v-text-field>
                            <v-text-field :label="$t('global spindown (min)')" type="number"
                                v-model="settingsSystem.global_spindown"></v-text-field>
                            <v-divider class="my-2"></v-divider>
                            <v-switch :label="$t('ntp enabled')" color="primary" inset density="compact"
                                v-model="settingsSystem.ntp.enabled"></v-switch>
                            <v-text-field :label="$t('ntp mode')" v-model="settingsSystem.ntp.mode"></v-text-field>
                            <v-text-field :label="$t('ntp servers')" v-model="settingsSystem.ntp.servers[0]"
                                hint="First NTP server"></v-text-field>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-container>
            <v-col class="d-flex justify-end">
                <v-btn color="primary" @click="setSystemSettings()" class="ml-2">
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

const emit = defineEmits(['refresh-drawer']);
const settingsSystem = ref(
    {
        hostname: "",
        keymap: "",
        timezone: "",
        ntp: {
            enabled: false,
            mode: "",
            servers: []
        },
        global_spindown: 0
    });
const keymaps = ref([]);
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
    getSystemSettings();
    getKeymaps();
});

const getSystemSettings = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/system', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('system settings could not be loaded'));
        settingsSystem.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

const setSystemSettings = async () => {
    try {
        overlay.value = true;
        const res = await fetch('/api/v1/mos/settings/system', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsSystem.value)
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('system settings could not be changed'));
        showSnackbarSuccess(t('system settings changed successfully'));
    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

const getKeymaps = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/system/keymap', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('keymaps could not be loaded'));
        keymaps.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

</script>