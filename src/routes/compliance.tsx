import { createFileRoute } from '@tanstack/react-router'
import Compliance from '../features/compliance/pages/Compliance'

export const Route = createFileRoute('/compliance')({
  component: Compliance,
})
