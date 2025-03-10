// add-dish-component.js - No Bootstrap version
import React, { useState } from 'react';
import RestaurantAPI from '../../api/restaurant'; // Updated path

const AddDishComponent = ({ onDishAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Form validation
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setValidated(true);
      setError('Please fill out all required fields');
      return;
    }
    
    setValidated(true);
    setLoading(true);
    setError(null);
    
    try {
      // Create a new FormData instance for multipart/form-data (required for file uploads)
      const dishData = new FormData();
      
      // Add all form fields to FormData
      dishData.append('name', formData.name);
      dishData.append('description', formData.description);
      dishData.append('price', formData.price);
      dishData.append('category', formData.category);
      
      // Add the image if it exists
      if (image) {
        dishData.append('image', image);
      }
      
      console.log('Submitting dish data:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: image ? image.name : 'No image'
      });
      
      // Send the request to the API
      const response = await RestaurantAPI.addDish(dishData);
      
      console.log('Dish added successfully:', response);
      
      // Clear form and notify parent component
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
      });
      setImage(null);
      setImagePreview(null);
      setValidated(false);
      
      // Notify parent component that a dish was added
      if (onDishAdded) {
        onDishAdded(response.dish || { id: response.dishId });
      }
    } catch (err) {
      console.error('Error adding dish:', err);
      setError(err.response?.data?.message || 'Failed to add dish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-dish-container">
      <h3>Add New Dish</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Dish Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter dish name"
              className={validated && !formData.name ? 'invalid' : ''}
            />
            {validated && !formData.name && (
              <div className="error-feedback">Please provide a dish name.</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="E.g., Appetizer, Main Course, Dessert"
              className={validated && !formData.category ? 'invalid' : ''}
            />
            {validated && !formData.category && (
              <div className="error-feedback">Please provide a category.</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your dish"
            rows={3}
            className={validated && !formData.description ? 'invalid' : ''}
          />
          {validated && !formData.description && (
            <div className="error-feedback">Please provide a description.</div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter price"
              className={validated && !formData.price ? 'invalid' : ''}
            />
            {validated && !formData.price && (
              <div className="error-feedback">Please provide a valid price.</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="help-text">
              Upload an image of your dish (optional)
            </div>
          </div>
        </div>
        
        {imagePreview && (
          <div className="image-preview">
            <p>Image Preview:</p>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ maxWidth: '200px', maxHeight: '200px' }} 
              className="preview-img"
            />
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Dish'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .add-dish-container {
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .form-group {
          flex: 1;
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 16px;
        }
        
        input.invalid, textarea.invalid {
          border-color: #dc3545;
        }
        
        .error-feedback {
          color: #dc3545;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .help-text {
          color: #6c757d;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .image-preview {
          margin-top: 15px;
          margin-bottom: 20px;
        }
        
        .preview-img {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          border: none;
        }
        
        .btn-primary {
          background-color: #4CAF50;
          color: white;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AddDishComponent;