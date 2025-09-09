import Header from '@/components/Header'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Header />
      <div className="flex-1 p-7 md:p-16 justify-center">
        <Outlet />
      </div>
    </div>
  ),
})
