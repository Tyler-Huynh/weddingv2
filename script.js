// ===== RSVP BACKEND CONFIG =====
// Paste your Google Apps Script Web App URL here.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwh8oIhjumjeQHTkv23JaR2K31YGMKwaSPbErWPMxWu0wWBtlSMxJhCr2EHmzOqXvtSnw/exec';

// ===== MOBILE NAV TOGGLE =====
const toggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

if (toggle && navList) {
  toggle.addEventListener('click', () => {
    navList.classList.toggle('open');
    const expanded = navList.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(expanded));
  });

  navList.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== HIGHLIGHT CURRENT PAGE IN NAV =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('nav a').forEach((a) => {
  const href = a.getAttribute('href');
  if (href === currentPage) {
    a.classList.add('active');
  }
});

// ===== CURSIVE MONOGRAM ANIMATION =====
const monogramLetters = document.querySelectorAll('.monogram-letter');

if (monogramLetters.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  monogramLetters.forEach((letter, i) => {
    if (reduceMotion) {
      letter.style.fillOpacity = '1';
      return;
    }

    const estimatedLength = letter.getComputedTextLength() * 2.6;
    letter.style.strokeDasharray = estimatedLength;
    letter.style.strokeDashoffset = estimatedLength;

    const startDelay = 400 + i * 500;

    requestAnimationFrame(() => {
      setTimeout(() => {
        letter.style.transition = 'stroke-dashoffset 1.3s ease, fill-opacity 0.8s ease 1.1s';
        letter.style.strokeDashoffset = '0';
        letter.style.fillOpacity = '1';
      }, startDelay);
    });
  });
}

// ===== GALLERY SPARKLES =====
const sparkleWrap = document.querySelector('.gallery-sparkle-wrap');

if (sparkleWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const sparkleCount = 16;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✦';
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.fontSize = `${8 + Math.random() * 14}px`;
    sparkle.style.animationDuration = `${2.5 + Math.random() * 3}s`;
    sparkle.style.animationDelay = `${Math.random() * 4}s`;
    sparkleWrap.appendChild(sparkle);
  }
}

// ===== GALLERY 3D TILT =====
const galleryTiles = document.querySelectorAll('.gallery-wall .tile');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (galleryTiles.length && !prefersReducedMotion) {
  galleryTiles.forEach((tile) => {
    tile.addEventListener('mousemove', (e) => {
      const rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;

      tile.style.transform = `perspective(700px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.04,1.04,1.04)`;
    });

    tile.addEventListener('mouseleave', () => {
      tile.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
}

// ===== RSVP SUBMISSION HELPER =====
function sendRsvpData(payload) {
  const body = JSON.stringify(payload);

  // Preferred: fire-and-forget submission
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
      const queued = navigator.sendBeacon(RSVP_ENDPOINT, blob);
      if (queued) return true;
    } catch (err) {
      // Fall through to fetch below
    }
  }

  // Fallback: no-cors fetch, do not wait for a response
  try {
    fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body
    });
    return true;
  } catch (err) {
    return false;
  }
}

// ===== RSVP FORM =====
const form = document.getElementById('rsvpForm');

