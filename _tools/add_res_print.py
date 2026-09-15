#!/usr/bin/env python3
# Добавляет полоску «Ресурсы урока» (data-res) и кнопку печати (ss-print) в планы,
# где их нет. Полоска берётся из плана-донора того же курса (у MW3 — с заменой юнита).
# Работает по HUB (deploy/plans + app/plans). Сухой прогон по умолчанию.
import re, glob, os, sys

HUBS = [
    "/Users/oksanasintsova/speak-smile-hub/deploy/plans/",
    "/Users/oksanasintsova/speak-smile-hub/app/plans/",
]
APPLY = "--apply" in sys.argv

def course_of(name):
    m = re.match(r'([A-Za-z]+[0-9]*(?:zero|new)?)-', name)
    return m.group(1) if m else None

def unit_of(name):
    m = re.search(r'-U(\d+)-', name)
    return int(m.group(1)) if m else None

def build_index(hub):
    idx = {}
    for f in glob.glob(hub + "*.html"):
        idx.setdefault(course_of(os.path.basename(f)), []).append(f)
    return idx

def get_strip(s):
    m = re.search(r'<div data-res="1".*?</div>', s, re.S)
    return m.group(0) if m else None

def get_print_block(s):
    # кнопка + её <style> (идут вместе в конце файла)
    m = re.search(r'<button class="ss-print".*?</style>', s, re.S)
    return m.group(0) if m else None

for hub in HUBS:
    if not os.path.isdir(hub):
        print("нет папки:", hub); continue
    idx = build_index(hub)
    # доноры на курс
    donor_strip, donor_print = {}, {}
    for c, files in idx.items():
        for f in files:
            s = open(f, encoding='utf-8').read()
            if c not in donor_strip and 'data-res="1"' in s:
                st = get_strip(s)
                if st: donor_strip[c] = (st, unit_of(os.path.basename(f)))
            if c not in donor_print and 'ss-print' in s:
                pb = get_print_block(s)
                if pb: donor_print[c] = pb
        # запасной донор кнопки — из любого курса (кнопка одинаковая по сути)
    any_print = next(iter(donor_print.values()), None)

    changed = 0; skipped = []
    for c, files in idx.items():
        for f in files:
            name = os.path.basename(f)
            s = open(f, encoding='utf-8').read()
            need_res = 'data-res="1"' not in s
            need_print = 'ss-print' not in s
            # ТОЛЬКО новые планы этой сессии = те, где нет полоски.
            # Старые планы без кнопки (напр. весь GMF2/GMF3) — вне области правки.
            if not need_res:
                continue
            orig = s
            # --- полоска ---
            if need_res:
                donor = donor_strip.get(c)
                if not donor:
                    skipped.append(name + " (нет донора полоски)");
                else:
                    strip, du = donor
                    tu = unit_of(name)
                    if c.startswith(("Gateway", "Prepare")) and du and tu:
                        # Нумерованная лексика (u<du>voc1, /lex/u<du>.html) → подстановка
                        # номера юнита. Проверено: страницы u1* существуют (200).
                        if du != tu:
                            strip = re.sub(r'u%d(?=[a-z.])' % du, 'u%d' % tu, strip)   # u6voc1, u9.html
                            strip = re.sub(r'/u%d\.' % du, '/u%d.' % tu, strip)
                    else:
                        # GMF/GIA/MW3: слаги конкретных страниц игр юнит-/тема-специфичны
                        # (u<N>-bigwheel, sports-memo…) — для целевого юнита могут не существовать.
                        # Убираем ВСЕ ссылки на конкретные страницы игр (…/games/<файл>.html),
                        # оставляем индекс «Все игры курса» (…/games/) и «Тетрадь» — они константны.
                        strip = re.sub(r'<a\b[^>]*href="[^"]*/games/[^"/]+\.html?[^"]*"[^>]*>.*?</a>', '', strip)
                    # вставка перед первым eyebrow
                    anchor = s.find('<div class="eyebrow"')
                    if anchor < 0:
                        skipped.append(name + " (нет якоря eyebrow)")
                    else:
                        s = s[:anchor] + strip + "\n  " + s[anchor:]
            # --- кнопка печати ---
            if need_print:
                pb = donor_print.get(c) or any_print
                if not pb:
                    skipped.append(name + " (нет донора кнопки)")
                else:
                    # добавить перед </body> или в конец
                    if '</body>' in s:
                        s = s.replace('</body>', pb + "\n</body>", 1)
                    else:
                        s = s + "\n" + pb + "\n"
            if s != orig:
                changed += 1
                if APPLY:
                    open(f, 'w', encoding='utf-8').write(s)
    print(f"[{hub}] {'ПРИМЕНЕНО' if APPLY else 'СУХОЙ ПРОГОН'}: изменил бы {changed} планов; пропущено {len(skipped)}")
    for x in skipped[:20]:
        print("   ⚠", x)
