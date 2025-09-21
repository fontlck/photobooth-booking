import { API } from './api.js';
import { Calendar } from './calendar.js';

const state = { events: [], models: [], editingId: null, month: new Date().toISOString().slice(0,7) };

// DOM Elements
const todayText = document.getElementById('todayText');
const addEventBtn = document.getElementById('addEventBtn');
const addModelBtn = document.getElementById('addModelBtn');
const eventDialog = document.getElementById('eventDialog');
const modelDialog = document.getElementById('modelDialog');
const eventForm = document.getElementById('eventForm');
const modelForm = document.getElementById('modelForm');
const modelSelect = document.getElementById('modelSelect');
const deleteEventBtn = document.getElementById('deleteEventBtn');
const saveEventBtn = document.getElementById('saveEventBtn');
const saveModelBtn = document.getElementById('saveModelBtn');
const closeEventDialog = document.getElementById('closeEventDialog');
const closeModelDialog = document.getElementById('closeModelDialog');
const tbody = document.getElementById('eventsTableBody');
const upcomingList = document.getElementById('upcomingList');
const searchInput = document.getElementById('searchInput');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const calendarGrid = document.getElementById('calendarGrid');
const legend = document.getElementById('legend');

const tz = 'Asia/Bangkok';
function fmtDate(s){ return s? new Date(s+'T00:00:00').toLocaleDateString('th-TH',{timeZone:tz,year:'numeric',month:'short',day:'numeric'}):''; }

// ---------- INIT ----------
async function init() {
  todayText.textContent = new Date().toLocaleString('th-TH',{timeZone:tz,weekday:'long',year:'numeric',month:'long',day:'numeric'});
  await reloadAll();
  bindEvents();
}

async function reloadAll() {
  const [md, ev] = await Promise.all([API.list('models'), API.list('events')]);
  state.models = md?.data || [];
  state.events = (ev?.data || []).map(normalizeEvent);
  renderModelsToSelect();
  render();
  renderCalendar();
}

function normalizeEvent(e){
  return { ...e, 
    paidDeposit: e.paidDeposit===true || e.paidDeposit==='true' || e.paidDeposit==='on',
    paidFull: e.paidFull===true || e.paidFull==='true' || e.paidFull==='on' 
  };
}

// ---------- EVENTS ----------
function bindEvents() {
  addEventBtn.onclick = () => openEventDialog();
  addModelBtn.onclick = () => openModelDialog();
  closeEventDialog.onclick = () => eventDialog.close();
  closeModelDialog.onclick = () => modelDialog.close();
  saveEventBtn.onclick = onSaveEvent;
  saveModelBtn.onclick = onSaveModel;
  deleteEventBtn.onclick = onDeleteEvent;
  searchInput.oninput = render;

  prevMonthBtn.onclick = () => { state.month = Calendar.shiftMonth(state.month, -1); renderCalendar(); };
  nextMonthBtn.onclick = () => { state.month = Calendar.shiftMonth(state.month, 1); renderCalendar(); };
}

