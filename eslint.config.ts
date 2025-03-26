import { FlatCompat } from '@eslint/eslintrc'

export default new FlatCompat({
  baseDirectory: import.meta.dirname,
}).extends('next/core-web-vitals', 'next/typescript')
