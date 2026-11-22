/* =============================================================
   script.js  -  all the JavaScript for the website

   This ONE file is loaded by all 3 pages. Each feature is a small
   function, and each function first checks "is the element I need on
   this page?" - if not, it simply stops. That way the same file can
   be shared safely.

   What this file does:
     1. Mobile menu         - hamburger button opens/closes the menu
     2. Active nav link     - underlines the page you are on
     3. Header border       - adds a line under the header once you scroll
     4. Footer year         - writes the current year automatically
     5. Project cards       - slide in when scrolled into view
     6. Lightbox            - click a project to see its big image
     7. Number counters     - the stats on the About page count up
     8. Contact form        - checks the fields, then opens your email app
   ============================================================= */

'use strict'; // "strict mode" makes JavaScript warn you about common mistakes


/* -------------------------------------------------------------
   SETTINGS  -  change this before you publish!
   When someone sends the contact form, their email app opens with a
   message addressed to this email.
   ------------------------------------------------------------- */
const CONTACT_EMAIL = 'your-email@example.com';


/* -------------------------------------------------------------
   START-UP
   "DOMContentLoaded" fires when the HTML page has been read by the
   browser, so all the elements exist and we can safely find them.
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  highlightActiveLink();
  setupHeaderBorder();
  setFooterYear();
  setupProjectReveal();
  setupLightbox();
  setupCounters();
  setupContactForm();
});


/* -------------------------------------------------------------
   Small helper: has the user asked their device to reduce motion?
   (Some people get dizzy from animations, so we respect that.)
   Returns true or false.
   ------------------------------------------------------------- */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* =============================================================
   1. MOBILE MENU
   On phones the links are hidden. Tapping the hamburger button adds
   the CSS class "open" to the menu, and the CSS shows it.
   ============================================================= */
function setupMobileMenu() {
  const toggle = document.querySelector('.nav-toggle'); // the hamburger button
  const menu = document.getElementById('nav-menu');     // the list of links

  if (!toggle || !menu) return; // not on this page -> stop

  // Opens or closes the menu. "isOpen" is true or false.
  function setOpen(isOpen) {
    menu.classList.toggle('open', isOpen);                   // add/remove class "open"
    toggle.setAttribute('aria-expanded', String(isOpen));    // tells screen readers the state
  }

  // Tap the hamburger -> flip between open and closed
  toggle.addEventListener('click', () => {
    setOpen(!menu.classList.contains('open'));
  });

  // Tap any link inside the menu -> close it
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Press the Escape key -> close it
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  // If the window becomes wide (e.g. phone turned sideways), close the menu
  window.matchMedia('(min-width: 769px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}


/* =============================================================
   2. ACTIVE NAV LINK
   Each page's <body> has data-page="home" / "about" / "contact", and
   each nav link has the same data-page value. We find the matching
   link and mark it, so it keeps its blue underline.
   ============================================================= */
function highlightActiveLink() {
  const currentPage = document.body.dataset.page; // reads data-page from <body>
  if (!currentPage) return;

  const link = document.querySelector(`.nav-menu a[data-page="${currentPage}"]`);
  if (link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page'); // for screen readers
  }
}


/* =============================================================
   3. HEADER BORDER ON SCROLL
   The header sticks to the top. Once you scroll down a little we add
   the class "scrolled", and the CSS draws a thin line under it.
   ============================================================= */
function setupHeaderBorder() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function update() {
    // window.scrollY = how many pixels the page has been scrolled
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  update(); // run once now (in case the page loads already scrolled)
  window.addEventListener('scroll', update, { passive: true });
}


/* =============================================================
   4. FOOTER YEAR
   Puts the current year into <span id="year"> so you never have to
   update the copyright year by hand.
   ============================================================= */
function setFooterYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}


/* =============================================================
   5. PROJECT CARDS SLIDE IN
   An "IntersectionObserver" tells us when an element enters the
   visible part of the screen. When a card does, we add the class
   "visible" and the CSS fades/slides it in.
   ============================================================= */
function setupProjectReveal() {
  const cards = document.querySelectorAll('.project-card');

  // Skip the effect if there are no cards, the browser is too old,
  // or the user prefers reduced motion. The cards just stay visible.
  if (!cards.length || !('IntersectionObserver' in window) || prefersReducedMotion()) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // only animate once per card
      }
    });
  }, { threshold: 0.15 }); // trigger when 15% of the card is visible

  cards.forEach((card, index) => {
    card.classList.add('reveal'); // starts hidden (see style.css)
    // A tiny delay per card, so they appear one after another.
    // "index % 3" restarts the delay for each row of 3 cards.
    card.style.transitionDelay = `${(index % 3) * 100}ms`;
    observer.observe(card);
  });
}


/* =============================================================
   6. LIGHTBOX  (pop-up viewer for the project images)
   Click a project's image or its "View Project" button and the full
   screenshot opens on a dark overlay. Use the arrows (or the
   keyboard's left/right keys) to move between the 5 projects.
   Esc or clicking the dark background closes it.
   ============================================================= */
