export const loginOtpLength = 6;

export const loginExpiresInSeconds = 5 * 60;
export const sessionBanDelayInSeconds = 10;
export const sessionExpiresInSeconds = 14 * 24 * 60 * 60;

export const loginExpiresIn = loginExpiresInSeconds * 1000;
export const sessionBanDelay = sessionBanDelayInSeconds * 1000;
export const sessionExpiresIn = sessionExpiresInSeconds * 1000;

export const sessionRenewalThreshold = sessionExpiresIn / 2;
