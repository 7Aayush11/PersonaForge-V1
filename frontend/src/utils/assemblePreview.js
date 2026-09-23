export function assemblePreviewHTML(files, blobPathMapOut) {
  let pkg = {};
  try {
    pkg = JSON.parse(files["package.json"] || "{}");
  } catch (e) {
    pkg = {};
  }

  const versions = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  const jsFiles = Object.keys(files).filter(
    (p) => p.startsWith("src/") && (p.endsWith(".jsx") || p.endsWith(".js"))
  );
  const cssFiles = Object.keys(files).filter((p) => p.endsWith(".css"));

  const getBase = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
  const cleanVersion = (v) => (v ? v.replace(/^[^\d]*/, "") : "");

  const bareSpecifiers = new Set(["react", "react-dom/client"]);
  jsFiles.forEach((path) => {
    const re = /from\s+['"]([^'".][^'"]*)['"]/g;
    let match;
    while ((match = re.exec(files[path])) !== null) bareSpecifiers.add(match[1]);
  });

  const REACT_PACKAGES = new Set(["react", "react-dom"]);

  const imports = {};
  bareSpecifiers.forEach((spec) => {
    const base = getBase(spec);
    const subpath = spec.slice(base.length);
    const version = cleanVersion(versions[base]) || (base === "react" || base === "react-dom" ? "18.3.0" : "");
    const externalParam = REACT_PACKAGES.has(base) ? "" : "?external=react,react-dom";
    imports[spec] = `https://esm.sh/${base}${version ? `@${version}` : ""}${subpath}${externalParam}`;
  });
  const reactVersion = cleanVersion(versions["react"]) || "18.3.0";
  imports["react/jsx-runtime"] = `https://esm.sh/react@${reactVersion}/jsx-runtime`;
  imports["react/jsx-dev-runtime"] = `https://esm.sh/react@${reactVersion}/jsx-dev-runtime`;

  const resolvePath = (fromPath, rel) => {
    const stack = fromPath.split("/").slice(0, -1);
    rel.split("/").forEach((part) => {
      if (part === "." || part === "") return;
      if (part === "..") stack.pop();
      else stack.push(part);
    });

    const joined = stack.join("/");
    const candidates = [joined, `${joined}.jsx`, `${joined}.js`, `${joined}/index.jsx`, `${joined}/index.js`];
    return candidates.find((c) => files[c] !== undefined) || null;
  };
  const stripCssImports = (code) => code.replace(/import\s+['"][^'"]+\.css['"]\s*;?/g, "");
  const transpiled = {};
  jsFiles.forEach((path) => {
    try {
      const sourceWithoutCss = stripCssImports(files[path]);
      transpiled[path] = window.Babel.transform(sourceWithoutCss, { presets: ["react"], filename: path }).code;
    } catch (e) {
      transpiled[path] = `console.error(${JSON.stringify(`Failed to compile ${path}: ${e.message}`)});`;
    }
  });

  const blobUrls = {};
  const pending = new Set(jsFiles);
  const relRegex = () => /from\s+['"](\.[^'"]+)['"]/g;

  const getLocalDeps = (path) => {
    const deps = new Set();
    let match;
    const re = relRegex();
    while ((match = re.exec(files[path])) !== null) {
      const resolved = resolvePath(path, match[1]);
      if (resolved && !resolved.endsWith(".css")) deps.add(resolved);
    }
    return deps;
  };

  let progress = true;
  while (pending.size > 0 && progress) {
    progress = false;
    for (const path of Array.from(pending)) {
      const deps = getLocalDeps(path);
      const ready = Array.from(deps).every((d) => blobUrls[d] !== undefined);
      if (!ready) return;

      const code = transpiled[path].replace(relRegex(), (full, rel) => {
        const resolved = resolvePath(path, rel);
        if (!resolved) return full;
        if (resolved.endsWith(".css")) return `""`;
        return `from "${blobUrls[resolved]}"`;
      });

      blobUrls[path] = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
      if(blobPathMapOut) blobPathMapOut[blobUrls[path]] = path;
      pending.delete(path);
      progress = true;
    };
  }

  pending.forEach((path) => {
    blobUrls[path] = URL.createObjectURL(new Blob([transpiled[path]], { type: "text/javascript" }));
    if (blobPathMapOut) blobPathMapOut[blobUrls[path]] = path;
  });

  const css = cssFiles.map((p) => files[p]).join("\n").replace(/@tailwind\s+[^;]+;/g, "");

  const entryPath = files["src/main.jsx"] ? "src/main.jsx" : jsFiles.find((f) => /main\.(jsx|js)$/.test(f));
  const entryURL = blobUrls[entryPath];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<script src="https://cdn.tailwindcss.com"></script>
<script type="importmap">${JSON.stringify({imports})}</script>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="${entryURL}"></script>
</body>
</html>`;
}