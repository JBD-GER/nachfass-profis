const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
});

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Noch nicht";
  }

  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Noch nicht";
  }

  return DATE_FORMATTER.format(new Date(value));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}
