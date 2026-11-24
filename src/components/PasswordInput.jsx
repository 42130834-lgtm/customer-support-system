import { useState } from 'react'
import '../styles/PasswordInput.css'

// Password input ma3 zer 👁 la ywarje aw ykhabbe el password.
// Login w Signup tnenon byesta3mlo.
export default function PasswordInput({ id, name, value, onChange, placeholder, className }) {
  const [show, setShow] = useState(false)

  const toggleShow = () => setShow(!show)

  return (
    <div className="pw">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
      <button
        type="button"
        className="eye"
        title={show ? 'Hide password' : 'Show password'}
        onClick={toggleShow}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  )
}
