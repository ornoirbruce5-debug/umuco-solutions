// Replace phone with your WhatsApp number (no +, country code first)
const WA_PHONE = '25771633859'; // <-- replace if needed
const OWNER_EMAIL = 'arakazabruce2@gmail.com'; // mailto target

document.addEventListener('DOMContentLoaded', function(){
  // Year
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  // Contact form: mailto + WhatsApp autoresponder behavior
  const form = document.getElementById('contactForm');
  const autoReplyNotice = document.getElementById('autoReplyNotice');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Umukiriya';
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // 1) Open WhatsApp chat with prefilled message (user will send)
    const waText = encodeURIComponent(`Izina: ${name}\nEmail: ${email}\nUbutumwa: ${message}`);
    const waUrl = `https://wa.me/${WA_PHONE}?text=${waText}`;
    window.open(waUrl, '_blank');

    // 2) Open mailto to owner (simple fallback autoresponder)
    const subject = encodeURIComponent(`Ubutumwa - ${name}`);
    const body = encodeURIComponent(`Izina: ${name}\nEmail: ${email}\nUbutumwa:\n${message}`);
    const mailto = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    // open mailto in new tab (some browsers block; it's a fallback)
    window.open(mailto, '_blank');

    // 3) Show client-side auto-reply notice
    if(autoReplyNotice) {
      autoReplyNotice.classList.remove('hidden');
      setTimeout(()=> autoReplyNotice.classList.add('hidden'), 8000);
    }

    // reset form
    form.reset();
  });

  // LP links add
  const lpForm = document.getElementById('lpAddForm');
  const lpList = document.getElementById('lpList');
  if(lpForm){
    lpForm.addEventListener('submit', function(e){
      e.preventDefault();
      const title = document.getElementById('lpTitle').value.trim();
      const url = document.getElementById('lpUrl').value.trim();
      if(!title || !url) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.textContent = title;
      li.appendChild(a);
      lpList.appendChild(li);
      lpForm.reset();
    });
  }

  // Everyday spinner (words, jokes, proverbs)
  const spinnerData = [
    {word:'Inspiration', desc:'“Ntucike intege; intambwe nto ni intambwe.”', img:'youth-1.jpg'},
    {word:'Urwenya', desc:'“Umuntu wese afite inkuru ye — tanga akanya.”', img:'youth-2.jpg'},
    {word:'Imigani', desc:'“Uko ugenda niko ugira.”', img:'youth-3.jpg'},
    {word:'Motivation', desc:'“Kora uyu munsi; ejo ni inyongera.”', img:'youth-4.jpg'}
  ];
  let spinnerIndex = 0;
  const spinnerWord = document.getElementById('spinnerWord');
  const spinnerDesc = document.getElementById('spinnerDesc');
  const spinnerImage = document.getElementById('spinnerImage').querySelector('img');
  const nextSpinner = document.getElementById('nextSpinner');
  function showSpinner(i){
    const item = spinnerData[i % spinnerData.length];
    spinnerWord.textContent = item.word;
    spinnerDesc.textContent = item.desc;
    spinnerImage.src = item.img;
  }
  if(nextSpinner){
    nextSpinner.addEventListener('click', function(){
      spinnerIndex++;
      showSpinner(spinnerIndex);
    });
  }
  showSpinner(0);

  // LP QR: update QR image src if phone changes
  const waQr = document.getElementById('waQr');
  if(waQr){
    waQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/${WA_PHONE}`;
  }

  // PWA install prompt handling
  let deferredPrompt;
  const pwaPrompt = document.getElementById('pwaPrompt');
  const installBtn = document.getElementById('installBtn');
  const dismissPwa = document.getElementById('dismissPwa');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(pwaPrompt) pwaPrompt.classList.remove('hidden');
  });
  if(installBtn){
    installBtn.addEventListener('click', async () => {
      if(!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if(pwaPrompt) pwaPrompt.classList.add('hidden');
    });
  }
  if(dismissPwa){
    dismissPwa.addEventListener('click', ()=> pwaPrompt.classList.add('hidden'));
  }

  // Service worker registration for PWA
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
  }

  // tawk.to status: simple check (if script loaded, set online)
  window.addEventListener('load', function(){
    const tawkStatus = document.getElementById('tawkStatus');
    if(window.Tawk_API) {
      if(tawkStatus) tawkStatus.textContent = 'Online';
    } else {
      if(tawkStatus) tawkStatus.textContent = 'Offline';
    }
  });
});
