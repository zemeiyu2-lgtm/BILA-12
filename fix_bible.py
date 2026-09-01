import json
import re

# 读取原始数据库
with open('bible-engine.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 定义匹配模式：末尾的“（卷名（数字章数字节））”或类似
# 例如 "出埃及记（40章1213节）"
pattern = re.compile(r'（[^（）]+（\d+章\d+节））$')

# 遍历每一卷
for book in data['books']:
    chapters = book.get('chapters', [])
    if not chapters:
        continue
    # 处理最后一章
    last_chapter = chapters[-1]
    if isinstance(last_chapter, list):
        # 最后一章是数组，处理最后一条经文
        if last_chapter:
            last_verse = last_chapter[-1]
            if isinstance(last_verse, str):
                # 去除末尾的注释
                cleaned = pattern.sub('', last_verse).strip()
                last_chapter[-1] = cleaned
    # 如果最后一章是对象（但本数据库都是数组），可忽略

# 保存修复后的文件
with open('bible-engine-fixed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ 修复完成，保存为 bible-engine-fixed.json")