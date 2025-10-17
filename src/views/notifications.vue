<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <div class="d-flex align-center justify-space-between">
          <h2>{{ $t('notifications') }}</h2>
          <v-btn text class="d-flex align-center" density="compact" @click="switchNotificationsOrder()">
            <v-icon small class="mr-1">{{ notificationsOrder === 'desc' ? 'mdi-sort-descending' : 'mdi-sort-ascending'
            }}</v-icon>
            {{ notificationsOrder === 'desc' ? $t('newer') : $t('older') }}
          </v-btn>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card v-if="notifications.length > 0" variant="tonal" fluid>
              <v-card-text class="pa-0">
                <v-list>
                    <v-list-item v-for="(notification, index) in notifications" :key="notification.id"
                    @click="openNotificationDialog(notification)">
                    <template v-slot:prepend>
                      <v-icon v-if="notification.priority === 'normal'" color="blue">mdi-information-outline</v-icon>
                      <v-icon v-else-if="notification.priority === 'warning'" color="orange">mdi-alert-outline</v-icon>
                      <v-icon v-else-if="notification.priority === 'alert'"
                      color="red">mdi-alert-circle-outline</v-icon>
                      <v-icon v-else color="grey">mdi-bell-outline</v-icon>
                    </template>
                    <v-list-item-title :class="{ 'font-weight-bold': !notification.read }">
                      {{ notification.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                    <v-list-item-subtitle class="text-caption text-grey">
                      {{ new Date(notification.timestamp).toLocaleString() }}
                    </v-list-item-subtitle>
                    <v-divider v-if="index < notifications.length - 1"></v-divider>
                    </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
            <v-card v-if="notifications.length === 0" variant="tonal">
              <v-card-text class="pa-0">
                <v-list class="pa-0" style="background-color: transparent;">
                  <template v-if="notifications.length === 0">
                    <v-list-item>
                      <v-list-item-title>{{ $t('no notifications available') }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="notificationDialog.value" max-width="600px">
    <v-card>
      <v-card-title>{{ notificationDialog.notification.title }}</v-card-title>
      <v-card-text>
        <p>{{ notificationDialog.notification.message }}</p>
        <p class="text-caption text-grey">{{ new Date(notificationDialog.notification.timestamp).toLocaleString() }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" @click="notificationDialog.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>

</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['refresh-drawer']);
const notifications = ref([]);
const notificationsOrder = ref('desc');
const overlay = ref(false);
const notificationDialog = reactive({
  value: false,
  notification: {},
});
const { t } = useI18n();

onMounted(() => {
  getNotifications();
});

const getNotifications = async () => {
  try {
    const res = await fetch('/api/v1/notifications?order=' + notificationsOrder.value, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error('API-Error');
    notifications.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch('/api/v1/notifications/' + id + '/read', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      }
    });

    if (!res.ok) throw new Error('API-Error');

    notifications.value = notifications.value.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const switchNotificationsOrder = () => {
  if (notificationsOrder.value === 'asc') {
    notificationsOrder.value = 'desc';
  } else {
    notificationsOrder.value = 'asc';
  }
  getNotifications();
};

const openNotificationDialog = (notification) => {
  notificationDialog.notification = notification;
  notificationDialog.value = true;

  if (!notification.read) {
    markNotificationAsRead(notification.id);
  }
};

</script>
