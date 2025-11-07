// composables/snackbar.js
import { ref, h } from 'vue'
import { toast } from 'vue-sonner'
import { VIcon } from 'vuetify/components'

/**
 * @typedef {'top left'|'top center'|'top right'|'bottom left'|'bottom center'|'bottom right'} SnackbarPosition
 * @typedef {'success'|'error'|'warning'|'info'|string} SnackbarColor
 */

const snackbar = ref(false)
const snackbarPosition = ref('bottom center')

export function showSnackbarSuccess(
  text,
  icon = 'mdi-check-circle',
  position = 'bottom center',
  duration = 3000
) {
  snackbar.value = true
  snackbarPosition.value = position

  toast.success(text, { duration, icon: h(VIcon, { icon }) })
}

export function showSnackbarError(
  text,
  errorText = '',
  icon = 'mdi-alert-circle',
  position = 'bottom center',
  durationWhenNoDetails = 3000
) {
  snackbarPosition.value = position

  toast.error(text, {
    description: errorText || undefined,
    duration: errorText ? Infinity : durationWhenNoDetails,
    icon: h(VIcon, { icon }),
    cancel: { label: 'Close' },
  })
}

export function showSnackbarInfo(
  text,
  icon = 'mdi-information',
  position = 'bottom center',
  duration = 3000
) {
  snackbar.value = true
  snackbarPosition.value = position

  toast.info(text, { duration, icon: h(VIcon, { icon }) })
}

export function showSnackbarWarning(
  text,
  icon = 'mdi-alert-circle',
  position = 'bottom center',
  duration = 3000
) {
  snackbar.value = true
  snackbarPosition.value = position

  toast.warning(text, { duration, icon: h(VIcon, { icon }) })
}

export function useSnackbar() {
  return {
    snackbarPosition,
  }
}
