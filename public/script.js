/**
 * TinyLink - Dashboard JavaScript
 * Handles form submission, link management, search, and UI interactions
 */

let allLinks = [];

// ============================================
// DOM ELEMENTS
// ============================================

const linkForm = document.getElementById('linkForm');
const targetUrlInput = document.getElementById('targetUrl');
const shortCodeInput = document.getElementById('shortCode');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('searchInput');
const linksTable = document.getElementById('linksTable');
const linksBody = document.getElementById('linksBody');
const emptyState = document.getElementById('emptyState');
const urlError = document.getElementById('urlError');
const codeError = document.getElementById('codeError');
const successMsg = document.getElementById('successMsg');
const copyNotification = document.getElementById('copyNotification');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  setupEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  linkForm.addEventListener('submit', handleCreateLink);
  searchInput.addEventListener('input', handleSearch);
}

// ============================================
// FORM HANDLING
// ============================================

async function handleCreateLink(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  
  const targetUrl = targetUrlInput.value.trim();
  const shortCode = shortCodeInput.value.trim();
  
  // Validate URL
  if (!targetUrl) {
    showError(urlError, 'URL is required');
    return;
  }
  
  if (!isValidUrl(targetUrl)) {
    showError(urlError, 'Please enter a valid URL (including http:// or https://)');
    return;
  }
  
  // Validate custom code if provided
  if (shortCode && !isValidCode(shortCode)) {
    showError(codeError, 'Code must be 6-8 alphanumeric characters (A-Z, a-z, 0-9)');
    return;
  }
  
  // Disable button during submission
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_url: targetUrl,
        short_code: shortCode || undefined
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 409) {
        showError(codeError, `Short code "${shortCode}" already exists. Please choose another one.`);
      } else if (response.status === 400) {
        showError(urlError, data.error || 'Invalid input. Please check your entries.');
      } else {
        showError(urlError, data.error || 'Failed to create link');
      }
      return;
    }
    
    // Success!
    const isExisting = data.id ? 'Link already exists with short code: ' : 'Link created successfully! Short code: ';
    const countMsg = data.creation_count ? ` (Created ${data.creation_count} times)` : '';
    showSuccess(isExisting + data.short_code + countMsg);
    linkForm.reset();
    await loadLinks();
    
  } catch (error) {
    console.error('Error:', error);
    showError(urlError, 'An error occurred. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Link';
  }
}

// ============================================
// LOAD & DISPLAY LINKS
// ============================================

async function loadLinks() {
  try {
    const response = await fetch('/api/links');
    const data = await response.json();
    
    allLinks = data || [];
    renderLinks(allLinks);
    
  } catch (error) {
    console.error('Error loading links:', error);
    emptyState.textContent = 'Error loading links. Please refresh the page.';
  }
}

function renderLinks(links) {
  if (links.length === 0) {
    linksTable.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  linksTable.style.display = 'table';
  linksBody.innerHTML = '';
  
  links.forEach(link => {
    const row = createLinkRow(link);
    linksBody.appendChild(row);
  });
}

function createLinkRow(link) {
  const row = document.createElement('tr');
  
  // Use relative URL for TinyURL - works everywhere
  const shortUrl = `/${link.short_code}`;
  const creationCount = link.creation_count || 1;
  const totalClicks = link.total_clicks || 0;
  
  row.innerHTML = `
    <td>
      <span class="link-code">${link.short_code}</span>
    </td>
    <td>
      <a href="${shortUrl}" target="_blank" class="tinyurl-link" title="Click to visit">
        ${shortUrl}
      </a>
    </td>
    <td>
      <span class="link-url" title="${link.target_url}">
        ${truncateUrl(link.target_url)}
      </span>
    </td>
    <td>
      <div class="clicks-created">
        <div class="metric">
          <span class="metric-label">Clicks:</span>
          <span class="metric-value">${totalClicks}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Created:</span>
          <span class="metric-badge">${creationCount}</span>
        </div>
      </div>
    </td>
    <td>
      <div class="action-buttons">
        <button type="button" class="btn btn-small btn-copy" onclick="copyLink('${shortUrl}')" title="Copy short link to clipboard">
          📋 Copy
        </button>
        <button type="button" class="btn btn-small btn-delete" onclick="deleteLink('${link.short_code}')" title="Delete this link">
          🗑️ Delete
        </button>
      </div>
    </td>
  `;
  
  return row;
}

// ============================================
// DELETE LINK
// ============================================

async function deleteLink(code) {
  if (!confirm(`Are you sure you want to delete the link "${code}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/links/${code}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      alert('Failed to delete link');
      return;
    }
    
    showSuccess(`Link "${code}" deleted successfully`);
    await loadLinks();
    
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while deleting the link');
  }
}

// ============================================
// SEARCH & FILTER
// ============================================

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    renderLinks(allLinks);
    return;
  }
  
  const filtered = allLinks.filter(link => 
    link.short_code.toLowerCase().includes(searchTerm) ||
    link.target_url.toLowerCase().includes(searchTerm)
  );
  
  renderLinks(filtered);
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

function copyLink(url) {
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
// VALIDATION
// ============================================

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidCode(code) {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

// ============================================
// ERROR & SUCCESS MESSAGES
// ============================================

function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function clearErrors() {
  urlError.textContent = '';
  urlError.classList.remove('show');
  codeError.textContent = '';
  codeError.classList.remove('show');
  successMsg.textContent = '';
  successMsg.classList.remove('show');
}

function showSuccess(message) {
  successMsg.textContent = message;
  successMsg.classList.add('show');
  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);
}

// ============================================
// UTILITIES
// ============================================

function truncateUrl(url) {
  const maxLength = 50;
  if (url.length > maxLength) {
    return url.substring(0, maxLength) + '...';
  }
  return url;
}
