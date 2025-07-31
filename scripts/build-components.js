const fs = require('fs');
const path = require('path');

// Read the list of repositories we want to monitor
const repos = JSON.parse(fs.readFileSync('data/repos.json', 'utf8'));

async function buildComponentIndex() {
    console.log('🔍 Starting component discovery...');

    const allComponents = [];

    // Check each repository one by one
    for (const { owner, repo, branch } of repos) {
        console.log(`📂 Checking ${owner}/${repo} (${branch} branch)...`);

        try {
            // Ask GitHub for all files in this repository
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

            // Find all index.html files
            const indexFiles = data.tree.filter(item =>
                item.type === 'blob' && item.path.endsWith('index.html')
            );

            console.log(`   Found ${indexFiles.length} components`);

            // Process each index.html file
            indexFiles.forEach(file => {
                // Remove '/index.html' from the path to get component path
                const componentPath = file.path.replace('index.html', '').slice(0, -1);

                // Get component name (last part of path)
                const componentName = componentPath.split('/').pop() || 'components';

                // Get category name (first part of path)
                const categoryName = componentPath.split('/')[0] || 'root';

                allComponents.push({
                    owner,
                    repo,
                    branch,
                    path: componentPath,
                    name: componentName,
                    category: categoryName,
                    // We'll create this proxy URL later
                    previewUrl: `https://component-proxy.qualyj.workers.dev/${owner}/${repo}/${branch}/${file.path}`,
                    sourceUrl: `https://github.com/${owner}/${repo}/tree/${branch}/${componentPath}`
                });
            });

        } catch (error) {
            console.error(`❌ Error processing ${owner}/${repo}:`, error.message);
        }

        // Wait a bit between requests to be nice to GitHub's servers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Group components by repository and category for easier display
    const groupedComponents = {};

    allComponents.forEach(component => {
        const repoKey = `${component.owner}/${component.repo}`;

        if (!groupedComponents[repoKey]) {
            groupedComponents[repoKey] = {};
        }

        if (!groupedComponents[repoKey][component.category]) {
            groupedComponents[repoKey][component.category] = [];
        }

        groupedComponents[repoKey][component.category].push(component);
    });

    // Make sure docs directory exists
    if (!fs.existsSync('docs')) {
        fs.mkdirSync('docs');
    }

    // Save the component list
    fs.writeFileSync(
        'docs/components.json',
        JSON.stringify(groupedComponents, null, 2)
    );

    console.log(`✅ Discovery complete! Found ${allComponents.length} total components`);
    console.log(`📄 Component list saved to docs/components.json`);

    // Show summary
    Object.entries(groupedComponents).forEach(([repoKey, categories]) => {
        const totalInRepo = Object.values(categories).flat().length;
        console.log(`   ${repoKey}: ${totalInRepo} components`);
    });
}

// Run the script
buildComponentIndex().catch(console.error);
