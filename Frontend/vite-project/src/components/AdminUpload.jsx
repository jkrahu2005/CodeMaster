import { useParams } from 'react-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { Upload, X, CheckCircle, AlertCircle, Video, Clock, Play, FileVideo, RefreshCw, File, HardDrive, Calendar, Type } from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    trigger
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  // Handle drag events
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) {
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (uploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('video/')) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          
          setValue('videoFile', dataTransfer.files);
          trigger('videoFile');
          
          // Extract and set file details
          extractFileDetails(file);
        } else {
          setError('videoFile', {
            type: 'manual',
            message: 'Please select a valid video file'
          });
        }
      }
    };

    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [uploading, setValue, trigger, setError]);

  // Handle file selection and extract details
  const extractFileDetails = (file) => {
    if (!file) return;
    
    const details = {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString(),
      extension: file.name.split('.').pop().toUpperCase(),
      dimensions: 'Calculating...'
    };
    
    setFileDetails(details);
    
    // Create video element to get dimensions
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      details.dimensions = `${video.videoWidth} × ${video.videoHeight}`;
      setFileDetails({...details});
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      details.dimensions = 'Unknown';
      setFileDetails({...details});
    };
    video.src = URL.createObjectURL(file);
  };

  // Update file details when selected file changes
  useEffect(() => {
    if (selectedFile) {
      extractFileDetails(selectedFile);
    } else {
      setFileDetails(null);
    }
  }, [selectedFile]);

  // Create preview URL for selected file
  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      clearErrors('videoFile');
    }
  };

  // Handle manual file selection
  const handleManualFileSelect = () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setValue('videoFile', undefined);
    clearErrors('videoFile');
    setFileDetails(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video duration from file
  const getFileDuration = useCallback((file) => {
    return new Promise((resolve) => {
      if (!file) {
        resolve(0);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  }, []);

  // Upload video
  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    clearErrors();
    
    // Get video duration from file
    const duration = await getFileDuration(file);

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: duration || cloudinaryResult.duration || 0,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
      removeSelectedFile();
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRetryUpload = () => {
    if (selectedFile) {
      handleSubmit(onSubmit)();
    }
  };

  const VideoPreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Video Preview - {fileDetails?.name}</h3>
          <button 
            onClick={() => setShowPreview(false)} 
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <video 
            controls 
            className="w-full h-auto max-h-[70vh] rounded-lg"
            src={previewUrl}
            autoPlay
          />
        </div>
      </div>
    </div>
  );

  // Register file input with react-hook-form
  const fileInputRegister = register('videoFile', {
    required: 'Please select a video file',
    validate: {
      isVideo: (files) => {
        if (!files || !files[0]) return 'Please select a video file';
        const file = files[0];
        return file.type.startsWith('video/') || 'Please select a valid video file';
      },
      fileSize: (files) => {
        if (!files || !files[0]) return true;
        const file = files[0];
        const maxSize = 100 * 1024 * 1024; // 100MB
        return file.size <= maxSize || 'File size must be less than 100MB';
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="card-title text-2xl">Upload Editorial Video</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-primary">Problem ID:</span>
                <span className="font-mono text-gray-700">{problemId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-primary" />
              <span className="text-sm text-gray-500">Max 100MB</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={uploading}
              {...fileInputRegister}
              ref={(e) => {
                fileInputRef.current = e;
                if (e && fileInputRegister.ref) {
                  fileInputRegister.ref(e);
                }
              }}
              onChange={(e) => {
                fileInputRegister.onChange(e);
                handleFileInputChange(e);
              }}
            />
            
            {/* Drag & Drop Area */}
            <div 
              ref={dropAreaRef}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/10' 
                  : errors.videoFile 
                    ? 'border-error bg-error/5' 
                    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={handleManualFileSelect}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <FileVideo className="w-20 h-20 mx-auto text-primary" />
                  <div className="space-y-2">
                    <p className="font-bold text-lg truncate px-4">{selectedFile.name}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600">
                      <span className="badge badge-sm">{selectedFile.type.split('/')[1].toUpperCase()}</span>
                      <span>•</span>
                      <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile();
                    }}
                    className="btn btn-sm btn-outline btn-error"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Change File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-20 h-20 mx-auto text-gray-400" />
                  <div className="space-y-2">
                    <p className="font-bold text-lg">Upload Video</p>
                    <p className="text-gray-500">Drag & drop your video file here</p>
                    <p className="text-sm text-gray-400">or click to browse files</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualFileSelect();
                    }}
                  >
                    <File className="w-5 h-5 mr-2" />
                    Browse Files
                  </button>
                  <div className="text-xs text-gray-400 mt-4">
                    Supported formats: MP4, WebM, OGG • Max file size: 100MB
                  </div>
                </div>
              )}
            </div>

            {errors.videoFile && (
              <div className="alert alert-error shadow-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="font-medium">File Error</span>
                  <p className="text-sm">{errors.videoFile.message}</p>
                </div>
              </div>
            )}

            {/* File Preview Section */}
            {selectedFile && !errors.videoFile && (
              <div className="border rounded-xl overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Selected File Preview
                  </h3>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Video Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-700">Video Preview</h4>
                        <button
                          type="button"
                          onClick={() => setShowPreview(true)}
                          className="btn btn-sm btn-outline"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Full Screen
                        </button>
                      </div>
                      <div className="relative border rounded-lg overflow-hidden bg-black">
                        <video
                          className="w-full h-48 md:h-64 object-contain"
                          src={previewUrl}
                          preload="metadata"
                          controls
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white text-sm truncate">{selectedFile.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* File Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">File Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {/* File Name */}
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <File className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">File Name</div>
                            <div className="font-medium truncate" title={fileDetails?.name}>
                              {fileDetails?.name}
                            </div>
                          </div>
                        </div>

                        {/* File Size & Type */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <HardDrive className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">File Size</div>
                              <div className="font-medium">{fileDetails?.size}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Type className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">File Type</div>
                              <div className="font-medium">{fileDetails?.extension} • {fileDetails?.type}</div>
                            </div>
                          </div>
                        </div>

                        {/* Last Modified & Dimensions */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Last Modified</div>
                              <div className="font-medium text-sm">{fileDetails?.lastModified}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <Video className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Dimensions</div>
                              <div className="font-medium">{fileDetails?.dimensions}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="border rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-pulse">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold">Uploading Video...</span>
                      <p className="text-sm text-gray-600">Please wait while we upload your file</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">{uploadProgress}%</span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Uploading...</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {uploadProgress < 100 ? 'Processing' : 'Finalizing...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="alert alert-error shadow-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Upload Failed</p>
                    <p className="text-sm">{errors.root.message}</p>
                    <button
                      type="button"
                      onClick={handleRetryUpload}
                      className="btn btn-sm btn-outline btn-error mt-3"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadedVideo && (
              <div className="alert alert-success shadow-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Upload Successful!</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-2 text-success" />
                        <div>
                          <div className="text-xs text-gray-600">Duration</div>
                          <div className="font-medium">{formatDuration(uploadedVideo.duration)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-success" />
                        <div>
                          <div className="text-xs text-gray-600">Uploaded</div>
                          <div className="font-medium">
                            {new Date(uploadedVideo.uploadedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <a
                        href={uploadedVideo.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-success"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        View Video
                      </a>
                      <button
                        type="button"
                        onClick={() => setUploadedVideo(null)}
                        className="btn btn-sm btn-ghost"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="card-actions">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className={`btn btn-primary btn-lg w-full ${uploading ? 'loading' : ''}`}
              >
                {uploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Video Preview Modal */}
      {showPreview && <VideoPreviewModal />}
    </div>
  );
}

export default AdminUpload;