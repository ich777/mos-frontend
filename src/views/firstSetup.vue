<template>
  <v-container>
    <v-stepper :items="[$t('root password'), $t('web login')]" v-model="step" hide-actions>
      <template v-slot:item.1>
        <v-card :title="$t('root password')" flat>
          <v-card-text>
            <v-text-field
              v-model="rootpwd"
              :label="$t('root password')"
              required
              type="password"
              :error="rootpwd === '' && step1Error"
              :error-messages="rootpwd === '' && step1Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="rootpwd2"
              :label="$t('confirm root password')"
              required
              type="password"
              :error="rootpwd2 === '' && step1Error"
              :error-messages="rootpwd2 === '' && step1Error ? [$t('this field is required')] : rootpwd2 !== rootpwd && step1Error ? [$t('password is not the same')] : []"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card :title="$t('web login')" flat>
          <v-card-text>
            <v-text-field
              v-model="username"
              :label="$t('username')"
              required
              :error="username === '' && step1Error"
              :error-messages="username === '' && step2Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="password"
              :label="$t('web password')"
              required
              type="password"
              :error="password === '' && step2Error"
              :error-messages="password === '' && step2Error ? [$t('this field is required')] : []"
            ></v-text-field>
            <v-text-field
              v-model="password2"
              :label="$t('web password')"
              required
              type="password"
              :error="password2 === '' && step2Error"
              :error-messages="password2 === '' && step2Error ? [$t('this field is required')] : password2 !== password && step2Error ? [$t('password is not the same')] : []"
            ></v-text-field>
            <v-switch v-model="sambaUser" :label="$t('samba user')" inset color="green" />
          </v-card-text>
        </v-card>
      </template>

      <v-stepper-actions :disabled="false" :next-text="step > 1 ? 'finish' : 'next'" :prev-text="step > 1 ? 'back' : ''" @click:next="nextStep()" @click:prev="step = step - 1"></v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const overlay = ref(false);
const emit = defineEmits(['setup-complete']);
const props = defineProps({
  token: String,
});
const username = ref('');
const rootpwd = ref('');
const rootpwd2 = ref('');
const password = ref('');
const password2 = ref('');
const sambaUser = ref(true);
let step = ref(1);
const step1Error = ref(false);
const step2Error = ref(false);

const addUser = async () => {
  const newUser = {
    username: username.value,
    password: password.value,
    samba_user: sambaUser.value,
    role: 'admin',
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/auth/users', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('Failed to create user'));
    }
    return true;
  } catch (e) {
    throw e;
  }
};

const setRootPassword = async () => {
  const newRootPwd = {
    password: rootpwd.value,
  };

  try {
    const res = await fetch('/api/v1/users/root', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRootPwd),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to set root password'));
    }
    return true;
  } catch (e) {
    throw e;
  }
};

async function nextStep() {
  // Root password step
  if (step.value === 1 && (rootpwd.value === '' || rootpwd2.value === '' || rootpwd.value !== rootpwd2.value)) {
    step1Error.value = true;
    return;
  } else {
    if (step.value === 1) {
      overlay.value = true;
      try {
        await setRootPassword();
        overlay.value = false;
      } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
        step1Error.value = true;
        return;
      }
    }
    step1Error.value = false;
  }

  // Web user step
  if (step.value === 2 && (username.value === '' || password.value === '' || password.value !== password2.value)) {
    step2Error.value = true;
    return;
  } else {
    step2Error.value = false;
    if (step.value === 2) {
      overlay.value = true;
      try {
        await addUser();
      } catch (e) {
        overlay.value = false;
        showSnackbarError(e.message);
        step2Error.value = true;
        return;
      }
      showSnackbarSuccess(t('first setup successfully completed'));
      emit('setup-complete');
    }
  }

  step.value = step.value + 1;
}
</script>
