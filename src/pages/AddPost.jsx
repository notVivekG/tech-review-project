import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-10 flex justify-center'>
      <Container>
        <div className="max-w-2xl mx-auto">
          <PostForm />
        </div>
      </Container>
    </div>
  )
}

export default AddPost