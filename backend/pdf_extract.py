import fitz

def get_pdf_text(file_path: str):
    doc = fitz.open(file_path)
    text = ""
    
    for page in doc:
        text+=page.get_text()
    
    doc.close()
    return text.strip()