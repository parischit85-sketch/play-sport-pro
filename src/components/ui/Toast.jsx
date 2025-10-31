// Bridge module: re-export the advanced Toast system from common/Toast
export { default } from '../common/Toast.jsx';
export * from '../common/Toast.jsx';

// Legacy compatibility: some legacy code imports `{ toast }` and calls toast.success/error
// We provide a thin proxy to the global facade initialized by NotificationProvider
export const toast = {
  success: (message, duration, options) =>
    typeof window !== 'undefined' && window.__globalToast?.success?.(message, duration, options),
  error: (message, duration, options) =>
    typeof window !== 'undefined' && window.__globalToast?.error?.(message, duration, options),
  warning: (message, duration, options) =>
    typeof window !== 'undefined' && window.__globalToast?.warning?.(message, duration, options),
  info: (message, duration, options) =>
    typeof window !== 'undefined' && window.__globalToast?.info?.(message, duration, options),
  loading: (message, options) =>
    typeof window !== 'undefined' && window.__globalToast?.loading?.(message, options),
  promise: (promiseOrFunc, messages) =>
    typeof window !== 'undefined' && window.__globalToast?.promise?.(promiseOrFunc, messages),
  dismissAll: () => typeof window !== 'undefined' && window.__globalToast?.dismissAll?.(),
  show: (type, message, duration, options) =>
    typeof window !== 'undefined' && window.__globalToast?.show?.(type, message, duration, options),
};
