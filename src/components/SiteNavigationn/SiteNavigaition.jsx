import { Link } from 'react-router-dom';

function SiteNavigaition() {
  const buttonColor = 'rgb(242, 242, 242)';
  const LineColor = 'rgb(0, 0, 0)';

  const buttonStyle = {
    backgroundColor: buttonColor,
    color: 'black',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '8px',
    width: '90px',
    textAlign: 'right',
    textDecoration: 'none',
    alignSelf: 'flex-end',
    marginRight: '10px',
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '120px',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingTop: '20px',
      boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
    }}>
      <p style={{ color: 'black', marginLeft: '10px', marginBottom: '5px' }}>Public</p>
      <Link to="/home" style={buttonStyle}>Home</Link>
      <Link to="/orders" style={buttonStyle}>Order</Link>
      <Link to="/Thanks" style={buttonStyle}>Thanks</Link>

      <hr style={{
        width: '80%',
        border: `1px solid ${LineColor}`,
        margin: '8px auto',
      }} />

      <p style={{ color: 'black', marginLeft: '10px', marginBottom: '5px' }}>Admin</p>
      <Link to="/price-calculator" style={buttonStyle}>Price Calculator</Link>
      <Link to="/AAOMO" style={buttonStyle}>Admin Managment</Link>
    </nav>
  );
}

export default SiteNavigaition;
