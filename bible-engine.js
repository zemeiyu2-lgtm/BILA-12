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
    "52-weeks.csv",
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
        throw new Error(
          "圣经数据库应有66卷，目前为" +
          db.books.length +
          "卷"
        );
      }

      BILA_DB = db;

      console.log(
        "✅ 圣经数据库加载成功：66卷，31,102节"
      );

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

      if (
        quoted &&
        next === '"'
      ) {

        cell += '"';
        i++;

      } else {

        quoted = !quoted;

      }

    } else if (
      ch === ',' &&
      !quoted
    ) {

      row.push(
        cell.trim()
      );

      cell = "";

    } else if (
      (ch === '\n' || ch === '\r') &&
      !quoted
    ) {

      if (
        ch === '\r' &&
        next === '\n'
      ) {

        i++;

      }

      row.push(
        cell.trim()
      );

      if (
        row.some(
          v => v !== ""
        )
      ) {

        rows.push(row);

      }

      row = [];
      cell = "";

    } else {

      cell += ch;

    }

  }

  if (
    cell !== "" ||
    row.length
  ) {

    row.push(
      cell.trim()
    );

    if (
      row.some(
        v => v !== ""
      )
    ) {

      rows.push(row);

    }

  }

  if (
    rows.length < 2
  ) {

    return [];

  }

  const headers =
    rows[0].map(
      v =>
        String(v)
          .replace(/^\uFEFF/, "")
          .trim()
    );

  return rows
    .slice(1)
    .map(values => {

      const obj = {};

      headers.forEach(
        (h, i) => {

          obj[h] =
            String(
              values[i] ?? ""
            ).trim();

        }
      );

      return obj;

    });
}

async function loadCurriculum() {

  if (BILA_CURRICULUM) {

    return BILA_CURRICULUM;

  }

  if (BILA_CURRICULUM_PROMISE) {

    return BILA_CURRICULUM_PROMISE;

  }

  console.log(
    "📚 正在加载52周课程：",
    BILA_BIBLE_CONFIG.curriculumUrl
  );

  BILA_CURRICULUM_PROMISE =
    fetch(
      BILA_BIBLE_CONFIG.curriculumUrl,
      {
        cache: "no-cache"
      }
    )

    .then(
      response => {

        if (!response.ok) {

          throw new Error(
            "52-weeks.csv 加载失败：HTTP " +
            response.status
          );

        }

        return response.text();

      }
    )

    .then(
      text => {

        const rows =
          parseCSV(text);

        if (
          rows.length < 52
        ) {

          throw new Error(
            "52-weeks.csv 不是完整的52周数据"
          );

        }

        BILA_CURRICULUM =
          rows;

        return rows;

      }
    )

    .finally(
      () => {

        BILA_CURRICULUM_PROMISE =
          null;

      }
    );

  return BILA_CURRICULUM_PROMISE;
}

// ---------------------------------------------------------------
// 4. 获取书卷
// ---------------------------------------------------------------
async function getBook(bookName) {

  const db =
    await loadBibleDatabase();

  const normalized =
    normalizeBook(bookName);

  const book =
    db.books.find(
      b =>
        b.name === normalized ||
        b.abbrev === normalized
    );

  if (!book) {

    throw new Error(
      "数据库中找不到书卷：" +
      bookName
    );

  }

  return book;

}// ================================================================
// BILA Bible Engine V3.0
// 第2段：经文引用解析 + 本地数据库读取
// ================================================================

// ---------------------------------------------------------------
// 5. 解析单个经文引用
//
// 支持：
// 约翰福音 1:1
// 约翰福音 1:1-18
// 诗篇 23:1-6
// ---------------------------------------------------------------

function parseSingleReference(reference) {

  const text =
    cleanReferenceText(reference);

  const match =
    text.match(
      /^(.+?)\s*(\d+):(\d+)(?:-(\d+))?$/
    );

  if (!match) {
    throw new Error(
      "无法解析经文：" + reference
    );
  }

  const book =
    normalizeBook(match[1]);

  if (!book) {
    throw new Error(
      "无法识别书卷：" + match[1]
    );
  }

  const chapter =
    Number(match[2]);

  const startVerse =
    Number(match[3]);

  const endVerse =
    match[4]
      ? Number(match[4])
      : startVerse;

  return {
    book,
    chapter,
    startVerse,
    endVerse
  };
}


