interface ResetEmailTemplateData {
  name: string;
  verifyCode: string;
  verifyExpire: number;
}

const emailHtmlContent = (data: ResetEmailTemplateData): string => `
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
           
          .content {
            padding: 30px;
            color: #333333;
          }
          .content h2 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .content p {
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .code {
            font-size: 24px;
            color: #007bff;
            font-weight: 700;
            text-align: center;
            margin: 20px 0;
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
          <div class="content">
           ${data}
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

export { emailHtmlContent };

// <p><a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/contact">Contact Support</a></p>