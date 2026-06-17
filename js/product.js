const products = {

    printondemand: {
        title: "Print On Demand",
        description: "Custom printing solutions for t-shirts, mugs, merchandise, gifts, and promotional products with no minimum order quantity.",
        images: []
    },

    books: {
        title: "Books & Booklets",
        description: "Premium-quality books, catalogues, annual reports, manuals, and booklets.",
        images: [
            "images/Book/satya ke talash.jpg"
        ]
    },

    brochures: {
        title: "Brochures & Leaflets",
        description: "Professional marketing materials that effectively showcase your products and services.",
        images: [
            "images/Broucher/KK Birla Goa Campus.webp",
            "images/Broucher/OSIA ESTATE - OFFSET SETUP.webp",
            "images/Broucher/broucher.jpg"
        ]
    },

    lottery_tickets: {
        title: "Lottery Tickets",
        description: "Secure and customized lottery tickets with professional printing and anti-tampering features.",
        images: [
            "images/Lottery/Quepem.webp"
        ]
    },

    restaurant_menu: {
        title: "Restaurant Menu",
        description: "Durable and attractive menu designs that enhance your customers' dining experience.",
        images: [
            "images/Menu/Crazy Carvings.webp",
            "images/Menu/juice junction.webp"
        ]
    },

    certificate: {
        title: "Certificates",
        description: "Professionally printed certificates for schools, institutions, events, and corporate recognition.",
        images: [
            "images/certificates/ALL GOA MATHEMATICS TEACHERS' ASSOCIATION.webp",
            "images/certificates/CCMC.webp",
            "images/certificates/GCQ Quepem.webp",
            "images/certificates/RAKHNNEA BHODDVEACHI FIRGOZ 2025.webp",
            "images/certificates/Sanvordem Ganesh Ustav Mandal.webp",
            "images/certificates/jan utkarsh pre-primary & High school.webp"
        ]
    },

    envelop: {
        title: "Envelope",
        description: "Custom printed envelopes that strengthen your professional and corporate identity.",
        images: [
            "images/Envelopes/Chandrakanta Developers_094906.webp",
            "images/Envelopes/Harshada.webp",
            "images/Envelopes/Mallikarjun Body Builders.webp"
        ]
    },

    calendar: {
        title: "Calendar",
        description: "Custom wall and desk calendars featuring your branding, products, or promotional content.",
        images: [
            "images/calenders/Bandekar Offset.webp",
            "images/calenders/Dainik Ayodhya Times.webp",
            "images/calenders/Madira center new.webp",
            "images/calenders/Sankalp 2026.webp",
            "images/calenders/Ultramar Agencies.webp",
            "images/calenders/bandekar enterprises.webp"
        ]
    },

    diary: {
        title: "Diary",
        description: "Custom-branded diaries and planners ideal for corporate gifting and everyday use.",
        images: []
    },

    signage: {
        title: "Signage",
        description: "Eye-catching illuminated signboards and LED displays for businesses and retail stores.",
        images: []
    },

    flex_banner: {
        title: "Flex Banner",
        description: "Weather-resistant flex printing solutions for outdoor advertising and event promotions.",
        images: []
    },

    led_signage: {
        title: "LED Signage",
        description: "Eye-catching illuminated signboards and LED displays for businesses and retail stores.",
        images: []
    },

    banners_posters: {
        title: "Banners & Posters",
        description: "High-impact promotional prints for events, advertising campaigns, and business branding.",
        images: []
    },

    invitation: {
        title: "Invitation Cards",
        description: "Beautifully crafted invitation cards designed to make your special occasion memorable.",
        images: [
            "images/Wedding cards/BLASIO aNISHA.jpg",
            "images/Wedding cards/Flocy & Daniel.webp",
            "images/Wedding cards/Reshma Weds Ayub.webp",
            "images/Wedding cards/Ruksar & Iliyas.webp"
        ]
    },

    id_card: {
        title: "ID Card",
        description: "High-quality employee, student, visitor, and membership identification cards.",
        images: []
    },

    stamps: {
        title: "Stamps",
        description: "Custom rubber stamps, self-inking stamps, date stamps, embossing seals, and common seals.",
        images: []
    }

};

/* ── READ URL PARAM ── */
// Supports both ?service=calendar and ?product=calendar
const params = new URLSearchParams(window.location.search);
const key = params.get("service") || params.get("product");
const product = products[key];

/* ── DOM REFS ── */
const titleEl       = document.getElementById("productTitle");
const descEl        = document.getElementById("productDescription");
const sliderImage   = document.getElementById("sliderImage");
const imageCounter  = document.getElementById("imageCounter");
const prevBtn       = document.getElementById("prevBtn");
const nextBtn       = document.getElementById("nextBtn");
const lightbox      = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

let currentIndex = 0;

/* ── POPULATE PAGE ── */
if (product) {

    titleEl.textContent = product.title;
    descEl.textContent  = product.description;

    if (product.images.length > 0) {

        function showImage(index) {
            sliderImage.src = product.images[index];
            sliderImage.alt = product.title;
            imageCounter.textContent = `${index + 1} / ${product.images.length}`;
        }

        showImage(currentIndex);

        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + product.images.length) % product.images.length;
            showImage(currentIndex);
        });

        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % product.images.length;
            showImage(currentIndex);
        });

        /* ── LIGHTBOX ── */
        sliderImage.addEventListener("click", () => {
            lightboxImage.src = sliderImage.src;
            lightbox.style.display = "flex";
        });

    } else {

        sliderImage.style.display = "none";
        prevBtn.style.display     = "none";
        nextBtn.style.display     = "none";
        imageCounter.textContent  = "Images coming soon.";

    }

} else {

    titleEl.textContent = "Product Not Found";
    descEl.textContent  = "Sorry, this product gallery does not exist.";
    sliderImage.style.display = "none";
    prevBtn.style.display     = "none";
    nextBtn.style.display     = "none";

}

/* ── CLOSE LIGHTBOX ── */
closeLightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
});

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
});
