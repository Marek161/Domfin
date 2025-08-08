import React, { useState } from 'react'
import { BillsProvider } from './app/firebaseContext'
import { Header, BillsTab, ReportsTab } from './app/ui'

export default function App(){
  const [tab, setTab] = useState('bills')
  return (
    <BillsProvider>
      <div className="container">
        <header className="app">
          <Header tab={tab} setTab={setTab} />
        </header>
        {tab==='bills' ? <BillsTab /> : <ReportsTab />}
      </div>
    </BillsProvider>
  )
}

 