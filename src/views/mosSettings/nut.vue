<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('nut') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <!-- UPS Status -->
            <span class="text-title-medium font-weight-medium">{{ $t('ups status') }}</span>
            <v-card v-if="isLoadingStatus" class="mt-4 mb-4" variant="tonal">
              <v-card-text>
                <v-skeleton-loader type="article" :loading="true" class="status-skeleton"></v-skeleton-loader>
              </v-card-text>
            </v-card>

            <v-card v-else class="mt-4 mb-4" :color="statusCardColor" variant="tonal">
              <v-card-text>
                <v-row class="status-grid">
                  <v-col cols="12" sm="6">
                    <p class="status-line">
                      <strong>{{ $t('status') }}:</strong>
                      {{ nutStatus.reachable ? $t('reachable') : $t('unreachable') }}
                    </p>
                    <div v-if="statusChips.length" class="status-line d-flex flex-wrap ga-1">
                      <v-chip v-for="chip in statusChips" :key="chip.token" :color="chip.color" size="small" variant="flat">{{ chip.token }} — {{ chip.label }}</v-chip>
                    </div>
                    <p class="status-line">
                      <strong>{{ $t('ups name') }}:</strong>
                      {{ nutStatus.name || '-' }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('manufacturer') }}:</strong>
                      {{ nutStatus.data?.manufacturer || '-' }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('model') }}:</strong>
                      {{ nutStatus.data?.model || '-' }}
                    </p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p class="status-line">
                      <strong>{{ $t('load') }}:</strong>
                      {{ nutStatus.data?.load ?? '-' }}%
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('battery charge') }}:</strong>
                      {{ nutStatus.data?.battery?.charge ?? '-' }}%
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('battery runtime') }}:</strong>
                      {{ formatRuntime(nutStatus.data?.battery?.runtime) }}
                    </p>
                    <p class="status-line">
                      <strong>{{ $t('input voltage') }}:</strong>
                      {{ nutStatus.data?.input?.voltage ?? '-' }}V
                    </p>
                  </v-col>
                </v-row>

                <!-- Reported raw vars -->
                <v-card v-if="nutStatus.reachable && hasVars" variant="outlined" class="compact-report mt-2">
                  <button type="button" class="compact-report-toggle" @click="showReportedValues = !showReportedValues">
                    <span>{{ $t('reported values') }}</span>
                    <v-icon :icon="showReportedValues ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"></v-icon>
                  </button>
                  <v-expand-transition>
                    <div v-show="showReportedValues" class="compact-report-content px-3 pb-3 pt-1">
                      <v-row dense>
                        <v-col cols="12" sm="6" md="4" v-for="(value, key) in nutStatus.vars" :key="key">
                          <span class="compact-report-key text-medium-emphasis">{{ key }}:</span>
                          <span class="compact-report-value">{{ value }}</span>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>
                </v-card>

                <p v-if="nutStatus.error" class="mb-0 mt-2 text-caption">{{ nutStatus.error }}</p>
              </v-card-text>
            </v-card>

            <v-divider class="my-4"></v-divider>

            <!-- NUT Configuration -->
            <span class="text-title-medium font-weight-medium">{{ $t('nut configuration') }}</span>

            <v-alert type="info" variant="tonal" class="mt-4 mb-4" border="start">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <span>{{ $t('the main nut switch is located in the network settings') }}.</span>
                <v-btn color="onPrimary" size="small" variant="outlined" prepend-icon="mdi-arrow-right" @click="$router.push('/mosSettings/networkServices')">
                  {{ $t('network settings') }}
                </v-btn>
              </div>
            </v-alert>

            <!-- Mode Selection -->
            <v-select :items="['standalone', 'netclient', 'netserver']" :label="$t('mode')" v-model="nutSettings.mode" class="mt-4" @update:model-value="onModeChange" hide-details="auto"></v-select>

            <v-switch :label="$t('spindown disks')" color="green" inset v-model="nutSettings.spindown_disks" hide-details="auto" density="compact" class="mt-4 mb-4"></v-switch>

            <!-- Standalone/Server Mode Configuration -->
            <div v-if="nutSettings.mode === 'standalone' || nutSettings.mode === 'netserver'">
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('server configuration') }}</span>

              <!-- Server Listen Configuration -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <span class="text-subtitle-2 font-weight-medium">{{ $t('listen addresses') }}</span>
                </v-col>
              </v-row>
              <v-row v-for="(listen, i) in nutSettings.server.listen" :key="`listen-${i}`" class="ga-2 mb-2">
                <v-col cols="12" sm="8">
                  <v-text-field :label="$t('address')" v-model="nutSettings.server.listen[i].address" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-text-field :label="$t('port')" type="number" v-model="nutSettings.server.listen[i].port" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="2" class="d-flex align-center">
                  <v-btn color="red" variant="tonal" icon size="small" @click="nutSettings.server.listen.splice(i, 1)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn
                  class="mx-4"
                  color="green"
                  size="small"
                  density="comfortable"
                  variant="tonal"
                  icon
                  aria-label="Add listen address"
                  @click="nutSettings.server.listen.push({ address: '0.0.0.0', port: 3493 })"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>

              <!-- UPS Configuration -->
              <v-divider class="my-4"></v-divider>
              <span class="text-subtitle-2 font-weight-medium">{{ $t('ups configuration') }}</span>
              <v-text-field :label="$t('ups name')" v-model="nutSettings.server.ups.name" class="mt-4"></v-text-field>
              <v-text-field :label="$t('driver')" v-model="nutSettings.server.ups.driver"></v-text-field>
              <v-text-field :label="$t('port')" v-model="nutSettings.server.ups.port"></v-text-field>
              <v-text-field :label="$t('description')" v-model="nutSettings.server.ups.desc"></v-text-field>

              <!-- UPS Extra Configuration -->
              <div class="mt-4">
                <span class="text-subtitle-2 font-weight-medium">{{ $t('extra configuration') }}</span>
                <v-row v-for="(entry, i) in extraConfigList" :key="`extra-${i}`" class="ga-2 mb-2 mt-2">
                  <v-col cols="12" sm="5">
                    <v-text-field :label="$t('key')" :model-value="entry.key" hide-details="auto" @update:model-value="(newKey) => renameExtraKey(entry.key, newKey)"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="5">
                    <v-text-field
                      :label="$t('value')"
                      :model-value="entry.value"
                      hide-details="auto"
                      @update:model-value="(newValue) => (nutSettings.server.ups.extra[entry.key] = newValue)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="2" class="d-flex align-center">
                    <v-btn color="red" variant="tonal" icon size="small" @click="deleteExtraConfig(entry.key)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <div class="d-flex align-center my-2">
                  <v-divider class="flex-grow-1"></v-divider>
                  <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add extra config" @click="addExtraConfig">
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                  <v-divider class="flex-grow-1"></v-divider>
                </div>
              </div>

              <!-- Users Configuration -->
              <v-divider class="my-4"></v-divider>
              <span class="text-subtitle-2 font-weight-medium">{{ $t('users') }}</span>
              <v-row v-for="(user, i) in nutSettings.server.users" :key="`user-${i}`" class="ga-2 mb-4 mt-2">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4">
                    <v-row class="ga-2">
                      <v-col cols="12" sm="6">
                        <v-text-field :label="$t('username')" v-model="nutSettings.server.users[i].username" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field :label="$t('password')" type="password" v-model="nutSettings.server.users[i].password" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          :items="upsmonRoleOptions"
                          item-title="title"
                          item-value="value"
                          :label="$t('upsmon role')"
                          v-model="nutSettings.server.users[i].upsmon"
                          hide-details="auto"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select :items="availableActions" :label="$t('allowed actions')" v-model="nutSettings.server.users[i].actions" multiple chips hide-details="auto"></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select :items="availableCommands" :label="$t('instant commands')" v-model="nutSettings.server.users[i].instcmds" multiple chips hide-details="auto"></v-select>
                      </v-col>
                      <v-col cols="12" class="d-flex justify-end">
                        <v-btn color="red" variant="tonal" size="small" @click="nutSettings.server.users.splice(i, 1)">
                          {{ $t('delete') }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add user" @click="addUser">
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>
            </div>

            <!-- Monitor Mode Configuration -->
            <div v-if="nutSettings.mode === 'netclient'">
              <v-divider class="my-4"></v-divider>
              <span class="text-title-medium font-weight-medium">{{ $t('monitor configuration') }}</span>
              <v-text-field :label="$t('ups name')" v-model="nutSettings.monitor.upsname" class="mt-4"></v-text-field>
              <v-text-field :label="$t('host')" v-model="nutSettings.monitor.host"></v-text-field>
              <v-text-field :label="$t('port')" type="number" v-model="nutSettings.monitor.port"></v-text-field>
              <v-text-field :label="$t('power value')" type="number" v-model="nutSettings.monitor.powervalue"></v-text-field>
              <v-text-field :label="$t('username')" v-model="nutSettings.monitor.username"></v-text-field>
              <v-text-field :label="$t('password')" type="password" v-model="nutSettings.monitor.password"></v-text-field>
              <v-select :items="['primary', 'secondary']" :label="$t('role')" v-model="nutSettings.monitor.role" hide-details="auto"></v-select>
            </div>

            <!-- Shutdown Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('shutdown configuration') }}</span>
            <v-text-field :label="$t('shutdown command')" v-model="nutSettings.shutdown.command" class="mt-4"></v-text-field>
            <!--
              Werte "lowbattery" / "timer" aus der Backend-Referenzdoku uebernommen.
              Falls es weitere gueltige Modi gibt, bitte Liste ergaenzen.
            -->
            <v-select :items="['lowbattery', 'timer']" :label="$t('shutdown mode')" v-model="nutSettings.shutdown.mode"></v-select>
            <v-text-field v-if="nutSettings.shutdown.mode === 'timer'" :label="$t('shutdown timer (seconds)')" type="number" v-model="nutSettings.shutdown.timer_seconds"></v-text-field>
            <v-text-field :label="$t('final delay')" type="number" v-model="nutSettings.shutdown.finaldelay"></v-text-field>
            <v-text-field :label="$t('minimum supplies')" type="number" v-model="nutSettings.shutdown.minsupplies"></v-text-field>
            <v-text-field :label="$t('powerdown flag')" v-model="nutSettings.shutdown.powerdownflag" class="mb-4"></v-text-field>

            <!-- Timers Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('timers') }}</span>
            <v-text-field :label="$t('poll frequency')" type="number" v-model="nutSettings.timers.pollfreq" class="mt-4" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('poll frequency alert')" type="number" v-model="nutSettings.timers.pollfreqalert" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('host sync')" type="number" v-model="nutSettings.timers.hostsync" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('dead time')" type="number" v-model="nutSettings.timers.deadtime" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('rb warn time')" type="number" v-model="nutSettings.timers.rbwarntime" :suffix="$t('seconds')"></v-text-field>
            <v-text-field :label="$t('no comm warn time')" type="number" v-model="nutSettings.timers.nocommwarntime" :suffix="$t('seconds')" class="mb-4"></v-text-field>

            <!-- Stop Services Configuration -->
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('stop services on shutdown') }}</span>

            <!-- Docker Services -->
            <div class="mt-4">
              <span class="text-subtitle-2 font-weight-medium">{{ $t('docker') }}</span>
              <v-row v-for="(service, i) in nutSettings.stop_services.docker" :key="`docker-${i}`" class="ga-2 mb-2 mt-2">
                <v-col cols="12" sm="6">
                  <v-select :label="$t('docker')" v-model="nutSettings.stop_services.docker[i].name" :items="dockerServiceOptions" hide-details="auto" clearable>
                    <template #prepend>
                      <v-btn color="red" variant="text" icon size="small" @click="nutSettings.stop_services.docker.splice(i, 1)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-switch :label="$t('enabled')" v-model="nutSettings.stop_services.docker[i].enabled" hide-details="auto" inset color="green"></v-switch>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn
                  class="mx-4"
                  color="green"
                  size="small"
                  density="comfortable"
                  variant="tonal"
                  icon
                  aria-label="Add docker service"
                  @click="nutSettings.stop_services.docker.push({ name: '', enabled: false })"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>
            </div>

            <!-- LXC Services -->
            <div class="mt-4">
              <span class="text-subtitle-2 font-weight-medium">{{ $t('lxc') }}</span>
              <v-row v-for="(service, i) in nutSettings.stop_services.lxc" :key="`lxc-${i}`" class="ga-2 mb-2 mt-2">
                <v-col cols="12" sm="6">
                  <v-select :label="$t('lxc')" v-model="nutSettings.stop_services.lxc[i].name" :items="lxcServiceOptions" hide-details="auto" clearable>
                    <template #prepend>
                      <v-btn color="red" variant="text" icon size="small" @click="nutSettings.stop_services.lxc.splice(i, 1)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-switch :label="$t('enabled')" v-model="nutSettings.stop_services.lxc[i].enabled" hide-details="auto" inset color="green"></v-switch>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn
                  class="mx-4"
                  color="green"
                  size="small"
                  density="comfortable"
                  variant="tonal"
                  icon
                  aria-label="Add lxc service"
                  @click="nutSettings.stop_services.lxc.push({ name: '', enabled: false })"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>
            </div>

            <!-- VMs -->
            <div class="mt-4">
              <span class="text-subtitle-2 font-weight-medium">{{ $t('vms') }}</span>
              <v-row v-for="(vm, i) in nutSettings.stop_services.vms" :key="`vm-${i}`" class="ga-2 mb-2 mt-2">
                <v-col cols="12" sm="6">
                  <v-select :label="$t('vm')" v-model="nutSettings.stop_services.vms[i].name" :items="vmServiceOptions" hide-details="auto" clearable>
                    <template #prepend>
                      <v-btn color="red" variant="text" icon size="small" @click="nutSettings.stop_services.vms.splice(i, 1)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-switch :label="$t('enabled')" v-model="nutSettings.stop_services.vms[i].enabled" hide-details="auto" inset color="green"></v-switch>
                </v-col>
              </v-row>
              <div class="d-flex align-center my-2">
                <v-divider class="flex-grow-1"></v-divider>
                <v-btn class="mx-4" color="green" size="small" density="comfortable" variant="tonal" icon aria-label="Add vm" @click="nutSettings.stop_services.vms.push({ name: '', enabled: false })">
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
                <v-divider class="flex-grow-1"></v-divider>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Floating Action Button -->
  <v-fab @click="saveNutSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const { overlay } = useOverlay();
