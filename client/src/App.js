import React, { Fragment,useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import setAuthToken from './utils/setAuthToken'
import {BrowserRouter as Router,Route, Switch} from 'react-router-dom';
import {loadUser} from './action/auth';

//redux

import {Provider} from 'react-redux';

import store from './store';

import './App.css';

if(localStorage.token){
  setAuthToken(localStorage.token);
}

const App = () =>{
  useEffect(()=> {
    store.dispatch(loadUser());
  },[]);
  return(
  <Provider store={store}>
  <Router>
  <Fragment>
    <Navbar />
    <Route exact path='/' component ={Landing}/>
    <Alert/>  
    <section className="container">
      <Route exact path='/register' component ={Register}/>
      <Route exact path='/login' component ={Login}/>

    </section>
  </Fragment>
  </Router>
  </Provider>
);}

export default App;
