export function extractImageSlots(html){
    if(!html) return [];
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const imgs = Array.from(doc.querySelectorAll("img[data-img-slot]"))
    return imgs.map((img)=>({
        slotId: img.getAttribute("data-img-slot"),
        label: img.getAttribute("data-img-label") || img.getAttribute("data-img-slot"),
        src: img.getAttribute("src")
    }))
}

export function replaceImageSlot(html, slotId, dataUrl){
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html")
    const target = doc.querySelector(`img[data-img-slot=${slotId}]`)
    if (!target) return html
    target.setAttribute("src", dataUrl)
    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

export function compressImageFile(file, maxWidth=800, quality=0.8){
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () =>{
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas")
                canvas.width = Math.round(img.width * scale)
                canvas.height = Math.round(img.height * scale)
                const ctx = canvas.getContext("2d")
                ctx.drawImage(img, 0, 0,canvas.width, canvas.height)
                resolve(canvas.toDataURL("image/jpeg", quality))
            }

            img.onerror = () => reject(new Error("Could not read that image."));
            img.src = e.target.result;
        }

        reader.onerror = () => reject(new Error("Could not read that file."))
        reader.readAsDataURL(file)
    })
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