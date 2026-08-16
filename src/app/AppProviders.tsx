import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/app/store'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nSync } from '@/i18n/I18nSync'
import { AuthBootstrap } from '@/app/AuthBootstrap'
import { ToastContainerSetup } from '@/common/components/feedback/ToastContainerSetup'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <I18nSync />
          <AuthBootstrap>{children}</AuthBootstrap>
          <ToastContainerSetup />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}
