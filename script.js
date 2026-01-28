/**
 * AIRCRAFT PARTS INVENTORY TRACKER
 * Offline inventory management system with localStorage persistence
 */

// ==========================================
// CONSTANTS AND CONFIGURATION
// ==========================================

const STORAGE_KEY = 'aircraftPartsInventory';
const LOW_STOCK_THRESHOLD = 5;

// ==========================================
// DOM ELEMENTS
// ==========================================

// Form elements
const addPartForm = document.getElementById('addPartForm');
const partIdInput = document.getElementById('partId');
const partNameInput = document.getElementById('partName');
const quantityInput = document.getElementById('quantity');

// Table elements
const partsTableBody = document.getElementById('partsTableBody');
const emptyState = document.getElementById('emptyState');

// Summary elements
const totalPartsElement = document.getElementById('totalParts');
const lowStockCountElement = document.getElementById('lowStockCount');
const totalQuantityElement = document.getElementById('totalQuantity');
const lastUpdatedElement = document.getElementById('lastUpdated');

// Modal elements
const editModal = document.getElementById('editModal');
const editPartForm = document.getElementById('editPartForm');
const editPartIdInput = document.getElementById('editPartId');
const editPartNameInput = document.getElementById('editPartName');
const editQuantityInput = document.getElementById('editQuantity');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');

// Confirmation modal elements
const confirmModal = document.getElementById('confirmModal');
const confirmMessageElement = document.getElementById('confirmMessage');
const closeConfirmModalBtn = document.getElementById('closeConfirmModal');
const cancelConfirmBtn = document.getElementById('cancelConfirm');
const confirmActionBtn = document.getElementById('confirmAction');

// Clear all button
const clearAllBtn = document.getElementById('clearAllBtn');

// ==========================================
// STATE MANAGEMENT
// ==========================================

let parts = [];
let currentEditingPartId = null;
let currentConfirmAction = null;

/**
 * Load parts from localStorage
 */
function loadPartsFromStorage() {
    try {
        const storedParts = localStorage.getItem(STORAGE_KEY);
        if (storedParts) {
            parts = JSON.parse(storedParts);
        }
    } catch (error) {
        console.error('Error loading parts from storage:', error);
        parts = [];
    }
}

/**
 * Save parts to localStorage
 */
function savePartsToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
        updateLastUpdated();
    } catch (error) {
        console.error('Error saving parts to storage:', error);
        alert('Error saving data. Storage may be full.');
    }
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdatedElement.textContent = formattedDate;
}

// ==========================================
// PART OPERATIONS
// ==========================================

/**
 * Add a new part to the inventory
 * @param {string} partId - Unique part identifier
 * @param {string} partName - Name of the part
 * @param {number} quantity - Quantity in stock
 */
function addPart(partId, partName, quantity) {
    // Check if part ID already exists
    const existingPart = parts.find(part => part.id === partId);
    if (existingPart) {
        alert(`Part ID "${partId}" already exists. Please use a unique ID.`);
        return false;
    }

    // Create new part object
    const newPart = {
        id: partId,
        name: partName,
        quantity: parseInt(quantity, 10)
    };

    // Add to parts array
    parts.push(newPart);
    
    // Save to storage
    savePartsToStorage();
    
    // Update UI
    renderParts();
    updateSummary();
    
    return true;
}

/**
 * Update the quantity of an existing part
 * @param {string} partId - Part identifier
 * @param {number} newQuantity - New quantity value
 */
function updatePartQuantity(partId, newQuantity) {
    const part = parts.find(p => p.id === partId);
    if (part) {
        part.quantity = parseInt(newQuantity, 10);
        savePartsToStorage();
        renderParts();
        updateSummary();
        return true;
    }
    return false;
}

/**
 * Delete a part from the inventory
 * @param {string} partId - Part identifier to delete
 */
function deletePart(partId) {
    const index = parts.findIndex(p => p.id === partId);
    if (index !== -1) {
        parts.splice(index, 1);
        savePartsToStorage();
        renderParts();
        updateSummary();
        return true;
    }
    return false;
}

/**
 * Clear all parts from inventory
 */
function clearAllParts() {
    parts = [];
    savePartsToStorage();
    renderParts();
    updateSummary();
}

// ==========================================
// UI RENDERING
// ==========================================

/**
 * Get status information based on quantity
 * @param {number} quantity - Part quantity
 * @returns {Object} Status object with class and label
 */
function getStatus(quantity) {
    if (quantity < LOW_STOCK_THRESHOLD) {
        return {
            class: 'status-low',
            label: 'LOW STOCK'
        };
    }
    return {
        class: 'status-ok',
        label: 'OK'
    };
}

/**
 * Render all parts in the table
 */
