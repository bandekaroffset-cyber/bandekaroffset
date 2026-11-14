// ======================================================
// BANDEKAR OFFSET - ADMIN DASHBOARD
// Connected to Cloudflare API and D1 database
// ======================================================

const API_BASE = "https://api.bandekaroffset.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

let services = [];
let galleryImages = [];
let uploadedDocuments = [];
let lotteryUpdates = [];

let editingServiceId = null;
let editingLotteryId = null;

// ======================================================
// API HELPER
// ======================================================

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401 && !endpoint.includes("/api/login")) {
        window.location.href = "login.html";
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed (${response.status}).`);
    }

    return data;
}

function showMessage(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#c0392b" : "#247a45";
}

// ======================================================
// FILE HELPERS
// ======================================================

function validateFile(file, allowedTypes = []) {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name} is larger than 5 MB. Please choose a smaller file.`);
    }

    if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        throw new Error(`${file.name} has an unsupported file format.`);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));

        reader.readAsDataURL(file);
    });
}

async function uploadFile(file, type) {
    if (!file) return null;

    const base64 = await fileToBase64(file);

    return apiRequest(`/api/admin/upload?type=${encodeURIComponent(type)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            dataBase64: base64
        })
    });
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function createActionButton(text, className, onClick) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", onClick);

    return button;
}

// ======================================================
// LOGIN PAGE
// ======================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const button = loginForm.querySelector("button[type='submit']");

        showMessage(message, "Signing in...");

        button.disabled = true;

        try {
            await apiRequest("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            window.location.href = "dashboard.html";

        } catch (error) {
            showMessage(message, error.message, true);
            button.disabled = false;
        }
    });
}

// ======================================================
// DASHBOARD
// ======================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    initializeDashboard();
}

async function initializeDashboard() {
    try {
        await apiRequest("/api/me");
    } catch (error) {
        return;
    }

    setupNavigation();
    setupLogout();

    await loadAllDashboardData();
}

// ======================================================
// NAVIGATION
// ======================================================

function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");
    const managementCards = document.querySelectorAll(".management-card");

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove("active");
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
        });

        const selectedSection = document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.classList.add("active");
        }

        const selectedLink = document.querySelector(
            `.nav-link[data-section="${sectionId}"]`
        );

        if (selectedLink) {
            selectedLink.classList.add("active");
        }
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            showSection(link.dataset.section);
        });
    });

    managementCards.forEach(card => {
        card.addEventListener("click", () => {
            showSection(card.dataset.go);
        });
    });
}

// ======================================================
// LOGOUT
// ======================================================

function setupLogout() {
    logoutBtn.addEventListener("click", async () => {
        logoutBtn.disabled = true;

        try {
            await apiRequest("/api/logout", {
                method: "POST"
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        window.location.href = "login.html";
    });
}

// ======================================================
// LOAD DASHBOARD DATA
// ======================================================

async function loadAllDashboardData() {
    const results = await Promise.allSettled([
        loadServices(),
        loadGallery(),
        loadDocuments(),
        loadLottery(),
        loadWebsiteContent()
    ]);

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(`Dashboard section ${index + 1}:`, result.reason);
        }
    });
}

// ======================================================
// SERVICES
// ======================================================

async function loadServices() {
    services = await apiRequest("/api/admin/services");

    renderServices();
}

function renderServices() {
    const list = document.getElementById("serviceList");
    const count = document.getElementById("serviceCount");

    if (!list) return;

    list.replaceChildren();

    if (count) {
        count.textContent = `${services.length} services`;
    }

    if (services.length === 0) {
        const empty = createElement("div", "gallery-empty");
        empty.appendChild(createElement("span", "", "▧"));
        empty.appendChild(createElement("p", "", "No services added yet."));
        list.appendChild(empty);
        return;
    }

    services.forEach(service => {
        const card = createElement("div", "service-item");

        card.appendChild(createElement("h3", "", service.title));
        card.appendChild(createElement("p", "", service.description));

        if (Array.isArray(service.images) && service.images.length > 0) {
            const image = document.createElement("img");
            image.src = service.images[0];
            image.alt = service.title;
            image.className = "service-preview-image";
            card.appendChild(image);
        }

        const actions = createElement("div", "item-actions");

        actions.appendChild(createActionButton("Edit", "edit-btn", () => {
            editService(service.id);
        }));

        actions.appendChild(createActionButton("Delete", "delete-btn", () => {
            deleteService(service.id);
        }));

        card.appendChild(actions);
        list.appendChild(card);
    });
}

document.getElementById("serviceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("serviceName").value.trim();
    const description = document.getElementById("serviceDescription").value.trim();
    const imageFile = document.getElementById("serviceImage").files[0];
    const button = document.getElementById("serviceSubmitBtn");

    if (!name || !description) {
        alert("Please enter the service name and description.");
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    try {
        let existingService = services.find(
            service => service.id === editingServiceId
        );

        let images = existingService?.images || [];

        if (imageFile) {
            validateFile(imageFile, [
                "image/jpeg",
                "image/png",
                "image/webp"
            ]);

            const uploaded = await uploadFile(imageFile, "service");
            images = [uploaded.url];
        }

        const payload = {
            title: name,
            description,
            features: existingService?.features || [],
            images,
            sort_order: existingService?.sort_order ?? services.length
        };

        if (editingServiceId !== null) {
            await apiRequest(`/api/admin/services/${editingServiceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest("/api/admin/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        resetServiceForm();
        await loadServices();

        alert("Service saved successfully.");

    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = editingServiceId !== null
            ? "Save Changes"
            : "+ Add Service";
    }
});

function editService(id) {
    const service = services.find(item => item.id === id);

    if (!service) return;

    editingServiceId = id;

    document.getElementById("serviceName").value = service.title;
    document.getElementById("serviceDescription").value = service.description;
    document.getElementById("serviceImage").value = "";

    document.getElementById("serviceFormHeading").textContent = "Edit Service";
    document.getElementById("serviceSubmitBtn").textContent = "Save Changes";
    document.getElementById("cancelServiceEdit").hidden = false;

    document.getElementById("serviceForm").scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteService(id) {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
        await apiRequest(`/api/admin/services/${id}`, {
            method: "DELETE"
        });

        await loadServices();
        alert("Service deleted successfully.");

    } catch (error) {
        alert(error.message);
    }
}

function resetServiceForm() {
    document.getElementById("serviceForm").reset();

    editingServiceId = null;

    document.getElementById("serviceFormHeading").textContent = "Add New Service";
    document.getElementById("serviceSubmitBtn").textContent = "+ Add Service";
    document.getElementById("cancelServiceEdit").hidden = true;
}

document.getElementById("cancelServiceEdit")?.addEventListener("click", resetServiceForm);

// ======================================================
// GALLERY
// ======================================================

async function loadGallery() {
    galleryImages = await apiRequest("/api/admin/gallery");

    renderGallery();
}

function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    const count = document.getElementById("imageCount");

    if (!grid) return;

    grid.replaceChildren();

    if (count) {
        count.textContent = `${galleryImages.length} images`;
    }

    if (galleryImages.length === 0) {
        const empty = createElement("div", "gallery-empty");
        empty.appendChild(createElement("span", "", "▧"));
        empty.appendChild(createElement("p", "", "No images uploaded yet."));
        grid.appendChild(empty);
        return;
    }

    galleryImages.forEach(item => {
        const card = createElement("div", "gallery-item");

        const image = document.createElement("img");
        image.src = item.file_url;
        image.alt = item.title || "Gallery image";

        card.appendChild(image);
        card.appendChild(createElement("p", "", item.title || "Image"));

        card.appendChild(createActionButton("Delete", "delete-btn", () => {
            deleteGalleryImage(item.id);
        }));

        grid.appendChild(card);
    });
}

