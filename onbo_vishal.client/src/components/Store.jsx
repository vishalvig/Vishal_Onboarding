import { useState, useEffect } from 'react';
import axios from 'axios';

const Store = () => {
    const [stores, setStores] = useState([]);
    const [newStore, setNewStore] = useState({ name: '', address: '' });
    const [editingStore, setEditingStore] = useState({ id: null, name: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [storeToDelete, setStoreToDelete] = useState(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await axios.get('https://onbovishal2.azurewebsites.net/api/stores');
            setStores(response.data);
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingStore({ ...editingStore, [name]: value });
        } else {
            setNewStore({ ...newStore, [name]: value });
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setIsEditing(false);
        setNewStore({ name: '', address: '' });
    };

    const startEditing = (store) => {
        setEditingStore(store);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`https://onbovishal2.azurewebsites.net/api/stores/${editingStore.id}`, editingStore);
                setStores(stores.map(store =>
                    store.id === editingStore.id ? { ...store, ...editingStore } : store
                ));
            } else {
                const response = await axios.post('https://onbovishal2.azurewebsites.net/api/stores', newStore);
                setStores([...stores, response.data]);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving store:", error);
        }
    };

    const confirmDeleteStore = (storeId) => {
        setStoreToDelete(storeId);
        setShowDeleteModal(true);
        setDeleteError(''); // Clear any previous errors
    };

    const handleDeleteStore = async () => {
        try {
            await axios.delete(`https://onbovishal2.azurewebsites.net/api/stores/${storeToDelete}`);
            setStores(stores.filter(store => store.id !== storeToDelete));
            setShowDeleteModal(false);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                setDeleteError("Error deleting store: Store has related sales records and cannot be deleted.");
            } else {
                console.error("Error deleting store:", error);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h4>Store List</h4>
            <div className="d-flex justify-content-start mb-3">
            <button className="btn btn-primary" onClick={handleOpenModal}>New Store</button>
            </div>
            {/* Add/Edit Store Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? "Edit Store" : "New Store"}</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={isEditing ? editingStore.name : newStore.name}
                                            onChange={handleChange}
                                            placeholder="Store Name"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={isEditing ? editingStore.address : newStore.address}
                                            onChange={handleChange}
                                            placeholder="Store Address"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">
                                        {isEditing ? "Update Store" : "Add Store"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="close" onClick={() => setShowDeleteModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this store?</p>
                                {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={handleDeleteStore}>Delete</button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Store List Table */}
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Actions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stores.map((store) => (
                        <tr key={store.id}>
                            <td>{store.name}</td>
                            <td>{store.address}</td>
                            <td>
                                <button className="btn btn-edit" onClick={() => startEditing(store)}> <i className="fas fa-edit"></i>Edit</button></td>
                            <td> <button className="btn btn-danger" onClick={() => confirmDeleteStore(store.id)}><i className="fas fa-trash-alt"></i>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Store;
