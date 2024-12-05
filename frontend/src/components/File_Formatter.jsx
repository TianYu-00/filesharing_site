export function fileSizeFormatter(bytes) {
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  if (bytes === 0) return "0.00 B";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return size.toFixed(2) + " " + sizes[i];
}

export function fileDateFormatter(isoDateTime) {
  if (!isoDateTime) {
    return ["Invalid Time", "Invalid Date", "Invalid Date"];
  }

  const dateTime = new Date(isoDateTime);

  return [
    dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }),
    dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "numeric", day: "numeric" }),
  ];
}
