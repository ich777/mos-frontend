import { ref } from 'vue'

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('')
const snackbarIcon = ref('')
const snackbarApiError = ref('')
const snackbarShowErrorDetails = ref(false)

export function showSnackbarSuccess(text) {
  snackbarText.value = text
  snackbarColor.value = 'success'
  snackbar.value = true
  snackbarIcon.value = 'mdi-success'
  snackbarApiError.value = ''
  snackbarShowErrorDetails.value = false
}

export function showSnackbarError(text, errorText = '') {
  snackbarText.value = text
  snackbarColor.value = 'error'
  snackbar.value = true
  snackbarIcon.value = 'mdi-error'
  snackbarApiError.value = errorText
  snackbarShowErrorDetails.value = false
}

export function useSnackbar() {
  return {
    snackbar,
    snackbarText,
    snackbarColor,
    snackbarIcon,
    snackbarApiError,
    snackbarShowErrorDetails
  }
}