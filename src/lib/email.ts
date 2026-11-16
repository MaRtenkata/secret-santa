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

  const html = `
<div lang="bg" style="background:#f6efe6;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#2a1d1d">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ead9c6">
    <div style="background:#9b1c2a;color:#fff6ee;padding:24px;text-align:center">
      <div style="font-size:40px;line-height:1">🎁</div>
      <h1 style="margin:8px 0 0;font-size:24px">${esc(e.eventName)}</h1>
    </div>
    <div style="padding:24px;font-size:16px;line-height:1.55">
      <p style="margin:0 0 12px">Здравей, ${esc(e.name)}!</p>
      <p style="margin:0 0 16px">${intro}</p>
      ${e.message ? `<p style="margin:0 0 16px;padding:12px 16px;background:#fbf5ec;border-left:4px solid #c8962e">${esc(e.message).replace(/\n/g, "<br>")}</p>` : ""}
      ${details ? `<p style="margin:0 0 20px">${details}</p>` : ""}
      <p style="text-align:center;margin:24px 0">
        <a href="${e.link}" style="background:#1f6b45;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold;display:inline-block">Напиши желанията си и виж на кого подаряваш</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6e5c5a">Този линк е само за теб, не го споделяй. Ако бутонът не работи, копирай това в браузъра си:<br><span style="word-break:break-all">${e.link}</span></p>
    </div>
  </div>
</div>`;

  const text = `Здравей, ${e.name}!\n\n${intro}\n\n${e.message ? e.message + "\n\n" : ""}${e.budget ? "Бюджет: " + e.budget + "\n" : ""}${e.exchangeDate ? "Размяна на подаръците: " + e.exchangeDate + "\n" : ""}\nТвоят личен линк: ${e.link}\n`;

  await getTransport().sendMail({
    from: { name: "Таен Дядо Коледа", address: process.env.GMAIL_USER! },
    to: e.to,
    subject,
    html,
    text,
  });
}
