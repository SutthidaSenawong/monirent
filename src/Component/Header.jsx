import Logo from "../assets/MoniRent-logo.png";
import { LuShoppingCart } from "react-icons/lu";
import { Link } from "react-router-dom";
import useCart from "../lib/cart";

export default function Header() {
  const { selectedItems } = useCart();
  const itemCount = selectedItems.length;

  return (
    <div className='nav'>
      <Link to='/'>
        <img src={Logo} />
      </Link>
      <Link to='/rent-monitors-chiangmai/cart' className='cart-icon-link'>
        <LuShoppingCart size={30} color='#000000' />
        {itemCount > 0 && <span className='cart-badge'>{itemCount}</span>}
      </Link>
    </div>
  );
}
