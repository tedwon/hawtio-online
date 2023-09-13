import { Logger, configManager, hawtio, Hawtio, registerPlugins, HawtioPlugin } from '@hawtio/react'
import { isMgmtApiRegistered } from '@hawtio/online-management-api'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { reportWebVitals } from './reportWebVitals'
import { discover } from './discover'

Logger.setLevel(Logger.DEBUG)
console.log('Logging Level set to ', Logger.getLevel())

configManager.addProductInfo('Hawtio Online', '__PACKAGE_VERSION_PLACEHOLDER__')

// Register kubernetes & management - only then complete hawtio bootstrap
isMgmtApiRegistered()
  .then(() => {

    // Register hawtio plugins
    registerPlugins()

    // Register discover plugin
    discover()

    // Bootstrap Hawtio
    hawtio.bootstrap()

    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
    root.render(
      <React.StrictMode>
        <Hawtio />
      </React.StrictMode>,
    )

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals()
  })
