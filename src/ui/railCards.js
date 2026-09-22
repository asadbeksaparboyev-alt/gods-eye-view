import { createRailCardBlocks } from './railCardBlocks.js';

const set = (node, key, value) => {
  if (node[key] !== value) node[key] = value;
};
let nextId = 0;

/** Keyed cards with optional ordered blocks; the feature owns open-card choice. */
export function createRailCards({
  container,
  document = container?.ownerDocument,
  cardClassName = '',
  badgeClassName = '',
  onParams = () => {},
  onOpen = () => {},
} = {}) {
  if (!document?.createElement || !container) return null;
  const rows = new Map();
  let destroyed = false;
  const make = (tag, className, parent) => {
    const node = document.createElement(tag);
    node.className = className;
    parent.appendChild(node);
    return node;
  };
  const dispose = (row) => {
    row.header.removeEventListener('click', row.click);
    row.blocks.destroy();
    row.element.remove();
  };
  return {
    update(cards = []) {
      if (destroyed) return;
      const active = new Set();
      for (const card of cards) {
        active.add(card.id);
        let row = rows.get(card.id);
        if (!row) {
          const element = make(
            'article',
            `rail-card${cardClassName ? ` ${cardClassName}` : ''}`,
            container,
          );
          element.dataset.cardId = card.id;
          const header = make('button', 'rail-card-header', element);
          header.type = 'button';
          const title = make('span', 'rail-card-title', header);
          const badge = make(
            'span',
            `rail-card-badge${badgeClassName ? ` ${badgeClassName}` : ''}`,
            header,
          );
          const compact = make('span', 'rail-card-compact', header);
          const body = make('div', 'rail-card-body', element);
          body.id = `rail-card-body-${++nextId}`;
          header.setAttribute('aria-controls', body.id);
          const blocks = createRailCardBlocks({
            container: body,
            cardId: card.id,
            onParams,
          });
          const click = () => onOpen(card.id);
          header.addEventListener('click', click);
          row = { element, header, title, badge, compact, body, blocks, click };
          rows.set(card.id, row);
        }
        set(row.title, 'textContent', card.title);
        set(row.badge, 'textContent', card.badge || '');
        set(row.badge, 'hidden', !card.badge);
        const open = card.open !== false;
        set(row.element.dataset, 'open', String(open));
        if (row.header.getAttribute('aria-expanded') !== String(open))
          row.header.setAttribute('aria-expanded', String(open));
        set(row.body, 'hidden', !open);
        set(row.compact, 'hidden', open);
        set(row.compact, 'textContent', card.compact || '');
        set(
          row.compact,
          'className',
          `rail-card-compact${card.compactStatus ? ' status' : ''}`,
        );
        row.blocks.update(card.blocks || []);
      }
      for (const [id, row] of rows)
        if (!active.has(id)) {
          dispose(row);
          rows.delete(id);
        }
      cards.forEach(({ id }, index) => {
        const node = rows.get(id).element;
        if (container.children[index] !== node)
          container.insertBefore(node, container.children[index] || null);
      });
    },
    destroy() {
      destroyed = true;
      for (const row of rows.values()) dispose(row);
      rows.clear();
    },
  };
}
