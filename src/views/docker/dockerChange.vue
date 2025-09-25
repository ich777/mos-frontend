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
                        <v-select :label="$t('network')" v-model="networkMode" :items="networkOptions" item-title="name"
                            item-value="name" :loading="loadingNetworks" clearable
                            @update:model-value="onNetworkChange"></v-select>
                        <v-select v-if="networkMode === 'container-network'" :label="$t('container')"
                            v-model="selectedContainer" :items="containerOptions" item-title="name" item-value="name"
                            :loading="loadingContainers" clearable @update:model-value="onContainerChange"></v-select>
                        <v-text-field :label="$t('custom ip')" v-model="form.custom_ip"></v-text-field>
                        <v-text-field :label="$t('default shell')" v-model="form.default_shell"></v-text-field>
                        <v-switch :label="$t('privileged')" v-model="form.privileged" inset color="primary"
                            density="compact"></v-switch>
                        <v-text-field :label="$t('extra parameters')" v-model="form.extra_parameters"></v-text-field>
                        <v-text-field :label="$t('web ui url')" v-model="form.web_ui_url"></v-text-field>
                        <v-text-field :label="$t('icon')" v-model="form.icon"></v-text-field>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-2">
                            <v-btn icon size="x-small" color="primary" class="ma-1 pa-0"
                                style="width:24px; height:24px; min-width:24px;"
                                @click="form.paths.push({ name: '', mode: '', host: '', container: '' })"
                                title="Add path" aria-label="add path">
                                <v-icon size="18">mdi-plus</v-icon>
                            </v-btn>
                            {{ $t('paths') }}
                        </v-card-subtitle>
                        <div v-for="(path, i) in form.paths" :key="i" class="mb-2">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-row>
                                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                                    <div class="d-flex flex-column align-center">
                                        <v-btn icon size="x-small" color="primary" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px; margin-bottom:6px;"
                                            @click="form.paths.splice(i + 1, 0, { name: '', mode: '', host: '', container: '' })"
                                            title="Add path" aria-label="add path">
                                            <v-icon size="18">mdi-plus</v-icon>
                                        </v-btn>
                                        <v-btn icon size="x-small" color="error" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px;" @click="removePath(i)"
                                            title="Remove path" aria-label="remove path">
                                            <v-icon size="18">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="11">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('name')" v-model="path.name" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('mode')" v-model="path.mode" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mt-n8">
                                        <v-col cols="6">
                                            <v-text-field :label="$t('host')" v-model="path.host"
                                                density="compact" hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('container')" v-model="path.container"
                                                density="compact" hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-2">
                            <v-btn icon size="x-small" color="primary" class="ma-1 pa-0"
                                style="width:24px; height:24px; min-width:24px;"
                                @click="form.ports.push({ name: '', protocol: '', host: '', container: '' })"
                                title="Add port" aria-label="add port">
                                <v-icon size="18">mdi-plus</v-icon>
                            </v-btn>
                            {{ $t('ports') }}
                        </v-card-subtitle>
                        <div v-for="(port, i) in form.ports" :key="i" class="mb-2">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-row>
                                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                                    <div class="d-flex flex-column align-center">
                                        <v-btn icon size="x-small" color="primary" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px; margin-bottom:6px;"
                                            @click="form.ports.splice(i + 1, 0, { name: '', protocol: '', host: '', container: '' })"
                                            title="Add port" aria-label="add port">
                                            <v-icon size="18">mdi-plus</v-icon>
                                        </v-btn>
                                        <v-btn icon size="x-small" color="error" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px;" @click="removePort(i)"
                                            title="Remove port" aria-label="remove port">
                                            <v-icon size="18">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="11">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('name')" v-model="port.name" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('protocol')" v-model="port.protocol"
                                                density="compact" hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mt-n8">
                                        <v-col cols="6">
                                            <v-text-field :label="$t('host')" v-model="port.host" type="number"
                                                density="compact" hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('container')" v-model="port.container"
                                                type="number" density="compact" hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-2">
                            <v-btn icon size="x-small" color="primary" class="ma-1 pa-0"
                                style="width:24px; height:24px; min-width:24px;"
                                @click="form.devices.push({ name: '', host: '', container: '' })" title="Add device"
                                aria-label="add device">
                                <v-icon size="18">mdi-plus</v-icon>
                            </v-btn>
                            {{ $t('devices') }}
                        </v-card-subtitle>
                        <div v-for="(device, i) in form.devices" :key="i" class="mb-2">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-row>
                                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                                    <div class="d-flex flex-column align-center">
                                        <v-btn icon size="x-small" color="primary" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px; margin-bottom:6px;"
                                            @click="form.devices.splice(i + 1, 0, { name: '', host: '', container: '' })"
                                            title="Add device" aria-label="add device">
                                            <v-icon size="18">mdi-plus</v-icon>
                                        </v-btn>
                                        <v-btn icon size="x-small" color="error" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px;" @click="removeDevice(i)"
                                            title="Remove device" aria-label="remove device">
                                            <v-icon size="18">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="11">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('name')" v-model="device.name" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('host')" v-model="device.host" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mt-n8">
                                        <v-col cols="12">
                                            <v-text-field :label="$t('container')" v-model="device.container"
                                                type="number" density="compact" hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <v-card-subtitle class="mb-2">
                            <v-btn icon size="x-small" color="primary" class="ma-1 pa-0"
                                style="width:24px; height:24px; min-width:24px;"
                                @click="form.variables.push({ name: '', key: '', value: '', mask: false })"
                                title="Add variable" aria-label="add variable">
                                <v-icon size="18">mdi-plus</v-icon>
                            </v-btn>
                            {{ $t('variables') }}
                        </v-card-subtitle>
                        <div v-for="(variable, i) in form.variables" :key="i" class="mb-2">
                            <v-divider v-if="i > 0" class="my-2"></v-divider>
                            <v-row>
                                <v-col cols="1" class="d-flex flex-column justify-center align-center">
                                    <div class="d-flex flex-column align-center">
                                        <v-btn icon size="x-small" color="primary" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px; margin-bottom:6px;"
                                            @click="form.variables.splice(i + 1, 0, { name: '', key: '', value: '', mask: false })"
                                            title="Add variable" aria-label="add variable">
                                            <v-icon size="18">mdi-plus</v-icon>
                                        </v-btn>
                                        <v-btn icon size="x-small" color="error" class="pa-0"
                                            style="width:24px; height:24px; min-width:24px;" @click="removeVariable(i)"
                                            title="Remove variable" aria-label="remove variable">
                                            <v-icon size="18">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="11">
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('name')" v-model="variable.name" density="compact"
                                                hide-details class="mb-4"></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-switch :label="$t('masked')" v-model="variable.mask" inset
                                                color="primary" density="compact" hide-details class="mb-4"></v-switch>
                                        </v-col>
                                    </v-row>
                                    <v-row class="mt-n8">
                                        <v-col cols="6">
                                            <v-text-field :label="$t('key')" v-model="variable.key" density="compact"
                                                hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field :label="$t('value')" v-model="variable.value"
                                                density="compact" :type="variable.mask ? 'password' : 'text'"
                                                hide-details>
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-container>
    </v-container>

    <!-- Floating Action Button -->
    <v-btn color="primary" @click="updateDocker()" class="fab"
        style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
        <v-icon>mdi-content-save</v-icon>
    </v-btn>

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
const networkOptions = ref([]);
const loadingNetworks = ref(false);
const containerOptions = ref([]);
const loadingContainers = ref(false);
const selectedContainer = ref('');
const networkMode = ref('');
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
    window.scrollTo(0, 0);

    getDockerTemplate();
    getDockerNetworks();
    getDockerContainers();
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

        if (getDocker.value.network && getDocker.value.network.startsWith('container:')) {
            networkMode.value = 'container-network';
            form.network = getDocker.value.network;
            const containerName = getDocker.value.network.replace('container:', '');
            selectedContainer.value = containerName;
            setTimeout(() => {
                validateContainerExists(containerName);
            }, 1000);
        } else {
            networkMode.value = getDocker.value.network;
            form.network = getDocker.value.network;
            selectedContainer.value = '';
        }

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
                value: variable.value,
                mask: variable.mask || false
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


