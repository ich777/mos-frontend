<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <div class="d-flex align-center justify-space-between">
          <h2>{{ $t('notifications') }}</h2>
          <v-btn text class="d-flex align-center" density="compact"
            @click="switchNotificationsOrder()">
            <v-icon small class="mr-1">mdi-sort</v-icon>
            {{ notificationsOrder === 'asc' ? $t('older') : $t('newer') }}
          </v-btn>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col>
            <v-card v-if="notifications.length > 0" variant="tonal" fluid>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item v-for="notification in notifications" :key="id">
                    <template v-slot:prepend>
                      <v-icon v-if="notification.priority === 'normal'" color="blue">mdi-information-outline</v-icon>
                      <v-icon v-else-if="notification.priority === 'warning'" color="orange">mdi-alert-outline</v-icon>
                      <v-icon v-else-if="notification.priority === 'alert'"
                        color="red">mdi-alert-circle-outline</v-icon>
                      <v-icon v-else color="grey">mdi-bell-outline</v-icon>
                    </template>
                    <v-list-item-title>{{ notification.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                    <v-list-item-subtitle class="text-caption text-grey">
                      {{ new Date(notification.timestamp).toLocaleString() }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider v-if="index < notifications.length - 1" />
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

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
  </v-overlay>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer']);
const notifications = ref([]);
const notificationsOrder = ref('asc');
const overlay = ref(false);
import { useI18n } from 'vue-i18n';
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

const switchNotificationsOrder = () => {
  if (notificationsOrder.value === 'asc') {
    notificationsOrder.value = 'desc';
  } else {
    notificationsOrder.value = 'asc';
  }
  getNotifications();
};

</script>
