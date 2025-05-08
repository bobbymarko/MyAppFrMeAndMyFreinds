import { useState } from 'react';

function Passwordbox() {
  const [password] = useState('thisIsStaffHi1234Isco0L'); // saved correct password
  const [passwordInput, setPasswordInput] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === password) {
      setAccessGranted(true);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <>
      {accessGranted ? (
        <h1>Access Granted! 🔓</h1>
      ) : (
        <>
          <h1>Password Entry</h1>
          <form className="tip-calculator" onSubmit={handleSubmit}>
            <div className="section">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password"
                />
              </div>
              <button type="submit">Submit</button>
            </div>
          </form>
        </>
      )}
    </>
  );
}

export default Passwordbox;
