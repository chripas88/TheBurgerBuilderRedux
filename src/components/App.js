import React from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import Layout from '../containers/Layout';
import BurgerBuilder from '../containers/BurgerBuilder';
import Logout from '../containers/Logout';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import asyncComponent from '../hoc/asyncComponent';

const asyncCheckout = asyncComponent(() => {
	return import('../containers/Checkout');
});

const asyncOrders = asyncComponent(() => {
	return import('../containers/Orders');
});

const asyncAuth = asyncComponent(() => {
	return import('../containers/Auth');
});

class App extends React.Component{
	componentDidMount(){
		this.props.onAuthCheckState();	
	}
	
	render(){
		let routes = (
			<Switch>
				<Route path="/auth" component={asyncAuth} />
				<Route path="/" exact component={BurgerBuilder} />
				<Redirect to="/" />
			</Switch>
		);
		if(this.props.isAuthenticated){
			routes = (
				<Switch>
					<Route path="/checkout" component={asyncCheckout} />
					<Route path="/orders" component={asyncOrders} />
					<Route path="/logout" component={Logout} />
					<Route path="/auth" component={asyncAuth} />
					<Route path="/" exact component={BurgerBuilder} />
					<Redirect to="/" />
				</Switch>
			);
		}
		return(
			<div>
				<Layout>
					{routes}
				</Layout>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return{
		isAuthenticated: state.auth.token !== null
	}
}

const mapDispatchToProps = dispatch => {
	return{
		onAuthCheckState: () => dispatch(actions.authCheckState())
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));