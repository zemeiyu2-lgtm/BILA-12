// ================================================================
// BILA Bible Engine V4.0
// 数据库原生简称兼容版
// ================================================================

const BILA_BIBLE_CONFIG = {
  databaseUrl: "bila-cuv-pdf-database.json",
  curriculumUrl:
    "https://raw.githubusercontent.com/zemeiyu2-lgtm/BILA-deepseek/main/52-weeks.csv",

  version: "CUV",
  name: "和合本",
  timeout: 20000,
  cache: true
};


// ================================================================
// 1. 66卷标准表
// ================================================================

const BILA_BOOK_TABLE = [

  ["创世记","gn","创"],
  ["出埃及记","ex","出"],
  ["利未记","lv","利"],
  ["民数记","nm","民"],
  ["申命记","dt","申"],

  ["约书亚记","js","书"],
  ["士师记","jud","士"],
  ["路得记","rt","得"],

  ["撒母耳记上","1sm","撒上"],
  ["撒母耳记下","2sm","撒下"],

  ["列王纪上","1ki","王上"],
  ["列王纪下","2ki","王下"],

  ["历代志上","1ch","代上"],
  ["历代志下","2ch","代下"],

  ["以斯拉记","ezr","拉"],
  ["尼希米记","ne","尼"],
  ["以斯帖记","est","斯"],

  ["约伯记","job","伯"],
  ["诗篇","ps","诗"],
  ["箴言","pr","箴"],
  ["传道书","ec","传"],
  ["雅歌","so","歌"],

  ["以赛亚书","isa","赛"],
  ["耶利米书","jer","耶"],
  ["耶利米哀歌","lam","哀"],
  ["以西结书","ezk","结"],
  ["但以理书","dan","但"],

  ["何西阿书","hos","何"],
  ["约珥书","jl","珥"],
  ["阿摩司书","am","摩"],
  ["俄巴底亚书","ob","俄"],
  ["约拿书","jon","拿"],
  ["弥迦书","mic","弥"],
  ["那鸿书","nah","鸿"],
  ["哈巴谷书","hab","哈"],
  ["西番雅书","zep","番"],
  ["哈该书","hag","该"],
  ["撒迦利亚书","zec","亚"],
  ["玛拉基书","mal","玛"],

  ["马太福音","mt","太"],
  ["马可福音","mk","可"],
  ["路加福音","lk","路"],
  ["约翰福音","jn","约"],
  ["使徒行传","ac","徒"],

  ["罗马书","rm","罗"],
  ["哥林多前书","1co","林前"],
  ["哥林多后书","2co","林后"],
  ["加拉太书","ga","加"],
  ["以弗所书","ep","弗"],
  ["腓立比书","ph","腓"],
  ["歌罗西书","cl","西"],

  ["帖撒罗尼迦前书","1th","帖前"],
  ["帖撒罗尼迦后书","2th","帖后"],

  ["提摩太前书","1ti","提前"],
  ["提摩太后书","2ti","提后"],
  ["提多书","tt","多"],
  ["腓利门书","phm","门"],

  ["希伯来书","hb","来"],
  ["雅各书","jm","雅"],

  ["彼得前书","1pe","彼前"],
  ["彼得后书","2pe","彼后"],

  ["约翰一书","1jn","约一"],
  ["约翰二书","2jn","约二"],
  ["约翰三书","3jn","约三"],

  ["犹大书","jd","犹"],
  ["启示录","rv","启"]

];


// ================================================================
// 2. 中文简称
// ================================================================

