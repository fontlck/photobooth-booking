export const Calendar = {
  build(ym) {
    const [y,m] = ym.split('-').map(Number);
    const first = new Date(y, m-1, 1);
    const last = new Date(y, m, 0);
    const startDow = (first.getDay()+6)%7; // Monday=0
    const days = last.getDate();
    const cells = Array(startDow).fill(null).concat(
      Array.from({length: days}, (_,i)=> `${ym}-${String(i+1).padStart(2,'0')}`)
    );
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

    const label = first.toLocaleString('th-TH', { month:'long', year:'numeric' });
    return { weeks, label };
  },

  shiftMonth(ym, delta) {
    const [y,m] = ym.split('-').map(Number);
    const d = new Date(y, m-1+delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  },

  eventsByDate(events){
    const map = {};
    for (const ev of events) {
      const start = ev.startDate;
      const end = ev.endDate || ev.startDate;
      if (!start) continue;
      let d = new Date(start);
      const dEnd = new Date(end);
      while (d <= dEnd) {
        const s = d.toISOString().slice(0,10);
        (map[s] ||= []).push(ev);
        d.setDate(d.getDate()+1);
      }
    }
    return map;
  }
};
