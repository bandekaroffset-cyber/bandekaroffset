const products = {

    wedding: {
        title: "Wedding Invitations",
        description: "Beautifully crafted invitation cards designed to make your special occasion memorable.",

        images: [
            "images/wedding/1.jpg",
            "images/wedding/2.jpg",
            "images/wedding/3.jpg",
            "images/wedding/4.jpg"
        ]
    },

    books: {
        title: "Books & Booklets",
        description: "Premium-quality books, catalogues, annual reports, manuals, and booklets.",

        images: [
            "images/books/1.jpg",
            "images/books/2.jpg",
            "images/books/3.jpg"
        ]
    },

    brochures: {
        title: "Brochures & Leaflets",
        description: "Professional marketing materials that effectively showcase your products and services.",

        images: [
            "images/Brochures/broucherjpg",
            "images/Brochures/KK Birla Goa Campus.webp"
        ]
    },

    menus: {
        title: "Restaurant Menus",
        description: "Durable and attractive menu designs that enhance your customers' dining experience.",

        images: [
            "images/menus/1.jpg",
            "images/menus/2.jpg"
        ]
    }

};


// GET URL PARAMETER

const params = new URLSearchParams(window.location.search);

const service = params.get("service");

const product = products[service];

const title = document.getElementById("productTitle");
const description = document.getElementById("productDescription");
const gallery = document.getElementById("gallery");

if (product) {

    title.textContent = product.title;
    description.textContent = product.description;

    product.images.forEach(image => {

        const img = document.createElement("img");

        img.src = image;
        img.alt = product.title;

        img.classList.add("gallery-image");

        gallery.appendChild(img);

    });

} else {

    title.textContent = "Product Not Found";

    description.textContent =
        "Sorry, this product gallery does not exist.";

}


// LIGHTBOX

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

document.addEventListener("click", function(e) {

    if (!e.target.classList.contains("gallery-image"))
        return;

    lightboxImage.src = e.target.src;

    lightbox.style.display = "flex";

});

closeLightbox.addEventListener("click", () => {

    lightbox.style.display = "none";

});

lightbox.addEventListener("click", (e) => {

    if (e.target === lightbox) {

        lightbox.style.display = "none";

    }

});