function setupGalleryUpload() {
    const input = document.getElementById("galleryInput");

    document.getElementById("chooseImagesBtn")?.addEventListener("click", () => {
        input?.click();
    });

    document.getElementById("browseImagesBtn")?.addEventListener("click", () => {
        input?.click();
    });

    input?.addEventListener("change", async () => {
        const files = Array.from(input.files || []);

        if (!files.length) return;

        try {
            for (const file of files) {
                validateFile(file, [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ]);

                await uploadFile(file, "gallery");
            }

            await loadGallery();
            alert("Gallery images uploaded successfully.");

        } catch (error) {
            alert(error.message);
        }

        input.value = "";
    });
}

async function deleteGalleryImage(id) {
    if (!confirm("Delete this gallery image?")) return;

    try {
        await apiRequest(`/api/admin/gallery/${id}`, {
            method: "DELETE"
        });

        await loadGallery();

    } catch (error) {
        alert(error.message);
    }
}

// ======================================================
// DOCUMENTS
// ======================================================

async function loadDocuments() {
    uploadedDocuments = await apiRequest("/api/admin/documents");

    renderDocuments();
}

function renderDocuments() {
    const grid = document.getElementById("documentGrid");
    const count = document.getElementById("documentCount");

    if (!grid) return;

    grid.replaceChildren();

    if (count) {
        count.textContent = `${uploadedDocuments.length} documents`;
    }

    if (uploadedDocuments.length === 0) {
        const empty = createElement("div", "gallery-empty");
        empty.appendChild(createElement("span", "", "▤"));
        empty.appendChild(createElement("p", "", "No documents uploaded yet."));
        grid.appendChild(empty);
        return;
    }

    uploadedDocuments.forEach(item => {
        const card = createElement("div", "document-card");

        card.appendChild(createElement("h3", "", item.title || "PDF Document"));

        const openLink = document.createElement("a");
        openLink.href = item.file_url;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";
        openLink.textContent = "View PDF";

        card.appendChild(openLink);

        card.appendChild(createActionButton("Delete", "delete-btn", () => {
            deleteDocument(item.id);
        }));

        grid.appendChild(card);
    });
}

