<template>
    <v-container fluid class="d-flex justify-center">
        <v-container style="width: 100%; max-width: 1920px;" class="pa-0">
            <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
                <h2>{{ $t('webterminal') }}</h2>
            </v-container>
            <div id="terminal" style="width: 100%; height: 420px; padding: 8px; background: #000000;"></div>
        </v-container>
    </v-container>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Terminal } from '@xterm/xterm'
import { io } from "socket.io-client"
import { showSnackbarError } from '@/composables/snackbar'
import { useI18n } from 'vue-i18n'
import '@xterm/xterm/css/xterm.css'

const emit = defineEmits(['refresh-drawer']);
const { t } = useI18n();
let socket
let term
const sessions = ref([])

onMounted(async () => {
    await checkExistingTerminals();
    if (sessions.value.length === 0) {
        await createTerminalSession();
    }

    term = new Terminal({ cursorBlink: true })
    term.open(document.getElementById('terminal'))

    socket = io(window.location.hostname + '/terminal', { path: '/api/v1/socket.io/' });

    // Session-Infos senden
    socket.emit('join-session', {
        sessionId: sessions.value[0].sessionId,
        token: localStorage.getItem('authToken')
    });

    socket.on('connect', () => {
        term.write(t('connection to mos terminal established') + '\r\n');
        socket.emit('terminal-input', '\n');
    });

    // Terminal-Output anzeigen
    socket.on('terminal-output', (data) => {
        term.write(data);
    });

    // Input an Server schicken
    term.onData(data => {
        socket.emit('terminal-input', data);
    });

    term.onResize(({ cols, rows }) => {
        socket.emit('resize', { cols, rows });
    });

    // Fehler/Disconnect abfangen
    socket.on('disconnect', () => {
        term.write(t('connection closed') + '\r\n')
    });
})

onBeforeUnmount(() => {
    if (socket) socket.disconnect()
    if (term) term.dispose()
})

const createTerminalSession = async () => {
    try {
        const res = await fetch('/api/v1/terminal/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || t('failed to create terminal session'));
        }

        const Result = await res.json();
        sessions.value.push(Result);

    } catch (e) {
        showSnackbarError(e.message);
    }
}

const checkExistingTerminals = async () => {
    try {
        const res = await fetch(`/api/v1/terminal/sessions`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || t('failed to retrieve terminal sessions'));
        }

        const Result = await res.json();
        sessions.value = Result.sessions || [];
        sessions.value = sessions.value.filter(session => session.command === '/bin/bash');

    } catch (e) {
        showSnackbarError(e.message);
    }
}
</script>
