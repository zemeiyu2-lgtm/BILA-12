/**
 * MOS 1.2｜管理后台 V1.0.1
 * 统一后台 + 公开 API 后端。
 * 绑定 MOS 内容 Google Sheet。
 */

const MOS_API_VERSION = 'V1.3.2-ADMIN1.0.1';
const MOS_SHEETS = {
  DAYS:'MOS_DAYS', WEEKS:'MOS_WEEKS', EVENTS:'MOS_EVENTS',
  RESEARCH:'MOS_RESEARCH', SETTINGS:'MOS_SETTINGS', LOG:'MOS_LOG'
};
const MOS_DAY_HEADERS = [
 'day_id','week','dow','day_name','is_sunday','title','scripture_ref','scripture_text',
 'scripture_type','day_theme','role','guide','question','options_json','declare',
 'practice','relationship','mission','feast_status','feast_name','p_codes','l_codes',
 'j_codes','ntdis_codes','evidence_level','calibration_status','version','published',
 'updated_at','updated_by'
];
const MOS_WEEK_HEADERS = ['week','module','stage','week_title','sunday_scripture','sunday_message','discipleship_goal','feast_status','p_codes','l_codes','j_codes','ntdis_codes','calibration_status','version','published','updated_at'];

function doGet(e){
  try {
    const action=(e&&e.parameter&&e.parameter.action)||'';
    // 无 action：直接打开管理后台首页，而不是返回 JSON。
    if(!action) return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('MOS 1.2｜内容管理后台 V1.0.2');
    if(action==='health') return json_({ok:true,system:'MOS 1.2',api:'V1.3.2',admin:'V1.0.2',publicRead:true,time:new Date().toISOString()});
    if(action==='published') return json_(published_());
    return json_({ok:false,error:'unknown_action',action});
  } catch(err){ return json_({ok:false,error:String(err.message||err)}); }
}

function doPost(e){
  try {
    const p=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    switch(p.action){
      case 'adminLogin': return json_(adminLogin_(p.password));
      case 'published': return json_(published_());
      case 'saveDay': requireToken_(p.token); return json_(saveDay_(p.day));
      case 'saveWeek': requireToken_(p.token); return json_(saveWeek_(p.week));
      case 'publishWeek': requireToken_(p.token); return json_(publishWeek_(p.week,p.published));
      default: return json_({ok:false,error:'unknown_action'});
    }
  } catch(err){ return json_({ok:false,error:String(err.message||err)}); }
}

// ---------- 首次设置 ----------
function setAdminPassword(){
  const ui=SpreadsheetApp.getUi();
  const r=ui.prompt('MOS 1.2 管理员密码','请输入至少6位管理员密码：',ui.ButtonSet.OK_CANCEL);
  if(r.getSelectedButton()!==ui.Button.OK) return '已取消';
  const p=String(r.getResponseText()||'');
  if(p.length<6) throw new Error('密码至少需要6位');
  PropertiesService.getScriptProperties().setProperty('MOS_ADMIN_PASSWORD',p);
  ui.alert('管理员密码已设置。');
  return 'ok';
}