const { t } = useI18n();
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);

const defaultMonitor = () => ({
  upsname: '',
  host: '',
  port: 3493,
  powervalue: 1,
  username: '',
  password: '',
  role: 'primary',
});

const defaultServer = () => ({
  listen: [
    {
      address: '0.0.0.0',
      port: 3493,
    },
  ],
  ups: {
    name: '',
    driver: '',
    port: '',
    desc: '',
    extra: {},
  },
  users: [],
});

const nutSettings = ref({
  mode: 'standalone',
  spindown_disks: true,
  server: defaultServer(),
  monitor: defaultMonitor(),
  shutdown: {
    command: '/sbin/shutdown -h +0',
    mode: 'lowbattery',
    timer_seconds: 0,
    finaldelay: 5,
    minsupplies: 1,
    powerdownflag: '',
  },
  timers: {
    pollfreq: 30,
    pollfreqalert: 5,
    hostsync: 15,
    deadtime: 15,
    rbwarntime: 5400,
    nocommwarntime: 300,
  },
  stop_services: {
    docker: [],
    lxc: [],
    vms: [],
  },
});

const dockerServiceNames = ref([]);
const lxcServiceNames = ref([]);
const vmServiceNames = ref([]);

const dockerServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.docker || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...dockerServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const lxcServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.lxc || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...lxcServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const vmServiceOptions = computed(() => {
  const currentNames = (nutSettings.value.stop_services.vms || []).map((service) => service?.name).filter(Boolean);
  return [...new Set([...vmServiceNames.value, ...currentNames])].sort((a, b) => a.localeCompare(b));
});

