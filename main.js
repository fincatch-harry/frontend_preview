/**
 * Thread Viewer - Main JavaScript
 * 
 * This script handles the dynamic loading and rendering of thread data
 * from a JSON file, along with search functionality and responsive design.
 */

// Global state variables
let allThreads = [];
let currentThread = null;
let uniqueKeywords = new Set();
let activeFilters = {
    keywords: [],
    startDate: null,
    endDate: null
};

// DOM Elements
const loadingElement = document.getElementById('loading');
const threadsElement = document.getElementById('threads');
const threadDetailElement = document.getElementById('threadDetail');
const threadContentElement = document.getElementById('threadContent');
const noResultsElement = document.getElementById('noResults');
const backButton = document.getElementById('backButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const currentYearElement = document.getElementById('currentYear');

// Filter Elements
const filterToggleBtn = document.getElementById('filterToggleBtn');
const filterPanel = document.getElementById('filterPanel');
const keywordFilters = document.getElementById('keywordFilters');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

// Templates
const threadCardTemplate = document.getElementById('threadCardTemplate');
const replyTemplate = document.getElementById('replyTemplate');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in the footer
    currentYearElement.textContent = new Date().getFullYear();
    
    // Load thread data
    loadThreadData();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Fetch and load thread data from JSON file
 */
async function loadThreadData() {
    try {
        showLoading();
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        allThreads = data;
        
        // Extract unique keywords for filter
        extractUniqueKeywords();
        
        // Initialize filters
        initializeFilters();
        
        // Render all threads initially
        renderThreads(allThreads);
    } catch (error) {
        console.error('Error loading thread data:', error);
        showError('Failed to load thread data. Please try refreshing the page.');
    } finally {
        hideLoading();
    }
}

/**
 * Extract unique keywords from threads
 */
function extractUniqueKeywords() {
    uniqueKeywords.clear();
    
    allThreads.forEach(thread => {
        if (thread.keyword) {
            uniqueKeywords.add(thread.keyword);
        }
    });
}

/**
 * Initialize filter components
 */
function initializeFilters() {
    // Clear existing keyword filters
    keywordFilters.innerHTML = '';
    
    // Add keyword chips
    uniqueKeywords.forEach(keyword => {
        const keywordChip = document.createElement('div');
        keywordChip.className = 'keyword-chip';
        keywordChip.setAttribute('data-keyword', keyword);
        keywordChip.textContent = keyword;
        
        keywordChip.addEventListener('click', () => {
            keywordChip.classList.toggle('selected');
        });
        
        keywordFilters.appendChild(keywordChip);
    });
    
    // Set date inputs to cover last month by default
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    startDateInput.valueAsDate = lastMonth;
    endDateInput.valueAsDate = today;
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Back button event
    backButton.addEventListener('click', showThreadsView);
    
    // Search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter toggle
    filterToggleBtn.addEventListener('click', toggleFilterPanel);
    
    // Apply filters
    applyFiltersBtn.addEventListener('click', applyFilters);
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (filterPanel && !filterPanel.classList.contains('hidden')) {
                toggleFilterPanel();
            } else if (!threadsElement.classList.contains('hidden')) {
                showThreadsView();
            }
        }
    });
}

/**
 * Render all threads to the page
 * @param {Array} threads - Array of thread objects to render
 */
function renderThreads(threads) {
    // Clear existing content
    threadsElement.innerHTML = '';
    
    if (threads.length === 0) {
        showNoResults();
        return;
    }
    
    // Hide no results message if it was showing
    hideNoResults();
    
    // Create and append thread cards
    threads.forEach(thread => {
        const threadCard = createThreadCard(thread);
        threadsElement.appendChild(threadCard);
    });
    
    // Show the threads section
    showThreadsView();
}

/**
 * Create a thread card element
 * @param {Object} thread - Thread data object
 * @returns {HTMLElement} - Thread card element
 */
