import { createFileRoute } from '@tanstack/react-router'
import Settlement from '../features/settlement/pages/Settlement'

export const Route = createFileRoute('/settlement')({
  component: Settlement,
})
