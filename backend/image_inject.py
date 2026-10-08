import re
import base64


def find_file_containing_slot(files: dict, slot_id: str) -> str | None:
    """Return the file_path whose content contains data-img-slot with this id."""
    pattern = re.compile(
        r'data-img-slot\s*=\s*["\']' + re.escape(slot_id) + r'["\']'
    )
    for path, content in files.items():
        if pattern.search(content):
            return path
    return None


def inject_image_into_file(content: str, slot_id: str, data_url: str) -> str:
    """
    Replace the src of an img tag that has data-img-slot matching slot_id.
    Handles both JSX (src={...}) and plain HTML (src="...") attribute styles.
    Works whether src comes before or after data-img-slot on the same tag.
    """

    # Strategy: find the full <img ...> tag containing this slot, then replace its src.
    # We capture the whole img tag (non-greedy, handles multiline with re.DOTALL).
    img_pattern = re.compile(
        r'(<img\b[^>]*?data-img-slot\s*=\s*["\']' + re.escape(slot_id) + r'["\'][^>]*?>)',
        re.DOTALL
    )

    match = img_pattern.search(content)
    if not match:
        return content

    original_tag = match.group(1)

    # Replace src="..." or src='...' or src={`...`} or src={"..."} with the data URL.
    # We replace whatever src value is there with a plain quoted data URL.
    src_replaced = re.sub(
        r'src\s*=\s*(?:"[^"]*"|\'[^\']*\'|\{[^}]*\})',
        f'src="{data_url}"',
        original_tag
    )

    return content[:match.start()] + src_replaced + content[match.end():]


def validate_image_data_url(data_url: str) -> bool:
    """Basic validation that this is a real image data URL."""
    if not data_url.startswith("data:image/"):
        return False
    if "base64," not in data_url:
        return False
    # Check the base64 payload is non-empty and not obviously truncated
    payload = data_url.split("base64,", 1)[1]
    return len(payload) > 100