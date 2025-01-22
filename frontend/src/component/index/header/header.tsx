import React from 'react'
import { Logo } from 'assets/image'
class Header extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="header-main">
        <div className="header-inner">
          <div className="header_logo">
            <img src={Logo} alt="" />
          </div>
        </div>
      </div>
    )
  }
}

export default Header
