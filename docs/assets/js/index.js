import * as FILTER from "./filter.js";
import * as THEME from "./theme.js";

function init() {
    FILTER.init();
    THEME.init();
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

async function createRepoDiv(repo) {
    const foldersDiv = document.getElementById("folders");

    const $template = document.querySelector("#template--repo");
    const $clone = document.importNode($template.content, true);
    const $container = $clone.firstElementChild;

    $container.dataset.sha = repo.sha;
    $container.dataset.owner = repo.owner;

    $container.querySelector(".repo-link").href = `https://github.com/${repo.owner}/${repo.repo}`;
    $container.querySelector(".repo-name").textContent = repo.repo.replaceAll("-", " ");
    $container.querySelector(".repo-owner").textContent = repo.owner.replaceAll("-", " ");

    foldersDiv.appendChild($clone);
}

async function processRepo(repo) {
    const $categoriesContainer = document.querySelector(`[data-sha="${repo.sha}"] .repo-categories`);
    try {
        if (!repo.components || Object.keys(repo.components).length === 0) {
            $categoriesContainer.textContent = "No components found.";
            return;
        }
        $categoriesContainer.textContent = "";

        for (const category in repo.components) {

            let $categoryContainer = $categoriesContainer.querySelector(`[data-category=${category}]`);
            if (!$categoryContainer) {
                const $categoryTemplate = document.querySelector("#template--category");
                const $clone = document.importNode($categoryTemplate.content, true);
                const $container = $clone.firstElementChild;
                $container.dataset.category = category;
                $container.querySelector(".category-name").textContent = category;

                $categoryContainer = $container;
                $categoriesContainer.appendChild($clone);
            }

            const $fragment = document.createDocumentFragment();
            const $template = document.querySelector("#template--component");

            for (const component of repo.components[category]) {
                const $clone = $template.content.cloneNode(true);

                $clone.querySelector(".btn-source-code").href = component.sourceUrl;
                $clone.querySelector(".btn-preview").href = component.previewUrl;
                $clone.querySelector(".btn-preview").textContent = component.name;

                $fragment.appendChild($clone);
            }

            $categoryContainer.querySelector(".components").appendChild($fragment);
        };

    } catch (error) {
        $categoriesContainer.textContent = "Error: " + error.message;
    }
}

async function fetchAllRepos() {
    try {
        const response = await fetch(`./assets/data/components.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to load components.json");
        const repos = await response.json();

        for (const repo of repos) {
            await createRepoDiv(repo);
        }

        for (const repo of repos) {
            await processRepo(repo);
        }

    } catch (error) {
        console.error("Error loading components:", error);
        const foldersDiv = document.getElementById("folders");
        foldersDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: red;">
                <h3>Failed to load components</h3>
                <p>${error.message}</p>
                <p>Make sure you"ve run: <code>npm run build-components</code></p>
            </div>
        `;
    }
}

init();
