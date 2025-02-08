"use client";
import React from 'react'
import {useDropzone} from 'react-dropzone'

function MyDropzone() {
  const {getRootProps, getInputProps} = useDropzone()

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  )
}

export default MyDropzone;
