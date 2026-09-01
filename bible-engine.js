// ================================================================
// BILA Bible Engine V4.1
// PART 1 / 4
//
// 这一版先完整设计，再固定分成4段。
// 不修改：
//   52-weeks.csv
//   bila-cuv-pdf-database.json
//   index.html
//
// 数据库原生经文引用：
//   约1:1
//   约1:1-18
//   约13:1-17,34-35
//   徒1:8；2:1-21
//   约一1:1-4；3:16-18
//
// ================================================================

// ===== V4.1 PART 1 START ========================================


// ================================================================
// 1. 基础配置
// ================================================================

const BILA_BIBLE_CONFIG = {

  // 圣经数据库
  databaseUrl:
    "bila-cuv-pdf-database.json",

  // 52周课程
  curriculumUrl:
    "52-weeks.csv",

  // 版本
  version:
    "CUV",

  versionName:
    "和合本",

  // 超时时间
  timeout:
    20000

};


// ================================================================
// 2. 66卷圣经标准表
//
// [完整书名, 英文/数据库缩写, 中文数据库简称]
// ================================================================

const BILA_BOOK_TABLE = [

  ["创世记", "gn", "创"],
  ["出埃及记", "ex", "出"],
  ["利未记", "lv", "利"],
  ["民数记", "nm", "民"],
  ["申命记", "dt", "申"],

  ["约书亚记", "js", "书"],
  ["士师记", "jud", "士"],
  ["路得记", "rt", "得"],

  ["撒母耳记上", "1sm", "撒上"],
  ["撒母耳记下", "2sm", "撒下"],

  ["列王纪上", "1ki", "王上"],
  ["列王纪下", "2ki", "王下"],

  ["历代志上", "1ch", "代上"],
  ["历代志下", "2ch", "代下"],

  ["以斯拉记", "ezr", "拉"],
  ["尼希米记", "ne", "尼"],
  ["以斯帖记", "est", "斯"],

  ["约伯记", "job", "伯"],
  ["诗篇", "ps", "诗"],
  ["箴言", "pr", "箴"],
  ["传道书", "ec", "传"],
  ["雅歌", "so", "歌"],

  ["以赛亚书", "isa", "赛"],
  ["耶利米书", "jer", "耶"],
  ["耶利米哀歌", "lam", "哀"],
  ["以西结书", "ezk", "结"],
  ["但以理书", "dan", "但"],

  ["何西阿书", "hos", "何"],
  ["约珥书", "jl", "珥"],
  ["阿摩司书", "am", "摩"],
  ["俄巴底亚书", "ob", "俄"],
  ["约拿书", "jon", "拿"],
  ["弥迦书", "mic", "弥"],
  ["那鸿书", "nah", "鸿"],
  ["哈巴谷书", "hab", "哈"],
  ["西番雅书", "zep", "番"],
  ["哈该书", "hag", "该"],
  ["撒迦利亚书", "zec", "亚"],
  ["玛拉基书", "mal", "玛"],

  ["马太福音", "mt", "太"],
  ["马可福音", "mk", "可"],
  ["路加福音", "lk", "路"],
  ["约翰福音", "jn", "约"],
  ["使徒行传", "ac", "徒"],

  ["罗马书", "rm", "罗"],
  ["哥林多前书", "1co", "林前"],
  ["哥林多后书", "2co", "林后"],
  ["加拉太书", "ga", "加"],
  ["以弗所书", "ep", "弗"],
  ["腓立比书", "ph", "腓"],
  ["歌罗西书", "cl", "西"],

  ["帖撒罗尼迦前书", "1th", "帖前"],
  ["帖撒罗尼迦后书", "2th", "帖后"],

  ["提摩太前书", "1ti", "提前"],
  ["提摩太后书", "2ti", "提后"],
  ["提多书", "tt", "多"],
  ["腓利门书", "phm", "门"],

  ["希伯来书", "hb", "来"],
  ["雅各书", "jm", "雅"],

  ["彼得前书", "1pe", "彼前"],
  ["彼得后书", "2pe", "彼后"],

  ["约翰一书", "1jn", "约一"],
  ["约翰二书", "2jn", "约二"],
  ["约翰三书", "3jn", "约三"],

  ["犹大书", "jd", "犹"],

  ["启示录", "rv", "启"]

];


// ================================================================
// 3. 书卷简称映射
// ================================================================

