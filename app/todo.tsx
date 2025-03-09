export default function TODO({ children }: { readonly children?: React.ReactNode }) {
  return <div className='h-full bg-slate-900 flex justify-center items-center font-bold text-2xl'>TODO{children ? ': ' : ''}{children}</div>
}
