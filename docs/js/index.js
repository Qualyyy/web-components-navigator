
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
    const categoriesContainer = document.querySelector(`[data-sha="${repo.sha}"] .repo-categories`);
    try {
        if (!repo.components || Object.keys(repo.components).length === 0) {
            categoriesContainer.textContent = "No components found.";
            return;
        }

        categoriesContainer.textContent = "";

        // Process each category in this repo
        for ([categoryName, componentList] of Object.entries(repo.components)) {
            // Create or find folder container for this category
            let folderContainer;
            let buttonsContainer;
            const folderId = (repo.owner + "-" + repo.name + "-" + categoryName).replaceAll(" ", "-");
            const buttonsId = folderId + "-buttons";

            if (document.getElementById(folderId)) {
                folderContainer = document.getElementById(folderId);
                buttonsContainer = document.getElementById(buttonsId);
            } else {
                folderContainer = document.createElement("div");
                folderContainer.className = "folder-container";
                folderContainer.setAttribute("data-category", categoryName);
                folderContainer.id = folderId;
                categoriesContainer.appendChild(folderContainer);

                const folderHeading = document.createElement("h3");
                folderHeading.className = "folder-heading";
                folderHeading.textContent = categoryName;
                folderContainer.appendChild(folderHeading);

                buttonsContainer = document.createElement("div");
                buttonsContainer.className = "buttons";
                buttonsContainer.id = buttonsId;
                folderContainer.appendChild(buttonsContainer);
            }

            // Add each component in this category
            componentList.forEach(component => {
                const buttonDiv = document.createElement("div");
                buttonDiv.className = "button component-button";
                buttonsContainer.appendChild(buttonDiv);

                const sourceCodeButton = document.createElement("a");
                sourceCodeButton.className = "btn btn-source-code";
                sourceCodeButton.textContent = "</>";
                sourceCodeButton.href = component.sourceUrl;
                sourceCodeButton.target = "_blank";
                buttonDiv.appendChild(sourceCodeButton);

                const previewButton = document.createElement("a");
                previewButton.className = "btn btn-preview";
                previewButton.textContent = component.name.replaceAll("-", " ");
                // Use the proxy URL instead of htmlpreview
                previewButton.href = component.previewUrl;
                previewButton.target = "_blank";
                buttonDiv.appendChild(previewButton);
            });
        };

    } catch (error) {
        categoriesContainer.textContent = "Error: " + error.message;
    }
}

async function fetchAllRepos() {
    try {
        // Load the components.json file we generated
        const response = await fetch(`./components.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to load components.json");
        const repos = await response.json();

        // Create repo divs first
        for (const repo of repos) {
            await createRepoDiv(repo);
        }

        // Then process each repo with its components
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

// Load components when page loads
init();
