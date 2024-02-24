const API_BASE_URL = "https://swapi.dev/api/";
let currentPage = 1;
const cachedData = {};

document.addEventListener("DOMContentLoaded", () => {
    showPage("main-page");
});

class SwapiDataFetcher {
    static async fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }
}

async function getData(url, type) {
    const cachedKey = `${type}-${currentPage}`;
    try {
        if (cachedData[cachedKey]) {
            return cachedData[cachedKey];
        } else {
            const data = await SwapiDataFetcher.fetchData(`${url}?format=json&page=${currentPage}`);
            cachedData[cachedKey] = data;
            return data;
        }
    } catch (error) {
        throw error; // Re-throw the error to be caught by the caller
    }
}

function displayData(data, type) {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = "";

    if (type === 'planets') {
        data.results.forEach(planet => {
            const planetCard = createPlanetCard(planet);
            container.appendChild(planetCard);
        });
    } else if (type === 'residents') {
        data.results.forEach((resident, index) => {
            const residentCard = createResidentCard(resident, index !== 0);
            container.appendChild(residentCard);
        });
        showPage("people-page");
    }

    updatePaginationButtons(type, data);
}

function createPlanetCard(planet) {
    const planetCard = document.createElement("div");
    planetCard.classList.add("planet-card");
    planetCard.innerHTML = `
        <h3>${planet.name}</h3>
        <p>Climate: ${planet.climate}</p>
        <p>Population: ${planet.population}</p>
        <p>Terrain: ${planet.terrain}</p>
        <button onclick="showPeopleModal('${planet.url}')">Residents</button>
    `;
    return planetCard;
}

function createResidentCard(resident, addSpacing) {
    const residentCard = document.createElement("div");
    residentCard.classList.add("resident-card");

    if (addSpacing) {
        residentCard.classList.add("resident-card-spacing");
    }

    residentCard.innerHTML = `
        <h4>${resident.name}</h4>
        <p><strong>Height:</strong> ${resident.height}</p>
        <p><strong>Mass:</strong> ${resident.mass}</p>
        <p><strong>Gender:</strong> ${resident.gender}</p>
    `;
    return residentCard;
}

function updatePaginationButtons(type, data) {
    const prevBtn = document.getElementById(`prev${capitalizeFirstLetter(type)}Btn`);
    const nextBtn = document.getElementById(`next${capitalizeFirstLetter(type)}Btn`);

    prevBtn.disabled = !data.previous;
    nextBtn.disabled = !data.next;
}

async function showPeopleModal(planetUrl) {
    const peopleContainer = document.getElementById("people-container");
    peopleContainer.innerHTML = "";

    try {
        const planetResponse = await fetch(planetUrl);
        const planet = await planetResponse.json();

        if (planet.residents.length > 0) {
            for (const residentUrl of planet.residents) {
                try {
                    const residentResponse = await fetch(residentUrl);
                    const resident = await residentResponse.json();
                    const residentCard = createResidentCard(resident);
                    peopleContainer.appendChild(residentCard);
                } catch (residentError) {
                    console.error(`Error fetching resident data:`, residentError);
                }
            }
        } else {
            const noDataMessage = document.createElement("p");
            noDataMessage.textContent = "No resident data available.";
            peopleContainer.appendChild(noDataMessage);
        }

        document.getElementById("people-modal").style.display = "flex";
    } catch (planetError) {
        console.error(`Error fetching planet data:`, planetError);
    }
}

function closePeopleModal() {
    document.getElementById("people-modal").style.display = "none";
}

async function navigateTo(type) {
    showPage(`${type}-page`);
    currentPage = 1;

    try {
        const url = type === 'planets' ? `${API_BASE_URL}planets` : `${API_BASE_URL}people`;
        const data = await getData(url, type);
        displayData(data, type);
    } catch (error) {
        console.error(`Error navigating to ${type}:`, error);
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll("section");
    pages.forEach(page => {
        page.style.display = "none";
    });

    document.getElementById(pageId).style.display = "block";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}