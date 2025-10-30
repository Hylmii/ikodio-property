'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PaymentDialog } from '@/components/Payment/PaymentDialog';
import { BookingSummary } from '@/components/Payment/BookingSummary';
import { PaymentDeadlineWarning, PaymentConfirmationStatus } from '@/components/Payment/PaymentStatusCards';
import { PaymentActions } from '@/components/Payment/PaymentActions';
import { LoadingState, NotFoundState, SuccessState, ExpiredState } from '@/components/Payment/PaymentPageStates';
import { usePaymentPage } from '@/hooks/usePaymentPage';

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.id as string;
  
  const {
    booking,
    isLoading,
    timeLeft,
    isExpired,
    isUploading,
    handleManualUpload,
    handlePaymentSuccess,
    router,
  } = usePaymentPage(bookingId);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!booking) return <NotFoundState />;

  if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
    return <SuccessState onViewTransactions={() => router.push('/transactions')} />;
  }

  if (isExpired || booking.status === 'CANCELLED') {
    return <ExpiredState onSearchProperties={() => router.push('/properties')} />;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <BookingSummary booking={booking} />

          {booking.status === 'WAITING_PAYMENT' && (
            <PaymentDeadlineWarning timeLeft={timeLeft} />
          )}

          {booking.status === 'WAITING_CONFIRMATION' && booking.paymentProof && (
            <PaymentConfirmationStatus />
          )}
        </div>

        <div className="space-y-4">
          <PaymentActions
            booking={booking}
            isExpired={isExpired}
            onPayClick={() => setShowPaymentDialog(true)}
            onBackClick={() => router.push('/transactions')}
          />
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        bookingId={bookingId}
        amount={booking.totalPrice}
        onPaymentSuccess={handlePaymentSuccess}
        onManualUpload={handleManualUpload}
        isUploading={isUploading}
      />
    </div>
  );
}