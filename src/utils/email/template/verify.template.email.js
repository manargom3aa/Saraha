export const verifyEmail = ({ otp, title = "Email Confirmation" } = {}) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body {
          background-color: #f7f7f7;
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .header {
          background-color: #630e2b;
          text-align: center;
          padding: 30px 20px;
        }
        .header img {
          width: 70px;
          height: 70px;
        }
        .title {
          text-align: center;
          font-size: 24px;
          margin: 30px 0 10px;
          color: #630e2b;
        }
        .otp-box {
          display: inline-block;
          background-color: #630e2b;
          color: #fff;
          font-size: 22px;
          letter-spacing: 4px;
          border-radius: 8px;
          padding: 15px 30px;
          margin: 20px 0;
        }
        .content {
          text-align: center;
          padding: 0 40px 40px;
          font-size: 16px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          background: #f3f3f3;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .footer h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .social-icons img {
          width: 40px;
          height: 40px;
          margin: 0 8px;
          transition: transform 0.3s ease;
        }
        .social-icons img:hover {
          transform: scale(1.1);
        }
        a {
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png" alt="Logo"/>
        </div>
        <h1 class="title">${title}</h1>
        <div class="content">
          <p>Please use the following code to confirm your email address:</p>
          <div class="otp-box">${otp}</div>
        </div>
        <div class="footer">
          <h3>Stay in touch</h3>
          <div class="social-icons">
            <a href="${process.env.facebookLink}">
              <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" alt="Facebook"/>
            </a>
            <a href="${process.env.instegram}">
              <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" alt="Instagram"/>
            </a>
            <a href="${process.env.twitterLink}">
              <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" alt="Twitter"/>
            </a>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};
