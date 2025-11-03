import { ref } from 'vue'

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('')
const snackbarIcon = ref('')
const snackbarApiError = ref('')
const snackbarShowErrorDetails = ref(false)
const snackbarPosition = ref('bottom center')

export function showSnackbarSuccess(text, icon = 'mdi-success', position = 'bottom center') {
  snackbarText.value = text
  snackbarColor.value = 'success'
  snackbar.value = true
  snackbarIcon.value = icon
  snackbarApiError.value = ''
  snackbarPosition.value = position
  snackbarShowErrorDetails.value = false
}

export function showSnackbarError(text, errorText = '', icon = 'mdi-error', position = 'bottom center') {
  snackbarText.value = text
  snackbarColor.value = 'error'
  snackbar.value = true
  snackbarIcon.value = icon
  snackbarApiError.value = errorText
  snackbarShowErrorDetails.value = false
  snackbarPosition.value = position
}

export function useSnackbar() {
  return {
    snackbar,
    snackbarText,
    snackbarColor,
    snackbarIcon,
    snackbarApiError,
    snackbarShowErrorDetails,
    snackbarPosition
  }
}