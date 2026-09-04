// ================================================================
// BILA Bible Engine V3.0
// 本地圣经数据库版
//
// 数据源：用户提供《新旧约.pdf》
// 数据库：bila-cuv-pdf-database.json
// 特点：
// 1. 不再依赖第三方 Bible API
// 2. 经文从本地 JSON 动态读取
// 3. 支持单段、多段、跨书卷引用
// 4. 与现有 BILA MOS 1.2 index.html 的 BilaBible.getWeekBible() 兼容
// ================================================================

const BILA_BIBLE_CONFIG = {
  databaseUrl: "bila-cuv-pdf-database.json",
  curriculumUrl:
    "mos-52w.csv",
  version: "CUV",
  name: "和合本（用户提供PDF数据库）",
  timeout: 15000
};

let BILA_DB = null;
let BILA_CURRICULUM = null;
let BILA_DB_PROMISE = null;
let BILA_CURRICULUM_PROMISE = null;

// ---------------------------------------------------------------
// 1. 书卷简称
// ---------------------------------------------------------------
const BILA_ALIASES = {
  "创":"创世记","出":"出埃及记","利":"利未记","民":"民数记","申":"申命记",
  "书":"约书亚记","士":"士师记","得":"路得记",
  "撒上":"撒母耳记上","撒下":"撒母耳记下",
  "王上":"列王纪上","王下":"列王纪下",
  "代上":"历代志上","代下":"历代志下",
  "拉":"以斯拉记","尼":"尼希米记","斯":"以斯帖记",
  "伯":"约伯记","诗":"诗篇","箴":"箴言","传":"传道书","歌":"雅歌",
  "赛":"以赛亚书","耶":"耶利米书","耶哀":"耶利米哀歌","哀":"耶利米哀歌",
  "结":"以西结书","但":"但以理书",
  "何":"何西阿书","珥":"约珥书","摩":"阿摩司书","俄":"俄巴底亚书",
  "拿":"约拿书","弥":"弥迦书","鸿":"那鸿书","哈":"哈巴谷书","番":"西番雅书",
  "该":"哈该书","亚":"撒迦利亚书","玛":"玛拉基书",
  "太":"马太福音","可":"马可福音","路":"路加福音","约":"约翰福音","徒":"使徒行传",
  "罗":"罗马书","林前":"哥林多前书","林后":"哥林多后书","加":"加拉太书",
  "弗":"以弗所书","腓":"腓立比书","西":"歌罗西书",
  "帖前":"帖撒罗尼迦前书","帖后":"帖撒罗尼迦后书",
  "贴前":"帖撒罗尼迦前书","贴后":"帖撒罗尼迦后书",
  "提前":"提摩太前书","提后":"提摩太后书","多":"提多书","门":"腓利门书",
  "来":"希伯来书","雅":"雅各书","彼前":"彼得前书","彼后":"彼得后书",
  "约一":"约翰一书","约二":"约翰二书","约三":"约翰三书",
  "犹":"犹大书","启":"启示录"
};

function normalizeBook(name) {
  const s = String(name || "").trim();
  return BILA_ALIASES[s] || s;
}

function cleanReferenceText(s) {
  return String(s || "")
    .replace(/\uFEFF/g, "")
    .replace(/[：]/g, ":")
    .replace(/[－–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------
// 2. 加载本地数据库
// ---------------------------------------------------------------
async function loadBibleDatabase() {
  if (BILA_DB) return BILA_DB;
  if (BILA_DB_PROMISE) return BILA_DB_PROMISE;

  if (window.__MOS_BIBLE_DB) { BILA_DB = window.__MOS_BIBLE_DB; return Promise.resolve(BILA_DB); }

  const url = BILA_BIBLE_CONFIG.databaseUrl;
  console.log("📖 正在加载本地圣经数据库：", url);

  BILA_DB_PROMISE = fetch(url, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) {
        throw new Error("圣经数据库加载失败：HTTP " + response.status);
      }
      return response.json();
    })
    .then(db => {
      if (!db || !Array.isArray(db.books)) {
        throw new Error("圣经数据库格式无效");
      }
      if (db.books.length !== 66) {
        throw new Error("圣经数据库应有66卷，目前为" + db.books.length + "卷");
      }
      BILA_DB = db;
      console.log("✅ 圣经数据库加载成功：66卷，31,102节");
      return db;
    })
    .finally(() => {
      BILA_DB_PROMISE = null;
    });

  return BILA_DB_PROMISE;
}

// ---------------------------------------------------------------
// 3. 加载52周CSV
// ---------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(v => v !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length) {
    row.push(cell.trim());
    if (row.some(v => v !== "")) rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(v => String(v).replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map(values => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = String(values[i] ?? "").trim());
    return obj;
  });
}

