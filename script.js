/**
 * script.js
 * UMUCO SOLUTIONS — Kawaii interactive behaviors
 * - Floating labels helper
 * - Contact form validation + WhatsApp + mailto fallback
 * - Auto-reply toast
 * - LP links add & persist (localStorage)
 * - Everyday spinner (words, jokes, proverbs)
 * - QR update
 * - PWA install banner handling
 * - Service worker registration
 * - tawk.to online status check
 */

(function() {
  /* ========== Konfig ========== */
  const WA_PHONE = '25771633859';            // WhatsApp number (no +)
  const OWNER_EMAIL = 'arakazabruce2@gmail.com';
  const LP_STORAGE_KEY = 'umuco_lp_links_v1';

  /* ========== Helpers ========== */
  function showToast(message, timeout = 4000) {
    let t = document.createElement('div');
    t.className = 'kawaii-toast';
    t.textContent = message;
    Object.assign(t.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      background: '#fff',
      color: '#222',
      padding: '10px 14px',
      borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
      zIndex: 9999,
      fontWeight: 700,
      fontSize: '0.95rem'
    });
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .28s ease, transform .28s ease';
      t.style.opacity = '0';
      t.style.transform = 'translateY(8px)';
    }, timeout - 300);
    setTimeout(() => t.remove(), timeout);
  }

  function openInNewTab(url) {
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      window.location.href = url;
    }
  }

  /* ========== Floating labels ========== */
  function ensurePlaceholders() {
    document.querySelectorAll('.youth-form .field input, .youth-form .field textarea').forEach(el => {
      if (!el.placeholder) el.placeholder = ' ';
    });
  }

  /* ========== Contact form ========== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const sendBtn = document.getElementById('sendBtn');
    const formMsg = document.getElementById('formMsg');
    const autoReplyNotice = document.getElementById('autoReplyNotice');

    function validate() {
      const name = (document.getElementById('name') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';
      const nameOk = name.trim().length >= 2;
      const msgOk = message.trim().length >= 5;
      if (sendBtn) sendBtn.disabled = !(nameOk && msgOk);
      if (formMsg) formMsg.textContent = sendBtn.disabled ? 'Uzuza izina n’ubutumwa kugira ngo wohereze.' : 'Birateguye — kanda Ohereza ✨';
    }

    ['input','keyup','change'].forEach(evt => form.addEventListener(evt, validate, true));
    validate();

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = (document.getElementById('name') || {}).value.trim() || 'Umukiriya';
      const email = (document.getElementById('email') || {}).value.trim() || '';
      const message = (document.getElementById('message') || {}).value.trim() || '';

      // WhatsApp
      const waText = encodeURIComponent(`Izina: ${name}\nEmail: ${email}\nUbutumwa:\n${message}`);
      const waUrl = `https://wa.me/${WA_PHONE}?text=${waText}`;
      openInNewTab(waUrl);

      // mailto fallback
      const subject = encodeURIComponent(`Ubutumwa - ${name}`);
      const body = encodeURIComponent(`Izina: ${name}\nEmail: ${email}\nUbutumwa:\n${message}`);
      const mailto = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
      openInNewTab(mailto);

      if (autoReplyNotice) {
        autoReplyNotice.classList.remove('hidden');
        setTimeout(() => autoReplyNotice.classList.add('hidden'), 8000);
      }
      showToast('Ubutumwa bwawe bwatanzwe — turagusubiza vuba 💬');

      form.reset();
      validate();
    });
  }

  
  function renderLpList(filterText = '', category = '', sort = 'recent') {
  const lpList = document.getElementById('lpList');
  if (!lpList) return;
  lpList.innerHTML = '';
  let items = loadLpLinks();

  // Filter by search text
  if (filterText) {
    items = items.filter(i => i.title.toLowerCase().includes(filterText.toLowerCase()));
  }
  // Filter by category
  if (category) {
    items = items.filter(i => i.category === category);
  }
  // Sort
  if (sort === 'alpha') {
    items.sort((a,b)=>a.title.localeCompare(b.title));
  } else if (sort === 'popular') {
    items.sort((a,b)=> (b.visits||0) - (a.visits||0));
  } else {
    items.sort((a,b)=> b.added - a.added); // recent
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'lp-item';

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.src = `https://www.google.com/s2/favicons?domain=${item.url}`;
    thumb.alt = 'favicon';
    thumb.className = 'lp-thumb';

    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = item.title;
    a.addEventListener('click', ()=> {
      item.visits = (item.visits||0)+1;
      saveLpLinks(items);
      renderLpList(filterText, category, sort);
    });

    // Counter
    const counter = document.createElement('span');
    counter.className = 'lp-counter';
    counter.textContent = `👀 ${item.visits||0}`;

    // Favorite
    const fav = document.createElement('button');
    fav.textContent = item.favorite ? '⭐' : '☆';
    fav.className = 'lp-fav';
    fav.addEventListener('click', ()=> {
      item.favorite = !item.favorite;
      saveLpLinks(items);
      renderLpList(filterText, category, sort);
    });

    // Share
    const share = document.createElement('button');
    share.textContent = '🔗';
    share.className = 'lp-share';
    share.addEventListener('click', ()=> {
      navigator.clipboard.writeText(item.url);
      showToast('Link copied to clipboard 📋');
    });

    li.appendChild(thumb);
    li.appendChild(a);
    li.appendChild(counter);
    li.appendChild(fav);
    li.appendChild(share);
    lpList.appendChild(li);
  });
}

function initLpControls() {
  const search = document.getElementById('lpSearch');
  const cat = document.getElementById('lpCategoryFilter');
  const sort = document.getElementById('lpSort');
  [search,cat,sort].forEach(el=>{
    if(el) el.addEventListener('input', ()=> {
      renderLpList(search.value, cat.value, sort.value);
    });
  });
}

function initLpForm() {
  const lpForm = document.getElementById('lpAddForm');
  if (!lpForm) return;
  lpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('lpTitle').value.trim();
    const url = document.getElementById('lpUrl').value.trim();
    const category = document.getElementById('lpCategory').value;
    if (!title || !url || !category) {
      showToast('Shira izina, link, na category');
      return;
    }
    const list = loadLpLinks();
    list.push({ title, url, category, added: Date.now(), visits:0, favorite:false });
    saveLpLinks(list);
    lpForm.reset();
    showToast('Link yashizwe neza 🎉');
    renderLpList();
  });
}
  
  /* ========== Everyday spinner ========== */
  function initSpinner() {
    const spinnerData = [
      { word: 'Inspiration', desc: '“Ntucike intege; intambwe nto ni intambwe.”', img: 'youth-1.jpg' },
      { word: 'Urwenya', desc: '“Umuntu wese afite inkuru ye — tanga akanya.”', img: 'youth-2.jpg' },
      { word: 'Imigani', desc: '“Uko ugenda niko ugira.”', img: 'youth-3.jpg' },
      { word: 'Motivation', desc: '“Kora uyu munsi; ejo ni inyongera.”', img: 'youth-4.jpg' }
    ];
    let idx = 0;
    const spinnerWord = document.getElementById('spinnerWord');
    const spinnerDesc = document.getElementById('spinnerDesc');
    const spinnerImage = document.getElementById('spinnerImage') ? document.getElementById('spinnerImage').querySelector('img') : null;
    const nextBtn = document.getElementById('nextSpinner');

    function show(i) {
      const item = spinnerData[i % spinnerData.length];
      if (spinnerWord) spinnerWord.textContent = item.word;
      if (spinnerDesc) spinnerDesc.textContent = item.desc;
      if (spinnerImage) spinnerImage.src = item.img;
    }
    if (nextBtn) nextBtn.addEventListener('click', () => { idx++; show(idx); });
    show(0);
  }

  /* ========== QR update ========== */
  function updateQr() {
    const waQr = document.getElementById('waQr');
    if (waQr) {
      waQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/${WA_PHONE}`;
    }
  }

  /* ========== PWA install banner ========== */
  function initPwaBanner() {
    let deferredPrompt;
    const installBanner = document.getElementById("installBanner");
    const installBtn = document.getElementById("installBtn");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBanner) installBanner.classList.remove("hidden");
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log("User choice:", choiceResult.outcome);
        deferredPrompt = null;
        if (installBanner) installBanner.classList.add("hidden");
      });
    }
  }

  /* ========== Service Worker registration ========== */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then(reg => console.log("✅ Service Worker yanditswe:", reg.scope))
          .catch(err => console.error("❌ Service Worker ntikunze:", err));
      });
    }
  }

  /* ========== tawk.to status check ========== */
  function initTawkStatus() {
    const tawkStatus = document.getElementById('tawkStatus');
    window.addEventListener('load', function () {
      if (window.Tawk_API) {
        if (tawkStatus) tawkStatus.textContent = 'Online';
      } else {
        if (tawkStatus) tawkStatus.textContent = 'Offline';
      }
    });
  }

  /* ========== Init on DOM ready ========== */
  document.addEventListener('DOMContentLoaded', function () {
    ensurePlaceholders();
    initContactForm();
    initLpForm();
    renderLpList();
    initSpinner();
    updateQr();
    initPwaBanner();
    registerServiceWorker();
    initTawkStatus();

    // Accessibility: show focus ring when using Tab
    document.body.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
    }, { once: true });
  });

  /* ========== Optional UX polish ========== */
  // Shortcut "g" to focus WhatsApp CTA
  document.addEventListener('keydown', function (e) {
    if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const waBtn = document.getElementById('waBtn');
      if (waBtn) waBtn.focus();
    }
  });

})();
