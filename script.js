(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  let CONFIG = null;
  let weddingDate = null;
  let dateObj = null;

  // 작은 빨간 하트가 첫 화면에서 자연스럽게 떠오르는 효과
  function initHeartParticles() {
    const wrap = document.getElementById("heartParticles");
    if (!wrap) return;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = "♥";
      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.setProperty("--heart-size", `${11 + Math.random() * 7}px`);
      heart.style.setProperty("--heart-duration", `${6.5 + Math.random() * 4}s`);
      heart.style.setProperty("--heart-delay", `${-Math.random() * 7}s`);
      heart.style.setProperty("--heart-drift", `${-35 + Math.random() * 70}px`);
      heart.style.setProperty("--heart-opacity", `${0.28 + Math.random() * 0.35}`);
      heart.style.setProperty("--heart-rotate", `${-20 + Math.random() * 40}deg`);
      wrap.appendChild(heart);
    }
  }

  const pad = n => String(n).padStart(2, "0");

  function formatDateDot(date) {
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  }

  function formatKoreanDate(date) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const h = weddingDate.getHours();
    const m = weddingDate.getMinutes();
    const period = h < 12 ? "오전" : "오후";
    const h12 = h % 12 || 12;
    return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${days[date.getDay()]}요일 ${period} ${h12}시${m ? ` ${m}분` : ""}`;
  }

  function formatEnglishWeekday(date) {
    return date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  }

  function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast("복사되었습니다.");
    } catch {
      showToast("복사하지 못했습니다.");
    }
  }

  function initConfig() {
    const names = `${CONFIG.groom} & ${CONFIG.bride}`;
    const dot = formatDateDot(dateObj);

    $("#coverNames").textContent = names;
    $("#coverDate").textContent = dot;
    $("#coverVenue").textContent = CONFIG.wedding.venue;

    $("#dateLead").textContent = dot;
    $("#weekday").textContent = formatEnglishWeekday(dateObj);
    $("#calendarMonth").textContent =
      dateObj.toLocaleDateString("en-US", { month: "long" }).toUpperCase();

    $("#dateKorean").textContent = formatKoreanDate(dateObj);
    $("#venueKorean").textContent = CONFIG.wedding.venue;

    $("#venueName").textContent = CONFIG.wedding.venue;
    $("#venueAddress").textContent = CONFIG.wedding.address;
    $("#subway").textContent = CONFIG.location.subway;
    $("#bus").textContent = CONFIG.location.bus;
    $("#parking").textContent = CONFIG.location.parking;
    $("#kakaoMap").href = CONFIG.location.kakao;
    $("#naverMap").href = CONFIG.location.naver;
    $("#footerDate").textContent = dot;

    document.title = `${CONFIG.groom} & ${CONFIG.bride} · OUR WEDDING`;
  }

  /* 자동으로 존재하는 story 이미지 찾기 */
  function loadStoryImages() {
    const wrap = $("#storyPhotos");
    if (!wrap || !CONFIG.storyImages) return;

    CONFIG.storyImages.forEach((src, i) => {
      const img = new Image();

      img.onload = () => {
        const image = document.createElement("img");
        image.src = src;
        image.alt = `우리의 사진 ${i + 1}`;
        image.className = "story-photo reveal";
        image.loading = "lazy";
        wrap.appendChild(image);

        if (i === 1) {
          const caption = document.createElement("div");
          caption.className = "story-caption reveal";
          caption.textContent = "A little moment from our story.";
          wrap.appendChild(caption);
        }

        requestAnimationFrame(() => observer.observe(image));
      };

      img.onerror = () => {};
      img.src = src;
    });
  }

  /* gallery/1.jpg ~ gallery/50.jpg */
  const galleryImages = [];
  function loadGalleryImages() {
    const grid = $("#gallery");
    let current = 1;
    let fails = 0;
    const max = 50;

    function tryNext() {
      if (current > max || fails >= 3) {
        if (!galleryImages.length) {
          grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#999;font-size:12px;">사진을 준비 중입니다.</p>`;
        }
        return;
      }

      const src = `images/gallery/${current}.jpg`;
      const probe = new Image();

      probe.onload = () => {
        galleryImages.push(src);

        const figure = document.createElement("figure");
        figure.className = "photo-item reveal";
        if (current % 3 === 0) figure.classList.add("landscape");

        const img = document.createElement("img");
        img.src = src;
        img.alt = `웨딩 사진 ${current}`;
        img.loading = "lazy";

        figure.appendChild(img);
        figure.addEventListener("click", () => openModal(galleryImages.indexOf(src)));

        grid.appendChild(figure);
        observer.observe(figure);

        fails = 0;
        current++;
        tryNext();
      };

      probe.onerror = () => {
        fails++;
        current++;
        tryNext();
      };

      probe.src = src;
    }

    tryNext();
  }

  /* Calendar */
  function buildCalendar() {
    const grid = $("#calendarGrid");
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const weddingDay = dateObj.getDate();

    const dows = ["S", "M", "T", "W", "T", "F", "S"];
    dows.forEach((d, i) => {
      const el = document.createElement("div");
      el.className = `dow ${i === 0 ? "sun" : ""}`;
      el.textContent = d;
      grid.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= lastDate; day++) {
      const el = document.createElement("div");
      el.textContent = day;
      const dow = new Date(year, month, day).getDay();
      if (dow === 0) el.classList.add("sun");
      if (day === weddingDay) el.classList.add("wedding-day");
      grid.appendChild(el);
    }
  }

  /* Google Calendar 링크 */
  function addToCalendar() {
    const start = weddingDate;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const fmt = d =>
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      "00Z";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(CONFIG.groom + " & " + CONFIG.bride + " WEDDING")}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&location=${encodeURIComponent(CONFIG.wedding.venue + " " + CONFIG.wedding.address)}`;

    window.open(url, "_blank");
  }

  /* Modal */
  let modalIndex = 0;
  const modal = $("#photoModal");
  const modalImage = $("#modalImage");
  const modalCount = $("#modalCount");

  function updateModal() {
    if (!galleryImages.length) return;
    modalImage.src = galleryImages[modalIndex];
    modalCount.textContent = `${String(modalIndex + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}`;
  }

  function openModal(index) {
    modalIndex = index;
    updateModal();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function nextPhoto() {
    if (!galleryImages.length) return;
    modalIndex = (modalIndex + 1) % galleryImages.length;
    updateModal();
  }

  function prevPhoto() {
    if (!galleryImages.length) return;
    modalIndex = (modalIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModal();
  }

  /* Scroll reveal */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function initReveal() {
    $$(".reveal").forEach(el => observer.observe(el));
  }

  /* Account */
  function initAccounts() {
    $$(".account-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".account-group").classList.toggle("open");
      });
    });

    $$(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => copyText(btn.dataset.copy));
    });
  }

  /* Top */
  function initTop() {
    const btn = $("#topButton");
    window.addEventListener("scroll", () => {
      btn.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });

    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* Swipe */
  let touchStartX = 0;
  modal.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  modal.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) diff < 0 ? nextPhoto() : prevPhoto();
  }, { passive: true });

  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
  });

  $(".modal-close").addEventListener("click", closeModal);
  $(".modal-next").addEventListener("click", nextPhoto);
  $(".modal-prev").addEventListener("click", prevPhoto);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  $("#calendarBtn").addEventListener("click", addToCalendar);

  /* config.json 로드 후 초기화
     ※ file://로 이중클릭해서 열면 브라우저 보안 정책 때문에 fetch가 막힙니다.
        VSCode의 Live Server, `python -m http.server` 같은 로컬 서버로 열거나,
        Netlify/GitHub Pages 등에 올려서 확인해주세요. */
  async function loadConfigAndInit() {
    try {
      const res = await fetch("config.json");
      if (!res.ok) throw new Error("config.json 로드 실패");
      CONFIG = await res.json();
    } catch (err) {
      console.error("config.json을 불러오지 못했습니다. 로컬 서버(예: python -m http.server)로 열어주세요.", err);
      document.body.innerHTML =
        '<p style="padding:60px 24px;text-align:center;font-size:13px;line-height:2;">config.json을 불러오지 못했습니다.<br>로컬 서버(예: python -m http.server) 또는 실제 호스팅 환경에서 열어주세요.</p>';
      return;
    }

    const time = CONFIG.wedding.time && CONFIG.wedding.time.trim() ? CONFIG.wedding.time : "00:00";
    weddingDate = new Date(`${CONFIG.wedding.date}T${time}:00`);
    dateObj = new Date(`${CONFIG.wedding.date}T12:00:00`);

    initHeartParticles();
    initConfig();
    buildCalendar();
    loadStoryImages();
    loadGalleryImages();
    initAccounts();
    initTop();
    initReveal();
  }

  loadConfigAndInit();
})();
