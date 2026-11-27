import { initTraceWorkbench } from './trace-workbench.js';

const INSTALL_COMMANDS = {
  brew: 'brew install kestrel-trace/tap/kestrel',
  curl: 'curl -fsSL https://kestreltrace.dev/install.sh | sh'
};

function initInstallWidgets() {
  document.querySelectorAll('[data-install-widget]').forEach((widget) => {
    const tabs = widget.querySelectorAll('[data-install-tab]');
    const cmdEl = widget.querySelector('[data-install-cmd]');
    const copyBtn = widget.querySelector('[data-copy-btn]');

    if (!cmdEl || !copyBtn) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.installTab;
        if (!INSTALL_COMMANDS[key]) return;

        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        cmdEl.textContent = INSTALL_COMMANDS[key];
      });
    });

    copyBtn.addEventListener('click', async () => {
      const command = cmdEl.textContent || '';
      try {
        await navigator.clipboard.writeText(command);
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('is-copied');
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('is-copied');
        }, 1600);
      } catch {
        copyBtn.textContent = 'Select';
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1200);
      }
    });
  });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'メニューを開く');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initInstallWidgets();
  initMobileMenu();
  initTraceWorkbench();
});
