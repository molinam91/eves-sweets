/**
 * Eve's Sweets — Google Sheets backend (Apps Script Web App)
 *
 * SETUP (one time):
 * 1. Create a new blank Google Sheet (any name, e.g. "Eve's Sweets Data").
 * 2. Extensions -> Apps Script. Delete any starter code and paste this whole file.
 * 3. Run the `setup` function once (Run menu -> select "setup" -> Run). The first
 *    run will ask you to authorize the script -- accept it. This creates the
 *    Menu_Items, Promo_Codes, Config, and Orders tabs with headers and a
 *    starter Config row.
 * 4. Deploy -> New deployment -> type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Click Deploy, authorize again if asked, then copy the "Web app URL"
 *    (it ends in /exec). Send that URL to Claude.
 * 5. Whenever you edit this script later, use Deploy -> Manage deployments ->
 *    edit (pencil) -> New version, so the same URL picks up the change.
 */

var TABS = {
  MENU: "Menu_Items",
  PROMOS: "Promo_Codes",
  CONFIG: "Config",
  ORDERS: "Orders",
};

var MENU_HEADERS = ["id", "name", "description", "price", "gradient1", "gradient2", "photo", "isCatering", "addonsJson"];
var PROMO_HEADERS = ["code", "type", "value", "active"];
var CONFIG_HEADERS = ["deliveryFee", "bulkMaxPrice", "bulkMinQty", "bulkFreeDeliveryQty", "whatsappNumbersJson", "socialTiktok", "socialInstagram", "socialFacebook", "contactEmail", "contactPhonesJson", "adminPasswordHash"];
// SHA-256 of "EvesSweets2026" -- starter admin password, change it from the site's Settings tab.
var DEFAULT_ADMIN_PASSWORD_HASH = "d1b8546159b7bb46fa2455017ee9d5754cdb48f407fd288d0ef9f5a99e375313";
var ORDER_HEADERS = ["id", "createdAt", "customerName", "customerPhone", "fulfillment", "hasCatering", "address", "deliveryLabel", "paymentMethod", "notes", "promoCode", "subtotal", "discount", "deliveryFee", "total", "status", "itemsJson"];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, TABS.MENU, MENU_HEADERS);
  ensureSheet_(ss, TABS.PROMOS, PROMO_HEADERS);
  ensureSheet_(ss, TABS.ORDERS, ORDER_HEADERS);
  var configSheet = ensureSheet_(ss, TABS.CONFIG, CONFIG_HEADERS);
  if (configSheet.getLastRow() < 2) {
    configSheet.appendRow([5, 10, 5, 5, JSON.stringify([]), "", "", "", "", JSON.stringify([]), DEFAULT_ADMIN_PASSWORD_HASH]);
  }
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    return sheet;
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return sheet;
  }
  reconcileHeaders_(sheet, headers);
  return sheet;
}

/**
 * Adds any header from `headers` the sheet's row 1 doesn't already have, as new columns
 * appended at the end -- never reorders or removes an existing column, so existing data
 * stays exactly where it is. This is what lets a tab created before a field existed
 * (Config, before socialTiktok/contactEmail/adminPasswordHash) pick up the missing
 * columns on its own. Runs on every request via ensureSheet_, so redeploying the script
 * is enough on its own -- a tab that predates a field never needed a manual migration
 * step, it needed this.
 */
function reconcileHeaders_(sheet, headers) {
  var lastCol = sheet.getLastColumn();
  var existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var existingSet = {};
  existing.forEach(function (h) { existingSet[h] = true; });
  var missing = headers.filter(function (h) { return !existingSet[h]; });
  if (missing.length) sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
}

/** Maps each header name found in row 1 to its 1-based column number. */
function getHeaderIndex_(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var index = {};
  headers.forEach(function (h, i) { index[h] = i + 1; });
  return index;
}

function doGet(e) {
  return respond_(getAll_());
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ error: "invalid JSON body" });
  }
  var action = body.action;
  var payload = body.payload;
  var result;
  try {
    if (action === "get_all") result = getAll_();
    else if (action === "save_menu") result = saveRows_(TABS.MENU, MENU_HEADERS, "id", payload);
    else if (action === "save_promos") result = saveRows_(TABS.PROMOS, PROMO_HEADERS, "code", payload);
    else if (action === "save_config") result = saveConfig_(payload);
    else if (action === "add_order") result = addOrder_(payload);
    else if (action === "complete_order") result = setOrderStatus_(payload.id, "completed");
    else if (action === "clear_orders") result = clearOrders_();
    else return respond_({ error: "unknown action: " + action });
  } catch (err) {
    return respond_({ error: String(err) });
  }
  return respond_(result);
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Reads rows keyed by each column's actual header name, not its position -- safe even if a tab's columns aren't in `headers`' order (e.g. right after reconcileHeaders_ appended new ones). */
function sheetToObjects_(sheet, headers) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  var actualHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var colIndex = {};
  actualHeaders.forEach(function (h, i) { colIndex[h] = i; });
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.map(function (row) {
    var obj = {};
    headers.forEach(function (h) {
      var i = colIndex[h];
      obj[h] = i === undefined ? "" : row[i];
    });
    return obj;
  });
}

