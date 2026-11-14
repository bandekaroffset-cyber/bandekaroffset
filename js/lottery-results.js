
// =================================
// LOTTERY CATEGORY FILTER
// =================================

const filterButtons = document.querySelectorAll(".filter-btn");
const resultCards = document.querySelectorAll(".result-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const selectedCategory = button.dataset.category;

        resultCards.forEach(card => {
            const matches =
                selectedCategory === "all" ||
                card.dataset.category === selectedCategory;

            card.style.display = matches ? "flex" : "none";
        });
    });
});


// =================================
// LOTTERY PDF VIEWER
// =================================

function openLotteryPDF(title, pdfPath) {
    const viewer = document.getElementById("lotteryViewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const pdfFrame = document.getElementById("lotteryPdf");

    viewerTitle.textContent = title;
    pdfFrame.src = pdfPath;

    viewer.style.display = "flex";
}


// =================================
// CLOSE PDF VIEWER
// =================================

const closeViewer = document.getElementById("closeViewer");
const lotteryViewer = document.getElementById("lotteryViewer");
const lotteryPdf = document.getElementById("lotteryPdf");

closeViewer.addEventListener("click", () => {
    lotteryViewer.style.display = "none";
    lotteryPdf.src = "";
});


// Close when clicking outside the viewer
lotteryViewer.addEventListener("click", event => {
    if (event.target === lotteryViewer) {
        lotteryViewer.style.display = "none";
        lotteryPdf.src = "";
    }
});


// Close with Escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lotteryViewer.style.display === "flex") {
        lotteryViewer.style.display = "none";
        lotteryPdf.src = "";
    }
});
