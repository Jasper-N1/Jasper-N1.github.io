(() => {
  const snapshot = window.kevinSnapshot;
  const base = 'https://kevinwimer.com/cancer/resources/my-cancer-story/';
  const $ = id => document.getElementById(id);
  function node(tag, text = '', attrs = {}, parent) {
    const element = document.createElement(tag);
    element.textContent = text;
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    parent?.append(element);
    return element;
  }
  const camera = $('twin-camera');
  const stage = camera.closest('.twin-stage');
  const views = {body:[-60,-24,620,1392], lungs:[-24,113,570,450]};
  const modelButtons = [...document.querySelectorAll('[data-model-view]')];
  const modelPanels = [...document.querySelectorAll('.kevin-twin [data-panel]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let modelFrame = 0;
  modelButtons.forEach(button => {
    button.onclick = () => {
      const view = button.dataset.modelView;
      stage.dataset.view = view;
      modelButtons.forEach(item => item.setAttribute('aria-pressed',String(item === button)));
      modelPanels.forEach(panel => panel.hidden = panel.dataset.panel !== view);
      camera.setAttribute('aria-label',view === 'body' ? 'Illustrative full-body anatomy' : 'Illustrative chest anatomy with lungs highlighted');
      cancelAnimationFrame(modelFrame);
      const to = views[view], from = camera.getAttribute('viewBox').split(' ').map(Number);
      if (reducedMotion.matches) {
        camera.setAttribute('viewBox',to.join(' '));
        return;
      }
      const started = performance.now();
      function animate(now) {
        const t = Math.min(1,(now-started)/560), eased = t*t*(3-2*t);
        camera.setAttribute('viewBox',from.map((value,index) => value+(to[index]-value)*eased).join(' '));
        if (t < 1) modelFrame = requestAnimationFrame(animate);
      }
      modelFrame = requestAnimationFrame(animate);
    };
  });

  const categories = {
    diagnosis:'Diagnosis', treatment:'Treatment', test:'Tests and procedures',
    scan:'Imaging', appointment:'Care visits', research:'Research and options'
  };
  const fullDate = new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const monthDate = new Intl.DateTimeFormat('en-GB', {month:'long',year:'numeric',timeZone:'UTC'});
  const dateLabel = value => value.length === 7 ? monthDate.format(new Date(value + '-01')) : fullDate.format(new Date(value));
  const eventCategory = $('event-category');
  node('option','All events',{value:''},eventCategory);
  Object.entries(categories).forEach(([key,label]) => node('option',label,{value:key},eventCategory));
  function events() {
    const list = snapshot.timeline.filter(item =>
      (!eventCategory.value || item.category === eventCategory.value) && (!$('milestones-only').checked || item.milestone));
    $('events').replaceChildren(...list.map(item => {
      const row = node('li');
      const when = node('div','',{},row);
      node('time',dateLabel(item.date),{datetime:item.date},when);
      if (item.end) node('time',' to '+dateLabel(item.end),{datetime:item.end},when);
      const main = node('div','',{},row);
      node('strong',item.title,{},main);
      node('div',categories[item.category],{class:'fine'},main);
      node('a','Source ↗',{href:base+'timeline/#'+item.id,'aria-label':'Source for '+item.title},row);
      return row;
    }));
    $('event-count').textContent = list.length + ' events';
  }
  eventCategory.onchange = $('milestones-only').onchange = events;
  events();

  const notes = [
    'The initial CT showed fluid around the left lung.',
    'A lesion along the left pleura was larger than on the preceding study.',
    'The radiology report described a new 7 mm finding near the left lung with uncertain significance.',
    'Pleural nodules had increased in size since April.',
    'The radiology report described stable findings compared with the August study.'
  ];
  const studies = snapshot.imaging, study = $('study'), series = $('series'), slider = $('slice');
  const canvas = $('scan'), context = canvas.getContext('2d'), cache = new Map();
  studies.forEach((item,index) => node('option',item.title,{value:index},study));
  study.value = String(studies.length - 1);
  function load(url) {
    if (!cache.has(url)) {
      const img = new Image();
      img.src = new URL(url,'https://kevinwimer.com').href;
      cache.set(url,img.decode().then(() => img).catch(error => { cache.delete(url); throw error; }));
    }
    return cache.get(url);
  }
  let request = 0;
  async function drawSlice() {
    const token = ++request;
    const view = studies[study.value].series[series.value];
    const frame = Number(slider.value), index = frame - 1, pageSize = view.grid ** 2;
    const cell = index % pageSize;
    const bookmark = view.bookmarks.find(item => item.frame === frame);
    $('slice-number').value = frame + ' / ' + view.count;
    $('previous-slice').disabled = frame <= 1;
    $('next-slice').disabled = frame >= view.count;
    slider.setAttribute('aria-valuetext', 'Slice ' + frame + ' of ' + view.count);
    canvas.setAttribute('aria-label', view.name + ', slice ' + frame + (bookmark ? ', ' + bookmark.title : ''));
    $('scan-error').textContent = 'Loading slice…';
    $('scan-error').hidden = false;
    try {
      const image = await load(view.sheets[Math.floor(index / pageSize)]);
      if (request !== token) return;
      context.drawImage(image,(cell % view.grid)*560,Math.floor(cell/view.grid)*400,560,400,0,0,560,400);
      if (bookmark?.annotation) {
        const {x,y,radiusX,radiusY} = bookmark.annotation;
        context.beginPath();
        context.ellipse(x*560,y*400,radiusX*560,radiusY*400,0,0,Math.PI*2);
        context.strokeStyle = '#67d5f1';
        context.lineWidth = 2;
        context.stroke();
      }
      canvas.dataset.frame = String(frame);
      $('scan-error').hidden = true;
    } catch {
      if (request !== token) return;
      context.clearRect(0,0,560,400);
      $('scan-error').textContent = 'This slice could not load. Open Kevin’s original imaging collection below.';
      $('scan-error').hidden = false;
    }
  }
  function setSeries() {
    const view = studies[study.value].series[series.value];
    slider.max = String(view.count);
    slider.value = String(view.start);
    $('bookmarks').replaceChildren(...view.bookmarks.map(item => {
      const button = node('button',item.title,{type:'button'});
      button.onclick = () => { slider.value = String(item.frame); drawSlice(); };
      return button;
    }));
    drawSlice();
  }
  function setStudy() {
    const item = studies[study.value];
    $('study-heading').textContent = item.title;
    $('study-note').textContent = notes[study.value];
    series.replaceChildren(...item.series.map((view,index) => node('option',view.name,{value:index})));
    setSeries();
  }
  study.onchange = setStudy;
  series.onchange = setSeries;
  slider.oninput = drawSlice;
  $('previous-slice').onclick = () => { slider.stepDown(); drawSlice(); };
  $('next-slice').onclick = () => { slider.stepUp(); drawSlice(); };
  setStudy();

  snapshot.samples.forEach(([date,title,result,context]) => {
    const card = node('article','',{class:'sample'},$('samples'));
    node('p',dateLabel(date),{class:'kicker'},card);
    node('h3',title,{},card);
    node('p',result,{},card);
    node('p',context,{class:'fine'},card);
  });
  Object.entries(snapshot.hla).forEach(([locus,alleles]) => node('p','HLA-' + locus + ' · ' + alleles.join(' and '),{},$('hla')));

  const rows = snapshot.labs.observations;
  const groupKey = row => JSON.stringify(row.slice(0,3));
  const groups = new Map(rows.map(row => [groupKey(row), row.slice(0,3)]));
  const formatCount = number => number.toLocaleString('en-US');
  $('lab-count').textContent = formatCount(rows.length);
  const test = $('lab-test'), period = $('lab-period'), search = $('lab-search');
  const allTests = [...groups].sort((a,b) => a[1][0].localeCompare(b[1][0]));
  const resultChart = $('lab-chart');
  const pageSize = 25;
  let page = 0;
  function drawChart(data) {
    resultChart.replaceChildren();
    if (!test.value) {
      node('p','Choose a test to chart its numeric readings.',{},resultChart);
      return;
    }
    const units = new Map();
    for (const row of data) {
      const match = String(row[4]).trim().match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:\s+([^\d].*))?$/i);
      if (!match) continue;
      const unit = (match[2] || '').trim(), value = Number(match[1]), time = Date.parse(row[3]);
      if (!Number.isFinite(value) || !Number.isFinite(time)) continue;
      if (!units.has(unit)) units.set(unit,[]);
      units.get(unit).push([time,value]);
    }
    if (!units.size) {
      node('p','This selection has no exact numeric readings to chart. The original values are below.',{},resultChart);
      return;
    }
    for (const [unit, values] of units) {
      values.sort((a,b) => a[0]-b[0]);
      const max = Math.max(...values.map(p=>p[1])), min = Math.min(...values.map(p=>p[1]));
      const pad = (max-min)*.12 || Math.max(Math.abs(min)*.06,.01);
      const start = values[0][0], end = values.at(-1)[0];
      const x = t => start === end ? 365 : 56 + ((t-start)/(end-start))*635;
      const y = v => 160-((v-min+pad)/(max-min+2*pad))*142;
      const label = groups.get(test.value)[0] + (unit ? ' · ' + unit : '');
      node('h3',label,{},resultChart);
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 720 190');
      svg.setAttribute('role','img');
      svg.setAttribute('aria-label',label + ' by observation date');
      function mark(tag,attrs,text) {
        const el = document.createElementNS(svg.namespaceURI,tag);
        for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v);
        if (text != null) el.textContent = text;
        svg.append(el);
        return el;
      }
      for (const level of [...new Set([min,(min+max)/2,max])]) {
        mark('line',{x1:56,x2:691,y1:y(level),y2:y(level),stroke:'#c4d4ce'});
        mark('text',{x:50,y:y(level)+4,'text-anchor':'end',fill:'#495953','font-size':12},Number(level.toPrecision(5)));
      }
      if (values.length > 1) mark('polyline',{points:values.map(([t,v])=>x(t)+','+y(v)).join(' '),fill:'none',stroke:'#006b8c','stroke-width':2});
      for (const [t,v] of values) {
        const point = mark('circle',{cx:x(t),cy:y(v),r:3,fill:'#006b8c'});
        const title = document.createElementNS(svg.namespaceURI,'title');
        title.textContent = fullDate.format(t)+' · '+v+' '+unit;
        point.append(title);
      }
      mark('text',{x:56,y:182,fill:'#495953','font-size':12},fullDate.format(start));
      if (start!==end) mark('text',{x:691,y:182,'text-anchor':'end',fill:'#495953','font-size':12},fullDate.format(end));
      resultChart.append(svg);
    }
  }
  function matches(row, query) {
    return row.slice(0,3).some(field => String(field ?? '').toLowerCase().includes(query));
  }
  function updateTests() {
    const old = test.value, query = search.value.trim().toLowerCase();
    const options = allTests.filter(([,group]) => matches(group,query));
    test.replaceChildren(node('option','All matching tests',{value:''}),...options.map(([key,[label,system,code]]) =>
      node('option',label+(code ? ' · '+code : ''),{value:key})));
    if (options.some(([key]) => key === old)) test.value = old;
    else if (options.length === 1) test.value = options[0][0];
  }
  function renderLabs() {
    const query = search.value.trim().toLowerCase();
    const data = rows.filter(row => (!test.value || groupKey(row) === test.value) &&
      (!period.value || row[3] >= period.value) && matches(row,query));
    const first = page*pageSize;
    $('lab-rows').replaceChildren(...data.slice(first,first+pageSize).map(([name,system,code,date,value,range]) => {
      const tr = node('tr');
      [dateLabel(date),name,value,range || '—',[system,code].filter(Boolean).join(' ') || '—']
        .forEach(field => node('td',String(field ?? '—'),{},tr));
      return tr;
    }));
    $('lab-page').value = data.length ? formatCount(first+1)+'–'+formatCount(Math.min(first+pageSize,data.length))+' of '+formatCount(data.length) : 'No matching readings';
    $('prev-page').disabled = page===0;
    $('next-page').disabled = first+pageSize>=data.length;
    drawChart(data);
  }
  search.oninput = () => { page=0; updateTests(); renderLabs(); };
  test.onchange = period.onchange = () => { page=0; renderLabs(); };
  $('prev-page').onclick = () => { page--; renderLabs(); };
  $('next-page').onclick = () => { page++; renderLabs(); };
  updateTests();
  renderLabs();
})();
