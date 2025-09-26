<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <v-row align="center">
                    <v-col cols="auto" class="d-flex align-center">
                        <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
                    </v-col>
                    <v-col>
                        <h2 class="mb-0">{{ $t('create docker containers') }}</h2>
                    </v-col>
                </v-row>
            </v-container>
            <v-container fluid class="pa-0">
                <v-card variant="tonal" fluid>
                    <v-card-text>
                        <v-select :items="allTemplatesMixed || []" :label="$t('template')"
                            v-model="form.selectedTemplate" @update:model-value="selectTemplate" dense outlined>
                        </v-select>
                        <v-row>
                            <v-col cols="9" class="d-flex align-center">
                                <v-text-field v-model="dockerUrl" :label="$t('load from url')" type="url" class="mb-0"
                                    style="margin-bottom: 0;" />
                            </v-col>
                            <v-col cols="3" class="d-flex align-center justify-center">
                                <v-btn color="primary" @click="fetchDockerTemplateUrl()" :disabled="!dockerUrl"
                                    style="margin-bottom: 20px;" hide-details>
                                    {{ $t('fetch') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <v-text-field :label="$t('name')" v-model="form.name" required></v-text-field>
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
    <v-fab color="primary" @click="createDocker()"
        style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
        <v-icon>mdi-content-save</v-icon>
    </v-fab>

    <v-overlay :model-value="overlay" class="align-center justify-center">
        <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const emit = defineEmits(['refresh-drawer']);
const { t } = useI18n();
const router = useRouter();
const overlay = ref(false);
const networkOptions = ref([]);
const loadingNetworks = ref(false);
const containerOptions = ref([]);
const loadingContainers = ref(false);
const selectedContainer = ref('');
const networkMode = ref('');
const dockerUrl = ref('');
const form = ref({
    selectedTemplate: '',
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
    variables: [],
    devices: []
})
const allTemplates = ref({})
const allTemplatesMixed = ref([])

onMounted(() => {
    window.scrollTo(0, 0);

    getAllTemplates();
    getDockerNetworks();
    getDockerContainers();
});

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

const onNetworkChange = (value) => {
    if (value !== 'container-network') {
        selectedContainer.value = '';
        form.value.network = value;
    } else {
        form.value.network = 'container-network';
    }
};

const onContainerChange = (containerName) => {
    if (containerName) {
        form.value.network = `container:${containerName}`;
    } else {
        form.value.network = 'container-network';
    }
};

const removePath = (index) => {
    form.value.paths.splice(index, 1);
};

const removePort = (index) => {
    form.value.ports.splice(index, 1);
};

const removeDevice = (index) => {
    form.value.devices.splice(index, 1);
};

const removeVariable = (index) => {
    form.value.variables.splice(index, 1);
};

const fetchDockerTemplateUrl = async () => {
    const dockerTemplate = { url: dockerUrl.value };
    try {
        overlay.value = true;
        const res = await fetch(`/api/v1/docker/mos/xml_convert`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dockerTemplate)
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('docker template could not be fetched'));

        const jsonData = await res.json();
        fillFormFromJson(jsonData);
        dockerUrl.value = '';

    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

const fillFormFromJson = (jsonData) => {
    if (jsonData) {
        form.value.name = jsonData.name || '';
        form.value.repo = jsonData.repo || '';

        if (jsonData.network && jsonData.network.startsWith('container:')) {
            networkMode.value = 'container-network';
            form.value.network = jsonData.network;
            const containerName = jsonData.network.replace('container:', '');
            selectedContainer.value = containerName;
        } else {
            networkMode.value = jsonData.network || '';
            form.value.network = jsonData.network || '';
            selectedContainer.value = '';
        }

        form.value.custom_ip = jsonData.custom_ip || '';
        form.value.default_shell = jsonData.default_shell || '';
        form.value.privileged = jsonData.privileged || false;
        form.value.extra_parameters = jsonData.extra_parameters || '';
        form.value.web_ui_url = jsonData.web_ui_url || '';
        form.value.icon = jsonData.icon || '';

        form.value.paths = Array.isArray(jsonData.paths)
            ? jsonData.paths.map(path => ({
                name: path.name || '',
                mode: path.mode || '',
                host: path.host || '',
                container: path.container || ''
            }))
            : [];

        form.value.ports = Array.isArray(jsonData.ports)
            ? jsonData.ports.map(port => ({
                name: port.name || '',
                protocol: port.protocol || '',
                host: port.host || '',
                container: port.container || ''
            }))
            : [];

        form.value.variables = Array.isArray(jsonData.variables)
            ? jsonData.variables.map(variable => ({
                name: variable.name || '',
                key: variable.key || '',
                value: variable.value || '',
                mask: variable.mask || false
            }))
            : [];

        form.value.devices = Array.isArray(jsonData.devices)
            ? jsonData.devices.map(device => ({
                name: device.name || '',
                host: device.host || '',
                container: device.container || ''
            }))
            : [];

        showSnackbarSuccess(t('template loaded successfully'));
    }
};

const createDocker = async () => {

    const newDocker = {
        name: form.value.name,
        repo: form.value.repo,
        registry: form.value.registry,
        network: form.value.network,
        custom_ip: form.value.custom_ip,
        default_shell: form.value.default_shell,
        privileged: form.value.privileged,
        extra_parameters: form.value.extra_parameters,
        web_ui_url: form.value.web_ui_url,
        icon: form.value.icon,
        paths: form.value.paths.map(path => ({
            name: path.name,
            mode: path.mode,
            host: path.host,
            container: path.container
        })),
        ports: form.value.ports.map(port => ({
            name: port.name,
            protocol: port.protocol,
            host: port.host,
            container: port.container
        })),
        variables: form.value.variables.map(variable => ({
            name: variable.name,
            key: variable.key,
            value: variable.value,
            mask: variable.mask
        })),
        devices: form.value.devices.map(device => ({
            name: device.name,
            host: device.host,
            container: device.container
        }))
    }

    try {
        overlay.value = true;

        const res = await fetch('/api/v1/docker/mos/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newDocker)
        });

        overlay.value = false;

        if (!res.ok) throw new Error(t('docker container could not be created'));
        goBackSafely();
        showSnackbarSuccess(t('docker container created successfully'));

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

const getAllTemplates = async () => {
    try {
        const res = await fetch('/api/v1/docker/mos/templates', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        if (!res.ok) throw new Error(t('could not fetch templates'));
        const result = await res.json();
        allTemplates.value = result;
        allTemplatesMixed.value = [...result.installed, ...result.removed];
    } catch (e) {
        showSnackbarError(e.message);
    }
}

const selectTemplate = async () => {
    const installed = !!allTemplates.value.installed.find(template => template === form.value.selectedTemplate);
    await getDockerTemplate(form.value.selectedTemplate, installed);
};

const getDockerTemplate = async (docker, installed) => {
    try {
        overlay.value = true;
        const res = await fetch(`/api/v1/docker/mos/templates/${docker}${installed ? '?edit=true' : ''}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });
        overlay.value = false;

        if (!res.ok) throw new Error(t('docker container could not be loaded'));
        const result = await res.json();

        if (result) {
            form.value.name = result.name;
            form.value.repo = result.repo;

            if (result.network && result.network.startsWith('container:')) {
                networkMode.value = 'container-network';
                form.value.network = result.network;
                const containerName = result.network.replace('container:', '');
                selectedContainer.value = containerName;
            } else {
                networkMode.value = result.network;
                form.value.network = result.network;
                selectedContainer.value = '';
            }

            form.value.custom_ip = result.custom_ip;
            form.value.default_shell = result.default_shell;
            form.value.privileged = result.privileged;
            form.value.extra_parameters = result.extra_parameters;
            form.value.web_ui_url = result.web_ui_url;
            form.value.icon = result.icon;
            form.value.paths = Array.isArray(result.paths)
                ? result.paths.map(path => ({
                    name: path.name,
                    mode: path.mode,
                    host: path.host,
                    container: path.container
                }))
                : [];
            form.value.ports = Array.isArray(result.ports)
                ? result.ports.map(port => ({
                    name: port.name,
                    protocol: port.protocol,
                    host: port.host,
                    container: port.container
                }))
                : [];
            form.value.variables = Array.isArray(result.variables)
                ? result.variables.map(variable => ({
                    name: variable.name,
                    key: variable.key,
                    value: variable.value,
                    mask: variable.mask || false
                }))
                : [];
            form.value.devices = Array.isArray(result.devices)
                ? result.devices.map(device => ({
                    name: device.name,
                    path: device.path,
                    type: device.type
                }))
                : [];
        } else {
            form.value.name = '';
            form.value.repo = '';
            form.value.network = '';
            networkMode.value = '';
            selectedContainer.value = '';
            form.value.custom_ip = '';
            form.value.default_shell = '';
            form.value.privileged = false;
            form.value.extra_parameters = '';
            form.value.web_ui_url = '';
            form.value.icon = '';
            form.value.paths = [];
            form.value.ports = [];
            form.value.variables = [];
            form.value.devices = [];
        }

    } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
    }
};

</script>
