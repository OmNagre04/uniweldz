/* =========================================================
   Uniweldz Solutions — Site behaviour (Vanilla ES6)
   Sticky header, mobile menu, scroll reveal, counters,
   scroll progress, back-to-top, form validation.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Sticky header (solid on scroll) ---------- */
  const header = $(".site-header");
  const progress = $(".scroll-progress");
  const toTop = $(".to-top");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-solid", y > 40);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close after choosing a link on mobile
    $$(".nav a", nav).forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealables = $$(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = Math.min(i * 70, 280) + "ms";
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px" }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          co.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Scroll-spy for in-page anchors ---------- */
  const spyLinks = $$('.nav__link[href^="#"]');
  if (spyLinks.length && "IntersectionObserver" in window) {
    const sections = spyLinks
      .map((l) => document.getElementById(l.getAttribute("href").slice(1)))
      .filter(Boolean);
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50%" }
    );
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- Back to top ---------- */
  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---------- Contact form validation ---------- */
  const form = $("#contact-form");
  if (form) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    const phoneRe = /^[0-9+()\-\s]{7,20}$/;

    const setError = (field, message) => {
      const wrap = field.closest(".field");
      wrap.classList.toggle("has-error", Boolean(message));
      const box = $(".error", wrap);
      if (box) box.textContent = message || "";
      field.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    };

    const validateField = (field) => {
      const value = field.value.trim();
      if (field.required && !value) return setError(field, "This field is required.");
      if (field.type === "email" && !emailRe.test(value))
        return setError(field, "Enter a valid email address.");
      if (field.type === "tel" && value && !phoneRe.test(value))
        return setError(field, "Enter a valid phone number.");
      if (field.name === "name" && value.length < 2)
        return setError(field, "Please enter your full name.");
      if (field.name === "message" && value.length < 10)
        return setError(field, "Please provide at least 10 characters.");
      return setError(field, "");
    };

    const fields = $$("input, textarea", form).filter((f) => f.name);
    fields.forEach((f) => {
      f.addEventListener("blur", () => validateField(f));
      f.addEventListener("input", () => {
        if (f.closest(".field").classList.contains("has-error")) validateField(f);
      });
    });

   form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const valid = fields.map(validateField).every(Boolean);
    const status = $(".form__status", form);

    if (!valid) {
        if (status) status.textContent = "Please correct the highlighted fields.";

        const firstError = $(".field.has-error input, .field.has-error textarea", form);
        if (firstError) firstError.focus();

        return;
    }

    const data = {
        name: $("#name").value.trim(),
        email: $("#email").value.trim(),
        phone: $("#phone").value.trim(),
        company: $("#company").value.trim(),
        message: $("#message").value.trim()
    };

    try {

        status.textContent = "Sending your inquiry...";
        status.style.color = "#ffc107";

        const response = await fetch("https://uniweldz-backend.vercel.app/api/contact", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (result.success) {

            status.textContent =
                "✅ Thank you! Your inquiry has been sent successfully.";

            status.style.color = "#00c853";

            form.reset();

        } else {

            status.textContent = result.message;
            status.style.color = "#ff5252";

        }

    } catch (err) {

        console.error(err);

        status.textContent =
            "❌ Unable to send inquiry. Please try again later.";

        status.style.color = "#ff5252";

    }

});
  }

  /* ---------- Newsletter (footer) ---------- */
  const news = $("#newsletter-form");
  if (news) {
    news.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", news);
      const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(input.value.trim());
      const note = $(".newsletter__note", news.parentElement) || null;
      if (note) note.textContent = ok ? "Subscribed. Welcome aboard." : "Enter a valid email address.";
      if (ok) news.reset();
    });
  }

  /* ---------- Current year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));
})();
