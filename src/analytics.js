export function trackIconDownload({ format, inputType, size, hasBg }) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "download_icon", {
    file_format: format,
    icon_source: inputType, // iconify | url | upload
    size: size,
    has_bg: hasBg,
    event_category: "icon_download",
  });
}
