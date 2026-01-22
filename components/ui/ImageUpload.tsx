"use client"

import { useState, useRef } from "react"

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void
  currentImage?: string
  type: 'show' | 'comedian'
  className?: string
}

export default function ImageUpload({ onUpload, currentImage, type, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onUpload(result.url, result.publicId)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current/Preview Image */}
      <div className="relative">
        {(preview || currentImage) ? (
          <div className="relative">
            <img
              src={preview || currentImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {preview && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
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
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-input-${type}`}
        />
        <label
          htmlFor={`file-input-${type}`}
          className="block w-full text-center px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 cursor-pointer transition-colors"
        >
          Choose Image
        </label>
        <p className="text-xs text-zinc-500 mt-1">
          JPEG, PNG, or WebP (max 5MB)
        </p>
      </div>

      {/* Upload Button (only show when there's a preview and not uploading) */}
      {preview && !isUploading && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Image
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-zinc-300 text-zinc-700 rounded hover:bg-zinc-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
