import "./filter.js";
import * as RENDERER from "./renderer.js";
import "./theme.js";

function init() {
    document.querySelector("#content").addEventListener("click", toggleRepo);

    fetchAllRepos();
}

function toggleRepo(e) {
    const $clickedRepo = e.target.closest(".repo-container");
    if ($clickedRepo && !e.target.closest("a") && e.target.closest(".repo-header")) {
        if ($clickedRepo.classList.contains("active")) {
            $clickedRepo.classList.remove("active");
        } else {
            $clickedRepo.classList.add("active");
        }
    }
}

async function loadRepos(repos) {
    const $reposContainer = document.querySelector("#repos");

    RENDERER.renderRepos(repos, $reposContainer);

}

async function processRepo(repo) {
    const $categoriesContainer = document.querySelector(`[data-sha="${repo.sha}"] .repo-categories`);

    if (!repo.components || Object.keys(repo.components).length === 0) {
        $categoriesContainer.textContent = "No components found.";
        return;
    }
    RENDERER.renderCategories(repo, $categoriesContainer);
}

async function fetchAllRepos() {
    try {
        const response = await fetch(`./assets/data/components.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to load components.json");
        const repos = await response.json();

        const startTime = performance.now();
        loadRepos(repos);
        const endTime = performance.now();
        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);

    } catch (error) {
        console.error("Error loading components:", error);
        const reposDiv = document.getElementById("repos");
        reposDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: red;">
                <h3>Failed to load components</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

init();
