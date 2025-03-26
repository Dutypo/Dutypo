const hashTable = new Set<string>

export default function generateHash(length = 32) {
  for (;;) {
    const hash = new Array(length).fill(0).map(() => '0123456789abcdefghijklmnopqrstuvwxyz'[crypto.getRandomValues(new Uint8Array(1))[0] % 36]).join('')
    if (hashTable.has(hash)) continue
    hashTable.add(hash)
    return hash
  }
}
