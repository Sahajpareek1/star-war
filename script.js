let currentPage = 1;
const cachedData = {};

document.addEventListener("DOMContentLoaded", () => {
    showPage("main-page");
});

async function fetchData(url, type) {
    if (cachedData[`${type}-${currentPage}`]) {
        displayData(cachedData[`${type}-${currentPage}`], type);
    } else {
        try {
            const response = await fetch(`${url}?format=json&page=${currentPage}`);
            const data = await response.json();
            cachedData[`${type}-${currentPage}`] = data;
            displayData(data, type);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        }
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

function showPeopleModal(planetUrl) {
    const peopleContainer = document.getElementById("people-container");
    peopleContainer.innerHTML = "";

    fetch(planetUrl)
        .then(response => response.json())
        .then(planet => {
            if (planet.residents.length > 0) {
                planet.residents.forEach(residentUrl => {
                    fetch(residentUrl)
                        .then(response => response.json())
                        .then(resident => {
                            const residentCard = createResidentCard(resident);
                            peopleContainer.appendChild(residentCard);
                        });
                });
            } else {
                const noDataMessage = document.createElement("p");
                noDataMessage.textContent = "No resident data available.";
                peopleContainer.appendChild(noDataMessage);
            }

            document.getElementById("people-modal").style.display = "flex";
        });
}

function closePeopleModal() {
    document.getElementById("people-modal").style.display = "none";
}

function navigateTo(type) {
    showPage(`${type}-page`);
    currentPage = 1;

    if (type === 'planets') {
        fetchData("https://swapi.dev/api/planets", "planets");
    } else if (type === 'people') {
        fetchData("https://swapi.dev/api/people", "residents");
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll("main");
    pages.forEach(page => {
        page.style.display = "none";
    });

    document.getElementById(pageId).style.display = "block";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