function setupDocumentUpload() {
    const input = document.getElementById("documentInput");

    document.getElementById("chooseDocumentsBtn")?.addEventListener("click", () => {
        input?.click();
    });

    document.getElementById("browseDocumentsBtn")?.addEventListener("click", () => {
        input?.click();
    });

    input?.addEventListener("change", async () => {
        const files = Array.from(input.files || []);

        if (!files.length) return;

        try {
            for (const file of files) {
                validateFile(file, ["application/pdf"]);
                await uploadFile(file, "document");
            }

            await loadDocuments();
            alert("Documents uploaded successfully.");

        } catch (error) {
            alert(error.message);
        }

        input.value = "";
    });
}

async function deleteDocument(id) {
    if (!confirm("Delete this document?")) return;

    try {
        await apiRequest(`/api/admin/documents/${id}`, {
            method: "DELETE"
        });

        await loadDocuments();

    } catch (error) {
        alert(error.message);
    }
}

// ======================================================
// LOTTERY UPDATES
// ======================================================

async function loadLottery() {
    lotteryUpdates = await apiRequest("/api/admin/lottery");

    renderLottery();
}

function renderLottery() {
    const list = document.getElementById("lotteryList");
    const count = document.getElementById("lotteryCount");

    if (!list) return;

    list.replaceChildren();

    if (count) {
        count.textContent = `${lotteryUpdates.length} updates`;
    }

    if (lotteryUpdates.length === 0) {
        const empty = createElement("div", "gallery-empty");
        empty.appendChild(createElement("span", "", "◇"));
        empty.appendChild(createElement("p", "", "No lottery updates added yet."));
        list.appendChild(empty);
        return;
    }

    lotteryUpdates.forEach(item => {
        const card = createElement("div", "lottery-item");

        card.appendChild(createElement("p", "section-label", item.category));
        card.appendChild(createElement("h3", "", item.title));
        card.appendChild(createElement("p", "", item.description || ""));

        if (item.image_key) {
            const image = document.createElement("img");
            image.src = item.image_key.startsWith("http")
                ? item.image_key
                : "";
            image.alt = item.title;
            image.className = "lottery-preview-image";

            if (image.src) card.appendChild(image);
        }

        if (item.pdf_key) {
            card.appendChild(createElement("p", "", "PDF attached"));
        }

        const actions = createElement("div", "item-actions");

        actions.appendChild(createActionButton("Edit", "edit-btn", () => {
            editLottery(item.id);
        }));

        actions.appendChild(createActionButton("Delete", "delete-btn", () => {
            deleteLottery(item.id);
        }));

        card.appendChild(actions);
        list.appendChild(card);
    });
}

