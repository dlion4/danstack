import { createFileRoute } from '@tanstack/react-router'
import SettingsAutomation from '@/features/utility-dashboard/settings-automation/pages/SettingsAutomation'

// 3.6 — Utility Settings & Automation (named route wins over /utility/$module).
export const Route = createFileRoute('/utility/settings')({ component: SettingsAutomation })
