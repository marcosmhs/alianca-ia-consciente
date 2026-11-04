// Testa regras (REST) e o formulário real no navegador contra os emuladores.
const {chromium}=require('playwright');
const base='http://127.0.0.1:8080/v1/projects/demo-alianca/databases/(default)/documents';
const s=v=>({stringValue:v});
const ok={empresa:s('Exemplo SA'),setor:s('tecnologia'),porte:s('51-200'),nome:s('Ana'),cargo:s('CTO'),email:s('ana@exemplo.com'),participacao:s('fundadora'),pilotos:{arrayValue:{values:[s('dados')]}},consentimento:{booleanValue:true}};
async function commit(fields,ts=true,id=Math.random().toString(16).slice(2)){
  const w={update:{name:'projects/demo-alianca/databases/(default)/documents/interesse/'+id,fields},currentDocument:{exists:false}};
  if(ts)w.updateTransforms=[{fieldPath:'criadoEm',setToServerValue:'REQUEST_TIME'}];
  const r=await fetch(base+':commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({writes:[w]})});return r.status;}
(async()=>{
  const cases=[
    ['válido',await commit(ok),200],
    ['sem consentimento',await commit({...ok,consentimento:{booleanValue:false}}),403],
    ['e-mail inválido',await commit({...ok,email:s('nada')}),403],
    ['setor fora da lista',await commit({...ok,setor:s('xyz')}),403],
    ['campo extra',await commit({...ok,admin:{booleanValue:true}}),403],
    ['sem criadoEm do servidor',await commit(ok,false),403],
  ];
  const lr=await fetch(base+'/interesse');cases.push(['leitura pública',lr.status,403]);
  let fail=0;for(const [n,got,exp] of cases){const pass=got===exp;if(!pass)fail++;console.log((pass?'OK  ':'FAIL')+' '+n+' -> '+got+' (esperado '+exp+')');}
  const b=await chromium.launch();
  for(const scheme of ['light','dark']){
    const p=await b.newPage({viewport:{width:1300,height:900},colorScheme:scheme});
    await p.goto('http://localhost:5000/');await p.waitForTimeout(1200);
    await p.screenshot({path:`test/site-${scheme}.png`});
    if(scheme==='light'){
      await p.click('#empresas summary');
      await p.click('#enviar');const errs=await p.$$eval('#form .error',e=>e.length);console.log((errs===8?'OK  ':'FAIL')+' validação vazia (empresa) mostra '+errs+' erros');if(errs!==8)fail++;
      await p.fill('#empresa','Empresa Teste');await p.selectOption('#setor','mobilidade');await p.selectOption('#porte','201-1000');
      await p.fill('#nome','Fulano Teste');await p.fill('#cargo','Head de Dados');await p.fill('#email','fulano@teste.com.br');
      await p.check('input[value=fundadora]');await p.check('input[value=dados]');await p.check('#consentimento');
      await p.click('#enviar');await p.waitForSelector('#done:not([hidden])',{timeout:8000}).then(()=>console.log('OK   formulário de empresa enviado pelo navegador')).catch(()=>{fail++;console.log('FAIL formulário no navegador')});
      await p.locator('#participar').screenshot({path:'test/form-done.png'});
    } else {
      await p.locator('#participar').screenshot({path:'test/form-dark.png'});
    }
    const m=await b.newPage({viewport:{width:390,height:844},colorScheme:scheme});
    await m.goto('http://localhost:5000/');await m.waitForTimeout(800);
    const ov=await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log((ov?'FAIL':'OK  ')+' sem rolagem lateral no celular ('+scheme+')');if(ov)fail++;
    await m.screenshot({path:`test/mobile-${scheme}.png`});
  }
  await b.close();
  // conta documentos gravados (leitura administrativa do emulador)
  const adm=await fetch(base+'/interesse',{headers:{Authorization:'Bearer owner'}});const j=await adm.json();
  console.log('documentos gravados: '+(j.documents||[]).length+' | exemplo criadoEm: '+((j.documents||[])[0]||{fields:{}}).fields.criadoEm?.timestampValue);
  process.exit(fail?1:0);
})();
