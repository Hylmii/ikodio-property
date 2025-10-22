import { CoreApi, Snap } from 'midtrans-client';

// Initialize Snap API
export const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Initialize Core API (for checking transaction status)
export const coreApi = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export interface MidtransTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export async function createMidtransTransaction(params: MidtransTransactionParams) {
  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      first_name: params.customerDetails.firstName,
      email: params.customerDetails.email,
      phone: params.customerDetails.phone || '',
    },
    item_details: params.itemDetails,
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.APP_URL}/bookings/${params.orderId}/payment`,
      error: `${process.env.APP_URL}/bookings/${params.orderId}/payment`,
      pending: `${process.env.APP_URL}/bookings/${params.orderId}/payment`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error: any) {
    console.error('Midtrans create transaction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment transaction',
    };
  }
}

export async function checkTransactionStatus(orderId: string) {
  try {
    const status = await coreApi.transaction.status(orderId);
    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    console.error('Midtrans check status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check transaction status',
    };
  }
}
