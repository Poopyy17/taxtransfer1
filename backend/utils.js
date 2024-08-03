import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export const baseUrl = () =>
  process.env.BASE_URL
  ? process.env.BASE_URL
  : process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3000'
  : 'https://taxtransfer.com'

// Function to generate a JWT token
export const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            name: user.taxFilerName,
            email: user.email,
            isAdmin: user.isAdmin,
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '30d', // Token expires in 30 days
        }
    );
};

// Middleware to check authentication
export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.slice(7, authorization.length); // Extract token
        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err, decode) => {
                if (err) {
                    res.status(401).send({ message: 'Invalid Token' });
                } else {
                    req.user = decode;
                    next();
                }
            }
        );
    } else {
        res.status(401).send({ message: 'No Token' });
    }
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
}

export const mailgun = () => mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});

export const payOrderEmailTemplate = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; text-align: center;">
        <h1 style="background-color: #007bff; color: #fff; padding: 10px 0; margin: 0;">Tax Transfer</h1>
        <h2 style="color: #000000;">Receipt</h2>
        <p><strong>Transaction Status:</strong> Paid</p>
        <p><strong>User:</strong> ${order.user.name}</p>
        <p>You may proceed to the next step of the transaction.</p>
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${order.createdAt.toString().substring(0, 10)}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #ddd; padding: 10px;">Service</th>
              <th style="border-bottom: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems
              .map(
                (item) => `
                <tr>
                  <td style="border-bottom: 1px solid #ddd; padding: 10px;">${item.name}</td>
                  <td style="border-bottom: 1px solid #ddd; padding: 10px; text-align: right;">₱${item.price.toFixed(2)}</td>
                </tr>
                `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Service Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.itemsPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Tax Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.taxPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Total Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.totalPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; text-align: right;">${order.paymentMethod}</td>
            </tr>
          </tfoot>
        </table>
        <h3 style="padding-bottom: 10px;">Info Details</h3>
        <p>
          <strong>Name:</strong> ${order.shippingAddress.fullName}<br/>
          <strong>Address:</strong> ${order.shippingAddress.address}<br/>
          <strong>Recipient:</strong> ${order.shippingAddress.recipientName}<br/>
          <strong>Valid ID:</strong> ${order.shippingAddress.validId}
        </p>
        <hr/>
        <p style="text-align: center;">&copy; Tax Transfer all rights reserved</p>
      </div>
    `;
  }
  
  export const payOrderEmailTemplate1 = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; text-align: center;">
        <h1 style="background-color: #007bff; color: #fff; padding: 10px 0; margin: 0;">Tax Transfer</h1>
        <h2 style="color: #007bff;">Request Accepted</h2>
        <p><strong>Admin has accepted your request.</strong></p>
        <p><strong>User:</strong> ${order.user.name}</p>
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${order.createdAt.toString().substring(0, 10)}</p>
        <p>You may proceed to the next step of the transaction.</p>
      </div>
    `;
  }
  
  export const payOrderEmailTemplate2 = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; text-align: center;">
        <h1 style="background-color: #007bff; color: #fff; padding: 10px 0; margin: 0;">Tax Transfer</h1>
        <h2 style="color: #007bff;">Request Declined</h2>
        <p><strong>Admin has desclined your request.</strong></p>
        <p><strong>User:</strong> ${order.user.name}</p>
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${order.createdAt.toString().substring(0, 10)}</p>
        <p>You may re-submit your request with proper documents next time.</p>
      </div>
    `;
  }
  
  export const payOrderEmailTemplate3 = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; text-align: center;">
        <h1 style="background-color: #007bff; color: #fff; padding: 10px 0; margin: 0;">Tax Transfer</h1>
        <h2 style="color: #000000;">New Request</h2>
        <p><strong>User:</strong> ${order.user.name}</p>
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${order.createdAt.toString().substring(0, 10)}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #ddd; padding: 10px;">Service</th>
              <th style="border-bottom: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems
              .map(
                (item) => `
                <tr>
                  <td style="border-bottom: 1px solid #ddd; padding: 10px;">${item.name}</td>
                  <td style="border-bottom: 1px solid #ddd; padding: 10px; text-align: right;">₱${item.price.toFixed(2)}</td>
                </tr>
                `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Service Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.itemsPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Tax Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.taxPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Total Price:</strong></td>
              <td style="padding: 10px; text-align: right;">₱${order.totalPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; text-align: right;">${order.paymentMethod}</td>
            </tr>
          </tfoot>
        </table>
        <h3 style="padding-bottom: 10px;">Info Details</h3>
        <p>
          <strong>Name:</strong> ${order.shippingAddress.fullName}<br/>
          <strong>Address:</strong> ${order.shippingAddress.address}<br/>
          <strong>Recipient:</strong> ${order.shippingAddress.recipientName}<br/>
          <strong>Valid ID:</strong> ${order.shippingAddress.validId}
        </p>
        <hr/>
        <p style="text-align: center;">&copy; Tax Transfer all rights reserved</p>
      </div>
    `;
  }