// ---------------------------------------------------------------
// 6. 解析同一书卷中的多段
//
// 例如：
// 约翰福音 13:1-17,34-35
//
// 自动解析为：
// 13:1-17
// 13:34-35
// ---------------------------------------------------------------

function parseSameBookReference(reference) {

  const text =
    cleanReferenceText(reference);

  const match =
    text.match(
      /^(.+?)\s*(\d+):(.+)$/
    );

  if (!match) {

    return null;

  }

  const book =
    normalizeBook(match[1]);

  if (!book) {

    return null;

  }

  const chapter =
    Number(match[2]);

  const rangeText =
    match[3];

  const ranges =
    rangeText
      .split(
        /[;,，、]/
      )
      .map(
        x => x.trim()
      )
      .filter(Boolean);

  if (!ranges.length) {

    return null;

  }

  const result = [];

  for (
    const range of ranges
  ) {

    const m =
      range.match(
        /^(\d+)(?:-(\d+))?$/
      );

    if (!m) {

      return null;

    }

    result.push({

      book,

      chapter,

      startVerse:
        Number(m[1]),

      endVerse:
        m[2]
          ? Number(m[2])
          : Number(m[1])

    });

  }

  return result;
}


// ---------------------------------------------------------------
// 7. 分割复杂经文
//
// 支持：
//
// 使徒行传 1:8；2:1-21
//
// 约翰一书 1:1-4；3:16-18
//
// 马太福音 28:18-20；启示录 22:12-21
// ---------------------------------------------------------------

function splitReferenceSegments(reference) {

  return String(reference || "")
    .trim()
    .replace(/；/g, ";")
    .replace(/\|/g, ";")
    .split(";")
    .map(
      x => x.trim()
    )
    .filter(Boolean);

}


// ---------------------------------------------------------------
// 8. 完整解析经文引用
// ---------------------------------------------------------------

function parseBibleReference(reference) {

  const segments =
    splitReferenceSegments(
      reference
    );

  if (!segments.length) {

    throw new Error(
      "经文引用为空"
    );

  }

  const result = [];

  let lastBook = null;

  for (
    const segment of segments
  ) {

    // ----------------------------------------------------------
    // 情况 A：完整书名
    // ----------------------------------------------------------

    const sameBook =
      parseSameBookReference(
        segment
      );

    if (sameBook) {

      result.push(
        ...sameBook
      );

      lastBook =
        sameBook[0].book;

      continue;

    }


    // ----------------------------------------------------------
    // 情况 B：
    // 只写：
    // 2:1-21
    //
    // 表示继续使用前一个书卷
    // ----------------------------------------------------------

    const chapterOnly =
      segment.match(
        /^(\d+):(\d+)(?:-(\d+))?$/
      );

    if (
      chapterOnly &&
      lastBook
    ) {

      result.push({

        book:
          lastBook,

        chapter:
          Number(
            chapterOnly[1]
          ),

        startVerse:
          Number(
            chapterOnly[2]
          ),

        endVerse:
          chapterOnly[3]
            ? Number(
                chapterOnly[3]
              )
            : Number(
                chapterOnly[2]
              )

      });

      continue;

    }


    // ----------------------------------------------------------
    // 情况 C：普通单段
    // ----------------------------------------------------------

    const single =
      parseSingleReference(
        segment
      );

    result.push(
      single
    );

    lastBook =
      single.book;

  }

  return result;
}


// ================================================================
// 9. 从数据库寻找章节
// ================================================================

function findChapter(
  book,
  chapter
) {

  if (!BILA_DB) {

    throw new Error(
      "圣经数据库尚未加载"
    );

  }

  const normalized =
    normalizeBook(book);

  const bookData =
    BILA_DB.books.find(
      item =>
        item.name === normalized ||
        item.abbrev === normalized ||
        item.book === normalized
    );

  if (!bookData) {

    throw new Error(
      "数据库中找不到书卷：" +
      book
    );

  }

  const chapters =
    bookData.chapters;

  if (!Array.isArray(chapters)) {

    throw new Error(
      normalized +
      " 的章节数据格式错误"
    );

  }

  const chapterData =
    chapters[Number(chapter) - 1];

  if (!chapterData) {

    throw new Error(
      `${normalized} 第${chapter}章不存在`
    );

  }

  return {
    book: normalized,
    chapter: Number(chapter),
    data: chapterData
  };
}


