/*
 * MOS Bible Engine V1.0
 * Root JSON mode: bila-cuv-pdf-database.json
 * Compatible API: BilaBible.data(reference), getBibleText, getBook, status, testWeek1
 */
(function(){
  'use strict';
  const CONFIG={databaseUrl:'bila-cuv-pdf-database.json',version:'CUV',name:'和合本'};
  const ALIASES={
    '创':'创世记','出':'出埃及记','利':'利未记','民':'民数记','申':'申命记','书':'约书亚记','士':'士师记','得':'路得记',
    '撒上':'撒母耳记上','撒下':'撒母耳记下','王上':'列王纪上','王下':'列王纪下','代上':'历代志上','代下':'历代志下','拉':'以斯拉记','尼':'尼希米记','斯':'以斯帖记',
    '伯':'约伯记','诗':'诗篇','箴':'箴言','传':'传道书','歌':'雅歌','赛':'以赛亚书','耶':'耶利米书','哀':'耶利米哀歌','结':'以西结书','但':'但以理书',
    '何':'何西阿书','珥':'约珥书','摩':'阿摩司书','俄':'俄巴底亚书','拿':'约拿书','弥':'弥迦书','鸿':'那鸿书','哈':'哈巴谷书','番':'西番雅书','该':'哈该书','亚':'撒迦利亚书','玛':'玛拉基书',
    '太':'马太福音','可':'马可福音','路':'路加福音','约':'约翰福音','徒':'使徒行传','罗':'罗马书','林前':'哥林多前书','林后':'哥林多后书','加':'加拉太书','弗':'以弗所书','腓':'腓立比书','西':'歌罗西书',
    '帖前':'帖撒罗尼迦前书','帖后':'帖撒罗尼迦后书','贴前':'帖撒罗尼迦前书','贴后':'帖撒罗尼迦后书','提前':'提摩太前书','提后':'提摩太后书','多':'提多书','门':'腓利门书',
    '来':'希伯来书','雅':'雅各书','彼前':'彼得前书','彼后':'彼得后书','约一':'约翰一书','约二':'约翰二书','约三':'约翰三书','犹':'犹大书','启':'启示录'
  };
  const BOOKS={}; let DB=null; let loading=null; const cache={};
  function normalizeBook(s){
    s=String(s||'').trim().replace(/[\s　]/g,'');
    if(ALIASES[s]) return ALIASES[s];
    if(DB&&Array.isArray(DB.books)){
      const b=DB.books.find(x=>x.name===s||x.abbrev===s);
      if(b) return b.name;
    }
    return s;
  }
  function parseRef(ref){
    let s=String(ref||'').trim().replace(/[：]/g,':').replace(/[～—–]/g,'-').replace(/[；]/g,';');
    let m=s.match(/^(.+?)(\d+):(\d+)(?:-(\d+))?$/);
    if(m){
      return {book:normalizeBook(m[1]),chapter:Number(m[2]),start:Number(m[3]),end:Number(m[4]||m[3]),chapterOnly:false};
    }
    m=s.match(/^(.+?)(\d+)$/);
    if(m){
      return {book:normalizeBook(m[1]),chapter:Number(m[2]),start:1,end:null,chapterOnly:true};
    }
    throw new Error('无法解析经文引用：'+ref);
  }
  async function loadDB(){
    if(DB) return DB;
    if(loading) return loading;
    loading=fetch(CONFIG.databaseUrl,{cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error('圣经数据库加载失败：HTTP '+r.status);
      return r.json();
    }).then(d=>{
      if(!d||!Array.isArray(d.books)) throw new Error('圣经数据库格式错误：缺少 books');
      DB=d; d.books.forEach(b=>BOOKS[b.name]=b);
      return d;
    }).finally(()=>loading=null);
    return loading;
  }
  async function getBook(name){
    await loadDB(); const canonical=normalizeBook(name); const b=BOOKS[canonical];
    if(!b) throw new Error('找不到书卷：'+name);
    return b;
  }
  function getVerses(book,chapter,start,end){
    const arr=book.chapters[chapter-1];
    if(!Array.isArray(arr)) throw new Error(`找不到${book.name}${chapter}章`);
    if(start<1||end>arr.length||start>end) throw new Error(`经文范围不存在：${book.name}${chapter}:${start}-${end}`);
    const out=[];
    for(let i=start;i<=end;i++){
      const text=String(arr[i-1]??'').trim();
      if(!text) throw new Error(`数据库缺少经文：${book.name}${chapter}:${i}`);
      out.push({verse:i,text});
    }
    return out;
  }
  async function data(ref){
    const key=String(ref||'').trim(); if(cache[key]) return cache[key];
    const p=parseRef(key); const b=await getBook(p.book);
    const chapter=b.chapters[p.chapter-1];
    if(!Array.isArray(chapter)) throw new Error(`找不到${b.name}${p.chapter}章`);
    const end=p.chapterOnly ? chapter.length : p.end;
    const verses=getVerses(b,p.chapter,p.start,end);
    const result={success:true,partial:false,reference:key,book:b.name,chapter:p.chapter,start:p.start,end:end,verses,text:verses.map(v=>`${v.verse} ${v.text}`).join('\n'),errors:[]};
    cache[key]=result; return result;
  }
  async function text(ref){return (await data(ref)).text}
  async function getWeekBible(week){return {week,bible:await data('弗2:8-10')}}
  async function status(){await loadDB(); return {engine:'MOS Bible Engine V1.0',database:CONFIG.databaseUrl,books:DB.books.length,verses:DB.books.reduce((n,b)=>n+(b.verseCount||b.chapters.reduce((a,c)=>a+c.length,0)),0)}}
  async function testWeek1(){return data('弗2:8-10')}
  window.BilaBible={config:CONFIG,loadDatabase:loadDB,getBook,data,text,getBibleData:data,getBibleText:text,getWeekBible,status,testWeek1,parse:parseRef};
})();
