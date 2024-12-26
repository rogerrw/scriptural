import { Button } from '@/components/ui/button'
import React from 'react'

const Header = () => {
  return (
    <div className='flex justify-between p-6 text-center'>
      <div>
        {/* TODO: convert to logo */}
        Scriptural
      </div>
      <div>
        <Button>Create an account</Button>
      </div>
    </div>
  )
}

export default Header