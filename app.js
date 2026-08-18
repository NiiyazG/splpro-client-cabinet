const STORAGE_KEY = 'splpro-prototype-v32';
const stageOrder = ['preproject', 'project', 'zero', 'frame', 'hot', 'done'];
const stages = {
  preproject: { name: 'Предпроект', trigger: 'Определён проектировщик', owner: 'КАМ / РПП', client: 'Заказчик определяет участников, ЛПР и требования к инженерным системам.', spl: 'Формирует рабочую группу, инициирует тестовый подбор во внешнем конфигураторе и составляет план отслеживания объекта.' },
  project: { name: 'Проект', trigger: 'Площадка / фундамент / сваи', owner: 'КАМ / ОР', client: 'Проектировщик формирует решения и проектную документацию.', spl: 'Защищает решения SPL, инициирует замену конкурента, получает РД и график СМР.' },
  zero: { name: 'Ноль', trigger: 'На объекте строительный кран', owner: 'ОР / КАМ', client: 'Заказчик и подрядчик уточняют сроки выбора оборудования и закупки.', spl: 'Проверяет РД, сроки тендера, участников и возможность замены на SPL.' },
  frame: { name: 'Каркас', trigger: 'Тендер начнётся в течение месяца', owner: 'ОР / КАМ', client: 'Подрядчик готовит тендерный пакет и перечень оборудования.', spl: 'Готовит ТКП, технические решения, ценовые условия и поддержку тендера.' },
  hot: { name: 'Горящий', trigger: 'Идёт закупка и комплектация', owner: 'ОР', client: 'Согласовывает спецификацию, заказ, поставки и готовность площадки.', spl: 'Финализирует ТКП, размещает заказ, контролирует производство и отгрузки.' },
  done: { name: 'Закончен', trigger: 'Объект скомплектован', owner: 'КАМ / РПП / ОР', client: 'Подтверждает приёмку, запускает оборудование и даёт обратную связь.', spl: 'Сервис, референс, анализ конверсии, благодарственное письмо и новые объекты.' }
};
const defaults = {
  role: 'developer',
  selectedOrderId: 'SPL-260812-01',
  projects: [
    { id: 'OBJ-0248', name: 'ЖК «Северный порт»', address: 'г. Москва, Ленинградское ш., вл. 69', stage: 'hot', owner: 'Нияз Гарипов', potential: 48.6, ordered: 31.2 },
    { id: 'OBJ-0211', name: 'БЦ «Контур»', address: 'г. Москва, ул. Складочная, д. 3', stage: 'frame', owner: 'Анна Орлова', potential: 22.4, ordered: 19.8 },
    { id: 'OBJ-0257', name: 'Технопарк «Сфера»', address: 'г. Долгопрудный, пр-т Пацаева, д. 7', stage: 'zero', owner: 'Нияз Гарипов', potential: 36.9, ordered: 12.7 },
    { id: 'OBJ-0194', name: 'ЖК «Речной»', address: 'г. Казань, ул. Портовая, д. 14', stage: 'project', owner: 'Анна Орлова', potential: 18.2, ordered: 2.1 }
  ],
  calculations: [
    { number: 'ST-26481', projectId: 'OBJ-0248', product: 'Насосная станция SPL', url: 'https://splpro.ru/selections/station', source: 'splpro.ru', status: 'Готов' },
    { number: 'AQ-26452', projectId: 'OBJ-0211', product: 'Насосы AQUASTRONG', url: 'https://aquastrong-select.ru/selection/series', source: 'aquastrong-select.ru', status: 'Согласован' },
    { number: 'ST-26398', projectId: 'OBJ-0257', product: 'Насосная станция SPL', url: 'https://splpro.ru/selections/station', source: 'splpro.ru', status: 'На проверке' }
  ],
  selectionRequests: [
    { id: 'SEL-260818-03', projectId: 'OBJ-0248', product: 'Блочный тепловой пункт', input: 'Опросные листы ТМ/АТМ, принципиальная схема и план ИТП', expectation: 'Стандартное решение, приоритет — срок', owner: 'Инженер БТП · Алексей Орлов', createdAt: '18.08.2026', dueAt: '21.08.2026', slaDays: 3, version: 2, status: 'В работе', updates: [{ id: 'UPD-1', text: 'Добавлен актуальный план ИТП', date: '18.08.2026' }] },
    { id: 'SEL-260818-02', projectId: 'OBJ-0211', product: 'Конвекторы SPL', input: 'Спецификация, проект с расстановкой и таблица замены', expectation: 'Замена по спецификации за 1 рабочий день', owner: 'Инженер ОВ · Мария Волкова', createdAt: '18.08.2026', dueAt: '19.08.2026', slaDays: 1, version: 1, status: 'Передана инженеру', updates: [] }
  ],
  orders: [
    { id: 'SPL-260812-01', projectId: 'OBJ-0248', product: 'БТП и автоматика', amount: 12840000, ready: '18.09.2026', paid: 60, paymentStatus: 'Частично оплачено', supplyStatus: 'Ожидает согласования', reserveUntil: '—', debt: 5136000, status: 'Ожидает заказчика', tag: 'warning', source: '1С', actions: [{ id: 'a-1', title: 'Подписать спецификацию v3', due: 'до 20.08.2026', done: false }, { id: 'a-2', title: 'Передать схему диспетчеризации', due: 'до 21.08.2026', done: false }, { id: 'a-3', title: 'Подтвердить цвет корпуса', due: 'выполнено 17.08.2026', done: true }] },
    { id: 'SPL-260814-03', projectId: 'OBJ-0257', product: 'Насосная станция WRP–B', amount: 7420000, ready: '26.08.2026', paid: 100, paymentStatus: 'Оплачено', supplyStatus: 'Размещён у поставщика', reserveUntil: '—', debt: 0, status: 'В производстве', tag: 'neutral', source: '1С', actions: [{ id: 'a-4', title: 'Согласовать новое окно доставки', due: 'до 22.08.2026', done: false }, { id: 'a-5', title: 'Передать контакт принимающего', due: 'выполнено 16.08.2026', done: true }] },
    { id: 'SPL-260729-08', projectId: 'OBJ-0211', product: 'Конвекторы IFC', amount: 4980000, ready: '20.08.2026', paid: 100, paymentStatus: 'Оплачено', supplyStatus: 'Готов к отгрузке', reserveUntil: '20.08.2026', debt: 0, status: 'Готов к отгрузке', tag: 'success', source: '1С', actions: [{ id: 'a-6', title: 'Оформить пропуск на автомобиль', due: 'сегодня, 18:00', done: false }, { id: 'a-7', title: 'Подтвердить адрес разгрузки', due: 'выполнено 17.08.2026', done: true }] }
  ],
  shipments: [
    { id: 'SHP-201', orderId: 'SPL-260729-08', date: '20.08.2026', contact: 'Павел Соколов, +7 999 555-11-22', address: 'г. Москва, ул. Складочная, д. 3', status: 'Подтверждено', tag: 'success' },
    { id: 'SHP-202', orderId: 'SPL-260812-01', date: '22.08.2026', contact: 'Не назначен', address: 'г. Москва, Ленинградское ш., вл. 69', status: 'Нужен пропуск', tag: 'warning' }
  ],
  documents: [
    { id: 'DOC-1', name: 'Спецификация БТП.pdf', category: 'Проектные', relation: 'SPL-260812-01', date: '18.08.2026', version: 'v3' },
    { id: 'DOC-2', name: 'Счёт № 4841.pdf', category: 'Счета и УПД', relation: 'SPL-260814-03', date: '17.08.2026', version: 'Оригинал' },
    { id: 'DOC-3', name: 'Паспорт IFC-HCV.zip', category: 'Паспорта', relation: 'БЦ «Контур»', date: '15.08.2026', version: 'Комплект' }
  ],
  service: [
    { id: 'SR-260418', subject: 'Уточнение схемы автоматики', projectId: 'OBJ-0248', date: '18.08.2026', status: 'Открыто', tag: 'warning' },
    { id: 'SR-260401', subject: 'Пусконаладка насосной станции', projectId: 'OBJ-0257', date: '17.08.2026', status: 'В работе', tag: 'neutral' }
  ]
};

