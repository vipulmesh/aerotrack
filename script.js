/**
 * AIRCRAFT PARTS INVENTORY TRACKER - SQLITE VERSION
 * Offline inventory management with native SQLite storage via Android bridge
 */

// ==========================================
// STORAGE CONFIGURATION
// ==========================================

const STORAGE_KEY = 'aircraftPartsInventory';
const LOW_STOCK_THRESHOLD = 5;

// Check if running in Android WebView with SQLite bridge
let isAndroidBridge = false;
let storageMode = 'localStorage'; // 'localStorage' or 'sqlite'

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

// ==========================================
// ANDROID BRIDGE DETECTION & INITIALIZATION
// ==========================================

/**
 * Check if Android bridge is available
 */
function checkAndroidBridge() {
    if (typeof Android !== 'undefined') {
        try {
            const result = Android.isAndroidBridgeAvailable();
            if (result === 'true') {
                isAndroidBridge = true;
                storageMode = 'sqlite';
                console.log('✅ Android SQLite bridge detected and active');
                console.log('📱 Storage mode: SQLite (Native)');
                return true;
            }
        } catch (e) {
            console.warn('Android bridge check failed:', e);
        }
    }
    
    console.log('💾 Storage mode: localStorage (Web)');
    console.log('ℹ️ Running in web browser - using localStorage fallback');
    return false;
}

/**
 * Callback for when Android bridge is ready
 */
window.onAndroidBridgeReady = function() {
    console.log('🔗 Android bridge ready callback triggered');
    checkAndroidBridge();
    initializeApp();
};

// ==========================================
// SQLITE BRIDGE FUNCTIONS
// ==========================================

/**
 * Load parts from SQLite via Android bridge
 */
async function loadPartsFromSQLite() {
    try {
        const jsonString = Android.getAllParts();
        console.log('📥 Loaded from SQLite:', jsonString);
        
        parts = JSON.parse(jsonString);
        return true;
    } catch (error) {
        console.error('❌ Error loading from SQLite:', error);
        parts = [];
        return false;
    }
}

/**
 * Add part to SQLite via Android bridge
 */
function addPartToSQLite(partId, partName, quantity) {
    try {
        const result = Android.insertPart(partId, partName, quantity);
        console.log('💾 SQLite insert result:', result);
        
        if (result === 'success') {
            return true;
        } else if (result.startsWith('error:')) {
            const errorMsg = result.substring(6);
            alert(errorMsg);
            return false;
        }
        return false;
    } catch (error) {
        console.error('❌ Error adding to SQLite:', error);
        alert('Error saving to database: ' + error.message);
        return false;
    }
}

/**
 * Update part in SQLite via Android bridge
 */
function updatePartInSQLite(partId, quantity) {
    try {
        const result = Android.updatePart(partId, quantity);
        console.log('🔄 SQLite update result:', result);
        
        if (result === 'success') {
            return true;
        } else if (result.startsWith('error:')) {
            const errorMsg = result.substring(6);
            alert(errorMsg);
            return false;
        }
        return false;
    } catch (error) {
        console.error('❌ Error updating SQLite:', error);
        alert('Error updating database: ' + error.message);
        return false;
    }
}

/**
 * Delete part from SQLite via Android bridge
 */
function deletePartFromSQLite(partId) {
    try {
        const result = Android.deletePart(partId);
        console.log('🗑️ SQLite delete result:', result);
        
        if (result === 'success') {
            return true;
        } else if (result.startsWith('error:')) {
            const errorMsg = result.substring(6);
            alert(errorMsg);
            return false;
        }
        return false;
    } catch (error) {
        console.error('❌ Error deleting from SQLite:', error);
        alert('Error deleting from database: ' + error.message);
        return false;
    }
}

/**
 * Clear all parts from SQLite via Android bridge
 */
function clearAllPartsFromSQLite() {
    try {
        const result = Android.clearAllParts();
        console.log('🧹 SQLite clear all result:', result);
        
        if (result === 'success') {
            return true;
        } else if (result.startsWith('error:')) {
            const errorMsg = result.substring(6);
            alert(errorMsg);
            return false;
        }
        return false;
    } catch (error) {
        console.error('❌ Error clearing SQLite:', error);
        alert('Error clearing database: ' + error.message);
        return false;
    }
}

// ==========================================
// LOCALSTORAGE FUNCTIONS (FALLBACK)
// ==========================================

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
        console.error('Error loading parts from localStorage:', error);
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
        console.error('Error saving parts to localStorage:', error);
        alert('Error saving data. Storage may be full.');
    }
}

// ==========================================
// UNIFIED STORAGE INTERFACE
// ==========================================

/**
 * Load parts from current storage (SQLite or localStorage)
 */
