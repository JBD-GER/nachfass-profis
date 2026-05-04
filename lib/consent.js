export const CONSENT_STORAGE_KEY = "nachfass-consent-v1";
export const CONSENT_VERSION = "2026-05";

export const defaultConsent = {
  essential: true,
  statistics: false,
  marketing: false,
};

export function sanitizeConsent(input) {
  return {
    essential: true,
    statistics: Boolean(input?.statistics),
    marketing: Boolean(input?.marketing),
  };
}

export function createConsentPayload(input) {
  return {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    choices: sanitizeConsent(input),
  };
}

export function readStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      version: parsedValue.version || CONSENT_VERSION,
      timestamp: parsedValue.timestamp || null,
      choices: sanitizeConsent(parsedValue.choices),
    };
  } catch {
    return null;
  }
}

export function persistConsent(input) {
  if (typeof window === "undefined") {
    return null;
  }

  const payload = createConsentPayload(input);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearStoredConsent() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
}
