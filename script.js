
"use strict";

const STORAGE_KEY = "karbalad_businesses_v1";

const sampleBusinesses = [
    {
        id: "sample-1",
        name: "تعمیرات فنی نوین",
        owner: "علی رضایی",
        category: "فنی",
        city: "نیشابور",
        phone: "",
        address: "مرکز شهر",
        icon: "🔧",
        description: "ارائه خدمات تعمیراتی و فنی با تمرکز بر کیفیت کار و پاسخ‌گویی مناسب.",
        createdAt: 3
    },
    {
        id: "sample-2",
        name: "سالن زیبایی ماه‌چهره",
        owner: "مریم احمدی",
        category: "زیبایی",
        city: "نیشابور",
        phone: "",
        address: "مرکز شهر",
        icon: "💇",
        description: "خدمات آرایش و زیبایی، مراقبت مو و ارائه مشاوره زیبایی.",
        createdAt: 2
    },
    {
        id: "sample-3",
        name: "آموزشگاه دانش‌گستر",
        owner: "فاطمه محمدی",
        category: "آموزش",
        city: "نیشابور",
        phone: "",
        address: "محدوده مرکزی",
        icon: "📚",
        description: "آموزش و یادگیری مهارت‌های درسی و برگزاری کلاس‌های آموزشی.",
        createdAt: 1
    },
    {
        id: "sample-4",
        name: "فروشگاه رنگین‌کمان",
        owner: "حسین کریمی",
        category: "فروشگاه",
        city: "نیشابور",
        phone: "",
        address: "بازار شهر",
        icon: "🛒",
        description: "فروش محصولات متنوع و ارائه خدمات مناسب به مشتریان.",
        createdAt: 4
    },
    {
        id: "sample-5",
        name: "مرکز خدمات خودرو",
        owner: "رضا موسوی",
        category: "خودرو",
        city: "نیشابور",
        phone: "",
        address: "حاشیه شهر",
        icon: "🚘",
        description: "خدمات عمومی خودرو و بررسی مشکلات فنی.",
        createdAt: 5
    },
    {
        id: "sample-6",
        name: "مشاوره و خدمات سلامت",
        owner: "تیم خدمات سلامت",
        category: "سلامت",
        city: "نیشابور",
        phone: "",
        address: "مرکز شهر",
        icon: "🩺",
        description: "معرفی خدمات مرتبط با سلامت؛ اطلاعات تخصص و مجوزها را پیش از مراجعه بررسی کنید.",
        createdAt: 6
    }
];

const businessGrid = document.getElementById("businessGrid");
const categoryGrid = document.getElementById("categoryGrid");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");
const sortSelect = document.getElementById("sortSelect");
const resultsCount = document.getElementById("resultsCount");
const statBusinesses = document.getElementById("statBusinesses");
const emptyState = document.getElementById("emptyState");
const resetSearch = document.getElementById("resetSearch");

const adminModal = document.getElementById("adminModal");
const adminOpen = document.getElementById("adminOpen");
const closeModal = document.getElementById("closeModal");
const cancelForm = document.getElementById("cancelForm");
const businessForm = document.getElementById("businessForm");
const joinButton = document.getElementById("joinButton");
const toast = document.getElementById("toast");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

let selectedCategory = "همه";
let searchTerm = "";
let toastTimeout = null;

// خواندن اطلاعات ذخیره‌شده
function loadBusinesses() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored !== null) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("خطا در خواندن اطلاعات:", error);
    }

    return sampleBusinesses.map(item => ({ ...item }));
}

let businesses = loadBusinesses();

// ذخیره اطلاعات در مرورگر
function saveBusinesses() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        return true;
    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);
        showToast("ذخیره اطلاعات ناموفق بود. فضای مرورگر را بررسی کن.");
        return false;
    }
}

// جلوگیری از تفسیر اطلاعات ورودی به‌عنوان HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// تبدیل اعداد به فارسی
function toPersianNumber(value) {
    return Number(value).toLocaleString("fa-IR");
}

// پیام کوتاه پایین صفحه
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// کلاس رنگی کارت
function getCoverClass(category) {
    const classes = {
        "فنی": "orange-cover",
        "زیبایی": "pink-cover",
        "آموزش": "blue-cover",
        "سلامت": "green-cover",
        "فروشگاه": "orange-cover",
        "خودرو": "cyan-cover",
        "سایر": "blue-cover"
    };

    return classes[category] || "";
}

// فیلتر و مرتب‌سازی مشاغل
function getFilteredBusinesses() {
    const term = searchTerm.trim().toLocaleLowerCase("fa");

    let filtered = businesses.filter(business => {
        const categoryMatches =
            selectedCategory === "همه" ||
            business.category === selectedCategory;

        const searchableText = [
            business.name,
            business.owner,
            business.category,
            business.city,
            business.address,
            business.description
        ].join(" ").toLocaleLowerCase("fa");

        const searchMatches = !term || searchableText.includes(term);

        return categoryMatches && searchMatches;
    });

    if (sortSelect.value === "name") {
        filtered.sort((a, b) =>
            String(a.name).localeCompare(String(b.name), "fa")
        );
    } else {
        filtered.sort((a, b) =>
            Number(b.createdAt || 0) - Number(a.createdAt || 0)
        );
    }

    return filtered;
}

