// Global state
let apiKey = '';
let orgId = '';
let projects = [];
let selectedProjects = new Set();
let generatedDocs = [];

// API Base URL - UPDATE THIS WITH YOUR ACTUAL API ENDPOINT
const API_BASE_URL = 'https://pipedream-doc-tool.onrender.com'; // TODO: Replace with actual endpoint

/**
 * Toggle password visibility
 */
function togglePassword() {
    const input = document.getElementById('api-key');
    const showText = document.querySelector('.show-text');
    const hideText = document.querySelector('.hide-text');

    if (input.type === 'password') {
        input.type = 'text';
        showText.style.display = 'none';
        hideText.style.display = 'inline';
    } else {
        input.type = 'password';
        showText.style.display = 'inline';
        hideText.style.display = 'none';
    }
}

/**
 * Connect to Pipedream and fetch projects
 */
async function connectAndFetchProjects() {
    const apiKeyInput = document.getElementById('api-key');
    const orgIdInput = document.getElementById('org-id');
    const connectBtn = document.getElementById('connect-btn');
    const errorDiv = document.getElementById('auth-error');

    // Validate input
    apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showError(errorDiv, 'Please enter your Pipedream API key');
        return;
    }

    orgId = orgIdInput.value.trim();

    // Show loading state
    setButtonLoading(connectBtn, true);
    hideError(errorDiv);

    try {
        // Fetch projects from API
        const response = await fetch(`${API_BASE_URL}/projects?limit=100`, {
            method: 'GET',
            headers: {
                'X-Pipedream-API-Key': apiKey,
                ...(orgId && { 'X-Org-Id': orgId })
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        projects = data.projects || [];

        if (projects.length === 0) {
            showError(errorDiv, 'No projects found in your workspace');
            return;
        }

        // Display projects
        displayProjects();

        // Show next sections
        document.getElementById('project-section').style.display = 'block';
        document.getElementById('generation-section').style.display = 'block';

    } catch (error) {
        console.error('Error fetching projects:', error);

        // Provide specific error messages
        let errorMessage = 'Failed to connect. Please check your credentials.';
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Connection failed. This might be a CORS issue. Please ensure your API server allows requests from this domain.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        showError(errorDiv, errorMessage);
    } finally {
        setButtonLoading(connectBtn, false);
    }
}

/**
 * Display projects in the UI
 */
function displayProjects() {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.onclick = () => toggleProjectSelection(project.id);

        card.innerHTML = `
            <input
                type="checkbox"
                id="project-${project.id}"
                onchange="toggleProjectSelection('${project.id}')"
                onclick="event.stopPropagation()"
            >
            <div class="project-info">
                <div class="project-name">${escapeHtml(project.name)}</div>
                <div class="project-meta">
                    <span>${project.workflow_count} workflow${project.workflow_count !== 1 ? 's' : ''}</span>
                    <span>Created: ${formatDate(project.created_at)}</span>
                </div>
            </div>
        `;

        projectsList.appendChild(card);
    });

    updateProjectCount();
}

/**
 * Toggle project selection
 */
function toggleProjectSelection(projectId) {
    const checkbox = document.getElementById(`project-${projectId}`);
    const card = checkbox.closest('.project-card');

    if (selectedProjects.has(projectId)) {
        selectedProjects.delete(projectId);
        checkbox.checked = false;
        card.classList.remove('selected');
    } else {
        selectedProjects.add(projectId);
        checkbox.checked = true;
        card.classList.add('selected');
    }

    updateProjectCount();
    updateGenerateButton();
}

/**
 * Toggle select all/deselect all
 */
function toggleSelectAll() {
    const selectAllText = document.getElementById('select-all-text');

    if (selectedProjects.size === projects.length) {
        // Deselect all
        selectedProjects.clear();
        projects.forEach(project => {
            const checkbox = document.getElementById(`project-${project.id}`);
            const card = checkbox.closest('.project-card');
            checkbox.checked = false;
            card.classList.remove('selected');
        });
        selectAllText.textContent = 'Select All';
    } else {
        // Select all
        projects.forEach(project => {
            selectedProjects.add(project.id);
            const checkbox = document.getElementById(`project-${project.id}`);
            const card = checkbox.closest('.project-card');
            checkbox.checked = true;
            card.classList.add('selected');
        });
        selectAllText.textContent = 'Deselect All';
    }

    updateProjectCount();
    updateGenerateButton();
}

/**
 * Update project count badge
 */
function updateProjectCount() {
    const countBadge = document.getElementById('project-count');
    const selectAllText = document.getElementById('select-all-text');

    countBadge.textContent = `${selectedProjects.size} project${selectedProjects.size !== 1 ? 's' : ''} selected`;
    selectAllText.textContent = selectedProjects.size === projects.length ? 'Deselect All' : 'Select All';
}

/**
 * Update generate button state
 */
function updateGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.disabled = selectedProjects.size === 0;
}

