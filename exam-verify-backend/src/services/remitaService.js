import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';

class RemitaService {
  constructor() {
    this.merchantId = process.env.REMITA_MERCHANT_ID;
    this.apiKey = process.env.REMITA_PUBLIC_KEY;
    this.secretKey = process.env.REMITA_SECRET_KEY;
    this.baseUrl = process.env.REMITA_API_URL;
    this.serviceTypeId = process.env.REMITA_SERVICE_TYPE_ID;
  }

  generateHash(rrr) {
    const hashString = `${rrr}${this.apiKey}${this.merchantId}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  async generateRRR(orderData) {
    try {
      const { orderId, amount, payerName, payerEmail, payerPhone, description } = orderData;

      const payload = {
        serviceTypeId: this.serviceTypeId,
        amount: amount.toString(),
        orderId,
        payerName,
        payerEmail,
        payerPhone,
        description: description || 'Exam Registration Fee',
      };

      const hashString = `${this.merchantId}${this.serviceTypeId}${orderId}${amount}${this.apiKey}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      const response = await axios.post(
        `${this.baseUrl}/echannelsvc/merchant/api/paymentinit`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `remitaConsumerKey=${this.merchantId},remitaConsumerToken=${hash}`,
          },
        }
      );

      logger.info('RRR generated successfully:', response.data);

      return {
        success: true,
        rrr: response.data.RRR,
        orderId: response.data.orderId,
        statusMessage: response.data.statusMessage,
      };
    } catch (error) {
      logger.error('Remita RRR generation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.statusMessage || 'Failed to generate RRR',
      };
    }
  }

  async checkPaymentStatus(rrr) {
    try {
      const hash = this.generateHash(rrr);

      const response = await axios.post(
        `${this.baseUrl}/echannelsvc/merchant/api/paymentstatus`,
        {
          merchantId: this.merchantId,
          rrr,
          apiHash: hash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `remitaConsumerKey=${this.merchantId},remitaConsumerToken=${hash}`,
          },
        }
      );

      const { status, message, amount, transactiontime } = response.data;

      logger.info(`Payment status for RRR ${rrr}:`, response.data);

      const isSuccessful = status === '00' || status === '01';

      return {
        success: isSuccessful,
        status,
        message,
        amount: parseFloat(amount),
        transactionDate: transactiontime,
        rawData: response.data,
      };
    } catch (error) {
      logger.error('Remita payment status check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check payment status',
      };
    }
  }

  verifyWebhookSignature(data, signature) {
    const hashString = JSON.stringify(data) + this.secretKey;
    const expectedSignature = crypto.createHash('sha512').update(hashString).digest('hex');
    return expectedSignature === signature;
  }
}

export default new RemitaService();
