import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

type InviteEmail = {
  to: string;
  name: string;
  eventName: string;
  link: string;
  budget?: string | null;
  exchangeDate?: string | null;
  message?: string | null;
  reminder?: boolean;
};

type WishlistReadyEmail = {
  to: string;
  name: string;
  eventName: string;
  link: string;
  /** Only passed when the recipient has already unlocked their giftee. */
  gifteeName: string | null;
};

let transport: Transporter | null = null;

function getTransport() {
  if (!transport) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set to send emails.");
    transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  }
  return transport;
}

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Shared festive email layout. Table layout and inline styles only: many webmail clients
 * (Outlook, abv.bg, Yahoo, mail.bg) drop <div> styling or make styled <a> blocks unclickable.
 * The whole button cell is a link, and a plain clickable link sits underneath as a backup.
 * `bodyHtml` must already be escaped.
 */
function renderEmail(o: { subject: string; eventName: string; name: string; bodyHtml: string; buttonText: string; link: string }) {
  const link = esc(o.link);
  return `<!doctype html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6efe6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6efe6" style="background-color:#f6efe6">
  <tr><td align="center" style="padding:32px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:520px;background-color:#ffffff;border:1px solid #ead9c6">
      <tr><td align="center" bgcolor="#9b1c2a" style="background-color:#9b1c2a;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#fff6ee">
        <div style="font-size:40px;line-height:48px">🎁</div>
        <div style="font-size:24px;line-height:30px;font-weight:bold;color:#fff6ee">${esc(o.eventName)}</div>
      </td></tr>
      <tr><td style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#2a1d1d">
        <p style="margin:0 0 12px">Здравей, ${esc(o.name)}!</p>
        ${o.bodyHtml}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto">
          <tr><td align="center" bgcolor="#1f6b45" style="background-color:#1f6b45;border-radius:8px">
            <a href="${link}" target="_blank" rel="noopener" style="display:block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px">${esc(o.buttonText)}</a>
          </td></tr>
        </table>
        <p style="margin:0 0 6px;font-size:13px;line-height:19px;color:#6e5c5a">Ако бутонът не работи, натисни този линк или го копирай в браузъра си:</p>
        <p style="margin:0 0 16px;font-size:13px;line-height:19px;word-break:break-all"><a href="${link}" target="_blank" rel="noopener" style="color:#1f6b45;text-decoration:underline">${link}</a></p>
        <p style="margin:0;font-size:13px;line-height:19px;color:#6e5c5a">Този линк е само за теб, не го споделяй.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function send(to: string, subject: string, html: string, text: string) {
  await getTransport().sendMail({
    from: { name: "Таен Дядо Коледа", address: process.env.GMAIL_USER! },
    to,
    subject,
    html,
    text,
  });
}

export async function sendInvite(e: InviteEmail) {
  const subject = e.reminder
    ? `🎄 Напомняне: напиши списъка си с желания за ${e.eventName}`
    : `🎅 Участваш в Таен Дядо Коледа: ${e.eventName}`;

  const intro = e.reminder
    ? "Тайният Дядо Коледа те чака! Трябва да добавиш 3 желания, преди да видиш на кого подаряваш."
    : "Добавен(а) си в игра на Таен Дядо Коледа! За да разбереш на кого подаряваш, отвори личния си линк и добави 3 неща, които би искал(а) да получиш.";

  const details = [
    e.budget ? `<b>Бюджет:</b> ${esc(e.budget)}` : "",
    e.exchangeDate ? `<b>Размяна на подаръците:</b> ${esc(e.exchangeDate)}` : "",
  ]
    .filter(Boolean)
    .join("<br>");

  const bodyHtml = [
    `<p style="margin:0 0 16px">${intro}</p>`,
    e.message
      ? `<p style="margin:0 0 16px;padding:12px 16px;background-color:#fbf5ec;border-left:4px solid #c8962e">${esc(e.message).replace(/\n/g, "<br>")}</p>`
      : "",
    details ? `<p style="margin:0 0 20px">${details}</p>` : "",
  ].join("\n");

  const html = renderEmail({
    subject,
    eventName: e.eventName,
    name: e.name,
    bodyHtml,
    buttonText: "Напиши желанията си и виж на кого подаряваш",
    link: e.link,
  });

  const text = `Здравей, ${e.name}!\n\n${intro}\n\n${e.message ? e.message + "\n\n" : ""}${e.budget ? "Бюджет: " + e.budget + "\n" : ""}${e.exchangeDate ? "Размяна на подаръците: " + e.exchangeDate + "\n" : ""}\nТвоят личен линк: ${e.link}\n`;

  await send(e.to, subject, html, text);
}

/** Tells a giver that the person they're buying for has finished their wishlist. */
export async function sendWishlistReady(e: WishlistReadyEmail) {
  const subject = `🎁 Списъкът с желания е готов: ${e.eventName}`;

  // Never reveal the giftee's name to someone who hasn't unlocked it with their own wishlist.
  const intro = e.gifteeName
    ? `${e.gifteeName} току-що написа своя списък с желания. Вече можеш да видиш какво би искал(а) да получи.`
    : "Човекът, на когото подаряваш, току-що написа своя списък с желания! Напиши и ти своите желания, за да разбереш кой е и какво иска.";

  const html = renderEmail({
    subject,
    eventName: e.eventName,
    name: e.name,
    bodyHtml: `<p style="margin:0 0 16px">${esc(intro)}</p>`,
    buttonText: e.gifteeName ? "Виж списъка с желания" : "Напиши желанията си и виж на кого подаряваш",
    link: e.link,
  });

  const text = `Здравей, ${e.name}!\n\n${intro}\n\nТвоят личен линк: ${e.link}\n`;

  await send(e.to, subject, html, text);
}
