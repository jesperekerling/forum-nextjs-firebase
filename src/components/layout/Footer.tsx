import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <footer className='p-10 text-center'>
        <p>Created by <Link href="https://ekerling.com/" target='blank' className='font-semibold hover:opacity-65'>ekerling.com</Link></p>
    </footer>
  )
}

export default Footer