document.getElementById("lotteryForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const category = document.getElementById("lotteryCategory").value.trim();
    const title = document.getElementById("lotteryTitle").value.trim();
    const description = document.getElementById("lotteryDescription").value.trim();

    const imageFile = document.getElementById("lotteryImage").files[0];
    const pdfFile = document.getElementById("lotteryPDF").files[0];

    const button = document.getElementById("lotterySubmitBtn");

    const existing = lotteryUpdates.find(
        item => item.id === editingLotteryId
    );

    if (!category || !title) {
        alert("Please enter the lottery category and title.");
        return;
    }

    if (!existing && !pdfFile) {
        alert("Please select a PDF for the new lottery update.");
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const payload = {
            category,
            title,
            description
        };

        if (pdfFile) {
            validateFile(pdfFile, ["application/pdf"]);

            const uploadedPDF = await uploadFile(pdfFile, "lottery-pdf");
            payload.pdf_key = uploadedPDF.key;
        }

        if (imageFile) {
            validateFile(imageFile, [
                "image/jpeg",
                "image/png",
                "image/webp"
            ]);

            const uploadedImage = await uploadFile(imageFile, "lottery-image");
            payload.image_key = uploadedImage.key;
        }

        if (editingLotteryId !== null) {
            await apiRequest(`/api/admin/lottery/${editingLotteryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest("/api/admin/lottery", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        resetLotteryForm();
        await loadLottery();

        alert("Lottery update saved successfully.");

    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = editingLotteryId !== null
            ? "Save Changes"
            : "+ Add Lottery Update";
    }
});

function editLottery(id) {
    const item = lotteryUpdates.find(update => update.id === id);

    if (!item) return;

    editingLotteryId = id;

    document.getElementById("lotteryCategory").value = item.category || "";
    document.getElementById("lotteryTitle").value = item.title || "";
    document.getElementById("lotteryDescription").value = item.description || "";

    document.getElementById("lotteryImage").value = "";
    document.getElementById("lotteryPDF").value = "";

    document.getElementById("lotterySubmitBtn").textContent = "Save Changes";
    document.getElementById("cancelLotteryEdit").hidden = false;

    document.getElementById("lotteryForm").scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteLottery(id) {
    if (!confirm("Delete this lottery update?")) return;

    try {
        await apiRequest(`/api/admin/lottery/${id}`, {
            method: "DELETE"
        });

        await loadLottery();
        alert("Lottery update deleted.");

    } catch (error) {
        alert(error.message);
    }
}

function resetLotteryForm() {
    document.getElementById("lotteryForm").reset();

    editingLotteryId = null;

    document.getElementById("lotterySubmitBtn").textContent = "+ Add Lottery Update";
    document.getElementById("cancelLotteryEdit").hidden = true;
}

document.getElementById("cancelLotteryEdit")?.addEventListener("click", resetLotteryForm);

// ======================================================
// WEBSITE CONTENT
// ======================================================

async function loadWebsiteContent() {
    const content = await apiRequest("/api/admin/content");

    const fields = [
        "homeHeading",
        "homeDescription",
        "aboutHeading",
        "aboutDescription",
        "businessAddress",
        "businessPhone",
        "businessEmail"
    ];

    fields.forEach(key => {
        const field = document.getElementById(key);

        if (field) {
            field.value = content[key] || "";
        }
    });
}

document.getElementById("websiteContentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = event.currentTarget.querySelector("button[type='submit']");
    const message = document.getElementById("contentSaveMessage");

    const payload = {
        homeHeading: document.getElementById("homeHeading").value.trim(),
        homeDescription: document.getElementById("homeDescription").value.trim(),
        aboutHeading: document.getElementById("aboutHeading").value.trim(),
        aboutDescription: document.getElementById("aboutDescription").value.trim(),
        businessAddress: document.getElementById("businessAddress").value.trim(),
        businessPhone: document.getElementById("businessPhone").value.trim(),
        businessEmail: document.getElementById("businessEmail").value.trim()
    };

    button.disabled = true;
    showMessage(message, "Saving changes...");

    try {
        await apiRequest("/api/admin/content", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        showMessage(message, "Changes saved successfully.");

    } catch (error) {
        showMessage(message, error.message, true);
    } finally {
        button.disabled = false;
    }
});

// ======================================================
// INITIALIZE UPLOAD CONTROLS
// ======================================================

if (logoutBtn) {
    setupGalleryUpload();
    setupDocumentUpload();
}