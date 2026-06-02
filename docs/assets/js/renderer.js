const TEMPLATES = {
    repo: document.querySelector("#template--repo"),
    category: document.querySelector("#template--category"),
    component: document.querySelector("#template--component")
};

export function renderRepos(repos, $container) {
    $container.textContent = "";
    const $fragment = document.createDocumentFragment();
    const $template = TEMPLATES.repo;

    for (const repo of repos) {

        const $clone = $template.content.cloneNode(true);
        const $root = $clone.firstElementChild;

        $root.dataset.sha = repo.sha;
        $root.dataset.owner = repo.owner;

        $root.querySelector(".repo-link").href = repo.url;
        $root.querySelector(".repo-name").textContent = format(repo.repo);
        $root.querySelector(".repo-owner").textContent = format(repo.owner);

        const $categoriesContainer = $root.querySelector(".repo-categories");
        try {
            renderCategories(repo.components, $categoriesContainer);
        } catch (error) {
            console.error("Category render failed:", error);
            $categoriesContainer.textContent = error.message;
        }

        $fragment.appendChild($clone);
    }
    $container.appendChild($fragment);
}

function renderCategories(categories, $container) {
    if (!categories || Object.keys(categories).length === 0)
        throw new Error("No components found.");

    $container.textContent = "";
    const $fragment = document.createDocumentFragment();
    const $template = TEMPLATES.category;

    for (const [category, components] of Object.entries(categories)) {
        const $clone = $template.content.cloneNode(true);
        const $root = $clone.firstElementChild;

        $root.dataset.category = category;
        $root.querySelector(".category-name").textContent = category;

        const $componentsContainer = $root.querySelector(".components");
        try {
            renderComponents(components, $componentsContainer);
        } catch (error) {
            console.error("Component render failed:", error);
            $componentsContainer.textContent = error.message;
        }
        $fragment.appendChild($clone);
    };
    $container.appendChild($fragment);
}

function renderComponents(components, $container) {
    $container.textContent = "";
    const $fragment = document.createDocumentFragment();
    const $template = TEMPLATES.component;

    for (const component of components) {
        const $clone = $template.content.cloneNode(true);
        const $root = $clone.firstElementChild;

        $root.querySelector(".btn-source-code").href = component.sourceUrl;
        $root.querySelector(".btn-preview").href = component.previewUrl;
        $root.querySelector(".btn-preview").textContent = format(component.name);

        $fragment.appendChild($clone);
    }
    $container.appendChild($fragment);
}

function format(input) {
    return input.replaceAll("-", " ");
}