const BILA_ALIASES = {

  "创":"创世记",
  "出":"出埃及记",
  "利":"利未记",
  "民":"民数记",
  "申":"申命记",

  "书":"约书亚记",
  "士":"士师记",
  "得":"路得记",

  "撒上":"撒母耳记上",
  "撒下":"撒母耳记下",

  "王上":"列王纪上",
  "王下":"列王纪下",

  "代上":"历代志上",
  "代下":"历代志下",

  "拉":"以斯拉记",
  "尼":"尼希米记",
  "斯":"以斯帖记",

  "伯":"约伯记",
  "诗":"诗篇",
  "箴":"箴言",
  "传":"传道书",
  "歌":"雅歌",

  "赛":"以赛亚书",
  "耶":"耶利米书",
  "哀":"耶利米哀歌",
  "结":"以西结书",
  "但":"但以理书",

  "何":"何西阿书",
  "珥":"约珥书",
  "摩":"阿摩司书",
  "俄":"俄巴底亚书",
  "拿":"约拿书",
  "弥":"弥迦书",
  "鸿":"那鸿书",
  "哈":"哈巴谷书",
  "番":"西番雅书",
  "该":"哈该书",
  "亚":"撒迦利亚书",
  "玛":"玛拉基书",

  "太":"马太福音",
  "可":"马可福音",
  "路":"路加福音",
  "约":"约翰福音",
  "徒":"使徒行传",

  "罗":"罗马书",
  "林前":"哥林多前书",
  "林后":"哥林多后书",
  "加":"加拉太书",
  "弗":"以弗所书",
  "腓":"腓立比书",
  "西":"歌罗西书",

  "帖前":"帖撒罗尼迦前书",
  "帖后":"帖撒罗尼迦后书",

  "提前":"提摩太前书",
  "提后":"提摩太后书",
  "多":"提多书",
  "门":"腓利门书",

  "来":"希伯来书",
  "雅":"雅各书",

  "彼前":"彼得前书",
  "彼后":"彼得后书",

  "约一":"约翰一书",
  "约二":"约翰二书",
  "约三":"约翰三书",

  "犹":"犹大书",
  "启":"启示录"

};


// ================================================================
// 3. 缓存
// ================================================================

let BILA_DB = null;
let BILA_DB_PROMISE = null;

let BILA_CURRICULUM = null;
let BILA_CURRICULUM_PROMISE = null;