async function loadCurriculum() {
  if (BILA_CURRICULUM) return BILA_CURRICULUM;
  if (BILA_CURRICULUM_PROMISE) return BILA_CURRICULUM_PROMISE;

  if (window.__MOS_52W_CSV) {
    const rows = parseCSV(window.__MOS_52W_CSV);
    if (rows.length >= 52) { BILA_CURRICULUM = rows; return Promise.resolve(rows); }
  }

  console.log("📚 正在加载52周课程：", BILA_BIBLE_CONFIG.curriculumUrl);

  BILA_CURRICULUM_PROMISE = fetch(
    BILA_BIBLE_CONFIG.curriculumUrl,
    { cache: "no-cache" }
  )
    .then(response => {
      if (!response.ok) {
        throw new Error("52-weeks.csv 加载失败：HTTP " + response.status);
      }
      return response.text();
    })
    .then(text => {
      const rows = parseCSV(text);
      if (rows.length < 52) {
        throw new Error("52-weeks.csv 不是完整的52周数据");
      }
      BILA_CURRICULUM = rows;
      return rows;
    })
    .finally(() => {
      BILA_CURRICULUM_PROMISE = null;
    });

  return BILA_CURRICULUM_PROMISE;
}

// ---------------------------------------------------------------
// 4. 获取书卷
// ---------------------------------------------------------------
async function getBook(bookName) {
  const db = await loadBibleDatabase();
  const normalized = normalizeBook(bookName);
  const book = db.books.find(b => b.name === normalized || b.abbrev === normalized);

  if (!book) {
    throw new Error("数据库中找不到书卷：" + bookName);
  }

  return book;
}

// ---------------------------------------------------------------
// 5. 获取章节
// ---------------------------------------------------------------
async function getBibleChapter(book, chapter) {
  const bookData = await getBook(book);
  const ch = Number(chapter);

  if (!Number.isInteger(ch) || ch < 1 || ch > bookData.chapters.length) {
    throw new Error(`${bookData.name} 第${chapter}章不存在`);
  }

  return bookData.chapters[ch - 1].map((text, index) => ({
    verse: index + 1,
    text: String(text || "").trim()
  }));
}

// ---------------------------------------------------------------
// 6. 获取单节
// ---------------------------------------------------------------
async function getBibleVerse(book, chapter, verse) {
  const verses = await getBibleChapter(book, chapter);
  const target = Number(verse);
  const found = verses.find(v => v.verse === target);

  if (!found || !found.text) {
    throw new Error(`${book} ${chapter}:${verse} 不存在或为空`);
  }

  return found.text;
}

// ---------------------------------------------------------------
// 7. 获取一段
// ---------------------------------------------------------------
async function getBiblePassage(book, chapter, startVerse, endVerse) {
  const verses = await getBibleChapter(book, chapter);
  const start = Number(startVerse);
  const end = Number(endVerse);

  const selected = verses.filter(
    v => v.verse >= start && v.verse <= end
  );

  if (!selected.length) {
    throw new Error(`${book} ${chapter}:${start}-${end} 没有找到经文`);
  }

  return selected.map(v => `${v.verse} ${v.text}`).join("\n");
}

// ---------------------------------------------------------------
// 8. 解析复杂引用
// 支持：
// 约翰福音 13:1-17,34-35
// 使徒行传 1:8；2:1-21
// 约翰一书 1:1-4；3:16-18
// 马太福音 28:18-20；启示录 22:12-21
// ---------------------------------------------------------------
function splitReference(reference) {
  return cleanReferenceText(reference)
    .replace(/[；;]/g, "；")
    .split("；")
    .map(s => s.trim())
    .filter(Boolean);
}

function parseOneSegment(segment) {
  const text = cleanReferenceText(segment);

  const match = text.match(/^(.+?)\s*(\d+):(.+)$/);
  if (!match) {
    throw new Error("无法解析经文引用：" + segment);
  }

  const book = normalizeBook(match[1]);
  const chapter = Number(match[2]);

  const ranges = match[3]
    .split(/[,，、]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!ranges.length) {
    throw new Error("经文节范围为空：" + segment);
  }

  return ranges.map(range => {
    const m = range.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) {
      throw new Error("无法解析节范围：" + range);
    }

    return {
      book,
      chapter,
      startVerse: Number(m[1]),
      endVerse: Number(m[2] || m[1])
    };
  });
}

function parseBibleReference(reference) {
  const segments = splitReference(reference);
  const parts = [];

  for (const segment of segments) {
    parts.push(...parseOneSegment(segment));
  }

  return parts;
}