if (form) {
  const msg = document.getElementById('formMsg');
  const guestCountInput = document.getElementById('guestCount');
  const additionalGuestsWrap = document.getElementById('additionalGuests');

  let guestData = [];

  function renderGuestFields(count) {
    const additionalCount = Math.max(0, count - 1);

    while (guestData.length < additionalCount) {
      guestData.push({ name: '', over21: 'yes' });
    }
    guestData.length = additionalCount;

    if (!additionalGuestsWrap) return;

    additionalGuestsWrap.innerHTML = '';

    for (let i = 0; i < additionalCount; i++) {
      const card = document.createElement('div');
      card.className = 'guest-card form-row';

      const label = document.createElement('label');
      label.textContent = `Guest ${i + 2} Name`;

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'guest-name-input';
      nameInput.id = `guestName${i}`;
      nameInput.name = `guestName${i}`;
      nameInput.placeholder = 'Full name';
      nameInput.value = guestData[i]?.name || '';
      nameInput.addEventListener('input', (e) => {
        guestData[i].name = e.target.value;
      });

      const over21Label = document.createElement('label');
      over21Label.textContent = '21 or older?';

      const over21Wrap = document.createElement('div');
      over21Wrap.className = 'radio-group';

      const yesLabel = document.createElement('label');
      const yesInput = document.createElement('input');
      yesInput.type = 'radio';
      yesInput.name = `guestOver21${i}`;
      yesInput.value = 'yes';
      yesInput.checked = guestData[i]?.over21 !== 'no';
      yesInput.addEventListener('change', (e) => {
        guestData[i].over21 = e.target.value;
      });

      const yesText = document.createElement('span');
      yesText.textContent = 'Yes';
      yesLabel.appendChild(yesInput);
      yesLabel.appendChild(yesText);

      const noLabel = document.createElement('label');
      const noInput = document.createElement('input');
      noInput.type = 'radio';
      noInput.name = `guestOver21${i}`;
      noInput.value = 'no';
      noInput.checked = guestData[i]?.over21 === 'no';
      noInput.addEventListener('change', (e) => {
        guestData[i].over21 = e.target.value;
      });

      const noText = document.createElement('span');
      noText.textContent = 'No';
      noLabel.appendChild(noInput);
      noLabel.appendChild(noText);

      over21Wrap.appendChild(yesLabel);
      over21Wrap.appendChild(noLabel);

      card.appendChild(label);
      card.appendChild(nameInput);
      card.appendChild(over21Label);
      card.appendChild(over21Wrap);

      additionalGuestsWrap.appendChild(card);
    }
  }

  if (guestCountInput) {
    renderGuestFields(parseInt(guestCountInput.value, 10) || 1);

    guestCountInput.addEventListener('input', () => {
      let count = parseInt(guestCountInput.value, 10);
      if (isNaN(count) || count < 1) count = 1;
      if (count > 20) count = 20;
      renderGuestFields(count);
    });
  }

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isValidPhone(value) {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }

  function setFieldValidity(input, errorEl, valid) {
    if (!input || !errorEl) return;

    if (valid) {
      input.classList.remove('invalid');
      errorEl.classList.remove('show');
    } else {
      input.classList.add('invalid');
      errorEl.classList.add('show');
    }
  }

  if (emailInput && emailError) {
    emailInput.addEventListener('input', () => {
      if (isValidEmail(emailInput.value)) {
        setFieldValidity(emailInput, emailError, true);
      }
    });
  }

  if (phoneInput && phoneError) {
    phoneInput.addEventListener('input', () => {
      if (isValidPhone(phoneInput.value)) {
        setFieldValidity(phoneInput, phoneError, true);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!emailInput || !phoneInput || !msg) return;

    const emailValid = isValidEmail(emailInput.value);
    const phoneValid = isValidPhone(phoneInput.value);

    setFieldValidity(emailInput, emailError, emailValid);
    setFieldValidity(phoneInput, phoneError, phoneValid);

    if (!emailValid || !phoneValid) {
      (emailValid ? phoneInput : emailInput).focus();
      return;
    }

    const submitBtn = form.querySelector('.rsvp-submit');
    const originalLabel = submitBtn ? submitBtn.textContent : 'Send RSVP';

    const primaryOver21Radio = form.querySelector('input[name="primaryOver21"]:checked');
    const attendingRadio = form.querySelector('input[name="attending"]:checked');

    const additionalGuests = guestData
      .filter((g) => g.name && g.name.trim())
      .map((g, i) => `Guest ${i + 2}: ${g.name} (21+: ${g.over21})`)
      .join(' | ');

    const payload = {
      timestamp: new Date().toISOString(),
      fullName: document.getElementById('fullName') ? document.getElementById('fullName').value : '',
      email: emailInput.value,
      phone: phoneInput.value,
      primaryOver21: primaryOver21Radio ? primaryOver21Radio.value : '',
      attending: attendingRadio ? attendingRadio.value : '',
      guestCount: guestCountInput ? guestCountInput.value : '1',
      additionalGuests,
      allergies: document.getElementById('allergies') ? document.getElementById('allergies').value : '',
      message: document.getElementById('message') ? document.getElementById('message').value : ''
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const sent = sendRsvpData(payload);

    if (sent) {
      msg.textContent = 'Thank you. Your reply has been recorded.';
      msg.style.color = '';
      msg.style.display = 'block';

      form.reset();
      guestData = [];

      if (guestCountInput) {
        renderGuestFields(1);
      }

      if (submitBtn) {
        submitBtn.textContent = 'Sent';
        submitBtn.disabled = false;
      }
    } else {
      msg.textContent = 'Something went wrong sending that. Please try again or reach out to us directly.';
      msg.style.color = 'var(--rust)';
      msg.style.display = 'block';

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
}