// ================================================================
// 10. 把数据库章节转换成标准逐节结构
//
// 数据库可能是：
//
// [
//   "起初，神创造天地。",
//   "地是空虚混沌……"
// ]
//
// 也可能是对象数组。
//
// 这一层负责统一。
// ================================================================

function normalizeChapterVerses(
  chapterData
) {

  const result = [];

  // ----------------------------------------------------------
  // 数组：
// ["第一节文字","第二节文字"]
  // ----------------------------------------------------------

  if (
    Array.isArray(
      chapterData
    )
  ) {

    chapterData.forEach(
      (item,index) => {

        let text = "";

        let verseNumber =
          index + 1;

        if (
          typeof item ===
          "string"
        ) {

          text = item;

        }
        else if (
          item &&
          typeof item ===
          "object"
        ) {

          verseNumber =
            Number(
              item.verse ||
              item.verse_number ||
              item.number ||
              index + 1
            );

          text =
            item.text ||
            item.content ||
            "";

        }

        text =
          bilaCleanText(
            text
          );

        if (text) {

          result.push({

            verse:
              verseNumber,

            text

          });

        }

      }
    );

    return result;
  }


  // ----------------------------------------------------------
  // 对象格式
  // ----------------------------------------------------------

  if (
    chapterData &&
    typeof chapterData ===
    "object"
  ) {

    Object.keys(
      chapterData
    ).forEach(key => {

      const item =
        chapterData[key];

      let text = "";

      let verseNumber =
        Number(key);

      if (
        typeof item ===
        "string"
      ) {

        text = item;

      }
      else if (
        item &&
        typeof item ===
        "object"
      ) {

        verseNumber =
          Number(
            item.verse ||
            item.verse_number ||
            item.number ||
            key
          );

        text =
          item.text ||
          item.content ||
          "";

      }

      text =
        bilaCleanText(
          text
        );

      if (
        text &&
        Number.isFinite(
          verseNumber
        )
      ) {

        result.push({

          verse:
            verseNumber,

          text

        });

      }

    });

  }


  result.sort(
    (a,b) =>
      a.verse - b.verse
  );


  return result;
}


// ================================================================
// 11. 读取单段经文
// ================================================================

async function readSinglePassage(
  section
) {

  await loadBibleDatabase();

  const chapter =
    findChapter(
      section.book,
      section.chapter
    );

  const verses =
    normalizeChapterVerses(
      chapter.data
    );

  const selected =
    verses.filter(
      item =>
        item.verse >=
          section.startVerse &&
        item.verse <=
          section.endVerse
    );

  if (!selected.length) {

    throw new Error(
      `${section.book} ${section.chapter}:${section.startVerse}-${section.endVerse} 没有找到经文`
    );

  }

  return {

    book:
      section.book,

    chapter:
      section.chapter,

    startVerse:
      section.startVerse,

    endVerse:
      section.endVerse,

    verses:
      selected

  };
}


// ================================================================
// 12. 获取完整多段经文
// ================================================================

async function getBibleData(
  reference
) {

  const sections =
    parseBibleReference(
      reference
    );

  const results = [];

  const errors = [];

  for (
    const section of sections
  ) {

    try {

      const data =
        await readSinglePassage(
          section
        );

      results.push(
        data
      );

    }
    catch(error) {

      console.error(
        "❌ 经文读取失败：",
        section,
        error
      );

      errors.push({

        reference:
          `${section.book} ${section.chapter}:${section.startVerse}-${section.endVerse}`,

        error:
          error.message

      });

    }

  }


  const text =
    results
      .map(
        part =>

          part.verses
            .map(
              verse =>
                `${verse.verse} ${verse.text}`
            )
            .join("\n")
      )
      .join("\n");


  return {

    version:
      BILA_BIBLE_CONFIG.version,

    versionName:
      BILA_BIBLE_CONFIG.name,

    reference,

    sections:
      results,

    text,

    errors,

    success:
      results.length > 0 &&
      errors.length === 0,

    partial:
      results.length > 0 &&
      errors.length > 0

  };
}


