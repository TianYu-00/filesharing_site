export function fileSizeFormatter(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const decimalPlaces = 2;
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimalPlaces)) + " " + sizes[i];
}

export function fileDateFormatter(isoDateTime) {
  const dateTime = new Date(isoDateTime);

  return [
    dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }),
  ];
}
