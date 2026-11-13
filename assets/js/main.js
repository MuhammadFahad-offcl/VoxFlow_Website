/* VoxFlow website behaviour: hero chat demo, audit booking link, industry tabs,
   night-shift scroll story and savings calculator. No dependencies. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

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
        button.addEventListener('click', function () { autoplay = false; pick(item); });
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
    if (!form || !business || !task || !link) { return { setBusiness: function () {} }; }
    function update() {
      var lines = ["Hi VoxFlow, I'd like to book a free automation audit.", 'Business: ' + business.value];
      var detail = task.value.trim();
      if (detail) { lines.push('What takes the most time: ' + detail); }
      link.href = 'https://wa.me/923044782376?text=' + encodeURIComponent(lines.join('\n'));
    }
    form.addEventListener('input', update);
    update();
    return {
      setBusiness: function (name) {
        each(business.options, function (option) { if (option.text === name) { business.value = option.value; } });
        update();
      }
    };
  })();

  /* Industries: tabs, with arrow-key support. Without this script every panel stays visible. */
  (function () {
    var root = document.getElementById('inds');
    if (!root) { return; }
    var tabs = root.querySelectorAll('[role="tab"]');
    function select(tab, focus) {
      each(tabs, function (other) {
        var active = other === tab;
        other.setAttribute('aria-selected', String(active));
        other.tabIndex = active ? 0 : -1;
        var panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !active; }
        if (active && panel) { audit.setBusiness(panel.getAttribute('data-business')); }
      });
      if (focus) { tab.focus(); }
    }
    each(tabs, function (tab, index) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) { return; }
        event.preventDefault();
        select(tabs[(index + step + tabs.length) % tabs.length], true);
      });
    });
    select(tabs[0], false);
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

  /* Savings calculator */
  (function () {
    var form = document.getElementById('savings-form');
    if (!form) { return; }
    var RATES = {
      PKR: { prefix: 'Rs ', min: 500, max: 5000, step: 100, value: 1500 },
      AED: { prefix: 'AED ', min: 20, max: 200, step: 5, value: 60 }
    };
    var WEEKS_PER_YEAR = 52;
    var number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    var hours = document.getElementById('hours');
    var rate = document.getElementById('rate');
    var share = document.getElementById('share');
    var out = {
      hours: document.getElementById('hours-out'), rate: document.getElementById('rate-out'), share: document.getElementById('share-out'),
      monthly: document.getElementById('monthly'), yearly: document.getElementById('yearly')
    };
    function currency() {
      var chosen = form.querySelector('input[name="currency"]:checked');
      return RATES[chosen ? chosen.value : 'PKR'] || RATES.PKR;
    }
    function money(amount) { return currency().prefix + number.format(Math.round(amount)); }
    function update() {
      var yearly = Number(hours.value) * Number(rate.value) * (Number(share.value) / 100) * WEEKS_PER_YEAR;
      out.hours.textContent = hours.value + ' h';
      out.rate.textContent = money(Number(rate.value));
      out.share.textContent = share.value + '%';
      out.monthly.textContent = money(yearly / 12);
      out.yearly.textContent = money(yearly);
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