async function loadParts() {
    if (storageMode === 'sqlite') {
        await loadPartsFromSQLite();
    } else {
        loadPartsFromStorage();
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
 */
async function addPart(partId, partName, quantity) {
    // Check if part ID already exists
    const existingPart = parts.find(part => part.id === partId);
    if (existingPart) {
        alert(`Part ID "${partId}" already exists. Please use a unique ID.`);
        return false;
    }

    let success = false;

    if (storageMode === 'sqlite') {
        // Add to SQLite
        success = addPartToSQLite(partId, partName, quantity);
        if (success) {
            // Reload from SQLite to get updated data
            await loadPartsFromSQLite();
        }
    } else {
        // Add to localStorage
        const newPart = {
            id: partId,
            name: partName,
            quantity: parseInt(quantity, 10)
        };
        parts.push(newPart);
        savePartsToStorage();
        success = true;
    }

    if (success) {
        renderParts();
        updateSummary();
    }
    
    return success;
}

/**
 * Update the quantity of an existing part
 */
async function updatePartQuantity(partId, newQuantity) {
    let success = false;

    if (storageMode === 'sqlite') {
        // Update in SQLite
        success = updatePartInSQLite(partId, newQuantity);
        if (success) {
            // Reload from SQLite
            await loadPartsFromSQLite();
        }
    } else {
        // Update in localStorage
        const part = parts.find(p => p.id === partId);
        if (part) {
            part.quantity = parseInt(newQuantity, 10);
            savePartsToStorage();
            success = true;
        }
    }

    if (success) {
        renderParts();
        updateSummary();
    }
    
    return success;
}

/**
 * Delete a part from the inventory
 */
async function deletePart(partId) {
    let success = false;

    if (storageMode === 'sqlite') {
        // Delete from SQLite
        success = deletePartFromSQLite(partId);
        if (success) {
            // Reload from SQLite
            await loadPartsFromSQLite();
        }
    } else {
        // Delete from localStorage
        const index = parts.findIndex(p => p.id === partId);
        if (index !== -1) {
            parts.splice(index, 1);
            savePartsToStorage();
            success = true;
        }
    }

    if (success) {
        renderParts();
        updateSummary();
    }
    
    return success;
}

/**
 * Clear all parts from inventory
 */
async function clearAllParts() {
    let success = false;

    if (storageMode === 'sqlite') {
        // Clear SQLite
        success = clearAllPartsFromSQLite();
        if (success) {
            parts = [];
        }
    } else {
        // Clear localStorage
        parts = [];
        savePartsToStorage();
        success = true;
    }

    if (success) {
        renderParts();
        updateSummary();
    }
}

// ==========================================
// UI RENDERING
// ==========================================

/**
 * Get status information based on quantity
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
    partsTableBody.innerHTML = '';

    if (parts.length === 0) {
        emptyState.classList.add('active');
        return;
    } else {
        emptyState.classList.remove('active');
    }

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
    totalPartsElement.textContent = parts.length;
    
    const lowStockCount = parts.filter(part => part.quantity < LOW_STOCK_THRESHOLD).length;
    lowStockCountElement.textContent = lowStockCount;
    
    const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0);
    totalQuantityElement.textContent = totalQuantity;
}

/**
 * Escape HTML to prevent XSS attacks
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
addPartForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const partId = partIdInput.value.trim();
    const partName = partNameInput.value.trim();
    const quantity = quantityInput.value;
    
    if (!partId || !partName || quantity === '') {
        alert('Please fill in all required fields.');
        return;
    }
    
    const success = await addPart(partId, partName, quantity);
    
    if (success) {
        addPartForm.reset();
        partIdInput.focus();
    }
});

/**
 * Open edit modal for a specific part
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
editPartForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newQuantity = editQuantityInput.value;
    
    if (newQuantity === '' || newQuantity < 0) {
        alert('Please enter a valid quantity.');
        return;
    }
    
    if (currentEditingPartId) {
        await updatePartQuantity(currentEditingPartId, newQuantity);
        closeEditModal();
    }
});

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

editModal.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModal();
    }
});

/**
 * Open confirmation modal
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

confirmActionBtn.addEventListener('click', function() {
    if (currentConfirmAction) {
        currentConfirmAction();
    }
    closeConfirmModal();
});

closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
cancelConfirmBtn.addEventListener('click', closeConfirmModal);

confirmModal.addEventListener('click', function(e) {
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// ==========================================
// PAGE NAVIGATION
// ==========================================

window.showPage = function(pageName) {
    const inventoryPage = document.getElementById('inventoryPage');
    const aboutPage = document.getElementById('aboutPage');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    inventoryPage.classList.remove('active');
    aboutPage.classList.remove('active');
    
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    if (pageName === 'inventory') {
        inventoryPage.classList.add('active');
        navButtons[0].classList.add('active');
    } else if (pageName === 'about') {
        aboutPage.classList.add('active');
        navButtons[1].classList.add('active');
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('🚀 Initializing Aircraft Parts Inventory Tracker');
    console.log('📦 Storage Mode:', storageMode);
    
    // Load parts from storage
    await loadParts();
    
    // Render initial state
    renderParts();
    updateSummary();
    
    // Set focus to first input
    partIdInput.focus();
    
    console.log('✅ Aircraft Parts Inventory Tracker initialized successfully');
    console.log('📊 Total parts loaded:', parts.length);
}

// ==========================================
// STARTUP
// ==========================================

// Check for Android bridge immediately
if (checkAndroidBridge()) {
    // Bridge is available, wait for ready callback
    console.log('⏳ Waiting for Android bridge ready signal...');
} else {
    // No bridge, initialize with localStorage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (editModal.classList.contains('active')) {
            closeEditModal();
        }
        if (confirmModal.classList.contains('active')) {
            closeConfirmModal();
        }
    }
});

// ==========================================
// STORAGE MODE INDICATOR
// ==========================================

// Add storage mode indicator to footer (optional)
window.addEventListener('load', function() {
    const footer = document.querySelector('.footer');
    if (footer && storageMode === 'sqlite') {
        const modeIndicator = document.createElement('p');
        modeIndicator.className = 'footer-note';
        modeIndicator.innerHTML = '📱 <strong>SQLite Mode:</strong> Data stored in native database';
        modeIndicator.style.color = '#4CAF50';
        footer.appendChild(modeIndicator);
    }

});
