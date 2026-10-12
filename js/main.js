/**
 * neXStream Official Website Interactivity
 * Inspired by nuvio.tv UX patterns
 * NexDev Studios © 2026
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Smooth Scroll with Floating Header Offset ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileToggle = document.getElementById('mobile-toggle');
        if (mobileMenu && !mobileMenu.hidden) {
          mobileMenu.hidden = true;
          mobileToggle?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // ── 2. Screen Switcher Tabs (Universal / ARM64 / ARM32) ──
  const switcherButtons = document.querySelectorAll('.nv-switch button[role="tab"]');
  const panels = document.querySelectorAll('.nv-panel');

  switcherButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all tabs
      switcherButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      // Activate clicked tab
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      // Show matching panel
      const targetPanelId = btn.getAttribute('aria-controls');
      panels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.hidden = false;
          panel.classList.add('is-visible');
        } else {
          panel.hidden = true;
          panel.classList.remove('is-visible');
        }
      });
    });
  });

  // ── 3. Mobile Hamburger Menu Toggle ──
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.hidden = isExpanded;
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.hidden && !mobileMenu.contains(e.target) && e.target !== mobileToggle) {
        mobileMenu.hidden = true;
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── 4. Dynamic GitHub Release & APK Sync ──
  async function fetchLatestRelease() {
    try {
      const response = await fetch('https://api.github.com/repos/NexDevStudios-repo/neXStream/releases/latest');
      if (!response.ok) return;
      const release = await response.json();
      const versionTag = release.tag_name || 'v1.0.0';

      // 1. Update version tags across header, titles and cards
      document.querySelectorAll('.nv-badge, .app-version-tag').forEach(el => {
        el.textContent = versionTag;
      });

      document.querySelectorAll('[data-arch-version]').forEach(el => {
        el.textContent = `Versión: ${versionTag}`;
      });

      // 2. Update Release Notes link
      if (release.html_url) {
        document.querySelectorAll('[data-release-notes-link]').forEach(el => {
          el.href = release.html_url;
        });
      }

      // 3. Process Assets (APKs, weights & links) dynamically
      if (Array.isArray(release.assets) && release.assets.length > 0) {
        release.assets.forEach(asset => {
          const fileName = (asset.name || '').toLowerCase();
          const downloadUrl = asset.browser_download_url;
          const sizeMb = asset.size ? Math.round(asset.size / (1024 * 1024)) : null;

          let arch = null;
          let archLabel = '';

          if (fileName.includes('universal')) {
            arch = 'universal';
            archLabel = 'APK Universal';
          } else if (fileName.includes('arm64')) {
            arch = 'arm64';
            archLabel = 'APK ARM64';
          } else if (fileName.includes('armeabi') || fileName.includes('arm32') || fileName.includes('v7a')) {
            arch = 'arm32';
            archLabel = 'APK ARM32';
          }

          if (arch && downloadUrl) {
            // Update download button URL
            const btn = document.querySelector(`[data-arch-btn="${arch}"]`);
            if (btn) btn.href = downloadUrl;

            // Update button label with actual MB weight
            const btnText = document.querySelector(`[data-arch-text="${arch}"]`);
            if (btnText) {
              btnText.textContent = sizeMb ? `Descargar ${archLabel} (${sizeMb} MB)` : `Descargar ${archLabel}`;
            }

            // Update spec chip size
            const sizeChip = document.querySelector(`[data-arch-size="${arch}"]`);
            if (sizeChip && sizeMb) {
              sizeChip.textContent = `Peso: ${sizeMb} MB`;
            }
          }
        });
      }
    } catch (err) {
      // Offline fallback: keep hardcoded defaults intact
      console.debug('GitHub release fetch error (offline or rate limited):', err);
    }
  }

  fetchLatestRelease();
});