// ================================================================
// 13. 直接返回经文文字
// ================================================================

async function getBibleText(
  reference
) {

  const data =
    await getBibleData(
      reference
    );


  if (
    !data.success &&
    !data.partial
  ) {

    throw new Error(
      data.errors[0]
        ? data.errors[0].error
        : "经文读取失败"
    );

  }


  return data.text;
}


// ================================================================
// 第2段结束
// ================================================================// ================================================================
// BILA Bible Engine V3.0
// 第3段：52周课程接口 + 第N周经文读取 + 工具函数
// ================================================================

// ---------------------------------------------------------------
// 14. 获取整章经文
// ---------------------------------------------------------------

async function getBibleChapter(book, chapter) {

  await loadBibleDatabase();

  const chapterInfo =
    findChapter(
      book,
      chapter
    );

  const verses =
    normalizeChapterVerses(
      chapterInfo.data
    );

  if (!verses.length) {

    throw new Error(
      `${book} 第${chapter}章没有有效经文`
    );

  }

  return verses;
}


// ---------------------------------------------------------------
// 15. 获取单节
// ---------------------------------------------------------------

async function getBibleVerse(
  book,
  chapter,
  verse
) {

  const verses =
    await getBibleChapter(
      book,
      chapter
    );

  const target =
    Number(verse);

  const result =
    verses.find(
      item =>
        item.verse === target
    );

  if (!result) {

    throw new Error(
      `${book} ${chapter}:${verse} 不存在`
    );

  }

  return result.text;
}


// ---------------------------------------------------------------
// 16. 获取单段
// ---------------------------------------------------------------

async function getBiblePassage(
  book,
  chapter,
  startVerse,
  endVerse
) {

  const verses =
    await getBibleChapter(
      book,
      chapter
    );

  const start =
    Number(startVerse);

  const end =
    Number(endVerse);

  const selected =
    verses.filter(
      item =>
        item.verse >= start &&
        item.verse <= end
    );

  if (!selected.length) {

    throw new Error(
      `${book} ${chapter}:${start}-${end} 没有找到经文`
    );

  }

  return selected
    .map(
      item =>
        `${item.verse} ${item.text}`
    )
    .join("\n");
}


// ---------------------------------------------------------------
// 17. 获取指定周的课程
// ---------------------------------------------------------------

async function getWeek(weekNumber) {

  const courses =
    await loadCurriculum();

  const week =
    Number(weekNumber);

  const result =
    courses.find(
      item =>
        Number(item.week) === week
    );

  if (!result) {

    throw new Error(
      "找不到第" +
      week +
      "周课程"
    );

  }

  return result;
}


// ---------------------------------------------------------------
// 18. 获取全部52周课程
// ---------------------------------------------------------------

async function getAllWeeks() {

  const courses =
    await loadCurriculum();

  return courses;
}


// ---------------------------------------------------------------
// 19. 第N周 + 圣经经文
//
// 例如：
// getWeekBible(1)
//
// 自动执行：
//
// 第1周CSV
//     ↓
// reference
//     ↓
// 本地圣经数据库
//     ↓
// 完整经文
// ---------------------------------------------------------------

async function getWeekBible(
  weekNumber
) {

  const course =
    await getWeek(
      weekNumber
    );


  if (
    !course.reference
  ) {

    throw new Error(
      `第${weekNumber}周没有经文引用`
    );

  }


  const bible =
    await getBibleData(
      course.reference
    );


  return {

    week:
      Number(course.week),

    reference:
      course.reference,

    // -----------------------------
    // 课程信息
    // -----------------------------

    sundayTheme:
      course.sunday_theme ||
      course.theme ||
      course.title ||
      "",

    bilaTheme:
      course.bila_theme ||
      course.focus ||
      "",

    practice:
      course.practice ||
      course.action ||
      course.practical ||
      "",

    groupFeedback:
      course.group_feedback ||
      course.feedback ||
      course.group ||
      "",

    mission:
      course.mission ||
      "",

    // -----------------------------
    // 圣经
    // -----------------------------

    bible

  };

}


// ---------------------------------------------------------------
// 20. 取得52周课程 + 经文
//
// 注意：
// 这里只会读取课程。
// 不会一次下载52周圣经。
// 使用时再读取。
// ---------------------------------------------------------------

