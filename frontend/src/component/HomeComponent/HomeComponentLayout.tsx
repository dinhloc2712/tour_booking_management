import React from 'react'
import HomeStatisticalComponent from './homecontainer/HomeStatistical'
import HomeTableComponent from './homecontainer/HomeTable'

const HomeComponentLayout: React.FC = () => {
  return (
    <div className="wrapper">
      <div className="HomeContainer">
        <HomeStatisticalComponent />
        <HomeTableComponent />
      </div>
    </div>
  )
}
export default HomeComponentLayout