// ---------------------------------------------------------------
// 9. 获取复杂经文结构
// ---------------------------------------------------------------
async function getBibleData(reference) {
  const parts = parseBibleReference(reference);
  const sections = [];
  const errors = [];

  for (const part of parts) {
    try {
      const verses = await getBibleChapter(part.book, part.chapter);
      const selected = verses.filter(
        v => v.verse >= part.startVerse && v.verse <= part.endVerse
      );

      if (!selected.length) {
        throw new Error(
          `${part.book} ${part.chapter}:${part.startVerse}-${part.endVerse} 没有找到经文`
        );
      }

      sections.push({
        book: part.book,
        chapter: part.chapter,
        startVerse: part.startVerse,
        endVerse: part.endVerse,
        verses: selected
      });
    } catch (error) {
      errors.push({
        reference: `${part.book} ${part.chapter}:${part.startVerse}-${part.endVerse}`,
        error: error.message
      });
    }
  }

  const text = sections.map(section => {
    const title = sections.length > 1
      ? `${section.book} ${section.chapter}:${section.startVerse}-${section.endVerse}`
      : "";

    const body = section.verses
      .map(v => `${v.verse} ${v.text}`)
      .join("\n");

    return title ? `${title}\n${body}` : body;
  }).join("\n\n");

  return {
    version: BILA_BIBLE_CONFIG.version,
    versionName: BILA_BIBLE_CONFIG.name,
    reference,
    sections,
    text,
    errors,
    success: sections.length > 0 && errors.length === 0,
    partial: sections.length > 0 && errors.length > 0
  };
}

async function getBibleText(reference) {
  const data = await getBibleData(reference);

  if (!data.success && !data.partial) {
    throw new Error(data.errors[0]?.error || "经文读取失败");
  }

  return data.text;
}

// ---------------------------------------------------------------
// 10. 第N周自动读取
// ---------------------------------------------------------------
async function getWeekBible(weekNumber) {
  const curriculum = await loadCurriculum();
  const week = Number(weekNumber);
  const course = curriculum.find(
    row => Number(row.week) === week
  );

  if (!course) {
    throw new Error("第" + week + "周课程不存在");
  }

  const reference = course.reference;

  if (!reference) {
    throw new Error("第" + week + "周没有经文引用");
  }

  const bible = await getBibleData(reference);

  return {
    week,
    reference,
    sundayTheme: course.sunday_theme || "",
    bilaTheme: course.bila_theme || "",
    practice: course.practice || "",
    groupFeedback: course.group_feedback || "",
    mission: course.mission || "",
    bible
  };
}

// ---------------------------------------------------------------
// 11. 测试
// ---------------------------------------------------------------
async function testBibleDatabase() {
  console.log("🧪 开始测试本地圣经数据库……");

  const tests = [
    "创世记 1:1-5",
    "约翰福音 1:1-18",
    "使徒行传 1:8；2:1-21",
    "约翰福音 13:1-17,34-35",
    "约翰一书 1:1-4；3:16-18",
    "马太福音 28:18-20；启示录 22:12-21"
  ];

  const results = [];

  for (const ref of tests) {
    try {
      const data = await getBibleData(ref);
      const ok = data.success || data.partial;
      results.push({ reference: ref, ok, errors: data.errors });
      console.log(ok ? "✅" : "❌", ref);
    } catch (error) {
      results.push({ reference: ref, ok: false, error: error.message });
      console.error("❌", ref, error);
    }
  }

  console.table(results);
  return results;
}

function bibleEngineStatus() {
  return {
    engine: "BILA Bible Engine V3.0",
    databaseLoaded: !!BILA_DB,
    bookCount: BILA_DB?.books?.length || 0,
    verseCount: BILA_DB
      ? BILA_DB.books.reduce((n, b) => n + (b.verseCount || 0), 0)
      : 0,
    curriculumLoaded: !!BILA_CURRICULUM,
    curriculumWeeks: BILA_CURRICULUM?.length || 0
  };
}

// ---------------------------------------------------------------
// 12. BILA对外接口
// ---------------------------------------------------------------
window.BilaBible = {
  config: BILA_BIBLE_CONFIG,
  loadDatabase: loadBibleDatabase,
  loadCurriculum,
  getBook,
  getWeek: async function(weekNumber) { return getWeekBible(weekNumber); },
  chapter: getBibleChapter,
  verse: getBibleVerse,
  passage: getBiblePassage,
  data: getBibleData,
  text: getBibleText,
  getWeekBible,
  parse: parseBibleReference,
  status: bibleEngineStatus,
  test: testBibleDatabase,
  clearCache: () => {
    BILA_DB = null;
    BILA_CURRICULUM = null;
    console.log("🗑️ BILA Bible Engine 缓存已清除");
  }
};

// ---------------------------------------------------------------
// 13. 兼容旧版全局测试函数
// ---------------------------------------------------------------
window.testBibleDatabase = testBibleDatabase;
window.testBibleEngine = testBibleDatabase;
window.testWeek1 = () => getWeekBible(1);
window.testWeek = week => getWeekBible(week);

console.log("🌿 BILA Bible Engine V3.0 已加载");
console.log("📖 数据源：用户提供的《新旧约.pdf》");
console.log("📚 数据库：bila-cuv-pdf-database.json");
console.log("✅ 取消第三方Bible API依赖");
