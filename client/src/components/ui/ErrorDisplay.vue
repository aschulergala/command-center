<script setup lang="ts">
import { computed } from 'vue'
import { ErrorSeverity, ErrorCode } from '@/lib/errorHandler'

interface Props {
  /** Error message to display */
  message: string
  /** Error severity level */
  severity?: ErrorSeverity
  /** Suggested action for the user */
  action?: string
  /** Error code for technical reference */
  code?: ErrorCode
  /** Whether the error can be dismissed */
  dismissible?: boolean
  /** Whether to show the error code (dev mode only) */
  showCode?: boolean
  /** Whether to show the action as a button */
  actionAsButton?: boolean
  /** Action button text */
  actionButtonText?: string
  /** Compact mode - smaller padding and text */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  severity: ErrorSeverity.Error,
  dismissible: true,
  showCode: false,
  actionAsButton: false,
  actionButtonText: 'Try Again',
  compact: false,
})

const emit = defineEmits<{
  dismiss: []
  action: []
}>()

// Computed: icon based on severity
const icon = computed(() => {
  switch (props.severity) {
    case ErrorSeverity.Info:
      return 'info'
    case ErrorSeverity.Warning:
      return 'warning'
    case ErrorSeverity.Critical:
      return 'critical'
    default:
      return 'error'
  }
})

// Computed: styling based on severity
const containerClasses = computed(() => {
  const base = props.compact
    ? 'p-2 rounded-md'
    : 'p-3 rounded-lg'

  switch (props.severity) {
    case ErrorSeverity.Info:
      return `${base} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`
    case ErrorSeverity.Warning:
      return `${base} bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`
    case ErrorSeverity.Critical:
      return `${base} bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700`
    default:
      return `${base} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`
  }
})

// Computed: icon color based on severity
const iconClasses = computed(() => {
  const size = props.compact ? 'w-4 h-4' : 'w-5 h-5'

  switch (props.severity) {
    case ErrorSeverity.Info:
      return `${size} text-blue-500`
    case ErrorSeverity.Warning:
      return `${size} text-yellow-500`
    case ErrorSeverity.Critical:
      return `${size} text-red-600`
    default:
      return `${size} text-red-500`
  }
})

// Computed: text color based on severity
const textClasses = computed(() => {
  const size = props.compact ? 'text-xs' : 'text-sm'

  switch (props.severity) {
    case ErrorSeverity.Info:
      return `${size} text-blue-700 dark:text-blue-300`
    case ErrorSeverity.Warning:
      return `${size} text-yellow-700 dark:text-yellow-300`
    case ErrorSeverity.Critical:
      return `${size} text-red-800 dark:text-red-200`
    default:
      return `${size} text-red-700 dark:text-red-300`
  }
})

// Computed: action text color
const actionTextClasses = computed(() => {
  const size = props.compact ? 'text-xs' : 'text-sm'

  switch (props.severity) {
    case ErrorSeverity.Info:
      return `${size} text-blue-600 dark:text-blue-400`
    case ErrorSeverity.Warning:
      return `${size} text-yellow-600 dark:text-yellow-400`
    default:
      return `${size} text-red-600 dark:text-red-400`
  }
})

function handleDismiss() {
  emit('dismiss')
}

function handleAction() {
  emit('action')
}
</script>

<template>
  <div
    :class="containerClasses"
    role="alert"
    aria-live="assertive"
  >
    <div class="flex items-start gap-2">
      <!-- Icon -->
      <div :class="['flex-shrink-0', compact ? 'mt-0' : 'mt-0.5']">
        <!-- Info icon -->
        <svg
          v-if="icon === 'info'"
          :class="iconClasses"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <!-- Warning icon -->
        <svg
          v-else-if="icon === 'warning'"
          :class="iconClasses"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <!-- Critical/Error icon -->
        <svg
          v-else
          :class="iconClasses"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Message -->
        <p :class="textClasses">
          {{ message }}
        </p>

        <!-- Action text or button -->
        <template v-if="action">
          <button
            v-if="actionAsButton"
            :class="[
              'mt-2 font-medium underline hover:no-underline focus:outline-none',
              actionTextClasses
            ]"
            @click="handleAction"
          >
            {{ actionButtonText }}
          </button>
          <p
            v-else
            :class="['mt-1', actionTextClasses]"
          >
            {{ action }}
          </p>
        </template>

        <!-- Error code (dev mode) -->
        <p
          v-if="showCode && code !== undefined"
          :class="['mt-1 font-mono opacity-60', compact ? 'text-[10px]' : 'text-xs']"
        >
          Code: {{ code }}
        </p>
      </div>

      <!-- Dismiss button -->
      <button
        v-if="dismissible"
        type="button"
        :class="[
          'flex-shrink-0 rounded p-1 -mr-1 -mt-1 transition-colors',
          'hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
          severity === ErrorSeverity.Info ? 'focus:ring-blue-500' : '',
          severity === ErrorSeverity.Warning ? 'focus:ring-yellow-500' : '',
          severity === ErrorSeverity.Error || severity === ErrorSeverity.Critical ? 'focus:ring-red-500' : '',
        ]"
        aria-label="Dismiss"
        @click="handleDismiss"
      >
        <svg
          :class="[iconClasses, 'opacity-60 hover:opacity-100']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