const BILA_BOOK_ALIASES = {

  "创": "创世记",
  "出": "出埃及记",
  "利": "利未记",
  "民": "民数记",
  "申": "申命记",

  "书": "约书亚记",
  "士": "士师记",
  "得": "路得记",

  "撒上": "撒母耳记上",
  "撒下": "撒母耳记下",

  "王上": "列王纪上",
  "王下": "列王纪下",

  "代上": "历代志上",
  "代下": "历代志下",

  "拉": "以斯拉记",
  "尼": "尼希米记",
  "斯": "以斯帖记",

  "伯": "约伯记",
  "诗": "诗篇",
  "箴": "箴言",
  "传": "传道书",
  "歌": "雅歌",

  "赛": "以赛亚书",
  "耶": "耶利米书",
  "哀": "耶利米哀歌",
  "结": "以西结书",
  "但": "但以理书",

  "何": "何西阿书",
  "珥": "约珥书",
  "摩": "阿摩司书",
  "俄": "俄巴底亚书",
  "拿": "约拿书",
  "弥": "弥迦书",
  "鸿": "那鸿书",
  "哈": "哈巴谷书",
  "番": "西番雅书",
  "该": "哈该书",
  "亚": "撒迦利亚书",
  "玛": "玛拉基书",

  "太": "马太福音",
  "可": "马可福音",
  "路": "路加福音",
  "约": "约翰福音",
  "徒": "使徒行传",

  "罗": "罗马书",
  "林前": "哥林多前书",
  "林后": "哥林多后书",
  "加": "加拉太书",
  "弗": "以弗所书",
  "腓": "腓立比书",
  "西": "歌罗西书",

  "帖前": "帖撒罗尼迦前书",
  "帖后": "帖撒罗尼迦后书",

  "提前": "提摩太前书",
  "提后": "提摩太后书",
  "多": "提多书",
  "门": "腓利门书",

  "来": "希伯来书",
  "雅": "雅各书",

  "彼前": "彼得前书",
  "彼后": "彼得后书",

  "约一": "约翰一书",
  "约二": "约翰二书",
  "约三": "约翰三书",

  "犹": "犹大书",
  "启": "启示录"

};


// ================================================================
// 4. 数据缓存
// ================================================================

let BILA_DB = null;

let BILA_DB_PROMISE = null;

let BILA_CURRICULUM = null;

let BILA_CURRICULUM_PROMISE = null;


// ================================================================
// 5. 文本清理
// ================================================================

