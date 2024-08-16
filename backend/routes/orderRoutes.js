import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate, payOrderEmailTemplate1, payOrderEmailTemplate2, payOrderEmailTemplate3 } from '../utils.js';
import Order from '../models/OrderModel.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Create new order with provided properties
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, service: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    // Save the new order to the database
    let order = await newOrder.save();

    // Populate the user field
    order = await Order.findById(order._id).populate('user', 'email name');

    // Send confirmation email
    mailgun().messages().send({
      from: 'TaxTransfer <mailgun@sandbox92e733a6402948019e0b612228cadad3.mailgun.org>',
      to: `${order.user.name} <taxtransfer69@gmail.com>`,
      subject: `Request Submitted ${order._id}`,
      html: payOrderEmailTemplate3(order),
    }, 
    (error, body) => {
      if (error) {
        console.log(error);
      } else {
        console.log(body);
      }
    });

    // Send response with the created order
    res.status(201).send({ message: 'Request Submitted', order });
  })
);



orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Request not found' });
    }
  })
);

orderRouter.put(
  '/:id/approve',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isApproved = true;
      order.approvedAt = Date.now();
      await order.save();
      mailgun().messages().send({
        from: 'TaxTransfer <mailgun@sandbox92e733a6402948019e0b612228cadad3.mailgun.org>',
        to: `${order.user.name} <taxtransfer69@gmail.com>`,
        subject: `Request Approved ${order._id}`,
        html: payOrderEmailTemplate1(order),
      }, 
      (error, body) => {
        if(error) {
          console.log(error);
        } else {
          console.log(body);
        }
      }
    );
      res.send({ message: 'Request Approved' });
    } else {
      res.status(404).send({ message: 'Request Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/decline',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isDeclined = true;
      order.declinedAt = Date.now();
      await order.save();
      mailgun().messages().send({
        from: 'TaxTransfer <mailgun@sandbox92e733a6402948019e0b612228cadad3.mailgun.org>',
        to: `${order.user.name} <taxtransfer69@gmail.com>`,
        subject: `Request Declined ${order._id}`,
        html: payOrderEmailTemplate2(order),
      }, 
      (error, body) => {
        if(error) {
          console.log(error);
        } else {
          console.log(body);
        }
      }
    );
      res.send({ message: 'Request Declined' });
    } else {
      res.status(404).send({ message: 'Request Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun().messages().send({
        from: 'TaxTransfer <mailgun@sandbox92e733a6402948019e0b612228cadad3.mailgun.org>',
        to: `${order.user.name} <taxtransfer69@gmail.com>`,
        subject: `Paid Transaction ${order._id}`,
        html: payOrderEmailTemplate(order),
      }, 
      (error, body) => {
        if(error) {
          console.log(error);
        } else {
          console.log(body);
        }
      }
    );
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Transaction not found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Request Deleted' });
    } else {
      res.status(404).send({ message: 'Request Not Found' });
    }
  })
);

orderRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (order) {
      if (order.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'You already submitted your validation' });
      }
      // Ensure 'image' is included in the request body
      const review = {
        image: req.body.image, 
        images: req.body.images,
        comment: req.body.comment,
      };
      order.reviews.push(review);
      const updatedOrder = await order.save();
      res.status(201).send({
        message: 'Validation Created',
        review: updatedOrder.reviews,
      });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);


export default orderRouter;
