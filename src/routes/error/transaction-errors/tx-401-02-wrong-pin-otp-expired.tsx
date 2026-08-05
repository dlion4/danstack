import { createFileRoute } from '@tanstack/react-router';
import { Tx40102WrongPinOtpExpired } from '../../../features/errors/components/Tx40102WrongPinOtpExpired';

export const Route = createFileRoute('/error/transaction-errors/tx-401-02-wrong-pin-otp-expired')({
	component: Tx40102WrongPinOtpExpired,
});
