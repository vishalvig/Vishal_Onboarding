import { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: 0 });
    const [editingProduct, setEditingProduct] = useState({ id: null, name: '', price: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [productToDelete, setProductToDelete] = useState(null);

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('https://onbovishal2.azurewebsites.net/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingProduct({ ...editingProduct, [name]: value });
        } else {
            setNewProduct({ ...newProduct, [name]: value });
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setIsEditing(false);
        setNewProduct({ name: '', price: 0 });
    };

    const startEditing = (product) => {
        setEditingProduct(product);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`https://onbovishal2.azurewebsites.net/api/products/${editingProduct.id}`, editingProduct);
                setProducts(products.map(product =>
                    product.id === editingProduct.id ? { ...product, ...editingProduct } : product
                ));
            } else {
                const response = await axios.post('https://onbovishal2.azurewebsites.net/api/products', newProduct);
                setProducts([...products, response.data]);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const confirmDeleteProduct = (productId) => {
        setProductToDelete(productId);
        setShowDeleteModal(true);
        setDeleteError(''); // Clear any previous errors
    };

    const handleDeleteProduct = async () => {
        try {
            await axios.delete(`https://onbovishal2.azurewebsites.net/api/products/${productToDelete}`);
            setProducts(products.filter(product => product.id !== productToDelete));
            setShowDeleteModal(false);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                setDeleteError("Error deleting product: Product has related sales records and cannot be deleted.");
            } else {
                console.error("Error deleting product:", error);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h4>Product List</h4>
            <div className="d-flex justify-content-start mb-3">
            <button className="btn btn-primary mb-3" onClick={handleOpenModal}>New Product</button>
            </div>
            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? "Edit Product" : "New Product"}</h5>
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
                                            value={isEditing ? editingProduct.name : newProduct.name}
                                            onChange={handleChange}
                                            placeholder="Product Name"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={isEditing ? editingProduct.price : newProduct.price}
                                            onChange={handleChange}
                                            placeholder="Product Price"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">
                                        {isEditing ? "Update Product" : "Add Product"}
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
                                <p>Are you sure you want to delete this product?</p>
                                {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={handleDeleteProduct}>Delete</button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product List Table */}
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Actions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>
                                <button className="btn btn-edit" onClick={() => startEditing(product)}> <i className="fas fa-edit"></i>Edit</button></td>
                            <td><button className="btn btn-danger" onClick={() => confirmDeleteProduct(product.id)}> <i className="fas fa-trash-alt"></i>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Product;
