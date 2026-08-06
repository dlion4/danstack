import { createFileRoute } from '@tanstack/react-router';
import { Card40401DeliveryAddressInvalid } from '../../../features/errors/components/Card40401DeliveryAddressInvalid';

export const Route = createFileRoute('/error/card/card-404-01-delivery-address-invalid')({
	component: Card40401DeliveryAddressInvalid,
});
