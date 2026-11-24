import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();
api.use(express.json());
const router = Router();

// Spam protection for the contact form. Bots post straight to this endpoint,
// so the browser checks in the form do not stop them. Two checks need the
// form's own page:
//  - `website_url` is a trap field. People never see it (it is hidden off
//    screen), but bots fill every field they find.
//  - `elapsed` is how many milliseconds the form was open. The form sends it,
//    and bots that post only name, email and message do not.
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
// Loading the page, typing a message and pressing Submit takes longer.
const MIN_FILL_MS = 3000;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

type ContactCheck =
  | { ok: true; name: string; email: string; message: string }
  | { ok: false; reason: string; silent?: boolean };

function checkContact(body: any): ContactCheck {
  const { name, email, message, website_url, elapsed } = body || {};

  // The trap field is filled: a bot. Answer "success" (see `silent`) so it
  // does not learn that it was caught.
  if (website_url !== undefined && website_url !== "") {
    return { ok: false, reason: "trap-field", silent: true };
  }
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return { ok: false, reason: "not-text" };
  }
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();
  if (!cleanName || !cleanEmail || !cleanMessage) {
    return { ok: false, reason: "empty-field" };
  }
  if (
    cleanName.length > MAX_NAME ||
    cleanEmail.length > MAX_EMAIL ||
    cleanMessage.length > MAX_MESSAGE
  ) {
    return { ok: false, reason: "too-long" };
  }
  // The name goes into the email subject, so it must stay on one line.
  if (/[\r\n]/.test(cleanName)) {
    return { ok: false, reason: "new-line-in-name" };
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return { ok: false, reason: "bad-email" };
  }
  if (typeof elapsed !== "number" || !Number.isFinite(elapsed)) {
    return { ok: false, reason: "no-timer" };
  }
  if (elapsed < MIN_FILL_MS) {
    return { ok: false, reason: "too-fast" };
  }
  return { ok: true, name: cleanName, email: cleanEmail, message: cleanMessage };
}

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
    const check = checkContact(req.body);
    if (check.ok === false) {
      // Only the reason is logged, never what the visitor wrote.
      console.log(`contact: blocked (${check.reason})`);
      if (check.silent) {
        res.json({ status: "success", message: "Message sent successfully." });
      } else {
        res.status(400).json({
          status: "error",
          message: "Please check the form and try again.",
        });
      }
      return;
    }
    const { name, email, message } = check;
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
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${escapedName}<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
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
