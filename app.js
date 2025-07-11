document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutDropdownBtn = document.getElementById('logoutDropdownBtn');
    const sidebar = document.querySelector('.sidebar'); // Get the sidebar element
    const sidebarNavLinks = document.querySelectorAll('.sidebar-nav a');
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productCategoryInput = document.getElementById('productCategory');
    const productStockInput = document.getElementById('productStock');
    const productPriceInput = document.getElementById('productPrice');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const customerModal = document.getElementById('customerModal');
    const customerForm = document.getElementById('customerForm');
    const customerIdInput = document.getElementById('customerId');
    const customerNameInput = document.getElementById('customerName');
    const customerEmailInput = document.getElementById('customerEmail');
    const customerPhoneInput = document.getElementById('customerPhone');
    const customersTableBody = document.getElementById('customersTableBody');
    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const supplierModal = document.getElementById('supplierModal');
    const supplierForm = document.getElementById('supplierForm');
    const supplierIdInput = document.getElementById('supplierId');
    const supplierNameInput = document.getElementById('supplierName');
    const supplierContactPersonInput = document.getElementById('supplierContactPerson');
    const supplierPhoneInput = document.getElementById('supplierPhone');
    const suppliersTableBody = document.getElementById('suppliersTableBody');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const profileSettingsForm = document.getElementById('profileSettingsForm');
    const closeButtons = document.querySelectorAll('.modal .close-button');

    // New mobile-friendly elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');


    // In-memory data storage (persisted to localStorage)
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 'PRO001', name: 'Chicken Feed (25kg)', category: 'Poultry', stock: 150, price: 2500 },
        { id: 'PRO002', name: 'Maize Seeds (1kg)', category: 'Seeds', stock: 200, price: 350 },
        { id: 'PRO003', name: 'Urea Fertilizer (50kg)', category: 'Fertilizer', stock: 80, price: 4200 },
        { id: 'PRO004', name: 'Dewormer (1L)', category: 'Veterinary', stock: 50, price: 1200 }
    ];

    let orders = JSON.parse(localStorage.getItem('orders')) || [
        { id: 'ORD001', customer: 'Alice Johnson', date: '2025-07-10', total: 5000, status: 'Pending' },
        { id: 'ORD002', customer: 'Bob Williams', date: '2025-07-09', total: 7500, status: 'Completed' },
        { id: 'ORD003', customer: 'Charlie Davis', date: '2025-07-10', total: 2800, status: 'Pending' }
    ];

    let customers = JSON.parse(localStorage.getItem('customers')) || [
        { id: 'CUST001', name: 'Alice Johnson', email: 'alice@example.com', phone: '0712345678' },
        { id: 'CUST002', name: 'Bob Williams', email: 'bob@example.com', phone: '0723456789' }
    ];

    let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [
        { id: 'SUP001', name: 'Agro Supplies Ltd', contactPerson: 'Jane Doe', phone: '0734567890' },
        { id: 'SUP002', name: 'Vet Med Distributors', contactPerson: 'Peter Green', phone: '0745678901' }
    ];

    // Chart.js instance
    let salesChart;

    /**
     * @function persistData
     * @description Saves current data to localStorage.
     */
    const persistData = () => {
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    };

    /**
     * @function generateId
     * @description Generates a unique ID for new items.
     * @param {string} prefix - The prefix for the ID (e.g., 'PRO', 'ORD').
     * @returns {string} The generated unique ID.
     */
    const generateId = (prefix) => {
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    };

    /**
     * @function showPage
     * @description Displays the specified page and hides others.
     * @param {HTMLElement} pageToShow - The page element to display.
     */
    const showPage = (pageToShow) => {
        if (pageToShow === loginPage) {
            loginPage.style.display = 'flex';
            dashboardPage.style.display = 'none';
        } else {
            loginPage.style.display = 'none';
            // Dashboard container uses flex for mobile sidebar and grid for desktop
            dashboardPage.style.display = 'flex'; // Default to flex for column on mobile
            // Re-apply desktop grid if window is wide enough (handled by CSS media query)
            if (window.innerWidth >= 768) {
                 dashboardPage.style.display = 'grid'; // For initial load on desktop
            }
            // Ensure sidebar is hidden on mobile when dashboard first loads
            sidebar.classList.remove('active');
            menuToggle.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    };

    /**
     * @function toggleSidebar
     * @description Toggles the visibility of the sidebar for mobile.
     */
    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        menuToggle.classList.toggle('active'); // Animate hamburger icon
        sidebarOverlay.classList.toggle('active'); // Show/hide overlay
    };

    /**
     * @function showSection
     * @description Displays a specific dashboard section and hides others.
     * @param {string} sectionId - The ID of the section to show.
     */
    const showSection = (sectionId) => {
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        // Update active link in sidebar
        sidebarNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Specific actions for sections
        if (sectionId === 'inventory') {
            renderInventory();
        } else if (sectionId === 'orders') {
            renderOrders();
            updateOrderSummary();
        } else if (sectionId === 'customers') {
            renderCustomers();
        } else if (sectionId === 'suppliers') {
            renderSuppliers();
        } else if (sectionId === 'dashboard') {
            updateDashboardSummary();
        } else if (sectionId === 'reports') {
            renderReports();
            updateReportSummary();
        }

        // Close sidebar after clicking a link on mobile
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    /**
     * @function toggleModal
     * @description Toggles the visibility of a modal.
     * @param {HTMLElement} modalElement - The modal element to toggle.
     * @param {boolean} show - True to show, false to hide.
     */
    const toggleModal = (modalElement, show) => {
        if (show) {
            modalElement.classList.add('active');
        } else {
            modalElement.classList.remove('active');
        }
    };

    // --- Authentication ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Stub authentication: any non-empty username/password will "log in"
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            localStorage.setItem('loggedIn', 'true');
            showPage(dashboardPage);
            showSection('dashboard');
        } else {
            alert('Please enter username and password.');
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedIn');
        showPage(loginPage);
    });

    logoutDropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedIn');
        showPage(loginPage);
    });

    // Check login status on page load
    if (localStorage.getItem('loggedIn') === 'true') {
        showPage(dashboardPage);
        showSection('dashboard');
    } else {
        showPage(loginPage);
    }

    // --- Mobile Sidebar Toggle ---
    menuToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar); // Close sidebar when clicking on overlay


    // --- Sidebar Navigation ---
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.currentTarget.dataset.section;
            showSection(sectionId);
        });
    });

    // --- User Profile Dropdown ---
    userAvatar.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target) && userDropdown.classList.contains('active')) {
            userDropdown.classList.remove('active');
        }
    });

    // --- Modals General Logic ---
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            toggleModal(e.target.closest('.modal'), false);
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            toggleModal(e.target, false);
        }
    });

    // --- Inventory Management ---
    /**
     * @function renderInventory
     * @description Renders the list of products in the inventory table.
     */
    const renderInventory = () => {
        inventoryTableBody.innerHTML = '';
        products.forEach(product => {
            const row = inventoryTableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>Ksh ${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-id="${product.id}" data-action="edit">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${product.id}" data-action="delete">Delete</button>
                </td>
            `;
        });
        addInventoryEventListeners();
    };

    /**
     * @function addInventoryEventListeners
     * @description Adds event listeners for edit and delete buttons in the inventory table.
     */
    const addInventoryEventListeners = () => {
        inventoryTableBody.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;

                if (action === 'edit') {
                    const productToEdit = products.find(p => p.id === id);
                    if (productToEdit) {
                        productIdInput.value = productToEdit.id;
                        productNameInput.value = productToEdit.name;
                        productCategoryInput.value = productToEdit.category;
                        productStockInput.value = productToEdit.stock;
                        productPriceInput.value = productToEdit.price;
                        toggleModal(productModal, true);
                    }
                } else if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this product?')) {
                        products = products.filter(p => p.id !== id);
                        persistData();
                        renderInventory();
                    }
                }
            });
        });
    };

    addProductBtn.addEventListener('click', () => {
        // Reset form for new product
        productForm.reset();
        productIdInput.value = ''; // Clear ID for new product
        toggleModal(productModal, true);
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Client-side validation
        if (!productNameInput.value || !productCategoryInput.value || productStockInput.value === '' || productPriceInput.value === '') {
            alert('Please fill in all product fields.');
            return;
        }
        if (isNaN(productStockInput.value) || parseInt(productStockInput.value) < 0) {
            alert('Stock must be a non-negative number.');
            return;
        }
        if (isNaN(productPriceInput.value) || parseFloat(productPriceInput.value) < 0) {
            alert('Price must be a non-negative number.');
            return;
        }

        const id = productIdInput.value;
        const newProduct = {
            id: id || generateId('PRO'),
            name: productNameInput.value,
            category: productCategoryInput.value,
            stock: parseInt(productStockInput.value),
            price: parseFloat(productPriceInput.value)
        };

        if (id) {
            // Edit existing product
            products = products.map(p => p.id === id ? newProduct : p);
        } else {
            // Add new product
            products.push(newProduct);
        }

        persistData();
        renderInventory();
        toggleModal(productModal, false);
    });

    // --- Orders & Sales ---
    /**
     * @function renderOrders
     * @description Renders the list of orders in the orders table.
     */
    const renderOrders = () => {
        ordersTableBody.innerHTML = '';
        orders.forEach(order => {
            const row = ordersTableBody.insertRow();
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>Ksh ${order.total.toFixed(2)}</td>
                <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-id="${order.id}" data-action="view">View Details</button>
                    ${order.status !== 'Completed' ? `<button class="btn btn-primary btn-sm" data-id="${order.id}" data-action="complete">Mark Complete</button>` : ''}
                </td>
            `;
        });
        addOrderEventListeners();
    };

    /**
     * @function addOrderEventListeners
     * @description Adds event listeners for order actions.
     */
    const addOrderEventListeners = () => {
        ordersTableBody.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;

                if (action === 'view') {
                    alert(`Viewing details for Order ID: ${id}`);
                    // In a real app, this would open a detailed modal
                } else if (action === 'complete') {
                    orders = orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o);
                    persistData();
                    renderOrders();
                    updateOrderSummary();
                }
            });
        });
    };

    /**
     * @function updateOrderSummary
     * @description Updates the summary cards on the Orders section.
     */
    const updateOrderSummary = () => {
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'Completed').length;
        const pendingOrders = totalOrders - completedOrders;

        document.getElementById('ordersTotalCount').textContent = totalOrders;
        document.getElementById('ordersCompletedCount').textContent = completedOrders;
        document.getElementById('ordersPendingCount').textContent = pendingOrders;
    };


    // --- Customer CRUD ---
    /**
     * @function renderCustomers
     * @description Renders the list of customers in the customers table.
     */
    const renderCustomers = () => {
        customersTableBody.innerHTML = '';
        customers.forEach(customer => {
            const row = customersTableBody.insertRow();
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-id="${customer.id}" data-action="edit">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${customer.id}" data-action="delete">Delete</button>
                </td>
            `;
        });
        addCustomerEventListeners();
    };

    /**
     * @function addCustomerEventListeners
     * @description Adds event listeners for customer actions.
     */
    const addCustomerEventListeners = () => {
        customersTableBody.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;

                if (action === 'edit') {
                    const customerToEdit = customers.find(c => c.id === id);
                    if (customerToEdit) {
                        customerIdInput.value = customerToEdit.id;
                        customerNameInput.value = customerToEdit.name;
                        customerEmailInput.value = customerToEdit.email;
                        customerPhoneInput.value = customerToEdit.phone;
                        toggleModal(customerModal, true);
                    }
                } else if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this customer?')) {
                        customers = customers.filter(c => c.id !== id);
                        persistData();
                        renderCustomers();
                    }
                }
            });
        });
    };

    addCustomerBtn.addEventListener('click', () => {
        customerForm.reset();
        customerIdInput.value = '';
        toggleModal(customerModal, true);
    });

    customerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!customerNameInput.value) {
            alert('Customer name is required.');
            return;
        }

        const id = customerIdInput.value;
        const newCustomer = {
            id: id || generateId('CUST'),
            name: customerNameInput.value,
            email: customerEmailInput.value,
            phone: customerPhoneInput.value
        };

        if (id) {
            customers = customers.map(c => c.id === id ? newCustomer : c);
        } else {
            customers.push(newCustomer);
        }

        persistData();
        renderCustomers();
        toggleModal(customerModal, false);
    });

    // --- Supplier CRUD ---
    /**
     * @function renderSuppliers
     * @description Renders the list of suppliers in the suppliers table.
     */
    const renderSuppliers = () => {
        suppliersTableBody.innerHTML = '';
        suppliers.forEach(supplier => {
            const row = suppliersTableBody.insertRow();
            row.innerHTML = `
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.contactPerson || 'N/A'}</td>
                <td>${supplier.phone || 'N/A'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" data-id="${supplier.id}" data-action="edit">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${supplier.id}" data-action="delete">Delete</button>
                </td>
            `;
        });
        addSupplierEventListeners();
    };

    /**
     * @function addSupplierEventListeners
     * @description Adds event listeners for supplier actions.
     */
    const addSupplierEventListeners = () => {
        suppliersTableBody.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;

                if (action === 'edit') {
                    const supplierToEdit = suppliers.find(s => s.id === id);
                    if (supplierToEdit) {
                        supplierIdInput.value = supplierToEdit.id;
                        supplierNameInput.value = supplierToEdit.name;
                        supplierContactPersonInput.value = supplierToEdit.contactPerson;
                        supplierPhoneInput.value = supplierToEdit.phone;
                        toggleModal(supplierModal, true);
                    }
                } else if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this supplier?')) {
                        suppliers = suppliers.filter(s => s.id !== id);
                        persistData();
                        renderSuppliers();
                    }
                }
            });
        });
    };

    addSupplierBtn.addEventListener('click', () => {
        supplierForm.reset();
        supplierIdInput.value = '';
        toggleModal(supplierModal, true);
    });

    supplierForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!supplierNameInput.value) {
            alert('Supplier name is required.');
            return;
        }

        const id = supplierIdInput.value;
        const newSupplier = {
            id: id || generateId('SUP'),
            name: supplierNameInput.value,
            contactPerson: supplierContactPersonInput.value,
            phone: supplierPhoneInput.value
        };

        if (id) {
            suppliers = suppliers.map(s => s.id === id ? newSupplier : s);
        } else {
            suppliers.push(newSupplier);
        }

        persistData();
        renderSuppliers();
        toggleModal(supplierModal, false);
    });

    // --- Dashboard Summary ---
    /**
     * @function updateDashboardSummary
     * @description Updates the summary cards on the Dashboard section.
     */
    const updateDashboardSummary = () => {
        const today = new Date().toISOString().slice(0, 10);
        const ordersToday = orders.filter(order => order.date === today).length;
        const pendingOrdersCount = orders.filter(order => order.status === 'Pending').length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        document.getElementById('totalOrdersToday').textContent = ordersToday;
        document.getElementById('pendingOrders').textContent = pendingOrdersCount;
        document.getElementById('totalRevenue').textContent = `Ksh ${totalRevenue.toFixed(2)}`;
    };

    // --- Reports Section ---
    /**
     * @function renderReports
     * @description Renders the sales chart.
     */
    const renderReports = () => {
        const ctx = document.getElementById('salesChart').getContext('2d');

        // Sample data for chart (you can generate dynamic data based on orders)
        const salesData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Monthly Sales (Ksh)',
                data: [12000, 19000, 30000, 15000, 22000, 30000, 25000], // Example data
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true
            }]
        };

        if (salesChart) {
            salesChart.destroy(); // Destroy existing chart before creating a new one
        }

        salesChart = new Chart(ctx, {
            type: 'line',
            data: salesData,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow canvas to resize freely
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    /**
     * @function updateReportSummary
     * @description Updates the summary cards on the Reports section.
     */
    const updateReportSummary = () => {
        const currentMonth = new Date().getMonth(); // 0-indexed
        const currentYear = new Date().getFullYear();

        const salesThisMonth = orders.reduce((sum, order) => {
            const orderDate = new Date(order.date);
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                return sum + order.total;
            }
            return sum;
        }, 0);

        // Simple best-selling product logic (based on total quantity sold)
        // In a real application, this would involve processing order line items.
        // For this example, let's assume "Chicken Feed" is frequently ordered.
        const productOrderCounts = {};
        products.forEach(p => productOrderCounts[p.name] = 0); // Initialize counts

        orders.forEach(order => {
            // This is a placeholder. In a real app, orders would have `items` array.
            // For now, we'll just increment a generic "best seller" placeholder.
            productOrderCounts['Chicken Feed (25kg)'] += 1; // Arbitrarily increment for example
        });

        let bestSellingProduct = 'N/A';
        let maxOrders = 0;
        for (const productName in productOrderCounts) {
            if (productOrderCounts[productName] > maxOrders) {
                maxOrders = productOrderCounts[productName];
                bestSellingProduct = productName;
            }
        }


        const lowStockProducts = products.filter(p => p.stock < 20).length; // Threshold for low stock

        document.getElementById('totalSalesMonth').textContent = `Ksh ${salesThisMonth.toFixed(2)}`;
        document.getElementById('bestSellingProduct').textContent = bestSellingProduct;
        document.getElementById('lowStockAlerts').textContent = lowStockProducts;
    };

    // --- Settings ---
    /**
     * @function applyDarkModePreference
     * @description Applies the dark mode preference saved in localStorage.
     */
    const applyDarkModePreference = () => {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
    };

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    profileSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Profile settings saved! (This is a stub; no actual save operation performed)');
        // In a real app, you'd send this data to a backend
    });

    // Initial setup calls
    applyDarkModePreference();
    updateDashboardSummary();

    // Event listener for window resize to adjust dashboard container display
    window.addEventListener('resize', () => {
        if (localStorage.getItem('loggedIn') === 'true') {
            if (window.innerWidth >= 768) {
                dashboardPage.style.display = 'grid';
            } else {
                dashboardPage.style.display = 'flex';
            }
        }
    });
});