// ================================================================
// 4. 文本清理
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

  value =
    value.replace(
      /^\uFEFF/,
      ""
    );

  value =
    value.replace(
      /<[^>]*>/g,
      ""
    );

  value =
    value.replace(
      /[\r\n\t]+/g,
      " "
    );

  value =
    value.replace(
      /\s+/g,
      " "
    );

  for (
    let i = 0;
    i < 3;
    i++
  ) {

    value =
      value.replace(
        /([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g,
        "$1$2"
      );

  }

  value =
    value.replace(
      /([\u4e00-\u9fff])\s+([，。！？；：、])/g,
      "$1$2"
    );

  value =
    value.replace(
      /([，。！？；：、])\s+/g,
      "$1"
    );

  return value.trim();

}


// ================================================================
// 5. 引用文字标准化
// ================================================================

function bilaNormalizeReferenceText(
  reference
) {

  return String(
    reference || ""
  )
    .replace(
      /^\uFEFF/,
      ""
    )
    .replace(
      /[：﹕]/g,
      ":"
    )
    .replace(
      /[－–—﹣]/g,
      "-"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// ================================================================
// 6. 标准化书名
// ================================================================

function normalizeBookName(
  book
) {

  let value =
    String(book || "")
      .trim();

  if (!value) {

    return null;

  }

  if (
    BILA_ALIASES[value]
  ) {

    return BILA_ALIASES[value];

  }

  const direct =
    BILA_BOOK_TABLE.find(
      item =>
        item[0] === value
    );

  if (direct) {

    return direct[0];

  }

  const byAbbrev =
    BILA_BOOK_TABLE.find(
      item =>
        item[1] === value
    );

  if (byAbbrev) {

    return byAbbrev[0];

  }

  const byShort =
    BILA_BOOK_TABLE.find(
      item =>
        item[2] === value
    );

  if (byShort) {

    return byShort[0];

  }

  return null;

}


// ================================================================
// 第1段结束
// ================================================================// ================================================================
// BILA Bible Engine V4.0
// 第2段：数据库加载 + 书卷匹配 + 章节/逐节读取
// ================================================================


// ================================================================
// 7. 加载圣经数据库
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
        cache: "no-cache"
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

        // --------------------------------------------------------
        // JSON根节点直接是数组
        // --------------------------------------------------------

        if (
          Array.isArray(raw)
        ) {

          BILA_DB = {
            books: raw
          };

        }

        // --------------------------------------------------------
        // JSON根节点是：
        // { books:[...] }
        // --------------------------------------------------------

        else if (
          raw &&
          Array.isArray(raw.books)
        ) {

          BILA_DB = raw;

        }

        else {

          throw new Error(
            "无法识别圣经JSON数据库格式"
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
// 8. 根据简称 / 中文书名寻找数据库书卷
// ================================================================

async function getBibleBook(
  requestedBook
) {

  const db =
    await loadBibleDatabase();


  const canonical =
    normalizeBookName(
      requestedBook
    );


  if (!canonical) {

    throw new Error(
      "无法识别书卷：" +
      requestedBook
    );

  }


  const tableItem =
    BILA_BOOK_TABLE.find(
      item =>
        item[0] === canonical
    );


  const shortName =
    tableItem
      ? tableItem[2]
      : "";


  const englishAbbrev =
    tableItem
      ? tableItem[1]
      : "";


  // ------------------------------------------------------------
  // 方法1：数据库 abbrev
  //
  // 数据库可能是：
  // gn / jn / 1jn
  // 也可能是：
  // 约 / 约一 / 启
  // ------------------------------------------------------------

  let book =
    db.books.find(
      item => {

        if (!item) {
          return false;
        }


        const abbrev =
          String(
            item.abbrev ||
            ""
          )
          .trim()
          .toLowerCase();


        return (
          abbrev ===
          shortName.toLowerCase() ||

          abbrev ===
          englishAbbrev.toLowerCase()
        );

      }
    );


  // ------------------------------------------------------------
  // 方法2：数据库中文名称
  // ------------------------------------------------------------

  if (!book) {

    book =
      db.books.find(
        item => {

          if (!item) {
            return false;
          }


          const names = [

            item.name,
            item.title,
            item.book,
            item.zh,
            item.zhName,
            item.short

          ]


          .filter(Boolean)


          .map(
            value =>
              String(value).trim()
          );


          return (
            names.includes(
              canonical
            ) ||

            names.includes(
              shortName
            )

          );

        }
      );

  }


  // ------------------------------------------------------------
  // 方法3：按照66卷圣经标准顺序
  //
  // 这是最重要的最后保险。
  // ------------------------------------------------------------

  if (!book) {

    const index =
      BILA_BOOK_TABLE.findIndex(
        item =>
          item[0] === canonical
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
// 9. 获取原始章节
// ================================================================

function getRawChapter(
  book,
  chapterNumber
) {

  if (
    !book
  ) {

    throw new Error(
      "书卷数据为空"
    );

  }


  if (
    !Array.isArray(
      book.chapters
    )
  ) {

    throw new Error(
      "书卷 chapters 数据格式错误"
    );

  }


  const number =
    Number(
      chapterNumber
    );


  const index =
    number - 1;


  if (
    index < 0 ||
    index >=
      book.chapters.length
  ) {

    throw new Error(
      `第${number}章不存在`
    );

  }


  return book.chapters[
    index
  ];

}


// ================================================================
// 10. 把一章统一成逐节数组
// ================================================================

function normalizeChapterVerses(
  chapter
) {

  const verses =
    [];


  // ------------------------------------------------------------
  // 情况 A：
  // [
  //   "第一节",
  //   "第二节",
  //   ...
  // ]
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

          verseNumber =
            Number(
              item.verse ??
              item.verse_number ??
              item.number ??
              item.id ??
              index + 1
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

            text

          });

        }

      }
    );

  }


  // ------------------------------------------------------------
  // 情况 B：
  // {
  //   "1":"第一节",
  //   "2":"第二节"
  // }
  // ------------------------------------------------------------

  else if (
    chapter &&
    typeof chapter ===
    "object"
  ) {

    Object.keys(
      chapter
    )
    .forEach(
      key => {

        const item =
          chapter[key];


        let verseNumber =
          Number(key);

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

            text

          });

        }

      }
    );

  }


  verses.sort(
    (a,b) =>
      a.verse -
      b.verse
  );


  return verses;

}


// ================================================================
// 11. 获取整章
// ================================================================

async function getBibleChapter(
  book,
  chapter
) {

  const bookData =
    await getBibleBook(
      book
    );


  const rawChapter =
    getRawChapter(
      bookData,
      chapter
    );


  const verses =
    normalizeChapterVerses(
      rawChapter
    );


  if (
    !verses.length
  ) {

    throw new Error(
      `${book} 第${chapter}章没有有效经文`
    );

  }


  return verses;

}


// ================================================================
// 12. 获取单节
// ================================================================

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
    Number(
      verse
    );


  const result =
    verses.find(
      item =>
        item.verse ===
        target
    );


  if (!result) {

    throw new Error(
      `${book} ${chapter}:${verse} 不存在`
    );

  }


  return result.text;

}


