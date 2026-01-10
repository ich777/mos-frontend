import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/dashboard.vue';
import Users from '../views/users.vue';
import Pools from '../views/pools.vue';
import Disks from '../views/disks.vue';
import Shares from '../views/shares.vue';
import Docker from '../views/docker.vue';
import LXC from '../views/lxc.vue';
import Vm from '../views/vm.vue';
import Login from '../views/login.vue';
import FirstSetup from '../views/firstSetup.vue';
import DockerCreate from '../views/docker/dockerCreate.vue';
import DockerChange from '../views/docker/dockerChange.vue';
import DockerCompose from '../views/docker/dockerCompose.vue';
import mosHub from '../views/mosHub.vue';
import profile from '../views/profile.vue';
import mosSettings from '../views/mosSettings.vue';
import mosSettingsDocker from '../views/mosSettings/dockerService.vue';
import mosSettingsLXC from '../views/mosSettings/lxcService.vue';
import mosSettingsVm from '../views/mosSettings/vmService.vue';
import mosSettingsNetworkInterfaces from '../views/mosSettings/networkInterfaces.vue';
import mosSettingsNetworkServices from '../views/mosSettings/networkServices.vue';
import mosSettingsSystem from '../views/mosSettings/system.vue';
import mosSettingsCron from '../views/mosSettings/cron.vue';
import mosSettingsLogs from '../views/mosSettings/logs.vue';
import mosSettingsDrivers from '../views/mosSettings/drivers.vue';
import mosSettingsBoot from '../views/mosSettings/boot.vue';
import mosSettingsHub from '../views/mosSettings/mosHub.vue';
import mosSettingsSensors from '../views/mosSettings/sensors.vue';
import webterminal from '../views/webterminal.vue';
import webterminalPopup from '../views/webterminalPopup.vue';
import Notifications from '../views/notifications.vue';
import RemoteMounting from '../views/remoteMounting.vue';
import Plugins from '../views/plugins.vue';
import PluginView from '../views/pluginView.vue';