function getAll_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuRows = sheetToObjects_(ensureSheet_(ss, TABS.MENU, MENU_HEADERS), MENU_HEADERS);
  var menu = menuRows.map(function (r) {
    return {
      id: r.id, name: r.name, description: r.description, price: Number(r.price),
      gradient: [r.gradient1, r.gradient2], photo: r.photo || undefined,
      isCatering: Boolean(r.isCatering), addons: r.addonsJson ? JSON.parse(r.addonsJson) : [],
    };
  });

  var promoRows = sheetToObjects_(ensureSheet_(ss, TABS.PROMOS, PROMO_HEADERS), PROMO_HEADERS);
  var promos = promoRows.map(function (r) {
    return { code: r.code, type: r.type, value: Number(r.value), active: Boolean(r.active) };
  });

  var configSheet = ensureSheet_(ss, TABS.CONFIG, CONFIG_HEADERS);
  // Headers can exist with no data row yet (a tab that was only ever read from, never
  // successfully saved to) -- seed one with defaults so there's always something to
  // read and, more importantly, something for saveConfig_ to update in place afterward.
  if (configSheet.getLastRow() < 2) {
    configSheet.appendRow([5, 10, 5, 5, JSON.stringify([]), "", "", "", "", JSON.stringify([]), DEFAULT_ADMIN_PASSWORD_HASH]);
  }
  var configRows = sheetToObjects_(configSheet, CONFIG_HEADERS);
  var configRow = configRows[0];
  var config = configRow
    ? {
        deliveryFee: Number(configRow.deliveryFee), bulkMaxPrice: Number(configRow.bulkMaxPrice),
        bulkMinQty: Number(configRow.bulkMinQty), bulkFreeDeliveryQty: Number(configRow.bulkFreeDeliveryQty),
        whatsappNumbers: configRow.whatsappNumbersJson ? JSON.parse(configRow.whatsappNumbersJson) : [],
        socialTiktok: configRow.socialTiktok || "", socialInstagram: configRow.socialInstagram || "",
        socialFacebook: configRow.socialFacebook || "", contactEmail: configRow.contactEmail || "",
        contactPhones: configRow.contactPhonesJson ? JSON.parse(configRow.contactPhonesJson) : [],
        adminPasswordHash: configRow.adminPasswordHash || DEFAULT_ADMIN_PASSWORD_HASH,
      }
    : {
        deliveryFee: 5, bulkMaxPrice: 10, bulkMinQty: 5, bulkFreeDeliveryQty: 5, whatsappNumbers: [],
        socialTiktok: "", socialInstagram: "", socialFacebook: "", contactEmail: "", contactPhones: [],
        adminPasswordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      };

  var orderRows = sheetToObjects_(ensureSheet_(ss, TABS.ORDERS, ORDER_HEADERS), ORDER_HEADERS);
  var orders = orderRows.map(function (r) {
    return {
      id: r.id, createdAt: r.createdAt, customerName: r.customerName, customerPhone: r.customerPhone,
      fulfillment: r.fulfillment, hasCatering: Boolean(r.hasCatering), address: r.address,
      deliveryLabel: r.deliveryLabel, paymentMethod: r.paymentMethod, notes: r.notes,
      promoCode: r.promoCode || null, subtotal: Number(r.subtotal), discount: Number(r.discount),
      deliveryFee: Number(r.deliveryFee), total: Number(r.total), status: r.status,
      items: r.itemsJson ? JSON.parse(r.itemsJson) : [],
    };
  });

  return { menu: menu, promos: promos, config: config, orders: orders };
}

/**
 * Full-table replace: used for admin CRUD on Menu_Items / Promo_Codes.
 *
 * Previously this always cleared `getRange(2, 1, Math.max(lastRow - 1, 0), ...)` first.
 * When the tab had no data rows yet (lastRow === 1, just the header), that computed a
 * 0-row range, which Apps Script rejects -- Sheet.getRange requires at least 1 row. That
 * throw was caught by doPost's try/catch and reported as an error, but a tab that had
 * never received its first row this way could never get one, since every save attempt
 * failed the same way before ever reaching setValues. Rewritten to never request a
 * 0-row range, and to verify the write by reading the sheet back afterward -- a save
 * that silently didn't land now throws instead of quietly returning { ok: true }.
 */
