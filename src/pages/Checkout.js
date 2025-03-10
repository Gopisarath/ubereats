import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  // Redirect if cart is empty
  if (cart.items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryFee = 2.99;
  const tax = subtotal * 0.0875; // 8.75% tax rate
  const total = subtotal + deliveryFee + tax;

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('Zip code is required'),
    phone: Yup.string().required('Phone number is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
    cardNumber: Yup.string().when('paymentMethod', {
      is: 'credit',
      then: Yup.string().required('Card number is required').length(16, 'Card number must be 16 digits'),
    }),
    cardName: Yup.string().when('paymentMethod', {
      is: 'credit',
      then: Yup.string().required('Name on card is required'),
    }),
    expiryDate: Yup.string().when('paymentMethod', {
      is: 'credit',
      then: Yup.string().required('Expiry date is required'),
    }),
    cvv: Yup.string().when('paymentMethod', {
      is: 'credit',
      then: Yup.string().required('CVV is required').length(3, 'CVV must be 3 digits'),
    }),
  });

  // Initial form values
  const initialValues = {
    name: currentUser?.name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Simulate API call to place order
      setTimeout(() => {
        console.log('Order placed:', { 
          ...values, 
          items: cart.items,
          restaurantId: cart.restaurantId,
          subtotal,
          deliveryFee,
          tax,
          total
        });
        
        // Generate a mock order ID
        const mockOrderId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setOrderId(mockOrderId);
        setOrderPlaced(true);
        clearCart();
        setSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h1 className="mb-3">Order Placed Successfully!</h1>
          <p className="lead">Your order has been received and is being processed.</p>
          <p className="mb-4">Order ID: <strong>{orderId}</strong></p>
          <p>You will receive an email confirmation shortly.</p>
          <div className="mt-4">
            <button className="btn btn-primary me-2" onClick={() => navigate('/orders')}>
              View Orders
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/restaurants')}>
              Order More Food
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Checkout</h1>
      
      <div className="row">
        <div className="col-lg-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, errors, touched }) => (
              <Form>
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Delivery Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-12">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <Field name="name" type="text" className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-12">
                        <label htmlFor="address" className="form-label">Address</label>
                        <Field name="address" type="text" className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="address" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label">City</label>
                        <Field name="city" type="text" className={`form-control ${errors.city && touched.city ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="city" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="state" className="form-label">State</label>
                        <Field name="state" type="text" className={`form-control ${errors.state && touched.state ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="state" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="zipCode" className="form-label">Zip Code</label>
                        <Field name="zipCode" type="text" className={`form-control ${errors.zipCode && touched.zipCode ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="zipCode" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <Field name="phone" type="text" className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`} />
                        <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-12">
                        <label htmlFor="notes" className="form-label">Delivery Instructions (Optional)</label>
                        <Field name="notes" as="textarea" className="form-control" rows="3" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Payment Method</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <div className="form-check mb-2">
                        <Field
                          type="radio"
                          name="paymentMethod"
                          id="credit"
                          value="credit"
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="credit">
                          Credit / Debit Card
                        </label>
                      </div>
                      <div className="form-check">
                        <Field
                          type="radio"
                          name="paymentMethod"
                          id="cash"
                          value="cash"
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="cash">
                          Cash on Delivery
                        </label>
                      </div>
                    </div>
                    
                    {values.paymentMethod === 'credit' && (
                      <div className="credit-card-form">
                        <div className="row mb-3">
                          <div className="col-12">
                            <label htmlFor="cardNumber" className="form-label">Card Number</label>
                            <Field
                              name="cardNumber"
                              type="text"
                              className={`form-control ${errors.cardNumber && touched.cardNumber ? 'is-invalid' : ''}`}
                              placeholder="1234 5678 9012 3456"
                            />
                            <ErrorMessage name="cardNumber" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-12">
                            <label htmlFor="cardName" className="form-label">Name on Card</label>
                            <Field
                              name="cardName"
                              type="text"
                              className={`form-control ${errors.cardName && touched.cardName ? 'is-invalid' : ''}`}
                            />
                            <ErrorMessage name="cardName" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                            <Field
                              name="expiryDate"
                              type="text"
                              className={`form-control ${errors.expiryDate && touched.expiryDate ? 'is-invalid' : ''}`}
                              placeholder="MM/YY"
                            />
                            <ErrorMessage name="expiryDate" component="div" className="invalid-feedback" />
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="cvv" className="form-label">CVV</label>
                            <Field
                              name="cvv"
                              type="text"
                              className={`form-control ${errors.cvv && touched.cvv ? 'is-invalid' : ''}`}
                              placeholder="123"
                            />
                            <ErrorMessage name="cvv" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing Order...
                      </>
                    ) : (
                      `Place Order - $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {cart.items.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="me-2">{item.quantity}x</span>
                      {item.name}
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-0">
                <span className="fw-bold">Total</span>
                <span className="fw-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6>Estimated Delivery Time</h6>
              <p className="mb-0">25-40 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;