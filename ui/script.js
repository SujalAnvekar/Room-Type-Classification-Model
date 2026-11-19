// Local development
const API_BASE_URL = "http://127.0.0.1:8000";

const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/`;

const form = document.getElementById("predictionForm");

const submitBtn = document.getElementById("submitBtn");

const formError = document.getElementById("formError");

const apiStatus = document.getElementById("apiStatus");

const apiIndicator = document.querySelector(".api-indicator");

const availability = document.getElementById("availability");


// Availability slider

availability.addEventListener("input", () => {

    document.getElementById("availabilityValue").textContent =
        `${availability.value} days`;

});


// Check API connection

async function checkApi() {

    try {

        const response = await fetch(HEALTH_ENDPOINT);

        if (!response.ok) {
            throw new Error("API unavailable");
        }

        apiStatus.textContent = "API connected";

        apiIndicator.classList.add("connected");

        apiIndicator.classList.remove("disconnected");

    }

    catch {

        apiStatus.textContent = "API not connected";

        apiIndicator.classList.add("disconnected");

        apiIndicator.classList.remove("connected");

    }

}

checkApi();


// Error handling

function showError(message) {

    formError.textContent = message;

    formError.classList.add("show");

}


function clearError() {

    formError.textContent = "";

    formError.classList.remove("show");

}


// Display prediction

function renderResult(data) {

    const predicted = data.Predicted_room_type;

    if (predicted === undefined || predicted === null) {

        throw new Error(
            "The API response does not contain Predicted_room_type."
        );

    }

    let probabilities = data.Class_probabilities;

    if (
        !probabilities &&
        Array.isArray(data.Probability) &&
        Array.isArray(data.classes)
    ) {

        probabilities = Object.fromEntries(

            data.classes.map((name, index) => [
                name,
                data.Probability[index]
            ])

        );

    }

    let entries = probabilities
        ? Object.entries(probabilities).map(
            ([name, value]) => [name, Number(value)]
        )
        : [];

    entries.sort((a, b) => b[1] - a[1]);

    const topProbability = entries.length
        ? entries[0][1]
        : null;

    const confidence = topProbability === null
        ? null
        : (
            topProbability <= 1
                ? topProbability * 100
                : topProbability
        );


    document.getElementById("predictedType").textContent =
        String(predicted);

    document.getElementById("confidenceValue").textContent =
        confidence === null
            ? "N/A"
            : `${confidence.toFixed(1)}%`;

    document.getElementById("confidenceBar").style.width =
        confidence === null
            ? "0%"
            : `${Math.max(0, Math.min(100, confidence))}%`;


    // Probability visualization

    const list = document.getElementById("probabilityList");

    list.innerHTML = "";


    if (entries.length) {

        entries.forEach(([label, value]) => {

            const percent = value <= 1
                ? value * 100
                : value;

            const item = document.createElement("div");

            item.className = "probability-item";


            const labelRow = document.createElement("div");

            labelRow.className = "probability-label";


            const name = document.createElement("span");

            name.textContent = label;


            const val = document.createElement("b");

            val.textContent = `${percent.toFixed(1)}%`;


            labelRow.append(name, val);


            const track = document.createElement("div");

            track.className = "probability-track";


            const bar = document.createElement("span");

            bar.style.width =
                `${Math.max(0, Math.min(100, percent))}%`;


            track.appendChild(bar);

            item.append(labelRow, track);

            list.appendChild(item);

        });

    }

    else {

        const note = document.createElement("p");

        note.className = "intro-copy";

        note.textContent =
            "The model returned a prediction, but no class probabilities were provided.";

        list.appendChild(note);

    }


    document.getElementById("emptyState").classList.add("hidden");

    document.getElementById("resultContent").classList.remove("hidden");

}


// Submit prediction

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearError();


    const formData = new FormData(form);


    // Collect all 10 model features

    const payload = {

        latitude: Number(formData.get("latitude")),

        longitude: Number(formData.get("longitude")),

        price: Number(formData.get("price")),

        minimum_nights: Number(formData.get("minimum_nights")),

        number_of_reviews: Number(
            formData.get("number_of_reviews")
        ),

       reviews_per_month: parseFloat(
    formData.get("reviews_per_month")
),

        calculated_host_listings_count: Number(
            formData.get("calculated_host_listings_count")
        ),

        neighbourhood_group: String(
            formData.get("neighbourhood_group")
        ).trim(),

        neighbourhood: String(
            formData.get("neighbourhood")
        ).trim(),

        availability_365: Number(
            formData.get("availability_365")
        )

    };


    if (
        Object.values(payload).some(
            value =>
                value === "" ||
                (
                    typeof value === "number" &&
                    !Number.isFinite(value)
                )
        )
    ) {

        showError("Please complete all fields with valid values.");

        return;

    }


    submitBtn.disabled = true;

    submitBtn.querySelector("span").textContent =
        "Analysing listing...";

    submitBtn.querySelector("b").textContent = "…";


    try {

        const response = await fetch(PREDICT_ENDPOINT, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });


        const data = await response.json().catch(() => ({}));


        if (!response.ok) {

            const detail = data.detail;

            const message = Array.isArray(detail)

                ? detail.map(
                    item =>
                        `${item.loc?.slice(-1)[0] || "Field"}: ${item.msg}`
                ).join(" | ")

                : (
                    detail ||
                    `Request failed (${response.status})`
                );

            throw new Error(message);

        }


        // Display actual model prediction

        renderResult(data);

        document.getElementById("resultCard").scrollIntoView({

            behavior: "smooth",

            block: "nearest"

        });

    }

    catch (error) {

        showError(

            error.message.includes("Failed to fetch")

                ? "Could not reach FastAPI. Make sure the backend is running at http://127.0.0.1:8000 and CORS is enabled."

                : error.message

        );

        checkApi();

    }

    finally {

        submitBtn.disabled = false;

        submitBtn.querySelector("span").textContent =
            "Predict room type";

        submitBtn.querySelector("b").textContent = "→";

    }

});


// Reset form

document.getElementById("resetBtn").addEventListener("click", () => {

    document.getElementById("resultContent").classList.add("hidden");

    document.getElementById("emptyState").classList.remove("hidden");

    form.reset();

    availability.dispatchEvent(new Event("input"));

    clearError();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});