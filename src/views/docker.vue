<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('docker containers') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <draggable v-model="dockers" item-key="Id" @end="onDragEnd" handle=".drag-handle">
                    <template #item="{ element: docker, index }">
                      <div>
                        <v-list-item :id="docker.Id">
                          <template v-slot:prepend>
                            <v-menu>
                              <template #activator="{ props }">
                                <v-img class="drag-handle mr-4" v-bind="props"
                                  :src="`/docker_icons/${docker.Names[0]}.png`" alt="docker image" width="30"
                                  height="30" style="cursor: pointer" />
                              </template>
                              <v-list>
                                <v-list-item v-if="checkWebui(docker)" @click="showWebui(docker)">
                                  <v-list-item-title>{{ $t('web ui') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="docker.State === 'running'" @click="openTerminal(docker.Names[0])">
                                  <v-list-item-title>{{ $t('terminal') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="docker.State !== 'running'" @click="startDocker(docker.Names[0])">
                                  <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="docker.State === 'running'" @click="stopDocker(docker.Names[0])">
                                  <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="docker.State === 'running'" @click="restartDocker(docker.Names[0])">
                                  <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="docker.State === 'running'" @click="killDocker(docker.Names[0])">
                                  <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item :to="`/docker/change/${docker.Names[0]}`">
                                  <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                                </v-list-item>
                                <v-divider />
                                <v-list-item @click="openTerminalLogs(docker.Names[0])">
                                  <v-list-item-title>{{ $t('logs') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="updateDocker(docker.Names[0])">
                                  <v-list-item-title>{{ $t('update') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="openDeleteDialog(docker)">
                                  <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                          </template>
                          <v-list-item-title>{{ docker.Names[0] }}</v-list-item-title>
                          <v-list-item-subtitle :style="{ color: docker.State === 'running' ? 'green' : 'red' }">
                            {{ docker.State }}
                          </v-list-item-subtitle>
                          <template v-slot:append>
                            <template v-if="$vuetify.display.xlAndUp">
                              <v-divider vertical class="mx-2" />
                              <p style="min-width:250px; max-width: 150px;">{{ $t('image') }}: {{ docker.Image }}</p>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <template v-if="$vuetify.display.mdAndUp">
                              <p style="min-width:150px; max-width: 150px;">
                                {{ $t('ports') }}:
                                {{
                                  docker.Ports && docker.Ports.some(port => port.PublicPort)
                                    ? docker.Ports.filter(port => port.PublicPort).map(port => port.PublicPort).join(', ')
                                    : '-'
                                }}
                              </p>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <template v-if="$vuetify.display.mdAndUp && docker.HostConfig.NetworkMode === 'bridge'">
                              <p style="min-width:150px; max-width: 150px;">{{ $t('ip address') }}: {{
                                docker.NetworkSettings.Networks.bridge.IPAddress || '-' }}</p>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <template v-if="$vuetify.display.smAndUp && docker.HostConfig.NetworkMode === 'host'">
                              <p style="min-width:150px; max-width: 150px;">{{ $t('ip address') }}: {{
                                docker.NetworkSettings.Networks.host.IPAddress || '-' }}</p>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <template v-if="$vuetify.display.smAndUp">
                              <p v-if="!docker.HostConfig.NetworkMode.startsWith('container:')"
                                style="min-width:150px; max-width: 150px;">
                                {{ $t('network') }}: {{ docker.HostConfig.NetworkMode }}
                              </p>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <template
                              v-if="$vuetify.display.smAndUp && mosDockers && mosDockers.find(item => item.name === docker.Names[0] && item.update_available)">
                              <v-icon tooltip="$t('update available')" color="green"
                                @click="updateDocker(docker.Names[0])">
                                mdi-autorenew
                              </v-icon>
                              <v-divider vertical class="mx-2" />
                            </template>
                            <v-switch v-model="docker.autostart" color="primary" hide-details
                              @change="switchAutostart(docker)" inset density="compact" />
                            <v-divider vertical class="mx-2" />
                            <v-icon class="drag-handle" @click="openInfoDialog(docker)">mdi-information-outline</v-icon>
                          </template>
                        </v-list-item>
                        <v-divider v-if="index < dockers.length - 1" />
                      </div>
                    </template>
                  </draggable>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col class="d-flex justify-end">
            <v-btn color="primary" @click="updateAll()" class="ml-2">
              <v-icon left>mdi-autorenew</v-icon>
              {{ $t('update all') }}
            </v-btn>
            <v-btn color="primary" @click="createDialog = true" class="ml-2">
              <v-icon left>mdi-plus</v-icon>
              {{ $t('create (json)') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-btn to="/docker/create" color="primary" class="fab"
    style="position: fixed; bottom: 32px; right: 32px; z-index: 1000;" size="large" icon>
    <v-icon>mdi-plus</v-icon>
  </v-btn>

  <v-dialog v-model="createDialog" max-width="700">
    <v-card>
      <v-card-title>{{ $t('create docker') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="9" class="d-flex align-center">
            <v-text-field v-model="newDockerUrl" :label="$t('load from url')" type="url" class="mb-0"
              style="margin-bottom: 0;" />
          </v-col>
          <v-col cols="3" class="d-flex align-center justify-center">
            <v-btn color="primary" @click="fetchDockerTemplateUrl()" :disabled="!newDockerUrl"
              style="margin-bottom: 20px;">
              {{ $t('fetch') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-textarea v-model="newDockerText" :label="$t('paste json template here')" rows="5" required>
        </v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createDocker" :disabled="!newDockerText">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card>
      <v-card-title class="text-h6" v-if="deleteDialog.docker">{{ $t('delete') }} {{ deleteDialog.docker.Names[0]
        }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this docker container?') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="removeDocker(deleteDialog.docker.Names[0])">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="infoDialog.value" max-width="500">
    <v-card v-if="infoDialog.docker">
      <v-card-title class="text-h6">{{ infoDialog.docker.Names[0] }}</v-card-title>
      <v-card-text>
        <div><strong>{{ $t('state') }}: </strong>{{ infoDialog.docker.State }}</div>
        <div><strong>{{ $t('image') }}: </strong>{{ infoDialog.docker.Image }}</div>
        <div><strong>{{ $t('network') }}: </strong>{{ infoDialog.docker.HostConfig.NetworkMode }}</div>
        <div v-if="infoDialog.docker.Mounts && infoDialog.docker.Mounts.length">
          <div v-for="(mount, idx) in infoDialog.docker.Mounts" :key="idx">
            <div><strong>{{ $t('type') }}: </strong>{{ mount.Type }}</div>
            <div><strong>{{ $t('source') }}: </strong>{{ mount.Source }} &#8594; {{ mount.Destination }}</div>
            <div><strong>{{ $t('read/write') }}: </strong>{{ mount.RW ? 'Yes' : 'No' }}</div>
            <div><strong>{{ $t('mode') }}: </strong>{{ mount.Mode }}</div>
            <div><strong>{{ $t('propagation') }}: </strong>{{ mount.Propagation }}</div>
          </div>
        </div>
        <div><strong>{{ $t('ports') }}: </strong>
          <div v-if="infoDialog.docker.Ports && infoDialog.docker.Ports.length">
            <div v-for="(port, idx) in infoDialog.docker.Ports" :key="idx">
              {{ port.PrivatePort }}<span v-if="port.PublicPort"> &#8594; {{ port.PublicPort }}</span>
              ({{ port.Type }})
            </div>
          </div>
          <span v-else>-</span>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="infoDialog.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import draggable from 'vuedraggable';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { openTerminalPopup } from '@/composables/terminalpopup'

const emit = defineEmits(['refresh-drawer']);
const { t } = useI18n();
const dockers = ref([]);
const mosDockers = ref([]);
const overlay = ref(false);
const createDialog = ref(false);
const newDockerUrl = ref('');
const newDockerText = ref('');
const deleteDialog = reactive({
  value: false,
  docker: null
});
const infoDialog = reactive({
  value: false,
  docker: null
});

onMounted(() => {
  getDockers();
});

const getDockers = async () => {
  try {
    const [res, mosRes] = await Promise.all([
      fetch('/api/v1/docker/containers/json?all=true', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
      }),
      fetch('/api/v1/docker/mos/containers', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
      })
    ]);

    if (!res.ok) throw new Error(t('docker containers could not be loaded'));
    if (!mosRes.ok) throw new Error(t('docker containers could not be loaded'));

    const result = await res.json();
    const mosResult = await mosRes.json();

    // Entferne führenden / von jedem Namen und initialisiere zusätzliche Properties
    result.forEach(docker => {
      if (docker.Names && Array.isArray(docker.Names)) {
        docker.Names = docker.Names.map(name => name.startsWith('/') ? name.slice(1) : name);
      }
      // Initialize properties to avoid mutating in template
      docker.showInfo = false;
      docker.webui = '';
    });

    // Sortiere docker nach dem Index in mosResult
    if (Array.isArray(mosResult)) {
      result.sort((a, b) => {
        const objA = mosResult.find(item => item.name === a.Names[0]);
        const objB = mosResult.find(item => item.name === b.Names[0]);
        const idxA = objA ? objA.index : Number.MAX_SAFE_INTEGER;
        const idxB = objB ? objB.index : Number.MAX_SAFE_INTEGER;

        return idxA - idxB;
      });
    }

    // Übernehme autostart aus mosResult in result
    result.forEach(docker => {
      const mos = mosResult.find(item => item.name === docker.Names[0]);
      docker.autostart = mos ? mos.autostart : false;
    });

    dockers.value = result;
    mosDockers.value = mosResult;

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const stopDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be stopped'));
    showSnackbarSuccess(t('docker container stopped successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const startDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/start`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be started'));
    showSnackbarSuccess(t('docker container started successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const restartDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name })
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be restarted'));
    showSnackbarSuccess(t('docker container restarted successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const killDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/kill`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be stopped'));
    showSnackbarSuccess(t('docker container stopped successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const createDocker = async () => {
  createDialog.value = false;

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/docker/mos/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: newDockerText.value
    });

    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be created'));
    showSnackbarSuccess(t('docker container created successfully'));
    getDockers();
    newDockerText.value = '';

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const removeDocker = async (name) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/remove`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name })
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be removed'));
    showSnackbarSuccess(t('docker container removed successfully'));
    getDockers();
    clearDeleteDialog();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const updateDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name })
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker container could not be updated'));
    showSnackbarSuccess(t('docker container updated successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const updateAll = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('docker containers could not be updated'));
    showSnackbarSuccess(t('docker containers updated successfully'));
    getDockers();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const switchAutostart = async (docker) => {
  const autostart = [{ name: docker.Names[0], autostart: docker.autostart }];

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/containers`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(autostart)
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('autostart setting could not be saved'));
    showSnackbarSuccess(t('autostart setting saved successfully'));

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const onDragEnd = async () => {
  const newOrder = JSON.stringify(
    dockers.value.map((docker, idx) => {
      const obj = {
        name: docker.Names[0],
        index: idx + 1,
        wait: docker.wait,
        autostart: docker.autostart
      };
      return obj;
    })
  );

  try {
    const res = await fetch('/api/v1/docker/mos/containers', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: newOrder
    });

    if (!res.ok) throw new Error(t('docker container order could not be saved'));
    showSnackbarSuccess(t('docker container order saved successfully'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const checkWebui = (docker) => {
  if (
    docker.State === 'running' &&
    docker.Labels &&
    docker.Labels['mos.webui'] !== undefined
  ) {
    let webui = docker.Labels['mos.webui'];
    const portMatch = webui.match(/PORT:(\d+)/);
    if (portMatch && Array.isArray(docker.Ports)) {
      const portObj = docker.Ports.find(
        port => port.PrivatePort === Number(portMatch[1])
      );
      if (portObj) {
        const port = portObj.PublicPort ? portObj.PublicPort : portObj.PrivatePort;
        webui = webui.replace(/\[PORT:\d+\]/g, port);
      } else {
        webui = webui.replace(/\[PORT:\d+\]/g, portMatch[1]);
      }
    }
    const addressMatch = webui.match(/\[ADDRESS\]/g);
    if (addressMatch) {
      webui = webui.replace(/\[ADDRESS\]/g, window.location.hostname);
    }
    docker.webui = webui;
    return true;
  }
  return false;
};

const fetchDockerTemplateUrl = async () => {
  const dockerTemplate = { url: newDockerUrl.value };
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
    newDockerText.value = JSON.stringify(await res.json(), null, 2);

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
};

const openTerminal = async (dockerName) => {
  const sessionId = await createDockerTerminalSession(dockerName);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create terminal session'));
  }
};

const openTerminalLogs = async (dockerName) => {
  const sessionId = await createLogsTerminalSession(dockerName);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create logs terminal session'));
  }
};

const createDockerTerminalSession = async (dockerName) => {
  const existingSessionId = await checkExistingTerminal("docker", "exec", dockerName);
  if (existingSessionId) {
    return existingSessionId;
  }

  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "command": "docker", "args": ["exec", "-it", dockerName, "/bin/sh"] })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to create terminal session'));
    }

    const Result = await res.json();
    return Result.sessionId;

  } catch (e) {
    showSnackbarError(e.message);
  }
}

const createLogsTerminalSession = async (dockerName) => {
  const existingSessionId = await checkExistingTerminal("docker", "logs", dockerName);
  if (existingSessionId) {
    return existingSessionId;
  }

  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "command": "docker", "args": ["logs", "-f", "--tail", "100", dockerName], readonlyOnly: true })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to create terminal log session'));
    }

    const Result = await res.json();
    return Result.sessionId;

  } catch (e) {
    showSnackbarError(e.message);
  }
}

const checkExistingTerminal = async (command, arg, dockerName) => {
  try {
    const res = await fetch(`/api/v1/terminal/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to retrieve terminal sessions'));
    }

    const Result = await res.json();
    const sessions = ref([]);
    sessions.value = Result.sessions || [];
    const session = sessions.value.filter(
      session =>
        session.command === command &&
        Array.isArray(session.args) &&
        session.args.includes(dockerName)
        &&
        session.args.includes(arg)
    );
    if (session.length > 0) {
      return session[0].sessionId;
    } else {
      return null;
    }

  } catch (e) {
    showSnackbarError(e.message);
  }
}

const openInfoDialog = (docker) => {
  infoDialog.value = true;
  infoDialog.docker = docker;
};

const showWebui = (docker) => {
  window.open(`${docker.webui}`, '_blank');
};

const clearDeleteDialog = () => {
  deleteDialog.value = false;
  deleteDialog.docker = null;
};

const openDeleteDialog = (docker) => {
  deleteDialog.value = true;
  deleteDialog.docker = docker;
};

</script>
