<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('lxc containers') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <draggable v-model="lxcs" item-key="Id" @end="onDragEnd" handle=".drag-handle">
                    <template #item="{ element: lxc, index }">
                      <div>
                        <v-list-item :id="lxc.Id">
                          <template v-slot:prepend>
                            <v-menu>
                              <template #activator="{ props }">
                                <v-img class="drag-handle mr-4" v-bind="props" :src="getLxcIconSrc(lxc)" alt="lxc image"
                                  width="30" height="30" style="cursor: pointer" />
                              </template>
                              <v-list>
                                <v-list-item v-if="lxc.state !== 'running'" @click="startLXC(lxc.name)">
                                  <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="lxc.state === 'running'" @click="stopLXC(lxc.name)">
                                  <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="lxc.state === 'running'" @click="killLXC(lxc.name)">
                                  <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="openDeleteDialog(lxc)">
                                  <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="lxc.state === 'running'" @click="openTerminal(lxc.name)">
                                  <v-list-item-title>{{ $t('terminal') }}</v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                          </template>
                          <v-list-item-title>{{ lxc.name }}</v-list-item-title>
                          <v-list-item-subtitle :style="{ color: lxc.state === 'running' ? 'green' : 'red' }">
                            {{ lxc.state }}
                          </v-list-item-subtitle>
                          <template v-slot:append>
                            <v-switch v-model="lxc.autostart" color="primary" hide-details
                              @change="switchAutostart(lxc)" inset density="compact" />
                          </template>
                        </v-list-item>
                        <v-divider v-if="index < lxcs.length - 1" />
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
            <v-btn color="primary" @click="openCreateDialog()" class="ml-2">
              <v-icon left>mdi-plus</v-icon>
              {{ $t('create') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="createDialog.value" max-width="500">
    <v-card>
      <v-card-title>{{ $t('create lxc container') }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="createDialog.name" :label="$t('name')" required />
          <v-select v-model="createDialog.distribution" :items="images.map(image => image.name)"
            :label="$t('distribution')" required />
          <v-select v-model="createDialog.release" :items="getReleasesfromDistribution(createDialog.distribution)"
            :label="$t('release')" required />
          <v-select v-model="createDialog.arch"
            :items="getArchitectuesfromDistribution(createDialog.distribution, createDialog.release)"
            :label="$t('architecture')" required />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createLXC()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card>
      <v-card-title class="text-h6">{{ $t('delete') }} {{ deleteDialog.lxc.name
        }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this lxc container?') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="removeLXC(deleteDialog.lxc.name)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';
import { openTerminalPopup } from '@/composables/terminalpopup';

const emit = defineEmits(['refresh-drawer']);
const lxcs = ref([]);
const images = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const createDialog = reactive({
  value: false,
  name: "",
  distribution: null,
  releases: null,
  architectures: null
});
const deleteDialog = reactive({
  value: false,
  lxc: null
});

onMounted(() => {
  getLXCs();
  getImages();
});

const getLXCs = async () => {
  try {
    const [res, mosRes] = await Promise.all([
      fetch('/api/v1/lxc/containers', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
      }),
      fetch('api/v1/lxc/mos/containers', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        }
      })
    ]);

    if (!res.ok) throw new Error('API-Error');
    if (!mosRes.ok) throw new Error('API-Error');
    const result = await res.json();
    const mosResult = await mosRes.json();

    // Sortiere lxc nach dem Index in mosResult
    if (Array.isArray(mosResult)) {
      result.sort((a, b) => {
        const objA = mosResult.find(item => item.name === a.name);
        const objB = mosResult.find(item => item.name === b.name);
        const idxA = objA ? objA.index : Number.MAX_SAFE_INTEGER;
        const idxB = objB ? objB.index : Number.MAX_SAFE_INTEGER;
        return idxA - idxB;
      });
    }

    // Übernehme autostart aus mosResult in result
    result.forEach(lxc => {
      const mos = mosResult.find(item => item.name === lxc.name);
      lxc.autostart = mos ? mos.autostart : false;
    });

    lxcs.value = result;

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const getImages = async () => {
  try {
    const res = await fetch('/api/v1/lxc/images', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error('API-Error');
    const imagesResult = await res.json();

    images.value = Object.keys(imagesResult.distributions).map(key => ({
      name: key,
      releases: imagesResult.distributions[key]
    }));

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const stopLXC = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${name}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc container could not be stopped'));
    showSnackbarSuccess(t('lxc container stopped successfully'));
    getLXCs();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const startLXC = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${name}/start`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc container could not be started'));
    showSnackbarSuccess(t('lxc container started successfully'));
    getLXCs();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const killLXC = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${name}/kill`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc container could not be killed'));
    showSnackbarSuccess(t('lxc container killed successfully'));
    getLXCs();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const createLXC = async () => {
  createDialog.value = false;
  const newLXC = {
    name: createDialog.name,
    distribution: createDialog.distribution,
    release: createDialog.release,
    arch: createDialog.arch
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/lxc/containers/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newLXC)
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc container could not be created'));
    showSnackbarSuccess(t('lxc container created successfully'));
    getLXCs();
    clearCreateDialog();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const removeLXC = async (name) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/containers/${name}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });
    overlay.value = false;

    if (!res.ok) throw new Error(t('lxc container could not be removed'));
    showSnackbarSuccess(t('lxc container removed successfully'));
    getLXCs();
    clearDeleteDialog();

  } catch (e) {
    overlay.value = false;
    showSnackbarError(e.message);
  }
}

const openTerminal = async (lxcName) => {
  const sessionId = await createLXCTerminalSession(lxcName);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create terminal session'));
  }
};

const createLXCTerminalSession = async (lxcName) => {
  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "command": "lxc-attach",
        "args": ["-n", lxcName]
      })
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

const switchAutostart = async (lxc) => {
  const autostart = [{ name: lxc.name, autostart: lxc.autostart }];

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/lxc/mos/containers`, {
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
    lxcs.value.map((lxc, idx) => {
      const obj = {
        name: lxc.name,
        index: idx + 1,
        autostart: lxc.autostart
      };
      return obj;
    })
  );

  try {
    const res = await fetch('/api/v1/lxc/mos/containers', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: newOrder
    });

    if (!res.ok) throw new Error(t('lxc container order could not be saved'));
    showSnackbarSuccess(t('lxc container order saved successfully'));
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const openDeleteDialog = (lxc) => {
  deleteDialog.value = true;
  deleteDialog.lxc = lxc;
};

const clearDeleteDialog = () => {
  deleteDialog.value = false;
  deleteDialog.lxc = null;
};

const openCreateDialog = () => {
  createDialog.value = true;
};

const clearCreateDialog = () => {
  createDialog.value = false;
  createDialog.name = "";
  createDialog.distribution = null;
  createDialog.releases = null;
  createDialog.arch = null;
};

const getLxcIconSrc = (lxc) => {
  if (lxc.custom_icon) {
    return `/lxc_custom/${lxc.name}.png`;
  } else {
    return `/lxc_icons/${lxc.distribution}.png`;
  }
};

const getReleasesfromDistribution = (distribution) => {
  const image = images.value.find(img => img.name === distribution);
  return image ? Object.keys(image.releases) : [];
};

const getArchitectuesfromDistribution = (distribution, release) => {
  const image = images.value.find(img => img.name === distribution);
  if (image && image.releases && image.releases[release]) {
    return image.releases[release].architectures || [];
  }
  return image ? image.architectures : [];
};

</script>
