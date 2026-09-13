document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const countdownSection = document.getElementById("rentree-countdown");
  if (countdownSection) {
    const targetDate = new Date(countdownSection.dataset.target);
    const hideAfterDate = new Date(countdownSection.dataset.hideAfter);
    const timer = document.getElementById("countdown-timer");
    const liveMessage = document.getElementById("countdown-live-message");

    const tick = () => {
      const now = new Date();

      if (now >= hideAfterDate) {
        countdownSection.remove();
        return;
      }

      if (now >= targetDate) {
        if (timer) timer.hidden = true;
        if (liveMessage) liveMessage.hidden = false;
        return;
      }

      const diffMs = targetDate - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      const pad = (n) => String(n).padStart(2, "0");
      const daysEl = countdownSection.querySelector('[data-unit="days"]');
      const hoursEl = countdownSection.querySelector('[data-unit="hours"]');
      const minutesEl = countdownSection.querySelector('[data-unit="minutes"]');
      const secondsEl = countdownSection.querySelector('[data-unit="seconds"]');
      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    };

    tick();
    setInterval(tick, 1000);
  }

  /** Affiché si events.json est introuvable (ex. ouverture locale file://) ou vide. */
  const DEFAULT_EVENTS = [
    {
      id: "institut-ramadan",
      tag: "Mois de Ramadan",
      title: "Institut du Ramadan",
      excerpt:
        "Pendant le mois de Ramadan, nos élèves participent à l’Institut du Ramadan : récitations, mémorisation du Coran, rappels et temps de spiritualité adaptés à chaque âge.",
      content: [
        "Keur Yaye Sokhna Gueye Bilingual School propose un programme spirituel et pédagogique tout au long du mois béni.",
        "Mémorisation, tajwid, rappels et ateliers encadrés par l’équipe. Des moments de récitation sont partagés avec les familles.",
      ],
      images: [
        { src: "new2.jpg", alt: "Institut du Ramadan – vie scolaire à KYSGBS" },
        { src: "conf.jpg", alt: "Séance Coran / Tahfiz avec les élèves" },
      ],
    },
    {
      id: "recitations-ramadan",
      tag: "Ramadan",
      title: "Récitations coraniques des élèves",
      excerpt:
        "Les classes préparent des récitations individuelles et collectives pour mettre en valeur le travail de l’année devant les parents et la communauté.",
      content: [
        "Pendant le Ramadan, les élèves présentent des sourates et passages travaillés tout au long de l’année.",
        "Un moment fort qui illustre la place centrale du Coran dans notre projet éducatif.",
      ],
      images: [{ src: "conf.jpg", alt: "Élèves en récitation coranique" }],
    },
  ];

  async function loadEvents() {
    try {
      const res = await fetch("events.json", { cache: "no-store" });
      if (!res.ok) return DEFAULT_EVENTS;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      /* navigateur ou mode d’ouverture local */
    }
    return DEFAULT_EVENTS;
  }

  function formatEventDate(value) {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
  }

  function sortEventsByDateDesc(events) {
    return events.slice().sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : -Infinity;
      const db = b?.date ? new Date(b.date).getTime() : -Infinity;
      return db - da;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderIndexNews(events) {
    const mount = document.getElementById("news-list");
    if (!mount) return;

    const items = sortEventsByDateDesc(events).slice(0, 4);
    mount.innerHTML = items
      .map((event) => {
        const tag = escapeHtml(event.tag || "");
        const title = escapeHtml(event.title || "");
        const excerpt = escapeHtml(event.excerpt || "");
        const id = encodeURIComponent(event.id || "");
        const publishedDate = formatEventDate(event.date);

        const images = Array.isArray(event.images) ? event.images.slice(0, 2) : [];
        const imagesHtml =
          images.length > 0
            ? `<div class="news-images">` +
              images
                .map((img) => {
                  const src = escapeHtml(img?.src || "");
                  const alt = escapeHtml(img?.alt || title);
                  return `<img class="news-image" src="${src}" alt="${alt}" loading="lazy" />`;
                })
                .join("") +
              `</div>`
            : "";

        return `
          <article class="news-card">
            ${tag ? `<span class="news-date">${tag}</span>` : ""}
            ${publishedDate ? `<span class="news-published">${publishedDate}</span>` : ""}
            <h3>${title}</h3>
            ${imagesHtml}
            <p>${excerpt}</p>
            <a href="news.html#${id}" class="text-link">Lire l’événement →</a>
          </article>
        `;
      })
      .join("");
  }

  function renderAllNews(events) {
    const mount = document.getElementById("all-news-list");
    if (!mount) return;

    mount.innerHTML = sortEventsByDateDesc(events)
      .map((event) => {
        const tag = escapeHtml(event.tag || "");
        const title = escapeHtml(event.title || "");
        const id = escapeHtml(event.id || "");
        const publishedDate = formatEventDate(event.date);
        const paragraphs = Array.isArray(event.content) ? event.content : [];
        const images = Array.isArray(event.images) ? event.images : [];

        const imagesHtml =
          images.length > 0
            ? `<div class="news-images">` +
              images
                .slice(0, Math.max(2, images.length))
                .map((img) => {
                  const src = escapeHtml(img?.src || "");
                  const alt = escapeHtml(img?.alt || title);
                  return `<img class="news-image" src="${src}" alt="${alt}" loading="lazy" />`;
                })
                .join("") +
              `</div>`
            : "";

        const contentHtml = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");

        return `
          <article class="blog-card" id="${id}">
            ${imagesHtml}
            <div class="blog-card-body">
              ${tag ? `<span class="news-date">${tag}</span>` : ""}
              ${publishedDate ? `<span class="news-published">${publishedDate}</span>` : ""}
              <h2>${title}</h2>
              ${contentHtml}
            </div>
          </article>
        `;
      })
      .join("");
  }

  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("is-open");
      mainNav.classList.toggle("is-open");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        mainNav.classList.remove("is-open");
      });
    });
  }

  async function submitToFormspree(form) {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Formspree submission failed");
  }

  const contactForm = document.getElementById("contact-form");
  const contactSuccess = document.getElementById("contact-success");
  const contactError = document.getElementById("contact-error");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name")?.value.trim();
      const phone = document.getElementById("contact-phone")?.value.trim();
      const message = document.getElementById("contact-message")?.value.trim();

      if (!name || !phone || !message) {
        alert("Veuillez remplir tous les champs avant d'envoyer le message.");
        return;
      }

      if (contactError) contactError.hidden = true;

      submitToFormspree(contactForm)
        .then(() => {
          if (contactSuccess) {
            contactSuccess.hidden = false;
            contactSuccess.textContent = "Merci pour votre message. Nous vous répondrons rapidement.";
          }
        })
        .catch(() => {
          if (contactError) contactError.hidden = false;
        });

      const phoneNumber = "221772864894";
      const textLines = [
        `Nom complet : ${name}`,
        `Téléphone : ${phone}`,
        "",
        "Message :",
        message,
      ];
      const whatsappText = encodeURIComponent(textLines.join("\n"));
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappText}`;
      window.open(whatsappUrl, "_blank");

      contactForm.reset();
    });
  }

  const inscriptionForm = document.getElementById("inscription-form");
  const inscriptionSuccess = document.getElementById("inscription-success");
  const inscriptionError = document.getElementById("inscription-error");
  if (inscriptionForm) {
    inscriptionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (inscriptionError) inscriptionError.hidden = true;

      submitToFormspree(inscriptionForm)
        .then(() => {
          if (inscriptionSuccess) inscriptionSuccess.hidden = false;
          inscriptionForm.reset();
        })
        .catch(() => {
          if (inscriptionError) inscriptionError.hidden = false;
        });
    });
  }

  loadEvents().then((events) => {
    renderIndexNews(events);
    renderAllNews(events);
    if (window.observeReveal) {
      window.observeReveal(document.getElementById("news-list"));
      window.observeReveal(document.getElementById("all-news-list"));
    }
  });
});


// ===== LIGHTBOX =====
(function () {
  // Créer l'overlay
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-close" aria-label="Fermer">&#x2715;</button>
      <button class="lightbox-btn prev" aria-label="Précédent">&#8592;</button>
      <img class="lightbox-img" src="" alt="" />
      <button class="lightbox-btn next" aria-label="Suivant">&#8594;</button>
      <span class="lightbox-counter"></span>
      <p class="lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".lightbox-img");
  const caption = overlay.querySelector(".lightbox-caption");
  const counter = overlay.querySelector(".lightbox-counter");
  const btnClose = overlay.querySelector(".lightbox-close");
  const btnPrev = overlay.querySelector(".prev");
  const btnNext = overlay.querySelector(".next");

  let images = [];
  let current = 0;

  function getImages() {
    return Array.from(document.querySelectorAll(".gallery-img, .news-image"));
  }

  function open(index) {
    images = getImages();
    current = index;
    show();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function show() {
    const el = images[current];
    img.classList.add("is-loading");
    img.onload = () => img.classList.remove("is-loading");
    img.src = el.src;
    img.alt = el.alt || "";
    caption.textContent = el.alt || "";
    counter.textContent = `${current + 1} / ${images.length}`;
  }

  function prev() {
    current = (current - 1 + images.length) % images.length;
    show();
  }

  function next() {
    current = (current + 1) % images.length;
    show();
  }

  // Attacher les clics sur les images
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".gallery-img, .news-image");
    if (!el) return;
    const all = getImages();
    const index = all.indexOf(el);
    if (index !== -1) open(index);
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Clavier
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") close();
  });

  // Swipe mobile
  let touchStartX = 0;
  overlay.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });
})();

// ===== COMPTEUR ANIMÉ (À propos) =====
(function () {
  const stats = document.querySelectorAll(".about-stat strong");
  if (!stats.length) return;

  function animateCounter(el) {
    const text = el.textContent.trim();
    const prefix = text.startsWith("+") ? "+" : "";
    const suffix = text.endsWith("%") ? "%" : "";
    const target = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(target)) return;

    const duration = 1800;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + Math.floor(current) + suffix;
    }, stepTime);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        stats.forEach((el) => animateCounter(el));
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(document.querySelector(".about-stats-section") || stats[0].closest("section"));
})();

// ===== ANIMATIONS AU DÉFILEMENT =====
(function () {
  const REVEAL_SELECTOR =
    ".card, .highlight-item, .value-card, .team-card, .prog-pillar, .gallery-card, " +
    ".blog-card, .programme-block, .news-card, .section-header, .faq-item";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.observeReveal = function () {};
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  window.observeReveal = function (root) {
    root = root || document;
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  };

  document.addEventListener("DOMContentLoaded", () => window.observeReveal());
})();

// ===== FAQ ACCORDÉON =====
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(isOpen));
        answer.hidden = !isOpen;
      });
    });
  });
})();

// ===== CARROUSEL TÉMOIGNAGES =====
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("testimonial-carousel");
    if (!carousel) return;

    const track = carousel.querySelector(".testimonial-track");
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector(".carousel-arrow--prev");
    const nextBtn = carousel.querySelector(".carousel-arrow--next");
    const dotsWrap = carousel.querySelector(".carousel-dots");
    let index = 0;
    let autoplayTimer = null;

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Témoignage ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    function startAutoplay() {
      autoplayTimer = setInterval(() => goTo(index + 1), 6000);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);

    update();
    startAutoplay();
  });
})();