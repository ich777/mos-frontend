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
import DockerCreate from "../views/docker/dockerCreate.vue";
import DockerChange from "../views/docker/dockerChange.vue";
import profile from "../views/profile.vue";
import mosSettings from "../views/mosSettings.vue";
import mosSettingsDocker from "../views/mosSettings/dockerService.vue";
import mosSettingsLXC from "../views/mosSettings/lxcService.vue";
import mosSettingsVm from "../views/mosSettings/vmService.vue";
import mosSettingsNetwork from "../views/mosSettings/network.vue";
import mosSettingsSstem from '../views/mosSettings/system.vue';
import webterminal from "../views/webterminal.vue";
import webterminalPopup from "../views/webterminalPopup.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "", component: Dashboard },
  { path: "/dashboard", component: Dashboard },
  { path: "/users", component: Users },
  { path: "/pools", component: Pools },
  { path: "/disks", component: Disks },
  { path: "/shares", component: Shares },
  { path: "/docker", component: Docker },
  { path: "/docker/create", component: DockerCreate },
  { path: "/docker/change/:docker", component: DockerChange, props: true },
  { path: "/lxc", component: LXC },
  { path: "/vm", component: Vm },
  { path: "/mosSettings", component: mosSettings },
  { path: "/mosSettings/docker", component: mosSettingsDocker },
  { path: "/mosSettings/lxc", component: mosSettingsLXC },
  { path: "/mosSettings/vm", component: mosSettingsVm },
  { path: "/mosSettings/network", component: mosSettingsNetwork },
  { path: "/mosSettings/system", component: mosSettingsSstem },
  { path: "/profile", component: profile },
  { path: "/webTerminal", component: webterminal },
  {
    path: "/webTerminalPopup",
    component: webterminalPopup,
    children: [
      { path: "", component: webterminalPopup, meta: { hideAppBar: true } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
