const fs = require('fs');
const path = require('path');

// Read the list of repositories we want to monitor
const repos = JSON.parse(fs.readFileSync('data/repos.json', 'utf8'));

async function buildComponentIndex() {
    console.log('🔍 Starting component discovery...');

    const allComponents = [];

    for (const { owner, repo, branch, sha } of repos) {
        console.log(`📂 Checking ${owner}/${repo} (${branch} branch)...`);
        try {
            const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

            const response = await fetch(treeUrl, {
                headers: {
                    'User-Agent': 'Component-Discovery-Bot'
                }
            });

            if (!response.ok) {
                console.error(`❌ Failed to fetch ${owner}/${repo}: ${response.status}`);
                continue;
            }

            const data = await response.json();

            const repoObject = {};
            repoObject.repo = repo;
            repoObject.owner = owner;
            repoObject.branch = branch;
            repoObject.sha = data.sha;
            repoObject.components = {};

            // Find all index.html files
            const indexFiles = data.tree.filter(item =>
                item.type === 'blob' && item.path.endsWith('index.html')
            );

            console.log(`\tFound ${indexFiles.length} components`);

            // Process each index.html file
            indexFiles.forEach(file => {
                const componentPath = file.path.replace('index.html', '').slice(0, -1);
                const componentName = componentPath.split('/').pop() || 'components';
                const categoryName = componentPath.split('/')[0] || 'root';

                if (!repoObject.components[categoryName]) {
                    repoObject.components[categoryName] = [];
                }

                repoObject.components[categoryName].push({
                    name: componentName,
                    previewUrl: `https://component-proxy.qualyj.workers.dev/${owner}/${repo}/${branch}/${file.path}`,
                    sourceUrl: `https://github.com/${owner}/${repo}/tree/${branch}/${componentPath}`
                });
            });

            allComponents.push(repoObject);

        } catch (error) {
            console.error(`❌ Error processing ${owner}/${repo}:`, error.message);
        }

        // Wait a bit between requests to be nice to GitHub's servers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Make sure docs directory exists
    if (!fs.existsSync('docs')) {
        fs.mkdirSync('docs');
    }

    // Save the component list
    fs.writeFileSync(
        'docs/components.json',
        JSON.stringify(allComponents, null, 2)
    );

    console.log(`✅ Discovery complete! Found ${allComponents.length} total components`);
    console.log(`📄 Component list saved to docs/components.json`);
}

// Run the script
buildComponentIndex().catch(console.error);