// ================================================================
// 13. 获取单段
// ================================================================

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
    Number(
      startVerse
    );


  const end =
    Number(
      endVerse
    );


  const selected =
    verses.filter(
      item =>
        item.verse >=
          start &&
        item.verse <=
          end
    );


  if (
    !selected.length
  ) {

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


// ================================================================
// 第2段结束
// ================================================================// ================================================================
// BILA Bible Engine V4.0
// 第3段：经文引用解析 + 多段/跨书卷读取
// ================================================================


// ================================================================
// 14. 解析同一书卷的多段引用
//
// 支持：
// 约1:1-18
// 约13:1-17,34-35
// ================================================================

function parseSameBookReference(
  segment
) {

  const text =
    bilaNormalizeReferenceText(
      segment
    );


  // 关键格式：
  // 约1:1-18
  // 约一1:1-4
  // 启21:1-5

  const match =
    text.match(
      /^(.+?)\s*(\d+):(.+)$/
    );


  if (!match) {

    return null;

  }


  const book =
    normalizeBookName(
      match[1]
    );


  if (!book) {

    return null;

  }


  const chapter =
    Number(
      match[2]
    );


  const rangeText =
    match[3];


  const ranges =
    rangeText
      .split(
        /[,，、]/
      )
      .map(
        value =>
          value.trim()
      )
      .filter(Boolean);


  if (
    !ranges.length
  ) {

    return null;

  }


  const result = [];


  for (
    const range
    of ranges
  ) {

    const rangeMatch =
      range.match(
        /^(\d+)(?:-(\d+))?$/
      );


    if (!rangeMatch) {

      return null;

    }


    const start =
      Number(
        rangeMatch[1]
      );


    const end =
      rangeMatch[2]
        ? Number(
            rangeMatch[2]
          )
        : start;


    result.push({

      book,

      chapter,

      startVerse:
        start,

      endVerse:
        end

    });

  }


  return result;

}


// ================================================================
// 15. 分割引用
//
// 支持：
// 徒1:8；2:1-21
// 约一1:1-4；3:16-18
// 太28:18-20；启22:12-21
// ================================================================

function splitBibleReference(
  reference
) {

  return bilaNormalizeReferenceText(
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
      value =>
        value.trim()
    )

    .filter(Boolean);

}


// ================================================================
// 16. 完整引用解析
// ================================================================

function parseBibleReference(
  reference
) {

  const segments =
    splitBibleReference(
      reference
    );


  if (
    !segments.length
  ) {

    throw new Error(
      "经文引用为空"
    );

  }


  const result = [];

  let lastBook =
    null;


  for (
    const segment
    of segments
  ) {

    // ------------------------------------------------------------
    // A. 完整书卷格式
    //
    // 约1:1-18
    // 徒1:8
    // 启21:1-5
    // ------------------------------------------------------------

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


    // ------------------------------------------------------------
    // B. 延续前一个书卷
    //
    // 徒1:8；2:1-21
    //
    // 第二段：
    // 2:1-21
    // ------------------------------------------------------------

    const chapterOnly =
      segment.match(
        /^(\d+):(\d+)(?:-(\d+))?$/
      );


    if (
      chapterOnly &&
      lastBook
    ) {

      const chapter =
        Number(
          chapterOnly[1]
        );


      const start =
        Number(
          chapterOnly[2]
        );


      const end =
        chapterOnly[3]
          ? Number(
              chapterOnly[3]
            )
          : start;


      result.push({

        book:
          lastBook,

        chapter,

        startVerse:
          start,

        endVerse:
          end

      });


      continue;

    }


    throw new Error(
      "无法解析经文引用：" +
      segment
    );

  }


  return result;

}


// ================================================================
// 17. 读取一个段落
// ================================================================

async function readBibleSection(
  section
) {

  const verses =
    await getBibleChapter(
      section.book,
      section.chapter
    );


  const selected =
    verses.filter(
      verse =>
        verse.verse >=
          section.startVerse &&
        verse.verse <=
          section.endVerse
    );


  if (
    !selected.length
  ) {

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
// 18. 读取完整经文
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

      const data =
        await readBibleSection(
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


  const verses =
    results.flatMap(
      section =>
        section.verses
    );


  const text =
    results
      .map(
        section => {

          return section.verses
            .map(
              verse =>
                `${verse.verse} ${verse.text}`
            )
            .join("\n");

        }
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

    verses,

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
// 19. 直接得到经文文字
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
// 20. 测试引用格式
// ================================================================

async function testReference(
  reference
) {

  console.log(
    "========================================"
  );


  console.log(
    "📖 测试：",
    reference
  );


  try {

    const parsed =
      parseBibleReference(
        reference
      );


    console.log(
      "① 解析结果：",
      parsed
    );


    const data =
      await getBibleData(
        reference
      );


    console.log(
      "② 读取状态：",
      data.success
        ? "✅ 成功"
        : (
            data.partial
              ? "⚠️ 部分成功"
              : "❌ 失败"
          )
    );


    console.log(
      "③ 经文：\n" +
      data.text
    );


    if (
      data.errors.length
    ) {

      console.warn(
        "④ 错误：",
        data.errors
      );

    }


    return data;

  }

  catch(error) {

    console.error(
      "❌ 测试失败：",
      error
    );


    throw error;

  }

}


// ================================================================
// 21. 专门测试全年常用引用格式
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

        errors:
          data.errors.length,

        characters:
          data.text.length

      });

    }

    catch(error) {

      results.push({

        reference,

        success:false,

        partial:false,

        sections:0,

        errors:1,

        characters:0,

        message:
          error.message

      });

    }

  }


  console.table(
    results
  );


  return results;

}


