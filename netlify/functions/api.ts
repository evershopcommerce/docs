import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();
api.use(express.json());
const router = Router();
router.post("/contact", async (req, res) => {
  function escapeHTML(str) {
    const escapeChars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return str.replace(/[&<>"']/g, function (match) {
      return escapeChars[match];
    });
  }
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      res.json({
        status: "error",
        message: "Internal server error. Please try again later.",
      });
      return;
    }
    // Check if the API keys are set
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;
    const from = process.env.MAILJET_FROM_EMAIL;

    if (!apiKey || !apiSecret || !from) {
      res.json({
        status: "error",
        message: "Internal server error. Please try again later..",
      });
      return;
    }
    const escapedName = escapeHTML(name);
    const escapedMessage = escapeHTML(message);
    // Send email to customer
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">The sales intelligence platform that helps you uncover qualified leads.<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
  </div>

  <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px">
      <tbody>
        <tr style="width:100%">
          <td><img alt="EverShop" width="50" height="50" src="https://evershop.io/img/logo.png" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" width="170" />
            <p style="font-size:16px;line-height:26px;margin:16px 0">Hi team,</p>
            <p style="font-size:16px;line-height:26px;margin:16px 0">We got a message from ${escapedName}. Here&#x27;s what <!-- -->${escapedName}<!-- --> wrote:</p>
			<p style="font-size:18px;line-height:1.4;margin:16px 0;color:#484848;padding:24px;background-color:#f2f3f3;border-radius:4px">“${escapedMessage}”</p>
            <p style="font-size:16px;line-height:26px;margin:16px 0">Best,<br />The EverShop team</p>
            <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#cccccc;margin:20px 0" />
            <p style="font-size:12px;line-height:24px;margin:16px 0;color:#8898aa">1111B S Governors Ave STE 28897, Dover, DE 19904</p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>

</html>`;
    const msg = {
      Messages: [
        {
          From: {
            Email: from,
            Name: "The EverShop Team",
          },
          To: [
            {
              Email: "support@evershop.io",
              Name: "The EverShop Team",
            },
          ],
          ReplyTo: {
            Email: email,
            Name: escapedName,
          },
          Subject: `New contact message from ${escapedName}`,
          HTMLPart: html,
        },
      ],
    };
    // Using native fetch from Node.js to call Mailjet API
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(msg),
    });
    // Check if the response is successful
    if (response.status === 200) {
      res.json({
        status: "success",
        message: "Message sent successfully.",
      });
    } else {
      console.log(response);
      res.json({
        status: "error",
        message: "Internal server error. Please try again later...",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
});

api.use("/api/", router);

export const handler = serverless(api);
