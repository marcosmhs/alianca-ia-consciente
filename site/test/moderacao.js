const {SMTPServer}=require('smtp-server');
const {simpleParser}=require('mailparser');
const {chromium}=require('playwright');
let mail=null;
const srv=new SMTPServer({authOptional:true,disabledCommands:['STARTTLS'],onAuth(a,s,cb){cb(null,{user:a.username})},
  onData(st,s,cb){simpleParser(st).then(m=>{mail=m;cb();});}});
srv.listen(2525,'127.0.0.1');
const DB='projects/demo-alianca/databases/(default)/documents', FS='http://127.0.0.1:8080/v1/', SITE='http://127.0.0.1:5000';
const s=v=>({stringValue:v}); let fail=0;
const check=(ok,msg)=>{console.log((ok?'OK  ':'FAIL')+' '+msg); if(!ok)fail++;};
const publicas=async()=>((await (await fetch(FS+DB+'/signatarias')).json()).documents||[]);
const wait=async(f,n=60)=>{for(let i=0;i<n;i++){const v=await f();if(v)return v;await new Promise(r=>setTimeout(r,500));}return null;};
(async()=>{
  check((await fetch(FS+DB+'/signatarias')).status===200,'signatárias: leitura pública permitida');
  const w=await fetch(FS+DB+':commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({writes:[{update:{name:DB+'/signatarias/hack',fields:{empresa:s('Hacker')}}}]})});
  check(w.status===403,'signatárias: escrita pelo público bloqueada ('+w.status+')');
  const r=await fetch(FS+DB+':commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({writes:[{
    update:{name:DB+'/interesse/abc123',fields:{empresa:s('<b>Acme</b> & Cia'),site:s('https://acme.example'),setor:s('tecnologia'),porte:s('51-200'),nome:s('Bia'),cargo:s('CEO'),
    email:s('bia@acme.example'),participacao:s('fundadora'),pilotos:{arrayValue:{values:[]}},consentimento:{booleanValue:true}}},
    updateTransforms:[{fieldPath:'criadoEm',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}}]})});
  check(r.status===200,'inscrição criada');
  await wait(()=>mail); check(!!mail,'e-mail de aviso recebido');
  const aprovar=(mail.text.match(/Aprovar e publicar no site: (\S+)/)||[])[1];
  const recusar=(mail.text.match(/Recusar: (\S+)/)||[])[1];
  check(!!aprovar&&!!recusar,'e-mail traz links de aprovar e recusar');
  check(mail.html.includes('Aprovar e publicar no site')&&mail.html.includes('&lt;b&gt;Acme'),'botões no HTML e nome escapado');
  check((await publicas()).length===0,'antes da aprovação: nada no site');
  const g=await fetch(aprovar); const gt=await g.text();
  check(g.status===200&&gt.includes('Aprovar e publicar no site?')&&gt.includes('method="post"'),'abrir o link (GET) só mostra a confirmação');
  check((await publicas()).length===0,'GET não aprova sozinho (proteção contra pré-visualização de links)');
  const bad=await fetch(aprovar.replace(/t=([0-9a-f])/,(m,c)=>'t='+(c==='0'?'1':'0')));
  check(bad.status===403,'token adulterado recusado ('+bad.status+')');
  const troca=await fetch(aprovar.replace('acao=aprovar','acao=remover'));
  check(troca.status===403,'trocar a ação no link é recusado ('+troca.status+')');
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1100,height:900}});
  await p.goto(aprovar); await p.screenshot({path:'test/mod-confirmar.png'});
  await p.click('button[type=submit]'); await p.waitForLoadState();
  check((await p.textContent('h1')).includes('Empresa aprovada'),'clicar em Aprovar publica a empresa');
  await p.screenshot({path:'test/mod-aprovada.png'});
  const pub=await publicas(); const f=pub[0]&&pub[0].fields;
  check(pub.length===1&&f.categoria.stringValue==='fundadora'&&!f.email&&!f.nome,'documento público só com empresa, site e categoria (sem dados pessoais)');
  for(const scheme of ['light','dark']){
    const q=await b.newPage({viewport:{width:1100,height:900},colorScheme:scheme});
    await q.goto(SITE+'/#signatarias'); await q.waitForSelector('#lista-signatarias .prop:nth-child(3)',{timeout:8000}).catch(()=>{});
    const cards=await q.$$eval('#lista-signatarias .prop .line',e=>e.map(x=>x.textContent.trim()));
    if(scheme==='light'){
      check(JSON.stringify(cards)===JSON.stringify(['That Exotic Bug','<b>Acme</b> & Cia','Sua empresa']),'site lista a empresa aprovada: '+JSON.stringify(cards));
      check(await q.$eval('#lista-signatarias .prop:nth-child(2) a',a=>a.href==='https://acme.example/'),'link do site da empresa');
      check(!!(await q.$('#lista-signatarias')),'seção de signatárias presente');
    }
    await q.locator('#signatarias').screenshot({path:`test/sig-${scheme}.png`});
  }
  // recusar via formulário (POST)
  const tR=new URL(recusar).searchParams;
  const pr=await fetch(SITE+'/moderar',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({id:tR.get('id'),acao:'recusar',t:tR.get('t')})});
  check(pr.status===200&&(await pr.text()).includes('Inscrição recusada'),'recusar via POST');
  check((await publicas()).length===0,'depois de recusar: empresa sai do site');
  await b.close(); srv.close();
  process.exit(fail?1:0);
})();