function setupLightbox() {
  const cards = Array.from(document.querySelectorAll('.project-card'));
  if (!cards.length) return;

  // ---- Build the lightbox HTML and add it to the page ----
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true; // hidden until a project is opened
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Project preview');
  box.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close preview">&times;</button>
    <button type="button" class="lightbox-nav" data-dir="-1" aria-label="Previous project">&#8249;</button>
    <figure>
      <img src="" alt="" />
      <figcaption></figcaption>
    </figure>
    <button type="button" class="lightbox-nav" data-dir="1" aria-label="Next project">&#8250;</button>
  `;
  document.body.appendChild(box);

  // Grab the pieces we need to change
  const bigImage = box.querySelector('img');
  const caption = box.querySelector('figcaption');
  const closeButton = box.querySelector('.lightbox-close');
  const navButtons = box.querySelectorAll('.lightbox-nav');
  const focusable = [closeButton, ...navButtons]; // used to keep Tab inside the box

  let currentIndex = 0;        // which project is showing (0 = first)
  let previouslyFocused = null; // remembers what had focus, so we can give it back

  // Show project number "index" in the lightbox
  function show(index) {
    // The % trick loops around: after the last project comes the first
    currentIndex = (index + cards.length) % cards.length;

    const card = cards[currentIndex];
    const image = card.querySelector('img');

    bigImage.src = image.src;
    bigImage.alt = image.alt;
    caption.textContent =
      `${card.querySelector('h3').textContent} (${currentIndex + 1} of ${cards.length})`;
  }

  function open(index) {
    previouslyFocused = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add('no-scroll'); // stop the page scrolling behind
    closeButton.focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove('no-scroll');
    if (previouslyFocused) previouslyFocused.focus(); // return focus to the button that opened it
  }

  // ---- Click listeners ----
  cards.forEach((card, index) => {
    // The card's "View Project" button and its image both open the lightbox
    card.querySelector('[data-open]').addEventListener('click', () => open(index));
    card.querySelector('img').addEventListener('click', () => open(index));
  });

  closeButton.addEventListener('click', close);

  navButtons.forEach((button) => {
    // data-dir is "-1" (previous) or "1" (next); Number() turns the text into a number
    button.addEventListener('click', () => show(currentIndex + Number(button.dataset.dir)));
  });

  // Clicking the dark background (but not the image) closes it
  box.addEventListener('click', (event) => {
    if (event.target === box) close();
  });

  // ---- Keyboard support (only while the lightbox is open) ----
  document.addEventListener('keydown', (event) => {
    if (box.hidden) return;

    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(currentIndex - 1);
    if (event.key === 'ArrowRight') show(currentIndex + 1);

    // Keep the Tab key cycling inside the lightbox instead of the page behind it
    if (event.key === 'Tab') {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}


/* =============================================================
   7. NUMBER COUNTERS  (About page)
   The stats (2+, 5+, 5+, 2+) count up from 0 when they scroll into
   view. Each number in the HTML has:
     data-target="5"   -> the number to count up to
     data-suffix="+"   -> text added after the number
   ============================================================= */
function setupCounters() {
  const counters = document.querySelectorAll('.stat-number');

  if (!counters.length || !('IntersectionObserver' in window) || prefersReducedMotion()) return;

  const DURATION = 1200; // how long the count takes, in milliseconds

  function animate(element) {
    const target = Number(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const startTime = performance.now(); // the moment the animation starts

    // This function runs on every screen refresh until the count is done
    function step(now) {
      // progress goes from 0 (just started) to 1 (finished)
      const progress = Math.min((now - startTime) / DURATION, 1);

      // "ease out": starts fast, slows down at the end
      const eased = 1 - Math.pow(1 - progress, 3);

      element.textContent = Math.round(target * eased) + suffix;

      if (progress < 1) requestAnimationFrame(step); // not finished -> run again
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target); // count only once
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => observer.observe(counter));
}


/* =============================================================
   8. CONTACT FORM
   Checks each field when "Send Message" is pressed.
   - If something is wrong, an error shows under that field.
   - If everything is fine, it opens the visitor's email app with the
     message already written, addressed to CONTACT_EMAIL (top of file).

   NOTE: a website with no server cannot send email by itself. This
   "mailto:" method works without any server. Later you can switch to
   a form service (like Formspree) or your own backend.
   ============================================================= */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return; // not the contact page -> stop

  const status = document.getElementById('form-status');

  // One rule per field. A rule returns "" if the value is OK,
  // or an error message (text) if it is not.
  const rules = {
    name: (value) =>
      value.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).',

    email: (value) =>
      // This pattern means: something @ something . something (no spaces)
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.',

    message: (value) =>
      value.trim().length >= 10 ? '' : 'Your message should be at least 10 characters.',
  };

  // Checks ONE field and shows/clears its error. Returns true if valid.
  function validateField(fieldName) {
    const input = form.elements[fieldName];
    const errorSpan = form.querySelector(`[data-error-for="${fieldName}"]`);
    const message = rules[fieldName](input.value);

    errorSpan.textContent = message;                              // show (or clear) the text
    input.setAttribute('aria-invalid', message ? 'true' : 'false'); // CSS turns the border red
    return message === '';
  }

  // While typing, remove the error as soon as the field becomes valid
  Object.keys(rules).forEach((fieldName) => {
    form.elements[fieldName].addEventListener('input', () => {
      if (form.elements[fieldName].getAttribute('aria-invalid') === 'true') {
        validateField(fieldName);
      }
    });
  });

  // When the form is submitted
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // stop the page from reloading
    status.textContent = '';

    // Check every field. We don't stop at the first error, so all errors show at once.
    const results = Object.keys(rules).map((fieldName) => ({
      fieldName,
      valid: validateField(fieldName),
    }));

    const firstInvalid = results.find((result) => !result.valid);
    if (firstInvalid) {
      form.elements[firstInvalid.fieldName].focus(); // jump to the first problem
      return;
    }

    // ---- All fields are valid: build the email ----
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    const subject = `Website message from ${name}`;
    const body = `${message}\n\n- ${name} (${email})`;

    // encodeURIComponent makes the text safe to put inside a link
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = 'Thanks! Opening your email app...';
    form.reset();
    window.location.href = mailto; // this opens the email app
  });
}
