// doPost that accepts JSON and form-urlencoded and sets CORS headers
const SHEET_NAME = 'Leads';
const SPREADSHEET_ID = '1JPl5FDmQiwnfgGS9Rwtm98QRH2hw638zfYE7ie-PlVs';
const ADMIN_EMAIL = 'pavelbaurov@bk.ru';

function getProp_(k){ return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function asJSON_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  try{
    let payload = {};
    if (e.postData && e.postData.type && e.postData.type.indexOf('json')>-1){
      payload = JSON.parse(e.postData.contents || '{}');
    } else if (e.parameter && Object.keys(e.parameter).length){
      payload = e.parameter;
    }
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    const ts = new Date();

    if (payload.event === 'lead'){
      const row = [ts, 'lead', payload.name||'', payload.phone||'', payload.email||'', payload.comment||'', '', '', payload.ua||''];
      sh.appendRow(row);
      const TG_TOKEN = getProp_('TG_TOKEN'), TG_CHAT = getProp_('TG_CHAT');
      if (TG_TOKEN && TG_CHAT){
        const text = '📝 Новая заявка\nИмя: '+(payload.name||'')+'\nТелефон: '+(payload.phone||'')+'\nEmail: '+(payload.email||'')+'\nКомментарий: '+(payload.comment||'');
        UrlFetchApp.fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendMessage', { method:'post', payload:{ chat_id: TG_CHAT, text: text } });
      }
      if (ADMIN_EMAIL){
        MailApp.sendEmail({ to: ADMIN_EMAIL, subject: 'Новая заявка с лендинга',
          htmlBody: '<b>Имя:</b> '+(payload.name||'')+'<br><b>Телефон:</b> '+(payload.phone||'')+'<br><b>Email:</b> '+(payload.email||'')+'<br><b>Комментарий:</b> '+(payload.comment||'') });
      }
    } else if (payload.event === 'click'){
      const row = [ts, 'click', '', '', '', '', payload.action||'', JSON.stringify(payload.meta||{}), payload.ua||''];
      sh.appendRow(row);
    }
    const out = asJSON_({ ok:true });
    out.setHeader('Access-Control-Allow-Origin', '*');
    out.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    out.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    return out;

  }catch(err){
    const out = asJSON_({ ok:false, error: String(err) });
    out.setHeader('Access-Control-Allow-Origin', '*');
    return out;
  }
}

function doGet(){ const out = asJSON_({ ok:true, ping:'pong' }); out.setHeader('Access-Control-Allow-Origin','*'); return out; }

function setSecretsOnce(){
  const props = PropertiesService.getScriptProperties();
  props.setProperty('TG_TOKEN','8568266897:AAFEObh5Wc9zJ_zx8WBUCiuUDh3pvCits0E');
  props.setProperty('TG_CHAT','1000809528');
}