function saveRows_(tabName, headers, keyField, rows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureSheet_(ss, tabName, headers);
  var existingDataRows = Math.max(sheet.getLastRow() - 1, 0);
  var values = rows.map(function (row) {
    if (tabName === TABS.MENU) {
      return [row.id, row.name, row.description, row.price, row.gradient[0], row.gradient[1], row.photo || "", row.isCatering, JSON.stringify(row.addons || [])];
    }
    if (tabName === TABS.PROMOS) {
      return [row.code, row.type, row.value, row.active];
    }
    return headers.map(function (h) { return row[h]; });
  });
  if (values.length) sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  if (existingDataRows > values.length) sheet.deleteRows(2 + values.length, existingDataRows - values.length);

  var check = sheetToObjects_(sheet, headers);
  if (check.length !== values.length) {
    throw new Error("save to " + tabName + " did not verify after write: expected " + values.length + " row(s), found " + check.length);
  }
  return { ok: true, count: values.length };
}

/**
 * Config is a single row. Writes each field to its own column by name (via
 * getHeaderIndex_), not by assuming column order matches CONFIG_HEADERS -- safe
 * regardless of what order reconcileHeaders_ happened to leave the columns in. Creates
 * the data row if none exists yet (a header-only tab could never get one from the old
 * position-based version, which is what silently discarded every save tonight), and
 * always verifies by reading the row back afterward.
 */
function saveConfig_(config) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureSheet_(ss, TABS.CONFIG, CONFIG_HEADERS);
  var whatsappJson = JSON.stringify(config.whatsappNumbers || []);
  var valuesByHeader = {
    deliveryFee: config.deliveryFee, bulkMaxPrice: config.bulkMaxPrice, bulkMinQty: config.bulkMinQty,
    bulkFreeDeliveryQty: config.bulkFreeDeliveryQty, whatsappNumbersJson: whatsappJson,
    socialTiktok: config.socialTiktok || "", socialInstagram: config.socialInstagram || "",
    socialFacebook: config.socialFacebook || "", contactEmail: config.contactEmail || "",
    contactPhonesJson: JSON.stringify(config.contactPhones || []),
    adminPasswordHash: config.adminPasswordHash || DEFAULT_ADMIN_PASSWORD_HASH,
  };

  if (sheet.getLastRow() < 2) sheet.appendRow(new Array(CONFIG_HEADERS.length).fill(""));
  if (sheet.getLastRow() > 2) sheet.deleteRows(3, sheet.getLastRow() - 2);

  var colIndex = getHeaderIndex_(sheet);
  CONFIG_HEADERS.forEach(function (h) {
    var col = colIndex[h];
    if (col !== undefined) sheet.getRange(2, col).setValue(valuesByHeader[h]);
  });

  var check = sheetToObjects_(sheet, CONFIG_HEADERS)[0];
  if (!check || String(check.whatsappNumbersJson) !== whatsappJson) {
    throw new Error("save_config did not verify after write");
  }
  return { ok: true };
}

function addOrder_(order) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureSheet_(ss, TABS.ORDERS, ORDER_HEADERS);
  var id = Utilities.formatString("%04d", sheet.getLastRow());
  sheet.appendRow([
    id, order.createdAt, order.customerName, order.customerPhone, order.fulfillment,
    order.hasCatering, order.address, order.deliveryLabel, order.paymentMethod, order.notes,
    order.promoCode || "", order.subtotal, order.discount, order.deliveryFee, order.total,
    "new", JSON.stringify(order.items || []),
  ]);
  return { ok: true, id: id };
}

/** Deletes every recorded order (sales/best-sellers reset). Menu, promos, and Config are untouched. Verifies the tab is really empty afterward. */
function clearOrders_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureSheet_(ss, TABS.ORDERS, ORDER_HEADERS);
  var lastRow = sheet.getLastRow();
  var removed = Math.max(lastRow - 1, 0);
  if (removed > 0) sheet.deleteRows(2, removed);

  if (sheet.getLastRow() > 1) {
    throw new Error("clear_orders did not verify: rows remain after delete");
  }
  return { ok: true, removed: removed };
}

function setOrderStatus_(id, status) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ensureSheet_(ss, TABS.ORDERS, ORDER_HEADERS);
  var idCol = ORDER_HEADERS.indexOf("id") + 1;
  var statusCol = ORDER_HEADERS.indexOf("status") + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: false, error: "no orders" };
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.getRange(i + 2, statusCol).setValue(status);
      return { ok: true };
    }
  }
  return { ok: false, error: "order not found: " + id };
}
