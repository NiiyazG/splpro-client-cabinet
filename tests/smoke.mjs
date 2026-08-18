import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const baseURL = 'http://127.0.0.1:4173';
const server = spawn('python', ['-m', 'http.server', '4173'], { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { const response = await fetch(baseURL); if (response.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Local server did not start');
};

const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // Повреждённый localStorage нормализуется, опасные URL и атрибуты не попадают в DOM.
  await page.evaluate(() => localStorage.setItem('splpro-prototype-v32', JSON.stringify({
    role: 'administrator<script>', selectedOrderId: '\"><img src=x onerror=alert(1)>',
    projects: [{ id: '\" onmouseover=alert(1)', name: '<img src=x onerror=alert(1)>', address: 42, stage: 'hot evil', owner: {}, potential: 0, ordered: -10 }],
    calculations: [{ number: '\" onclick=alert(1)', projectId: 'missing', product: 'Насосная станция SPL', url: 'javascript:alert(1)', source: 'evil', status: 'Согласован' }],
    selectionRequests: [{ id: 'SEL-XSS', projectId: 'missing', product: '<img src=x onerror="window.xssProof=1">', input: '<svg onload="window.xssProof=2">', expectation: '<img src=x onerror="window.xssProof=3">', owner: '<img src=x onerror="window.xssProof=7">', dueAt: '<svg onload="window.xssProof=8">', slaDays: 999, version: -4, status: '<img>', updates: [{ id: 'UPD-XSS', text: '<img src=x onerror="window.xssProof=4">', date: '<svg>' }] }],
    orders: [{ id: '\" class=evil', projectId: 'missing', product: '<svg onload=alert(1)>', amount: 'NaN', ready: {}, paid: 500, paymentStatus: '<img src=x onerror="window.xssProof=5">', supplyStatus: '<svg onload="window.xssProof=6">', reserveUntil: '<img>', debt: 'Infinity', status: '<img>', tag: 'evil', actions: 'bad' }],
    shipments: [{ id: 'SHP-XSS', orderId: 'missing', date: '<img src=x onerror="window.xssProof=1">.08', contact: {}, address: '<img>', status: '<svg>', tag: 'evil' }],
    documents: [{ id: 'bad id', name: '<img>', category: {}, relation: [], date: {}, version: '<svg>' }],
    service: [{ id: 'bad id', subject: '<img>', projectId: 'missing', date: {}, status: '<svg>', tag: 'evil' }]
  })));
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('script:not([src]), img[src="x"], svg[onload]').count(), 0);
  assert.equal(await page.evaluate(() => window.xssProof), undefined);
  assert.equal(await page.locator('#calculationsBody a[href^="javascript:"]').count(), 0);
  assert.equal(await page.locator('[class*="evil"], [data-order-id*="evil"], [data-create-order*="onclick"]').count(), 0);
  assert.equal(await page.locator('#projectPotential').getAttribute('min'), '0.1');
  assert.doesNotMatch(await page.locator('body').textContent(), /NaN|Infinity/);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // Ролевой режим сохраняется.
  await page.selectOption('#roleSelect', 'contractor');
  assert.match(await page.locator('#welcomeTitle').textContent(), /Поставки/);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#roleSelect').inputValue(), 'contractor');

  // Новый объект создаётся и появляется в портфеле.
  await page.click('[data-page="projects"]');
  const initialProjects = await page.locator('#projectGrid .project-card').count();
  await page.click('#createProjectButton');
  await page.fill('#projectName', 'ЖК «Тестовый квартал»');
  await page.fill('#projectAddress', 'г. Москва, ул. Тестовая, д. 1');
  await page.selectOption('#projectStage', 'preproject');
  await page.click('#projectForm button[type="submit"]');
  assert.equal(await page.locator('#projectGrid .project-card').count(), initialProjects + 1);
  await page.fill('#projectSearch', 'Тестовый квартал');
  assert.equal(await page.locator('#projectGrid .project-card:visible').count(), 1);

  // Подбор выполняется только внешними конфигураторами; результат импортируется в ЛК.
  await page.click('[data-page="calculations"]');
  assert.match(await page.locator('[data-configurator="station"]').getAttribute('href'), /splpro\.ru\/selections\/station/);
  assert.equal(await page.locator('[data-configurator="station"]').getAttribute('target'), '_blank');
  assert.equal(await page.locator('.configurator[data-status="planned"]').count() > 0, true);

  // Дорожная карта 3.2-2: заявка хранит исходные данные, SLA и дополнения в той же версии цепочки.
  const initialSelectionRequests = await page.locator('#selectionRequestsBody tr').count();
  await page.click('#createSelectionRequestButton');
  await page.selectOption('#selectionRequestProject', { label: 'ЖК «Тестовый квартал»' });
  await page.selectOption('#selectionRequestProduct', 'Коллекторный узел DCU');
  await page.fill('#selectionRequestInput', 'Спецификация DCU-01 и чертёж узла');
  await page.fill('#selectionRequestExpectation', 'Цена до тендера, срок — 3 рабочих дня');
  await page.click('#selectionRequestForm button[type="submit"]');
  assert.equal(await page.locator('#selectionRequestsBody tr').count(), initialSelectionRequests + 1);
  const requestId = await page.locator('#selectionRequestsBody tr').first().locator('td').first().textContent();
  assert.match(await page.locator('#selectionRequestsBody tr').first().textContent(), /3 раб\. дн\.|v1|Черновик/);
  await page.click('#createSelectionRequestButton');
  await page.selectOption('#selectionRequestProject', { label: 'ЖК «Тестовый квартал»' });
  await page.selectOption('#selectionRequestProduct', 'Коллекторный узел DCU');
  await page.fill('#selectionRequestInput', 'Спецификация DCU-01 и чертёж узла');
  await page.fill('#selectionRequestExpectation', 'Повторная попытка');
  await page.click('#selectionRequestForm button[type="submit"]');
  assert.equal(await page.locator('#selectionRequestsBody tr').count(), initialSelectionRequests + 1);
  assert.match(await page.locator('#toast').textContent(), /уже есть заявка/);
  await page.click('#selectionRequestDialog [data-close-dialog]');
  await page.click(`[data-selection-update="${requestId}"]`);
  await page.fill('#selectionUpdateText', 'Добавлен актуальный план и замечания проектировщика');
  await page.click('#selectionUpdateForm button[type="submit"]');
  assert.match(await page.locator('#selectionRequestsBody tr').first().textContent(), /v2|1 дополнений|Передана инженеру/);
  const selectionRequest = await page.evaluate(id => JSON.parse(localStorage.getItem('splpro-prototype-v32')).selectionRequests.find(item => item.id === id), requestId);
  assert.equal(selectionRequest.version, 2);
  assert.equal(selectionRequest.updates.length, 1);
  assert.equal(selectionRequest.owner, 'Профильный инженер SPL');
  assert.match(selectionRequest.dueAt, /^\d{2}\.\d{2}\.\d{4}$/);
  assert.equal(await page.locator('#selectionRequestDialog input[type="number"]').count(), 0);

  const initialCalculations = await page.locator('#calculationsBody tr').count();
  await page.click('#importCalculationButton');
  await page.fill('#calculationNumber', 'EXT-TEST-001');
  await page.selectOption('#calculationProject', { label: 'ЖК «Тестовый квартал»' });
  await page.selectOption('#calculationProduct', 'Насосная станция SPL');
  await page.fill('#calculationUrl', 'https://splpro.ru/selections/station?result=EXT-TEST-001');
  await page.click('#calculationForm button[type="submit"]');
  assert.equal(await page.locator('#calculationsBody tr').count(), initialCalculations + 1);
  assert.match(await page.locator('#calculationsBody').textContent(), /EXT-TEST-001/);
  const importedCalculation = await page.evaluate(() => JSON.parse(localStorage.getItem('splpro-prototype-v32')).calculations.find(item => item.number === 'EXT-TEST-001'));
  assert.equal(importedCalculation.status, 'Импортирован');
  assert.equal(importedCalculation.version, 'v1');
  assert.ok(!Number.isNaN(Date.parse(importedCalculation.importedAt)));
  assert.match(await page.locator('#calculationsBody').textContent(), /v1/);
  assert.match(await page.locator('#calculationsBody').textContent(), /18\.08\.2026/);
  assert.equal(await page.locator('[data-create-order="EXT-TEST-001"]').isDisabled(), true);
  await page.click('[data-calculation-return="EXT-TEST-001"]');
  assert.match(await page.locator('#calculationsBody').textContent(), /На проверке/);
  await page.click('[data-calculation-approve="EXT-TEST-001"]');
  assert.equal(await page.locator('[data-create-order="EXT-TEST-001"]').isEnabled(), true);
  const approvedCalculation = await page.evaluate(() => JSON.parse(localStorage.getItem('splpro-prototype-v32')).calculations.find(item => item.number === 'EXT-TEST-001'));
  assert.equal(approvedCalculation.status, 'Согласован');
  assert.ok(!Number.isNaN(Date.parse(approvedCalculation.decisionAt)));

  // Ссылки с недоверенных доменов не импортируются.
  await page.click('#importCalculationButton');
  await page.fill('#calculationNumber', 'EXT-BAD-001');
  await page.fill('#calculationUrl', 'https://example.com/fake-selection');
  await page.click('#calculationForm button[type="submit"]');
  assert.equal(await page.locator('#calculationDialog').getAttribute('open'), '');
  assert.doesNotMatch(await page.locator('#calculationsBody').textContent(), /EXT-BAD-001/);
  await page.click('#calculationDialog [data-close-dialog]');

  // Доверенный домен не достаточен: путь и продукт должны соответствовать источнику.
  for (const [number, product, url] of [
    ['EXT-BAD-PATH', 'Насосная станция SPL', 'https://splpro.ru/account/profile'],
    ['EXT-BAD-PRODUCT', 'Насосы AQUASTRONG', 'https://splpro.ru/selections/station']
  ]) {
    await page.click('#importCalculationButton');
    await page.fill('#calculationNumber', number);
    await page.selectOption('#calculationProduct', product);
    await page.fill('#calculationUrl', url);
    await page.click('#calculationForm button[type="submit"]');
    assert.equal(await page.locator('#calculationDialog').getAttribute('open'), '');
    await page.click('#calculationDialog [data-close-dialog]');
  }
  assert.doesNotMatch(await page.locator('#calculationsBody').textContent(), /EXT-BAD-PATH|EXT-BAD-PRODUCT/);

  // Кнопка строки передаёт в черновик именно выбранный, а не первый результат.
  await page.click('[data-create-order="AQ-26452"]');
  assert.equal(await page.locator('#orderCalculation').inputValue(), 'AQ-26452');
  await page.click('#orderDraftDialog [data-close-dialog]');

  // Черновик заказа создаётся только из согласованного результата.
  await page.click('[data-create-order="AQ-26452"]');
  await page.fill('#orderDeliveryAddress', 'г. Москва, ул. Тестовая, д. 1');
  await page.fill('#orderComment', 'Разгрузка только после 10:00');
  await page.click('#orderDraftForm button[type="submit"]');
  assert.equal(await page.locator('#page-orders').getAttribute('class'), 'page active');
  assert.match(await page.locator('#orderNumber').textContent(), /DRAFT-/);
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('splpro-prototype-v32')).orders.find(item => item.id.startsWith('DRAFT-')));
  assert.equal(draft.comment, 'Разгрузка только после 10:00');
  assert.equal(draft.paymentStatus, 'Не оплачено');
  assert.equal(draft.supplyStatus, 'Не размещён');
  await page.click('#requestReserveButton');
  const reservedDraft = await page.evaluate(id => JSON.parse(localStorage.getItem('splpro-prototype-v32')).orders.find(item => item.id === id), draft.id);
  assert.equal(reservedDraft.supplyStatus, 'Ожидает подтверждения резерва');
  assert.equal(reservedDraft.reserveUntil, '—');
  assert.match(await page.locator('#toast').textContent(), /после подтверждения 1С/);

  // При фильтрации детальная карточка выбирается из отфильтрованного списка.
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('splpro-prototype-v32'));
    value.selectedOrderId = 'SPL-260812-01';
    localStorage.setItem('splpro-prototype-v32', JSON.stringify(value));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-page="orders"]');
  await page.selectOption('#orderFilter', 'draft');
  assert.match(await page.locator('#orderNumber').textContent(), /DRAFT-/);
  assert.equal(await page.locator('#orderList .order-item').count(), 1);

  // Пустой фильтр очищает детальную карточку и блокирует действия.
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('splpro-prototype-v32'));
    value.orders = value.orders.filter(order => order.status !== 'Черновик');
    localStorage.setItem('splpro-prototype-v32', JSON.stringify(value));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-page="orders"]');
  await page.selectOption('#orderFilter', 'draft');
  assert.equal(await page.locator('#orderList .order-item').count(), 0);
  assert.equal(await page.locator('#orderNumber').textContent(), 'Нет заказов');
  assert.equal(await page.locator('#openOrderDocuments').isDisabled(), true);
  await page.selectOption('#orderFilter', 'all');

  // Бренд возвращает на обзор, профиль даёт рабочую обратную связь.
  await page.click('[data-page="orders"]');
  await page.click('#brandHome');
  assert.equal(await page.locator('#page-dashboard').getAttribute('class'), 'page active');
  await page.click('#profileButton');
  assert.match(await page.locator('#toast').textContent(), /Профиль: Нияз Гарипов/);

  // Чек-лист клиента сохраняется между перезагрузками.
  await page.click('[data-page="orders"]');
  const customerAction = page.locator('#customerActions input').first();
  await customerAction.check();
  const actionId = await customerAction.getAttribute('data-action-id');
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-page="orders"]');
  assert.equal(await page.locator(`[data-action-id="${actionId}"]`).isChecked(), true);

  // Выбор производственного заказа не сбрасывается при перерисовке.
  await page.click('[data-page="production"]');
  assert.match(await page.locator('#page-dashboard').textContent(), /Демонстрационные данные производства/);
  await page.selectOption('#productionOrderSelect', 'SPL-260729-08');
  assert.equal(await page.locator('#productionOrderNumber').textContent(), 'SPL-260729-08');

  // Запрос поставки создаётся через форму.
  await page.click('[data-page="shipments"]');
  const initialShipments = await page.locator('#shipmentsBody tr').count();
  await page.click('#requestShipmentButton');
  await page.selectOption('#shipmentOrder', { index: 0 });
  await page.fill('#shipmentDate', '2026-09-20');
  await page.fill('#shipmentContact', 'Иван Петров, +7 999 123-45-67');
  await page.click('#shipmentForm button[type="submit"]');
  assert.equal(await page.locator('#shipmentsBody tr').count(), initialShipments + 1);

  // Документ добавляется в список.
  await page.click('[data-page="documents"]');
  const initialDocuments = await page.locator('#documentsBody tr').count();
  await page.click('#uploadDocumentButton');
  await page.setInputFiles('#documentFile', { name: 'схема.pdf', mimeType: 'application/pdf', buffer: Buffer.from('demo') });
  await page.selectOption('#documentCategory', 'Проектные');
  await page.click('#documentForm button[type="submit"]');
  assert.equal(await page.locator('#documentsBody tr').count(), initialDocuments + 1);

  // Сервисное обращение создаётся.
  await page.click('[data-page="service"]');
  const initialRequests = await page.locator('#serviceBody tr').count();
  await page.click('#createServiceButton');
  await page.fill('#serviceSubject', 'Проверка автоматики');
  await page.selectOption('#serviceProject', { label: 'ЖК «Тестовый квартал»' });
  await page.fill('#serviceMessage', 'Просьба проверить схему подключения.');
  await page.click('#serviceForm button[type="submit"]');
  assert.equal(await page.locator('#serviceBody tr').count(), initialRequests + 1);

  // Дорожная карта из версии 3.2 представлена отдельным рабочим экраном.
  await page.click('[data-page="journey"]');
  const stageLabels = await page.locator('.journey-stage').allTextContents();
  assert.deepEqual(stageLabels.map(label => label.replace(/^\d+/, '')), ['Предпроект', 'Проект', 'Ноль', 'Каркас', 'Горящий', 'Закончен']);
  await page.click('.journey-stage[data-stage="frame"]');
  assert.match(await page.locator('#journeyStageDetail').textContent(), /Тендер/);

  // Экспорт аналитики инициирует скачивание.
  await page.click('[data-page="analytics"]');
  const downloadPromise = page.waitForEvent('download');
  await page.click('#exportAnalyticsButton');
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /splpro-analytics.*\.csv/);

  // CSV нейтрализует формулы для всех опасных начальных символов.
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('splpro-prototype-v32'));
    const prefixes = ['=', '+', '-', '@', '\t', '\r'];
    prefixes.forEach((prefix, index) => value.projects.push({ id: `OBJ-F${index}`, name: `${prefix}CMD()`, address: 'Тест', stage: 'preproject', owner: 'Тест', potential: 1, ordered: 0 }));
    localStorage.setItem('splpro-prototype-v32', JSON.stringify(value));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-page="analytics"]');
  const safeDownloadPromise = page.waitForEvent('download');
  await page.click('#exportAnalyticsButton');
  const safeDownload = await safeDownloadPromise;
  const csv = await readFile(await safeDownload.path(), 'utf8');
  for (const marker of ["'=CMD()", "'+CMD()", "'-CMD()", "'@CMD()", "'\tCMD()", "'\rCMD()"]) assert.ok(csv.includes(marker), `CSV marker missing: ${JSON.stringify(marker)}`);

  // Все рабочие страницы не имеют корневого горизонтального переполнения на 390 и 320 px.
  const mobileChecks = {};
  for (const width of [390, 320]) {
    mobileChecks[width] = {};
    await page.setViewportSize({ width, height: 844 });
    for (const pageName of ['dashboard', 'projects', 'calculations', 'orders', 'production', 'shipments', 'documents', 'service', 'journey', 'analytics']) {
      await page.goto(`${baseURL}#${pageName}`, { waitUntil: 'networkidle' });
      const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      mobileChecks[width][pageName] = dimensions;
      assert.ok(dimensions.scrollWidth <= dimensions.innerWidth, `${pageName} overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}#dashboard`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.role-switcher').isVisible(), true);
  const overflowOffenders = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(element => {
    const rect = element.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    const intentionallyScrollable = element.closest('.table-scroll,.journey-track,.sidebar,.notification-drawer');
    return visible && rect.right > innerWidth + 1 && !intentionallyScrollable;
  }).map(element => ({ tag: element.tagName, id: element.id, className: element.className, right: element.getBoundingClientRect().right })).slice(0, 10));
  assert.deepEqual(overflowOffenders, []);
  await page.click('#mobileMenu');
  assert.ok((await page.locator('.sidebar').getAttribute('class')).includes('open'));

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', projectWorkflow: true, selectionRequest32_2: true, externalConfigurator: true, trustedImportOnly: true, calculationImport: true, orderDraft: true, reserveRequest: true, persistedChecklist: true, shipmentRequest: true, documentUpload: true, serviceRequest: true, roadmap32_2: true, analyticsExport: true, mobileOverflow: mobileChecks, mobileRoleSwitcher: true, consoleErrors: errors.length }, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill();
}
