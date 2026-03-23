/* --- HÀM TỐI ƯU HIỆU SUẤT (THROTTLE) --- */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/* --- TẤT CẢ CÁC HÀM GỐC CỦA BẠN --- */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initActiveNavLinks();
  initHomepageSlideshow();
  initMobileDropdown(); // Đã sửa hàm này
  initGoToTopButton();
  initYearUpdater();
});

// CHỨC NĂNG 1: XỬ LÝ MENU TRÊN DI ĐỘNG
function initMobileMenu() {
  const menuIcon = document.getElementById("menu-icon");
  const navLinks = document.getElementById("nav-links");
  const menuOverlay = document.getElementById("menu-overlay");

  function toggleMenu() {
    menuIcon.classList.toggle("active");
    navLinks.classList.toggle("active");
    menuOverlay.classList.toggle("active");

    const open = navLinks.classList.contains("active");
    menuIcon.setAttribute("aria-expanded", open ? "true" : "false");
    menuIcon.setAttribute(
      "aria-label",
      open ? "Đóng menu điều hướng" : "Mở menu điều hướng"
    );

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  if (menuIcon) {
    menuIcon.addEventListener("click", toggleMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", toggleMenu);
  }
}

// CHỨC NĂNG 2: LÀM NỔI BẬT LINK MENU (ĐÃ SỬA LỖI NHẬN NHẦM TRANG CHỦ)
function initActiveNavLinks() {
  // Lấy đường dẫn hiện tại và xóa dấu / ở cuối nếu có (để so sánh chính xác)
  let currentPath = window.location.pathname;
  if (currentPath.length > 1 && currentPath.endsWith("/")) {
    currentPath = currentPath.slice(0, -1);
  }

  const navLinksList = document.querySelectorAll(".navbar .nav-links a");

  navLinksList.forEach((link) => {
    // 1. Xóa active cũ
    link.classList.remove("active");

    // 2. Lấy href gốc từ HTML
    const href = link.getAttribute("href");

    // 3. QUAN TRỌNG: Nếu là javascript:void(0) hoặc # thì BỎ QUA NGAY, không xử lý tiếp
    if (!href || href.startsWith("javascript") || href === "#") {
      return;
    }

    // 4. Lấy đường dẫn của link cần so sánh
    try {
      const urlObj = new URL(link.href, window.location.origin);
      let linkPath = urlObj.pathname;

      // Xóa dấu / ở cuối link menu nếu có
      if (linkPath.length > 1 && linkPath.endsWith("/")) {
        linkPath = linkPath.slice(0, -1);
      }

      // 5. So sánh chính xác (Dành cho trang chủ hoặc trang con cụ thể)
      if (currentPath === linkPath) {
        link.classList.add("active");

        // Bôi đỏ luôn cả menu cha (nếu nằm trong dropdown)
        const parentDropdown = link.closest(".dropdown");
        if (parentDropdown) {
          // Chỉ chọn thẻ a cấp 1 của dropdown đó
          const parentToggle = parentDropdown.querySelector(":scope > a");
          if (parentToggle) parentToggle.classList.add("active");
        }
      }

      // 6. So sánh tương đối (Dành cho việc đang ở bài viết con của 1 mục)
      // Ví dụ: Đang ở /dich-vu/thu-mua-dong thì menu /dich-vu/ cũng sáng
      else if (
        linkPath !== "" &&
        linkPath !== "/" &&
        currentPath.startsWith(linkPath)
      ) {
        link.classList.add("active");

        const parentDropdown = link.closest(".dropdown");
        if (parentDropdown) {
          const parentToggle = parentDropdown.querySelector(":scope > a");
          if (parentToggle) parentToggle.classList.add("active");
        }
      }
    } catch (e) {
      // Nếu lỗi url thì bỏ qua
    }
  });
}

// CHỨC NĂNG 3: CHẠY SLIDESHOW
function initHomepageSlideshow() {
  const heroSection = document.getElementById("hero");
  if (!heroSection) return;

  const slides = heroSection.querySelectorAll(".slide");
  if (slides.length <= 1) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return;

  let currentSlide = 0;
  const slideInterval = 5000;
  let timerId;

  function showNextSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }

  function start() {
    if (timerId) return;
    timerId = setInterval(showNextSlide, slideInterval);
  }

  function stop() {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
  }

  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
}

// --- CHỨC NĂNG 4: ĐÃ SỬA LẠI (QUAN TRỌNG) ---
// Xử lý cho TẤT CẢ các menu dropdown thay vì chỉ cái đầu tiên
function initMobileDropdown() {
  // 1. Chọn TẤT CẢ các thẻ a nằm trong .dropdown (dùng querySelectorAll)
  const dropdownToggles = document.querySelectorAll(".dropdown > a");

  // 2. Duyệt qua từng menu tìm thấy
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      // Chỉ chạy logic dropdown trên mobile
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Chặn chuyển trang

        // Tìm menu con nằm ngay kế bên thẻ a vừa click (thẻ ul.dropdown-menu)
        const dropdownMenu = this.nextElementSibling;

        if (dropdownMenu && dropdownMenu.classList.contains("dropdown-menu")) {
          dropdownMenu.classList.toggle("show");
        }
      }
    });
  });
}

// CHỨC NĂNG 5: CẬP NHẬT NĂM HIỆN TẠI
function initYearUpdater() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// CHỨC NĂNG 6: NÚT GO TO TOP
function initGoToTopButton() {
  const goToTopBtn = document.getElementById("goToTopBtn");
  if (!goToTopBtn) return;

  function handleScroll() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTop > 300) {
      goToTopBtn.style.display = "flex";
    } else {
      goToTopBtn.style.display = "none";
    }
  }

  window.addEventListener("scroll", throttle(handleScroll, 200));

  goToTopBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
