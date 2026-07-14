import os
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_sidebar = False
        self.sidebar_depth = 0
        self.children = []
    def handle_starttag(self, tag, attrs):
        if tag in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            return
        attrs_dict = dict(attrs)
        if tag == 'aside' and 'sidebar' in attrs_dict.get('class', ''):
            if not self.in_sidebar:
                self.in_sidebar = True
                self.sidebar_depth = 1
                return
        if self.in_sidebar:
            if self.sidebar_depth == 1:
                self.children.append(tag + ' ' + attrs_dict.get('class', ''))
            self.sidebar_depth += 1
    def handle_endtag(self, tag):
        if tag in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            return
        if self.in_sidebar:
            self.sidebar_depth -= 1
            if self.sidebar_depth == 0:
                self.in_sidebar = False

parser = MyHTMLParser()
with open('Index.html', 'r', encoding='utf-8') as f:
    data = f.read()

start_idx = data.find('id="teacher_app_shell"')
if start_idx != -1:
    parser.feed(data[start_idx:])
    print('Teacher Sidebar Children:', parser.children)
