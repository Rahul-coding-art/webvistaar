/* =========================================================
   TECHMITRA — GLASS UI INTERACTIONS
========================================================= */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var CONTACT_EMAIL = "contact.webvistaar@gmail.com";

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(message) {
    var el = $("#tmToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "tmToast";
      el.className = "toast glass glass--strong";
      el.setAttribute("role", "status");
      el.innerHTML = '<i class="bi bi-check2-circle"></i><span></span>';
      document.body.appendChild(el);
    }
    el.querySelector("span").textContent = message;
    requestAnimationFrame(function () {
      el.classList.add("show");
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 4200);
  }

  /* ---------- Intro ---------- */
  function initIntro() {
    requestAnimationFrame(function () {
      setTimeout(function () {
        document.body.classList.add("is-ready");
      }, 60);
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $("#siteHeader");
    var progress = $("#scrollProgress");
    var toTop = $("#toTop");
    var ticking = false;

    function update() {
      var y = window.scrollY;
      var max = doc.scrollHeight - window.innerHeight;
      if (header) header.classList.toggle("is-scrolled", y > 30);
      if (progress)
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      if (toTop) toTop.classList.toggle("is-visible", y > 800);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );
    update();

    if (toTop)
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var nav = $("#mainNav");
    var backdrop = $("#navBackdrop");
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      if (backdrop) {
        backdrop.hidden = false;
        requestAnimationFrame(function () {
          backdrop.classList.add("is-open");
        });
      }
    }
    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        setTimeout(function () {
          backdrop.hidden = true;
        }, 350);
      }
    }
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? close() : open();
    });
    if (backdrop) backdrop.addEventListener("click", close);
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) close();
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top =
          target.getBoundingClientRect().top +
          window.scrollY -
          (id === "#top" ? 0 : 80);
        window.scrollTo({
          top: top,
          behavior: reduceMotion ? "auto" : "smooth",
        });
        history.replaceState(null, "", id);
      });
    });
  }

  /* ---------- Active section indicator ---------- */
  function initScrollSpy() {
    var nav = $("#mainNav");
    var indicator = $("#navIndicator");
    if (!nav || !indicator || !("IntersectionObserver" in window)) return;
    var links = $$('a[href^="#"]:not(.btn)', nav);

    function moveTo(link) {
      if (!link || window.innerWidth <= 980) {
        indicator.style.opacity = 0;
        return;
      }
      indicator.style.left = link.offsetLeft + "px";
      indicator.style.width = link.offsetWidth + "px";
      indicator.style.opacity = 1;
    }
    function setActive(id) {
      var active = null;
      links.forEach(function (l) {
        var on = l.getAttribute("href") === "#" + id;
        l.classList.toggle("is-active", on);
        if (on) active = l;
      });
      moveTo(active);
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    links.forEach(function (l) {
      var sec = document.querySelector(l.getAttribute("href"));
      if (sec) io.observe(sec);
    });
    var hero = $("#top");
    if (hero) io.observe(hero);
    window.addEventListener("resize", function () {
      moveTo($(".is-active", nav));
    });
  }

  /* ---------- Scroll reveal with stagger ---------- */
  function initReveal() {
    var els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    // stagger siblings that share a parent
    var groups = new Map();
    els.forEach(function (el) {
      var p = el.parentElement;
      var list = groups.get(p) || [];
      list.push(el);
      groups.set(p, list);
    });
    groups.forEach(function (list) {
      list.forEach(function (el, i) {
        el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
      });
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var t = entry.target;
            t.classList.add("is-visible");
            io.unobserve(t);
            setTimeout(
              function () {
                t.classList.add("done");
              },
              1100 + (parseInt(t.style.getPropertyValue("--d"), 10) || 0),
            );
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    var counters = $$(".counter");
    if (!counters.length) return;
    function run(el) {
      var target = Number(el.getAttribute("data-target")) || 0;
      if (reduceMotion) {
        el.textContent = target;
        return;
      }
      var startTime = null;
      var duration = 1600;
      function step(t) {
        if (!startTime) startTime = t;
        var p = Math.min((t - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            run(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach(function (c) {
      io.observe(c);
    });
  }

  /* ---------- Solutions filter ---------- */
  function initFilter() {
    var group = $("#projectFilters");
    var grid = $("#projectsGrid");
    var pill = $("#filterPill");
    if (!group || !grid) return;
    var buttons = $$(".filter-btn", group);
    var items = $$(".project", grid);
    var empty = $("#filterEmpty");

    function movePill(btn) {
      if (!pill || !btn) return;
      pill.style.left = btn.offsetLeft + "px";
      pill.style.top = btn.offsetTop + "px";
      pill.style.width = btn.offsetWidth + "px";
      pill.style.height = btn.offsetHeight + "px";
    }

    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var filter = btn.getAttribute("data-filter");
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      movePill(btn);

      var shown = 0;
      items.forEach(function (item) {
        var match =
          filter === "all" || item.getAttribute("data-category") === filter;
        if (match) {
          shown++;
          item.classList.remove("is-hidden");
          requestAnimationFrame(function () {
            item.classList.remove("is-hiding");
          });
        } else {
          item.classList.add("is-hiding");
          setTimeout(
            function () {
              if (item.classList.contains("is-hiding"))
                item.classList.add("is-hidden");
            },
            reduceMotion ? 0 : 450,
          );
        }
      });
      if (empty) empty.hidden = shown !== 0;
    });

    var initial = $(".filter-btn.is-active", group);
    movePill(initial);
    window.addEventListener("resize", function () {
      movePill($(".filter-btn.is-active", group));
    });
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(function () {
        movePill($(".filter-btn.is-active", group));
      });
  }

  /* ---------- Technology slider ---------- */
  function initTrack() {
    var track = $("#productsTrack");
    var prev = $("#prodPrev");
    var next = $("#prodNext");
    if (!track) return;
    function step() {
      var card = $(".capability", track);
      return card ? card.getBoundingClientRect().width + 24 : 320;
    }
    if (prev)
      prev.addEventListener("click", function () {
        track.scrollBy({ left: -step(), behavior: "smooth" });
      });
    if (next)
      next.addEventListener("click", function () {
        track.scrollBy({ left: step(), behavior: "smooth" });
      });

    // drag to scroll on desktop
    var down = false,
      startX = 0,
      startLeft = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.style.scrollSnapType = "none";
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      track.scrollLeft = startLeft - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      track.style.scrollSnapType = "";
    });
  }

  /* ---------- Process timeline progress ---------- */
  function initTimeline() {
    var timeline = $("#timeline");
    var fill = $("#timelineFill");
    if (!timeline) return;
    var steps = $$(".step", timeline);
    var ticking = false;
    function update() {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.8 - rect.top) / (rect.height * 0.6);
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.transform = "scaleX(" + p + ")";
      steps.forEach(function (s, i) {
        var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
        var lit =
          window.innerWidth <= 980
            ? s.getBoundingClientRect().top < vh * 0.75
            : p >= threshold - 0.02 && p > 0;
        s.classList.toggle("is-lit", lit);
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Testimonial wall: duplicate for seamless loop ---------- */
  function initVoices() {
    $$(".voices__track").forEach(function (track) {
      $$(".voice", track).forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
    });
  }

  /* ---------- Cursor light + magnetic buttons + parallax ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;

    $$(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", ((px - 0.5) * 5).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * 5).toFixed(2) + "deg");
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    var scene = $("#scene");
    var hero = $(".hero");
    if (scene && hero) {
      var layers = $$("[data-depth]", scene);
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) {
          var d = Number(l.getAttribute("data-depth")) || 10;
          l.style.translate =
            (x * d).toFixed(1) + "px " + (y * d).toFixed(1) + "px";
        });
      });
      hero.addEventListener("pointerleave", function () {
        layers.forEach(function (l) {
          l.style.translate = "";
        });
      });
    }
  }

  /* ---------- Contact form ---------- */

  /* ---------- Contact form ---------- */
  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;

    var success = $("#formSuccess");

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /^\+?[0-9\s().-]+$/;

    var fields = $$("[required]", form);

    // Field validation
    function validate(field) {
      var val = (field.value || "").trim();
      var ok = !!val;

      // Email validation
      if (ok && field.type === "email") {
        ok = emailRe.test(val);
      }

      // Contact number validation
      if (ok && field.id === "cf-phone") {
        var digits = val.replace(/\D/g, "");
        ok = phoneRe.test(val) && digits.length >= 10 && digits.length <= 15;
      }

      // Message validation
      if (ok && field.id === "cf-message") {
        ok = val.length >= 10;
      }

      var wrap = field.closest(".field");

      if (wrap) {
        wrap.classList.remove("has-error");

        if (!ok) {
          void wrap.offsetWidth;
          wrap.classList.add("has-error");
        }
      }

      field.setAttribute("aria-invalid", ok ? "false" : "true");

      return ok;
    }

    // Validate on blur and input
    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.value) validate(field);
      });

      field.addEventListener("input", function () {
        var wrap = field.closest(".field");

        if (wrap && wrap.classList.contains("has-error")) {
          validate(field);
        }
      });

      field.addEventListener("change", function () {
        if (field.value) validate(field);
      });
    });

    // Form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstBad = null;

      fields.forEach(function (field) {
        if (!validate(field) && !firstBad) {
          firstBad = field;
        }
      });

      // Stop if validation fails
      if (firstBad) {
        firstBad.focus();
        return;
      }

      var data = new FormData(form);

      var name = data.get("name");
      var email = data.get("email");
      var phone = data.get("phone");
      var service = data.get("type");
      var message = data.get("message");

      // Email subject
      var subject = "Project Enquiry: " + service + " - " + name;

      // Email body
      var body =
        "Hello WebVistaar Team,\n\n" +
        "I would like to enquire about your services.\n\n" +
        "Name: " +
        name +
        "\n" +
        "Email: " +
        email +
        "\n" +
        "Contact Number: " +
        phone +
        "\n" +
        "Service Required: " +
        service +
        "\n\n" +
        "Project Details:\n" +
        message +
        "\n\n" +
        "Thank you.";

      // Open visitor's email application
      var mailto =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;

      // Show success message
      if (success) {
        success.classList.add("show");

        setTimeout(function () {
          success.classList.remove("show");
        }, 9000);
      }

      // Reset form
      form.reset();

      fields.forEach(function (field) {
        field.setAttribute("aria-invalid", "false");

        var wrap = field.closest(".field");
        if (wrap) wrap.classList.remove("has-error");
      });
    });
  }

  /* ---------- Feedback modal ---------- */
  function initFeedback() {
    var openBtn = $("#tmClientShareBtn");
    var overlay = $("#tmFeedbackOverlay");
    if (!overlay) return;
    var form = $("#tmFeedbackForm");
    var ratingInput = $("#tmFeedbackRating");
    var stars = $$("#tmFeedbackStars button");
    var error = $("#feedbackError");
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(function () {
        $("#tmFeedbackName").focus();
      }, 300);
    }
    function close() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function paint(n, cls) {
      stars.forEach(function (s) {
        s.classList.toggle(cls, Number(s.getAttribute("data-rating")) <= n);
      });
    }

    if (openBtn) openBtn.addEventListener("click", open);
    $("#tmFeedbackClose").addEventListener("click", close);
    $("#tmFeedbackCancel").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    stars.forEach(function (star) {
      var n = Number(star.getAttribute("data-rating"));
      star.addEventListener("mouseenter", function () {
        paint(n, "is-hover");
      });
      star.addEventListener("mouseleave", function () {
        paint(0, "is-hover");
      });
      star.addEventListener("click", function () {
        ratingInput.value = n;
        paint(n, "is-selected");
        stars.forEach(function (s) {
          s.setAttribute(
            "aria-checked",
            Number(s.getAttribute("data-rating")) === n ? "true" : "false",
          );
        });
        if (error) error.textContent = "";
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#tmFeedbackName").value.trim();
      var message = $("#tmFeedbackMessage").value.trim();
      var type = $("#tmFeedbackType").value;
      if (!name) {
        error.textContent = "Enter your name.";
        $("#tmFeedbackName").focus();
        return;
      }
      if (!ratingInput.value) {
        error.textContent = "Choose a rating from 1 to 5 stars.";
        return;
      }
      if (!message) {
        error.textContent = "Write a few words about your experience.";
        $("#tmFeedbackMessage").focus();
        return;
      }

      var body =
        "Name: " +
        name +
        "\nRating: " +
        ratingInput.value +
        "/5\nProject type: " +
        (type || "Not specified") +
        "\n\n" +
        message;
      window.location.href =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent("Client feedback from " + name) +
        "&body=" +
        encodeURIComponent(body);

      form.reset();
      ratingInput.value = "";
      paint(0, "is-selected");
      close();
      toast("Thank you! Your email app is opening with your feedback.");
    });
  }

  /* ---------- Chatbot ---------- */
  function initChat() {
    var chat = $("#tmChatbot");
    if (!chat) return;

    var launcher = $("#tmChatbotButton");
    var win = $("#tmChatbotWindow");
    var form = $("#tmChatbotForm");
    var input = $("#tmChatbotInput");
    var messages = $("#tmChatbotMessages");
    var closeBtn = $("#tmChatbotClose");

    /* ---------- Open Chat ---------- */
    function open() {
      chat.classList.add("is-open");

      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Close WebVistaar assistant");

      win.setAttribute("aria-hidden", "false");

      setTimeout(function () {
        input.focus();
      }, 300);
    }

    /* ---------- Close Chat ---------- */
    function close() {
      chat.classList.remove("is-open");

      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-label", "Open WebVistaar assistant");

      win.setAttribute("aria-hidden", "true");
    }

    /* ---------- Chat Events ---------- */
    launcher.addEventListener("click", function () {
      if (chat.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && chat.classList.contains("is-open")) {
        close();
      }
    });

    /* ==========================================================
     BOT REPLY SYSTEM
  ========================================================== */

    function reply(text) {
      var m = text.toLowerCase().trim();

      /* ---------- Keyword Helper ---------- */
      function has() {
        for (var i = 0; i < arguments.length; i++) {
          if (m.indexOf(arguments[i]) > -1) {
            return true;
          }
        }

        return false;
      }

      /* ========================================================
       1. E-COMMERCE
    ======================================================== */

      if (
        has(
          "ecommerce",
          "e-commerce",
          "online store",
          "shopping store",
          "online shopping",
          "woocommerce",
          "shopify",
        )
      ) {
        return "🛒 We build complete e-commerce websites with product management, shopping carts, secure payment gateways and order management. Tell us what products you want to sell and we'll suggest the right solution.";
      }

      /* ========================================================
       2. SEO
    ======================================================== */

      if (
        has(
          "seo",
          "search engine optimization",
          "google ranking",
          "google rankings",
          "search ranking",
          "search rankings",
          "organic traffic",
          "keyword research",
          "keywords",
          "website ranking",
        )
      ) {
        return "🔍 Our SEO service helps improve your website's visibility on Google through keyword optimization, on-page SEO, technical improvements and search-friendly content. Share your website with us and we can suggest areas to improve.";
      }

      /* ========================================================
       3. GOOGLE BUSINESS PROFILE / GMB
    ======================================================== */

      if (
        has(
          "google business profile",
          "google business",
          "gmb",
          "google maps",
          "google map",
          "business profile",
          "local seo",
          "maps listing",
          "google listing",
        )
      ) {
        return "📍 We help businesses optimize and manage their Google Business Profile so customers can find them more easily on Google Search and Maps. This includes profile optimization, business information and local visibility.";
      }

      /* ========================================================
       4. PAID ADVERTISING
    ======================================================== */

      if (
        has(
          "google ads",
          "google advertisement",
          "meta ads",
          "facebook ads",
          "instagram ads",
          "paid ads",
          "paid advertising",
          "advertising",
          "advertisement",
          "ads campaign",
          "ad campaign",
        )
      ) {
        return "📢 We create and manage Google & Meta advertising campaigns to help businesses reach the right audience, generate leads and promote their products or services.";
      }

      /* ========================================================
       5. LANDING PAGE
    ======================================================== */

      if (
        has(
          "landing page",
          "landing pages",
          "campaign page",
          "campaign pages",
          "lead generation",
          "lead generating page",
        )
      ) {
        return "🎯 We create high-converting landing pages for products, services, promotions and marketing campaigns. The goal is simple — present your offer clearly and turn visitors into leads.";
      }

      /* ========================================================
       6. GRAPHICS DESIGN
    ======================================================== */

      if (
        has(
          "graphics design",
          "graphic design",
          "graphics",
          "graphic",
          "poster design",
          "banner design",
          "creative design",
          "social media design",
          "branding",
          "brand design",
        )
      ) {
        return "🎨 Our Graphics Design service helps businesses create professional banners, social media creatives, promotional graphics and other visual content that matches their brand.";
      }

      /* ========================================================
       7. SOCIAL MEDIA MANAGEMENT
    ======================================================== */

      if (
        has(
          "social media management",
          "social media",
          "instagram management",
          "facebook management",
          "social media marketing",
          "social marketing",
          "instagram marketing",
          "facebook marketing",
        )
      ) {
        return "📱 We help businesses maintain a strong social media presence with creative content, consistent posting and professional brand communication across social platforms.";
      }

      /* ========================================================
       8. CUSTOM WEB APPLICATION
    ======================================================== */

      if (
        has(
          "web application",
          "web applications",
          "web app",
          "web apps",
          "custom application",
          "custom web app",
          "custom web application",
          "dashboard",
          "admin dashboard",
          "admin panel",
        )
      ) {
        return "💻 We develop custom web applications with dynamic content, database integration, user authentication and admin dashboards tailored to your business workflow.";
      }

      /* ========================================================
       9. WEBSITE DEVELOPMENT
    ======================================================== */

      if (
        has(
          "business website",
          "company website",
          "corporate website",
          "website development",
          "web development",
          "web design",
          "website design",
          "responsive website",
          "website",
        )
      ) {
        return "🌐 We build modern, responsive and SEO-friendly websites for businesses. From landing pages and corporate websites to custom web applications, we create websites around your business goals.";
      }

      /* ========================================================
       10. PRICING
    ======================================================== */

      if (
        has(
          "price",
          "pricing",
          "cost",
          "budget",
          "charge",
          "charges",
          "package",
          "packages",
          "how much",
          "rate",
          "rates",
        )
      ) {
        return "💰 Our pricing depends on your requirements, such as website type, number of pages, features and additional digital services. Share your project details and we'll provide a clear estimate.";
      }

      /* ========================================================
       11. CONTACT
    ======================================================== */

      if (
        has(
          "contact",
          "email",
          "call",
          "meeting",
          "talk",
          "talk to you",
          "talk with you",
          "start a project",
          "contact us",
          "get in touch",
          "enquiry",
          "inquiry",
        )
      ) {
        return "👋 Sure! You can use the Contact section on this page to tell us about your project. Share your requirements and the WebVistaar team will get back to you.";
      }

      /* ========================================================
       12. CAREERS
    ======================================================== */

      if (
        has(
          "career",
          "careers",
          "job",
          "jobs",
          "hiring",
          "vacancy",
          "vacancies",
          "work with you",
        )
      ) {
        return "💼 For career opportunities, please check our Careers page or contact the WebVistaar team.";
      }

      /* ========================================================
       13. SERVICES
    ======================================================== */

      if (
        has(
          "service",
          "services",
          "what do you do",
          "what services",
          "your services",
          "services you provide",
        )
      ) {
        return "🚀 WebVistaar provides Website Development, SEO, Google Business Profile Management, Paid Advertising, Graphics Design and Social Media Management.";
      }

      /* ========================================================
       14. GREETING
    ======================================================== */

      if (
        has(
          "hello",
          "hi",
          "hii",
          "hey",
          "heyy",
          "namaste",
          "good morning",
          "good afternoon",
          "good evening",
        )
      ) {
        return "Hello! 👋 Welcome to WebVistaar. What are you looking to build or improve for your business?";
      }

      /* ========================================================
       15. DEFAULT RESPONSE
    ======================================================== */

      return "Thanks for reaching out! 👋 Tell me what you need for your business — a website, e-commerce store, SEO, Google Business Profile, advertising, graphics design or social media management.";
    }

    /* ==========================================================
     ADD MESSAGE
  ========================================================== */

    function add(text, who) {
      var row = document.createElement("div");

      row.className = "msg msg--" + who;

      var bubble = document.createElement("div");

      bubble.className = "msg__bubble";

      var p = document.createElement("p");

      p.textContent = text;

      bubble.appendChild(p);
      row.appendChild(bubble);

      messages.appendChild(row);

      messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth",
      });

      return row;
    }

    /* ==========================================================
     SEND MESSAGE
  ========================================================== */

    function send(text) {
      add(text, "user");

      input.value = "";

      /* Typing Animation */

      var typing = document.createElement("div");

      typing.className = "msg msg--bot";

      typing.innerHTML =
        '<div class="msg__bubble">' +
        '<span class="typing">' +
        "<i></i>" +
        "<i></i>" +
        "<i></i>" +
        "</span>" +
        "</div>";

      messages.appendChild(typing);

      messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth",
      });

      /* Bot Response Delay */

      setTimeout(function () {
        typing.remove();

        add(reply(text), "bot");
      }, 850);
    }

    /* ==========================================================
     QUICK REPLY BUTTONS
  ========================================================== */

    $$(".chat__quick button", chat).forEach(function (button) {
      button.addEventListener("click", function () {
        var message = button.getAttribute("data-chat");

        if (message) {
          send(message);
        }
      });
    });

    /* ==========================================================
     CHAT INPUT FORM
  ========================================================== */

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var text = input.value.trim();

      if (text) {
        send(text);
      }
    });
  }

  /* ---------- Section rail (replaces the scrollbar) ---------- */
  function initRail() {
    var rail = $("#sectionRail");
    if (!rail) return;
    var fill = $("#railFill");
    var links = $$("a", rail);
    var ticking = false;
    var flashTimer;
    function update() {
      var max = doc.scrollHeight - window.innerHeight;
      if (fill)
        fill.style.transform =
          "scaleY(" + (max > 0 ? window.scrollY / max : 0) + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", update);
    update();

    if (!("IntersectionObserver" in window)) return;
    var current = null;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          if (id === current) return;
          current = id;
          links.forEach(function (l) {
            var on = l.getAttribute("href") === id;
            l.classList.toggle("is-active", on);
            if (on) {
              l.setAttribute("aria-current", "true");
              l.classList.add("is-flash");
              clearTimeout(flashTimer);
              flashTimer = setTimeout(function () {
                l.classList.remove("is-flash");
              }, 1400);
            } else {
              l.removeAttribute("aria-current");
              l.classList.remove("is-flash");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach(function (l) {
      var sec = document.querySelector(l.getAttribute("href"));
      if (sec) io.observe(sec);
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var y = $("#footerYear");
    if (y) y.textContent = new Date().getFullYear();
  }

  function boot() {
    doc.classList.remove("no-js");
    initIntro();
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollSpy();
    initVoices();
    initReveal();
    initRail();
    initCounters();
    initFilter();
    initTrack();
    initTimeline();
    initPointerFx();
    initContactForm();
    initFeedback();
    initChat();
    initYear();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
