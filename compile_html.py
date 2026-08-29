import os

def compile_html():
    base_dir = r"D:\pookpik_tutor_repo"
    public_dir = os.path.join(base_dir, "public")
    
    # Read the original index.html from public (or root)
    # We will read from root to get a clean copy, but we injected the shim into public's copy.
    # Let's read from public/index.html
    index_path = os.path.join(public_dir, "index.html")
    
    with open(index_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Read Styles.html
    styles_path = os.path.join(base_dir, "Styles.html")
    if os.path.exists(styles_path):
        with open(styles_path, "r", encoding="utf-8") as f:
            styles_content = f.read()
        html_content = html_content.replace("<?!= include('Styles'); ?>", styles_content)

    # Read JavaScript.html
    js_path = os.path.join(base_dir, "JavaScript.html")
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as f:
            js_content = f.read()
        html_content = html_content.replace("<?!= include('JavaScript'); ?>", js_content)

    # Write back to public/index.html
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print("Compiled successfully!")

if __name__ == "__main__":
    compile_html()