function setupMOS(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  ensure_(ss,MOS_SHEETS.DAYS,MOS_DAY_HEADERS);
  ensure_(ss,MOS_SHEETS.WEEKS,MOS_WEEK_HEADERS);
  ensure_(ss,MOS_SHEETS.EVENTS,['event_id','name','type','start_date','end_date','priority','notes','active','updated_at']);
  ensure_(ss,MOS_SHEETS.RESEARCH,['research_id','type','code','title','scripture_ref','summary','evidence_level','source_note','active']);
  ensure_(ss,MOS_SHEETS.SETTINGS,['key','value','note','updated_at']);
  ensure_(ss,MOS_SHEETS.LOG,['timestamp','action','day_id','week','dow','before_json','after_json','user']);
  seedDays_(); seedWeeks_();
  return {ok:true,message:'MOS内容库已初始化'};
}
function seedDays_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOS_SHEETS.DAYS);
  if(sh.getLastRow()>1)return;
  const names=['主日','周一','周二','周三','周四','周五','周六'],rows=[];
  for(let w=1;w<=52;w++) for(let d=0;d<7;d++){
    const o={day_id:String((w-1)*7+d),week:w,dow:d,day_name:names[d],is_sunday:d===0,
      title:d===0?'主日信息':'每日跟随',scripture_ref:'',scripture_text:'',scripture_type:d===0?'主日延伸':'灵活发现',
      day_theme:'',role:d===0?'主日信息入口':'每日操练',guide:d===0?'本周主日信息':'从经文进入今天的真实处境',question:'',options_json:'[]',declare:'',practice:'',relationship:'',mission:'',
      feast_status:'无',feast_name:'',p_codes:'',l_codes:'',j_codes:'',ntdis_codes:'',evidence_level:'待核验',calibration_status:'草稿',version:'1.0',published:false,updated_at:new Date(),updated_by:''};
    rows.push(MOS_DAY_HEADERS.map(h=>o[h]??''));
  }
  sh.getRange(2,1,rows.length,MOS_DAY_HEADERS.length).setValues(rows);
}
function seedWeeks_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOS_SHEETS.WEEKS);
  if(sh.getLastRow()>1)return;
  const rows=[]; for(let w=1;w<=52;w++) rows.push([w,'','','','','','','','','','','','待校准','1.0',false,new Date()]);
  sh.getRange(2,1,rows.length,MOS_WEEK_HEADERS.length).setValues(rows);
}

// ---------- 后台会话 ----------
function adminLogin_(password){
  const expected=PropertiesService.getScriptProperties().getProperty('MOS_ADMIN_PASSWORD');
  if(!expected) return {ok:false,needSetup:true,message:'尚未设置管理员密码，请在 Apps Script 中运行 setAdminPassword()。'};
  if(String(password)!==String(expected)) return {ok:false,message:'管理员密码错误'};
  const token=Utilities.getUuid();
  CacheService.getScriptCache().put('MOS_ADMIN_'+token,'1',21600);
  return {ok:true,token,expiresIn:21600};
}
function requireToken_(token){
  if(token && CacheService.getScriptCache().get('MOS_ADMIN_'+token)==='1') return true;
  throw new Error('管理员会话已失效，请重新登录');
}
function loginAdmin(password){ return adminLogin_(password); }
function logoutAdmin(token){ if(token) CacheService.getScriptCache().remove('MOS_ADMIN_'+token); return {ok:true}; }

// ---------- 后台数据 ----------
function getAdminBootstrap(token){
  requireToken_(token);
  setupMOS();
  const days=read_(MOS_SHEETS.DAYS), weeks=read_(MOS_SHEETS.WEEKS), events=read_(MOS_SHEETS.EVENTS), research=read_(MOS_SHEETS.RESEARCH);
  const bool=v=>v===true||String(v).toLowerCase()==='true';
  return {ok:true,api:MOS_API_VERSION,days,weeks,events,research,status:{api:MOS_API_VERSION,
    counts:{days:days.length,weeks:weeks.length,publishedDays:days.filter(x=>bool(x.published)).length,publishedWeeks:weeks.filter(x=>bool(x.published)).length},
    sheets:{days:true,weeks:true,events:true,research:true},checkedAt:new Date().toISOString()}};
}

function saveDay(token,day){ requireToken_(token); return saveDay_(day); }
function saveDay_(day){
  if(!day||day.day_id===undefined||day.day_id==='') throw new Error('缺少 day_id');
  setupMOS();
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOS_SHEETS.DAYS);
  const row=find_(sh,1,String(day.day_id)); if(row<2) throw new Error('找不到日单元 '+day.day_id);
  const before=sh.getRange(row,1,1,MOS_DAY_HEADERS.length).getValues()[0];
  const obj={}; MOS_DAY_HEADERS.forEach(h=>obj[h]=day[h]??'');
  obj.day_id=String(day.day_id); obj.week=Number(day.week); obj.dow=Number(day.dow); obj.is_sunday=obj.dow===0;
  // 保存编辑时不允许前端偷偷改变发布状态；发布必须走 publishWeek。
  obj.published = before[MOS_DAY_HEADERS.indexOf('published')]===true || String(before[MOS_DAY_HEADERS.indexOf('published')]).toLowerCase()==='true';
  obj.updated_at=new Date(); obj.updated_by=Session.getActiveUser().getEmail()||'admin';
  sh.getRange(row,1,1,MOS_DAY_HEADERS.length).setValues([MOS_DAY_HEADERS.map(h=>obj[h]??'')]);
  log_('UPDATE_DAY',obj.day_id,obj.week,obj.dow,before,obj);
  return {ok:true,day:obj};
}

