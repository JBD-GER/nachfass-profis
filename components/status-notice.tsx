interface StatusNoticeProps {
  tone: "success" | "error";
  message?: string | null;
}

export function StatusNotice({ tone, message }: StatusNoticeProps) {
  if (!message) {
    return null;
  }

  return <div className={`status-notice status-notice-${tone}`}>{message}</div>;
}
