import html.parser

class DivLineTracer(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        
    def handle_starttag(self, tag, attrs):
        line, offset = self.getpos()
        attrs_dict = dict(attrs)
        el_id = attrs_dict.get('id', '')
        el_class = attrs_dict.get('class', '')
        self.stack.append((tag, el_id, el_class, line))
        if el_id in ['login_overlay', 'app_shell', 'teacher_app_shell', 'teacher_daily_schedule_panel', 'teacher_monthly_salary_panel', 'evaluation_form_panel']:
            print(f"START tag={tag} id={el_id} class={el_class} at line {line}")

    def handle_endtag(self, tag):
        line, offset = self.getpos()
        if self.stack:
            t, el_id, el_class, start_line = self.stack.pop()
            if el_id in ['login_overlay', 'app_shell', 'teacher_app_shell', 'teacher_daily_schedule_panel', 'teacher_monthly_salary_panel', 'evaluation_form_panel']:
                print(f"CLOSE tag={tag} id={el_id} class={el_class} (started at line {start_line}, closed at line {line})")
            if t != tag:
                # print(f"MISMATCH: started {t} at line {start_line}, closed {tag} at line {line}")
                pass
        else:
            print(f"ERROR: Extra closing tag {tag} at line {line}")

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

parser = DivLineTracer()
parser.feed(html_content)
