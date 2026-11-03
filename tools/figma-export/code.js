const SCREENS_PAGE = 'Screens';
const SCREEN_W = 1280;
const SCREEN_H = 720;
const EXPORTED_NAME = /^[A-Z][A-Za-z0-9]*$/;
const FIGMA_DEFAULT_NAMES = new Set(['Vector', 'Rectangle', 'Ellipse', 'Polygon', 'Star', 'Line', 'Arrow', 'Frame', 'Group', 'Section', 'Slice', 'Image', 'Text', 'Component', 'Instance', 'Union', 'Subtract', 'Intersect', 'Exclude']);

function isExported(node) {
  if (!EXPORTED_NAME.test(node.name) || FIGMA_DEFAULT_NAMES.has(node.name)) return false;
  if (node.type === 'TEXT' && node.autoRename) return false;
  return true;
}

const round = v => Math.round(v * 100) / 100;

function toHex(color) {
  const part = v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase();
  const alpha = color.a !== undefined && color.a < 1 ? part(color.a) : '';
  return '#' + part(color.r) + part(color.g) + part(color.b) + alpha;
}

async function resolveValue(variable, modeId, errors) {
  let value = variable.valuesByMode[modeId];
  while (value && value.type === 'VARIABLE_ALIAS') {
    const target = await figma.variables.getVariableByIdAsync(value.id);
    if (!target) {
      errors.push(`${variable.name} points to a variable that is not in this file`);
      return null;
    }
    const collection = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
    value = target.valuesByMode[collection.defaultModeId];
  }
  return value;
}

function setPath(tree, path, value, errors) {
  const parts = path.split('/');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (node[part] !== undefined && typeof node[part] !== 'object') {
      errors.push(`Token "${path}" clashes with token "${parts.slice(0, parts.indexOf(part) + 1).join('/')}"`);
      return;
    }
    node = node[part] = node[part] || {};
  }
  const last = parts[parts.length - 1];
  if (node[last] !== undefined) {
    errors.push(`Token "${path}" is defined twice or clashes with a group of the same name`);
    return;
  }
  node[last] = value;
}

async function exportTokens(errors) {
  const tokens = {};
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id);
      const value = await resolveValue(variable, collection.defaultModeId, errors);
      if (value === null) continue;
      const clean = variable.resolvedType === 'COLOR' ? toHex(value) : typeof value === 'number' ? Math.round(value * 10000) / 10000 : value;
      setPath(tokens, variable.name, clean, errors);
    }
  }
  return tokens;
}

function isShown(node, screen) {
  for (let n = node; n && n !== screen; n = n.parent) if (!n.visible) return false;
  return true;
}

function screenFrames(page) {
  const top = page.children.flatMap(n => (n.type === 'SECTION' ? n.children : [n]));
  return top.filter(n => n.type === 'FRAME' && n.name.endsWith('Screen'));
}

async function exportLayout(errors) {
  const page = figma.root.children.find(p => p.name === SCREENS_PAGE);
  if (!page) {
    errors.push(`No page named "${SCREENS_PAGE}"`);
    return {};
  }
  const original = figma.currentPage;
  await figma.setCurrentPageAsync(page);
  try {
    return collectScreens(page, errors);
  } finally {
    await figma.setCurrentPageAsync(original);
  }
}

function collectScreens(page, errors) {
  const layout = { screen: { width: SCREEN_W, height: SCREEN_H }, screens: {} };
  for (const screen of screenFrames(page)) {
    if (screen.width !== SCREEN_W || screen.height !== SCREEN_H) {
      errors.push(`${screen.name} is ${screen.width}×${screen.height}, must be ${SCREEN_W}×${SCREEN_H}`);
    }
    const origin = screen.absoluteBoundingBox;
    const items = {};
    const repeated = new Set();
    for (const node of screen.findAll(isExported)) {
      if (!isShown(node, screen) || !node.absoluteBoundingBox) continue;
      if (items[node.name]) {
        repeated.add(node.name);
        continue;
      }
      const box = node.absoluteBoundingBox;
      items[node.name] = { x: round(box.x - origin.x), y: round(box.y - origin.y), w: round(box.width), h: round(box.height) };
    }
    for (const name of repeated) {
      delete items[name];
      errors.push(`${screen.name}: "${name}" is used more than once, left out — rename the layers (lowercase if they are decoration)`);
    }
    layout.screens[screen.name] = items;
  }
  return layout;
}

figma.showUI(__html__, { width: 360, height: 300 });

figma.ui.onmessage = async msg => {
  if (msg.type !== 'export') return;
  const errors = [];
  try {
    const tokens = await exportTokens(errors);
    const layout = await exportLayout(errors);
    figma.ui.postMessage({
      type: 'result',
      tokens: JSON.stringify(tokens, null, 2) + '\n',
      layout: JSON.stringify(layout, null, 2) + '\n',
      errors
    });
  } catch (e) {
    figma.ui.postMessage({ type: 'failed', errors: [...errors, String(e)] });
  }
};
