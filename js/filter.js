document.getElementById('filter-list-owners').addEventListener('change', (event) => {
    if (event.target.name === 'owner') {
        updateVisibleRepos();
    }
});

function updateVisibleRepos() {
    const selectedOwners = Array.from(document.querySelectorAll('input[name="owner"]:checked')).map(input => input.value);
    document.querySelectorAll('.repo-container').forEach(repoDiv => {
        const owner = repoDiv.getAttribute('data-owner');
        repoDiv.style.display = selectedOwners.length === 0 || selectedOwners.includes(owner) ? '' : 'none';
    });
}

