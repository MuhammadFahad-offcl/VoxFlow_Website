/* VoxFlow website behaviour: hero chat demo, audit booking link, industry tabs,
   night-shift scroll story, mobile menu, quick contact bar and savings calculator. No dependencies. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* Vercel Web Analytics: queue calls until its script has loaded. Only event names are sent, never typed text. */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function track(name, data) { window.va('event', { name: name, data: data || {} }); }

  /* Hero demo: a scripted conversation the visitor can tap through. */
  (function () {
    var log = document.getElementById('chat-log');
    var options = document.getElementById('chat-options');
    var langButtons = { en: document.getElementById('lang-en'), ur: document.getElementById('lang-ur') };
    if (!log || !options) { return; }

    var COPY = {
      en: {
        greet: "Assalam o alaikum! I'm the clinic's assistant. How can I help?",
        book: 'Book an appointment', timings: 'Clinic timings', human: 'Talk to a person',
        askDay: 'Sure. Which day suits you?', days: ['Tomorrow', 'Day after', 'This week'],
        askSlot: 'Morning or evening clinic?', slots: ['Morning', 'Evening'],
        done: "You're booked. Show this token at the desk.",
        slipTitle: 'Appointment confirmed', token: 'Token', clinic: ' clinic', reminder: 'Reminder goes out before the visit',
        timingsReply: 'We are open Monday to Saturday, 5 to 9 PM. Shall I book you in?', yes: 'Yes, book me in', no: 'No, thanks',
        bye: "No problem. Message any time, I'm always here.",
        humanReply: "Of course. I've passed this chat to the front desk. They will reply when the clinic opens.",
        handover: 'Chat handed to staff', again: 'Start again'
      },
      ur: {
        greet: 'Assalam o alaikum! Main clinic ka assistant hoon. Kya madad kar sakta hoon?',
        book: 'Appointment book karni hai', timings: 'Clinic ki timings', human: 'Staff se baat karni hai',
        askDay: 'Ji zaroor. Kis din aana chahenge?', days: ['Kal', 'Parson', 'Is hafte'],
        askSlot: 'Subah ya shaam ka clinic?', slots: ['Subah', 'Shaam'],
        done: 'Aap ki appointment book ho gayi. Desk par yeh token dikha dein.',
        slipTitle: 'Appointment confirmed', token: 'Token', clinic: ' ka clinic', reminder: 'Visit se pehle reminder aa jayega',
        timingsReply: 'Clinic Peer se Hafta, shaam 5 se 9 baje tak khula hota hai. Appointment book kar doon?', yes: 'Ji, book kar dein', no: 'Nahi, shukriya',
        bye: 'Koi baat nahi. Jab chahein message karein, main hamesha yahan hoon.',
        humanReply: 'Ji bilkul. Maine aap ki chat front desk ko bhej di hai. Clinic khulte hi woh jawab denge.',
        handover: 'Chat staff ko de di gayi', again: 'Dobara shuru karein'
      }
    };

    var lang = 'en', timers = [], autoplay = true, picked = {};

    function later(fn, ms) { timers.push(setTimeout(fn, reduceMotion ? 0 : ms)); }
    function add(node) { log.appendChild(node); log.scrollTop = log.scrollHeight; return node; }
    function bubble(text, kind) {
      var el = document.createElement('div');
      el.className = 'bubble bubble--' + kind;
      el.textContent = text;
      return add(el);
    }
    function say(text, then) {
      var dots = document.createElement('div');
      dots.className = 'bubble bubble--agent bubble--typing';
      dots.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 3; i++) { dots.appendChild(document.createElement('i')); }
      add(dots);
      later(function () { dots.remove(); bubble(text, 'agent'); if (then) { then(); } }, 850);
    }
    function choose(list, autoIndex) {
      options.textContent = '';
      list.forEach(function (item) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip';
        button.textContent = item.label;
        button.addEventListener('click', function () {
          if (autoplay) { track('Demo used'); }
          autoplay = false;
          pick(item);
        });
        options.appendChild(button);
      });
      if (autoplay && typeof autoIndex === 'number') {
        later(function () { if (autoplay) { pick(list[autoIndex]); } }, 2400);
      }
    }
    function pick(item) {
      timers.forEach(clearTimeout); timers = [];
      options.textContent = '';
      bubble(item.label, 'user');
      later(item.go, 350);
    }
    function slip() {
      var t = COPY[lang];
      var el = document.createElement('div');
      el.className = 'slip';
      [['slip__title', t.slipTitle], ['slip__token', null], ['', picked.day + ' · ' + picked.slot + t.clinic], ['', t.reminder]].forEach(function (line) {
        var p = document.createElement('p');
        if (line[0]) { p.className = line[0]; }
        if (line[1] === null) {
          var label = document.createElement('span'); label.textContent = t.token + ' ';
          var num = document.createElement('span'); num.className = 'slip__num'; num.textContent = '14';
          p.appendChild(label); p.appendChild(num);
        } else { p.textContent = line[1]; }
        el.appendChild(p);
      });
      add(el);
    }
    function restartChoice() { return [{ label: COPY[lang].again, go: function () { start(false); } }]; }
    function askDay() {
      var t = COPY[lang];
      say(t.askDay, function () {
        choose(t.days.map(function (day) { return { label: day, go: function () { picked.day = day; askSlot(); } }; }), 0);
      });
    }
    function askSlot() {
      var t = COPY[lang];
      say(t.askSlot, function () {
        choose(t.slots.map(function (slot) { return { label: slot, go: function () { picked.slot = slot; finish(); } }; }), 1);
      });
    }
    function finish() { say(COPY[lang].done, function () { slip(); choose(restartChoice()); }); }
    function timings() {
      var t = COPY[lang];
      say(t.timingsReply, function () {
        choose([
          { label: t.yes, go: askDay },
          { label: t.no, go: function () { say(t.bye, function () { choose(restartChoice()); }); } }
        ]);
      });
    }
    function human() {
      var t = COPY[lang];
      say(t.humanReply, function () { bubble(t.handover, 'note'); choose(restartChoice()); });
    }
    function start(withAutoplay) {
      var t = COPY[lang];
      timers.forEach(clearTimeout); timers = [];
      autoplay = withAutoplay && !reduceMotion;
      picked = {};
      log.textContent = '';
      options.textContent = '';
      log.setAttribute('lang', lang === 'ur' ? 'ur-Latn' : 'en');
      say(t.greet, function () {
        choose([{ label: t.book, go: askDay }, { label: t.timings, go: timings }, { label: t.human, go: human }], 0);
      });
    }
    Object.keys(langButtons).forEach(function (code) {
      var button = langButtons[code];
      if (!button) { return; }
      button.addEventListener('click', function () {
        lang = code;
        Object.keys(langButtons).forEach(function (other) { langButtons[other].setAttribute('aria-pressed', String(other === code)); });
        start(false);
      });
    });
    start(true);
  })();

  /* Audit booking: the form writes the visitor's own WhatsApp message into the link. */
  var audit = (function () {
    var form = document.getElementById('audit-form');
    var business = document.getElementById('audit-business');
    var task = document.getElementById('audit-task');
    var link = document.getElementById('audit-link');
    var email = document.getElementById('audit-email');
    if (!form || !business || !task || !link) { return { setBusiness: function () {} }; }
    function update() {
      var lines = ["Hi VoxFlow, I'd like to book a free automation audit."];
      /* The business line is added only once the visitor has chosen one, so nothing is guessed for them. */
      if (business.value) { lines.push('Business: ' + business.value); }
      var detail = task.value.trim();
      if (detail) { lines.push('What takes the most time: ' + detail); }
      link.href = 'https://wa.me/923044782376?text=' + encodeURIComponent(lines.join('\n'));
      if (email) {
        email.href = 'mailto:muhammadfahad.offcl@gmail.com?subject=' + encodeURIComponent('Free automation audit request') +
          '&body=' + encodeURIComponent("Hi VoxFlow,\n\nI'd like to book a free automation audit.\n\nMy business: " + (business.value || '') +
          '\nWhat takes my team the most time: ' + detail + '\n\nThanks');
      }
    }
    form.addEventListener('input', update);
    link.addEventListener('click', function () { track('Audit WhatsApp click', { business: business.value || 'not chosen' }); });
    update();
    return {
      setBusiness: function (name) {
        each(business.options, function (option) { if (option.text === name) { business.value = option.value; } });
        update();
      }
    };
  })();

  /* Callback request: shown only when the server says the lead endpoint is configured. */
  (function () {
    var form = document.getElementById('callback-form');
    if (!form || typeof window.fetch !== 'function') { return; }
    var status = document.getElementById('callback-status');
    var button = document.getElementById('callback-submit');
    var name = document.getElementById('callback-name');
    var phone = document.getElementById('callback-phone');
    var trap = document.getElementById('callback-website');
    var business = document.getElementById('audit-business');
    var task = document.getElementById('audit-task');
    var shownAt = 0;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'callback__status' + (kind ? ' is-' + kind : '');
    }

    fetch('/api/lead', { headers: { Accept: 'application/json' } })
      .then(function (response) { return response.ok ? response.json() : { enabled: false }; })
      .then(function (info) {
        if (info && info.enabled === true) { form.hidden = false; shownAt = Date.now(); }
      })
      .catch(function () {
        /* Endpoint unreachable: the form stays hidden and WhatsApp remains the way to book. */
      });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var cleanName = name.value.trim();
      var digits = phone.value.replace(/\D/g, '');
      if (cleanName.length < 2) { say('Please enter your name.', 'error'); name.focus(); return; }
      if (digits.length < 7 || digits.length > 15) { say('Please enter a phone number with 7 to 15 digits.', 'error'); phone.focus(); return; }

      button.disabled = true;
      say('Sending...');
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: phone.value.trim(),
          business: business ? business.value : '',
          task: task ? task.value.trim() : '',
          website: trap.value,
          elapsed: Date.now() - shownAt
        })
      })
        .then(function (response) {
          if (!response.ok) { throw new Error('HTTP ' + response.status); }
          return response.json();
        })
        .then(function () {
          form.reset();
          say('Thank you. We will contact you soon.', 'ok');
          track('Callback request');
        })
        .catch(function () {
          say('That did not send. Please try again, or use the WhatsApp button above.', 'error');
        })
        .then(function () { button.disabled = false; });
    });
  })();

  /* Industries: tabs, with arrow-key support. Without this script every panel stays visible. */
  (function () {
    var root = document.getElementById('inds');
    if (!root) { return; }
    var tabs = root.querySelectorAll('[role="tab"]');
    /* chosen is true only when the visitor picked the tab. The first tab shown on load must not
       fill in the audit form, or a visitor who never opened this section would send "Clinic". */
    function select(tab, focus, chosen) {
      each(tabs, function (other) {
        var active = other === tab;
        other.setAttribute('aria-selected', String(active));
        other.tabIndex = active ? 0 : -1;
        var panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !active; }
        if (active && panel && chosen) { audit.setBusiness(panel.getAttribute('data-business')); }
      });
      if (focus) { tab.focus(); }
    }
    each(tabs, function (tab, index) {
      tab.addEventListener('click', function () { select(tab, false, true); });
      tab.addEventListener('keydown', function (event) {
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) { return; }
        event.preventDefault();
        select(tabs[(index + step + tabs.length) % tabs.length], true, true);
      });
    });
    select(tabs[0], false, false);
  })();

  /* Night shift: the step crossing the middle of the screen sets the clock and the sky. */
  (function () {
    var section = document.getElementById('night-shift');
    if (!section || !('IntersectionObserver' in window)) { return; }
    var clock = document.getElementById('shift-time');
    var caption = document.getElementById('shift-caption');
    var orb = document.getElementById('shift-orb');
    var steps = section.querySelectorAll('.shift__step');
    section.classList.add('is-live');
    function activate(step) {
      each(steps, function (other) { other.classList.toggle('is-active', other === step); });
      section.setAttribute('data-phase', step.getAttribute('data-phase'));
      clock.textContent = step.getAttribute('data-time');
      caption.textContent = step.getAttribute('data-caption');
      orb.style.setProperty('--orb-x', step.getAttribute('data-x'));
      orb.style.setProperty('--orb-y', step.getAttribute('data-y'));
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { activate(entry.target); } });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    each(steps, function (step) { observer.observe(step); });
  })();

  /* Mobile menu: a button that opens the section links and contact buttons. Escape or a link click closes it. */
  (function () {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) { return; }
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.documentElement.classList.toggle('menu-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) { setOpen(false); } });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 62rem)');
      var close = function () { if (wide.matches) { setOpen(false); } };
      if (wide.addEventListener) { wide.addEventListener('change', close); }
    }
  })();

  /* Click tracking: any link with a data-track name sends that event name only, never typed text. */
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-track]');
    if (link) { track(link.getAttribute('data-track')); }
  });

  /* Sticky WhatsApp bar: hidden while the hero buttons or the audit section are on screen, so two booking buttons never sit together. */
  (function () {
    var bar = document.getElementById('wa-bar');
    var hero = document.querySelector('.hero .actions');
    var audit = document.getElementById('audit');
    if (!bar) { return; }
    if (!('IntersectionObserver' in window)) { return; }
    var covered = { hero: true, audit: false };
    function apply() {
      var hide = covered.hero || covered.audit;
      bar.classList.toggle('is-hidden', hide);
      bar.tabIndex = hide ? -1 : 0;
    }
    function watch(node, key, threshold) {
      if (!node) { covered[key] = false; return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { covered[key] = entry.isIntersecting; });
        apply();
      }, { threshold: threshold }).observe(node);
    }
    watch(hero, 'hero', 0.01);
    watch(audit, 'audit', 0.15);
    apply();
  })();

  /* Savings calculator */
  (function () {
    var form = document.getElementById('savings-form');
    if (!form) { return; }
    /* Starting values are a plain front-desk hour. Higher-paid staff or an owner's own time can be set with the slider. */
    var RATES = {
      PKR: { prefix: 'Rs ', min: 100, max: 5000, step: 50, value: 400 },
      AED: { prefix: 'AED ', min: 10, max: 200, step: 5, value: 30 }
    };
    var WEEKS_PER_YEAR = 52;
    var number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    var hours = document.getElementById('hours');
    var rate = document.getElementById('rate');
    var share = document.getElementById('share');
    var out = {
      hours: document.getElementById('hours-out'), rate: document.getElementById('rate-out'), share: document.getElementById('share-out'),
      monthly: document.getElementById('monthly'), yearly: document.getElementById('yearly'),
      plan: document.getElementById('plan-note')
    };
    /* Published monthly plan range, in rupees. Keep in step with the pricing line and the cost FAQ. */
    var PLAN = { min: 20000, max: 30000 };
    function currency() {
      var chosen = form.querySelector('input[name="currency"]:checked');
      return RATES[chosen ? chosen.value : 'PKR'] || RATES.PKR;
    }
    function money(amount) { return currency().prefix + number.format(Math.round(amount)); }
    var waLink = document.getElementById('calc-wa');
    function update() {
      var yearly = Number(hours.value) * Number(rate.value) * (Number(share.value) / 100) * WEEKS_PER_YEAR;
      out.hours.textContent = hours.value + ' h';
      out.rate.textContent = money(Number(rate.value));
      out.share.textContent = share.value + '%';
      out.monthly.textContent = money(yearly / 12);
      out.yearly.textContent = money(yearly);
      updatePlan(yearly / 12);
      if (waLink) {
        var unit = currency().prefix.trim() === 'Rs' ? 'Rs ' : 'AED ';
        waLink.href = 'https://wa.me/923044782376?text=' + encodeURIComponent(
          'Hi VoxFlow, I used your savings calculator: ' + hours.value + ' hours a week of manual work at ' + unit + number.format(Number(rate.value)) +
          ' an hour, ' + share.value + '% of it automatable, about ' + money(yearly / 12) + ' a month. I\'d like a free audit.');
      }
    }
    /* Shows the break-even in hours, so the saving is read against the plan and not as free money. PKR only: no UAE price is published. */
    function updatePlan(monthly) {
      if (!out.plan) { return; }
      var chosen = form.querySelector('input[name="currency"]:checked');
      if (chosen && chosen.value !== 'PKR') { out.plan.textContent = ''; return; }
      var perHour = Number(rate.value) * WEEKS_PER_YEAR / 12;
      var low = Math.max(1, Math.round(PLAN.min / perHour));
      var high = Math.max(low, Math.round(PLAN.max / perHour));
      var text = 'For scale: the monthly plan is Rs ' + number.format(PLAN.min) + ' to ' + number.format(PLAN.max) + '. At ' + money(Number(rate.value)) + ' an hour, it is covered once an agent takes over about ' + (low === high ? low : low + ' to ' + high) + ' hours a week.';
      if (monthly < PLAN.min) { text += ' Your numbers are below that, so the audit is where we check whether it is worth it.'; }
      out.plan.textContent = text;
    }
    function switchCurrency() {
      var c = currency();
      rate.min = c.min; rate.max = c.max; rate.step = c.step; rate.value = c.value;
      update();
    }
    form.addEventListener('input', function (event) {
      if (event.target.name === 'currency') { switchCurrency(); } else { update(); }
    });
    update();
  })();
})();
