import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import AuthProvider from './contexts/AuthProvider';
import OrderProvider from './contexts/OrderProvider';
import ProductProvider from './contexts/ProductProvider';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import ContactScreen from './screens/ContactScreen';
import ErrorScreen from './screens/ErrorScreen';
import HomeScreen from './screens/HomeScreen';
import OrderScreen from './screens/OrderScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductDetailScreenAdmin from './screens/ProductDetailScreenAdmin';
import AddProducts from './components/products/AddProduct.js';
import ProductsScreen from './screens/ProductsScreen';
import ServicesDetailScreen from './screens/ServicesDetailScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import AdminPanel from './screens/AdminPanel';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <ProductProvider> {/* Додаємо ProductProvider */}
            <Navbar />
            <Switch>
              <Route exact path="/"><HomeScreen /></Route>
              <Route exact path="/contact"><ContactScreen /></Route>
              <PublicRoute path="/signup"><SignUpScreen /></PublicRoute>
              <PublicRoute path="/signin"><SignInScreen /></PublicRoute>
              <PrivateRoute exact path="/services/:title"><ServicesDetailScreen /></PrivateRoute>
              <Route exact path="/products/"><ProductsScreen /></Route>
              <PrivateRoute exact path="/products/:name"><ProductDetailScreen /></PrivateRoute>
              <PrivateRoute exact path="/orders"><OrderScreen /></PrivateRoute>
              <PrivateRoute exact path="/admin_panel"><AdminPanel /></PrivateRoute>
              <PrivateRoute exact path="/productsadmin/:name"><ProductDetailScreenAdmin /></PrivateRoute>
              <PrivateRoute exact path="/addproducts"><AddProducts /></PrivateRoute>
              <PrivateRoute exact path="/edit-product"><AddProducts /></PrivateRoute>
              <Route path="*"><ErrorScreen /></Route>
            </Switch>
            <Footer />
          </ProductProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