function bilaCleanText(text) {

  if (
    text === null ||
    text === undefined
  ) {

    return "";

  }


  let value =
    String(text);


  // 去 BOM
  value =
    value.replace(
      /^\uFEFF/,
      ""
    );


  // 去 HTML 标签
  value =
    value.replace(
      /<[^>]*>/g,
      ""
    );


  // 换行、Tab
  value =
    value.replace(
      /[\r\n\t]+/g,
      " "
    );


  // 连续空格
  value =
    value.replace(
      /\s+/g,
      " "
    );


  // 中文字符之间的错误空格
  for (
    let i = 0;
    i < 4;
    i++
  ) {

    value =
      value.replace(
        /([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g,
        "$1$2"
      );

  }


  // 中文文字 + 中文标点
  value =
    value.replace(
      /([\u4e00-\u9fff])\s+([，。！？；：、])/g,
      "$1$2"
    );


  // 标点后的错误空格
  value =
    value.replace(
      /([，。！？；：、])\s+/g,
      "$1"
    );


  return value.trim();

}


// ================================================================
// 6. 经文引用标准化
// ================================================================

function bilaNormalizeReference(
  reference
) {

  return String(
    reference || ""
  )

    .replace(
      /^\uFEFF/,
      ""
    )

    // 全角冒号 → 半角
    .replace(
      /：/g,
      ":"
    )

    // 各种横线 → -
    .replace(
      /[－–—﹣]/g,
      "-"
    )

    // 中文空白
    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


// ================================================================
// 7. 标准化书卷
// ================================================================

function normalizeBibleBook(
  book
) {

  const value =
    String(
      book || ""
    )
    .trim();


  if (!value) {

    return null;

  }


  // 简称
  if (
    BILA_BOOK_ALIASES[value]
  ) {

    return BILA_BOOK_ALIASES[
      value
    ];

  }


  // 完整书名
  const full =
    BILA_BOOK_TABLE.find(
      item =>
        item[0] === value
    );


  if (full) {

    return full[0];

  }


  // 英文/数据库简称
  const abbrev =
    BILA_BOOK_TABLE.find(
      item =>
        item[1] === value
    );


  if (abbrev) {

    return abbrev[0];

  }


  return null;

}


// ================================================================
// 8. 根据内部书名获取书卷表项
// ================================================================

function getBookDefinition(
  canonicalBook
) {

  return (
    BILA_BOOK_TABLE.find(
      item =>
        item[0] === canonicalBook
    ) ||
    null
  );

}


// ================================================================
// 9. 加载圣经 JSON
// ================================================================
//
// 兼容：
// [
//   {...},
//   {...}
// ]
//
// 以及：
// {
//   "books":[...]
// }
//
// ================================================================

async function loadBibleDatabase() {

  if (BILA_DB) {

    return BILA_DB;

  }


  if (BILA_DB_PROMISE) {

    return BILA_DB_PROMISE;

  }


  console.log(
    "📖 正在加载本地圣经数据库：",
    BILA_BIBLE_CONFIG.databaseUrl
  );


  BILA_DB_PROMISE =
    fetch(
      BILA_BIBLE_CONFIG.databaseUrl,
      {
        cache:
          "no-cache"
      }
    )

    .then(
      response => {

        if (!response.ok) {

          throw new Error(
            "圣经数据库加载失败：HTTP " +
            response.status
          );

        }


        return response.json();

      }
    )

    .then(
      raw => {

        if (
          Array.isArray(raw)
        ) {

          BILA_DB = {

            books:
              raw

          };

        }

        else if (
          raw &&
          Array.isArray(
            raw.books
          )
        ) {

          BILA_DB =
            raw;

        }

        else {

          throw new Error(
            "圣经 JSON 根结构无法识别"
          );

        }


        console.log(
          "✅ 圣经数据库加载成功：",
          BILA_DB.books.length,
          "卷"
        );


        return BILA_DB;

      }
    )

    .finally(
      () => {

        BILA_DB_PROMISE =
          null;

      }
    );


  return BILA_DB_PROMISE;

}


// ================================================================
// 10. 查找数据库中的书卷
//
// 第一优先：数据库 abbrev
// 第二优先：中文名称
// 第三优先：66卷顺序
// ================================================================

async function getBibleBook(
  requestedBook
) {

  const db =
    await loadBibleDatabase();


  const canonical =
    normalizeBibleBook(
      requestedBook
    );


  if (!canonical) {

    throw new Error(
      "无法识别书卷：" +
      requestedBook
    );

  }


  const definition =
    getBookDefinition(
      canonical
    );


  if (!definition) {

    throw new Error(
      "书卷定义不存在：" +
      canonical
    );

  }


  const englishAbbrev =
    definition[1];


  const chineseShort =
    definition[2];


  // ------------------------------------------------------------
  // 方法1：数据库 abbrev
  // ------------------------------------------------------------

  let book =
    db.books.find(
      item => {

        const abbrev =
          String(
            item?.abbrev ??
            ""
          )
          .trim()
          .toLowerCase();


        return (
          abbrev ===
          chineseShort.toLowerCase() ||

          abbrev ===
          englishAbbrev.toLowerCase()
        );

      }
    );


  // ------------------------------------------------------------
  // 方法2：数据库 name/title/book
  // ------------------------------------------------------------

  if (!book) {

    book =
      db.books.find(
        item => {

          const names = [

            item?.name,
            item?.title,
            item?.book,
            item?.zh,
            item?.zhName,
            item?.short

          ]

          .filter(Boolean)

          .map(
            value =>
              String(value)
                .trim()
          );


          return (
            names.includes(
              canonical
            ) ||

            names.includes(
              chineseShort
            )

          );

        }
      );

  }


  // ------------------------------------------------------------
  // 方法3：数据库按66卷标准顺序
  // ------------------------------------------------------------

  if (!book) {

    const index =
      BILA_BOOK_TABLE.findIndex(
        item =>
          item[0] ===
          canonical
      );


    if (
      index >= 0 &&
      db.books[index]
    ) {

      book =
        db.books[index];

    }

  }


  if (!book) {

    throw new Error(
      "数据库中找不到：" +
      canonical
    );

  }


  return book;

}


// ================================================================
// ===== V4.1 PART 1 END ==========================================
// ================================================================// ================================================================
// BILA Bible Engine V4.1
// PART 2 / 4
//
// 章节读取 + 逐节标准化
// ================================================================

// ===== V4.1 PART 2 START ========================================


// ================================================================
// 11. 获取原始章节
// ================================================================

function getRawBibleChapter(
  book,
  chapterNumber
) {

  if (
    !book ||
    !Array.isArray(
      book.chapters
    )
  ) {

    throw new Error(
      "书卷 chapters 数据不存在或格式错误"
    );

  }


  const chapter =
    Number(
      chapterNumber
    );


  if (
    !Number.isInteger(
      chapter
    ) ||
    chapter < 1
  ) {

    throw new Error(
      "章节编号无效：" +
      chapterNumber
    );

  }


  const index =
    chapter - 1;


  if (
    index >=
    book.chapters.length
  ) {

    throw new Error(
      `第${chapter}章不存在`
    );

  }


  const result =
    book.chapters[index];


  if (
    result === null ||
    result === undefined
  ) {

    throw new Error(
      `第${chapter}章数据为空`
    );

  }


  return result;

}


// ================================================================
// 12. 标准化逐节数据
// ================================================================
//
// 支持：
//
// [
//
//   "太初有道……",
//   "这道太初与神同在……"
//
// ]
//
// 也支持：
//
// [
//
//   { verse:1, text:"..." },
//   { verse:2, text:"..." }
//
// ]
//
// 以及：
//
// {
//
//   "1":"太初有道……",
//   "2":"这道太初与神同在……"
//
// }
//
// ================================================================

function normalizeBibleVerses(
  chapter
) {

  const verses =
    [];


  // ------------------------------------------------------------
  // A. 数组
  // ------------------------------------------------------------

  if (
    Array.isArray(
      chapter
    )
  ) {

    chapter.forEach(
      (
        item,
        index
      ) => {

        let verseNumber =
          index + 1;

        let text =
          "";


        // 普通字符串
        if (
          typeof item ===
          "string"
        ) {

          text =
            item;

        }


        // 对象
        else if (
          item &&
          typeof item ===
          "object"
        ) {

          const rawVerse =
            item.verse ??
            item.verse_number ??
            item.number ??
            item.id ??
            index + 1;


          verseNumber =
            Number(
              rawVerse
            );


          text =
            item.text ??
            item.content ??
            item.value ??
            item.verseText ??
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

          verses.push({

            verse:
              verseNumber,

            text:
              text

          });

        }

      }
    );

  }


  // ------------------------------------------------------------
  // B. 对象
  // ------------------------------------------------------------

  else if (
    chapter &&
    typeof chapter ===
    "object"
  ) {

    Object.keys(
      chapter
    ).forEach(
      key => {

        const item =
          chapter[key];


        let verseNumber =
          Number(
            key
          );


        let text =
          "";


        if (
          typeof item ===
          "string"
        ) {

          text =
            item;

        }

        else if (
          item &&
          typeof item ===
          "object"
        ) {

          verseNumber =
            Number(
              item.verse ??
              item.verse_number ??
              item.number ??
              key
            );


          text =
            item.text ??
            item.content ??
            item.value ??
            item.verseText ??
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

          verses.push({

            verse:
              verseNumber,

            text:
              text

          });

        }

      }
    );

  }


  // ------------------------------------------------------------
  // 按节号排序
  // ------------------------------------------------------------

  verses.sort(
    (
      a,
      b
    ) =>
      a.verse -
      b.verse
  );


  // ------------------------------------------------------------
  // 去重
  // ------------------------------------------------------------

  const unique =
    [];

  const seen =
    new Set();


  verses.forEach(
    verse => {

      if (
        seen.has(
          verse.verse
        )
      ) {

        return;

      }


      seen.add(
        verse.verse
      );


      unique.push(
        verse
      );

    }
  );


  return unique;

}


// ================================================================
// 13. 获取整章
// ================================================================

async function getBibleChapter(
  bookReference,
  chapterNumber
) {

  const book =
    await getBibleBook(
      bookReference
    );


  const rawChapter =
    getRawBibleChapter(
      book,
      chapterNumber
    );


  const verses =
    normalizeBibleVerses(
      rawChapter
    );


  if (
    !verses.length
  ) {

    throw new Error(
      `${bookReference} 第${chapterNumber}章没有可读取的经文`
    );

  }


  return verses;

}


// ================================================================
// 14. 获取单节
// ================================================================

async function getBibleVerse(
  bookReference,
  chapterNumber,
  verseNumber
) {

  const verses =
    await getBibleChapter(
      bookReference,
      chapterNumber
    );


  const target =
    Number(
      verseNumber
    );


  const result =
    verses.find(
      verse =>
        verse.verse ===
        target
    );


  if (!result) {

    throw new Error(
      `${bookReference} ${chapterNumber}:${verseNumber} 不存在`
    );

  }


  return result.text;

}


// ================================================================
// 15. 获取节范围
// ================================================================

async function getBiblePassage(
  bookReference,
  chapterNumber,
  startVerse,
  endVerse
) {

  const verses =
    await getBibleChapter(
      bookReference,
      chapterNumber
    );


  let start =
    Number(
      startVerse
    );


  let end =
    Number(
      endVerse
    );


  if (
    !Number.isFinite(
      start
    )
  ) {

    throw new Error(
      "开始节编号无效"
    );

  }


  if (
    !Number.isFinite(
      end
    )
  ) {

    end =
      start;

  }


  if (
    end <
    start
  ) {

    const temp =
      start;

    start =
      end;

    end =
      temp;

  }


  const selected =
    verses.filter(
      verse =>
        verse.verse >=
          start &&
        verse.verse <=
          end
    );


  if (
    !selected.length
  ) {

    throw new Error(
      `${bookReference} ${chapterNumber}:${start}-${end} 没有找到经文`
    );

  }


  return selected;

}


// ================================================================
// 16. 格式化经文为文字
// ================================================================

function formatBibleVerses(
  verses
) {

  if (
    !Array.isArray(
      verses
    )
  ) {

    return "";

  }


  return verses
    .map(
      verse =>
        `${verse.verse} ${verse.text}`
    )
    .join("\n");

}


// ================================================================
// 17. 根据范围读取
// ================================================================

async function readBibleRange(
  section
) {

  const verses =
    await getBiblePassage(
      section.book,
      section.chapter,
      section.startVerse,
      section.endVerse
    );


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

      verses

  };

}


// ================================================================
// 18. 数据库结构检查
// ================================================================

async function inspectBibleDatabase() {

  const db =
    await loadBibleDatabase();


  const result = {

    books:
      db.books.length,

    firstBook:
      db.books[0]
        ? {
            abbrev:
              db.books[0].abbrev,

            name:
              db.books[0].name,

            chapters:
              Array.isArray(
                db.books[0].chapters
              )
                ? db.books[0]
                    .chapters.length
                : 0
          }
        : null,

    lastBook:
      db.books[
        db.books.length - 1
      ]
        ? {
            abbrev:
              db.books[
                db.books.length - 1
              ].abbrev,

            name:
              db.books[
                db.books.length - 1
              ].name,

            chapters:
              Array.isArray(
                db.books[
                  db.books.length - 1
                ].chapters
              )
                ? db.books[
                    db.books.length - 1
                  ].chapters.length
                : 0
          }
        : null

  };


  console.log(
    "📚 Bible Database：",
    result
  );


  return result;

}


// ================================================================
// ===== V4.1 PART 2 END ==========================================
// ================================================================// ================================================================
// BILA Bible Engine V4.1
// PART 3 / 4
//
// 经文引用解析 + 多段引用 + 实际读取
// ================================================================

// ===== V4.1 PART 3 START ========================================


// ================================================================
// 19. 解析单个“书卷 + 章节 + 节”
// ================================================================
//
// 支持：
// 约1:1
// 约1:1-18
// 约一1:1-4
// 启22:12-21
//
// ================================================================

function parseSingleBibleReference(
  reference
) {

  const text =
    bilaNormalizeReference(
      reference
    );


  const match =
    text.match(
      /^(.+?)\s*(\d+):(\d+)(?:-(\d+))?$/
    );


  if (!match) {

    return null;

  }


  const book =
    normalizeBibleBook(
      match[1]
    );


  if (!book) {

    return null;

  }


  const chapter =
    Number(
      match[2]
    );


  const startVerse =
    Number(
      match[3]
    );


  const endVerse =
    match[4]
      ? Number(
          match[4]
        )
      : startVerse;


  return {

    book,

    chapter,

    startVerse,

    endVerse

  };

}


// ================================================================
// 20. 分割多个经文引用
// ================================================================
//
// 支持：
//
// 徒1:8；2:1-21
//
// 约一1:1-4；3:16-18
//
// 太28:18-20；启22:12-21
//
// ================================================================

function splitBibleReferences(
  reference
) {

  return bilaNormalizeReference(
    reference
  )

    .replace(
      /；/g,
      ";"
    )

    .replace(
      /｜/g,
      ";"
    )

    .split(";")

    .map(
      item =>
        item.trim()
    )

    .filter(Boolean);

}


// ================================================================
// 21. 完整经文解析
// ================================================================

function parseBibleReference(
  reference
) {

  const segments =
    splitBibleReferences(
      reference
    );


  if (
    !segments.length
  ) {

    throw new Error(
      "经文引用为空"
    );

  }


  const sections = [];

  let lastBook =
    null;


  for (
    const segment
    of segments
  ) {

    // ------------------------------------------------------------
    // A. 完整格式
    // ------------------------------------------------------------

    const parsed =
      parseSingleBibleReference(
        segment
      );


    if (parsed) {

      sections.push(
        parsed
      );

      lastBook =
        parsed.book;

      continue;

    }


    // ------------------------------------------------------------
    // B. 省略书卷
    //
    // 徒1:8；2:1-21
    //           ↑
    //          省略 徒
    // ------------------------------------------------------------

    const continuation =
      segment.match(
        /^(\d+):(\d+)(?:-(\d+))?$/
      );


    if (
      continuation &&
      lastBook
    ) {

      const chapter =
        Number(
          continuation[1]
        );


      const startVerse =
        Number(
          continuation[2]
        );


      const endVerse =
        continuation[3]
          ? Number(
              continuation[3]
            )
          : startVerse;


      sections.push({

        book:
          lastBook,

        chapter,

        startVerse,

        endVerse

      });


      continue;

    }


    throw new Error(
      "无法解析经文：" +
      segment
    );

  }


  return sections;

}


// ================================================================
// 22. 读取一个经文段
// ================================================================

async function readBibleSection(
  section
) {

  const verses =
    await getBiblePassage(
      section.book,
      section.chapter,
      section.startVerse,
      section.endVerse
    );


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
      verses

  };

}


// ================================================================
// 23. 获取完整经文数据
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
    const section
    of sections
  ) {

    try {

      const result =
        await readBibleSection(
          section
        );


      results.push(
        result
      );

    }

    catch(error) {

      console.error(
        "❌ 经文段读取失败：",
        section,
        error
      );


      errors.push({

        book:
          section.book,

        chapter:
          section.chapter,

        startVerse:
          section.startVerse,

        endVerse:
          section.endVerse,

        message:
          error.message

      });

    }

  }


  const allVerses =
    results.flatMap(
      result =>
        result.verses
    );


  const text =
    results
      .map(
        result =>
          formatBibleVerses(
            result.verses
          )
      )
      .join("\n");


  return {

    version:
      BILA_BIBLE_CONFIG.version,

    versionName:
      BILA_BIBLE_CONFIG.versionName,

    reference,

    sections:
      results,

    verses:
      allVerses,

    text,

    errors,

    success:
      results.length ===
      sections.length,

    partial:
      results.length > 0 &&
      results.length <
        sections.length

  };

}


