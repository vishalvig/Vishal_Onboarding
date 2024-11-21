import { useState, useEffect } from 'react';
import axios from 'axios';


const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    //const apiEndpoint = process.env.NODE_ENV === 'production'
    //    ? process.env.REACT_APP_API_ENDPOINT : 'http://localhost:7129/api';
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', address: '' });
    const [editCustomer, setEditCustomer] = useState({ id: null, name: '', address: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('https://onbovishal2.azurewebsites.net/api/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };
        fetchCustomers();
    }, []);

    const handleOpenAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const openDeleteModal = (id) => {
        setCustomerToDelete(id);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCustomerToDelete(null);
    };

    const handleOpenEditModal = (customer) => {
        setEditCustomer(customer);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => setShowEditModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditCustomer({ ...editCustomer, [name]: value });
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`https://onbovishal2.azurewebsites.net/api/customers`, newCustomer);
            setCustomers([...customers, response.data]);
            setNewCustomer({ name: '', address: '' });
            handleCloseAddModal();
        } catch (error) {
            console.error("Error adding customer:", error);
        }
    };

    const handleEditCustomer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://onbovishal2.azurewebsites.net/api/customers/${editCustomer.id}`, editCustomer);
            setCustomers(customers.map(customer =>
                customer.id === editCustomer.id ? { ...customer, ...editCustomer } : customer
            ));
            handleCloseEditModal();
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    const confirmDeleteCustomer = async () => {
        setDeleteError('');
        if (customerToDelete === null) return;

        try {
            await axios.delete(`https://onbovishal2.azurewebsites.net/api/customers/${customerToDelete}`);
            setCustomers(customers.filter(customer => customer.id !== customerToDelete));
            closeDeleteModal();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setDeleteError("Error deleting customer: Customer has related sales records and cannot be deleted.");
            } else {
                setDeleteError("An unexpected error occurred while deleting the customer.");
            }
            console.error("Error deleting customer:", error.response ? error.response.data : error.message);
        }
    };

    //const deleteCustomer = async (id) => {
    //    console.log("Deleting customer with ID:", id); // Debug log
    //    try {
    //        await axios.delete(`https://localhost:7129/api/customers/${id}`);
    //        setCustomers(customers.filter(customer => customer.id !== id));
    //    } catch (error) {
    //        console.error("Error deleting customer:", error.response ? error.response.data : error.message);
    //    }
    //};

    // Pagination logic
    const totalPages = Math.ceil(customers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const displayedCustomers = customers.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid mt-4">
            <h4>Customer List</h4>
            <div className="d-flex justify-content-start mb-3">
            <button className="btn btn-primary mb-3" onClick={handleOpenAddModal}>New Customer</button>
           </div>
            {/* Modal for Adding New Customer */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Customer</h5>
                                <button type="button" className="close" onClick={handleCloseAddModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddCustomer}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={newCustomer.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={newCustomer.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">Add Customer</button>
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
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="close" onClick={closeDeleteModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this customer?</p>
                                {deleteError && (
                                    <div className="alert alert-danger">
                                        {deleteError}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={confirmDeleteCustomer}>Delete</button>
                                <button className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal for Editing Customer */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Customer</h5>
                                <button type="button" className="close" onClick={handleCloseEditModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditCustomer}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={editCustomer.name}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={editCustomer.address}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">Update Customer</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Table */}
            
                <table className="table table-bordered w-100">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Actions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedCustomers.map((customer) => (
                        <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td>{customer.address}</td>
                            <td>
                                <button className="btn btn-edit" onClick={() => handleOpenEditModal(customer)}><i className="fas fa-edit"></i>Edit</button></td>
                            <td>  <button className="btn btn-danger" onClick={() => openDeleteModal(customer.id)}><i className="fas fa-trash-alt"></i>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <select
                    className="form-select"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>

                <nav>
                    <ul className="pagination">
                        {[...Array(totalPages).keys()].map(page => (
                            <li
                                key={page + 1}
                                className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default CustomerTable;
