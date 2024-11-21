import { useState, useEffect } from 'react';
import axios from 'axios';

const SaleTable = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSaleId, setDeleteSaleId] = useState(null);
  

    const [newSale, setNewSale] = useState({
        StoreId: '',
        ProductId: '',
        CustomerId: '',
        saleDate: ''
    });

    const [editSale, setEditSale] = useState({
        id: null,
        CustomerId: '',
        ProductId: '',
        StoreId: '',
        saleDate: ''
    });

    useEffect(() => {

        const fetchSales = async () => {
            try {
                const response = await axios.get('https://onbovishal2.azurewebsites.net/api/sales');
                setSales(response.data);
            } catch (error) {
                console.error("Error fetching sales:", error);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await axios.get('https://onbovishal2.azurewebsites.net/api/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };

       

        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://onbovishal2.azurewebsites.net/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        const fetchStores = async () => {
            try {
                const response = await axios.get('https://onbovishal2.azurewebsites.net/api/stores');
                setStores(response.data);
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

        

        fetchSales();
        fetchCustomers();
        fetchProducts();
        fetchStores();
    }, []);

    const handleOpenAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const openDeleteModal = (id) => {
        setDeleteSaleId(id);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteSaleId(null);
    };

    const handleOpenEditModal = (sale) => {
        setEditSale({
            id: sale.id,
            CustomerId: sale.customerId, // Map fields according to your data structure
            ProductId: sale.productId,
            StoreId: sale.storeId,
            saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : '', // Check if SaleDate exists and is valid
        });
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => setShowEditModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSale(prevSale => ({ ...prevSale, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditSale(prevSale => ({ ...prevSale, [name]: value }));
    };

    
    const handleAddSale = async (e) => {
        e.preventDefault();

        const date = new Date(newSale.saleDate);
        if (isNaN(date.getTime())) {
            alert("Invalid Sale Date. Please select a valid date.");
            return;
        }

        const saleData = {
            StoreId: Number(newSale.Store),
            ProductId: Number(newSale.Product),
            CustomerId: Number(newSale.Customer),
            saleDate: date.toISOString()
        };

        try {
            console.log('Creating sale with data:', saleData);
            const response = await axios.post(
                'https://onbovishal2.azurewebsites.net/api/sales',
                saleData,
                { headers: { 'Content-Type': 'application/json' } }
            );
            setSales([...sales, response.data]);
            setNewSale({ Store: '', Product: '', Customer: '', saleDate: '' });
            handleCloseAddModal();
        } catch (error) {
            console.error("Error adding sale:", error.response ? error.response.data : error.message);
            alert("Error adding sale: " + JSON.stringify(error.response ? error.response.data : error.message));
        }
    };

    const handleEditSale = async (e) => {
        e.preventDefault();

        // Convert SaleDate to a valid ISO format before sending
        const saleData = {
            ...editSale,
            saleDate: new Date(editSale.saleDate).toISOString(),
        };

        try {
            console.log('Edit Sale Data:', editSale);
            await axios.put(`https://onbovishal2.azurewebsites.net/api/sales/${editSale.id}`, saleData,
                { headers: { 'Content-Type': 'application/json' } }
            );
            setSales(sales.map(sale => (sale.id === editSale.id ? { ...sale, ...saleData } : sale)));
            handleCloseEditModal();
        } catch (error) {
            console.error("Error updating sale:", error);
            alert("Error updating sale: " + JSON.stringify(error.response ? error.response.data : error.message));
        }
    };


    //const deleteSale = async (id) => {
    //    const confirmed = window.confirm("Are you sure you want to delete this sale?");
    //    if (!confirmed) return;

    //    try {
    //        await axios.delete(`https://localhost:7129/api/sales/${id}`);
    //        setSales(sales.filter(sale => sale.id !== id));
    //    } catch (error) {
    //        console.error("Error deleting sale:", error.response ? error.response.data : error.message);
    //    }
    //};
    const confirmDeleteSale = async () => {
        try {
            await axios.delete(`https://onbovishal2.azurewebsites.net/api/sales/${deleteSaleId}`);
            setSales(sales.filter(sale => sale.id !== deleteSaleId));
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting sale:", error.response ? error.response.data : error.message);
        }
    };

    


    // Pagination logic
    const totalPages = Math.ceil(sales.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const displayedSales = sales.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid mt-4">
            <h4>Sales List</h4>
            <div className="d-flex justify-content-start mb-3">
            <button className="btn btn-primary mb-3" onClick={handleOpenAddModal}>New Sale</button>
            </div>
            {/* Modal for Adding New Sale */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Sale</h5>
                                <button type="button" className="close" onClick={handleCloseAddModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddSale}>
                                    <div className="form-group">
                                        <label htmlFor="Customer">Customer</label>
                                        <select
                                            className="form-control"
                                            name="Customer"
                                            id="Customer"
                                            value={newSale.Customer}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Product">Product</label>
                                        <select
                                            className="form-control"
                                            name="Product"
                                            id="Product"
                                            value={newSale.Product}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Store">Store</label>
                                        <select
                                            className="form-control"
                                            name="Store"
                                            id="Store"
                                            value={newSale.Store}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Store</option>
                                            {stores.map(store => (
                                                <option key={store.id} value={store.id}>{store.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="SaleDate">Sale Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="saleDate"
                                            id="saleDate"
                                            value={newSale.SaleDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Add Sale</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="close" onClick={closeDeleteModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this sale?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                                <button className="btn btn-danger" onClick={confirmDeleteSale}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Editing Sale */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Sale</h5>
                                <button type="button" className="close" onClick={handleCloseEditModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditSale}>
                                    <div className="form-group">
                                        <label htmlFor="Customer">Customer</label>
                                        <select
                                            className="form-control"
                                            name="Customer"
                                            id="Customer"
                                            value={editSale.CustomerId}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select Customer</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Product">Product</label>
                                        <select
                                            className="form-control"
                                            name="Product"
                                            id="Product"
                                            value={editSale.ProductId}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select Product</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Store">Store</label>
                                        <select
                                            className="form-control"
                                            name="Store"
                                            id="Store"
                                            value={editSale.StoreId}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select Store</option>
                                            {stores.map(store => (
                                                <option key={store.id} value={store.id}>{store.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="SaleDate">SaleDate</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="saleDate"
                                            id="saleDate"
                                            value={editSale.saleDate}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Update Sale</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="table-responsive w-100">
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Sale ID</th>
                        <th>Customer Name</th>
                        <th>Product Name</th>
                        <th>Store Name</th>
                        <th>Sale Date</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedSales.map(sale => (
                        <tr key={sale.id}>
                            <td>{sale.id}</td>

                            <td>
                                {customers.find(c => c.id === sale.customerId)?.name || 'N/A'}
                            </td>
                            <td>
                                {products.find(p => p.id === sale.productId)?.name || 'N/A'}
                            </td>
                            <td>
                                {stores.find(s => s.id === sale.storeId)?.name || 'N/A'}
                            </td>
                            <td>
                                {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>{sale.totalPrice}</td>
                            <td>
                                <button className="btn btn-edit" onClick={() => handleOpenEditModal(sale)}><i className="fas fa-edit"></i>Edit</button></td>
                            <td> <button className="btn btn-danger" onClick={() => openDeleteModal(sale.id)}> <i className="fas fa-trash-alt"></i>Delete</button>
                            </td>
                        </tr>
                    ))}

                </tbody>
                </table>
            </div>
            <nav>
                <ul className="pagination">
                    {[...Array(totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default SaleTable;
