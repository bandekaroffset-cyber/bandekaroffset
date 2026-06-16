// PRODUCTS DATA
const products = {

    printondemand: {
      title: "Print On Demand (POD)",
      description: "Custom printing solutions for t-shirts, mugs, merchandise, gifts, and promotional products with no minimum order quantity.",
      images: [
        "images/print_on_demand1/webp"
      ]
    },

    printondemand: {
      title: "Books & Booklets",
      description: "Premium-quality books, catalogues, annual reports, manuals, and booklets.",
      images: [
        "images/Book/satya ke talash.jpg"
      ]
    },

    
    wedding: {
        title: "Wedding Invitations",
        description: "Beautifully crafted invitation cards designed to make your special occasion memorable.",
        images: [
            "images/wedding/1.jpg",
            "images/wedding/2.jpg",
            "images/wedding/3.jpg"
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
            "images/brochures/1.jpg",
            "images/brochures/2.jpg"
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


// FIND PRODUCT

const product = products[service];


// LOAD CONTENT

if (product) {

    document.getElementById("productTitle").textContent =
        product.title;

    document.getElementById("productDescription").textContent =
        product.description;

    const gallery =
        document.getElementById("gallery");

    product.images.forEach(image => {

        const img =
            document.createElement("img");

        img.src = image;
        img.alt = product.title;
        img.classList.add("gallery-image");

        gallery.appendChild(img);

    });

} else {

    document.getElementById("productTitle").textContent =
        "Product Not Found";

    document.getElementById("productDescription").textContent =
        "The requested product could not be found.";

}


// IMAGE LIGHTBOX

document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("gallery-image"))
        return;

    const overlay = document.createElement("div");

    overlay.className = "image-overlay";

    overlay.innerHTML = `
        <img src="${e.target.src}" alt="">
    `;

    overlay.addEventListener("click", () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);

});
