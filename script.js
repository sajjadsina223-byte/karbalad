
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "karbalad_businesses_v2";

  const sampleBusinesses = [
    {
      id: "sample-1",
      name: "خدمات فنی امید",
      category: "فنی و تعمیرات",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه‌ای برای معرفی خدمات فنی و تعمیرات عمومی منزل.",
      icon: "🛠️",
      sample: true
    },
    {
      id: "sample-2",
      name: "آموزشگاه دانش",
      category: "آموزش",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه نمایشی برای معرفی کلاس‌های آموزشی و تقویتی.",
      icon: "📚",
      sample: true
    },
    {
      id: "sample-3",
      name: "مرکز زیبایی بهار",
      category: "زیبایی و سلامت",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه‌ای برای معرفی خدمات زیبایی و مراقبت شخصی.",
      icon: "💇",
      sample: true
    },
    {
      id: "sample-4",
      name: "خدمات خانه آرام",
      category: "ساختمان و منزل",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه نمایشی برای معرفی خدمات منزل و ساختمان.",
      icon: "🏠",
      sample: true
    },
    {
      id: "sample-5",
      name: "خدمات خودرویی سریع",
      category: "خدمات خودرو",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه‌ای برای معرفی سرویس و تعمیر خودرو.",
      icon: "🚗",
      sample: true
    },
    {
      id: "sample-6",
      name: "خدمات محلی همراه",
      category: "سایر خدمات",
      location: "نمونه نمایشی",
      phone: "",
      description: "نمونه‌ای برای معرفی خدمات عمومی و محلی.",
      icon: "✨",
      sample: true
    }
  ];

  const businessGrid = document.getElementById("businessGrid");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const resultsDescription = document.getElementById("resultsDescription");
  const emptyState = document.getElementById("emptyState");
  const businessCount = document.getElementById("businessCount");

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  const registerModal = document.getElementById("registerModal");
  const registerForm = document.getElementById("registerForm");
  const closeModal = document.getElementById("closeModal");
  const toast = document.getElementById("toast");

  let businesses = loadBusinesses();
  let activeCategory = "";
  let searchTerm = "";
  let toastTimeout;

  function loadBusinesses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("خواندن اطلاعات ذخیره‌شده امکان‌پذیر نبود.", error);
    }

    return sampleBusinesses.map(item => ({ ...item }));
  }

  function saveBusinesses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
      return true;
    } catch (error) {
      console.warn("ذخیره اطلاعات امکان‌پذیر نبود.", error);
      showToast("ذخیره اطلاعات در مرورگر امکان‌پذیر نیست.");
      return false;
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .toLocaleLowerCase("fa")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function getBusinessIcon(category) {
    const icons = {
      "فنی و تعمیرات": "🛠️",
      "زیبایی و سلامت": "💇",
      "آموزش": "📚",
      "ساختمان و منزل": "🏠",
      "خدمات خودرو": "🚗",
      "سایر خدمات": "✨"
    };

    return icons[category] || "🏪";
  }

  function createBusinessCard(business) {
    const card = createElement("article", "business-card");
    const top = createElement("div", "business-card-top");
    const avatar = createElement(
      "div",
      "business-avatar",
      business.icon || getBusinessIcon(business.category)
    );

    avatar.setAttribute("aria-hidden", "true");

    const info = createElement("div", "business-info");
    const title = createElement("h3", "", business.name);
    const category = createElement(
      "span",
      "business-category",
      business.category
    );

    info.append(title, category);
    top.append(avatar, info);

    const description = createElement(
      "p",
      "business-description",
      business.description
    );

    const meta = createElement("div", "business-meta");
    const location = createElement(
      "span",
      "",
      "📍 " + (business.location || "مکان ثبت نشده")
    );

    meta.append(location);

    if (business.phone) {
      const phoneRow = createElement("span", "");
      const phoneLabel = createElement("span", "", "☎️");
      const phoneLink = createElement("a", "business-phone", business.phone);

      phoneLink.href = "tel:" + business.phone.replace(/[^\d+]/g, "");
      phoneRow.append(phoneLabel, phoneLink);
      meta.append(phoneRow);
    }

    if (business.sample) {
      meta.append(createElement("span", "sample-label", "ℹ️ آگهی نمونه"));
    }

    card.append(top, description, meta);
    return card;
  }

  function renderBusinesses() {
    if (!businessGrid) return;

    const filtered = businesses.filter(business => {
      const searchableText = normalizeText([
        business.name,
        business.category,
        business.location,
        business.description
      ].join(" "));

      const matchesSearch =
        !searchTerm || searchableText.includes(searchTerm);

      const matchesCategory =
        !activeCategory || business.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    businessGrid.replaceChildren();

    filtered.forEach(business => {
      businessGrid.append(createBusinessCard(business));
    });

    if (emptyState) {
      emptyState.classList.toggle("hidden", filtered.length > 0);
    }

    if (resultsDescription) {
      if (searchTerm || activeCategory) {
        resultsDescription.textContent =
          `${filtered.length.toLocaleString("fa-IR")} مورد مطابق جست‌وجو پیدا شد.`;
      } else {
        resultsDescription.textContent =
          "چند نمونه برای آشنایی با امکانات سامانه";
      }
    }

    if (businessCount) {
      businessCount.textContent = businesses.length.toLocaleString("fa-IR");
    }

    document.querySelectorAll(".category-card").forEach(button => {
      button.classList.toggle(
        "selected",
        button.dataset.category === activeCategory
      );
    });

    if (categoryFilter) {
      categoryFilter.value = activeCategory;
    }
  }

  function applySearch() {
    searchTerm = normalizeText(searchInput ? searchInput.value : "");
    renderBusinesses();

    const section = document.getElementById("businesses");

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function resetSearch() {
    searchTerm = "";
    activeCategory = "";

    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";

    renderBusinesses();
  }

  function showToast(message) {
    if (!toast) return;

    window.clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.remove("hidden");

    toastTimeout = window.setTimeout(() => {
      toast.classList.add("hidden");
    }, 3200);
  }

  function openRegistrationModal() {
    if (!registerModal) return;

    registerModal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    const firstInput = registerForm
      ? registerForm.querySelector('input[name="name"]')
      : null;

    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 50);
    }

    closeMobileMenu();
  }

  function closeRegistrationModal() {
    if (!registerModal) return;

    registerModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  function closeMobileMenu() {
    if (mainNav) mainNav.classList.remove("open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "باز کردن منو");
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      applySearch();
    });
  }

  document.querySelectorAll(".hint").forEach(button => {
    button.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = button.dataset.search || "";
      }

      applySearch();
    });
  });

  document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory =
        activeCategory === button.dataset.category
          ? ""
          : button.dataset.category;

      searchTerm = "";

      if (searchInput) searchInput.value = "";

      renderBusinesses();

      const section = document.getElementById("businesses");

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      activeCategory = categoryFilter.value;
      searchTerm = "";

      if (searchInput) searchInput.value = "";

      renderBusinesses();
    });
  }

  const showAllCategories = document.getElementById("showAllCategories");

  if (showAllCategories) {
    showAllCategories.addEventListener("click", () => {
      resetSearch();

      const section = document.getElementById("businesses");

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  const resetSearchButton = document.getElementById("resetSearch");

  if (resetSearchButton) {
    resetSearchButton.addEventListener("click", resetSearch);
  }

  const openRegister = document.getElementById("openRegister");
  const joinButton = document.getElementById("joinButton");
  const footerRegister = document.getElementById("footerRegister");

  [openRegister, joinButton, footerRegister].forEach(button => {
    if (button) {
      button.addEventListener("click", event => {
        event.preventDefault();
        openRegistrationModal();
      });
    }
  });

  if (closeModal) {
    closeModal.addEventListener("click", closeRegistrationModal);
  }

  if (registerModal) {
    registerModal.querySelectorAll("[data-close-modal]").forEach(element => {
      element.addEventListener("click", closeRegistrationModal);
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeRegistrationModal();
      closeMobileMenu();
    }
  });

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "بستن منو" : "باز کردن منو"
      );
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!registerForm.reportValidity()) return;

      const formData = new FormData(registerForm);

      const business = {
        id: "business-" + Date.now().toString(),
        name: String(formData.get("name") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        location: String(formData.get("location") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        icon: getBusinessIcon(String(formData.get("category") || "")),
        sample: false
      };

      if (
        !business.name ||
        !business.category ||
        !business.location ||
        !business.description
      ) {
        showToast("لطفاً فیلدهای ضروری را تکمیل کن.");
        return;
      }

      businesses.unshift(business);

      if (!saveBusinesses()) {
        businesses.shift();
        return;
      }

      registerForm.reset();
      closeRegistrationModal();

      searchTerm = "";
      activeCategory = "";

      if (searchInput) searchInput.value = "";

      renderBusinesses();
      showToast("آگهی در همین مرورگر ثبت شد.");

      const section = document.getElementById("businesses");

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  renderBusinesses();
});