// ================================================================
// 第3段结束
// ================================================================// ================================================================
// BILA Bible Engine V4.0
// 第4段：52周接口 + 对外接口 + 启动测试
// ================================================================


// ================================================================
// 22. 获取全部52周课程
// ================================================================

async function getAllWeeks() {

  return await loadCurriculum();

}


// ================================================================
// 23. 获取指定周课程
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
// 24. 获取指定周 + 圣经经文
// ================================================================
//
// 例：
// BilaBible.getWeekBible(1)
//
// 自动：
// 52-weeks.csv
//      ↓
// 约1:1-18
//      ↓
// 本地圣经数据库
//      ↓
// 经文全文
// ================================================================

async function getWeekBible(
  weekNumber
) {

  const course =
    await getWeek(
      weekNumber
    );


  const reference =
    course.reference ||
    course.scripture ||
    course["经文"] ||
    course["经文引用"] ||
    "";


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
// 25. 获取52周 + 全部经文
// ================================================================
//
// 注意：这个函数会一次读取全年经文。
// 一般网页使用不建议启动时调用。
// ================================================================

async function getAllWeeksWithBible() {

  const weeks =
    await loadCurriculum();


  const results =
    [];


  for (
    const course
    of weeks
  ) {

    const reference =
      course.reference ||
      course.scripture ||
      course["经文"] ||
      course["经文引用"] ||
      "";


    let bible =
      null;

    let error =
      null;


    try {

      if (reference) {

        bible =
          await getBibleData(
            reference
          );

      }

    }

    catch(err) {

      error =
        err.message;

    }


    results.push({

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
// 26. 数据库状态
// ================================================================

async function bibleEngineStatus() {

  const db =
    await loadBibleDatabase();


  let verseCount =
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


      book.chapters.forEach(
        chapter => {

          verseCount +=
            normalizeChapterVerses(
              chapter
            ).length;

        }
      );

    }
  );


  let curriculumCount =
    0;


  try {

    const weeks =
      await loadCurriculum();

    curriculumCount =
      weeks.length;

  }

  catch(e) {

    curriculumCount =
      0;

  }


  return {

    engine:
      "BILA Bible Engine V4.0",

    version:
      BILA_BIBLE_CONFIG.version,

    versionName:
      BILA_BIBLE_CONFIG.name,

    database:
      "已加载",

    books:
      db.books.length,

    verses:
      verseCount,

    curriculum:
      curriculumCount > 0
        ? "已加载"
        : "未加载",

    weeks:
      curriculumCount

  };

}


// ================================================================
// 27. 清除缓存
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


function clearCurriculumCache() {

  BILA_CURRICULUM =
    null;

  BILA_CURRICULUM_PROMISE =
    null;

  console.log(
    "🗑️ 52周课程缓存已清除"
  );

}


function clearAllCache() {

  clearBibleCache();

  clearCurriculumCache();

  console.log(
    "🗑️ BILA Bible Engine 全部缓存已清除"
  );

}


// ================================================================
// 28. 最终测试
// ================================================================

async function testBibleEngine() {

  console.log(
    "=============================================="
  );

  console.log(
    "🌿 BILA Bible Engine V4.0 测试"
  );

  console.log(
    "=============================================="
  );


  // ------------------------------------------------------------
  // 测试1：数据库
  // ------------------------------------------------------------

  try {

    const status =
      await bibleEngineStatus();


    console.log(
      "📚 数据库状态：",
      status
    );

  }

  catch(error) {

    console.error(
      "❌ 数据库测试失败：",
      error
    );

  }


  // ------------------------------------------------------------
  // 测试2：约1:1-18
  // ------------------------------------------------------------

  try {

    const data =
      await getBibleData(
        "约1:1-18"
      );


    console.log(
      "✅ 测试：约1:1-18"
    );


    console.log(
      data
    );

  }

  catch(error) {

    console.error(
      "❌ 测试约1:1-18失败：",
      error
    );

  }


  // ------------------------------------------------------------
  // 测试3：徒1:8；2:1-21
  // ------------------------------------------------------------

  try {

    const data =
      await getBibleData(
        "徒1:8；2:1-21"
      );


    console.log(
      "✅ 测试：徒1:8；2:1-21"
    );


    console.log(
      data
    );

  }

  catch(error) {

    console.error(
      "❌ 测试跨章节失败：",
      error
    );

  }


  // ------------------------------------------------------------
  // 测试4：约13:1-17,34-35
  // ------------------------------------------------------------

  try {

    const data =
      await getBibleData(
        "约13:1-17,34-35"
      );


    console.log(
      "✅ 测试：约13:1-17,34-35"
    );


    console.log(
      data
    );

  }

  catch(error) {

    console.error(
      "❌ 测试同章多段失败：",
      error
    );

  }


  // ------------------------------------------------------------
  // 测试5：第1周
  // ------------------------------------------------------------

  try {

    const week =
      await getWeekBible(
        1
      );


    console.log(
      "✅ 测试第1周"
    );


    console.log(
      week
    );


  }

  catch(error) {

    console.error(
      "❌ 测试第1周失败：",
      error
    );

  }


  console.log(
    "=============================================="
  );

  console.log(
    "🌿 BILA Bible Engine V4.0 测试结束"
  );

  console.log(
    "=============================================="
  );

}


// ================================================================
// 29. 对外暴露 BilaBible
// ================================================================

if (
  typeof window !==
  "undefined"
) {

  window.BilaBible = {

    // -----------------------------
    // 配置
    // -----------------------------

    config:
      BILA_BIBLE_CONFIG,


    // -----------------------------
    // 数据库
    // -----------------------------

    loadDatabase:
      loadBibleDatabase,

    getBook:
      getBibleBook,


    // -----------------------------
    // 圣经
    // -----------------------------

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


    // -----------------------------
    // 经文解析
    // -----------------------------

    parse:
      parseBibleReference,


    // -----------------------------
    // 课程
    // -----------------------------

    loadCurriculum:
      loadCurriculum,

    getWeek:
      getWeek,

    getAllWeeks:
      getAllWeeks,

    getWeekBible:
      getWeekBible,

    getAllWeeksWithBible:
      getAllWeeksWithBible,


    // -----------------------------
    // 状态
    // -----------------------------

    status:
      bibleEngineStatus,


    // -----------------------------
    // 缓存
    // -----------------------------

    clearBibleCache:
      clearBibleCache,

    clearCurriculumCache:
      clearCurriculumCache,

    clearAllCache:
      clearAllCache,


    // -----------------------------
    // 测试
    // -----------------------------

    testBibleEngine:
      testBibleEngine,

    testBibleReference:
      testBibleReference,

    testBilaReferences:
      testBilaReferences,

    testWeek1:
      testWeek1,

    testWeek:
      testWeek

  };


  console.log(
    "✅ BilaBible 接口已加载"
  );

}


// ================================================================
// 30. 启动
// ================================================================

console.log(
  "=============================================="
);

console.log(
  "🌿 BILA Bible Engine V4.0"
);

console.log(
  "📖 数据源：本地和合本 JSON"
);

console.log(
  "📌 引用格式：约1:1-18"
);

console.log(
  "📌 多段格式：约13:1-17,34-35"
);

console.log(
  "📌 跨章节格式：徒1:8；2:1-21"
);

console.log(
  "=============================================="
);

console.log(
  "✅ Bible Engine V4.0 已就绪"
);

console.log(
  "=============================================="
);


// ================================================================
// END OF BILA Bible Engine V4.0
// ================================================================