// ================================================================
// 24. 直接获取文字
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

      data.errors.length

        ? data.errors[0].message

        : "经文读取失败"

    );

  }


  return data.text;

}


// ================================================================
// 25. 直接通过引用取得经文段
// ================================================================
//
// 示例：
//
// getBibleReferenceText("约1:1-18")
//
// ================================================================

async function getBibleReferenceText(
  reference
) {

  return await getBibleText(
    reference
  );

}


// ================================================================
// 26. 专项测试：原生简称格式
// ================================================================

async function testBilaBibleReferences() {

  const tests = [

    "约1:1",

    "约1:1-18",

    "可1:14-20",

    "路5:1-11",

    "罗5:1-11",

    "徒1:8；2:1-21",

    "约13:1-17,34-35",

    "约一1:1-4；3:16-18",

    "太28:18-20；启22:12-21"

  ];


  const results = [];


  for (
    const reference
    of tests
  ) {

    try {

      const data =
        await getBibleData(
          reference
        );


      results.push({

        reference,

        success:
          data.success,

        partial:
          data.partial,

        sections:
          data.sections.length,

        verses:
          data.verses.length,

        errors:
          data.errors.length

      });


      console.log(
        "✅",
        reference
      );


    }

    catch(error) {

      results.push({

        reference,

        success:
          false,

        partial:
          false,

        sections:
          0,

        verses:
          0,

        errors:
          1,

        message:
          error.message

      });


      console.error(
        "❌",
        reference,
        error
      );

    }

  }


  console.table(
    results
  );


  return results;

}