const nutStatus = reactive({
  reachable: false,
  name: '',
  status: '',
  data: {
    model: '',
    manufacturer: '',
    serial: '',
    load: 0,
    realpowerNominal: 0,
    battery: {
      charge: 0,
      chargeLow: 0,
      runtime: 0,
      voltage: 0,
      type: '',
    },
    input: {
      voltage: 0,
      frequency: 0,
    },
    output: {
      voltage: 0,
      frequency: 0,
    },
  },
  vars: {},
  error: '',
});

const extraConfigList = computed(() => Object.entries(nutSettings.value.server.ups.extra || {}).map(([key, value]) => ({ key, value })));

const availableActions = computed(() => ['fsd', 'instcmd', 'login', 'logout', 'master', 'monmaster', 'set', 'upsmon_primary', 'upsmon_secondary']);

const availableCommands = computed(() => ['all', 'test.battery.start.quick', 'test.battery.stop', 'test.panel.start', 'test.panel.stop', 'shutdown.return', 'shutdown.stayoff', 'shutdown.stop']);

// upsmon kann laut Referenzdoku auch null sein (reiner Admin-User ohne Monitor-Funktion)
const upsmonRoleOptions = computed(() => [
  { title: t('primary'), value: 'primary' },
  { title: t('secondary'), value: 'secondary' },
  { title: t('none'), value: null },
]);

