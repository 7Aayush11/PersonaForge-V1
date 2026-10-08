import json
import re


def extract_bg_color(css: str) -> str:
    patterns = [
        r"body\s*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})",
        r"background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})",
    ]
    for p in patterns:
        m = re.search(p, css, re.DOTALL)
        if m:
            return m.group(1)
    return "#0f172a"


def extract_text_color(css: str) -> str:
    m = re.search(r"body\s*\{[^}]*\bcolor\s*:\s*(#[0-9a-fA-F]{3,8})", css, re.DOTALL)
    if m:
        return m.group(1)
    return "#f1f5f9"


def assemble_html(files: dict) -> str:
    pkg = {}
    try:
        pkg = json.loads(files.get("package.json", "{}"))
    except Exception:
        pkg = {}

    versions = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}

    def get_base(spec):
        parts = spec.split("/")
        if spec.startswith("@"):
            return "/".join(parts[:2])
        return parts[0]

    def clean_version(v):
        if not v:
            return ""
        return re.sub(r"^[^\d]*", "", v)

    js_files = [
        p for p in files
        if p.startswith("src/") and (p.endswith(".jsx") or p.endswith(".js"))
    ]
    css_files = [p for p in files if p.endswith(".css")]

    bare_specifiers = {"react", "react-dom/client"}
    for path in js_files:
        for match in re.finditer(r'''from\s+['"]([^'".][^'"]*)['"']''', files[path]):
            bare_specifiers.add(match.group(1))

    REACT_PACKAGES = {"react", "react-dom"}
    imports = {}
    for spec in bare_specifiers:
        base = get_base(spec)
        subpath = spec[len(base):]
        version = clean_version(versions.get(base, "")) or ("18.3.0" if base in REACT_PACKAGES else "")
        external = "" if base in REACT_PACKAGES else "?external=react,react-dom"
        imports[spec] = f"https://esm.sh/{base}{'@' + version if version else ''}{subpath}{external}"

    react_version = clean_version(versions.get("react", "")) or "18.3.0"
    imports["react/jsx-runtime"] = f"https://esm.sh/react@{react_version}/jsx-runtime"
    imports["react/jsx-dev-runtime"] = f"https://esm.sh/react@{react_version}/jsx-dev-runtime"

    raw_css = "\n".join(files[p] for p in css_files)
    # Remove @tailwind directives — Play CDN handles utilities
    css = re.sub(r"@tailwind\s+\S+\s*;?", "", raw_css).strip()

    bg_color = extract_bg_color(css)
    text_color = extract_text_color(css)

    def strip_css_imports(code):
        return re.sub(r"import\s+['\"][^'\"]+\.css['\"]\s*;?", "", code)

    registry_entries = []
    for path in js_files:
        code = strip_css_imports(files[path])
        escaped = (
            code
            .replace("\\", "\\\\")
            .replace("`", "\\`")
            .replace("${", "\\${")
        )
        registry_entries.append(f"  {json.dumps(path)}: `{escaped}`")

    registry_js = ",\n".join(registry_entries)

    entry_path = (
        "src/main.jsx" if "src/main.jsx" in files
        else next((f for f in js_files if re.search(r"main\.(jsx|js)$", f)), js_files[0] if js_files else "")
    )

    import_map_json = json.dumps({"imports": imports})

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{
  background-color: {bg_color};
  color: {text_color};
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}}
#root {{ min-height: 100vh; }}
{css}
</style>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
<script type="importmap">{import_map_json}</script>
</head>
<body>
<div id="root"></div>

<script>
const __modules = {{
{registry_js}
}};

function resolvePath(fromPath, rel) {{
  const stack = fromPath.split("/").slice(0, -1);
  rel.split("/").forEach(part => {{
    if (part === "." || part === "") return;
    if (part === "..") stack.pop();
    else stack.push(part);
  }});
  const joined = stack.join("/");
  const candidates = [joined, joined+".jsx", joined+".js", joined+"/index.jsx", joined+"/index.js"];
  return candidates.find(c => __modules[c] !== undefined) || null;
}}

const __cache = {{}};

function requireModule(path) {{
  if (__cache[path]) return __cache[path].exports;
  const source = __modules[path];
  if (!source) {{
    console.error("Module not found:", path);
    return {{}};
  }}

  let transpiled;
  try {{
    transpiled = Babel.transform(source, {{
      presets: [
        "react",
        ["env", {{ targets: {{ browsers: ["last 1 chrome version"] }}, modules: "commonjs" }}]
      ],
      filename: path,
      sourceType: "module"
    }}).code;
  }} catch(e) {{
    console.error("Babel transform failed for", path, ":", e.message);
    return {{}};
  }}

  const mod = {{ exports: {{}} }};
  __cache[path] = mod;

  function localRequire(specifier) {{
    if (specifier.startsWith(".")) {{
      const resolved = resolvePath(path, specifier);
      if (!resolved) {{
        console.warn("Could not resolve:", specifier, "from", path);
        return {{}};
      }}
      return requireModule(resolved);
    }}
    if (window.__npmCache && window.__npmCache[specifier]) {{
      return window.__npmCache[specifier];
    }}
    console.warn("Unresolved npm specifier:", specifier);
    return {{}};
  }}

  try {{
    new Function("require", "module", "exports", "__dirname", "__filename", transpiled)(
      localRequire, mod, mod.exports, "/", path
    );
  }} catch(e) {{
    console.error("Module execution failed for", path, ":", e.message);
  }}

  return mod.exports;
}}
</script>

<script type="module">
import React from "react";
import ReactDOM from "react-dom/client";
import * as framerMotion from "framer-motion";
import * as lucide from "lucide-react";

window.__React = React;
window.__ReactDOM = ReactDOM;

window.__npmCache = {{
  "react": React,
  "react-dom": ReactDOM,
  "react-dom/client": ReactDOM,
  "framer-motion": framerMotion,
  "lucide-react": lucide,
}};

setTimeout(() => {{
  try {{
    requireModule({json.dumps(entry_path)});
  }} catch(e) {{
    document.getElementById("root").innerHTML =
      '<pre style="color:red;padding:20px;font-family:monospace;background:#1a0000;">Boot error: ' + e.message + '</pre>';
  }}
}}, 0);
</script>
</body>
</html>"""