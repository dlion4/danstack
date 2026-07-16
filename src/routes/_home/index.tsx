import { createFileRoute } from '@tanstack/react-router'
import Homepage from '../../features/home/pages/Home'

export const Route = createFileRoute('/_home/')({ component: Homepage })