/**
 * Generate documentation for selected projects
 */
async function generateDocumentation() {
    const generateBtn = document.getElementById('generate-btn');
    const progressContainer = document.getElementById('generation-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const docType = document.getElementById('doc-type').value;
    const projectDescription = document.getElementById('project-description').value.trim();

    // Validate
    if (selectedProjects.size === 0) {
        return;
    }

    if (docType === 'enhanced' && !projectDescription) {
        alert('Please provide a project description for AI-enhanced documentation');
        return;
    }

    // Show loading state
    setButtonLoading(generateBtn, true);
    progressContainer.style.display = 'block';
    generatedDocs = [];

    const selectedProjectsArray = Array.from(selectedProjects);
    const total = selectedProjectsArray.length;
    let completed = 0;

    // Process each project
    for (const projectId of selectedProjectsArray) {
        const project = projects.find(p => p.id === projectId);
        progressText.textContent = `Generating documentation for "${project.name}" (${completed + 1}/${total})...`;

        try {
            const endpoint = docType === 'enhanced'
                ? `/projects/${projectId}/documentation?project_description=${encodeURIComponent(projectDescription)}`
                : `/projects/${projectId}/raw-documentation`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'X-Pipedream-API-Key': apiKey,
                    ...(orgId && { 'X-Org-Id': orgId })
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to generate documentation: ${response.statusText}`);
            }

            const documentation = await response.text();

            generatedDocs.push({
                projectId: project.id,
                projectName: project.name,
                content: documentation,
                status: 'success'
            });

        } catch (error) {
            console.error(`Error generating documentation for ${project.name}:`, error);

            // Provide specific error message
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = 'CORS error - Backend must allow cross-origin requests';
            }

            generatedDocs.push({
                projectId: project.id,
                projectName: project.name,
                error: errorMessage,
                status: 'error'
            });
        }

        completed++;
        const progress = (completed / total) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Show results
    progressText.textContent = 'Documentation generation complete!';
    setButtonLoading(generateBtn, false);
    displayResults();

    // Show results section
    document.getElementById('results-section').style.display = 'block';

    // Scroll to results
    setTimeout(() => {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

/**
 * Display generated documentation results
 */
function displayResults() {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    generatedDocs.forEach((doc, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const statusBadge = doc.status === 'success'
            ? '<span class="status-badge success">Success</span>'
            : '<span class="status-badge error">Failed</span>';

        const actions = doc.status === 'success'
            ? `<button class="btn btn-primary btn-sm" onclick="downloadDocument(${index})">Download</button>`
            : `<span style="color: var(--error-color); font-size: 0.875rem;">${escapeHtml(doc.error)}</span>`;

        card.innerHTML = `
            <div class="result-info">
                <div class="result-name">${escapeHtml(doc.projectName)}</div>
                <div class="result-status">${statusBadge}</div>
            </div>
            <div class="result-actions">
                ${actions}
            </div>
        `;

        resultsList.appendChild(card);
    });
}

/**
 * Download a single document
 */
function downloadDocument(index) {
    const doc = generatedDocs[index];
    if (doc.status !== 'success') return;

    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(doc.projectName)}_documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download all successful documents
 */
function downloadAll() {
    const successfulDocs = generatedDocs.filter(doc => doc.status === 'success');

    if (successfulDocs.length === 0) {
        alert('No successful documentation to download');
        return;
    }

    successfulDocs.forEach((doc, index) => {
        setTimeout(() => {
            downloadDocument(generatedDocs.indexOf(doc));
        }, index * 200); // Slight delay between downloads
    });
}

/**
 * Clear results and start over
 */
function clearResults() {
    if (!confirm('Are you sure you want to start over? This will clear all generated documentation.')) {
        return;
    }

    // Reset state
    selectedProjects.clear();
    generatedDocs = [];

    // Reset UI
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('generation-progress').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('project-description').value = '';

    // Reset project selections
    projects.forEach(project => {
        const checkbox = document.getElementById(`project-${project.id}`);
        const card = checkbox.closest('.project-card');
        checkbox.checked = false;
        card.classList.remove('selected');
    });

    updateProjectCount();
    updateGenerateButton();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Toggle help section
 */
function toggleHelp(helpId) {
    const helpBox = document.getElementById(helpId);
    if (helpBox.style.display === 'none') {
        helpBox.style.display = 'block';
    } else {
        helpBox.style.display = 'none';
    }
}

/**
 * Toggle CORS help section
 */
function toggleCorsHelp() {
    toggleHelp('cors-help');
}

/**
 * Handle doc type change
 */
document.getElementById('doc-type').addEventListener('change', function() {
    const descriptionGroup = document.getElementById('project-description-group');
    if (this.value === 'enhanced') {
        descriptionGroup.style.display = 'block';
    } else {
        descriptionGroup.style.display = 'none';
    }
});

// Utility Functions

/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError(element) {
    element.style.display = 'none';
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * Format date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
