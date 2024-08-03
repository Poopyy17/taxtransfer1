import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from "./screens/HomeScreen";
import ServiceScreen from "./screens/ServiceScreen";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import { useContext } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import NavDropdown from 'react-bootstrap/NavDropdown';
import InfoScreen from './screens/InfoScreen';
import SignupScreen from './screens/SignupScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ReqHistoryScreen from './screens/ReqHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProtectedRoute from './Component/ProtectedRoute';
import AdminRoute from './Component/AdminRoute';
import ValidationScreen from './screens/ValidationScreen';
import UserList from './screens/UserList';
import UserEditScreen from './screens/UserEditScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  return (
    <BrowserRouter>
      <div className='d-flex flex-column site-container'>
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand='lg'>
            <Container>
              <LinkContainer to="/">
                <Navbar.Brand>Tax Transfer</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id='basic-navbar-nav'>
                <Nav className='me-auto w-100 justify-content-end'>
                  {/* {userInfo && !userInfo.isAdmin && (
                    <Link to="/cart" className='nav-link'>
                      Requests
                      {cart.cartItems.length > 0 && (
                        <Badge pill bg="danger">
                          {cart.cartItems.length}
                        </Badge>
                      )}
                    </Link>
                  )} */}
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id='basic-nav-dropdown'>
                      <LinkContainer to='/profile'>
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      {!userInfo.isAdmin && (
                        <LinkContainer to='/history'>
                          <NavDropdown.Item>History</NavDropdown.Item>
                        </LinkContainer>
                      )}
                      <NavDropdown.Divider />
                      <Link
                        className='dropdown-item'
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title='Admin' id='admin-nav-dropdown'>
                      <LinkContainer to="/admin/validation">
                        <NavDropdown.Item>Requests</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/userlist">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <main>
          <Container className='mt-3'>
            <Routes>
              {/* Admin Route */ }
              <Route path="/admin/validation" element={<AdminRoute><ValidationScreen /></AdminRoute>} />
              <Route path="/admin/userlist" element=
              {<AdminRoute><UserList /></AdminRoute>} />
              <Route path="/admin/user/:id" element=
              {<AdminRoute><UserEditScreen /></AdminRoute>} />

              {/* User Route */ }
              <Route path="/" element={<HomeScreen />} />
              <Route path="/service/:slug" element={<ServiceScreen />} />
              {/* <Route path="/cart" element={<CartScreen />} /> */}
              <Route path="/info" element={<InfoScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/window" element={<PlaceOrderScreen />} />
              <Route path="/requests/:id" element={<ProtectedRoute><OrderScreen /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><ReqHistoryScreen /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
              <Route path="/forget-password" element={<ForgetPasswordScreen />} />
              <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <div className='text-center'>© Tax Transfer All rights reserved </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
