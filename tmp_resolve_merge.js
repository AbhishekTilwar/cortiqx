const fs = require('fs');
const path = require('path');

let logFileName = path.join(__dirname, 'resolve_log.txt');
let logContent = "";

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // Match <<<<<<< HEAD\r\n ... =======\r\n ... >>>>>>> branch\r\n
        const pattern = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> [^\r\n]*(\r?\n)?/g;
        let newContent = content.replace(pattern, '$1');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            logContent += `Resolved: ${filePath}\n`;
        }
    } catch (e) {
        logContent += `Error processing ${filePath}: ${e}\n`;
    }
}

function walk(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        logContent += `Error reading dir ${dir}: ${e}\n`;
        return;
    }
    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            logContent += `Error stat ${fullPath}: ${e}\n`;
            continue;
        }
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walk(fullPath);
            }
        } else {
            // Process common source files
            if (/\.(js|jsx|ts|tsx|css|html|json|md|txt)$/.test(file)) {
                processFile(fullPath);
            }
        }
    }
}

try {
    walk(__dirname);
} catch (e) {
    logContent += `Global error: ${e}\n`;
}

fs.writeFileSync(logFileName, logContent || 'No files processed or matched', 'utf8');
