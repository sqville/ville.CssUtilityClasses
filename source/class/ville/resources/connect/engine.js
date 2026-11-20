const workspace = document.getElementById('workspace');
const svg = document.getElementById('svg');

const MDI = { nodes: new Map(), conns: [], vals: {}, subs: {}, stack: [], count: 0, raf: false };

function syncSvgSize() {
  svg.setAttribute('width', window.innerWidth);
  svg.setAttribute('height', window.innerHeight);
  svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  updateWires();
}
window.addEventListener('resize', syncSvgSize);

const bezier = (x1, y1, x2, y2) => {
  const dx = Math.max(Math.abs(x2 - x1) * 0.5, 50);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

const center = el => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

function makePath(isDraft = false) {
  const p = document.createElementNS('http://w3.org', 'path');
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', isDraft ? '#9ca3af' : '#60a5fa');
  p.setAttribute('stroke-width', isDraft ? '2' : '3');
  if (isDraft) p.setAttribute('stroke-dasharray', '5,5');
  else p.setAttribute('class', 'wire');
  return p;
}

function updateWires() {
  if (MDI.raf) return;
  MDI.raf = true;
  requestAnimationFrame(() => {
    MDI.raf = false;
    MDI.conns.forEach(c => {
      const f = document.querySelector(`[data-p="${c.from}"]`);
      const t = document.querySelector(`[data-p="${c.to}"]`);
      if (f && t && c.el) {
        const a = center(f), b = center(t);
        c.el.setAttribute('d', bezier(a.x, a.y, b.x, b.y));
      }
    });
  });
}

function emit(outId, v) {
  MDI.vals[outId] = v;
  MDI.conns.forEach(c => { if (c.from === outId && MDI.subs[c.to]) MDI.subs[c.to](v); });
}

function connect(from, to) {
  if (!from || !to || from === to || MDI.conns.some(c => c.from === from && c.to === to)) return;
  const path = makePath(false);
  const conn = { from, to, el: path };
  path.addEventListener('click', () => {
    path.remove();
    const idx = MDI.conns.indexOf(conn);
    if (idx > -1) MDI.conns.splice(idx, 1);
    if (MDI.subs[to]) MDI.subs[to]('');
  });
  svg.appendChild(path);
  MDI.conns.push(conn);
  updateWires();
  if (MDI.subs[to]) MDI.subs[to](MDI.vals[from] ?? '');
}

function focusWin(w) {
  MDI.stack = MDI.stack.filter(x => x !== w);
  MDI.stack.push(w);
  MDI.stack.forEach((x, i) => {
    x.style.zIndex = 10 + i;
    x.classList.toggle('active', i === MDI.stack.length - 1);
  });
}

function makeWin({ id: forcedId, type, x = 60, y = 70, w = 250, h = 175, state = {}, inputs = [], outputs = [], tabs = [], init }) {
  const num = forcedId ? parseInt(forcedId.slice(1), 10) : ++MDI.count;
  if (num > MDI.count) MDI.count = num;
  const id = forcedId || `w${num}`;

  const win = document.createElement('dialog');
  win.open = true;
  win.className = 'win';
  Object.assign(win.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });

  const inP = inputs.map((n, i) => ({ n, id: `${id}-i${i}` }));
  const outP = outputs.map((n, i) => ({ n, id: `${id}-o${i}` }));
  const meta = { id, type, x, y, w, h, state };
  MDI.nodes.set(id, meta);

  win.innerHTML = `
    <div class="bar"><div class="tabs"></div><button class="close">✕</button></div>
    <div class="ports">
      <div class="pcol">${inP.map(p => `<div class="pitem in"><div class="port in" data-p="${p.id}"></div>${p.n}</div>`).join('')}</div>
      <div class="pcol">${outP.map(p => `<div class="pitem out">${p.n}<div class="port out" data-p="${p.id}"></div></div>`).join('')}</div>
    </div>
    <div class="body"></div>
    <div class="res"></div>`;

  const tBar = win.querySelector('.tabs'), body = win.querySelector('.body');
  tabs.forEach((t, i) => {
    const tab = document.createElement('div');
    tab.className = `tab ${i === 0 ? 'active' : ''}`;
    tab.textContent = t.title;
    const pan = document.createElement('div');
    pan.className = `panel ${i === 0 ? 'active' : ''}`;
    pan.innerHTML = t.content;
    tab.addEventListener('pointerdown', e => {
      e.stopPropagation();
      win.querySelectorAll('.tab,.panel').forEach(el => el.classList.remove('active'));
      tab.classList.add('active'); pan.classList.add('active'); focusWin(win);
    });
    tBar.appendChild(tab); body.appendChild(pan);
  });

  win.querySelectorAll('.port.out').forEach(oEl => oEl.addEventListener('pointerdown', e => {
    e.stopPropagation(); e.preventDefault();
    const fromId = oEl.dataset.p;
    const draft = makePath(true);
    svg.appendChild(draft);
    const move = ev => { const s = center(oEl); draft.setAttribute('d', bezier(s.x, s.y, ev.clientX, ev.clientY)); };
    const up = ev => {
      draft.remove();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const hit = document.elementsFromPoint(ev.clientX, ev.clientY).find(el => el.matches?.('.port.in'));
      if (hit) connect(fromId, hit.dataset.p);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }));

  win.addEventListener('pointerdown', () => focusWin(win));
  win.querySelector('.close').addEventListener('click', e => {
    e.stopPropagation();
    const all = [...inP, ...outP].map(p => p.id);
    for (let i = MDI.conns.length - 1; i >= 0; i--) {
      if (all.includes(MDI.conns[i].from) || all.includes(MDI.conns[i].to)) { MDI.conns[i].el.remove(); MDI.conns.splice(i, 1); }
    }
    MDI.nodes.delete(id);
    MDI.stack = MDI.stack.filter(x => x !== win);
    win.remove();
  });

  const bar = win.querySelector('.bar');
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    bar.setPointerCapture(e.pointerId);
    const sx = e.clientX - win.offsetLeft, sy = e.clientY - win.offsetTop;
    const move = ev => {
      meta.x = Math.max(0, ev.clientX - sx);
      meta.y = Math.max(40, ev.clientY - sy);
      win.style.left = meta.x + 'px'; win.style.top = meta.y + 'px'; updateWires();
    };
    const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); };
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up);
  });

  const res = win.querySelector('.res');
  res.addEventListener('pointerdown', e => {
    e.stopPropagation(); res.setPointerCapture(e.pointerId);
    const sx = e.clientX, sy = e.clientY, ow = win.offsetWidth, oh = win.offsetHeight;
    const move = ev => {
      meta.w = Math.max(230, ow + (ev.clientX - sx));
      meta.h = Math.max(150, oh + (ev.clientY - sy));
      win.style.width = meta.w + 'px'; win.style.height = meta.h + 'px'; updateWires();
    };
    const up = () => { res.removeEventListener('pointermove', move); res.removeEventListener('pointerup', up); };
    res.addEventListener('pointermove', move); res.addEventListener('pointerup', up);
  });

  workspace.appendChild(win);
  focusWin(win);
  const api = { id, win, inIds: inP.map(p => p.id), outIds: outP.map(p => p.id) };
  if (init) init(api, meta);
  return api;
}

syncSvgSize();
