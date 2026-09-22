import pymupdf, traceback

def get_pdf_text(file_path: str) -> str:
    try:
        doc = pymupdf.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        stripped = text.strip()
        if not stripped:
            raise ValueError("PDF appears to be empty or image-only — no text could be extracted")
        return stripped
    except Exception as e:
        traceback.print_exc()
        raise