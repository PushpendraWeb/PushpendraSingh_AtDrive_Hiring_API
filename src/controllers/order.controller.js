const Order = require('../model/order.model');
const Product = require('../model/product.model');
const { getUserById, getAllUsers } = require('../model/user.model');


const calculateTotals = async (products) => {
  const productIds = products.map((p) => Number(p.product_id));

  const dbProducts = await Product.find({
    product_id: { $in: productIds },
    DeletedAt: null,
  });

  const priceMap = new Map();
  dbProducts.forEach((p) => {
    priceMap.set(p.product_id, p.price);
  });

  let total = 0;
  const details = [];

  for (const item of products) {
    const pid = Number(item.product_id);
    const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const price = priceMap.get(pid);

    if (price === undefined) {
      throw new Error(`Product with product_id ${pid} not found or inactive`);
    }

    const lineTotal = price * quantity;
    total += lineTotal;

    details.push({
      product_id: pid,
      quantity,
      price,
      lineTotal,
    });
  }

  return { totalAmount: total, details };
};

const createOrder = async (req, res) => {
  try {
    const { products, status = true } = req.body;
    const authUserId = req.user && req.user.user_id ? req.user.user_id : null;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required',
      });
    }

    for (const item of products) {
      if (
        !item ||
        item.product_id === undefined ||
        item.product_id === null ||
        item.quantity === undefined ||
        item.quantity === null ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Each product must include product_id and quantity > 0',
        });
      }
    }

    const { totalAmount, details } = await calculateTotals(products);

    const order = new Order({
      user_id: authUserId,
      products,
      totalAmount,
      status,
      createdBy: authUserId,
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: savedOrder,
        summary: {
          totalAmount,
          products: details,
        },
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params; // order_id (number)
    const { products, status } = req.body;
    const authUserId = req.user && req.user.user_id ? req.user.user_id : null;

    const existingOrder = await Order.findOne({ order_id: Number(id), DeletedAt: null });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const productsToUse =
      Array.isArray(products) && products.length > 0 ? products : existingOrder.products;

    for (const item of productsToUse) {
      if (
        !item ||
        item.product_id === undefined ||
        item.product_id === null ||
        item.quantity === undefined ||
        item.quantity === null ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Each product must include product_id and quantity > 0',
        });
      }
    }

    const { totalAmount, details } = await calculateTotals(productsToUse);

    const updateData = {
      products: productsToUse,
      totalAmount,
      ...(status !== undefined && { status }),
      ...(authUserId !== null && { updatedBy: authUserId }),
    };

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: Number(id), DeletedAt: null },
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order: updatedOrder,
        summary: {
          totalAmount,
          products: details,
        },
      },
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params; 
    const authUserId = req.user && req.user.user_id ? req.user.user_id : null;

    const deletedOrder = await Order.findOneAndUpdate(
      { order_id: Number(id), DeletedAt: null },
      {
        status: false,
        DeletedBy: authUserId,
        DeletedAt: new Date(),
      },
      { new: true }
    );

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: deletedOrder,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // order_id (number)

    const order = await Order.findOne({ order_id: Number(id), DeletedAt: null });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const orderObj = order.toObject();

    const productIds = new Set();
    const userIds = new Set();

    if (orderObj.user_id) userIds.add(orderObj.user_id);
    if (orderObj.createdBy) userIds.add(orderObj.createdBy);
    if (orderObj.updatedBy) userIds.add(orderObj.updatedBy);
    if (orderObj.DeletedBy) userIds.add(orderObj.DeletedBy);

    if (orderObj.products && Array.isArray(orderObj.products)) {
      orderObj.products.forEach((item) => {
        if (item.product_id) productIds.add(item.product_id);
      });
    }

    const products = await Product.find({
      product_id: { $in: Array.from(productIds) },
      DeletedAt: null,
    });
    const productMap = new Map();
    products.forEach((p) => {
      productMap.set(p.product_id, {
        product_id: p.product_id,
        name: p.name,
        price: p.price,
        description: p.description,
        status: p.status,
      });
    });

    const allUsers = await getAllUsers();
    const userMap = new Map();
    allUsers.forEach((u) => {
      userMap.set(u.user_id, {
        user_id: u.user_id,
        name: u.name,
        username: u.username,
        status: u.status,
      });
    });

    if (orderObj.user_id && userMap.has(orderObj.user_id)) {
      orderObj.user = userMap.get(orderObj.user_id);
    }

    if (orderObj.products && Array.isArray(orderObj.products)) {
      orderObj.products = orderObj.products.map((item) => {
        const productDetail = productMap.get(item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          product: productDetail || null,
          lineTotal: productDetail ? productDetail.price * item.quantity : null,
        };
      });
    }

    if (orderObj.createdBy && userMap.has(orderObj.createdBy)) {
      orderObj.createdByUser = userMap.get(orderObj.createdBy);
    }

    if (orderObj.updatedBy && userMap.has(orderObj.updatedBy)) {
      orderObj.updatedByUser = userMap.get(orderObj.updatedBy);
    }

    if (orderObj.DeletedBy && userMap.has(orderObj.DeletedBy)) {
      orderObj.DeletedByUser = userMap.get(orderObj.DeletedBy);
    }

    return res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: orderObj,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ DeletedAt: null });

    const productIds = new Set();
    const userIds = new Set();

    orders.forEach((order) => {
      if (order.user_id) userIds.add(order.user_id);
      if (order.createdBy) userIds.add(order.createdBy);
      if (order.updatedBy) userIds.add(order.updatedBy);
      if (order.DeletedBy) userIds.add(order.DeletedBy);

      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((item) => {
          if (item.product_id) productIds.add(item.product_id);
        });
      }
    });

    const products = await Product.find({
      product_id: { $in: Array.from(productIds) },
      DeletedAt: null,
    });

    const productMap = new Map();
    products.forEach((p) => {
      productMap.set(p.product_id, {
        product_id: p.product_id,
        name: p.name,
        price: p.price,
        description: p.description,
        status: p.status,
      });
    });

    const allUsers = await getAllUsers();
    const userMap = new Map();
    allUsers.forEach((u) => {
      userMap.set(u.user_id, {
        user_id: u.user_id,
        name: u.name,
        username: u.username,
        status: u.status,
      });
    });

    const populatedOrders = orders.map((order) => {
      const orderObj = order.toObject();

      if (orderObj.user_id && userMap.has(orderObj.user_id)) {
        orderObj.user = userMap.get(orderObj.user_id);
      }

      if (orderObj.products && Array.isArray(orderObj.products)) {
        orderObj.products = orderObj.products.map((item) => {
          const productDetail = productMap.get(item.product_id);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product: productDetail || null,
            lineTotal: productDetail ? productDetail.price * item.quantity : null,
          };
        });
      }

      if (orderObj.createdBy && userMap.has(orderObj.createdBy)) {
        orderObj.createdByUser = userMap.get(orderObj.createdBy);
      }

      if (orderObj.updatedBy && userMap.has(orderObj.updatedBy)) {
        orderObj.updatedByUser = userMap.get(orderObj.updatedBy);
      }

      if (orderObj.DeletedBy && userMap.has(orderObj.DeletedBy)) {
        orderObj.DeletedByUser = userMap.get(orderObj.DeletedBy);
      }

      return orderObj;
    });

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: populatedOrders,
      count: populatedOrders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getAllOrders,
};