async function getAllWeeksWithBible() {

  const courses =
    await loadCurriculum();

  const results = [];

  for (
    const course of courses
  ) {

    let bible = null;

    let error = null;

    try {

      if (
        course.reference
      ) {

        bible =
          await getBibleData(
            course.reference
          );

      }

    }
    catch(err) {

      error =
        err.message;

    }


    results.push({

      week:
        Number(course.week),

      reference:
        course.reference ||
        "",

      sundayTheme:
        course.sunday_theme ||
        course.theme ||
        course.title ||
        "",

      bilaTheme:
        course.bila_theme ||
        course.focus ||
        "",

      practice:
        course.practice ||
        course.action ||
        "",

      groupFeedback:
        course.group_feedback ||
        course.feedback ||
        "",

      mission:
        course.mission ||
        "",

      bible,

      error

    });

  }

  return results;
}


// ================================================================
// 21. 清除课程缓存
// ================================================================

function clearCurriculumCache() {

  BILA_CURRICULUM =
    null;

  console.log(
    "🗑️ 52周课程缓存已清除"
  );

}


// ================================================================
// 22. 清除数据库缓存
// ================================================================
//
// 当前本地数据库整体只读取一次，
// 清除后下次访问重新读取。
// ================================================================

function clearBibleDatabaseCache() {

  BILA_DB =
    null;

  console.log(
    "🗑️ 圣经数据库缓存已清除"
  );

}


// ================================================================
// 23. 清除全部缓存
// ================================================================

function clearAllCache() {

  clearCurriculumCache();

  clearBibleDatabaseCache();

  console.log(
    "🗑️ BILA Bible Engine 全部缓存已清除"
  );

}


// ================================================================
// 24. 数据库状态
// ================================================================

function bibleEngineStatus() {

  let totalVerses = 0;

  if (
    BILA_DB &&
    Array.isArray(
      BILA_DB.books
    )
  ) {

    BILA_DB.books.forEach(
      book => {

        if (
          Array.isArray(
            book.chapters
          )
        ) {

          book.chapters.forEach(
            chapter => {

              totalVerses +=
                normalizeChapterVerses(
                  chapter
                ).length;

            }
          );

        }

      }
    );

  }

  return {

    engine:
      "BILA Bible Engine V3.0",

    version:
      BILA_BIBLE_CONFIG.version,

    name:
      BILA_BIBLE_CONFIG.name,

    database:
      BILA_DB
        ? "已加载"
        : "未加载",

    books:
      BILA_DB &&
      Array.isArray(
        BILA_DB.books
      )
        ? BILA_DB.books.length
        : 0,

    verses:
      totalVerses,

    curriculum:
      BILA_CURRICULUM
        ? "已加载"
        : "未加载",

    weeks:
      BILA_CURRICULUM
        ? BILA_CURRICULUM.length
        : 0

  };

}


// ================================================================
// 25. 简单测试
// ================================================================

async function testBibleReference(
  reference
) {

  console.log(
    "======================================"
  );

  console.log(
    "📖 测试经文：",
    reference
  );

  console.log(
    "======================================"
  );


  try {

    const data =
      await getBibleData(
        reference
      );


    console.log(
      "✅ 经文读取成功"
    );


    console.log(
      data
    );


    console.log(
      data.text
    );


    return data;

  }
  catch(error) {

    console.error(
      "❌ 经文读取失败：",
      error
    );

    throw error;

  }

}


// ================================================================
// 26. 第1周测试
// ================================================================

async function testWeek1() {

  console.log(
    "🌿 BILA 第1周测试"
  );

  const data =
    await getWeekBible(
      1
    );

  console.log(
    data
  );

  return data;
}


// ================================================================
// 27. 指定周测试
// ================================================================

async function testWeek(
  weekNumber
) {

  const data =
    await getWeekBible(
      Number(weekNumber)
    );

  console.log(
    `✅ 第${weekNumber}周测试成功`
  );

  console.log(
    data
  );

  return data;
}// ================================================================
// BILA Bible Engine V3.0
// 第4段：对外接口 + 启动检查
// ================================================================


