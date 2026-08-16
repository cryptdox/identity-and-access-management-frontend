import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from '@/theme/ThemeProvider'

export function ToastContainerSetup() {
  const { mode } = useTheme()
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme={mode}
    />
  )
}
