function runSpeedTest() {
    const urlInput = document.getElementById("website-url");
    const url = urlInput.value.trim();
    
    if (!url) {
        alert("❌ Please enter a valid website URL!");
        return;
    }

    const loading = document.getElementById("loading");
    const results = document.getElementById("results");
    const testedUrl = document.getElementById("tested-url");
    const loadTime = document.getElementById("load-time");

    loading.style.display = "block";
    results.classList.add("hidden");

    const startTime = performance.now();
    
    fetch(url, { mode: "no-cors" })  // Request without CORS enforcement
        .then(() => {
            const endTime = performance.now();
            const timeTaken = Math.round(endTime - startTime);

            testedUrl.innerText = url;
            loadTime.innerText = timeTaken;

            loading.style.display = "none";
            results.classList.remove("hidden");
        })
        .catch(() => {
            loading.style.display = "none";
            alert("⚠️ Failed to load the website. It may have CORS restrictions.");
        });
}