function createThreadCard(thread) {
    // Clone the template
    const threadCard = threadCardTemplate.content.cloneNode(true);
    
    // Populate the thread card with data
    threadCard.querySelector('.thread-title').textContent = thread.post_title;
    threadCard.querySelector('.thread-number').textContent = `#${thread.thread_number}`;
    threadCard.querySelector('.thread-keyword').textContent = thread.keyword;
    threadCard.querySelector('.thread-username').textContent = `by ${thread.username}`;
    
    // Get the first reply text as a preview (if available)
    if (thread.replies && thread.replies.length > 0) {
        threadCard.querySelector('.thread-preview').textContent = thread.replies[0].reply;
    } else {
        threadCard.querySelector('.thread-preview').textContent = 'No replies yet';
    }
    
    // Add event listener to view button
    const viewButton = threadCard.querySelector('.view-thread-btn');
    viewButton.addEventListener('click', () => {
        showThreadDetail(thread);
    });
    
    return threadCard;
}

/**
 * Show thread detail view for a specific thread
 * @param {Object} thread - Thread data object
 */
function showThreadDetail(thread) {
    // Set current thread
    currentThread = thread;
    
    // Clear existing content
    threadContentElement.innerHTML = '';
    
    // Create thread header
    const threadHeader = document.createElement('div');
    threadHeader.className = 'thread-header';
    
    const title = document.createElement('h2');
    title.className = 'thread-detail-title';
    title.textContent = thread.post_title;
    
    const meta = document.createElement('div');
    meta.className = 'thread-detail-meta';
    
    meta.innerHTML = `
        <span class="thread-number">Thread #${thread.thread_number}</span>
        <span class="thread-keyword">Keyword: ${thread.keyword}</span>
        <span class="thread-username">Posted by: ${thread.username}</span>
    `;
    
    threadHeader.appendChild(title);
    threadHeader.appendChild(meta);
    threadContentElement.appendChild(threadHeader);
    
    // Create replies section
    if (thread.replies && thread.replies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'replies-container';
        
        const repliesTitle = document.createElement('h3');
        repliesTitle.className = 'replies-title';
        repliesTitle.textContent = `Replies (${thread.replies.length})`;
        repliesContainer.appendChild(repliesTitle);
        
        // Add each reply
        thread.replies.forEach(reply => {
            const replyElement = createReplyElement(reply);
            repliesContainer.appendChild(replyElement);
        });
        
        threadContentElement.appendChild(repliesContainer);
    } else {
        const noReplies = document.createElement('p');
        noReplies.textContent = 'No replies yet.';
        threadContentElement.appendChild(noReplies);
    }
    
    // Hide threads view and show thread detail
    threadsElement.classList.add('hidden');
    noResultsElement.classList.add('hidden');
    threadDetailElement.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Create a reply element
 * @param {Object} reply - Reply data object
 * @returns {HTMLElement} - Reply element
 */
function createReplyElement(reply) {
    // Clone the template
    const replyElement = replyTemplate.content.cloneNode(true);
    
    // Populate with data
    replyElement.querySelector('.reply-user').textContent = reply.user || 'Anonymous';
    replyElement.querySelector('.reply-time').textContent = reply.time || '';
    replyElement.querySelector('.reply-content').textContent = reply.reply || '';
    
    return replyElement;
}

/**
 * Show threads view (hide detail view)
 */
function showThreadsView() {
    threadDetailElement.classList.add('hidden');
    threadsElement.classList.remove('hidden');
    
    // Only show no results if there are actually no results
    if (allThreads.length === 0) {
        showNoResults();
    } else {
        hideNoResults();
    }
    
    // Clear current thread
    currentThread = null;
}

/**
 * Perform search based on input value and active filters
 */
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Apply all filters and search
    const filteredThreads = filterThreads(searchTerm);
    
    renderThreads(filteredThreads);
    
    // If no results found, show message
    if (filteredThreads.length === 0) {
        showNoResults();
    }
}

/**
 * Filter threads based on search term and active filters
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} - Filtered threads array
 */
