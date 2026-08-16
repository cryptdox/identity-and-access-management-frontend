import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes.config'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
