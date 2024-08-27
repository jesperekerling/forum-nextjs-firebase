import React from 'react'

function ListThreads() {
  return (
    <div>
        <h2 className='font-bold text-lg'>Latest Forum Threads</h2>
        <ul className='py-3'>
            <li className='py-1'>
                <a href="threads/" className='font-semibold'>Namn på forumtråd</a>, 19:38<br />
                <span className='text-sm'>skapad av <a href="user/">hej</a></span>
            </li>
            <li className='py-1'>
                <a href="threads/" className='font-semibold'>Namn på forumtråd</a>, 19:38<br />
                <span className='text-sm'>skapad av <a href="user/">hej</a></span>
            </li>
            <li className='py-1'>
                <a href="threads/" className='font-semibold'>Namn på forumtråd</a>, 19:38<br />
                <span className='text-sm'>skapad av <a href="user/">hej</a></span>
            </li>
        </ul>
    </div>
  )
}

export default ListThreads