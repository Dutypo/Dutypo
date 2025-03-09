const hashTable = new Set<string>

export default function generateHash(length = 32) {
  for (;;) {
    const hash = '0123456789abcdefghijklmnopqrstuvwxyz'.split('').map((_v, _i, str) => str[crypto.getRandomValues(new Uint8Array(1))[0] % 36]).join('').substring(0, length)
    if (hashTable.has(hash)) continue
    hashTable.add(hash)
    return hash
  }
}
