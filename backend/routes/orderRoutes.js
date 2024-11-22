import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import axios from 'axios';
import {
  isAuth,
  isAdmin,
  payOrderEmailTemplate,
  payOrderEmailTemplate1,
  payOrderEmailTemplate2,
  payOrderEmailTemplate3,
  payOrderEmailTemplate4,
} from '../utils.js';
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
      shippingAddress: {
        ...req.body.shippingAddress,
        recipientContactNumber: req.body.shippingAddress.recipientContactNumber,
        recipientEmail: req.body.shippingAddress.recipientEmail,
      },
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

    // Send confirmation email using Getform.io
    try {
      await axios.post(
        'https://getform.io/f/amddyvlb',
        {
          email: order.user.email,
          subject: `Request Submitted ${order._id}`,
          message: payOrderEmailTemplate3(order),
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Error sending email:', error);
    }

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

      // Send approval email using Getform.io
      try {
        await axios.post(
          'https://getform.io/f/amddyvlb',
          {
            email: order.user.email,
            subject: `Request Approved ${order._id}`,
            message: payOrderEmailTemplate1(order),
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Email sent successfully');
      } catch (error) {
        console.log('Error sending email:', error);
      }

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

      // Send decline email using Getform.io
      try {
        await axios.post(
          'https://getform.io/f/amddyvlb',
          {
            email: order.user.email,
            subject: `Request Declined ${order._id}`,
            message: payOrderEmailTemplate2(order),
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Email sent successfully');
      } catch (error) {
        console.log('Error sending email:', error);
      }

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

      // Send payment confirmation email using Getform.io
      try {
        await axios.post(
          'https://getform.io/f/amddyvlb',
          {
            email: order.user.email,
            subject: `Paid Transaction ${order._id}`,
            message: payOrderEmailTemplate(order),
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Email sent successfully');
      } catch (error) {
        console.log('Error sending email:', error);
      }

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
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
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

      // Send review notification email using Getform.io
      try {
        await axios.post(
          'https://getform.io/f/amddyvlb',
          {
            email: order.user.email,
            subject: `New Validation ${order._id}`,
            message: payOrderEmailTemplate4(order),
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Email sent successfully');
      } catch (error) {
        console.log('Error sending email:', error);
      }

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
