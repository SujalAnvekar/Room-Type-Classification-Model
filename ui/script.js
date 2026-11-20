// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/`;


// ============================================================
// DOM ELEMENTS
// ============================================================

const form = document.getElementById("predictionForm");

const submitBtn = document.getElementById("submitBtn");

const formError = document.getElementById("formError");

const apiStatus = document.getElementById("apiStatus");

const apiIndicator = document.querySelector(".api-indicator");

const availability = document.getElementById("availability");

const resultCard = document.getElementById("resultCard");


// ============================================================
// AVAILABILITY SLIDER
// ============================================================

availability.addEventListener("input", () => {

    document.getElementById("availabilityValue").textContent =
        `${availability.value} days`;

});


// ============================================================
// API CONNECTION CHECK
// ============================================================

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


// ============================================================
// ERROR HANDLING
// ============================================================

function showError(message) {

    formError.textContent = message;

    formError.classList.add("show");

}


function clearError() {

    formError.textContent = "";

    formError.classList.remove("show");

}


// ============================================================
// PROBABILITY VALIDATION
// ============================================================

function formatProbability(value) {

    const number = Number(value);

    if (
        !Number.isFinite(number) ||
        number < 0 ||
        number > 1
    ) {

        throw new Error(
            "Invalid probability received from the API."
        );

    }

    return number * 100;

}


// ============================================================
// DISPLAY PREDICTION
// ============================================================

function renderResult(data) {

    const predicted = data.predicted_room_type;

    const probabilities = data.probabilities || {};


    if (!predicted) {

        throw new Error(
            "The API response does not contain predicted_room_type."
        );

    }


    // Sort probabilities

    const entries = Object.entries(probabilities)

        .map(([name, value]) => {

            return [name, Number(value)];

        })

        .sort((a, b) => b[1] - a[1]);


    // Display predicted room type

    document.getElementById("predictedType").textContent =
        String(predicted);


    // Probability visualization

    const list = document.getElementById("probabilityList");

    list.innerHTML = "";


    if (entries.length > 0) {

        entries.forEach(([label, value]) => {

            const percent = formatProbability(value);

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
                `${Math.min(100, percent)}%`;


            track.appendChild(bar);

            item.append(labelRow, track);

            list.appendChild(item);

        });

    }

    else {

        const note = document.createElement("p");

        note.className = "probability-empty";

        note.textContent =
            "The model returned a prediction, but no probabilities were provided.";

        list.appendChild(note);

    }


    // Highlight predicted building

    document.querySelectorAll(".building").forEach(building => {

        building.classList.toggle(
            "active",
            building.dataset.room === predicted
        );

    });


    // Display result

    resultCard.classList.add("has-result");

    document.getElementById("skylineHint").classList.add("hidden");

    document.getElementById("resultContent").classList.remove("hidden");

}


// ============================================================
// SUBMIT PREDICTION
// ============================================================

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

        reviews_per_month: Number(
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


    // Validate numeric inputs

    if (

        Object.values(payload).some(value =>

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


    // Validate text inputs

    if (

        !payload.neighbourhood ||
        !payload.neighbourhood_group

    ) {

        showError(
            "Please select a borough and enter a neighbourhood."
        );

        return;

    }


    // Loading state

    submitBtn.disabled = true;

    submitBtn.querySelector("span").textContent =
        "Analysing listing...";

    submitBtn.querySelector("b").textContent = "…";


    try {


        // Send actual input to FastAPI

        const response = await fetch(PREDICT_ENDPOINT, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });


        const data = await response.json().catch(() => ({}));


        // API error handling

        if (!response.ok) {

            const detail = data.detail;

            const message = Array.isArray(detail)

                ? detail.map(item => {

                    const field =
                        item.loc?.slice(-1)[0] || "Field";

                    return `${field}: ${item.msg}`;

                }).join(" | ")

                : (

                    detail ||
                    `Request failed (${response.status})`

                );


            throw new Error(message);

        }


        // Display actual ML prediction

        renderResult(data);


        // Scroll to result

        resultCard.scrollIntoView({

            behavior: "smooth",

            block: "nearest"

        });


    }

    catch (error) {

        console.error("Prediction error:", error);


        showError(

            error.message.includes("Failed to fetch")

                ? "Could not reach FastAPI. Make sure your backend is running at http://127.0.0.1:8000."

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


// ============================================================
// RESET FORM
// ============================================================

document.getElementById("resetBtn").addEventListener("click", () => {


    // Hide prediction

    document.getElementById("resultContent").classList.add("hidden");


    // Restore initial hint

    document.getElementById("skylineHint").classList.remove("hidden");


    // Remove active building

    resultCard.classList.remove("has-result");

    document.querySelectorAll(".building").forEach(building => {

        building.classList.remove("active");

    });


    // Reset form

    form.reset();

    availability.dispatchEvent(new Event("input"));

    clearError();


    // Scroll to top

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});