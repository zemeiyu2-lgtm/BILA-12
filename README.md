# MOS-DIS Platform V1.0

MOS 门训同行平台原型。

## 运行数据协议

平台只使用 MOS 原生 CSV，不再依赖旧版52周运行文件：

- `mos-52w.csv`：52周年度门训母数据
- `mos-364d.csv`：364日每日门训内容
- `bible-engine.js`：圣经读取引擎
- `bila-cuv-pdf-database.json`：本地和合本逐节数据库

## 数据链

`mos-52w.csv` → 周结构

`mos-364d.csv` → 每日门训内容

`bible-engine.js` → 按经文引用读取本地圣经文本

## 当前原则

1. 平台容器与内容母库分离。
2. 前台以“今天”为主要入口。
3. 每日数据由 CSV 驱动，不把门训内容硬编码进 index.html。
4. 不以完成量或选择结果评价属灵成熟度。
5. 后续可以在不重写前端结构的情况下调整每日内容字段。

## GitHub

建议仓库名：`MOS-Discipleship`

建议仓库根目录放置：

```text
index.html
mos-52w.csv
mos-364d.csv
bible-engine.js
bila-cuv-pdf-database.json
```
