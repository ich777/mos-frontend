<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <v-row>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon @click="$router.back()" class="mr-2">mdi-arrow-left</v-icon>
          </v-col>
          <v-col>
            <h2>{{ $t('tools') }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <div id="terminal" style="width: 100%; height: 420px; padding: 8px; background: #000000"></div>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { io } from 'socket.io-client';
import { showSnackbarError } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import '@xterm/xterm/css/xterm.css';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
let socket;
let term;
const sessions = ref([]);

onMounted(async () => {
  await checkExistingTerminals();
  if (sessions.value.length === 0) {
    await createTerminalSession();
  }

  term = new Terminal({ cursorBlink: true, fontFamily: 'monospace', fontSize: 14 });
  term.open(document.getElementById('terminal'));

  // Websocket connection through proxy
  socket = io('/terminal', { path: '/api/v1/socket.io/' });

  socket.on('connect', () => {
    // Session-Infos senden
    socket.emit('join-session', {
      sessionId: sessions.value[0].sessionId,
      token: localStorage.getItem('authToken'),
    });
  });

  // Wait for join confirmation
  socket.on('session-joined', (data) => {
    term.write(t('connection to mos terminal established') + '\r\n');
    // Trigger initial prompt
    socket.emit('terminal-input', '\n');
  });

  // Display output
  socket.on('terminal-output', (data) => {
    term.write(data);
  });

  // Send input to Sevrer
  term.onData((data) => {
    socket.emit('terminal-input', data);
  });

  // Resize handling
  term.onResize(({ cols, rows }) => {
    socket.emit('terminal-resize', { cols, rows });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Terminal WebSocket error:', error);
    showSnackbarError(error.message || 'Terminal connection error');
  });

  // Catch disconnect
  socket.on('disconnect', () => {
    term.write('\r\n' + t('connection closed') + '\r\n');
  });
});

onBeforeUnmount(() => {
  if (socket) {
    socket.emit('leave-session');
    socket.disconnect();
  }
  if (term) term.dispose();
});

const createTerminalSession = async () => {
  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
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
};

const checkExistingTerminals = async () => {
  try {
    const res = await fetch(`/api/v1/terminal/sessions`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('failed to retrieve terminal sessions'));
    }

    const Result = await res.json();
    sessions.value = Result.sessions || [];
    sessions.value = sessions.value.filter((session) => session.command === '/bin/bash');
  } catch (e) {
    showSnackbarError(e.message);
  }
};
</script>
