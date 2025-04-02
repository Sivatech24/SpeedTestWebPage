let speedChart;

function runSpeedTest() {
    const progressBar = document.getElementById("progress-bar");
    const loadingSection = document.getElementById("loading-section");
    const resultSection = document.getElementById("result-section");

    // Reset UI before test starts
    progressBar.style.width = "0%";
    loadingSection.style.display = "block";
    resultSection.style.display = "none";

    fetch("/test-speed")
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            function read() {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        // Hide loading when done
                        setTimeout(() => {
                            loadingSection.style.display = "none";
                            resultSection.style.display = "block";
                        }, 500);
                        return;
                    }

                    const text = decoder.decode(value);
                    const lines = text.split("\n").filter(Boolean);

                    lines.forEach(line => {
                        try {
                            const data = JSON.parse(line);

                            if (data.progress) {
                                progressBar.style.width = data.progress + "%";
                            }

                            if (data.download && data.upload) {
                                updateSpeedResults(data);
                            }
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    });

                    return read();
                });
            }

            return read();
        })
        .catch(error => {
            console.error("Network error:", error);
            alert("Speed test failed. Please try again.");
            loadingSection.style.display = "none";
        });
}

function updateSpeedResults(data) {
    document.getElementById("ping").innerText = data.ping + " ms";
    document.getElementById("ip-address").innerText = data.ip_details.local_ip;
    document.getElementById("data-sent").innerText = formatDataSize(data.network_info.bytes_sent);
    document.getElementById("data-received").innerText = formatDataSize(data.network_info.bytes_recv);

    let downloadHTML = "<ul>";
    let uploadHTML = "<ul>";

    for (const [unit, value] of Object.entries(data.download)) {
        downloadHTML += `<li><b>${unit}:</b> ${value}</li>`;
    }

    for (const [unit, value] of Object.entries(data.upload)) {
        uploadHTML += `<li><b>${unit}:</b> ${value}</li>`;
    }

    downloadHTML += "</ul>";
    uploadHTML += "</ul>";

    document.getElementById("download-speed").innerHTML = downloadHTML;
    document.getElementById("upload-speed").innerHTML = uploadHTML;

    updateChart(data.download["Megabyte"], data.upload["Megabyte"]);
}

function updateChart(download, upload) {
    if (!speedChart) {
        const ctx = document.getElementById("speedChart").getContext("2d");
        speedChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Download (MB)", "Upload (MB)"],
                datasets: [{
                    label: "Speed",
                    data: [download, upload],
                    backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
                    borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        speedChart.data.datasets[0].data = [download, upload];
        speedChart.update();
    }
}

// Convert bytes to human-readable format
function formatDataSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = 0;
    while (bytes >= 1000 && i < sizes.length - 1) {
        bytes /= 1000;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}