// Deutsche Klartext-Labels + Farbcodierung fuer ups.status Tokens
const statusLabels = {
  OL: { label: t('online'), color: 'success' },
  OB: { label: t('on battery'), color: 'warning' },
  LB: { label: t('battery low'), color: 'error' },
  HB: { label: t('battery high'), color: 'warning' },
  RB: { label: t('replace battery'), color: 'error' },
  CHRG: { label: t('charging'), color: 'success' },
  DISCHRG: { label: t('discharging'), color: 'warning' },
  BYPASS: { label: t('bypass'), color: 'warning' },
  CAL: { label: t('calibration'), color: 'warning' },
  OFF: { label: t('output off'), color: 'default' },
  OVER: { label: t('overload'), color: 'error' },
  TRIM: { label: t('voltage trim'), color: 'warning' },
  BOOST: { label: t('voltage boost'), color: 'warning' },
  FSD: { label: t('forced shutdown'), color: 'error' },
  ALARM: { label: t('alarm'), color: 'error' },
};

const showReportedValues = ref(false);
const isLoadingStatus = ref(true);

const statusChips = computed(() => {
  if (!nutStatus.status || isLoadingStatus.value) return [];
  const ignoredTokens = ['OL', 'CHRG'];

  return nutStatus.status
    .split(' ')
    .filter(Boolean)
    .filter((token) => !ignoredTokens.includes(token))
    .map((token) => ({
      token,
      label: statusLabels[token]?.label || token,
      color: statusLabels[token]?.color || 'default',
    }));
});

