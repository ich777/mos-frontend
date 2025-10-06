<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <h2>{{ $t('system') }}</h2>
            </v-container>
            <v-container fluid class="pa-0">
                <v-card variant="tonal">
                    <v-card-text>
                        <v-text-field :label="$t('hostname')" v-model="settingsSystem.hostname"></v-text-field>
                        <v-select :items="keymaps" :label="$t('keymap')" v-model="settingsSystem.keymap"
                            item-title="keymap" item-value="keymap"></v-select>
                        <v-select :items="timezones" :label="$t('timezone')" v-model="settingsSystem.timezone"
                            item-title="timezone" item-value="timezone"></v-select>
                        <v-select :items="governors" :label="$t('cpu governor')" v-model="settingsSystem.cpufreq.governor"
                            item-title="governor" item-value="governor"></v-select>
                        <v-text-field :label="$t('global spindown (min)')" type="number"
                            v-model="settingsSystem.global_spindown"></v-text-field>
                        <v-divider class="my-2"></v-divider>
                        <h3 class="mb-2">{{ $t('ntp') }}</h3>
                        <v-switch :label="$t('ntp enabled')" color="primary" inset density="compact"
                            v-model="settingsSystem.ntp.enabled"></v-switch>
                        <v-text-field :label="$t('ntp mode')" v-model="settingsSystem.ntp.mode"></v-text-field>
                        <v-text-field :label="$t('ntp servers')" v-model="settingsSystem.ntp.servers[0]"
                            hint="First NTP server"></v-text-field>
                        <h3 class="mb-2">{{ $t('proxy') }}</h3>
                        <v-text-field :label="$t('http proxy')" v-model="proxies.http_proxy"
                            :placeholder="proxies.http_proxy"></v-text-field>
                        <v-text-field :label="$t('https proxy')" v-model="proxies.https_proxy"
                            :placeholder="proxies.https_proxy"></v-text-field>
                        <v-text-field :label="$t('ftp proxy')" v-model="proxies.ftp_proxy"
                            :placeholder="proxies.ftp_proxy"></v-text-field>
                        <v-text-field :label="$t('no proxy')" v-model="proxies.no_proxy"
                            :placeholder="proxies.no_proxy"></v-text-field>
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
const settingsSystem = ref({
    hostname: "",
    keymap: "",
    timezone: "",
    ntp: {
        enabled: false,
        mode: "",
        servers: []
    },
    global_spindown: 0,
    cpufreq: {
        governor: ""
    }
});
const keymaps = ref([]);
const timezones = ref([]);
const proxies = ref({
    http_proxy: "",
    https_proxy: "",
    ftp_proxy: "",
    no_proxy: ""
});
const governors = ref([]);
const overlay = ref(false);
const { t } = useI18n();

onMounted(() => {
    getSystemSettings();
    getKeymaps();
    getTimezones();
    getProxies();
    getGovernors();
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
        const resProxy = await fetch('/api/v1/system/proxy', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proxies.value)
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('system settings could not be changed'));
        if (!resProxy.ok) throw new Error(t('proxies could not be changed'));
        showSnackbarSuccess(t('system settings changed successfully'));
    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

const getKeymaps = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/keymap', {
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

const getTimezones = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/timezones', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('timezones could not be loaded'));
        timezones.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

const getProxies = async () => {
    try {
        const res = await fetch('/api/v1/system/proxy', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('proxies could not be loaded'));
        proxies.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

const getGovernors = async () => {
    try {
        const res = await fetch('/api/v1/mos/settings/governors', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            }
        });

        if (!res.ok) throw new Error(t('governors could not be loaded'));
        governors.value = await res.json();

    } catch (e) {
        showSnackbarError(e.message);
    }
};

</script>