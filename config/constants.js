// Time constants
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;

// Token expiry times
export const ACCESS_TOKEN_EXPIRY =
  15 * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND; // 15 minutes

export const REFRESH_TOKEN_EXPIRY =
  DAYS_PER_WEEK *
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND; // 7 days

// Cookie options
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: false,
};

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_CONFIG,
  maxAge: ACCESS_TOKEN_EXPIRY,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_CONFIG,
  maxAge: REFRESH_TOKEN_EXPIRY,
};
