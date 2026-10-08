
export function extractImageSlotsFromFiles(files) {
  if (!files || typeof files !== "object") return [];

  const slots = [];
  const seen = new Set();

  Object.values(files).forEach((content) => {
    if (typeof content !== "string") return;

    // Find every occurrence of data-img-slot="something"
    const slotRegex = /data-img-slot\s*=\s*["']([^"']+)["']/g;
    const labelRegex = /data-img-slot\s*=\s*["'][^"']+["'][^]*?data-img-label\s*=\s*["']([^"']+)["']/g;
    const srcRegex = /src\s*=\s*["']([^"']+)["'][^]*?data-img-slot\s*=\s*["']([^"']+)["']|data-img-slot\s*=\s*["']([^"']+)["'][^]*?src\s*=\s*["']([^"']+)["']/g;

    // First pass: collect all slot IDs and their positions
    let slotMatch;
    while ((slotMatch = slotRegex.exec(content)) !== null) {
      const slotId = slotMatch[1];
      if (seen.has(slotId)) continue;
      seen.add(slotId);

      const slotPos = slotMatch.index;

      // Look backward and forward ~500 chars from the slot attribute
      // to find the label and src on the same tag
      const start = Math.max(0, slotPos - 500);
      const end = Math.min(content.length, slotPos + 500);
      const surrounding = content.slice(start, end);

      const labelMatch = /data-img-label\s*=\s*["']([^"']+)["']/.exec(surrounding);
      const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/.exec(surrounding);

      slots.push({
        slotId,
        label: labelMatch ? labelMatch[1] : slotId,
        src: srcMatch ? srcMatch[1] : "https://placehold.co/38x38?text=?",
      });
    }
  });

  return slots;
}

export function extractImageSlots(html) {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img[data-img-slot]"));
  return imgs.map((img) => ({
    slotId: img.getAttribute("data-img-slot"),
    label: img.getAttribute("data-img-label") || img.getAttribute("data-img-slot"),
    src: img.getAttribute("src"),
  }));
}

export function replaceImageSlot(html, slotId, dataUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const target = doc.querySelector(`img[data-img-slot="${slotId}"]`);
  if (!target) return html;
  target.setAttribute("src", dataUrl);
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

export function compressImageFile(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read that image."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function stripImagesForEdit(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img[data-img-slot]"));
  const imageMap = {};
  imgs.forEach((img) => {
    const slotId = img.getAttribute("data-img-slot");
    const src = img.getAttribute("src");
    if (src && src.startsWith("data:")) {
      imageMap[slotId] = src;
      img.setAttribute("src", "https://placehold.co/400x400?text=Photo");
    }
  });
  return {
    strippedHtml: "<!DOCTYPE html>\n" + doc.documentElement.outerHTML,
    imageMap,
  };
}

export function restoreImages(html, imageMap) {
  if (!imageMap || Object.keys(imageMap).length === 0) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  Object.entries(imageMap).forEach(([slotId, dataUrl]) => {
    const target = doc.querySelector(`img[data-img-slot="${slotId}"]`);
    if (target) target.setAttribute("src", dataUrl);
  });
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}