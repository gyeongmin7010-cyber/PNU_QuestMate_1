
const crypto = require('crypto');

const SPOTS = [
  { id:'library', name:'새벽벌도서관', emoji:'📚', entry:'QM-V13-LIBRARY-ENTRY', exit:'QM-V13-LIBRARY-EXIT', prefix:'LIB', challenge:'FOCUS', type:'study' },
  { id:'meal', name:'금정회관/학생회관 식당', emoji:'🍚', entry:'QM-V13-MEAL-ENTRY', exit:'QM-V13-MEAL-EXIT', prefix:'MEAL', challenge:'RICE', type:'general' },
  { id:'notice', name:'학생지원시스템 공지 확인', emoji:'📣', entry:'QM-V13-NOTICE-ENTRY', exit:'QM-V13-NOTICE-EXIT', prefix:'NOTI', challenge:'INFO', type:'general' },
  { id:'team', name:'도서관 그룹스터디룸 팀플', emoji:'🤝', entry:'QM-V13-TEAM-ENTRY', exit:'QM-V13-TEAM-EXIT', prefix:'TEAM', challenge:'CREW', type:'general' }
];
const SECRET = process.env.QUESTMATE_CHECKIN_SECRET || 'pnu-questmate-v13';
const headers = {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'content-type'};
function kst(date=new Date()){const p=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const g=t=>p.find(x=>x.type===t).value;return {date:`${g('year')}-${g('month')}-${g('day')}`,mmdd:`${g('month')}${g('day')}`};}
function dailyCode(s){return `${s.prefix}-${kst().mmdd}`;}
function norm(x){return String(x||'').trim().toUpperCase();}
function sign(raw){return crypto.createHmac('sha256',SECRET).update(raw).digest('hex');}
function tokenFor(obj){const raw=Buffer.from(JSON.stringify(obj)).toString('base64url');return `${raw}.${sign(raw)}`;}
function readToken(t){const [raw,sig]=String(t||'').split('.');if(!raw||!sig||sign(raw)!==sig) throw new Error('방문 인증 정보가 유효하지 않습니다.');return JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));}
function todayLogs(logs){const d=kst().date;return Array.isArray(logs)?logs.filter(x=>x&&x.date===d):[];}
function checkLimit(logs){if(todayLogs(logs).length>=1) throw new Error('오늘 받을 수 있는 스탬프 1개를 이미 받았습니다.');}
function waitSeconds(spot,presenter){if(presenter) return 10; return spot.type==='study' ? 10800 : 1800;}
function json(statusCode, body){return {statusCode,headers,body:JSON.stringify(body)};}

exports.handler = async function(event){
  if(event.httpMethod==='OPTIONS') return {statusCode:204,headers,body:''};
  if(event.httpMethod!=='POST') return json(405,{ok:false,message:'POST 요청만 지원합니다.'});
  try{
    const body = JSON.parse(event.body||'{}');
    if(body.action==='start'){
      const spot = SPOTS.find(s=>s.id===body.spotId);
      if(!spot) throw new Error('장소 정보가 올바르지 않습니다.');
      if(norm(body.entryCode)!==spot.entry) throw new Error('입장 QR 값이 맞지 않습니다.');
      if(norm(body.dailyCode)!==dailyCode(spot)) throw new Error(`오늘 현장 코드가 맞지 않습니다. 현장 코드: ${dailyCode(spot)}`);
      if(norm(body.challenge)!==spot.challenge) throw new Error('현장 확인 문구가 맞지 않습니다.');
      checkLimit(body.logs||[]);
      const startedAt = Date.now();
      const payload = {spotId:spot.id, startedAt, waitSeconds:waitSeconds(spot, !!body.presenter), presenter:!!body.presenter, nonce:crypto.randomBytes(8).toString('hex')};
      return json(200,{ok:true,message:'입장 인증 완료. 체류 기준을 채운 뒤 퇴장 인증을 진행하세요.',visit:{...payload,id:tokenFor(payload)}});
    }
    if(body.action==='complete'){
      const visit = body.visit||{};
      const decoded = readToken(visit.id);
      const spot = SPOTS.find(s=>s.id===decoded.spotId);
      if(!spot) throw new Error('장소 정보가 올바르지 않습니다.');
      if(norm(body.exitCode)!==spot.exit) throw new Error('퇴장 QR 값이 맞지 않습니다.');
      if(Date.now()-decoded.startedAt < decoded.waitSeconds*1000) throw new Error('아직 필요한 체류시간을 채우지 않았습니다.');
      if(String(body.activityNote||'').trim().length<8) throw new Error('활동 기록을 8글자 이상 입력해야 합니다.');
      checkLimit(body.logs||[]);
      const now = new Date();
      return json(200,{ok:true,message:'스탬프 1개가 지급되었습니다.',record:{
        id:'QM-'+crypto.randomBytes(5).toString('hex').toUpperCase(),
        spotId:spot.id, spotName:spot.name, emoji:spot.emoji, issuedAt:now.toISOString(), date:kst(now).date,
        activityNote:String(body.activityNote).trim()
      }});
    }
    throw new Error('알 수 없는 요청입니다.');
  }catch(e){return json(400,{ok:false,message:e.message||'인증 실패'});}
};
