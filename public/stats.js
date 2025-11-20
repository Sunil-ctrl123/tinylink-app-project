/**
 * TinyLink - Stats Page JavaScript
 * Handles loading and displaying stats for a single link
 */

// ============================================
// DOM ELEMENTS
// ============================================

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const statsContent = document.getElementById('statsContent');
const errorMsg = document.getElementById('errorMsg');
const statCode = document.getElementById('statCode');
const statUrl = document.getElementById('statUrl');
const statShortUrl = document.getElementById('statShortUrl');
const statClicks = document.getElementById('statClicks');
const statCreationCount = document.getElementById('statCreationCount');
const statLastClicked = document.getElementById('statLastClicked');
const statCreated = document.getElementById('statCreated');
const visitLink = document.getElementById('visitLink');
const copyNotification = document.getElementById('copyNotification');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
});

// ============================================
// LOAD STATS
// ============================================

async function loadStats() {
  // Extract short code from URL
  const pathParts = window.location.pathname.split('/');
  const code = pathParts[pathParts.length - 1];
  
  if (!code) {
    showError('Invalid link code');
    return;
  }
  
  try {
    const response = await fetch(`/api/links/${code}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        showError('Link not found');
      } else {
        showError('Error loading link details');
      }
      return;
    }
    
    const link = await response.json();
    displayStats(link);
    
  } catch (error) {
    console.error('Error:', error);
    showError('An error occurred while loading link details');
  }
}

// ============================================
// DISPLAY STATS
// ============================================

function displayStats(link) {
  // Hide loading state
  loadingState.style.display = 'none';
  
  // Construct short URL using relative path - works everywhere
  const shortUrl = `/${link.short_code}`;
  
  // Populate stats
  statCode.textContent = link.short_code;
  statShortUrl.textContent = shortUrl;
  statUrl.textContent = link.target_url;
  statClicks.textContent = link.total_clicks.toLocaleString();
  statCreationCount.textContent = link.creation_count || 1;
  
  // Format dates
  if (link.last_clicked) {
    const lastClickedDate = new Date(link.last_clicked);
    statLastClicked.textContent = lastClickedDate.toLocaleString();
  } else {
    statLastClicked.textContent = 'Never';
  }
  
  const createdDate = new Date(link.created_at);
  statCreated.textContent = createdDate.toLocaleString();
  
  // Set visit link
  visitLink.href = shortUrl;
  
  // Show stats
  statsContent.style.display = 'block';
}

// ============================================
// ERROR HANDLING
// ============================================

function showError(message) {
  loadingState.style.display = 'none';
  errorMsg.textContent = message;
  errorState.style.display = 'block';
}

// ============================================
// COPY FUNCTIONS
// ============================================

function copyCode() {
  const code = statCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    showCopyNotification();
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function copyShortUrl() {
  const url = statShortUrl.textContent;
  navigator.clipboard.writeText(url).then(() => {
    showCopyNotification();
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function copyUrl() {
  const url = statUrl.textContent;
  navigator.clipboard.writeText(url).then(() => {
    showCopyNotification();
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function showCopyNotification() {
  copyNotification.classList.add('show');
  setTimeout(() => {
    copyNotification.classList.remove('show');
  }, 2000);
}

// ============================================
// DELETE FUNCTION
// ============================================

async function deleteLink() {
  const code = statCode.textContent;
  
  if (!confirm(`Are you sure you want to delete the link "${code}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/links/${code}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // Show success message and redirect
      alert('Link deleted successfully');
      window.location.href = '/';
    } else {
      showError('Failed to delete link');
    }
  } catch (error) {
    console.error('Error deleting link:', error);
    showError('An error occurred while deleting the link');
  }
}
