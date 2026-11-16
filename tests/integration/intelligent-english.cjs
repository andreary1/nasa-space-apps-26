// Presentation fixtures only: never use these synthetic results as scientific evidence.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const {compareScience, finalizeDiscovery} = await import('../../scripts/ai_reports/intelligent_analysis.mjs');
  const {englishText, stateLabel} = await import('../../deliverables/demo/js/services/analysisLanguage.js');
  assert.equal(stateLabel('below_threshold'), 'Below Threshold');
  assert.equal(stateLabel('technical_failure'), 'Technical Error');
  assert.equal(stateLabel('source_verified'), 'Verified Discovery');
  assert.equal(stateLabel('comparison_ready'), 'Comparison Available');
  assert.equal(englishText('Score calculado (0.485617), abaixo do limiar 0.8.'), 'Calculated score (0.485617), below the threshold 0.8.');
  assert.equal(englishText('diameter_m EPSG:4326 1218.4'), 'diameter_m EPSG:4326 1218.4');
  const science = {
    localidade: {nome:'Presentation fixture', latitude:0, longitude:0, raio_km:3, comparar_com:['lua','marte']},
    topography: {metrics:{elevation_min_m:0, elevation_max_m:100, elevation_mean_m:50, relief_m:100, slope_mean_deg:5, slope_p90_deg:10, roughness_rms_m:2},
      coverage:1, valid_pixels:1000, resolution_m:30, metric_crs:'EPSG:32631',
      slope_distribution:{bins_deg:[0,5,15,30,45,90],counts:[100,200,300,200,200]},
      source:{id:'fixture', title:'Synthetic terrain for presentation tests only', kind:'DSM, EGM2008; inclui vegetação e edificações'},
      method:'ROI circular; reamostragem bilinear em CRS métrico; gradiente central sem preenchimento de NoData; RMS do resíduo de média local 7×7; relevo máximo−mínimo.'},
    identification:{id:'presentation-fixture', kind:'crater', status:'source_verified', message:'Cratera de impacto documentada pelo LPI; procurando a borda no DEM.',
      verified_location:{latitude:0,longitude:0},sources:[{id:'fixture',title:'Test-only source',url:'https://example.org/test'}]}, feature:null,
  };
  const result = finalizeDiscovery(compareScience(science));
  result.id='presentation-fixture';
  result.explanation={status:'unavailable', message:'Interpretação automática indisponível. Resultado científico preservado; confira credencial, modelo e conexão.'};
  result.discovery.status='unavailable';
  result.discovery.message='Pesquisa Gemini/Google indisponível (HTTP 429). Confira suporte do modelo, chave, cota e faturamento. Nenhuma evidência foi criada. Novas tentativas pausadas por dez minutos.';
  const original=JSON.stringify(result);
  const output=path.join(os.tmpdir(),'paf-english-qa'); fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce',locale:'pt-BR'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/analyze',route=>route.fulfill({status:202,json:{id:result.id}}));
    await page.route('**/api/analyze/presentation-fixture',route=>route.fulfill({json:{id:result.id,status:'complete',message:'Resultado preparado.',stages:[{id:'processando_relevo',message:'Reprojetando DEM e calculando métricas em metros…'}],result}}));
    const base=process.env.DEMO_URL || 'http://127.0.0.1:8000/';
    await page.goto(base+'#/intelligent');
    assert.equal(await page.locator('.sidebar [data-page=intelligent]').getAttribute('aria-label'),'Intelligent Analysis');
    assert.equal((await page.locator('#view-intelligent h1').innerText()).trim(),'Intelligent Analysis');
    await page.locator('#intelligent-lat').fill('91');
    await page.locator('#intelligent-submit').click();
    assert.equal(await page.locator('#intelligent-lat').evaluate(e=>e.validationMessage),'Enter a value between -90 and 90.');
    await page.locator('#intelligent-lat').fill('0');
    const posted=page.waitForRequest(r=>r.method()==='POST' && new URL(r.url()).pathname==='/api/analyze');
    await page.locator('#intelligent-submit').click();
    const input=(await posted).postDataJSON();
    assert.deepEqual(Object.keys(input).sort(),['comparar_com','latitude','longitude','nome','raio_km']);
    assert.deepEqual(input.comparar_com,['lua','marte']);
    await page.locator('#intelligent-result h2').filter({hasText:'Presentation fixture'}).waitFor();
    await page.locator('#intelligent-result details').evaluateAll(nodes=>nodes.forEach(el=>el.open=true));
    const text=await page.locator('#view-intelligent').innerText();
    assert.match(text,/HTTP 429/); assert.match(text,/Incompatible Comparison/);assert.match(text,/Insufficient Data/);
    assert.match(text,/Reprojecting the DEM/);assert.match(text,/ten minutes/);
    assert.doesNotMatch(text,/\b(?:Análise|Métricas|Cratera|Indisponíveis|Nenhuma|Fontes|Verificando|calculado|inconclusiva|comparação|declividade|rugosidade|não|disponível|cobertura|limiar)\b/iu);
    const downloadEvent=page.waitForEvent('download');await page.locator('.intelligent-export-diagnostic').click();
    const download=await downloadEvent;assert.match(download.suggestedFilename(),/^analysis-/);
    const file=path.join(output,'presentation-export.json');await download.saveAs(file);
    const exported=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.deepEqual(exported.comparisons,result.comparisons);assert.deepEqual(exported.topography,result.topography);
    assert.equal(JSON.stringify(result),original,'Translation must not mutate a result');
    for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844]]){
      await page.setViewportSize({width,height});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(output,`english-${width}.png`),fullPage:true});
    }
    await page.setViewportSize({width:1366,height:768});
    // Exercise an actual API error message without changing its status or contract.
    await page.route('**/api/analyze',route=>route.fulfill({status:429,json:{error:'Uma análise já está em andamento. Aguarde sua conclusão.'}}));
    await page.locator('#intelligent-submit').click();
    await page.locator('#intelligent-error:not([hidden])').waitFor();
    assert.match(await page.locator('#intelligent-error').innerText(),/An analysis is already running/);
    await page.route('**/api/analyze',route=>route.fulfill({status:202,json:{id:result.id}}));
    await page.route('**/api/analyze/presentation-fixture',route=>route.fulfill({json:{id:result.id,status:'error',error:'DEM sem cobertura válida suficiente (NoData).',stages:[]}}));
    await page.locator('#intelligent-submit').click();
    await page.waitForFunction(()=>document.getElementById('intelligent-error').textContent.includes('Technical processing failure'));
    assert.match(await page.locator('#intelligent-error').innerText(),/insufficient valid coverage/);
    // Same input dimensions and active gradient as the existing Comparisons catalog.
    const inputStyle=await page.locator('#intelligent-name').evaluate(el=>{
      const s=getComputedStyle(el);return [s.padding,s.borderRadius,s.borderColor];
    });
    const gradient=await page.locator('#intelligent-submit').evaluate(el=>getComputedStyle(el).backgroundImage);
    await page.locator('.sidebar [data-page=comparisons]').click();
    assert.deepEqual(inputStyle,await page.locator('#site-select').evaluate(el=>{
      const s=getComputedStyle(el);return [s.padding,s.borderRadius,s.borderColor];
    }));
    assert.equal(gradient,await page.locator('#site-selector [aria-pressed=true]').evaluate(el=>getComputedStyle(el,'::before').backgroundImage));
    const styles=async p=>p.evaluate(()=>['#comparison-card-section','#catalog-section','#site-select','#site-selector button','.sidebar [data-page=comparisons]'].map(selector=>{
      const s=getComputedStyle(document.querySelector(selector));return Object.fromEntries([...s].map(key=>[key,s.getPropertyValue(key)]));
    }));
    const baseline=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    await baseline.route('**/styles/intelligent.css',r=>r.fulfill({contentType:'text/css',body:''}));
    await baseline.goto(base+'#/comparisons');
    await baseline.locator('#site-selector button').first().waitFor();
    assert.deepEqual(await styles(page),await styles(baseline),'Intelligent CSS must not change Comparisons');
    await baseline.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: English form/validation, legacy messages, 429, scientific states, technical errors, unchanged request/export data, four sizes and no runtime errors. '+output);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