const routes = [
  { path: '/login', component: Login, meta: { hideAppBar: false, title: 'MOS Login', description: 'Login to your account' } },
  { path: '/firstSetup', component: FirstSetup, props: true, meta: { hideAppBar: false, title: 'MOS First Setup', description: 'Set up your account for the first time' } },
  { path: '', component: Dashboard, meta: { hideAppBar: false, title: 'Dashboard', description: 'Overview of your account' } },
  { path: '/dashboard', component: Dashboard, meta: { hideAppBar: false, title: 'Dashboard', description: 'Overview of your account' } },
  { path: '/users', component: Users, meta: { hideAppBar: false, title: 'Users', description: 'Manage users in your account' } },
  { path: '/pools', component: Pools, meta: { hideAppBar: false, title: 'Pools', description: 'Manage storage pools' } },
  { path: '/disks', component: Disks, meta: { hideAppBar: false, title: 'Disks', description: 'Manage disks in your account' } },
  { path: '/shares', component: Shares, meta: { hideAppBar: false, title: 'Shares', description: 'Manage shares in your account' } },
  { path: '/remoteMounting', component: RemoteMounting, meta: { hideAppBar: false, title: 'Remote Mounting', description: 'Manage remote mounting' } },
  { path: '/docker', component: Docker, meta: { hideAppBar: false, title: 'Docker', description: 'Manage Docker containers' } },
  {
    path: '/docker/create',
    component: DockerCreate,
    props: (route) => ({
      template: route.query.template || '',
    }),
    meta: { hideAppBar: false, title: 'Create Docker', description: 'Create a new Docker container' },
  },
  { path: '/docker/change/:docker', component: DockerChange, props: true, meta: { hideAppBar: false, title: 'Change Docker', description: 'Change Docker container settings' } },
  {
    path: '/docker/compose',
    component: DockerCompose,
    props: (route) => ({
      template: route.query.template || '',
      yaml: route.query.yaml || '',
      env: route.query.env || '',
    }),
    meta: { hideAppBar: false, title: 'Docker Compose', description: 'Manage Docker Compose stacks' },
  },
  { path: '/mosHub', component: mosHub, meta: { hideAppBar: false, title: 'MOS Hub', description: 'Manage MOS Hub' } },
  { path: '/lxc', component: LXC, meta: { hideAppBar: false, title: 'LXC', description: 'Manage LXC containers' } },
  { path: '/vm', component: Vm, meta: { hideAppBar: false, title: 'VM', description: 'Manage virtual machines' } },
  { path: '/mosSettings', component: mosSettings, meta: { hideAppBar: false, title: 'MOS Settings', description: 'Manage MOS settings' } },
  { path: '/mosSettings/docker', component: mosSettingsDocker, meta: { hideAppBar: false, title: 'MOS Settings - Docker', description: 'Manage Docker settings' } },
  { path: '/mosSettings/lxc', component: mosSettingsLXC, meta: { hideAppBar: false, title: 'MOS Settings - LXC', description: 'Manage LXC settings' } },
  { path: '/mosSettings/vm', component: mosSettingsVm, meta: { hideAppBar: false, title: 'MOS Settings - VM', description: 'Manage VM settings' } },
  {
    path: '/mosSettings/networkInterfaces',
    component: mosSettingsNetworkInterfaces,
    meta: { hideAppBar: false, title: 'MOS Settings - Network Interfaces', description: 'Manage Network Interfaces settings' },
  },
  {
    path: '/mosSettings/networkServices',
    component: mosSettingsNetworkServices,
    meta: { hideAppBar: false, title: 'MOS Settings - Network Services', description: 'Manage Network Services settings' },
  },
  { path: '/mosSettings/system', component: mosSettingsSystem, meta: { hideAppBar: false, title: 'MOS Settings - System', description: 'Manage System settings' } },
  { path: '/mosSettings/cron', component: mosSettingsCron, meta: { hideAppBar: false, title: 'MOS Settings - Cron', description: 'Manage Cron jobs' } },
  { path: '/mosSettings/logs', component: mosSettingsLogs, meta: { hideAppBar: false, title: 'MOS Settings - Logs', description: 'View system logs' } },
  { path: '/mosSettings/drivers', component: mosSettingsDrivers, meta: { hideAppBar: false, title: 'MOS Settings - Drivers', description: 'Manage device drivers' } },
  { path: '/mosSettings/boot', component: mosSettingsBoot, meta: { hideAppBar: false, title: 'MOS Settings - Boot', description: 'Manage boot settings' } },
  { path: '/mosSettings/mosHub', component: mosSettingsHub, meta: { hideAppBar: false, title: 'MOS Settings - MOS Hub', description: 'Manage MOS Hub settings' } },
  { path: '/mosSettings/sensors', component: mosSettingsSensors, meta: { hideAppBar: false, title: 'MOS Settings - Sensors', description: 'Manage system sensors' } },
  { path: '/profile', component: profile, meta: { hideAppBar: false, title: 'Profile', description: 'Manage your profile' } },
  { path: '/webTerminal', component: webterminal, meta: { hideAppBar: false, title: 'Web Terminal', description: 'Access the web terminal' } },
  {
    path: '/webTerminalPopup',
    component: webterminalPopup,
    children: [{ path: '', component: webterminalPopup, meta: { hideAppBar: true, title: 'Web Terminal', description: 'Access the web terminal' } }],
  },
  { path: '/notifications', component: Notifications, meta: { hideAppBar: false, title: 'Notifications', description: 'View your notifications' } },
  { path: '/plugins', component: Plugins, meta: { hideAppBar: false, title: 'Plugins', description: 'Manage installed plugins' } },
  { 
    path: '/plugin/:pluginName', 
    component: PluginView, 
    props: true,
    meta: { hideAppBar: false, title: 'Plugin', description: 'Plugin view' } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { title, description } = to.meta || {};
  const defaultTitle = 'MOS';
  const defaultDescription = 'MOS - Modern Operating System for your home server';

  document.title = title || defaultTitle;

  const descriptionElement = document.querySelector('head meta[name="description"]');

  if (descriptionElement) {
    descriptionElement.setAttribute('content', description || defaultDescription);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = description || defaultDescription;
    document.head.appendChild(meta);
  }
});

export default router;
