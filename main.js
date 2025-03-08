/**
 * Thread Viewer - Main JavaScript
 * 
 * This script handles the dynamic loading and rendering of thread data
 * from a JSON file, along with search functionality and responsive design.
 */

// Global state variables
let allThreads = [];
let currentThread = null;

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
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !threadsElement.classList.contains('hidden')) {
            showThreadsView();
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
 * Perform search based on input value
 */
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        // If search is empty, show all threads
        renderThreads(allThreads);
        return;
    }
    
    // Filter threads based on search term
    const filteredThreads = allThreads.filter(thread => {
        // Search in title, keyword, username
        if (thread.post_title.toLowerCase().includes(searchTerm) ||
            thread.keyword.toLowerCase().includes(searchTerm) ||
            thread.username.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in replies
        if (thread.replies && thread.replies.length > 0) {
            return thread.replies.some(reply => 
                reply.reply.toLowerCase().includes(searchTerm) ||
                (reply.user && reply.user.toLowerCase().includes(searchTerm))
            );
        }
        
        return false;
    });
    
    renderThreads(filteredThreads);
    
    // If no results found, show message
    if (filteredThreads.length === 0) {
        showNoResults();
    }
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
