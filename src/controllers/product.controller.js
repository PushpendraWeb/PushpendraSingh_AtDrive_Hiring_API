const Product = require('../model/product.model');

const createProduct = async (req, res) => {
  try {
    const { name, price, description, status = true } = req.body;
    const createdBy = req.user && req.user.user_id ? req.user.user_id : null;

    const product = new Product({
      name,
      price,
      description,
      status,
      createdBy,
    });

    const savedProduct = await product.save();
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, price, description, status } = req.body;
    const updatedBy = req.user && req.user.user_id ? req.user.user_id : null;

    const updateData = {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(updatedBy !== null && { updatedBy }),
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { product_id: Number(id), DeletedAt: null },
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; 
    const DeletedBy = req.user && req.user.user_id ? req.user.user_id : null;

    const deletedProduct = await Product.findOneAndUpdate(
      { product_id: Number(id), DeletedAt: null },
      {
        status: false,
        DeletedBy,
        DeletedAt: new Date(),
      },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params; 

    const product = await Product.findOne({ product_id: Number(id), DeletedAt: null });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ DeletedAt: null });

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
};


