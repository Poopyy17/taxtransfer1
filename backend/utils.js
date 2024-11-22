import jwt from 'jsonwebtoken';

export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : 'https://taxtransfer1.onrender.com';

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
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
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
};

export const payOrderEmailTemplate = (order) => {
  return `
    Hello ${order.user.name}, The transaction ${order._id} is Paid!
  `;
};

export const payOrderEmailTemplate1 = (order) => {
  return `
    Good news, ${order.user.name}. Your Request ${order._id} has been accepted, check it out!
  `;
};

export const payOrderEmailTemplate2 = (order) => {
  return `
    Sorry to inform you, ${order.user.name}. But your Request has been declined.
    You may re-submit your request with proper documents next time.
  `;
};

export const payOrderEmailTemplate3 = (order) => {
  return `
    New Request by ${order.user.name} with transaction number of ${order._id}.
  `;
};

export const payOrderEmailTemplate4 = (order) => {
  return `
    Great news, ${order.user.name} the admin has validated your request ${order._id}.
  `;
};
