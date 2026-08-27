import axios from 'axios';

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

const getMpesaShortcode = () => {
  return process.env.MPESA_SHORTCODE || '174379';
};

const getBaseUrl = () => {
  return MPESA_ENV.toLowerCase() === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

// Helper: Format phone number to 2547XXXXXXXX or 2541XXXXXXXX
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters (including spaces, dashes, and the '+' sign)
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

// 1. Fetch OAuth Access Token
export const getMpesaToken = async (): Promise<string> => {
  if (MPESA_CONSUMER_KEY === 'mock_consumer_key' || !MPESA_CONSUMER_KEY) {
    console.log('Using mock M-Pesa token due to default/missing keys.');
    return 'mock_access_token';
  }

  const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000, // 10 second timeout
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error fetching M-Pesa OAuth token:', error.response?.data || error.message);
    throw new Error('Failed to generate M-Pesa access token. Safaricom API might be down or credentials invalid.');
  }
};

// 2. Initiate STK Push
export const initiateStkPush = async (
  phoneNumber: string,
  amount: number,
  reference: string,
  description: string
): Promise<{ checkoutRequestId: string; responseCode: string; customerMessage: string }> => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const token = await getMpesaToken();

  if (token === 'mock_access_token') {
    // Return mock success response for local/testing convenience
    const mockCheckoutId = `ws_CO_${Math.floor(Math.random() * 10000000)}`;
    console.log(`[M-PESA MOCK] Initiating STK push for ${formattedPhone}, amount: KES ${amount}, checkout ID: ${mockCheckoutId}`);
    return {
      checkoutRequestId: mockCheckoutId,
      responseCode: '0',
      customerMessage: 'Success. Request accepted for processing (Mock Mode).',
    };
  }

  const storeNumber = getMpesaShortcode();
  const tillNumber = process.env.MPESA_TILL_NUMBER || storeNumber;
  // Some tills actually require PayBill logic for STK push. We allow override.
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || 'CustomerBuyGoodsOnline';
  
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  const password = Buffer.from(
    `${storeNumber}${MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const url = `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`;
  const body = {
    BusinessShortCode: storeNumber,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: tillNumber,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: reference,
    TransactionDesc: description,
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000, // 15 second timeout for STK push
    });

    return {
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error: any) {
    console.error('Error initiating M-Pesa STK push:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate STK push via M-Pesa. Safaricom API might be unreachable.');
  }
};