const getDockerNetworks = async () => {
    try {
        loadingNetworks.value = true;
        const res = await fetch('/api/v1/docker/networks', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        if (res.ok) {
            const networks = await res.json();
            networkOptions.value = networks.map(network => ({
                name: network.Name,
                id: network.Id
            }));

            networkOptions.value.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();

                if (nameA === 'bridge') return -1;
                if (nameB === 'bridge') return 1;

                const isEthBrA = nameA.startsWith('eth') || nameA.startsWith('br');
                const isEthBrB = nameB.startsWith('eth') || nameB.startsWith('br');

                if (isEthBrA && !isEthBrB) return -1;
                if (!isEthBrA && isEthBrB) return 1;

                return nameA.localeCompare(nameB);
            });

            networkOptions.value.push({ name: 'container-network', id: 'container-network' });
            networkOptions.value.push({ name: 'none', id: 'none' });

            if (networkOptions.value.length === 1) {
            }
        } else {
            networkOptions.value = [{ name: 'container-network', id: 'container-network' }, { name: 'none', id: 'none' }];
        }
    } catch (e) {
        networkOptions.value = [{ name: 'container-network', id: 'container-network' }, { name: 'none', id: 'none' }];
    } finally {
        loadingNetworks.value = false;
    }
};

const getDockerContainers = async () => {
    try {
        loadingContainers.value = true;

        const res = await fetch('/api/v1/docker/containers/json?all=true', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        if (res.ok) {
            const containers = await res.json();
            containerOptions.value = containers.map(container => ({
                name: container.Names[0].startsWith('/') ? container.Names[0].slice(1) : container.Names[0],
                id: container.Id
            }));

            containerOptions.value.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            containerOptions.value = [];
        }
    } catch (e) {
        containerOptions.value = [];
    } finally {
        loadingContainers.value = false;
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
        value: variable.value,
        mask: variable.mask
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
        showSnackbarSuccess(t('docker container changed successfully'));
        goBackSafely();
    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

const goBackSafely = () => {
    if (window.history.state?.back) {
        requestAnimationFrame(() => {
            setTimeout(() => router.back(), 0);
        });
    } else {
        router.go('/docker');
    }
};

const removePath = (index) => {
    form.paths.splice(index, 1);
};

const removePort = (index) => {
    form.ports.splice(index, 1);
};

const removeDevice = (index) => {
    form.devices.splice(index, 1);
};

const removeVariable = (index) => {
    form.variables.splice(index, 1);
};

const onNetworkChange = (value) => {
    if (value !== 'container-network') {
        selectedContainer.value = '';
        form.network = value;
    } else {
        form.network = 'container-network';
    }
};

const onContainerChange = (containerName) => {
    if (containerName) {
        form.network = `container:${containerName}`;
    } else {
        form.network = 'container-network';
    }
};

const validateContainerExists = (containerName) => {
    const containerExists = containerOptions.value.some(container => container.name === containerName);

    if (!containerExists) {
        selectedContainer.value = '';
        form.network = 'container-network';
    }
};

</script>
