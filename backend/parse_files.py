import re

FILE_PATTERN = re.compile(r"@@DESCRIPTION: \s*(.+?)\s*\n@@FILE: \s*(.+?)\s*\n(.*?)(?=\n@@DESCRIPTION:|\Z)", re.DOTALL)

def parse_generated_files(raw: str)->dict:
    text = raw.strip()
    
    if text.startswith("```"):
        text =text.split("\n",1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text.rsplit("```",1)[0]
        
        text = text.strip()
        
    matches = FILE_PATTERN.findall(text)
    
    if not matches:
        raise ValueError("No files found in model output - check it's using the @@FILE: format")
    
    files = {}
    files_desc = {}
    for desc, path, content in matches:
        files_desc[path.strip()] = desc.strip()
        files[path.strip()] = content.strip()
        
    return files, files_desc