// ================================================================
// 28. 对外暴露 BilaBible 接口
// ================================================================
//
// 兼容现有 index.html：
//
// BilaBible.getWeekBible(1)
//
// 同时提供：
//
// BilaBible.text(...)
// BilaBible.data(...)
// BilaBible.chapter(...)
// BilaBible.verse(...)
//
// ================================================================

if (
  typeof window !== "undefined"
) {

  window.BilaBible = {

    // ------------------------------------------------------------
    // 基础配置
    // ------------------------------------------------------------

    config:
      BILA_BIBLE_CONFIG,


    // ------------------------------------------------------------
    // 数据加载
    // ------------------------------------------------------------

    loadDatabase:
      loadBibleDatabase,

    loadCurriculum:
      loadCurriculum,


    // ------------------------------------------------------------
    // 课程
    // ------------------------------------------------------------

    getWeek:
      getWeek,

    getAllWeeks:
      getAllWeeks,

    getWeekBible:
      getWeekBible,

    getAllWeeksWithBible:
      getAllWeeksWithBible,


    // ------------------------------------------------------------
    // 圣经
    // ------------------------------------------------------------

    verse:
      getBibleVerse,

    chapter:
      getBibleChapter,

    passage:
      getBiblePassage,

    text:
      getBibleText,

    data:
      getBibleData,


    // ------------------------------------------------------------
    // 引用解析
    // ------------------------------------------------------------

    parse:
      parseBibleReference,


    // ------------------------------------------------------------
    // 缓存
    // ------------------------------------------------------------

    clearCurriculumCache:
      clearCurriculumCache,

    clearBibleDatabaseCache:
      clearBibleDatabaseCache,

    clearAllCache:
      clearAllCache,


    // ------------------------------------------------------------
    // 状态
    // ------------------------------------------------------------

    status:
      bibleEngineStatus,


    // ------------------------------------------------------------
    // 测试
    // ------------------------------------------------------------

    testBibleReference:
      testBibleReference,

    testWeek1:
      testWeek1,

    testWeek:
      testWeek

  };

}


// ================================================================
// 29. 启动状态提示
// ================================================================

console.log(
  "=============================================="
);

console.log(
  "🌿 BILA Bible Engine V3.0"
);

console.log(
  "=============================================="
);

console.log(
  "📖 圣经版本：",
  BILA_BIBLE_CONFIG.name
);

console.log(
  "📚 数据库：",
  BILA_BIBLE_CONFIG.databaseUrl
);

console.log(
  "📅 课程：",
  BILA_BIBLE_CONFIG.curriculumUrl
);

console.log(
  "=============================================="
);

console.log(
  "✅ Bible Engine 已就绪"
);

console.log(
  "🧪 测试第1周：testWeek1()"
);

console.log(
  "🧪 测试单段：BilaBible.testBibleReference('约翰福音 1:1-18')"
);

console.log(
  "🧪 测试状态：BilaBible.status()"
);

console.log(
  "=============================================="
);


// ================================================================
// 30. 可选自动检查
// ================================================================
//
// 这里只检查文件是否存在，
// 不自动加载3MB数据库，避免网页打开时卡顿。
// ================================================================

(function checkBibleEngineFiles() {

  if (
    typeof window === "undefined"
  ) {

    return;

  }


  fetch(
    BILA_BIBLE_CONFIG.databaseUrl,
    {
      method: "HEAD"
    }
  )
    .then(response => {

      if (!response.ok) {

        console.warn(
          "⚠️ 圣经数据库文件可能不存在：",
          BILA_BIBLE_CONFIG.databaseUrl
        );

        return;

      }

      console.log(
        "✅ 已找到本地圣经数据库文件"
      );

    })
    .catch(error => {

      console.warn(
        "⚠️ 无法检查圣经数据库文件。",
        error
      );

    });


  fetch(
    BILA_BIBLE_CONFIG.curriculumUrl,
    {
      method: "HEAD"
    }
  )
    .then(response => {

      if (!response.ok) {

        console.warn(
          "⚠️ 52-weeks.csv 文件可能不存在"
        );

        return;

      }

      console.log(
        "✅ 已找到52周课程文件"
      );

    })
    .catch(error => {

      console.warn(
        "⚠️ 无法检查52周课程文件。",
        error
      );

    });

})();


// ================================================================
// END OF BILA Bible Engine V3.0
// ================================================================