// ساخت کارت هر کسب‌وکار
function createBusinessCard(business) {
    const name = escapeHTML(business.name);
    const owner = escapeHTML(business.owner || "معرفی کسب‌وکار");
    const category = escapeHTML(business.category);
    const city = escapeHTML(business.city);
    const address = escapeHTML(business.address || "نشانی ثبت نشده");
    const description = escapeHTML(business.description);
    const icon = escapeHTML(business.icon || "🏢");
    const coverClass = getCoverClass(business.category);
    const phone = String(business.phone || "").trim();

    const safePhone = /^[+0-9۰-۹٠-٩()\-\s]{7,20}$/.test(phone)
        ? phone.replace(/[^\d+]/g, "")
            .replace(/[۰-۹]/g, digit =>
                String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
            )
            .replace(/[٠-٩]/g, digit =>
                String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
            )
        : "";

    const phoneAction = safePhone
        ? `<a class="btn card-phone" href="tel:${escapeHTML(safePhone)}">☎ تماس</a>`
        : `<button class="btn card-phone no-phone" type="button">☎ تماس</button>`;

    const deleteButton = `
        <button
            class="delete-listing"
            type="button"
            data-delete-id="${escapeHTML(business.id)}">
            🗑 حذف آگهی از این مرورگر
        </button>
    `;

    return `
        <article class="business-card">
            <div class="card-cover ${coverClass}">
                <span class="card-category">${category}</span>
                <span class="card-emoji">${icon}</span>
            </div>

            <div class="card-body">
                <h3>${name}</h3>
                <p class="card-owner">${owner}</p>
                <p class="card-description">${description}</p>

                <div class="card-location">
                    <span>📍</span>
                    <span>${city} · ${address}</span>
                </div>

                <div class="card-actions">
                    ${phoneAction}
                    <button
                        class="btn btn-outline detail-button"
                        type="button"
                        data-detail-id="${escapeHTML(business.id)}">
                        جزئیات
                    </button>
                </div>

                <div class="admin-delete-slot"></div>
            </div>
        </article>
    `;
}

// نمایش کارت‌ها
function renderBusinesses() {
    const filtered = getFilteredBusinesses();

    businessGrid.innerHTML = filtered
        .map(createBusinessCard)
        .join("");

    resultsCount.textContent = `${toPersianNumber(filtered.length)} مورد`;
    statBusinesses.textContent = toPersianNumber(businesses.length);

    emptyState.classList.toggle("hidden", filtered.length !== 0);

    // دکمه حذف فقط در حالت مدیریت ظاهر می‌شود
    document.querySelectorAll(".admin-delete-slot").forEach(slot => {
        if (adminMode) {
            slot.innerHTML = slot.closest(".business-card")
                .querySelector("[data-detail-id]")
                ? ""
                : "";
        }
    });

    if (adminMode) {
        document.querySelectorAll(".business-card").forEach(card => {
            const detailButton = card.querySelector("[data-detail-id]");
            const slot = card.querySelector(".admin-delete-slot");

            if (detailButton && slot) {
                slot.innerHTML = `
                    <button
                        class="delete-listing"
                        type="button"
                        data-delete-id="${detailButton.dataset.detailId}">
                        🗑 حذف آگهی از این مرورگر
                    </button>
                `;
            }
        });
    }

    observeReveals();
}

// پنل مدیریت آزمایشی
let adminMode = false;

