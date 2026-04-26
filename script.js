document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
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

    const items = events.slice(0, 4);
    mount.innerHTML = items
      .map((event) => {
        const tag = escapeHtml(event.tag || "");
        const title = escapeHtml(event.title || "");
        const excerpt = escapeHtml(event.excerpt || "");
        const id = encodeURIComponent(event.id || "");

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

    mount.innerHTML = events
      .map((event) => {
        const tag = escapeHtml(event.tag || "");
        const title = escapeHtml(event.title || "");
        const id = escapeHtml(event.id || "");
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

  const contactForm = document.getElementById("contact-form");
  const contactSuccess = document.getElementById("contact-success");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Envoi en cours...";

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          if (contactSuccess) contactSuccess.hidden = false;
          contactForm.reset();
          btn.textContent = "Message envoyé ✓";
        } else {
          btn.disabled = false;
          btn.textContent = "Envoyer le message";
          alert("Une erreur est survenue. Veuillez réessayer.");
        }
      } catch {
        btn.disabled = false;
        btn.textContent = "Envoyer le message";
        alert("Une erreur est survenue. Vérifiez votre connexion.");
      }
    });
  }

  const inscriptionForm = document.getElementById("inscription-form");
  if (inscriptionForm) {
    inscriptionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const eleveNom = document.getElementById("eleve-nom")?.value || "";
      const parentNom = document.getElementById("parent-nom")?.value || "";
      const parentPhone = document.getElementById("parent-phone")?.value || "";
      const classe = document.getElementById("classe")?.value || "";
      const message = document.getElementById("message")?.value || "";

      const subject = encodeURIComponent("Nouvelle demande d'inscription - KYSGBS");
      const bodyLines = [
        `Nom de l'élève : ${eleveNom}`,
        `Nom du parent : ${parentNom}`,
        `Téléphone : ${parentPhone}`,
        `Classe souhaitée : ${classe}`,
        "",
        "Message :",
        message,
      ];
      const body = encodeURIComponent(bodyLines.join("\n"));

      window.location.href = `mailto:keuryayesokhna@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  loadEvents().then((events) => {
    renderIndexNews(events);
    renderAllNews(events);
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