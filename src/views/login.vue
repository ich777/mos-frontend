<template>
    <v-container max-width="600">
        <v-spacer style="height: 20%;"></v-spacer>
        <v-col align="center" fluid>
            <v-img src="mos_black.png" alt="MOS Logo" max-width="150" contain />
            <v-spacer style="height: 50px;"></v-spacer>
            <v-col>
                <v-card variant="tonal" fluid>
                    <v-card-title>{{ $t('login') }}</v-card-title>
                    <v-card-text>
                        <form @submit.prevent="login">
                            <v-text-field v-model="username" label="Username" @keyup.enter="login" />
                            <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Password"
                                @keyup.enter="login" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword = !showPassword" />
                            <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
                            <button type="submit" style="display:none"></button>
                        </form>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" variant="outlined" @click="login" style="min-width: 200px;">{{
                            $t('login') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify';

const { locale, t } = useI18n();
const theme = useTheme();
const username = ref('')
const password = ref('')
const error = ref('')
const emit = defineEmits(['refresh-drawer', 'login-success']);
const showPassword = ref(false);

async function login() {
    try {
        const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username.value, password: password.value })
        });

        // Überprüfe, ob die Antwort erfolgreich war
        if (!res.ok) throw new Error(`${t('login failed')}: ${res.status} ${res.statusText}`);

        // Response in JSON umwandeln
        const result = await res.json();

        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userid', result.user.id);
        theme.global.name.value = result.user.darkmode ? 'dark' : 'light';
        locale.value = result.user.language || 'en'
        theme.themes.value[theme.global.name.value].colors.primary = result.user.primary_color || '#1976D2';

        // Login erfolgreich
        error.value = '';
        emit('refresh-drawer');
        emit('login-success');
    } catch (e) {
        error.value = e.message;
    }

}

</script>