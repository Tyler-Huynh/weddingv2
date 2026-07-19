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
      if (count > 8) count = 8;
      renderGuestFields(count);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.style.display = 'block';
    form.querySelector('.rsvp-submit').textContent = 'Sent';
  });
}