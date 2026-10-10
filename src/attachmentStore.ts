// IndexedDB keeps note files out of localStorage's small synchronous quota.
let database: Promise<IDBDatabase> | undefined
function openDatabase() {
  return database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('qingjian-notes', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('records')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { database = undefined; reject(request.error) }
  })
}
export async function readRecord<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', 'readonly')
    const request = tx.objectStore('records').get(key)
    tx.oncomplete = () => resolve(request.result as T | undefined)
    tx.onabort = () => reject(tx.error)
  })
}
export async function writeRecord(key: string, value?: unknown): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', 'readwrite')
    if (value === undefined) tx.objectStore('records').delete(key)
    else tx.objectStore('records').put(value, key)
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
}
