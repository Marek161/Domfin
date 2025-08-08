// Kontekst opłat – integracja z Firebase Firestore (ESM)
// Ten plik dostarcza:
// - hook domenowy useBillsData: subskrypcja kolekcji, akcje CRUD, podsumowanie
// - BillsProvider: provider z danymi
// - useBills: skrót do odczytu kontekstu
import React, { useEffect, useMemo, useState, useContext, createContext, useCallback } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, onSnapshot, orderBy, query, updateDoc, doc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

const BillsContext = createContext(null)

// Hook domenowy – zarządza listą opłat z Firestore
function useBillsData(){
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Subskrypcja kolekcji `bills` z sortowaniem po dacie utworzenia
    try {
      const q = query(collection(db, 'bills'), orderBy('created_at', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title,
            category: data.category,
            amount: typeof data.amount === 'number' ? data.amount : Number(data.amount || 0),
            due: data.due instanceof Timestamp ? data.due.toMillis() : (data.due || null),
            isPaid: !!(data.is_paid ?? data.isPaid),
            createdAt: data.created_at instanceof Timestamp ? data.created_at.toMillis() : Date.now(),
          }
        })
        setBills(items)
        setLoading(false)
      }, (err) => { setError(err); setLoading(false) })
      return () => unsub && unsub()
    } catch (e) { setError(e); setLoading(false) }
  }, [])

  // Dodanie nowej opłaty
  const addBill = useCallback(async (bill) => {
    try {
      await addDoc(collection(db, 'bills'), {
        title: bill.title,
        category: bill.category,
        amount: Number(bill.amount),
        due: bill.due ? Timestamp.fromMillis(bill.due) : null,
        is_paid: false,
        created_at: serverTimestamp(),
      })
    } catch (e) { setError(e) }
  }, [])

  // Przełączenie statusu opłaty (zapłacone / do zapłaty)
  const togglePaid = useCallback(async (id) => {
    try {
      const ref = doc(db, 'bills', id)
      const current = await getDoc(ref)
      const cur = current.exists() ? (current.data().is_paid ?? current.data().isPaid) : false
      await updateDoc(ref, { is_paid: !cur })
    } catch (e) { setError(e) }
  }, [])

  // Usunięcie opłaty
  const removeBill = useCallback(async (id) => {
    try { await deleteDoc(doc(db, 'bills', id)) } catch (e) { setError(e) }
  }, [])

  // Podsumowanie: sumy oraz agregacja wg kategorii
  const summary = useMemo(() => {
    const paid = bills.filter(b=>b.isPaid).reduce((s,b)=>s+b.amount,0)
    const unpaid = bills.filter(b=>!b.isPaid).reduce((s,b)=>s+b.amount,0)
    const byCategory = bills.reduce((acc,b)=>{ const k=b.category||'Inne'; acc[k]=(acc[k]||0)+b.amount; return acc },{})
    return { paid, unpaid, total: paid+unpaid, byCategory }
  }, [bills])

  return { bills, addBill, togglePaid, removeBill, summary, loading, error }
}

// Provider z danymi opłat – opakowuje aplikację
export function BillsProvider({ children }){
  const value = useBillsData()
  return <BillsContext.Provider value={value}>{children}</BillsContext.Provider>
}

// Skrótowy hook do odczytu kontekstu opłat
export function useBills(){ const ctx = useContext(BillsContext); if(!ctx) throw new Error('useBills inside provider'); return ctx }


