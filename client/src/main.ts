import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { logError, parseError, ErrorSeverity } from './lib/errorHandler'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

/**
 * Global error handler for Vue
 * Catches unhandled errors in components and logs them in development mode
 */
app.config.errorHandler = (err, _instance, info) => {
  // Parse the error to get structured information
  const parsed = parseError(err)

  // Log the error in development
  logError(`Vue:${info}`, err)

  // In production, you might want to send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorService(parsed)
    console.error('[App Error]', parsed.message)
  }

  // For critical errors, show a toast notification if store is available
  // Note: This is a fallback - components should handle their own errors
  if (parsed.severity === ErrorSeverity.Critical) {
    // Try to use the toast store if available
    try {
      // Dynamic import to avoid circular dependencies
      import('./stores/toasts').then(({ useToastsStore }) => {
        const toasts = useToastsStore()
        toasts.error(parsed.message, 'Application Error')
      }).catch(() => {
        // Silently fail if toast store isn't available
      })
    } catch {
      // Ignore errors when trying to show toast
    }
  }
}

/**
 * Global warning handler for Vue
 * Logs warnings in development mode
 */
app.config.warnHandler = (msg, _instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn(`[Vue Warning]: ${msg}`)
    if (trace) {
      console.warn('Component trace:', trace)
    }
  }
}

app.mount('#app')
