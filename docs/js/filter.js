document.getElementById('filter-list-owner').addEventListener('change', updateAll);
document.getElementById('filter-list-category').addEventListener('change', updateAll);

function updateAll() {
    const selectedOwners = Array.from(document.querySelectorAll('input[name="owner"]:checked')).map(input => input.value);
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.value);

    document.querySelectorAll('.repo-container').forEach(repoDiv => {
        const owner = repoDiv.getAttribute('data-owner');
        repoDiv.style.display = selectedOwners.length === 0 || selectedOwners.includes(owner) ? '' : 'none';
    });

    document.querySelectorAll('.folder-container').forEach(categoryDiv => {
        const category = categoryDiv.getAttribute('data-category');
        categoryDiv.style.display = selectedCategories.length === 0 || selectedCategories.includes(category) ? '' : 'none';
    });

    document.querySelectorAll('.repo-container').forEach(repoDiv => {
        if (repoDiv.style.display === 'none') return;
        const hasVisibleFolder = Array.from(
            repoDiv.querySelectorAll('.folder-container')
        ).some(categoryDiv => categoryDiv.style.display !== 'none');
        repoDiv.style.display = hasVisibleFolder ? '' : 'none';
    });
}

function getOwners(data) {
    const ownersSet = new Set();

    for (const repoKey in data) {
        const owner = repoKey.split('/')[0];
        ownersSet.add(owner);
    }

    return Array.from(ownersSet).sort();
}

function getCategories(data) {
    const categoriesSet = new Set();

    for (const repoKey in data) {
        const repo = data[repoKey];
        for (const category in repo) {
            categoriesSet.add(category);
        }
    }

    return Array.from(categoriesSet);
}


function addCheckboxes(key, list) {
    const filterList = document.getElementById(`filter-list-${key}`);
    filterList.innerHTML = '';

    for (const item of list.sort()) {
        filterList.insertAdjacentHTML('beforeend', `<li><label><input type="checkbox" name="${key}" value="${item}">${item}</label></li>`)
    }
}

async function addAllFilters() {
    try {
        const response = await fetch(`./components.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load components.json');
        const components = await response.json();

        const repoOwners = getOwners(components);
        const categories = getCategories(components);

        const filters = {
            owner: repoOwners,
            category: categories
        };

        for (const key in filters) {
            addCheckboxes(key, filters[key]);
        }
    }
    catch (error) {
        console.error('Error loading components:', error);
    }
}

addAllFilters();
