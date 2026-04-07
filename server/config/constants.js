export const APP_CONSTANTS = {
  ROLE_ADMIN_ID: 1,
  ROLE_STAFF_ID: 3,
};

// Default thresholds for customer ranking by monthly spending (VND).
export const RANK_THRESHOLDS = {
  SILVER: 5_000_000,
  GOLD: 20_000_000,
  VIP: 50_000_000,
};

// Cron expressions used by scheduled jobs.
export const CRON_SCHEDULES = {
  // 11:55 PM daily by default. Can be overridden from env.
  RANK_UPDATE: process.env.RANK_UPDATE_CRON || "55 23 * * *",
};

export const EMAIL_TEMPLATES = {
  RANK_UPGRADE: {
    subject: (newRank) =>
      `Chuc mung ban da duoc nang hang ${String(newRank).toUpperCase()}!`,
    getBody: (customerName, oldRank, newRank, totalSpentFormatted) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2 style="margin-bottom: 8px;">Chuc mung ${customerName || "Quy khach"}!</h2>
        <p>Hang thanh vien cua ban da duoc cap nhat.</p>
        <ul>
          <li>Hang cu: <strong>${String(oldRank).toUpperCase()}</strong></li>
          <li>Hang moi: <strong>${String(newRank).toUpperCase()}</strong></li>
          <li>Tong chi tieu thang: <strong>${totalSpentFormatted}</strong></li>
        </ul>
        <p>Cam on ban da dong hanh cung chung toi.</p>
      </div>
    `,
  },
};