function renderParts() {
    // Clear existing rows
    partsTableBody.innerHTML = '';

    // Show/hide empty state
    if (parts.length === 0) {
        emptyState.classList.add('active');
        return;
    } else {
        emptyState.classList.remove('active');
    }

    // Render each part
    parts.forEach(part => {
        const status = getStatus(part.quantity);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(part.id)}</strong></td>
            <td>${escapeHtml(part.name)}</td>
            <td><strong>${part.quantity}</strong></td>
            <td>
                <span class="status-badge ${status.class}">
                    <span class="status-indicator"></span>
                    ${status.label}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-edit" onclick="openEditModal('${escapeHtml(part.id)}')">
                        Edit
                    </button>
                    <button class="action-btn action-btn-delete" onclick="confirmDelete('${escapeHtml(part.id)}')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        
        partsTableBody.appendChild(row);
    });
}

/**
 * Update summary statistics
 */
function updateSummary() {
    // Total parts count
    totalPartsElement.textContent = parts.length;
    
    // Low stock count
    const lowStockCount = parts.filter(part => part.quantity < LOW_STOCK_THRESHOLD).length;
    lowStockCountElement.textContent = lowStockCount;
    
    // Total quantity
    const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0);
    totalQuantityElement.textContent = totalQuantity;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Handle add part form submission
 */
addPartForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const partId = partIdInput.value.trim();
    const partName = partNameInput.value.trim();
    const quantity = quantityInput.value;
    
    // Validate inputs
    if (!partId || !partName || quantity === '') {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Add part
    const success = addPart(partId, partName, quantity);
    
    // Reset form if successful
    if (success) {
        addPartForm.reset();
        partIdInput.focus();
    }
});

/**
 * Open edit modal for a specific part
 * @param {string} partId - Part ID to edit
 */
window.openEditModal = function(partId) {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    
    currentEditingPartId = partId;
    editPartIdInput.value = part.id;
    editPartNameInput.value = part.name;
    editQuantityInput.value = part.quantity;
    
    editModal.classList.add('active');
    editQuantityInput.focus();
};

/**
 * Close edit modal
 */
function closeEditModal() {
    editModal.classList.remove('active');
    currentEditingPartId = null;
    editPartForm.reset();
}

/**
 * Handle edit form submission
 */
editPartForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newQuantity = editQuantityInput.value;
    
    if (newQuantity === '' || newQuantity < 0) {
        alert('Please enter a valid quantity.');
        return;
    }
    
    if (currentEditingPartId) {
        updatePartQuantity(currentEditingPartId, newQuantity);
        closeEditModal();
    }
});

// Edit modal close buttons
closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal when clicking outside
editModal.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModal();
    }
});

/**
 * Open confirmation modal
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback function on confirmation
 */
function openConfirmModal(message, onConfirm) {
    confirmMessageElement.textContent = message;
    currentConfirmAction = onConfirm;
    confirmModal.classList.add('active');
}

/**
 * Close confirmation modal
 */
function closeConfirmModal() {
    confirmModal.classList.remove('active');
    currentConfirmAction = null;
}

/**
 * Confirm delete action
 * @param {string} partId - Part ID to delete
 */
window.confirmDelete = function(partId) {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    
    openConfirmModal(
        `Are you sure you want to delete part "${part.id} - ${part.name}"?`,
        () => deletePart(partId)
    );
};

/**
 * Confirm clear all action
 */
clearAllBtn.addEventListener('click', function() {
    if (parts.length === 0) {
        alert('Inventory is already empty.');
        return;
    }
    
    openConfirmModal(
        `Are you sure you want to delete ALL ${parts.length} parts from the inventory? This action cannot be undone.`,
        clearAllParts
    );
});

// Confirmation modal event listeners
confirmActionBtn.addEventListener('click', function() {
    if (currentConfirmAction) {
        currentConfirmAction();
    }
    closeConfirmModal();
});

closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
cancelConfirmBtn.addEventListener('click', closeConfirmModal);

// Close confirmation modal when clicking outside
confirmModal.addEventListener('click', function(e) {
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize the application
 */
function initializeApp() {
    // Load parts from storage
    loadPartsFromStorage();
    
    // Render initial state
    renderParts();
    updateSummary();
    
    // Set focus to first input
    partIdInput.focus();
    
    console.log('Aircraft Parts Inventory Tracker initialized successfully');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

/**
 * Show specific page and update navigation
 * @param {string} pageName - Name of the page to show ('inventory' or 'about')
 */
window.showPage = function(pageName) {
    // Get all page elements
    const inventoryPage = document.getElementById('inventoryPage');
    const aboutPage = document.getElementById('aboutPage');
    
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Hide all pages
    inventoryPage.classList.remove('active');
    aboutPage.classList.remove('active');
    
    // Remove active class from all nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected page and activate corresponding button
    if (pageName === 'inventory') {
        inventoryPage.classList.add('active');
        navButtons[0].classList.add('active');
    } else if (pageName === 'about') {
        aboutPage.classList.add('active');
        navButtons[1].classList.add('active');
    }
};

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        if (editModal.classList.contains('active')) {
            closeEditModal();
        }
        if (confirmModal.classList.contains('active')) {
            closeConfirmModal();
        }
    }
});