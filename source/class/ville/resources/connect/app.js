const FACTORIES = {
  src: (cfg) => makeWin({
    ...cfg, type: 'src', outputs: ['Text', 'UPPER'],
    tabs: [{ title: 'Source', content: `<label>Text:<input class="nin" value="${cfg.state?.text ?? 'Hello'}"/></label>` }],
    init({ win, outIds }, meta) {
      const inp = win.querySelector('input');
      const fn = () => {
        meta.state.text = inp.value;
        emit(outIds.at(0), inp.value);
        emit(outIds.at(1), inp.value.toUpperCase());
      };
      inp.addEventListener('input', fn);
      fn();
    }
  }),
  mrg: (cfg) => makeWin({
    ...cfg, type: 'mrg', inputs: ['Part A', 'Part B'], outputs: ['Merged'],
    tabs: [{ title: 'Merge', content: `<div>Preview:</div><div class="outbox"></div>` }],
    init({ win, inIds, outIds }) {
      const st = ['', ''];
      const box = win.querySelector('.outbox');
      const fn = () => {
        const r = st.filter(Boolean).join(' + ');
        box.textContent = r || '(waiting)';
        emit(outIds.at(0), r);
      };
      MDI.subs[inIds.at(0)] = v => { st.splice(0, 1, v); fn(); };
      MDI.subs[inIds.at(1)] = v => { st.splice(1, 1, v); fn(); };
      fn();
    }
  }),
  dsp: (cfg) => makeWin({
    ...cfg, type: 'dsp', inputs: ['Value'],
    tabs: [
      { title: 'Display', content: `<div>Received:</div><div class="outbox">(none)</div>` },
      { title: 'Info', content: 'Sink node.' }
    ],
    init({ win, inIds }) {
      const box = win.querySelector('.outbox');
      MDI.subs[inIds.at(0)] = v => { box.textContent = v || '(empty)'; };
    }
  })
};

document.getElementById('b-exp').onclick = () => {
  const payload = { nodes: [...MDI.nodes.values()], connections: MDI.conns.map(c => ({ from: c.from, to: c.to })) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'mdi-workflow.json' });
  a.click();
};

const fileIn = document.getElementById('file-in');
document.getElementById('b-imp').onclick = () => fileIn.click();
fileIn.onchange = async e => {
  const file = e.target.files.item(0);
  if (!file) return;
  const data = JSON.parse(await file.text());
  workspace.innerHTML = '';
  svg.innerHTML = '';
  MDI.nodes.clear(); MDI.conns.length = 0; MDI.stack = []; MDI.count = 0;
  (data.nodes || []).forEach(n => FACTORIES[n.type]?.(n));
  (data.connections || []).forEach(c => connect(c.from, c.to));
  fileIn.value = '';
};

const s1 = FACTORIES.src({ x: 40, y: 70, state: { text: 'MDI' } });
const s2 = FACTORIES.src({ x: 40, y: 270, state: { text: 'Workflow' } });
const m1 = FACTORIES.mrg({ x: 340, y: 165 });
const d1 = FACTORIES.dsp({ x: 650, y: 165 });

connect(s1.outIds.at(0), m1.inIds.at(0));
connect(s2.outIds.at(1), m1.inIds.at(1));
connect(m1.outIds.at(0), d1.inIds.at(0));

document.getElementById('b-src').onclick = () => FACTORIES.src({ x: 80 + (MDI.count % 5) * 25, y: 80 + (MDI.count % 5) * 25, state: { text: 'Node' } });
document.getElementById('b-mrg').onclick = () => FACTORIES.mrg({ x: 140 + (MDI.count % 5) * 25, y: 110 + (MDI.count % 5) * 25 });
document.getElementById('b-dsp').onclick = () => FACTORIES.dsp({ x: 200 + (MDI.count % 5) * 25, y: 140 + (MDI.count % 5) * 25 });
