import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/dashboard.vue";
import Users from "../views/users.vue";
import Pools from "../views/pools.vue";
import Disks from "../views/disks.vue";
import Shares from "../views/shares.vue";
import Docker from "../views/docker.vue";
import LXC from "../views/lxc.vue";
import Vm from "../views/vm.vue";
import Login from "../views/login.vue";
import FirstSetup from "../views/firstSetup.vue";
import DockerCreate from "../views/docker/dockerCreate.vue";
import DockerChange from "../views/docker/dockerChange.vue";
import profile from "../views/profile.vue";
import mosSettings from "../views/mosSettings.vue";
import mosSettingsDocker from "../views/mosSettings/dockerService.vue";
import mosSettingsLXC from "../views/mosSettings/lxcService.vue";
import mosSettingsVm from "../views/mosSettings/vmService.vue";
import mosSettingsNetworkInterfaces from "../views/mosSettings/networkInterfaces.vue";
import mosSettingsNetworkServices from "../views/mosSettings/networkServices.vue";
import mosSettingsSystem from "../views/mosSettings/system.vue";
import mosSettingsCron from "../views/mosSettings/cron.vue";
import mosSettingsLogs from "../views/mosSettings/logs.vue";
import mosSettingsDrivers from "../views/mosSettings/drivers.vue";
import webterminal from "../views/webterminal.vue";
import webterminalPopup from "../views/webterminalPopup.vue";
import Notifications from "../views/notifications.vue";
import RemoteMounting from "../views/remoteMounting.vue";

const routes = [
  { path: "/login", component: Login, meta: { title: "MOS Login", description: "Login to your account" } },
  { path: "/firstSetup", component: FirstSetup, props: true, meta: { title: "MOS First Setup", description: "Set up your account for the first time" } },
  { path: "", component: Dashboard, meta: { title: "Dashboard", description: "Overview of your account" } },
  { path: "/dashboard", component: Dashboard, meta: { title: "Dashboard", description: "Overview of your account" } },
  { path: "/users", component: Users, meta: { title: "Users", description: "Manage users in your account" } },
  { path: "/pools", component: Pools, meta: { title: "Pools", description: "Manage storage pools" } },
  { path: "/disks", component: Disks, meta: { title: "Disks", description: "Manage disks in your account" } },
  { path: "/shares", component: Shares, meta: { title: "Shares", description: "Manage shares in your account" } },
  { path: "/remoteMounting", component: RemoteMounting, meta: { title: "Remote Mounting", description: "Manage remote mounting" } },
  { path: "/docker", component: Docker, meta: { title: "Docker", description: "Manage Docker containers" } },
  { path: "/docker/create", component: DockerCreate, meta: { title: "Create Docker", description: "Create a new Docker container" } },
  { path: "/docker/change/:docker", component: DockerChange, props: true, meta: { title: "Change Docker", description: "Change Docker container settings" } },
  { path: "/lxc", component: LXC, meta: { title: "LXC", description: "Manage LXC containers" } },
  { path: "/vm", component: Vm, meta: { title: "VM", description: "Manage virtual machines" } },
  { path: "/mosSettings", component: mosSettings, meta: { title: "MOS Settings", description: "Manage MOS settings" } },
  { path: "/mosSettings/docker", component: mosSettingsDocker, meta: { title: "MOS Settings - Docker", description: "Manage Docker settings" } },
  { path: "/mosSettings/lxc", component: mosSettingsLXC, meta: { title: "MOS Settings - LXC", description: "Manage LXC settings" } },
  { path: "/mosSettings/vm", component: mosSettingsVm, meta: { title: "MOS Settings - VM", description: "Manage VM settings" } },
  { path: "/mosSettings/networkInterfaces", component: mosSettingsNetworkInterfaces, meta: { title: "MOS Settings - Network Interfaces", description: "Manage Network Interfaces settings" } },
  { path: "/mosSettings/networkServices", component: mosSettingsNetworkServices, meta: { title: "MOS Settings - Network Services", description: "Manage Network Services settings" } },
  { path: "/mosSettings/system", component: mosSettingsSystem, meta: { title: "MOS Settings - System", description: "Manage System settings" } },
  { path: "/mosSettings/cron", component: mosSettingsCron, meta: { title: "MOS Settings - Cron", description: "Manage Cron jobs" } },
  { path: "/mosSettings/logs", component: mosSettingsLogs, meta: { title: "MOS Settings - Logs", description: "View system logs" } },
  { path: "/mosSettings/drivers", component: mosSettingsDrivers, meta: { title: "MOS Settings - Drivers", description: "Manage device drivers" } },
  { path: "/profile", component: profile, meta: { title: "Profile", description: "Manage your profile" } },
  { path: "/webTerminal", component: webterminal, meta: { title: "Web Terminal", description: "Access the web terminal" } },
  { path: "/webTerminalPopup", component: webterminalPopup, children: [ { path: "", component: webterminalPopup, meta: { hideAppBar: true, title: "Web Terminal", description: "Access the web terminal" } } ] },
  { path: "/notifications", component: Notifications, meta: { title: "Notifications", description: "View your notifications" } }
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
})

export default router;
