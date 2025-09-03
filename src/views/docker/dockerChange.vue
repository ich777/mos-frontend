<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <v-row align="center">
                    <v-col cols="auto" class="d-flex align-center">
                        <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
                    </v-col>
                    <v-col>
                        <h2 class="mb-0">{{ $t('change docker containers') }}</h2>
                    </v-col>
                </v-row>
            </v-container>
            <v-container fluid class="pa-0">
                <v-card variant="tonal" fluid>
                    <v-card-text>
                        <v-text-field :label="$t('name')" v-model="form.name" readonly></v-text-field>
                        <v-text-field :label="$t('repository')" v-model="form.repo" required></v-text-field>
                        <v-text-field :label="$t('network')" v-model="form.network"></v-text-field>
                        <v-text-field :label="$t('custom ip')" v-model="form.custom_ip"></v-text-field>
                        <v-text-field :label="$t('default shell')" v-model="form.default_shell"></v-text-field>
                        <v-switch :label="$t('privileged')" v-model="form.privileged" inset color="primary"
                            density="compact"></v-switch>
                        <v-text-field :label="$t('extra parameters')" v-model="form.extra_parameters"></v-text-field>
                        <v-text-field :label="$t('web ui url')" v-model="form.web_ui_url"></v-text-field>
                        <v-text-field :label="$t('icon')" v-model="form.icon"></v-text-field>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-8">{{ $t('paths') }}</v-card-subtitle>
                        <v-row v-for="(path, i) in form.paths" :key="i">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('name')" v-model="path.name" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('mode')" v-model="path.mode" class="mr-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('host')" v-model="path.host" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('container')" v-model="path.container" class="mr-3"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn class="mb-2" @click="form.paths.push({ host: '', container: '' })">{{ $t('add path')
                        }}</v-btn>
                        <v-btn class="mb-2 ml-2" @click="form.paths.pop()">{{ $t('remove path')
                        }}</v-btn>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-8">{{ $t('ports') }}</v-card-subtitle>
                        <v-row v-for="(port, i) in form.ports" :key="i">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('name')" v-model="port.name" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('protocol')" v-model="port.protocol" class="mr-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('host')" v-model="port.host" type="number" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('container')" v-model="port.container"
                                    type="number" class="mr-3"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn class="mb-2" @click="form.ports.push({ host: '', container: '' })">{{ $t('add port')
                        }}</v-btn>
                        <v-btn class="mb-2 ml-2" @click="form.ports.pop()">{{ $t('remove port')
                        }}</v-btn>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-8">{{ $t('devices') }}</v-card-subtitle>
                        <v-row v-for="(device, i) in form.devices" :key="i">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('name')" v-model="device.name" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('host')" v-model="device.host" class="mr-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('container')" v-model="device.container" class="mr-3"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn class="mb-2" @click="form.devices.push({ name: '', host: '', container: '' })">{{ $t('add device') }}</v-btn>
                        <v-btn class="mb-2 ml-2" @click="form.devices.pop()">{{ $t('remove device') }}</v-btn>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-8">{{ $t('variables') }}</v-card-subtitle>
                        <v-row v-for="(variable, i) in form.variables" :key="i">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('name')" v-model="variable.name" class="mr-3 ml-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('key')" v-model="variable.key" class="mr-3"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="ma-0 pa-0">
                                <v-text-field :label="$t('value')" v-model="variable.value" class="mr-3"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn class="mb-2" @click="form.variables.push({ name: '', key: '', value: '' })">{{ $t('add variable') }}</v-btn>
                        <v-btn class="mb-2 ml-2" @click="form.variables.pop()">{{ $t('remove variable') }}</v-btn>
                    </v-card-text>
                </v-card>
                <v-row class="mt-4">
                    <v-col class="d-flex justify-end">
                        <v-btn color="primary" @click="updateDocker()" class="ml-2">
                            <v-icon left>mdi-content-save</v-icon>
                            {{ $t('edit') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-container>
    </v-container>

    <v-overlay :model-value="overlay" class="align-center justify-center">
        <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['refresh-drawer']);
const { t } = useI18n();
const overlay = ref(false);
const getDocker = ref({});
const form = reactive({
    name: '',
    repo: '',
    network: '',
    custom_ip: '',
    default_shell: '',
    privileged: false,
    extra_parameters: '',
    web_ui_url: '',
    icon: '',
    ports: [],
    paths: [],
    devices: [],
    variables: []
})
const props = defineProps({
    docker: String
});

onMounted(() => {
    getDockerTemplate();
});

const getDockerTemplate = async () => {
    try {
        overlay.value = true;

        const res = await fetch(`/api/v1/docker/mos/templates/${props.docker}?edit=true`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        overlay.value = false;

        if (!res.ok) throw new Error(t('docker container could not be loaded'));

        getDocker.value = await res.json();

        form.name = getDocker.value.name;
        form.repo = getDocker.value.repo;
        form.network = getDocker.value.network;
        form.custom_ip = getDocker.value.custom_ip;
        form.default_shell = getDocker.value.default_shell;
        form.privileged = getDocker.value.privileged;
        form.extra_parameters = getDocker.value.extra_parameters;
        form.web_ui_url = getDocker.value.web_ui_url;
        form.icon = getDocker.value.icon;
        form.paths = Array.isArray(getDocker.value.paths)
            ? getDocker.value.paths.map(path => ({
                name: path.name,
                mode: path.mode,
                host: path.host,
                container: path.container
            }))
            : [];
        form.ports = Array.isArray(getDocker.value.ports)
            ? getDocker.value.ports.map(port => ({
                name: port.name,
                protocol: port.protocol,
                host: port.host,
                container: port.container
            }))
            : [];
        form.variables = Array.isArray(getDocker.value.variables)
            ? getDocker.value.variables.map(variable => ({
            name: variable.name,
            key: variable.key,
            value: variable.value
            }))
            : [];
        form.devices = Array.isArray(getDocker.value.devices)
            ? getDocker.value.devices.map(device => ({
            name: device.name,
            host: device.host,
            container: device.container
            }))
            : [];
    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

const updateDocker = async () => {

    const changeDocker = getDocker.value;
    changeDocker.name = form.name;
    changeDocker.repo = form.repo;
    changeDocker.network = form.network;
    changeDocker.custom_ip = form.custom_ip;
    changeDocker.default_shell = form.default_shell;
    changeDocker.privileged = form.privileged;
    changeDocker.extra_parameters = form.extra_parameters;
    changeDocker.web_ui_url = form.web_ui_url;
    changeDocker.icon = form.icon;
    changeDocker.paths = form.paths.map(path => ({
        name: path.name,
        mode: path.mode,
        host: path.host,
        container: path.container
    }));
    changeDocker.ports = form.ports.map(port => ({
        name: port.name,
        protocol: port.protocol,
        host: port.host,
        container: port.container
    }));
    changeDocker.devices = form.devices.map(device => ({
        name: device.name,
        host: device.host,
        container: device.container
    }));
    changeDocker.variables = form.variables.map(variable => ({
        name: variable.name,
        key: variable.key,
        value: variable.value
    }));

    try {
        overlay.value = true;
        const res = await fetch(`/api/v1/docker/mos/create`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changeDocker)
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('docker container could not be changed'));
        router.back();
        showSnackbarSuccess(t('docker container changed successfully'));
        
    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

</script>
