import { API } from './api.js';
import { Calendar } from './calendar.js';

const state = { 
  events: [], 
  models: [], 
  editingId: null, 
  month: new Date().toISOString().slice(0,7) // YYYY-MM
};

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
function fmtDate(s){ 
  if (!s) return '';
  return new Date(s+'T00:00:00').toLocaleDateString('th-TH',
    {timeZone:tz,year:'numeric',month:'short',day:'numeric'}); 
}

// ---------- INIT ----------
async function init() {
  todayText.textContent = new Date().toLocaleString('th-TH',{
    timeZone:tz,weekday:'long',year:'numeric',month:'long',day:'numeric'
  });

  try {
    await reloadAll();
  } catch (err) {
    console.error("โหลดข้อมูลจาก API ไม่สำเร็จ:", err);
  }

  bindEvents();
  renderCalendar();
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
  function fixDate(d) {
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().split("T")[0];
    return String(d).split("T")[0];
  }
  return { ...e, 
    startDate: fixDate(e.startDate),
    endDate: fixDate(e.endDate),
    installDate: fixDate(e.installDate),
    paidDeposit: e.paidDeposit===true || e.paidDeposit==='true' || e.paidDeposit==='on',
    paidFull: e.paidFull===true || e.paidFull==='true' || e.paidFull==='on' 
  };
}

// (rest of app.js code is same as previous fixed version, with calendarCell showing model+event)