// ---------- RENDER ----------
function render() {
  const q = searchInput.value?.toLowerCase() || '';
  const filtered = state.events.filter(e => !q || [e.eventName,e.location,e.staff,e.model].some(s => (s||'').toLowerCase().includes(q)));
  tbody.innerHTML = filtered.map(e => `
    <tr class="hover:bg-neutral-800 cursor-pointer" data-id="${e.id}">
      <td>${fmtDate(e.startDate)}${e.endDate? ' – '+fmtDate(e.endDate): ''}</td>
      <td>${e.eventName||''}</td>
      <td>${e.location||''}</td>
      <td>${e.model||''}</td>
      <td>${[e.openTime,e.closeTime].filter(Boolean).join(' - ')}</td>
      <td>${e.price||''}</td>
      <td>${e.paidDeposit?'มัดจำ':''} ${e.paidFull?'ชำระครบ':''}</td>
      <td><button data-id="${e.id}" data-action="edit" class="px-2 py-1 text-xs bg-neutral-700 rounded">แก้ไข</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('button[data-action="edit"]').forEach(btn => btn.onclick = () => openEventDialog(btn.dataset.id));

  const today = new Date().toISOString().slice(0,10);
  const upcoming = [...state.events].filter(e => (e.startDate||'') >= today).sort((a,b)=>a.startDate.localeCompare(b.startDate)).slice(0,5);
  upcomingList.innerHTML = upcoming.map(e => {
    const m = state.models.find(x=>x.name===e.model);
    const bg = m?.colorBG || '#222'; const fg = m?.colorText || '#fff';
    return `<div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
      <div class="flex items-center justify-between">
        <div class="text-sm text-neutral-400">${fmtDate(e.startDate)}${e.endDate? ' - '+fmtDate(e.endDate): ''}</div>
        <span class="text-xs px-2 py-1 rounded-full" style="background:${bg};color:${fg}">${e.model||'-'}</span>
      </div>
      <div class="mt-1 font-semibold">${e.eventName||'-'}</div>
      <div class="text-sm text-neutral-300">${e.location||''}</div>
    </div>`;
  }).join('');
}

function renderModelsToSelect() {
  modelSelect.innerHTML = ['<option value=""></option>'].concat(state.models.map(m => `<option value="${m.name}">${m.name}</option>`)).join('');
  legend.innerHTML = state.models.map(m => `<span class="text-xs px-2 py-1 rounded-full" style="background:${m.colorBG};color:${m.colorText}">${m.name}</span>`).join(' ');
}

// ---------- DIALOG ----------
function openEventDialog(id=null) {
  state.editingId = id;
  eventForm.reset();
  deleteEventBtn.classList.toggle('hidden', !id);
  renderModelsToSelect();
  if (id) {
    const e = state.events.find(x=>x.id===id);
    if (e) Object.entries(e).forEach(([k,v]) => {
      if (!eventForm[k]) return;
      if (eventForm[k].type === 'checkbox') eventForm[k].checked = !!v;
      else eventForm[k].value = v ?? '';
    });
  }
  if (typeof eventDialog.showModal === "function") {
    eventDialog.showModal();
  } else {
    eventDialog.setAttribute("open","true"); // fallback
  }
}

function openModelDialog() {
  modelForm.reset();
  if (typeof modelDialog.showModal === "function") {
    modelDialog.showModal();
  } else {
    modelDialog.setAttribute("open","true"); // fallback
  }
}

// ---------- CRUD ----------
async function onSaveEvent(ev) {
  ev.preventDefault();
  const fd = new FormData(eventForm);
  const data = Object.fromEntries(fd.entries());
  data.id = state.editingId || crypto.randomUUID();
  data.paidDeposit = fd.get('paidDeposit')==='on';
  data.paidFull = fd.get('paidFull')==='on';
  await API.upsert('events', data);
  await reloadAll();
  eventDialog.close();
}

async function onDeleteEvent(ev) {
  ev.preventDefault();
  if (!state.editingId) return;
  await API.remove('events', state.editingId);
  await reloadAll();
  eventDialog.close();
}

async function onSaveModel(ev) {
  ev.preventDefault();
  const fd = new FormData(modelForm);
  const data = Object.fromEntries(fd.entries());
  data.id = crypto.randomUUID();
  await API.upsert('models', data);
  await reloadAll();
  modelDialog.close();
}

// ---------- CALENDAR ----------
function renderCalendar(){
  const m = state.month;
  const { weeks, label } = Calendar.build(m);
  monthLabel.textContent = label;
  const map = Calendar.eventsByDate(state.events);
  calendarGrid.innerHTML = weeks.map(week => `
    <div class="contents">
      ${week.map(day => day? calendarCell(day, map[day] || []): calendarCell('', [] , true)).join('')}
    </div>
  `).join('
