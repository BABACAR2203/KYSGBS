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
            ${tag ? `<span class="news-date">${tag}</span>` : ""}
            <h2>${title}</h2>
            ${imagesHtml}
            ${contentHtml}
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
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim() || "";
      const phone = document.getElementById("contact-phone")?.value.trim() || "";
      const message = document.getElementById("contact-message")?.value.trim() || "";

      const phoneDigitsOnly = phone.replace(/\D/g, "");
      if (!phoneDigitsOnly) {
        alert("Merci d’entrer un numéro de téléphone valide.");
        return;
      }

      const baseUrl = "https://wa.me/221772864894";
      const textLines = [
        "NOUVEAU MESSAGE DEPUIS LE FORMULAIRE DE CONTACT KYSGBS",
        "",
        `Nom : ${name}`,
        `Téléphone : ${phoneDigitsOnly}`,
        "",
        "Message :",
        message,
      ];
      const text = encodeURIComponent(textLines.join("\n"));
      const url = `${baseUrl}?text=${text}`;

      window.open(url, "_blank");

      if (contactSuccess) {
        contactSuccess.hidden = false;
      }
      contactForm.reset();
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

