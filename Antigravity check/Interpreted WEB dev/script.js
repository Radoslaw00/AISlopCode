const dropZone = document.getElementById('drop-zone');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const fileList = document.getElementById('file-details-list');
const resetBtn = document.getElementById('reset-btn');

// Charts
let filesChartInstance = null;
let linesChartInstance = null;

// Language definitions
const languages = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'html': 'HTML',
    'css': 'CSS',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'cs': 'C#',
    'go': 'Go',
    'rs': 'Rust',
    'php': 'PHP',
    'rb': 'Ruby',
    'json': 'JSON',
    'md': 'Markdown',
    'sql': 'SQL'
};

let stats = {
    totalFiles: 0,
    totalLines: 0,
    totalSize: 0,
    byLanguage: {}
};

// Drag & Drop Events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const items = e.dataTransfer.items;
    if (!items) return;

    startProcessing();

    try {
        const fileEntries = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                await traverseFileTree(item, fileEntries);
            }
        }
        await processFiles(fileEntries);
        showResults();
    } catch (error) {
        console.error("Error processing files:", error);
        alert("An error occurred while processing files.");
        resetUI();
    }
});

function startProcessing() {
    dropZone.classList.add('hidden');
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    
    // Reset stats
    stats = {
        totalFiles: 0,
        totalLines: 0,
        totalSize: 0,
        byLanguage: {}
    };
    fileList.innerHTML = '';
}

function resetUI() {
    dropZone.classList.remove('hidden');
    loading.classList.add('hidden');
    results.classList.add('hidden');
}

resetBtn.addEventListener('click', resetUI);

// Recursive File Traversal
function traverseFileTree(item, fileEntries) {
    return new Promise((resolve) => {
        if (item.isFile) {
            item.file((file) => {
                fileEntries.push(file);
                resolve();
            });
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const readEntries = () => {
                dirReader.readEntries(async (entries) => {
                    if (entries.length === 0) {
                        resolve();
                    } else {
                        const promises = entries.map(entry => traverseFileTree(entry, fileEntries));
                        await Promise.all(promises);
                        readEntries(); // Continue reading (readEntries returns blocks)
                    }
                });
            };
            readEntries();
        }
    });
}

async function processFiles(files) {
    for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        const lang = languages[ext];

        if (lang) {
            // Accepted file
            const text = await readFileContent(file);
            const lines = text.split('\n').length;
            
            stats.totalFiles++;
            stats.totalLines += lines;
            stats.totalSize += file.size;

            if (!stats.byLanguage[lang]) {
                stats.byLanguage[lang] = { count: 0, lines: 0, size: 0 };
            }
            stats.byLanguage[lang].count++;
            stats.byLanguage[lang].lines += lines;
            stats.byLanguage[lang].size += file.size;

            addFileToList(file.name, formatSize(file.size), lines, lang);
        } else {
            // Rejected file
            addFileToList(file.name, formatSize(file.size), '-', 'File format not accepted', true);
        }
    }
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

function addFileToList(name, size, lines, type, isError = false) {
    const li = document.createElement('li');
    if (isError) {
        li.innerHTML = `<span>${name}</span> <span class="error-msg">${type}</span>`;
    } else {
        li.innerHTML = `<span>${name} (${type})</span> <span>${lines} lines | ${size}</span>`;
    }
    fileList.appendChild(li);
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showResults() {
    loading.classList.add('hidden');
    results.classList.remove('hidden');

    document.getElementById('total-files').textContent = stats.totalFiles;
    document.getElementById('total-lines').textContent = stats.totalLines;
    document.getElementById('total-size').textContent = formatSize(stats.totalSize);

    renderCharts();
}

function renderCharts() {
    const ctxFiles = document.getElementById('filesChart').getContext('2d');
    const ctxLines = document.getElementById('linesChart').getContext('2d');

    if (filesChartInstance) filesChartInstance.destroy();
    if (linesChartInstance) linesChartInstance.destroy();

    const labels = Object.keys(stats.byLanguage);
    const fileData = labels.map(l => stats.byLanguage[l].count);
    const lineData = labels.map(l => stats.byLanguage[l].lines);
    
    // Generate colors
    const colors = labels.map(() => `hsla(${Math.random() * 360}, 70%, 60%, 0.7)`);
    const borderColors = colors.map(c => c.replace('0.7', '1'));

    Chart.defaults.color = '#a0a0a0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';

    filesChartInstance = new Chart(ctxFiles, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Files',
                data: fileData,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    linesChartInstance = new Chart(ctxLines, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lines of Code',
                data: lineData,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
