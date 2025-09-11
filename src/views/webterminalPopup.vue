<template>
    <div id="terminal" style="width: 100vw; height: 100vh; padding: 8px; background: #000000;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from '@xterm/xterm'
import { io } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'
import { useI18n } from 'vue-i18n'

let socket, term
const emit = defineEmits(['refresh-drawer']);
const { t } = useI18n()

onMounted(() => {
  term = new Terminal({ cursorBlink: true, fontSize: 15 })
  term.open(document.getElementById('terminal'))
  term.focus()

  socket = io(window.location.hostname + '/api/v1/terminal', { path: '/socket.io/' });

  socket.on('connect', () => {
    term.write(t('connection to mos terminal established') + '\r\n');
    socket.emit('terminal-input', '\n');
  });

  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('sessionId')
  // Session-Infos senden (hier als Beispiel deine Werte!)
  socket.emit('join-session', {
    sessionId: sessionId,
    token: localStorage.getItem('authToken')
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
</script>
