async function addFilters(repoOwners) {
    const filterListOwners = document.getElementById('filter-list-owners');
    filterListOwners.innerHTML = '';

    for (const owner of repoOwners) {
        filterListOwners.insertAdjacentHTML('beforeend', `<li><label><input type="checkbox" name="owner" value="${owner}">${owner}</label></li>`)
    }
}

async function createRepoDiv(owner, repo) {
    const foldersDiv = document.getElementById('folders');

    const repoDiv = document.createElement('div');
    repoDiv.id = (owner + '-' + repo);
    repoDiv.className = 'card repo-container';
    repoDiv.setAttribute('data-owner', owner);
    foldersDiv.appendChild(repoDiv);

    const repoHeader = document.createElement('div');
    repoHeader.className = 'repo-header';
    repoHeader.addEventListener("click", function (e) {
        if (e.target.tagName.toLowerCase() === 'a') return;
        this.classList.toggle("active");
        categoriesContainer.classList.toggle("active");
    });
    repoDiv.appendChild(repoHeader);

    const repoLink = document.createElement('a');
    repoLink.className = 'repo-link';
    repoLink.href = `https://github.com/${owner}/${repo}`;
    repoLink.target = '_blank';
    repoHeader.appendChild(repoLink);

    const repoTitle = document.createElement('h2');
    repoTitle.className = 'repo-title';
    repoTitle.innerHTML = (repo + ' <span>by</span> ' + owner).replaceAll('-', ' ');
    repoHeader.appendChild(repoTitle);

    const categoriesContainer = document.createElement('div');
    categoriesContainer.id = (owner + '-' + repo + '-categories-container');
    categoriesContainer.className = 'categories-container'
    categoriesContainer.textContent = 'Loading...';
    repoDiv.appendChild(categoriesContainer);
}

async function processRepo(owner, repo, components) {
    const categoriesContainer = document.getElementById(owner + '-' + repo + '-categories-container');

    try {
        // Filter components for this specific repo
        const repoKey = `${owner}/${repo}`;
        const repoComponents = components[repoKey];

        if (!repoComponents || Object.keys(repoComponents).length === 0) {
            categoriesContainer.textContent = 'No components found.';
            return;
        }

        categoriesContainer.textContent = '';

        // Process each category in this repo
        Object.entries(repoComponents).forEach(([categoryName, componentList]) => {
            // Create or find folder container for this category
            let folderContainer;
            let buttonsContainer;
            const folderId = (owner + '-' + repo + '-' + categoryName).replaceAll(' ', '-');
            const buttonsId = folderId + '-buttons';

            if (document.getElementById(folderId)) {
                folderContainer = document.getElementById(folderId);
                buttonsContainer = document.getElementById(buttonsId);
            } else {
                folderContainer = document.createElement('div');
                folderContainer.className = 'folder';
                folderContainer.id = folderId;
                categoriesContainer.appendChild(folderContainer);

                const folderHeading = document.createElement('h3');
                folderHeading.className = 'folder-heading';
                folderHeading.textContent = categoryName;
                folderContainer.appendChild(folderHeading);

                buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'buttons';
                buttonsContainer.id = buttonsId;
                folderContainer.appendChild(buttonsContainer);
            }

            // Add each component in this category
            componentList.forEach(component => {
                const buttonDiv = document.createElement('div');
                buttonDiv.className = 'button';
                buttonsContainer.appendChild(buttonDiv);

                const sourceCodeButton = document.createElement('a');
                sourceCodeButton.className = 'btn btn-source-code';
                sourceCodeButton.textContent = '</>';
                sourceCodeButton.href = component.sourceUrl;
                sourceCodeButton.target = '_blank';
                buttonDiv.appendChild(sourceCodeButton);

                const previewButton = document.createElement('a');
                previewButton.className = 'btn btn-preview';
                previewButton.textContent = component.name.replaceAll('-', ' ');
                // Use the proxy URL instead of htmlpreview
                previewButton.href = component.previewUrl;
                previewButton.target = '_blank';
                buttonDiv.appendChild(previewButton);
            });
        });

    } catch (error) {
        categoriesContainer.textContent = 'Error: ' + error.message;
    }
}

async function fetchAllRepos() {
    try {
        // Load the components.json file we generated
        const response = await fetch(`./components.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load components.json');
        const components = await response.json();

        // Get unique repos from the component data
        const repos = Object.keys(components).map(repoKey => {
            const [owner, repo] = repoKey.split('/');
            return { owner, repo };
        });

        // Add filter values
        let repoOwners = [];
        for (const repo of repos) {
            if (!repoOwners.includes(repo.owner)) {
                repoOwners.push(repo.owner);
            }
        }
        console.log(repoOwners)
        addFilters(repoOwners);

        // Create repo divs first
        for (const repo of repos) {
            await createRepoDiv(repo.owner, repo.repo);
        }

        // Then process each repo with its components
        for (const repo of repos) {
            await processRepo(repo.owner, repo.repo, components);
        }

    } catch (error) {
        console.error('Error loading components:', error);
        const foldersDiv = document.getElementById('folders');
        foldersDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: red;">
                <h3>Failed to load components</h3>
                <p>${error.message}</p>
                <p>Make sure you've run: <code>npm run build-components</code></p>
            </div>
        `;
    }
}

// Load components when page loads
fetchAllRepos();