// ================================================================
// 27. 最重要的单项测试
// ================================================================

async function testJohn1() {

  const data =
    await getBibleData(
      "约1:1-18"
    );


  console.log(
    "========================================"
  );

  console.log(
    "📖 约1:1-18 测试"
  );

  console.log(
    "========================================"
  );

  console.log(
    data
  );

  console.log(
    data.text
  );


  return data;

}


// ================================================================
// 28. 数据库原生格式检查
// ================================================================
//
// 显示：
//
// 第一卷 abbrev
// 第43卷 abbrev
// 第66卷 abbrev
//
// 用来确认 JSON 的书卷简称。
// ================================================================

async function inspectNativeBookFormat() {

  const db =
    await loadBibleDatabase();


  console.log(
    "========================================"
  );

  console.log(
    "📚 数据库原生书卷格式"
  );

  console.log(
    "========================================"
  );


  console.log(
    "总书卷：",
    db.books.length
  );


  [0, 42, 65].forEach(
    index => {

      const book =
        db.books[index];


      if (!book) {

        return;

      }


      console.log(
        `第${index + 1}卷：`,
        {
          abbrev:
            book.abbrev,

          name:
            book.name,

          chapters:
            Array.isArray(
              book.chapters
            )
              ? book.chapters.length
              : 0
        }
      );

    }
  );


  return db;

}


