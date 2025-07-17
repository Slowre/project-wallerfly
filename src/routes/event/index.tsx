import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/event/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/event/"!</div>
}
