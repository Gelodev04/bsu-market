import React from 'react'

export default function MessageSeller() {
  return (
    <div>
        <p>Send seller a message</p>
        <div className='flex items-center'>
            <input className='border border-black' type="text" />
            <p>Send</p>
        </div>
    </div>
  )
}
