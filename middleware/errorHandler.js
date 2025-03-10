const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum file size is 5MB.'
      });
    }
    
    // Handle other specific errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: err.message
      });
    }
    
    // Default error response
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong. Please try again.' 
        : err.message
    });
  };
  
  module.exports = errorHandler;