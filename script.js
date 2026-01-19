// Task Management UI - Interactive Functionality

document.addEventListener('DOMContentLoaded', () => {
    initFilterTabs();
    initAcceptButtons();
    initBottomNav();
    initSOSButton();
    initSearchBar();
    initUpdateDependencies();
    updateBadgeCounts();
});

/**
 * Initialize filter tab switching
 */
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const taskCards = document.querySelectorAll('.task-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            filterTasks(filter, taskCards);
        });
    });
}

/**
 * Filter tasks based on selected filter
 */
function filterTasks(filter, taskCards) {
    taskCards.forEach(card => {
        const status = card.dataset.status;

        if (filter === 'all') {
            card.classList.remove('hidden');
        } else if (filter === 'new' && status === 'new') {
            card.classList.remove('hidden');
        } else if (filter === 'in-progress' && status === 'in-progress') {
            card.classList.remove('hidden');
        } else if (filter === 'complete' && status === 'complete') {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/**
 * Initialize accept button interactions
 */
function initAcceptButtons() {
    const acceptButtons = document.querySelectorAll('.accept-btn');

    acceptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.task-card');

            if (card.classList.contains('accepted')) {
                return; // Already accepted
            }

            // Add accepted state
            card.classList.add('accepted');
            card.dataset.status = 'complete';

            // Remove accept button after acknowledgement
            btn.remove();

            // Update badge count
            updateBadgeCounts();

            // Show feedback
            showToast('Task accepted successfully!');
        });
    });
}

/**
 * Update filter tab badge counts
 */
function updateBadgeCounts() {
    const taskCards = document.querySelectorAll('.task-card');
    let newCount = 0;
    let inProgressCount = 0;
    let completeCount = 0;

    taskCards.forEach(card => {
        const status = card.dataset.status;
        if (status === 'new') newCount++;
        else if (status === 'in-progress') inProgressCount++;
        else if (status === 'complete') completeCount++;
    });

    // Update the "New" tab badge
    const newTab = document.querySelector('[data-filter="new"]');
    const badge = newTab.querySelector('.badge');
    if (badge) {
        badge.textContent = newCount;
        badge.style.display = newCount === 0 ? 'none' : 'inline-flex';
    }
}

/**
 * Sync dependent fields like RT from ETD and show updated states.
 */
function initUpdateDependencies() {
    const taskCards = document.querySelectorAll('.task-card');

    taskCards.forEach(card => {
        const etdRow = card.querySelector('.task-etd');
        const rtRow = card.querySelector('.task-rt');
        const rtSide = card.querySelector('[data-rt-from-etd="true"]');

        if (!etdRow) {
            return;
        }

        const etdOld = etdRow.dataset.etdOld;
        const etdNew = etdRow.dataset.etdNew;

        if (etdOld) {
            const oldSpan = etdRow.querySelector('.task-etd-old');
            if (oldSpan) oldSpan.textContent = formatTime(etdOld);
        }
        if (etdNew) {
            const newSpan = etdRow.querySelector('.task-etd-new');
            if (newSpan) newSpan.textContent = formatTime(etdNew);
        }
        if (etdOld && etdNew && formatTime(etdOld) !== formatTime(etdNew)) {
            etdRow.classList.add('updated');
        }

        if (rtRow && (etdOld || etdNew)) {
            if (etdOld) {
                const rtOldSpan = rtRow.querySelector('.task-rt-old');
                if (rtOldSpan) rtOldSpan.textContent = calcRT(etdOld);
            }
            if (etdNew) {
                const rtNewSpan = rtRow.querySelector('.task-rt-new');
                if (rtNewSpan) rtNewSpan.textContent = calcRT(etdNew);
            }
            if (etdOld && etdNew && calcRT(etdOld) !== calcRT(etdNew)) {
                rtRow.classList.add('updated');
            }
        }

        if (rtSide && (etdOld || etdNew)) {
            if (etdOld) {
                const rtOldSpan = rtSide.querySelector('.task-side-old');
                if (rtOldSpan) rtOldSpan.textContent = calcRT(etdOld);
            }
            if (etdNew) {
                const rtNewSpan = rtSide.querySelector('.task-side-new');
                if (rtNewSpan) rtNewSpan.textContent = calcRT(etdNew);
            }
            if (etdOld && etdNew && calcRT(etdOld) !== calcRT(etdNew)) {
                rtSide.classList.add('updated');
            }
        }
    });

    const sideUpdates = document.querySelectorAll('.task-side-group[data-old][data-new]');
    sideUpdates.forEach(group => {
        const oldVal = group.dataset.old;
        const newVal = group.dataset.new;
        const oldSpan = group.querySelector('.task-side-old');
        const newSpan = group.querySelector('.task-side-new');

        if (oldSpan) oldSpan.textContent = oldVal;
        if (newSpan) newSpan.textContent = newVal;
        if (oldVal && newVal && oldVal !== newVal) {
            group.classList.add('updated');
        }
    });
}

function formatTime(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return value;
    return `${digits.padStart(4, '0')}hrs`;
}

function calcRT(value) {
    const minutes = toMinutes(value);
    if (minutes === null) return '';
    const rtMinutes = (minutes - 75 + 24 * 60) % (24 * 60);
    const hours = Math.floor(rtMinutes / 60);
    const mins = rtMinutes % 60;
    return `${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}hrs`;
}

function toMinutes(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return null;
    const padded = digits.padStart(4, '0');
    const hours = Number.parseInt(padded.slice(0, 2), 10);
    const mins = Number.parseInt(padded.slice(2), 10);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
    return hours * 60 + mins;
}

/**
 * Initialize bottom navigation
 */
function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Skip for add button (special handling)
            if (item.classList.contains('nav-add')) {
                handleAddTask();
                return;
            }

            // Update active state
            navItems.forEach(nav => {
                if (!nav.classList.contains('nav-add')) {
                    nav.classList.remove('active');
                }
            });
            item.classList.add('active');

            // Show feedback for navigation
            const navName = item.dataset.nav;
            if (navName !== 'tasks') {
                showToast(`Navigating to ${capitalizeFirst(navName)}...`);
            }
        });
    });
}

/**
 * Handle add task button click
 */
function handleAddTask() {
    showToast('Add new task...');
    // In a real app, this would open a modal or navigate to a form
}

/**
 * Initialize SOS button
 */
function initSOSButton() {
    const sosBtn = document.querySelector('.sos-btn');

    sosBtn.addEventListener('click', () => {
        sosBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            sosBtn.style.transform = '';
        }, 100);

        showToast('SOS Alert Triggered!', 'warning');
    });
}

/**
 * Initialize search bar functionality
 */
function initSearchBar() {
    const searchInput = document.querySelector('.search-input');
    const taskCards = document.querySelectorAll('.task-card');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        taskCards.forEach(card => {
            const title = card.querySelector('.task-title')?.textContent.toLowerCase() || '';
            const subtitle = card.querySelector('.task-subtitle')?.textContent.toLowerCase() || '';
            const flightCode = card.querySelector('.task-flight-code')?.textContent.toLowerCase() || '';
            const flightDest = card.querySelector('.task-flight-dest')?.textContent.toLowerCase() || '';

            if (
                searchTerm === '' ||
                title.includes(searchTerm) ||
                subtitle.includes(searchTerm) ||
                flightCode.includes(searchTerm) ||
                flightDest.includes(searchTerm)
            ) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Reset filter tabs to "All" when searching
        if (searchTerm !== '') {
            const filterTabs = document.querySelectorAll('.filter-tab');
            filterTabs.forEach(t => t.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'warning' ? '#E74C3C' : '#27AE60',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
