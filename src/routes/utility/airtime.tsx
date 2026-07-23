import { createFileRoute } from '@tanstack/react-router'
import MobileAirtimeHub from '@/features/utility-dashboard/mobile-airtime/pages/MobileAirtimeHub'

// 3.5 — Mobile Money & Airtime Hub (named route wins over /utility/$module; nav key = 'airtime').
export const Route = createFileRoute('/utility/airtime')({ component: MobileAirtimeHub })