const hasVars = computed(() => nutStatus.vars && Object.keys(nutStatus.vars).length > 0);

const statusCardColor = computed(() => {
  if (isLoadingStatus.value) return 'grey-lighten-4';
  if (!nutStatus.reachable) return 'error';
  const criticalTokens = ['LB', 'RB', 'OVER', 'ALARM', 'FSD'];
  const warningTokens = ['OB', 'HB', 'BYPASS', 'CAL', 'TRIM', 'BOOST', 'DISCHRG'];
  if (statusChips.value.some((c) => criticalTokens.includes(c.token))) return 'error';
  if (statusChips.value.some((c) => warningTokens.includes(c.token))) return 'warning';
  return 'success';
});

const formatRuntime = (seconds) => {
  if (seconds == null) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const onModeChange = () => {
  if (nutSettings.value.mode === 'netclient') {
    nutSettings.value.server = defaultServer();
  } else {
    nutSettings.value.monitor = defaultMonitor();
  }
};

const addUser = () => {
  nutSettings.value.server.users.push({
    username: '',
    password: '',
    actions: [],
    instcmds: [],
    upsmon: 'primary',
  });
};

const addExtraConfig = () => {
  const existingCount = Object.keys(nutSettings.value.server.ups.extra).length;
  nutSettings.value.server.ups.extra[`extra_${existingCount}`] = '';
};

const renameExtraKey = (oldKey, newKey) => {
  if (!newKey || newKey === oldKey) return;
  if (Object.prototype.hasOwnProperty.call(nutSettings.value.server.ups.extra, newKey)) {
    showSnackbarError(t('key already exists'));
    return;
  }
  const value = nutSettings.value.server.ups.extra[oldKey];
  delete nutSettings.value.server.ups.extra[oldKey];
  nutSettings.value.server.ups.extra[newKey] = value;
};

const deleteExtraConfig = (key) => {
  delete nutSettings.value.server.ups.extra[key];
};

const getDockerServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/docker/containers/json?all=true', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('docker containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    dockerServiceNames.value = [
      ...new Set(
        (data || [])
          .map((container) => {
            const name = Array.isArray(container.Names) ? container.Names[0] : container.name || container.Name || '';
            return name.startsWith('/') ? name.slice(1) : name;
          })
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getLxcServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/lxc/containers', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('lxc containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    lxcServiceNames.value = [...new Set((data || []).map((container) => container.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getVmServiceNames = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`${t('vm machines could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    vmServiceNames.value = [...new Set((data || []).map((machine) => machine.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getContainerServiceNames = async () => {
  await Promise.all([getDockerServiceNames(), getLxcServiceNames(), getVmServiceNames()]);
};

const getNutSettings = async () => {
  try {
    const res = await fetch('/api/v1/nut/settings', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut settings could not be loaded')}|$| ${errorMessage}`);
    }

    const data = await res.json();
    nutSettings.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getNutStatus = async () => {
  try {
    const res = await fetch('/api/v1/nut/status', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut status could not be loaded')}|$| ${errorMessage}`);
    }

    const data = await res.json();
    Object.assign(nutStatus, data);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const saveNutSettings = async () => {
  overlay.value = true;
  try {
    const res = await fetch('/api/v1/nut/settings', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nutSettings.value),
    });

    if (!res.ok) {
      let errorMessage = t('unknown error');
      try {
        const errorDetails = await res.json();
        errorMessage = errorDetails.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`${t('nut settings could not be changed')}|$| ${errorMessage}`);
    }

    showSnackbarSuccess(t('nut settings changed successfully'));
    // Refresh status
    await getNutStatus();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

onMounted(async () => {
  isLoadingStatus.value = true;
  await Promise.all([getNutSettings(), getNutStatus(), getContainerServiceNames()]);
  isLoadingStatus.value = false;
  // TODO: auf Websocket-Composable umstellen, sobald bekannt (5s-Takt laut Backend-Doku)
  const statusInterval = setInterval(async () => {
    isLoadingStatus.value = false;
    await getNutStatus();
  }, 5000);
  // Cleanup interval on unmount
  return () => clearInterval(statusInterval);
});
</script>

<style scoped>
.status-grid {
  margin-bottom: 0;
}

.status-line {
  margin: 0 0 6px;
  line-height: 1.4;
}

.status-skeleton {
  min-height: 160px;
}

.compact-report {
  border-radius: 10px;
  overflow: hidden;
}

.compact-report-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 0;
  color: rgb(var(--v-theme-success));
  min-height: 40px;
  padding: 8px 12px;
  font: inherit;
  font-size: 1.02rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.compact-report-content {
  font-size: 0.82rem;
}

.compact-report-key,
.compact-report-value {
  font-size: 0.82rem;
  line-height: 1.5;
}

.compact-report-key {
  margin-right: 4px;
}
</style>