function filterThreads(searchTerm = '') {
    return allThreads.filter(thread => {
        // Check search term if provided
        if (searchTerm !== '') {
            const matchesSearch = 
                thread.post_title.toLowerCase().includes(searchTerm) ||
                thread.keyword.toLowerCase().includes(searchTerm) ||
                thread.username.toLowerCase().includes(searchTerm) ||
                (thread.replies && thread.replies.some(reply => 
                    reply.reply.toLowerCase().includes(searchTerm) ||
                    (reply.user && reply.user.toLowerCase().includes(searchTerm))
                ));
                
            if (!matchesSearch) return false;
        }
        
        // Check keyword filter
        if (activeFilters.keywords.length > 0 && !activeFilters.keywords.includes(thread.keyword)) {
            return false;
        }
        
        // Check date range if we have valid dates and thread has replies
        if (activeFilters.startDate && activeFilters.endDate && thread.replies && thread.replies.length > 0) {
            // Try to find at least one reply that falls within the date range
            const hasReplyInDateRange = thread.replies.some(reply => {
                if (!reply.time) return false;
                
                // Parse date from format like "2024年5月7日 21:24:39"
                const dateParts = reply.time.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
                
                if (!dateParts) return false;
                
                const replyDate = new Date(
                    parseInt(dateParts[1]), // Year
                    parseInt(dateParts[2]) - 1, // Month (0-indexed)
                    parseInt(dateParts[3]), // Day
                    parseInt(dateParts[4]), // Hour
                    parseInt(dateParts[5]), // Minute
                    parseInt(dateParts[6])  // Second
                );
                
                return replyDate >= activeFilters.startDate && replyDate <= activeFilters.endDate;
            });
            
            if (!hasReplyInDateRange) return false;
        }
        
        // Thread passed all filters
        return true;
    });
}

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    filterPanel.classList.toggle('hidden');
    
    // Update button state
    if (filterPanel.classList.contains('hidden')) {
        filterToggleBtn.setAttribute('aria-expanded', 'false');
        filterToggleBtn.classList.remove('active');
    } else {
        filterToggleBtn.setAttribute('aria-expanded', 'true');
        filterToggleBtn.classList.add('active');
    }
}

/**
 * Apply selected filters
 */
function applyFilters() {
    // Get selected keywords
    const selectedKeywords = Array.from(document.querySelectorAll('.keyword-chip.selected'))
        .map(chip => chip.getAttribute('data-keyword'));
    
    // Get date range
    const startDate = startDateInput.valueAsDate;
    const endDate = endDateInput.valueAsDate;
    
    // Set end date to end of day
    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
    }
    
    // Update active filters
    activeFilters = {
        keywords: selectedKeywords,
        startDate: startDate,
        endDate: endDate
    };
    
    // Apply filters and search
    performSearch();
    
    // Close filter panel
    toggleFilterPanel();
}

/**
 * Reset all filters
 */
function resetFilters() {
    // Clear keyword selections
    document.querySelectorAll('.keyword-chip.selected').forEach(chip => {
        chip.classList.remove('selected');
    });
    
    // Reset date inputs
    startDateInput.value = '';
    endDateInput.value = '';
    
    // Clear active filters
    activeFilters = {
        keywords: [],
        startDate: null,
        endDate: null
    };
    
    // Show all threads
    renderThreads(allThreads);
}

/**
 * Show loading state
 */
function showLoading() {
    loadingElement.classList.remove('hidden');
    threadsElement.classList.add('hidden');
    threadDetailElement.classList.add('hidden');
    noResultsElement.classList.add('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingElement.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(el => el.remove());
    
    // Add to main
    document.querySelector('main').prepend(errorElement);
}

/**
 * Show no results message
 */
function showNoResults() {
    noResultsElement.classList.remove('hidden');
    threadsElement.classList.add('hidden');
}

/**
 * Hide no results message
 */
function hideNoResults() {
    noResultsElement.classList.add('hidden');
}
