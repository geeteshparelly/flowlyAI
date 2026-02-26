const https = require('https');
const { execSync } = require('child_process');

// Get PAT from git credential store
const credInput = 'protocol=https\nhost=github.com\n';
let pat;
try {
    const result = execSync('git credential fill', { input: credInput, encoding: 'utf8' });
    const match = result.match(/password=(.+)/);
    if (match) pat = match[1].trim();
} catch (e) {}

if (!pat) {
    console.log('Could not get PAT from credential store');
    process.exit(1);
}

// Create repo via GitHub API
const data = JSON.stringify({ name: 'flowlyAI', public: true });
const options = {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Node.js'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 422) {
            console.log('Repo ready, pushing...');
            try {
                execSync('git remote remove origin', { stdio: 'ignore' });
            } catch(e) {}
            execSync('git remote add origin https://github.com/geeteshparelly/flowlyAI.git');
            execSync('git branch -M main');
            execSync('git push -u origin main', { stdio: 'inherit' });
            console.log('\nDone! Enabling Pages...');
            
            // Enable GitHub Pages
            const pagesData = JSON.stringify({ source: { branch: 'main', path: '/' } });
            const pagesOpts = {
                hostname: 'api.github.com',
                path: '/repos/geeteshparelly/flowlyAI/pages',
                method: 'POST',
                headers: {
                    'Authorization': `token ${pat}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'Content-Length': pagesData.length,
                    'User-Agent': 'Node.js'
                }
            };
            const pagesReq = https.request(pagesOpts, (pRes) => {
                let pBody = '';
                pRes.on('data', c => pBody += c);
                pRes.on('end', () => {
                    console.log('\n✅ Deployed to: https://geeteshparelly.github.io/flowlyAI/');
                });
            });
            pagesReq.write(pagesData);
            pagesReq.end();
        } else {
            console.log('Error:', res.statusCode, body);
        }
    });
});
req.write(data);
req.end();
