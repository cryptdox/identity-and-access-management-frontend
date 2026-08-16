import { toast } from 'react-toastify'

/** One house style for every toast in the app — components never call react-toastify
 * directly, so the visual style/duration can change in one place. */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
  }
}
