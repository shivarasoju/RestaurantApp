import {Component} from 'react'
import {FaShoppingCart} from 'react-icons/fa'
import Loader from 'react-loader-spinner'
import './index.css'

const apiStatusConstants = {
  initial: 'INIT',
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const API_URL =
  'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'

class Restaurant extends Component {
  state = {
    restaurantList: [],
    apiStatus: apiStatusConstants.initial,
    activeOptionId: '',
    cartList: [],
  }

  componentDidMount() {
    this.getRestoData()
  }

  getRestoData = async () => {
    this.setState({apiStatus: apiStatusConstants.loading})
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      const menuList = data[0]?.table_menu_list || []

      if (response.ok) {
        this.setState({
          restaurantList: data,
          apiStatus: apiStatusConstants.success,
          activeOptionId: menuList[0]?.menu_category_id,
        })
      } else {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    } catch (error) {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  handleActiveOptionId = id => {
    this.setState({activeOptionId: id})
  }

  handleIncrement = dish => {
    this.setState(prevState => {
      const existing = prevState.cartList.find(
        item => item.dish_id === dish.dish_id,
      )
      if (existing) {
        return {
          cartList: prevState.cartList.map(item =>
            item.dish_id === dish.dish_id
              ? {...item, quantity: item.quantity + 1}
              : item,
          ),
        }
      }
      return {cartList: [...prevState.cartList, {...dish, quantity: 1}]}
    })
  }

  handleDecrement = dish => {
    this.setState(prevState => {
      const existing = prevState.cartList.find(
        item => item.dish_id === dish.dish_id,
      )
      if (!existing) return {}

      if (existing.quantity === 1) {
        return {
          cartList: prevState.cartList.filter(
            item => item.dish_id !== dish.dish_id,
          ),
        }
      }
      return {
        cartList: prevState.cartList.map(item =>
          item.dish_id === dish.dish_id
            ? {...item, quantity: item.quantity - 1}
            : item,
        ),
      }
    })
  }

  renderNavBar = () => {
    const totalQuantity = this.state.cartList.reduce(
      (sum, item) => sum + item.quantity,
      0,
    )
    return (
      <nav className="navBar">
        <h1>UNI Resto Cafe</h1>
        <div className="innerNav">
          <p className="myOrder">My Orders</p>
          <div className="cart">
            <FaShoppingCart size={30} />
            <p className="cartCount">{totalQuantity}</p>
          </div>
        </div>
      </nav>
    )
  }

  renderMenu = () => {
    const {restaurantList, activeOptionId} = this.state
    const menuList = restaurantList[0]?.table_menu_list || []

    return (
      <ul className="menuList">
        {menuList.map(item => (
          <li
            key={item.menu_category_id}
            className={
              item.menu_category_id === activeOptionId
                ? 'activeMenuItem'
                : 'menuItem'
            }
          >
            <button
              className={
                item.menu_category_id === activeOptionId
                  ? 'activeBtn'
                  : 'buttonMenu'
              }
              onClick={() => this.handleActiveOptionId(item.menu_category_id)}
            >
              {item.menu_category}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  renderDishItem = dish => {
    const quantity =
      this.state.cartList.find(item => item.dish_id === dish.dish_id)
        ?.quantity || 0

    return (
      <li className="dishItem" key={dish.dish_id}>
        <div className="leftCont">
          <h1>{dish.dish_name}</h1>
          <p>
            {dish.dish_currency} {dish.dish_price}
          </p>
          <p className="desc">{dish.dish_description}</p>
          {dish.dish_Availability ? (
            <div className="buttonDiv">
              <button
                className="quntBtn"
                onClick={() => this.handleDecrement(dish)}
              >
                -
              </button>
              <p>{quantity}</p>
              <button
                className="quntBtn"
                onClick={() => this.handleIncrement(dish)}
              >
                +
              </button>
            </div>
          ) : (
            <p className="available">Not available</p>
          )}
          {dish.addonCat?.length > 0 && dish.dish_Availability && (
            <p className="Customization">Customizations available</p>
          )}
        </div>
        <div className="midCont">
          <p className="Calories">{dish.dish_calories} calories</p>
        </div>
        <div className="imgCont">
          <img className="img" src={dish.dish_image} alt={dish.dish_name} />
        </div>
      </li>
    )
  }

  renderDishList = () => {
    const {restaurantList, activeOptionId} = this.state
    const activeCategory = restaurantList[0]?.table_menu_list?.find(
      item => item.menu_category_id === activeOptionId,
    )

    const dishes = activeCategory?.category_dishes || []
    return <ul className="dishList">{dishes.map(this.renderDishItem)}</ul>
  }

  renderLoader = () => (
    <div className="products-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={50} width={50} />
    </div>
  )

  renderFailure = () => (
    <div className="error">
      <h2>Something went wrong</h2>
      <button onClick={this.getRestoData}>Retry</button>
    </div>
  )

  renderSuccess = () => (
    <>
      {this.renderMenu()}
      {this.renderDishList()}
    </>
  )

  render() {
    const {apiStatus} = this.state
    return (
      <>
        {this.renderNavBar()}
        {apiStatus === apiStatusConstants.loading && this.renderLoader()}
        {apiStatus === apiStatusConstants.success && this.renderSuccess()}
        {apiStatus === apiStatusConstants.failure && this.renderFailure()}
      </>
    )
  }
}

export default Restaurant
