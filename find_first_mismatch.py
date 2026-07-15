import html.parser

class DivTracer(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.void_tags = {'input', 'br', 'img', 'meta', 'link', 'hr', 'base', 'option'}
        
    def handle_starttag(self, tag, attrs):
        if tag in self.void_tags:
            return
        line, offset = self.getpos()
        attrs_dict = dict(attrs)
        el_id = attrs_dict.get('id', '')
        el_class = attrs_dict.get('class', '')
        self.stack.append((tag, el_id, el_class, line))

    def handle_endtag(self, tag):
        if tag in self.void_tags:
            return
        line, offset = self.getpos()
        if not self.stack:
            print(f"ERROR: Extra closing tag </{tag}> at line {line}")
            return
            
        # Find matching tag in stack from the top
        matched = False
        for idx in range(len(self.stack)-1, -1, -1):
            t, el_id, el_class, start_line = self.stack[idx]
            if t == tag:
                unclosed = self.stack[idx+1:]
                if unclosed:
                    print(f"At line {line}, closing </{tag}>. These tags started inside it but were NEVER closed:")
                    for ut, uid, uclass, uline in unclosed:
                        print(f"  - <{ut} id='{uid}' class='{uclass}'> at line {uline}")
                self.stack = self.stack[:idx]
                matched = True
                break
        if not matched:
            print(f"ERROR: Closing tag </{tag}> at line {line} has no matching open tag in stack!")

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

parser = DivTracer()
parser.feed(html_content)

print("\n--- UNCLOSED TAGS AT END OF FILE ---")
for t, el_id, el_class, line in parser.stack:
    print(f"<{t} id='{el_id}' class='{el_class}'> at line {line}")
