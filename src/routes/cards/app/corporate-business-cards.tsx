import { createFileRoute } from '@tanstack/react-router';
import CorporateBusinessCards from '#/features/card-dashboard/corporate-business-cards/pages/corporate-business-cards';

export const Route = createFileRoute('/cards/app/corporate-business-cards')({
  component: CorporateBusinessCards,
});