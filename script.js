// ===== RSVP BACKEND CONFIG =====
// Paste your Google Apps Script Web App URL here once you've deployed it (see setup guide).
// Until you do, the form will just show the confirmation message locally without saving anywhere.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwh8oIhjumjeQHTkv23JaR2K31YGMKwaSPbErWPMxWu0wWBtlSMxJhCr2EHmzOqXvtSnw/exec';

// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
if (toggle && navList) {
  toggle.addEventListener('click', () => {
    navList.classList.toggle('open');
    const expanded = navList.classList.contains('open');
    toggle.setAttribute('aria-expanded', expanded);
  });
  navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navList.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Highlight the current page in the nav
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage) a.classList.add('active');
});

// Cursive monogram — draws itself like handwriting over the marquee, then fills in,
// with each letter stepping in after the last like a staircase.
const monogramLetters = document.querySelectorAll('.monogram-letter');
if (monogramLetters.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  monogramLetters.forEach((letter, i) => {
    if (reduceMotion) {
      letter.style.fillOpacity = '1';
      return;
    }
    // getComputedTextLength gives the advance width; scale it up since the
    // actual stroked outline of a cursive glyph is longer than its advance width.
    const estimatedLength = letter.getComputedTextLength() * 2.6;
    letter.style.strokeDasharray = estimatedLength;
    letter.style.strokeDashoffset = estimatedLength;

    const startDelay = 400 + i * 500; // each letter starts after the previous one

    requestAnimationFrame(() => {
      setTimeout(() => {
        letter.style.transition = 'stroke-dashoffset 1.3s ease, fill-opacity 0.8s ease 1.1s';
        letter.style.strokeDashoffset = '0';
        letter.style.fillOpacity = '1';
      }, startDelay);
    });
  });
}

// Gallery sparkles — a few twinkling accents scattered over the photo wall
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

// Gallery 3D tilt — each card tilts toward the cursor individually on hover
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

// RSVP form (only present on rsvp.html)
const form = document.getElementById('rsvpForm');
if (form) {
  const msg = document.getElementById('formMsg');
  const guestCountInput = document.getElementById('guestCount');
  const additionalGuestsWrap = document.getElementById('additionalGuests');

  // Keeps track of already-entered names/ages so they survive when the count changes
  let guestData = [];

  function renderGuestFields(count) {
    const additionalCount = Math.max(0, count - 1); // guest 1 is the primary contact

    // Resize the stored data array to match, preserving existing entries
    while (guestData.length < additionalCount) guestData.push({ name: '', age: '' });
    guestData.length = additionalCount;

    additionalGuestsWrap.innerHTML = '';
    if (additionalCount === 0) return;

    const label = document.createElement('p');
    label.className = 'rsvp-section-label';
    label.textContent = 'Additional Guests';
    additionalGuestsWrap.appendChild(label);

    for (let i = 0; i < additionalCount; i++) {
      const card = document.createElement('div');
      card.className = 'guest-card';
      card.innerHTML = `
        <h4>Guest ${i + 2}</h4>
        <div class="two-col">
          <div class="form-row">
            <label for="guestName${i}">Full Name</label>
            <input type="text" id="guestName${i}" placeholder="Guest name" value="${guestData[i].name}">
          </div>
          <div class="form-row">
            <label for="guestAge${i}">Age</label>
            <input type="number" id="guestAge${i}" min="0" max="120" placeholder="Age" value="${guestData[i].age}">
          </div>
        </div>
      `;
      card.querySelector(`#guestName${i}`).addEventListener('input', (e) => {
        guestData[i].name = e.target.value;
      });
      card.querySelector(`#guestAge${i}`).addEventListener('input', (e) => {
        guestData[i].age = e.target.value;
      });
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
    // Reasonable general-purpose email check (not exhaustive RFC 5322, but catches real mistakes)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isValidPhone(value) {
    const digitsOnly = value.replace(/\D/g, '');
    // Accepts formatting like spaces, dashes, parens, +country code — just checks digit count
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }

  function setFieldValidity(input, errorEl, valid) {
    if (valid) {
      input.classList.remove('invalid');
      errorEl.classList.remove('show');
    } else {
      input.classList.add('invalid');
      errorEl.classList.add('show');
    }
  }

  // Clear the error as soon as the person starts fixing it
  emailInput.addEventListener('input', () => {
    if (isValidEmail(emailInput.value)) setFieldValidity(emailInput, emailError, true);
  });
  phoneInput.addEventListener('input', () => {
    if (isValidPhone(phoneInput.value)) setFieldValidity(phoneInput, phoneError, true);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValid = isValidEmail(emailInput.value);
    const phoneValid = isValidPhone(phoneInput.value);
    setFieldValidity(emailInput, emailError, emailValid);
    setFieldValidity(phoneInput, phoneError, phoneValid);

    if (!emailValid || !phoneValid) {
      (emailValid ? phoneInput : emailInput).focus();
      return;
    }

    const submitBtn = form.querySelector('.rsvp-submit');
    const originalLabel = submitBtn.textContent;

    // Not configured yet — just show the confirmation locally so the form still feels done.
    if (!RSVP_ENDPOINT || RSVP_ENDPOINT.indexOf('PASTE_YOUR') !== -1) {
      msg.textContent = 'Thank you! Your reply has been recorded with love. 🌿';
      msg.style.color = '';
      msg.style.display = 'block';
      submitBtn.textContent = 'Sent';
      return;
    }

    const additionalGuests = guestData
      .filter(g => g.name || g.age)
      .map((g, i) => `Guest ${i + 2}: ${g.name || '(no name)'}${g.age ? ` (age ${g.age})` : ''}`)
      .join(' | ');

    const payload = {
      timestamp: new Date().toISOString(),
      fullName: document.getElementById('fullName').value,
      email: emailInput.value,
      phone: phoneInput.value,
      primaryAge: document.getElementById('primaryAge').value,
      attending: form.querySelector('input[name="attending"]:checked').value,
      guestCount: guestCountInput.value,
      additionalGuests,
      message: document.getElementById('message').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.result === 'success') {
          msg.textContent = 'Thank you! Your reply has been recorded with love. 🌿';
          msg.style.color = '';
          msg.style.display = 'block';
          submitBtn.textContent = 'Sent';
          form.reset();
        } else {
          throw new Error((data && data.error) || 'Unknown error');
        }
      })
      .catch(() => {
        msg.textContent = "Something went wrong sending that — please try again, or reach out to us directly.";
        msg.style.color = 'var(--rust)';
        msg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
}