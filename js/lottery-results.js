
// =================================
// LOTTERY CATEGORY FILTER
// =================================

const filterButtons = document.querySelectorAll(".filter-btn");
const resultCards = document.querySelectorAll(".result-card");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

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

function openLotteryPDF(title, pdfPath) {
    const viewer = document.getElementById("lotteryViewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const pdfFrame = document.getElementById("lotteryPdf");

    viewerTitle.textContent = title;
    pdfFrame.src = pdfPath;

    viewer.style.display = "flex";
}


// Close PDF popup
document.getElementById("closeViewer").addEventListener("click", function () {
    document.getElementById("lotteryViewer").style.display = "none";
    document.getElementById("lotteryPdf").src = "";
});


// Close PDF viewer
document.getElementById("closeViewer").addEventListener("click", function () {
    document.getElementById("lotteryViewer").style.display = "none";
    document.getElementById("lotteryPdf").src = "";
});