// ================================================================
// ===== V4.1 PART 3 END ==========================================
// ================================================================// ================================================================
// BILA Bible Engine V4.1
// PART 4 / 4
//
// 52周课程读取
// getWeek()
// getWeekBible()
// 状态检查
// 缓存控制
// BilaBible 对外接口
//
// ===== V4.1 PART 4 START ========================================


// ================================================================
// 29. CSV 解析
// ================================================================

function parseCSV(
  text
) {

  const rows = [];

  let row = [];

  let cell = "";

  let quoted = false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const ch =
      text[i];

    const next =
      text[i + 1];


    if (
      ch === '"'
    ) {

      if (
        quoted &&
        next === '"'
      ) {

        cell += '"';

        i++;

      } else {

        quoted =
          !quoted;

      }

      continue;

    }


    if (
      ch === "," &&
      !quoted
    ) {

      row.push(
        cell.trim()
      );

      cell = "";

      continue;

    }


    if (
      (ch === "\n" ||
       ch === "\r") &&
      !quoted
    ) {

      if (
        ch === "\r" &&
        next === "\n"
      ) {

        i++;

      }


      row.push(
        cell.trim()
      );


      if (
        row.some(
          value =>
            value !== ""
        )
      ) {

        rows.push(
          row
        );

      }


      row = [];

      cell = "";

      continue;

    }


    cell +=
      ch;

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
        value =>
          value !== ""
      )
    ) {

      rows.push(
        row
      );

    }

  }


  if (
    rows.length <
    2
  ) {

    return [];

  }


  const headers =
    rows[0]
      .map(
        value =>
          String(value)
            .replace(
              /^\uFEFF/,
              ""
            )
            .trim()
      );


  return rows
    .slice(1)
    .map(
      values => {

        const obj = {};


        headers.forEach(
          (
            header,
            index
          ) => {

            obj[header] =
              String(
                values[index] ??
                ""
              ).trim();

          }
        );


        return obj;

      }
    );

}


// ================================================================
// 30. 加载52周课程
// ================================================================

