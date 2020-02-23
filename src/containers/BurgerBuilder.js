import React from 'react';
import { connect } from 'react-redux';
import Auxiliary from '../hoc/Auxiliary';
import Burger from '../components/burger/Burger';
import OrderSummary from '../components/burger/OrderSummary';
import BuildControls from '../components/burger/BuildControls';
import Modal from '../components/ui/Modal';
import axios from '../axios/axios-orders';
import Spinner from '../components/ui/Spinner';
import withErrorHandler from '../hoc/withErrorHandler';
import * as actions from '../store/actions/index';

class BurgerBuilder extends React.Component{
	state = {
		purchasing: false
	}

	componentDidMount() {
		this.props.onInitIngredients();
	}

	updatePurchaseState() {	
		const sum = Object.keys(this.props.ingredients)
			.map(igKey => {
				return this.props.ingredients[igKey]; 
			})
			.reduce((sum, el) => {
			return sum + el;
		}, 0);
		
		return sum > 0;
	}
	
	purchaseHandler = () => {
		if(this.props.isAuthenticated){
			this.setState({purchasing: true});	
		} else {
			this.props.onSetAuthRedirectPath('/checkout');
			this.props.history.push('/auth');
		}
	}
	
	purchaseCancelHandler = () => {
		this.setState({purchasing: false});
	}
	
	purchaseContinueHandler = () => {
		this.props.onPurchaseInit();
		this.props.history.push('/checkout');
	}
	
	render(){
		const disabledInfo = {...this.props.ingredients};
		
		for(let key in disabledInfo){
			disabledInfo[key] = disabledInfo[key] <= 0;
		}
		
		let orderSummary = null;	
		let burger = this.props.error ? <p>Cannot load ingredients. Please reload page!</p> : <Spinner />;
		
		if(this.props.ingredients){
			burger =(
				<Auxiliary>
					<Burger ingredients={this.props.ingredients}/>
					<BuildControls
						disabled={disabledInfo}
						totalPrice={this.props.totalPrice}
						ingredientAdded={this.props.onIngredientAdded}
						ingredientRemoved={this.props.onIngredientRemoved}
						purchasable={this.updatePurchaseState()}
						ordered={this.purchaseHandler}
						isAuth={this.props.isAuthenticated}/>
				</Auxiliary>
			);
			
			orderSummary = <OrderSummary
				ingredients={this.props.ingredients}
				totalPrice={this.props.totalPrice}
				purchaseCancelled={this.purchaseCancelHandler}
				purchaseContinued={this.purchaseContinueHandler}/>;
		}
		
		return(
			<Auxiliary>
				<Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
					{orderSummary}
				</Modal>
					{burger}
			</Auxiliary>
		);
	}
}

const mapStateToProps = state => {
	return{
		ingredients: state.burgerBuilder.ingredients,
		totalPrice: state.burgerBuilder.totalPrice,
		error: state.burgerBuilder.error,
		isAuthenticated: state.auth.token !== null
	};
}

const mapDispatchToProps = dispatch => {
	return{
		onIngredientAdded: (ingredientName) => dispatch(actions.addIngredient(ingredientName)),
		onIngredientRemoved: (ingredientName) => dispatch(actions.removeIngredient(ingredientName)),
		onInitIngredients: () => dispatch(actions.initIngredients()),
		onPurchaseInit: () => dispatch(actions.purchaseInit()),
		onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));