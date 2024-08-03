import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin, generateToken, baseUrl, mailgun } from '../utils.js';

const userRouter = express.Router();

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  }));


userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.post(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '3h',
      });
      user.resetToken = token;
      await user.save();

      console.log(`${baseUrl()}/reset-password/${token}`);

      mailgun()
        .messages()
        .send(
          {
            from: 'TaxTransfer <mailgun@sandbox92e733a6402948019e0b612228cadad3.mailgun.org>',
            to: `${user.name} <taxtransfer69@gmail.com>`,
            subject: "Reset Your Password",
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <h2 style="color: #333333;">Reset Your Password</h2>
                        <p style="color: #666666;">We received a request to reset your password. Please click the button below to reset it.</p>
                        <a href="${baseUrl()}/reset-password/${token}" style="display: inline-block; padding: 15px 30px; margin-top: 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p style="color: #666666; margin-top: 20px;">If you did not request this, please ignore this email.</p>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
          },
          (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          }
        );
      res.send({ message: 'Check your email to reset your password.' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);


userRouter.post(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        const user = await User.findOne({ resetToken: req.body.token });
        if (user) {
          if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            res.send({
              message: 'Password reset success!',
            });
          }
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      }
    });
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: 'User updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@dev.com') {
        res.status(400).send({ message: 'Cannot delete admin user' });
        return;
      }
      await user.deleteOne();
      res.send({ message: "User deleted" });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

userRouter.post(
    '/signin', 
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne( { email: req.body.email });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
              res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user),
              })
              return;
            }
        }
        res.status(401).send({ message: 'Invalid email or password'});
    })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);


export default userRouter