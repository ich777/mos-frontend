<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2>{{ $t('users') }}</h2>
      </v-container>
      <v-card>
        <v-list class="bg-transparent">
          <template v-for="(user, idx) in users" :key="user.id">
            <v-list-item>
              <v-list-item-title>
                {{ user.username }}
                <v-chip v-if="user.samba_user" color="onPrimary" size="small" class="ml-2" label>
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
                    <v-btn variant="text" icon v-bind="props" color="onPrimary">
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
            <v-divider v-if="idx < users.length - 1" />
          </template>
        </v-list>
      </v-card>
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
          <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="red" @click="deleteUser(deleteDialog.user)">
            {{ $t('delete') }}
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="addDialog.value" max-width="400">
    <v-card>
      <v-card-title>{{ $t('add user') }}</v-card-title>
      <v-card-text>
        <form @submit.prevent="addUser()">
          <v-text-field
            v-model="addDialog.username"
            :label="$t('username')"
            :error="addDialog.submitted && addDialog.username === ''"
            :error-messages="addDialog.submitted && addDialog.username === '' ? [$t('this field is required')] : []"
            required
          />
          <v-text-field
            v-model="addDialog.password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('password')"
            :error="addDialog.submitted && addDialog.password === ''"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :error-messages="addDialog.submitted && addDialog.password === '' ? [$t('this field is required')] : []"
            required
          />
          <v-text-field
            v-model="addDialog.password2"
            :label="$t('confirm password')"
            required
            :type="showPassword ? 'text' : 'password'"
            :error="addDialog.submitted && addDialog.password2 === ''"
            :error-messages="
              addDialog.submitted ? (addDialog.password2 === '' ? [$t('this field is required')] : addDialog.password2 !== addDialog.password ? [$t('password is not the same')] : []) : []
            "
          />
          <v-select
            v-model="addDialog.role"
            :items="['admin', 'user', 'samba_only']"
            :label="$t('role')"
            required
            @update:modelValue="
              (val) => {
                addDialog.role = val;
                if (val === 'samba_only') addDialog.samba_user = true;
              }
            "
          />
          <v-switch v-model="addDialog.samba_user" :label="$t('samba user')" inset color="onPrimary" />
        </form>
      </v-card-text>
      <v-card-actions>
        <v-row class="d-flex justify-end">
          <v-btn color="onPrimary" @click="addDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="onPrimary" @click="onAddSubmit">
            {{ $t('save') }}
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
          <v-text-field
            v-model="changeDialog.password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('password')"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :required="changeDialog.samba_user"
          />
          <v-select v-model="changeDialog.role" :items="['admin', 'user', 'samba_only']" :label="$t('role')" required />
          <v-switch v-model="changeDialog.samba_user" :label="$t('samba user')" inset color="onPrimary" />
        </form>
      </v-card-text>
      <v-card-actions>
        <v-row class="d-flex justify-end">
          <v-btn color="onPrimary" @click="changeDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="onPrimary" @click="changeUser(changeDialog.user)">
            {{ $t('save') }}
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon @click="openAddDialog()">
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { fi } from 'vuetify/locale';

const showPassword = ref(false);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const users = ref([]);
const { t } = useI18n();
const overlay = ref(false);
const deleteDialog = reactive({
  value: false,
  user: null,
});
const changeDialog = reactive({
  value: false,
  user: null,
  password: '',
  role: '',
  samba_user: false,
});
const addDialog = reactive({
  value: false,
  submitted: false,
  username: '',
  password: '',
  password2: '',
  role: '',
  samba_user: false,
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
const openAddDialog = () => {
  addDialog.value = true;
  addDialog.username = '';
  addDialog.password = '';
  addDialog.role = 'user';
  addDialog.samba_user = false;
  addDialog.submitted = false;
};

const getUsers = async () => {
  try {
    const res = await fetch('/api/v1/auth/users', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to load users'));
    }

    users.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const addUser = async () => {
  addDialog.value = false;
  addDialog.submitted = false;

  const newUser = {
    username: addDialog.username,
    password: addDialog.password,
    role: addDialog.role,
    samba_user: addDialog.samba_user,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/auth/users', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to create user')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('user successfully created'));
    getUsers();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteUser = async (user) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to delete user'));
    }

    showSnackbarSuccess(t('user successfully deleted'));
    getUsers();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const changeUser = async () => {
  changeDialog.value = false;
  const userData = {
    username: changeDialog.user.username,
    password: changeDialog.password,
    role: changeDialog.role,
    samba_user: changeDialog.samba_user,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${changeDialog.user.id}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to update user'));
    }

    showSnackbarSuccess(t('user successfully updated'));
    getUsers();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const onAddSubmit = () => {
  addDialog.submitted = true;
  if (addDialog.username === '' || addDialog.password === '' || addDialog.password2 === '' || addDialog.role === '') {
    return;
  }
  if (addDialog.password !== addDialog.password2) {
    return;
  }
  addUser();
};

onMounted(() => {
  getUsers();
});
</script>
