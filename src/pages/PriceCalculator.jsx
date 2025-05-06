import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PriceCalculator() {
  const [name, setName] = useState('');
  const [roleCost, setRoleCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [objectAmount, setObjectAmount] = useState('');
  const [plateAmount, setPlateAmount] = useState('');

  const [isValidRoleCost, setIsValidRoleCost] = useState(true);
  const [isValidSellingPrice, setIsValidSellingPrice] = useState(true);
  const [isValidObjectAmount, setIsValidObjectAmount] = useState(true);
  const [isValidPlateAmount, setIsValidPlateAmount] = useState(true);

  const handleSmartDollarChange = (value, setter, setValid) => {
    const clean = value.replace(/[^0-9.]/g, '');
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    if (clean === '') {
      setter('');
      setValid(true);
      return;
    }

    if (numericRegex.test(clean)) {
      setter(`$${clean}`);
      setValid(true);
    } else {
      setValid(false);
    }
  };

  const handlePlainNumberChange = (value, setter, setValid) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean === '' || /^[0-9]+$/.test(clean)) {
      setter(clean);
      setValid(true);
    } else {
      setValid(false);
    }
  };

  const getNumeric = (str) => parseFloat(str.replace('$', '')) || 0;

  const RC = getNumeric(roleCost);
  const SP = getNumeric(sellingPrice);
  const OA = parseInt(objectAmount) || 0;
  const PA = parseInt(plateAmount) || 0;

  const totalUnits = OA * PA;
  const totalCost = RC * PA;
  const totalRevenue = SP * totalUnits;
  const net = totalRevenue - totalCost;

  const minPrice = totalUnits ? (totalCost + 1) / totalUnits : 0;
  const maxPrice = totalUnits ? minPrice + 5 : 0;

  return (
    <>
      <h1>Price Calculator</h1>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px' }}>
        {/* Left Section: Inputs */}
        <form className="tip-calculator" onSubmit={(e) => e.preventDefault()} style={{ flex: 1 }}>
          <div className="section">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="form-group">
              <label>Role Cost</label>
              <input
                type="text"
                value={roleCost}
                onChange={(e) =>
                  handleSmartDollarChange(e.target.value, setRoleCost, setIsValidRoleCost)
                }
                className={isValidRoleCost ? '' : 'error'}
                placeholder="$20"
              />
            </div>

            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="text"
                value={sellingPrice}
                onChange={(e) =>
                  handleSmartDollarChange(e.target.value, setSellingPrice, setIsValidSellingPrice)
                }
                className={isValidSellingPrice ? '' : 'error'}
                placeholder="$5"
              />
            </div>

            <div className="form-group">
              <label>Object Amount</label>
              <input
                type="text"
                value={objectAmount}
                onChange={(e) =>
                  handlePlainNumberChange(e.target.value, setObjectAmount, setIsValidObjectAmount)
                }
                className={isValidObjectAmount ? '' : 'error'}
                placeholder="2"
              />
            </div>

            <div className="form-group">
              <label>Plate Amount</label>
              <input
                type="text"
                value={plateAmount}
                onChange={(e) =>
                  handlePlainNumberChange(e.target.value, setPlateAmount, setIsValidPlateAmount)
                }
                className={isValidPlateAmount ? '' : 'error'}
                placeholder="1"
              />
            </div>
          </div>
        </form>

        {/* Right Section: Results */}
        {totalUnits > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            marginTop: '110px' // 👈 adjust this value as needed
          }}>
            <div style={{
              padding: '12px 20px',
              backgroundColor: net >= 1 ? '#4caf50' : '#f44336',
              color: 'white',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}>
              {net >= 1 ? `Gained $${net.toFixed(2)}` : `Lost $${Math.abs(net).toFixed(2)}`}
            </div>

            <div style={{
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}>
              Price Range: ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PriceCalculator;