function openModal() {
    adminModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        const firstInput = businessForm.querySelector("input");
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModalWindow() {
    adminModal.classList.add("hidden");
    document.body.style.overflow = "";
}

adminOpen.addEventListener("click", () => {
    adminMode = !adminMode;

    if (adminMode) {
        adminOpen.textContent = "✓ خروج از مدیریت";
        showToast("حالت مدیریت آزمایشی فعال شد.");
        renderBusinesses();
    } else {
        adminOpen.textContent = "⚙ پنل مدیریت";
        showToast("از حالت مدیریت خارج شدی.");
        renderBusinesses();
    }

    openModal();
});

closeModal.addEventListener("click", closeModalWindow);
cancelForm.addEventListener("click", closeModalWindow);

adminModal.addEventListener("click", event => {
    if (event.target.dataset.close === "true") {
        closeModalWindow();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !adminModal.classList.contains("hidden")) {
        closeModalWindow();
    }
});

joinButton.addEventListener("click", openModal);

// ثبت کسب‌وکار جدید
businessForm.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(businessForm);

    const name = String(formData.get("name") || "").trim();
    const owner = String(formData.get("owner") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const icon = String(formData.get("icon") || "🏢");

    if (!name || !category || !city || !description) {
        showToast("لطفاً فیلدهای ضروری را تکمیل کن.");
        return;
    }

    if (phone && !/^[+0-9۰-۹٠-٩()\-\s]{7,20}$/.test(phone)) {
        showToast("شماره تماس واردشده معتبر نیست.");
        return;
    }

    const newBusiness = {
        id: "biz-" + Date.now().toString(36) + "-" +
            Math.random().toString(36).slice(2, 7),
        name,
        owner,
        category,
        city,
        phone,
        address,
        description,
        icon,
        createdAt: Date.now()
    };

    businesses.unshift(newBusiness);

    if (!saveBusinesses()) {
        businesses.shift();
        return;
    }

    selectedCategory = "همه";
    searchTerm = "";
    searchInput.value = "";
    filterInput.value = "";

    updateCategoryButtons();
    renderBusinesses();
    businessForm.reset();
    closeModalWindow();

    document.getElementById("businesses").scrollIntoView({
        behavior: "smooth"
    });

    showToast("کسب‌وکار با موفقیت در این مرورگر ثبت شد.");
});

// کلیک روی دسته‌بندی‌ها
categoryGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;
    updateCategoryButtons();
    renderBusinesses();

    document.getElementById("businesses").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

function updateCategoryButtons() {
    document.querySelectorAll(".category-card").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === selectedCategory
        );
    });
}

// جست‌وجوی اصلی
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchTerm = searchInput.value.trim();
    filterInput.value = searchInput.value;
    renderBusinesses();

    document.getElementById("businesses").scrollIntoView({
        behavior: "smooth"
    });
});

// جست‌وجوی زنده در فهرست
filterInput.addEventListener("input", () => {
    searchTerm = filterInput.value;
    searchInput.value = filterInput.value;
    renderBusinesses();
});

sortSelect.addEventListener("change", renderBusinesses);

// جست‌وجوهای محبوب
document.querySelectorAll(".search-tag").forEach(button => {
    button.addEventListener("click", () => {
        searchInput.value = button.dataset.search;
        filterInput.value = button.dataset.search;
        searchTerm = button.dataset.search;
        selectedCategory = "همه";

        updateCategoryButtons();
        renderBusinesses();

        document.getElementById("businesses").scrollIntoView({
            behavior: "smooth"
        });
    });
});

// نمایش جزئیات
businessGrid.addEventListener("click", event => {
    const detailButton = event.target.closest("[data-detail-id]");
    const noPhoneButton = event.target.closest(".no-phone");
    const deleteButton = event.target.closest("[data-delete-id]");

    if (noPhoneButton) {
        showToast("برای این کسب‌وکار هنوز شماره تماس ثبت نشده است.");
        return;
    }

    if (detailButton) {
        const business = businesses.find(
            item => item.id === detailButton.dataset.detailId
        );

        if (!business) return;

        const message = [
            business.name,
            "دسته‌بندی: " + business.category,
            "مسئول: " + (business.owner || "ثبت نشده"),
            "شهر: " + business.city,
            "نشانی: " + (business.address || "ثبت نشده"),
            "تماس: " + (business.phone || "ثبت نشده"),
            "توضیحات: " + business.description
        ].join("\n");

        alert(message);
        return;
    }

    if (deleteButton) {
        if (!adminMode) {
            showToast("برای حذف آگهی، ابتدا حالت مدیریت را فعال کن.");
            return;
        }

        const business = businesses.find(
            item => item.id === deleteButton.dataset.deleteId
        );

        if (!business) return;

        const confirmed = confirm(
            `آیا می‌خواهی آگهی «${business.name}» را از این مرورگر حذف کنی؟`
        );

        if (!confirmed) return;

        const previousBusinesses = businesses;
        businesses = businesses.filter(
            item => item.id !== deleteButton.dataset.deleteId
        );

        if (!saveBusinesses()) {
            businesses = previousBusinesses;
            return;
        }

        renderBusinesses();
        showToast("آگهی از این مرورگر حذف شد.");
    }
});

// دکمه بازنشانی جست‌وجو
resetSearch.addEventListener("click", () => {
    selectedCategory = "همه";
    searchTerm = "";
    searchInput.value = "";
    filterInput.value = "";
    sortSelect.value = "newest";

    updateCategoryButtons();
    renderBusinesses();
});

// منوی موبایل
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// انیمیشن ورود بخش‌ها هنگام اسکرول
let revealObserver = null;

function observeReveals() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal").forEach(element => {
            element.classList.add("visible");
        });
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });
    }

    document.querySelectorAll(".reveal:not(.visible)").forEach(element => {
        revealObserver.observe(element);
    });
}

// سال جاری
document.getElementById("currentYear").textContent =
    new Date().getFullYear();

// راه‌اندازی اولیه
updateCategoryButtons();
renderBusinesses();
observeReveals();