async function loadCurriculum() {

  if (
    BILA_CURRICULUM
  ) {

    return BILA_CURRICULUM;

  }


  if (
    BILA_CURRICULUM_PROMISE
  ) {

    return BILA_CURRICULUM_PROMISE;

  }


  console.log(
    "📅 正在加载52周课程：",
    BILA_BIBLE_CONFIG.curriculumUrl
  );


  BILA_CURRICULUM_PROMISE =
    fetch(
      BILA_BIBLE_CONFIG.curriculumUrl,
      {
        cache:
          "no-cache"
      }
    )

    .then(
      response => {

        if (
          !response.ok
        ) {

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
          parseCSV(
            text
          );


        if (
          rows.length <
          52
        ) {

          throw new Error(
            "52-weeks.csv 读取失败，只找到 " +
            rows.length +
            " 周"
          );

        }


        BILA_CURRICULUM =
          rows;


        console.log(
          "✅ 52周课程读取成功：",
          rows.length,
          "周"
        );


        return BILA_CURRICULUM;

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


// ================================================================
// 31. 获取52周总数
// ================================================================

async function getWeekCount() {

  const weeks =
    await loadCurriculum();


  return weeks.length;

}


// ================================================================
// 32. 获取第N周
// ================================================================

async function getWeek(
  weekNumber
) {

  const weeks =
    await loadCurriculum();


  const target =
    Number(
      weekNumber
    );


  if (
    !Number.isInteger(
      target
    ) ||
    target < 1
  ) {

    throw new Error(
      "周次无效：" +
      weekNumber
    );

  }


  const result =
    weeks.find(
      row =>
        Number(
          row.week ||
          row.Week ||
          row["周次"]
        ) === target
    );


  if (!result) {

    throw new Error(
      "找不到第" +
      target +
      "周课程"
    );

  }


  return result;

}


// ================================================================
// 33. 获取CSV中的经文引用
// ================================================================

function getCourseReference(
  course
) {

  if (!course) {

    return "";

  }


  return (
    course.reference ||
    course.scripture ||
    course["经文"] ||
    course["经文引用"] ||
    ""
  ).trim();

}


// ================================================================
// 34. 获取第N周 + 经文
// ================================================================

async function getWeekBible(
  weekNumber
) {

  const course =
    await getWeek(
      weekNumber
    );


  const reference =
    getCourseReference(
      course
    );


  if (!reference) {

    throw new Error(
      `第${weekNumber}周没有经文引用`
    );

  }


  console.log(
    `📖 第${weekNumber}周：${reference}`
  );


  const bible =
    await getBibleData(
      reference
    );


  return {

    week:
      Number(
        course.week ||
        course.Week ||
        course["周次"]
      ),

    reference,

    sundayTheme:
      course.sunday_theme ||
      course["主日主题"] ||
      course.theme ||
      course.title ||
      course["标题"] ||
      "",

    bilaTheme:
      course.bila_theme ||
      course["BILA主题"] ||
      course.focus ||
      course["焦点"] ||
      "",

    practice:
      course.practice ||
      course["实践"] ||
      "",

    groupFeedback:
      course.group_feedback ||
      course["群体反馈"] ||
      course.feedback ||
      "",

    mission:
      course.mission ||
      course["使命"] ||
      "",

    bible

  };

}


// ================================================================
// 35. 获取整周经文文字
// ================================================================

async function getWeekBibleText(
  weekNumber
) {

  const data =
    await getWeekBible(
      weekNumber
    );


  return (
    data.bible &&
    typeof data.bible.text ===
      "string"
  )
    ? data.bible.text
    : "";

}


// ================================================================
// 36. 获取全年课程
// ================================================================

async function getAllWeeksWithBible() {

  const weeks =
    await loadCurriculum();


  const results = [];


  for (
    const course
    of weeks
  ) {

    const week =
      Number(
        course.week ||
        course.Week ||
        course["周次"]
      );


    const reference =
      getCourseReference(
        course
      );


    let bible =
      null;

    let error =
      null;


    if (reference) {

      try {

        bible =
          await getBibleData(
            reference
          );

      }

      catch(err) {

        error =
          err.message;

      }

    }


    results.push({

      week,

      reference,

      sundayTheme:
        course.sunday_theme ||
        course["主日主题"] ||
        course.theme ||
        course.title ||
        "",

      bilaTheme:
        course.bila_theme ||
        course["BILA主题"] ||
        course.focus ||
        "",

      practice:
        course.practice ||
        course["实践"] ||
        "",

      groupFeedback:
        course.group_feedback ||
        course["群体反馈"] ||
        course.feedback ||
        "",

      mission:
        course.mission ||
        course["使命"] ||
        "",

      bible,

      error

    });

  }


  return results;

}


// ================================================================
// 37. 数据库状态
// ================================================================

async function bibleEngineStatus() {

  const db =
    await loadBibleDatabase();


  let totalChapters =
    0;

  let totalVerses =
    0;


  db.books.forEach(
    book => {

      if (
        !Array.isArray(
          book.chapters
        )
      ) {

        return;

      }


      totalChapters +=
        book.chapters.length;


      book.chapters.forEach(
        chapter => {

          totalVerses +=
            normalizeBibleVerses(
              chapter
            ).length;

        }
      );

    }
  );


  let weekCount =
    0;


  try {

    weekCount =
      await getWeekCount();

  }

  catch(error) {

    weekCount = 0;

  }


  return {

    engine:
      "BILA Bible Engine V4.1",

    version:
      BILA_BIBLE_CONFIG.version,

    versionName:
      BILA_BIBLE_CONFIG.versionName,

    database:
      "已加载",

    books:
      db.books.length,

    chapters:
      totalChapters,

    verses:
      totalVerses,

    curriculum:
      weekCount >= 52
        ? "已加载"
        : "未完成",

    weeks:
      weekCount

  };

}


// ================================================================
// 38. 清除圣经缓存
// ================================================================

function clearBibleCache() {

  BILA_DB =
    null;

  BILA_DB_PROMISE =
    null;


  console.log(
    "🗑️ 圣经数据库缓存已清除"
  );

}


// ================================================================
// 39. 清除课程缓存
// ================================================================

function clearCurriculumCache() {

  BILA_CURRICULUM =
    null;

  BILA_CURRICULUM_PROMISE =
    null;


  console.log(
    "🗑️ 52周课程缓存已清除"
  );

}


// ================================================================
// 40. 清除全部缓存
// ================================================================

function clearAllCache() {

  clearBibleCache();

  clearCurriculumCache();


  console.log(
    "🗑️ BILA Bible Engine 全部缓存已清除"
  );

}


// ================================================================
// 41. 单项测试
// ================================================================

async function testBibleReference(
  reference
) {

  console.log(
    "========================================"
  );

  console.log(
    "📖 测试引用：",
    reference
  );

  console.log(
    "========================================"
  );


  const parsed =
    parseBibleReference(
      reference
    );


  console.log(
    "① 引用解析：",
    parsed
  );


  const data =
    await getBibleData(
      reference
    );


  console.log(
    "② 读取结果：",
    data
  );


  console.log(
    "③ 经文：\n" +
    data.text
  );


  return data;

}


// ================================================================
// 42. 测试约翰福音1章
// ================================================================

async function testJohn1() {

  return await testBibleReference(
    "约1:1-18"
  );

}


// ================================================================
// 43. 测试全年引用格式
// ================================================================

async function testBilaReferences() {

  const tests = [

    "约1:1-18",

    "可1:14-20",

    "路5:1-11",

    "罗5:1-11",

    "徒1:8；2:1-21",

    "约13:1-17,34-35",

    "约一1:1-4；3:16-18",

    "太28:18-20；启22:12-21"

  ];


  const result = [];


  for (
    const reference
    of tests
  ) {

    try {

      const data =
        await getBibleData(
          reference
        );


      result.push({

        reference,

        success:
          data.success,

        partial:
          data.partial,

        sections:
          data.sections.length,

        verses:
          data.verses.length,

        errors:
          data.errors.length

      });

    }

    catch(error) {

      result.push({

        reference,

        success:
          false,

        partial:
          false,

        sections:
          0,

        verses:
          0,

        errors:
          1,

        message:
          error.message

      });

    }

  }


  console.table(
    result
  );


  return result;

}


// ================================================================
// 44. 测试第1周
// ================================================================

async function testWeek1() {

  const result =
    await getWeekBible(
      1
    );


  console.log(
    "========================================"
  );

  console.log(
    "📅 第1周测试"
  );

  console.log(
    "========================================"
  );

  console.log(
    result
  );


  return result;

}


// ================================================================
// 45. 测试指定周
// ================================================================

async function testWeek(
  weekNumber
) {

  const result =
    await getWeekBible(
      Number(
        weekNumber
      )
    );


  console.log(
    `✅ 第${weekNumber}周读取完成`
  );


  console.log(
    result
  );


  return result;

}


// ================================================================
// 46. 对外暴露 BilaBible
// ================================================================

if (
  typeof window !==
  "undefined"
) {

  window.BilaBible = {

    // ----------------------------
    // 基础
    // ----------------------------

    config:
      BILA_BIBLE_CONFIG,


    // ----------------------------
    // 数据库
    // ----------------------------

    loadDatabase:
      loadBibleDatabase,

    getBook:
      getBibleBook,

    status:
      bibleEngineStatus,


    // ----------------------------
    // 圣经
    // ----------------------------

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

    referenceText:
      getBibleReferenceText,


    // ----------------------------
    // 引用解析
    // ----------------------------

    parse:
      parseBibleReference,


    // ----------------------------
    // 52周课程
    // ----------------------------

    loadCurriculum:
      loadCurriculum,

    getWeekCount:
      getWeekCount,

   async function getWeek(weekNumber) {
  ...
}

async function getAllWeeks() {
  return await loadCurriculum();
}

window.BilaBible = {

  getWeek:
    getWeek,


    getAllWeeks:
      getAllWeeks,

    getWeekBible:
      getWeekBible,

    getWeekBibleText:
      getWeekBibleText,

    getAllWeeksWithBible:
      getAllWeeksWithBible,


    // ----------------------------
    // 缓存
    // ----------------------------

    clearBibleCache:
      clearBibleCache,

    clearCurriculumCache:
      clearCurriculumCache,

    clearAllCache:
      clearAllCache,


    // ----------------------------
    // 测试
    // ----------------------------

    testBibleReference:
      testBibleReference,

    testJohn1:
      testJohn1,

    testBilaReferences:
      testBilaReferences,

    testWeek1:
      testWeek1,

    testWeek:
      testWeek

  };


  console.log(
    "✅ BilaBible V4.1 API 已加载"
  );

}


// ================================================================
// 47. 启动信息
// ================================================================

console.log(
  "=============================================="
);

console.log(
  "🌿 BILA Bible Engine V4.1"
);

console.log(
  "=============================================="
);

console.log(
  "📖 圣经版本：和合本"
);

console.log(
  "📌 原生引用：约1:1-18"
);

console.log(
  "📌 多段引用：约13:1-17,34-35"
);

console.log(
  "📌 跨章节：徒1:8；2:1-21"
);

console.log(
  "📅 课程来源：52-weeks.csv"
);

console.log(
  "📁 圣经来源：bila-cuv-pdf-database.json"
);

console.log(
  "✅ Bible Engine V4.1 已就绪"
);

console.log(
  "=============================================="
);


// ================================================================
// V4.1 PART 4 END
// ================================================================
