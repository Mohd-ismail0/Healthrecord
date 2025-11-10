import React, { useState } from 'react';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setUploading(false);
    alert('File uploaded successfully!');
    setSelectedFile(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Document</h1>

      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload Medical Document</h2>
          <p className="text-gray-600 mb-6">
            Upload prescription or lab report (PDF, JPG, PNG) for automatic parsing
          </p>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {selectedFile ? (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="mt-4 text-sm text-error hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-900">
                  Drag and drop your file here
                </p>
                <p className="mt-2 text-sm text-gray-500">or</p>
                <label className="mt-4 inline-block cursor-pointer">
                  <span className="btn-primary">Browse Files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                  />
                </label>
                <p className="mt-4 text-xs text-gray-500">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload & Parse Document'}
              </button>
            </div>
          )}
        </div>

        {/* Manual Entry Option */}
        <div className="mt-8 card">
          <h2 className="text-xl font-semibold mb-4">Or Enter Manually</h2>
          <p className="text-gray-600 mb-6">
            Prefer to type? Enter your health record data manually.
          </p>
          <button className="btn-secondary">Manual Entry Form</button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
