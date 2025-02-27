interface InvoiceEmailTemplateData {
  name: string;
  invoiceNumber: any;
  totalAmount: string;
  dueDate: string;
  totalOrder: string;
  invoiceUrl?: string;
}


const invoiceEmailHtmlContent = (data: InvoiceEmailTemplateData): string => `
  <html>
    <head>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .invoice-details {
          background-color: #f7f9fc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .invoice-details p {
          font-size: 16px;
          margin: 5px 0;
        }
        .invoice-link {
          display: inline-block;
          padding: 12px 20px;
          margin-top: 20px;
          font-size: 16px;
          color: #ffffff !important;
          background-color: #007bff;
          border-radius: 5px;
          text-decoration: none;
          text-align: center;
        }
        .invoice-link:hover {
          background-color: #0056b3;
        }
        .footer {
          padding: 20px;
          text-align: center;
          background-color: #f7f9fc;
          color: #999999;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          font-size: 14px;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src=src="${process.env.LOGO_URL}" alt="Company Logo">
        </div>
        <div class="content">
          <h2>Invoice Notification</h2>
          <p>Dear ${data.name},</p>
          <p>We have generated a new invoice for you. Please find the details below:</p>
          <div class="invoice-details">
            <p><strong>Invoice ID:</strong> #${data.invoiceNumber}</p>
            <p><strong>Total Order:</strong> ${data.totalOrder}</p>
            <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
            <p><strong>Date:</strong> ${data.dueDate}</p>
          </div> 
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_DOMAIN_LINK}/dashboard/invoice-order" class="invoice-link">View Invoice</a>
          </p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

export { invoiceEmailHtmlContent };
