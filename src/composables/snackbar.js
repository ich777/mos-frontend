import { ref } from 'vue'

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('')
const snackbarIcon = ref('')

export function showSnackbarSuccess(text) {
  snackbarText.value = text
  snackbarColor.value = 'success'
  snackbar.value = true
  snackbarIcon.value = 'mdi-success'
}

export function showSnackbarError(text) {
  snackbarText.value = text
  snackbarColor.value = 'error'
  snackbar.value = true
  snackbarIcon.value = 'mdi-error'
}

export function useSnackbar() {
  return {
    snackbar,
    snackbarText,
    snackbarColor,
    snackbarIcon
  }
}