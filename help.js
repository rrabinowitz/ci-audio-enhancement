import { INFO_TOPICS, MENU_CONTENT } from './helpContent.js?v=14';
import { getRoadmapItem, formatRoadmapModalBody, getRoadmapByPriority, formatRoadmapDropdownItem } from './roadmapContent.js?v=14';

let activeModal = null;

function ensureModalRoot() {
  let root = document.getElementById('helpModalRoot');
  if (root) {
    return root;
  }
  root = document.createElement('div');
  root.id = 'helpModalRoot';
  root.innerHTML = `
    <div class="modal-overlay" id="helpModalOverlay" hidden>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="helpModalTitle">
        <header class="modal-header">
          <h2 id="helpModalTitle"></h2>
          <button type="button" class="modal-close" id="helpModalClose" aria-label="Close">×</button>
        </header>
        <div class="modal-body" id="helpModalBody"></div>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  document.getElementById('helpModalClose').addEventListener('click', closeModal);
  document.getElementById('helpModalOverlay').addEventListener('click', (event) => {
    if (event.target.id === 'helpModalOverlay') {
      closeModal();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
  return root;
}

export function openModal(title, htmlBody) {
  ensureModalRoot();
  const overlay = document.getElementById('helpModalOverlay');
  document.getElementById('helpModalTitle').textContent = title;
  document.getElementById('helpModalBody').innerHTML = htmlBody;
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  activeModal = title;
}

export function closeModal() {
  const overlay = document.getElementById('helpModalOverlay');
  if (overlay) {
    overlay.hidden = true;
  }
  document.body.classList.remove('modal-open');
  activeModal = null;
}

export function openInfoTopic(topicId) {
  const topic = INFO_TOPICS[topicId];
  if (!topic) {
    console.warn(`Unknown help topic: ${topicId}`);
    openModal('Help unavailable', `<p>No help topic is defined for <code>${topicId}</code>. Try a hard refresh (Cmd+Shift+R).</p>`);
    return;
  }
  openModal(topic.title, topic.body);
}

export function openMenuContent(menuId) {
  const content = MENU_CONTENT[menuId];
  if (!content) {
    return;
  }
  openModal(content.title, content.body);
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-dropdown.open').forEach((dropdown) => {
    dropdown.classList.remove('open');
  });
}

export function openRoadmapItem(itemId) {
  const item = getRoadmapItem(itemId);
  if (!item) {
    return;
  }
  openModal(item.title, formatRoadmapModalBody(item));
}

export function initRoadmapMenu(containerId = 'roadmapMenu') {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = `
    <p class="roadmap-menu-intro">
      Each entry lists what must be built before the feature can ship.
      Status: <span class="roadmap-badge available">live</span>,
      <span class="roadmap-badge partial">partial</span>, or
      <span class="roadmap-badge planned">planned</span>.
    </p>
  `;
  getRoadmapByPriority().forEach(({ meta, items }) => {
      if (items.length === 0) {
        return;
      }
      const section = document.createElement('div');
      section.className = 'nav-roadmap-section';
      section.textContent = `${meta.emoji} ${meta.label}`;
      container.appendChild(section);

      items.forEach((item) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = formatRoadmapDropdownItem(item);
        const entry = wrapper.firstElementChild;
        entry.addEventListener('click', (event) => {
          event.stopPropagation();
        });
        container.appendChild(entry);
    });
  });
}

export function initHelpUi() {
  ensureModalRoot();

  document.querySelectorAll('[data-info-topic]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openInfoTopic(button.dataset.infoTopic);
    });
  });

  document.querySelectorAll('[data-menu-content]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeAllDropdowns();
      openMenuContent(button.dataset.menuContent);
    });
  });

  document.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.stopPropagation();
      closeAllDropdowns();
    });
  });

  document.querySelectorAll('.nav-dropdown-toggle').forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = toggle.closest('.nav-dropdown');
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
      }
    });
  });

  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  initRoadmapMenu();
}
