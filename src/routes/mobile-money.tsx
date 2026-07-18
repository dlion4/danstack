import { createFileRoute } from '@tanstack/react-router'
import MobileMoney from '../features/mobile-money/pages/MobileMoney'

export const Route = createFileRoute('/mobile-money')({
  component: MobileMoney,
})
