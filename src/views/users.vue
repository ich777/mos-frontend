<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('users') }}</h2>
      </v-container>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('overview') }}</v-card-title>
              <v-card-text class="pa-0">
                <v-list>
                  <v-list-item v-for="user in users" :key="user.id">
                    <v-list-item-title>
                      {{ user.username }}
                      <v-chip v-if="user.samba_user" color="primary" size="small" class="ml-2" label>
                        {{ $t('samba') }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ user.role }}</v-list-item-subtitle>
                    <template v-slot:prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <template v-slot:append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn variant="text" icon v-bind="props">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="openChangeDialog(user)">
                            <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="openDeleteDialog(user)">
                            <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" xl="6">
            <v-card variant="tonal" fluid>
              <v-card-title>{{ $t('newuser') }}</v-card-title>
              <v-card-text>
                <form @submit.prevent="addUser">
                  <v-text-field v-model="newUser.username" :label="$t('username')" required />
                  <v-text-field v-model="newUser.password" :type="showPassword ? 'text' : 'password'"
                    :label="$t('password')" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword" required />
                  <v-select v-model="newUser.role" :items="['admin', 'user', 'samba_only']" :label="$t('role')" required
                    @update:modelValue="val => { newUser.role = val; if (val === 'samba_only') newUser.samba_user = true; }" />
                  <v-switch v-model="newUser.samba_user" :label="$t('samba user')" inset color="primary"
                    density="compact" />
                </form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn color="primary" @click="addUser()"><v-icon left>mdi-plus</v-icon> {{ $t('create') }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('confirm delete') }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this user?') }}
      </v-card-text>
      <v-card-actions>
        <v-row class="d-flex justify-end">
          <v-btn text @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="red" @click="deleteUser(deleteDialog.user)">
            {{ $t('delete') }}
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="changeDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('change user') }}</v-card-title>
      <v-card-text>
        <form @submit.prevent="changeUser(changeDialog.user)">
          <v-text-field v-model="changeDialog.user.username" :label="$t('username')" readonly />
          <v-text-field v-model="changeDialog.password" :type="showPassword ? 'text' : 'password'"
            :label="$t('password')" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword" required />
          <v-select v-model="changeDialog.role" :items="['admin', 'user', 'samba_only']" :label="$t('role')" required />
          <v-switch v-model="changeDialog.samba_user" :label="$t('samba user')" inset color="primary" />
        </form>
      </v-card-text>
      <v-card-actions>
        <v-row class="d-flex justify-end">
          <v-btn text @click="changeDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" @click="changeUser(changeDialog.user)">
            {{ $t('save') }}
          </v-btn>
        </v-row>
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
import { useI18n } from 'vue-i18n';

const showPassword = ref(false);
const emit = defineEmits(['refresh-drawer']);
const users = ref([]);
const { t } = useI18n();
const overlay = ref(false);
const deleteDialog = reactive({
  value: false,
  user: null
});
const changeDialog = reactive({
  value: false,
  user: null,
  password: '',
  role: '',
  samba_user: false
});
const newUser = ref({
  username: '',
  password: '',
  role: 'user',
  samba_user: false
});

const openDeleteDialog = (user) => {
  deleteDialog.value = true;
  deleteDialog.user = user;
};
const openChangeDialog = (user) => {
  changeDialog.value = true;
  changeDialog.user = user;
  changeDialog.password = '';
  changeDialog.role = user.role;
  changeDialog.samba_user = user.samba_user;
};

const getUsers = async () => {
  try {
    const res = await fetch('/api/v1/auth/users', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to load users'));
    }

    users.value = await res.json();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const addUser = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/auth/users', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value)

    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to create user'));
    }

    showSnackbarSuccess(t('User successfully created'));
    newUser.value = { username: '', role: 'user', password: '' };
    getUsers();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const deleteUser = async (user) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to delete user'));
    }

    showSnackbarSuccess(t('User successfully deleted'));
    deleteDialog.value = false;
    getUsers();

  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeUser = async () => {
  const userData = {
    username: changeDialog.user.username,
    password: changeDialog.password,
    role: changeDialog.role,
    samba_user: changeDialog.samba_user
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${changeDialog.user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to update user'));
    }

    showSnackbarSuccess(t('User successfully updated'));
    changeDialog.value = false;
    getUsers();

  } catch (e) {
    showSnackbarError(e.message);
  }

};

onMounted(() => {
  getUsers();
});

</script>