const clone = value => JSON.parse(JSON.stringify(value));
const safeText = (value, fallback = '', maxLength = 500) => typeof value === 'string' ? value.slice(0, maxLength) : fallback;
const safeId = value => typeof value === 'string' && /^[A-Za-z0-9А-Яа-яЁё._–—-]{1,80}$/.test(value) ? value : '';
const safeNumber = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
const safeTag = value => ['success', 'warning', 'neutral'].includes(value) ? value : 'neutral';
const safeDateTime = value => typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : '';
const calculationSources = {
  'Насосная станция SPL': { hosts: ['splpro.ru', 'www.splpro.ru'], path: '/selections/station' },
  'Насосы AQUASTRONG': { hosts: ['aquastrong-select.ru', 'www.aquastrong-select.ru'], path: '/selection/series' }
};
const selectionSlaDays = { 'Блочный тепловой пункт': 3, 'Коллекторный узел DCU': 3 };
const selectionStatusFlow = ['Черновик', 'Передана инженеру', 'В работе', 'Результат готов'];
function validatedCalculationUrl(item) {
  const rule = calculationSources[item?.product];
  if (!rule) return null;
  try {
    const url = new URL(item.url);
    const validPath = url.pathname === rule.path || url.pathname === `${rule.path}/`;
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && rule.hosts.includes(url.hostname) && validPath ? url : null;
  } catch { return null; }
}
const normalizeCollection = (value, normalizer, fallback) => (Array.isArray(value) ? value : fallback).map(normalizer).filter(Boolean);
function normalizeState(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const merged = { ...clone(defaults), ...source };
  const projects = normalizeCollection(merged.projects, project => {
    const id = safeId(project?.id); if (!id) return null;
    return { id, name: safeText(project.name, 'Без названия', 160), address: safeText(project.address, 'Адрес не указан', 240), stage: stageOrder.includes(project.stage) ? project.stage : 'preproject', owner: safeText(project.owner, 'Не назначен', 120), potential: safeNumber(project.potential, 0.1, 0.1), ordered: safeNumber(project.ordered, 0, 0) };
  }, defaults.projects);
  const calculations = normalizeCollection(merged.calculations, item => {
    const number = safeId(item?.number); const projectId = safeId(item?.projectId); const product = safeText(item?.product, '', 120);
    const url = validatedCalculationUrl({ product, url: item?.url }); if (!number || !url) return null;
    const status = ['Готов', 'На проверке', 'Согласован', 'Импортирован'].includes(item.status) ? item.status : 'Импортирован';
    return { number, projectId, product, url: url.href, source: url.hostname.replace(/^www\./, ''), status, version: safeText(item.version, 'v1', 40), importedAt: safeDateTime(item.importedAt), decisionAt: safeDateTime(item.decisionAt) };
  }, defaults.calculations);
  const selectionRequests = normalizeCollection(merged.selectionRequests, item => {
    const id = safeId(item?.id); if (!id) return null;
    const updates = normalizeCollection(item.updates, update => { const updateId = safeId(update?.id); return updateId ? { id: updateId, text: safeText(update.text, '', 1000), date: safeText(update.date, '', 40) } : null; }, []);
    const status = ['Черновик', 'Передана инженеру', 'Нужны данные', 'В работе', 'Результат готов', 'Результат импортирован'].includes(item.status) ? item.status : 'Черновик';
    return { id, projectId: safeId(item.projectId), product: safeText(item.product, 'Оборудование', 120), input: safeText(item.input, '', 1500), expectation: safeText(item.expectation, '', 1000), owner: safeText(item.owner, 'Профильный инженер SPL', 160), createdAt: safeText(item.createdAt, '', 40), dueAt: safeText(item.dueAt, '', 40), slaDays: safeNumber(item.slaDays, 1, 1, 30), version: safeNumber(item.version, 1, 1, 999), status, updates };
  }, defaults.selectionRequests);
  const orders = normalizeCollection(merged.orders, order => {
    const id = safeId(order?.id); if (!id) return null;
    const actions = normalizeCollection(order.actions, action => { const actionId = safeId(action?.id); return actionId ? { id: actionId, title: safeText(action.title, 'Действие', 200), due: safeText(action.due, '', 100), done: action.done === true } : null; }, []);
    return { id, projectId: safeId(order.projectId), product: safeText(order.product, 'Оборудование', 160), amount: safeNumber(order.amount), ready: safeText(order.ready, '', 40), paid: safeNumber(order.paid, 0, 0, 100), paymentStatus: safeText(order.paymentStatus, 'Не оплачено', 100), supplyStatus: safeText(order.supplyStatus, 'Не размещён', 120), reserveUntil: safeText(order.reserveUntil, '—', 40), debt: safeNumber(order.debt), status: safeText(order.status, 'Черновик', 80), tag: safeTag(order.tag), source: safeText(order.source, '', 100), deliveryAddress: safeText(order.deliveryAddress, '', 240), comment: safeText(order.comment, '', 1000), actions };
  }, defaults.orders);
  const shipments = normalizeCollection(merged.shipments, item => { const id = safeId(item?.id); return id ? { id, orderId: safeId(item.orderId), date: safeText(item.date, '', 40), contact: safeText(item.contact, 'Не назначен', 200), address: safeText(item.address, '', 240), status: safeText(item.status, '', 80), tag: safeTag(item.tag) } : null; }, defaults.shipments);
  const documents = normalizeCollection(merged.documents, item => { const id = safeId(item?.id); return id ? { id, name: safeText(item.name, 'Документ', 200), category: safeText(item.category, 'Прочее', 80), relation: safeText(item.relation, '', 160), date: safeText(item.date, '', 40), version: safeText(item.version, 'v1', 40) } : null; }, defaults.documents);
  const service = normalizeCollection(merged.service, item => { const id = safeId(item?.id); return id ? { id, subject: safeText(item.subject, 'Обращение', 200), projectId: safeId(item.projectId), date: safeText(item.date, '', 40), status: safeText(item.status, 'Открыто', 80), tag: safeTag(item.tag), category: safeText(item.category, '', 80), message: safeText(item.message, '', 2000) } : null; }, defaults.service);
  const selectedOrderId = safeId(merged.selectedOrderId);
  return { role: ['developer', 'contractor', 'designer'].includes(merged.role) ? merged.role : defaults.role, selectedOrderId: orders.some(order => order.id === selectedOrderId) ? selectedOrderId : orders[0]?.id || '', projects, calculations, selectionRequests, orders, shipments, documents, service };
}
const loadState = () => {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { return normalizeState(defaults); }
};
let state = loadState();
let selectedJourneyStage = 'preproject';
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const byId = id => document.getElementById(id);
const projectById = id => state.projects.find(project => project.id === id);
const projectName = id => projectById(id)?.name || 'Без объекта';
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const shortMoney = value => value >= 1000000 ? `${(value / 1000000).toFixed(1).replace('.', ',')} млн ₽` : money(value);
const today = () => new Intl.DateTimeFormat('ru-RU').format(new Date());
const addWorkingDays = (date, days) => { const result = new Date(date); let remaining = days; while (remaining > 0) { result.setDate(result.getDate() + 1); if (![0, 6].includes(result.getDay())) remaining -= 1; } return result.toLocaleDateString('ru-RU'); };
let uidCounter = 0;
const uid = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}-${++uidCounter}`;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const roleData = {
  developer: { eyebrow: 'КАМ — заказчик', title: 'Контроль портфеля и обязательств', text: 'Стадии объектов, бюджет, действия заказчика и риски исполнения.', action: 'Создать объект', attention: '5 действий по 3 объектам', actions: ['Подписать спецификацию', 'Согласовать график', 'Передать реквизиты'] },
  contractor: { eyebrow: 'ОР — монтажник / подрядчик', title: 'Поставки, площадка и документы', text: 'Контроль готовности партий, окон разгрузки, пропусков и приёмки на объекте.', action: 'Запросить поставку', attention: '4 действия по 2 поставкам', actions: ['Оформить пропуск', 'Подтвердить окно', 'Назначить принимающего'] },
  designer: { eyebrow: 'РПП — проектировщик', title: 'Проектные решения и результаты подборов', text: 'Подбор выполняется во внешних конфигураторах SPLPRO; кабинет хранит результат и согласование.', action: 'Открыть конфигураторы', attention: '6 замечаний по 4 решениям', actions: ['Импортировать результат', 'Проверить спецификацию', 'Ответить инженеру SPL'] }
};
const titles = { dashboard: ['Обзор', 'Обзор портфеля'], projects: ['Объекты', 'Портфель объектов'], calculations: ['Заявки и результаты подборов', 'Заявки и результаты подборов'], orders: ['Заказы', 'Заказы и обязательства'], production: ['Производство', 'Производственный процесс'], shipments: ['Поставки', 'Поставки и отгрузки'], documents: ['Документы', 'Документы'], service: ['Сервис', 'Сервис и обращения'], journey: ['Стадии объекта', 'Дорожная карта 3.2-2'], analytics: ['Аналитика', 'Показатели портфеля'] };

function toast(message) { const element = byId('toast'); element.textContent = message; element.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => element.classList.remove('show'), 2300); }
function openDialog(id) { populateFormOptions(); byId(id).showModal(); }
function closeDialog(dialog) { dialog.close(); }
function goTo(page) {
  if (!titles[page]) return;
  document.querySelectorAll('.page').forEach(element => element.classList.toggle('active', element.id === `page-${page}`));
  document.querySelectorAll('.nav-item').forEach(element => element.classList.toggle('active', element.dataset.page === page));
  byId('breadcrumb').textContent = titles[page][0]; byId('pageTitle').textContent = titles[page][1];
  document.querySelector('.sidebar').classList.remove('open'); location.hash = page; window.scrollTo({ top: 0, behavior: 'smooth' });
  renderAll();
}
function spark(values) { const max = Math.max(...values, 1); return `<span class="spark">${values.map(value => `<i style="height:${Math.max(18, value / max * 100)}%"></i>`).join('')}</span>`; }

function renderRole() {
  const data = roleData[state.role];
  byId('roleSelect').value = state.role; byId('roleEyebrow').textContent = data.eyebrow; byId('welcomeTitle').textContent = data.title; byId('welcomeText').textContent = data.text; byId('primaryAction').textContent = data.action; byId('attentionSummary').textContent = data.attention;
  byId('attentionActions').innerHTML = data.actions.map(action => `<button data-attention-action="${escapeHtml(action)}">${escapeHtml(action)}</button>`).join('');
  const activeProjects = state.projects.filter(project => project.stage !== 'done').length;
  const orderTotal = state.orders.reduce((sum, order) => sum + order.amount, 0);
  const pending = state.orders.flatMap(order => order.actions).filter(action => !action.done).length;
  const shipmentContactPercent = state.shipments.length ? Math.round(state.shipments.filter(item => item.contact !== 'Не назначен').length / state.shipments.length * 100) : 0;
  const kpis = state.role === 'contractor' ? [['Поставки', String(state.shipments.length), 'в графике'], ['Готово к отгрузке', String(state.orders.filter(order => order.status.includes('отгрузке')).length), 'заказов'], ['Контакты назначены', `${shipmentContactPercent}%`, 'по поставкам'], ['Открытые действия', String(pending), 'нужно выполнить']] : state.role === 'designer' ? [['Результаты подборов', String(state.calculations.length), 'из внешних систем'], ['Согласовано', String(state.calculations.filter(item => item.status === 'Согласован').length), 'версий'], ['Активные проекты', String(state.projects.filter(project => ['preproject', 'project'].includes(project.stage)).length), 'на ранних стадиях'], ['Замечания', String(pending), 'по заказам']] : [['Активные объекты', String(activeProjects), 'в портфеле'], ['Объём заказов', shortMoney(orderTotal), 'проекция 1С'], ['На горячей стадии', String(state.projects.filter(project => project.stage === 'hot').length), 'объектов'], ['Открытые действия', String(pending), 'нужно выполнить']];
  byId('kpiGrid').innerHTML = kpis.map((kpi, index) => `<article class="kpi"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><small>${kpi[2]}</small>${spark([4 + index, 7, 6 + index, 10, 8, 12, 11 + index])}</article>`).join('');
}
function renderDashboard() {
  byId('dashboardStages').innerHTML = stageOrder.map(stage => `<button data-dashboard-stage="${stage}"><span>${stages[stage].name}</span><strong>${state.projects.filter(project => project.stage === stage).length}</strong></button>`).join('');
  const actions = state.orders.flatMap(order => order.actions.map(action => ({ ...action, orderId: order.id }))).slice(0, 3);
  byId('dashboardChecklist').innerHTML = actions.map(action => `<label><input type="checkbox" data-dashboard-action-id="${action.id}" ${action.done ? 'checked' : ''}> ${escapeHtml(action.title)} <span>${escapeHtml(action.due)}</span></label>`).join('');
  const allActions = state.orders.flatMap(order => order.actions); const done = allActions.filter(action => action.done).length; const percent = allActions.length ? Math.round(done / allActions.length * 100) : 0;
  byId('readinessDonut').style.setProperty('--value', percent); byId('readinessPercent').innerHTML = `${percent}<small>%</small>`; byId('readinessCount').textContent = `${done} из ${allActions.length} выполнено`;
  byId('dashboardEvents').innerHTML = state.shipments.slice(0, 3).map(item => { const [day, month] = item.date.split('.'); return `<div class="date-box"><strong>${escapeHtml(day)}</strong><span>${escapeHtml(month)}</span></div><div class="event-main"><strong>${escapeHtml(projectName(state.orders.find(order => order.id === item.orderId)?.projectId))}</strong><span>${escapeHtml(item.orderId)} · ${escapeHtml(item.address)}</span></div><span class="tag ${item.tag}">${escapeHtml(item.status)}</span>`; }).join('');
}
function renderProjects() {
  const query = byId('projectSearch').value.trim().toLowerCase(); const stage = byId('projectStageFilter').value; const owner = byId('projectOwnerFilter').value;
  const filtered = state.projects.filter(project => (!query || `${project.id} ${project.name} ${project.address}`.toLowerCase().includes(query)) && (stage === 'all' || project.stage === stage) && (owner === 'all' || project.owner === owner));
  byId('projectGrid').innerHTML = filtered.map(project => { const readiness = project.potential > 0 ? Math.min(100, Math.round((project.ordered / project.potential) * 100)) : 0; return `<article class="project-card" data-project-id="${escapeHtml(project.id)}"><div class="project-top"><span class="tag ${project.stage === 'hot' ? 'warning' : project.stage === 'done' ? 'success' : 'neutral'}">${stages[project.stage].name}</span><span>${escapeHtml(project.id)}</span></div><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.address)}</p><div class="project-stats"><div><span>Потенциал</span><strong>${project.potential.toFixed(1).replace('.', ',')} млн ₽</strong></div><div><span>Заказано</span><strong>${project.ordered.toFixed(1).replace('.', ',')} млн ₽</strong></div><div><span>Конверсия</span><strong>${readiness}%</strong></div></div><div class="mini-progress"><i style="width:${readiness}%"></i></div><div class="project-foot"><span>${escapeHtml(project.owner)}</span><button class="text-button" data-project-stage="${project.stage}">Открыть стадию</button></div></article>`; }).join('') || '<div class="empty-state">Объекты по выбранным условиям не найдены.</div>';
}
function renderCalculations() {
  const query = byId('calculationSearch').value.trim().toLowerCase();
  const items = state.calculations.filter(item => `${item.number} ${projectName(item.projectId)} ${item.product}`.toLowerCase().includes(query));
  byId('calculationsBody').innerHTML = items.map(item => { const trustedUrl = validatedCalculationUrl(item); const agreed = item.status === 'Согласован'; const importedAt = item.importedAt ? new Date(item.importedAt).toLocaleDateString('ru-RU') : 'Нет данных'; const decision = agreed ? '' : `<button class="text-button" data-calculation-approve="${escapeHtml(item.number)}">Согласовать</button><button class="text-button" data-calculation-return="${escapeHtml(item.number)}">На доработку</button>`; return `<tr><td><strong>${trustedUrl ? `<a href="${escapeHtml(trustedUrl.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.number)}</a>` : escapeHtml(item.number)}</strong></td><td>${escapeHtml(projectName(item.projectId))}</td><td>${escapeHtml(item.product)}</td><td>${escapeHtml(item.source)}</td><td>${escapeHtml(item.version)}</td><td>${escapeHtml(importedAt)}</td><td><span class="tag ${agreed ? 'success' : item.status === 'Готов' || item.status === 'Импортирован' ? 'neutral' : 'warning'}">${escapeHtml(item.status)}</span></td><td>${decision}<button class="text-button" data-create-order="${escapeHtml(item.number)}" ${agreed ? '' : 'disabled title="Сначала согласуйте результат"'}>Создать заказ</button></td></tr>`; }).join('') || '<tr><td colspan="8">Результаты не найдены.</td></tr>';
}
function renderSelectionRequests() {
  byId('selectionRequestsBody').innerHTML = state.selectionRequests.map(item => { const statusClass = item.status.includes('готов') || item.status.includes('импортирован') ? 'success' : item.status === 'Нужны данные' ? 'warning' : 'neutral'; return `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(projectName(item.projectId))}</td><td>${escapeHtml(item.product)}</td><td>${escapeHtml(item.input)}<br><small>${escapeHtml(item.expectation)}</small></td><td>${escapeHtml(item.owner)}</td><td>${item.slaDays} раб. дн.<br><small>до ${escapeHtml(item.dueAt || 'уточняется')}</small></td><td>v${item.version}<br><small>${item.updates.length} дополнений</small></td><td><span class="tag ${statusClass}">${escapeHtml(item.status)}</span></td><td><button class="text-button" data-selection-update="${escapeHtml(item.id)}">Добавить данные</button><button class="text-button" data-selection-advance="${escapeHtml(item.id)}" ${item.status === 'Результат импортирован' ? 'disabled' : ''}>Следующий статус</button></td></tr>`; }).join('') || '<tr><td colspan="9">Заявок пока нет.</td></tr>';
}
function renderOrders() {
  const filter = byId('orderFilter').value;
  const items = state.orders.filter(order => filter === 'all' || (filter === 'action' && order.actions.some(action => !action.done)) || (filter === 'draft' && order.status === 'Черновик'));
  byId('ordersCount').textContent = `${items.length} записей`; byId('orderList').innerHTML = items.map(order => `<button class="order-item ${order.id === state.selectedOrderId ? 'active' : ''}" data-order-id="${order.id}"><span><strong>${escapeHtml(order.id)}</strong><small>${escapeHtml(projectName(order.projectId))}</small></span><span><strong>${shortMoney(order.amount)}</strong><small>${escapeHtml(order.status)}</small></span></button>`).join('');
  const order = items.find(item => item.id === state.selectedOrderId) || items[0];
  if (!order) {
    byId('orderNumber').textContent = 'Нет заказов'; byId('orderObject').textContent = 'Измените фильтр или создайте черновик из согласованного результата.'; ['orderAmount', 'orderDate', 'orderPaid', 'orderPaymentStatus', 'orderSupplyStatus', 'orderReserveUntil', 'orderDebt'].forEach(id => { byId(id).textContent = '—'; }); byId('orderStatus').textContent = 'Пусто'; byId('orderStatus').className = 'tag neutral'; byId('customerActions').innerHTML = '<div class="empty-state small">Заказы по выбранному фильтру не найдены.</div>'; byId('requestReserveButton').disabled = true; byId('openOrderDocuments').disabled = true; byId('openOrderService').disabled = true; return;
  }
  byId('requestReserveButton').disabled = false; byId('openOrderDocuments').disabled = false; byId('openOrderService').disabled = false;
  state.selectedOrderId = order.id; byId('orderNumber').textContent = order.id; byId('orderObject').textContent = `${projectName(order.projectId)} · ${order.product}`; byId('orderAmount').textContent = money(order.amount); byId('orderDate').textContent = order.ready; byId('orderPaid').textContent = `${order.paid}%`; byId('orderStatus').textContent = order.status; byId('orderStatus').className = `tag ${order.tag}`;
  byId('orderPaymentStatus').textContent = order.paymentStatus; byId('orderSupplyStatus').textContent = order.supplyStatus; byId('orderReserveUntil').textContent = order.reserveUntil; byId('orderDebt').textContent = money(order.debt);
  byId('customerActions').innerHTML = order.actions.map(action => `<label class="customer-action"><input type="checkbox" data-action-id="${action.id}" ${action.done ? 'checked' : ''}><div><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.due)}</span></div><span class="tag ${action.done ? 'success' : 'warning'}">${action.done ? 'Готово' : 'Нужно действие'}</span></label>`).join('') || '<div class="empty-state small">Для черновика действия будут сформированы после проверки.</div>';
}
function renderProduction() {
  const productionOrders = state.orders.filter(order => order.status === 'В производстве' || order.status === 'Готов к отгрузке');
  const selectedOrderId = byId('productionOrderSelect').value;
  byId('productionOrderSelect').innerHTML = productionOrders.map(order => `<option value="${order.id}">${order.id} · ${escapeHtml(order.product)}</option>`).join('');
  if (productionOrders.some(order => order.id === selectedOrderId)) byId('productionOrderSelect').value = selectedOrderId;
  const order = productionOrders.find(item => item.id === byId('productionOrderSelect').value) || productionOrders[0]; if (!order) return;
  const progress = order.status === 'Готов к отгрузке' ? 100 : 58; const activeIndex = order.status === 'Готов к отгрузке' ? 6 : 2; const steps = ['Заказ подтверждён', 'Конструкторская подготовка', 'Комплектация', 'Сборка', 'ОТК', 'Упаковка', 'Готово к отгрузке'];
  byId('productionOrderNumber').textContent = order.id; byId('productionProduct').textContent = order.product; byId('productionProject').textContent = `${projectName(order.projectId)} · план ${order.ready}`; byId('productionProgress').textContent = `${progress}%`; byId('productionNext').textContent = steps[Math.min(activeIndex + 1, steps.length - 1)];
  byId('productionTimeline').innerHTML = steps.map((step, index) => `<div class="timeline-step ${index < activeIndex ? 'done' : index === activeIndex ? 'active' : ''}"><i></i><strong>${step}</strong><span>${index < activeIndex ? 'Завершено' : index === activeIndex ? 'В работе' : 'По плану'}</span></div>`).join('');
  byId('productionFeed').innerHTML = `<div><span class="activity-time">18.08 · 12:44</span><i></i><div><strong>Обновлена стадия</strong><span>Демонстрационное событие, ожидается интеграция источника</span></div></div><div><span class="activity-time">17.08 · 09:20</span><i></i><div><strong>Версия КД принята</strong><span>История не перезаписывается</span></div></div>`;
}
function renderShipments() {
  const query = byId('shipmentSearch').value.trim().toLowerCase(); const items = state.shipments.filter(item => `${item.orderId} ${item.address} ${item.contact}`.toLowerCase().includes(query));
  byId('shipmentKpis').innerHTML = [['Всего поставок', state.shipments.length, 'в графике'], ['Подтверждено', state.shipments.filter(item => item.status === 'Подтверждено').length, 'окон'], ['Требуют действия', state.shipments.filter(item => item.status !== 'Подтверждено').length, 'поставок']].map(kpi => `<article class="kpi"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><small>${kpi[2]}</small></article>`).join('');
  byId('shipmentsBody').innerHTML = items.map(item => `<tr><td><strong>${escapeHtml(item.date)}</strong></td><td>${escapeHtml(item.orderId)}<br><small>${escapeHtml(projectName(state.orders.find(order => order.id === item.orderId)?.projectId))}</small></td><td>${escapeHtml(item.contact)}</td><td>${escapeHtml(item.address)}</td><td><span class="tag ${item.tag}">${escapeHtml(item.status)}</span></td></tr>`).join('');
}
function renderDocuments() {
  const query = byId('documentSearch').value.trim().toLowerCase(); const items = state.documents.filter(item => `${item.name} ${item.relation} ${item.category}`.toLowerCase().includes(query)); const categories = [...new Set(state.documents.map(item => item.category))];
  byId('documentCategories').innerHTML = categories.map(category => `<button data-document-category="${escapeHtml(category)}"><span>${escapeHtml(category.slice(0, 2).toUpperCase())}</span><strong>${escapeHtml(category)}</strong><small>${state.documents.filter(item => item.category === category).length} файлов</small></button>`).join('');
  byId('documentsBody').innerHTML = items.map(item => `<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.relation)}</td><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.version)}</td><td><button class="text-button" data-download-document="${item.id}">Скачать карточку</button></td></tr>`).join('');
}
function renderService() {
  const filter = byId('serviceFilter').value; const items = state.service.filter(item => filter === 'all' || item.status === filter);
  byId('serviceKpis').innerHTML = [['Открыто', state.service.filter(item => item.status === 'Открыто').length, 'обращений'], ['В работе', state.service.filter(item => item.status === 'В работе').length, 'обращений'], ['Средний ответ', '1 ч 24 мин', 'в пределах SLA']].map(kpi => `<article class="kpi"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><small>${kpi[2]}</small></article>`).join('');
  byId('serviceBody').innerHTML = items.map(item => `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.subject)}</td><td>${escapeHtml(projectName(item.projectId))}</td><td>${escapeHtml(item.date)}</td><td><span class="tag ${item.tag}">${escapeHtml(item.status)}</span></td></tr>`).join('');
}
function renderJourney() {
  byId('journeyTrack').innerHTML = stageOrder.map((stage, index) => `<button class="journey-stage ${stage === selectedJourneyStage ? 'active' : ''}" data-stage="${stage}"><span>${index + 1}</span>${stages[stage].name}</button>`).join('');
  const stage = stages[selectedJourneyStage]; const count = state.projects.filter(project => project.stage === selectedJourneyStage).length;
  byId('journeyStageDetail').innerHTML = `<div class="journey-detail-head"><div><span class="eyebrow">Триггер перехода</span><h3>${stage.name}: ${stage.trigger}</h3></div><span class="tag neutral">${count} объектов</span></div><div class="journey-detail-grid"><div><span>Ответственный SPL</span><strong>${stage.owner}</strong></div><div><span>Со стороны клиента</span><p>${stage.client}</p></div><div><span>Действия SPL</span><p>${stage.spl}</p></div></div>`;
}
function renderAnalytics() {
  const orderTotal = state.orders.reduce((sum, order) => sum + order.amount, 0); const potential = state.projects.reduce((sum, project) => sum + project.potential, 0) * 1000000; const doneActions = state.orders.flatMap(order => order.actions).filter(action => action.done).length; const allActions = state.orders.flatMap(order => order.actions).length;
  byId('analyticsKpis').innerHTML = [['Потенциал объектов', shortMoney(potential), 'текущий портфель'], ['Заказы', shortMoney(orderTotal), 'включая черновики'], ['Конверсия', `${potential > 0 ? Math.round(orderTotal / potential * 100) : 0}%`, 'потенциал → заказ'], ['Действия в срок', `${allActions ? Math.round(doneActions / allActions * 100) : 0}%`, 'чек-листы клиента']].map(kpi => `<article class="kpi"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><small>${kpi[2]}</small></article>`).join('');
  const maxStage = Math.max(...stageOrder.map(stage => state.projects.filter(project => project.stage === stage).length), 1); byId('journeyFunnel').innerHTML = stageOrder.map(stage => { const count = state.projects.filter(project => project.stage === stage).length; return `<div style="--w:${Math.max(30, count / maxStage * 100)}%"><span>${stages[stage].name}</span><strong>${count}</strong></div>`; }).join('');
  const statuses = [...new Set(state.orders.map(order => order.status))]; byId('orderStatusBars').innerHTML = statuses.map(status => { const count = state.orders.filter(order => order.status === status).length; return `<div><span>${escapeHtml(status)}</span><i><b style="width:${state.orders.length ? count / state.orders.length * 100 : 0}%"></b></i><strong>${count}</strong></div>`; }).join('');
}
function renderNotifications() { const pendingActions = state.orders.flatMap(order => order.actions.map(action => ({ ...action, orderId: order.id }))).filter(action => !action.done); byId('notificationList').innerHTML = pendingActions.slice(0, 5).map(action => `<button class="drawer-item unread" data-notification-order="${action.orderId}"><span class="signal"></span><div><strong>${escapeHtml(action.title)}</strong><p>${escapeHtml(action.orderId)} · ${escapeHtml(action.due)}</p></div></button>`).join(''); document.querySelector('#notificationButton .counter').textContent = pendingActions.length; }
function populateFormOptions() {
  const projectOptions = state.projects.map(project => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join(''); byId('calculationProject').innerHTML = projectOptions; byId('selectionRequestProject').innerHTML = projectOptions; byId('serviceProject').innerHTML = projectOptions;
  byId('orderCalculation').innerHTML = state.calculations.filter(item => item.status === 'Согласован').map(item => `<option value="${escapeHtml(item.number)}">${escapeHtml(item.number)} · ${escapeHtml(projectName(item.projectId))}</option>`).join('');
  byId('shipmentOrder').innerHTML = state.orders.map(order => `<option value="${order.id}">${escapeHtml(order.id)} · ${escapeHtml(projectName(order.projectId))}</option>`).join('');
  byId('documentRelation').innerHTML = [...state.projects.map(project => project.name), ...state.orders.map(order => order.id)].map(value => `<option>${escapeHtml(value)}</option>`).join('');
  if (!byId('orderDesiredDate').value) byId('orderDesiredDate').value = '2026-09-30';
}
function renderAll() { renderRole(); renderDashboard(); renderProjects(); renderSelectionRequests(); renderCalculations(); renderOrders(); renderProduction(); renderShipments(); renderDocuments(); renderService(); renderJourney(); renderAnalytics(); renderNotifications(); populateFormOptions(); }

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => goTo(button.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.goto)));
byId('brandHome').addEventListener('click', event => { event.preventDefault(); goTo('dashboard'); });
window.addEventListener('hashchange', () => { const page = titles[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard'; goTo(page); });
byId('profileButton').addEventListener('click', () => toast('Профиль: Нияз Гарипов · Администратор · ГК «Северный квартал»'));
byId('roleSelect').addEventListener('change', event => { state.role = event.target.value; save(); renderAll(); toast(`Режим: ${event.target.options[event.target.selectedIndex].text}`); });
byId('mobileMenu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
byId('notificationButton').addEventListener('click', () => { byId('notificationDrawer').classList.add('open'); byId('notificationDrawer').setAttribute('aria-hidden', 'false'); });
byId('closeDrawer').addEventListener('click', () => { byId('notificationDrawer').classList.remove('open'); byId('notificationDrawer').setAttribute('aria-hidden', 'true'); });
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
byId('createProjectButton').addEventListener('click', () => openDialog('projectDialog'));
byId('createSelectionRequestButton').addEventListener('click', () => openDialog('selectionRequestDialog'));
byId('importCalculationButton').addEventListener('click', () => openDialog('calculationDialog'));
byId('dashboardImportCalculation').addEventListener('click', () => openDialog('calculationDialog'));
byId('createOrderButton').addEventListener('click', () => openDialog('orderDraftDialog'));
byId('requestShipmentButton').addEventListener('click', () => openDialog('shipmentDialog'));
byId('uploadDocumentButton').addEventListener('click', () => openDialog('documentDialog'));
byId('createServiceButton').addEventListener('click', () => openDialog('serviceDialog'));

byId('primaryAction').addEventListener('click', () => { if (state.role === 'developer') openDialog('projectDialog'); else if (state.role === 'contractor') openDialog('shipmentDialog'); else goTo('calculations'); });
byId('attentionActions').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.textContent.includes('Импортировать')) openDialog('calculationDialog'); else if (button.textContent.includes('пропуск') || button.textContent.includes('окно') || button.textContent.includes('принимающего')) goTo('shipments'); else goTo('orders'); });
byId('dashboardStages').addEventListener('click', event => { const button = event.target.closest('[data-dashboard-stage]'); if (!button) return; selectedJourneyStage = button.dataset.dashboardStage; goTo('journey'); });
byId('dashboardChecklist').addEventListener('change', event => { const input = event.target.closest('[data-dashboard-action-id]'); if (!input) return; const action = state.orders.flatMap(order => order.actions).find(item => item.id === input.dataset.dashboardActionId); action.done = input.checked; save(); renderAll(); toast(input.checked ? 'Действие выполнено' : 'Действие возобновлено'); });

byId('projectForm').addEventListener('submit', event => { event.preventDefault(); const potential = Number(byId('projectPotential').value); if (!Number.isFinite(potential) || potential < 0.1) return toast('Потенциал должен быть не меньше 0,1 млн ₽'); const project = { id: `OBJ-${String(state.projects.length + 260).padStart(4, '0')}`, name: byId('projectName').value.trim(), address: byId('projectAddress').value.trim(), stage: byId('projectStage').value, owner: byId('projectOwner').value, potential, ordered: 0 }; state.projects.unshift(project); save(); closeDialog(byId('projectDialog')); event.target.reset(); byId('projectPotential').value = 10; renderAll(); toast('Объект добавлен'); });
['projectSearch', 'projectStageFilter', 'projectOwnerFilter'].forEach(id => byId(id).addEventListener(id === 'projectSearch' ? 'input' : 'change', renderProjects));
byId('resetProjectFilters').addEventListener('click', () => { byId('projectSearch').value = ''; byId('projectStageFilter').value = 'all'; byId('projectOwnerFilter').value = 'all'; renderProjects(); });
byId('projectGrid').addEventListener('click', event => { const button = event.target.closest('[data-project-stage]'); if (!button) return; selectedJourneyStage = button.dataset.projectStage; goTo('journey'); });

byId('calculationForm').addEventListener('submit', event => { event.preventDefault(); const number = safeId(byId('calculationNumber').value.trim()); const product = byId('calculationProduct').value; const url = validatedCalculationUrl({ product, url: byId('calculationUrl').value }); if (!number) return toast('Номер результата содержит недопустимые символы'); if (!url) return toast('Ссылка, путь и оборудование должны соответствовать доверенному конфигуратору'); const calculation = { number, projectId: byId('calculationProject').value, product, url: url.href, source: url.hostname.replace(/^www\./, ''), status: 'Импортирован', version: 'v1', importedAt: new Date().toISOString() }; if (state.calculations.some(item => item.number === calculation.number)) return toast('Такой номер уже импортирован'); state.calculations.unshift(calculation); save(); closeDialog(byId('calculationDialog')); event.target.reset(); renderAll(); toast('Результат импортирован'); });
byId('calculationSearch').addEventListener('input', renderCalculations);
byId('calculationsBody').addEventListener('click', event => { const approve = event.target.closest('[data-calculation-approve]'); const returned = event.target.closest('[data-calculation-return]'); if (approve || returned) { const calculation = state.calculations.find(item => item.number === (approve?.dataset.calculationApprove || returned?.dataset.calculationReturn)); if (!calculation) return; calculation.status = approve ? 'Согласован' : 'На проверке'; calculation.decisionAt = new Date().toISOString(); save(); renderCalculations(); populateFormOptions(); toast(approve ? 'Версия результата согласована' : 'Результат возвращён на доработку'); return; } const button = event.target.closest('[data-create-order]'); if (!button || button.disabled) return; const calculation = state.calculations.find(item => item.number === button.dataset.createOrder && item.status === 'Согласован'); if (!calculation) return toast('Заказ доступен только из согласованного результата'); openDialog('orderDraftDialog'); byId('orderCalculation').value = calculation.number; });

byId('selectionRequestForm').addEventListener('submit', event => { event.preventDefault(); const projectId = byId('selectionRequestProject').value; const product = byId('selectionRequestProduct').value; const input = byId('selectionRequestInput').value.trim(); const expectation = byId('selectionRequestExpectation').value.trim(); if (state.selectionRequests.some(item => item.projectId === projectId && item.product === product && item.input.toLowerCase() === input.toLowerCase())) return toast('Для этой спецификации уже есть заявка — добавьте данные в неё'); const slaDays = selectionSlaDays[product] || 1; state.selectionRequests.unshift({ id: uid('SEL'), projectId, product, input, expectation, owner: 'Профильный инженер SPL', createdAt: today(), dueAt: addWorkingDays(new Date(), slaDays), slaDays, version: 1, status: 'Черновик', updates: [] }); save(); closeDialog(byId('selectionRequestDialog')); event.target.reset(); renderAll(); toast('Заявка создана. Подбор выполняется вне кабинета'); });
byId('selectionRequestsBody').addEventListener('click', event => { const updateButton = event.target.closest('[data-selection-update]'); const advanceButton = event.target.closest('[data-selection-advance]'); if (updateButton) { byId('selectionUpdateId').value = updateButton.dataset.selectionUpdate; openDialog('selectionUpdateDialog'); return; } if (!advanceButton) return; const request = state.selectionRequests.find(item => item.id === advanceButton.dataset.selectionAdvance); const index = selectionStatusFlow.indexOf(request.status); request.status = selectionStatusFlow[Math.min(Math.max(index, 0) + 1, selectionStatusFlow.length - 1)]; save(); renderAll(); toast(`Статус заявки: ${request.status}`); });
byId('selectionUpdateForm').addEventListener('submit', event => { event.preventDefault(); const request = state.selectionRequests.find(item => item.id === byId('selectionUpdateId').value); if (!request) return; request.updates.push({ id: uid('UPD'), text: byId('selectionUpdateText').value.trim(), date: today() }); request.version += 1; request.status = 'Передана инженеру'; save(); closeDialog(byId('selectionUpdateDialog')); event.target.reset(); renderAll(); toast(`Дополнение сохранено в ${request.id}, версия v${request.version}`); });

byId('orderDraftForm').addEventListener('submit', event => { event.preventDefault(); const calculation = state.calculations.find(item => item.number === byId('orderCalculation').value && item.status === 'Согласован'); if (!calculation) return toast('Заказ доступен только из согласованного результата'); const id = uid('DRAFT'); const order = { id, projectId: calculation.projectId, product: calculation.product, amount: 0, ready: byId('orderDesiredDate').value.split('-').reverse().join('.'), paid: 0, paymentStatus: 'Не оплачено', supplyStatus: 'Не размещён', reserveUntil: '—', debt: 0, status: 'Черновик', tag: 'neutral', source: 'Кабинет → ожидает 1С', deliveryAddress: byId('orderDeliveryAddress').value.trim(), comment: byId('orderComment').value.trim(), actions: [{ id: uid('action'), title: 'Подтвердить реквизиты и договор', due: 'до отправки в 1С', done: false }, { id: uid('action'), title: 'Подтвердить адрес поставки', due: 'до отправки в 1С', done: false }] }; state.orders.unshift(order); state.selectedOrderId = id; save(); closeDialog(byId('orderDraftDialog')); event.target.reset(); renderAll(); goTo('orders'); toast('Черновик создан. Ожидает передачи в 1С'); });
byId('orderList').addEventListener('click', event => { const button = event.target.closest('[data-order-id]'); if (!button) return; state.selectedOrderId = button.dataset.orderId; save(); renderOrders(); });
byId('orderFilter').addEventListener('change', renderOrders);
byId('customerActions').addEventListener('change', event => { const input = event.target.closest('[data-action-id]'); if (!input) return; const order = state.orders.find(item => item.id === state.selectedOrderId); const action = order.actions.find(item => item.id === input.dataset.actionId); action.done = input.checked; save(); renderAll(); toast(input.checked ? 'Действие сохранено' : 'Действие возвращено'); });
byId('openOrderDocuments').addEventListener('click', () => goTo('documents')); byId('openOrderService').addEventListener('click', () => openDialog('serviceDialog'));
byId('requestReserveButton').addEventListener('click', () => { const order = state.orders.find(item => item.id === state.selectedOrderId); if (!order) return; order.supplyStatus = 'Ожидает подтверждения резерва'; order.reserveUntil = '—'; save(); renderOrders(); toast('Запрос резерва отправлен. Дата появится после подтверждения 1С'); });
byId('syncNow').addEventListener('click', event => { event.target.disabled = true; event.target.textContent = 'Сверка…'; setTimeout(() => { event.target.disabled = false; event.target.textContent = 'Обновить'; byId('syncDetails').textContent = `Последняя сверка: ${new Date().toLocaleString('ru-RU')}`; byId('syncTimestamp').textContent = 'обновлено только что'; toast('Проекция 1С обновлена'); }, 700); });

byId('productionOrderSelect').addEventListener('change', renderProduction);
byId('shipmentForm').addEventListener('submit', event => { event.preventDefault(); const orderId = byId('shipmentOrder').value; state.shipments.unshift({ id: uid('SHP'), orderId, date: byId('shipmentDate').value.split('-').reverse().join('.'), contact: byId('shipmentContact').value.trim(), address: byId('shipmentAddress').value.trim(), status: 'Запрос отправлен', tag: 'neutral' }); save(); closeDialog(byId('shipmentDialog')); event.target.reset(); renderAll(); toast('Запрос отгрузки создан'); });
byId('shipmentSearch').addEventListener('input', renderShipments);
byId('documentForm').addEventListener('submit', event => { event.preventDefault(); const file = byId('documentFile').files[0]; state.documents.unshift({ id: uid('DOC'), name: file.name, category: byId('documentCategory').value, relation: byId('documentRelation').value, date: today(), version: 'v1' }); save(); closeDialog(byId('documentDialog')); event.target.reset(); renderAll(); toast('Документ добавлен в прототип'); });
byId('documentSearch').addEventListener('input', renderDocuments);
byId('documentCategories').addEventListener('click', event => { const button = event.target.closest('[data-document-category]'); if (!button) return; byId('documentSearch').value = button.dataset.documentCategory; renderDocuments(); });
byId('documentsBody').addEventListener('click', event => { const button = event.target.closest('[data-download-document]'); if (!button) return; const documentItem = state.documents.find(item => item.id === button.dataset.downloadDocument); const blob = new Blob([`Карточка документа SPLPRO\nНазвание: ${documentItem.name}\nКатегория: ${documentItem.category}\nСвязано с: ${documentItem.relation}\nВерсия: ${documentItem.version}`], { type: 'text/plain;charset=utf-8' }); downloadBlob(blob, `${documentItem.name}.txt`); });
byId('serviceForm').addEventListener('submit', event => { event.preventDefault(); state.service.unshift({ id: uid('SR'), subject: byId('serviceSubject').value.trim(), projectId: byId('serviceProject').value, date: today(), status: 'Открыто', tag: 'warning', category: byId('serviceCategory').value, message: byId('serviceMessage').value.trim() }); save(); closeDialog(byId('serviceDialog')); event.target.reset(); renderAll(); toast('Обращение создано'); });
byId('serviceFilter').addEventListener('change', renderService);

byId('journeyTrack').addEventListener('click', event => { const button = event.target.closest('[data-stage]'); if (!button) return; selectedJourneyStage = button.dataset.stage; renderJourney(); });
byId('openRoadmapSource').addEventListener('click', () => toast('Источник учтён: «Дорожная карта. Версия 3.2-2», 2026'));
byId('notificationList').addEventListener('click', event => { const button = event.target.closest('[data-notification-order]'); if (!button) return; state.selectedOrderId = button.dataset.notificationOrder; byId('notificationDrawer').classList.remove('open'); goTo('orders'); });
function downloadBlob(blob, filename) { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
byId('exportAnalyticsButton').addEventListener('click', () => { const rows = [['Тип', 'Номер', 'Название/статус', 'Значение'], ...state.projects.map(project => ['Объект', project.id, project.name, stages[project.stage].name]), ...state.orders.map(order => ['Заказ', order.id, projectName(order.projectId), order.status]), ...state.shipments.map(item => ['Поставка', item.id, item.orderId, item.status])]; const csvCell = value => { const text = String(value); const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text; return `"${safe.replaceAll('"', '""')}"`; }; const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n'); downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `splpro-analytics-${new Date().toISOString().slice(0, 10)}.csv`); });

const initialPage = titles[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard'; renderAll(); goTo(initialPage);