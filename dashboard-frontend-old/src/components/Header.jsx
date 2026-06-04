import './test-header.css'
import Character from '../assets/Character.png'
import { Link } from 'react-router-dom';

function Header()
{
    return (
        <div className='headerWrapper'>
            <img className='character' src={Character} />
            <nav className='navigator'>
                <Link to="/" className='navbarLink'>Home</Link>
                <Link to='/payload' className='navbarLink'>Payload</Link>
                <Link to='/ai' className='navbarLink'>AI</Link>
                <Link to='/console' className='navbarLink'>Console</Link>
                <Link to='/about' className='navbarLink'>About</Link>
            </nav>
            {/*<h1 className='time'>T+ 12:33.04</h1>*/}
        </div>
    )
}

export default Header;