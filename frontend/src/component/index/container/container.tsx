import React from 'react'
import DockTabs from './dockTabs/dockTabs'

class Container extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="container">
        <DockTabs />
      </div>
    )
  }
}

export default Container