function saveWeek(token,week){ requireToken_(token); return saveWeek_(week); }
function saveWeek_(week){
  if(!week||week.week===undefined) throw new Error('缺少 week');
  setupMOS();
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOS_SHEETS.WEEKS), row=find_(sh,1,String(week.week));
  if(row<2) throw new Error('找不到第 '+week.week+' 周');
  const before=sh.getRange(row,1,1,MOS_WEEK_HEADERS.length).getValues()[0], obj={};
  MOS_WEEK_HEADERS.forEach(h=>obj[h]=week[h]??'');
  obj.week=Number(week.week); obj.published=before[MOS_WEEK_HEADERS.indexOf('published')]===true||String(before[MOS_WEEK_HEADERS.indexOf('published')]).toLowerCase()==='true'; obj.updated_at=new Date();
  sh.getRange(row,1,1,MOS_WEEK_HEADERS.length).setValues([MOS_WEEK_HEADERS.map(h=>obj[h]??'')]);
  log_('UPDATE_WEEK','',obj.week,'',before,obj);
  return {ok:true,week:obj};
}

function publishWeek(token,week,published){ requireToken_(token); return publishWeek_(week,published); }
function publishWeek_(week,published){
  setupMOS(); const ss=SpreadsheetApp.getActiveSpreadsheet(), dsh=ss.getSheetByName(MOS_SHEETS.DAYS), wsh=ss.getSheetByName(MOS_SHEETS.WEEKS);
  const target=!!published, dv=dsh.getDataRange().getValues(), dh=dv[0], wi=dh.indexOf('week'), pi=dh.indexOf('published');
  if(wi<0||pi<0) throw new Error('MOS_DAYS表头错误');
  let count=0; for(let r=1;r<dv.length;r++) if(Number(dv[r][wi])===Number(week)){dsh.getRange(r+1,pi+1).setValue(target);count++;}
  const wr=find_(wsh,1,String(week)); if(wr>=2){const wpi=MOS_WEEK_HEADERS.indexOf('published');wsh.getRange(wr,wpi+1).setValue(target);}
  log_('PUBLISH_WEEK','',Number(week),'',[],{published:target,count});
  return {ok:true,week:Number(week),published:target,count};
}

function published_(){
  setupMOS(); const bool=v=>v===true||String(v).toLowerCase()==='true';
  return {ok:true,days:read_(MOS_SHEETS.DAYS).filter(x=>bool(x.published)),weeks:read_(MOS_SHEETS.WEEKS).filter(x=>bool(x.published)),events:read_(MOS_SHEETS.EVENTS).filter(x=>bool(x.active))};
}

function backupContent(token){ requireToken_(token); setupMOS();
  const payload={exportedAt:new Date().toISOString(),system:'MOS 1.2',api:MOS_API_VERSION,days:read_(MOS_SHEETS.DAYS),weeks:read_(MOS_SHEETS.WEEKS),events:read_(MOS_SHEETS.EVENTS),research:read_(MOS_SHEETS.RESEARCH)};
  return {ok:true,filename:'MOS_1.2_Content_Backup_'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss')+'.json',json:JSON.stringify(payload,null,2)};
}

function read_(name){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); if(!sh||sh.getLastRow()<1)return [];
  const v=sh.getDataRange().getValues(),h=v[0];
  return v.slice(1).filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]);return o;});
}
function find_(sh,col,key){ if(sh.getLastRow()<2)return -1; const a=sh.getRange(2,col,sh.getLastRow()-1,1).getDisplayValues().flat(); const i=a.findIndex(x=>String(x)===String(key)); return i<0?-1:i+2; }
function ensure_(ss,name,headers){ let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1); }
function log_(a,id,w,d,bef,aft){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MOS_SHEETS.LOG); if(sh)sh.appendRow([new Date(),a,id,w,d,JSON.stringify(bef),JSON.stringify(aft),Session.getActiveUser().getEmail()||'admin']); }
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
