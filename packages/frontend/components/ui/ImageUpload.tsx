"use client"

import { useState, useRef } from "react"

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void
  currentImage?: string
  type: 'show' | 'comedian' | 'profile'
  className?: string
}

export default function ImageUpload({ onUpload, currentImage, type, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Auto upload
      await handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onUpload(result.url, result.publicId)
        // Keep preview
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
        setPreview(null) // Reset preview on failure
      }
    } catch (error) {
      alert('Upload failed')
      setPreview(null)
    } finally {
      setIsUploading(false)
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload("", "") // Clear in parent
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current/Preview Image */}
      <div className="relative">
        {(preview || currentImage) ? (
          <div className="relative group">
            <img
              src={preview || currentImage}
              alt="Preview"
              className={`w-full h-48 object-cover rounded-lg ${isUploading ? 'opacity-50' : ''}`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                  Uploading...
                </div>
              </div>
            )}
            {!isUploading && (
              <button
                onClick={handleRemove}
                type="button"
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-zinc-200 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-zinc-600">No image uploaded</p>
            </div>
          </div>
        )}
      </div>

      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-input-${type}`}
          disabled={isUploading}
        />
        <label
          htmlFor={`file-input-${type}`}
          className={`block w-full text-center px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 cursor-pointer transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {preview || currentImage ? 'Change Image' : 'Choose Image'}
        </label>
        <p className="text-xs text-zinc-500 mt-1">
          JPEG, JPG, PNG, or WebP (max 5MB)
        </p>
      </div>
    </div>
  )
}
