// frontend/src/components/ShopImageUploadModal.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { API_URL } from '../config';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please select a valid image (JPEG, PNG, or WEBP).';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Image must be smaller than 5MB.';
  }
  return null;
}

/**
 * ShopImageUploadModal — Take Photo / Upload Image → preview → save, built on
 * the shared Modal primitive (focus trap/Escape/scroll-lock come for free).
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} [onSaved] - called with the new shopImage URL after a successful upload.
 *   Used when there's already a logged-in shopkeeper to upload for (Shop Settings).
 * @param {function} [onFileReady] - if provided INSTEAD of relying on the default upload
 *   behavior, Save just hands back the raw File (no upload — no account/token exists
 *   yet to attach it to) and closes; the caller uploads it later itself. Used at
 *   registration, before the account exists.
 */
function ShopImageUploadModal({ isOpen, onClose, onSaved, onFileReady }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Reset to a clean "choice" state each time the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setError('');
      setIsSaving(false);
    }
  }, [isOpen]);

  // Revoke the object URL when it's replaced/unmounted, to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelected = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!selected) return;

    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleSave = async () => {
    if (!file) return;

    if (onFileReady) {
      onFileReady(file);
      onClose();
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(`${API_URL}/api/users/shop/image`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      onSaved(res.data.shopImage);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload shop image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shop Image" size="sm">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      {!previewUrl ? (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant">Choose how you'd like to add your shop photo.</p>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-left"
          >
            <span className="material-symbols-outlined text-primary text-2xl">photo_camera</span>
            <div>
              <p className="font-bold text-sm text-on-surface">Take Photo</p>
              <p className="text-xs text-on-surface-variant">Use your device camera</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-left"
          >
            <span className="material-symbols-outlined text-primary text-2xl">image</span>
            <div>
              <p className="font-bold text-sm text-on-surface">Upload Image</p>
              <p className="text-xs text-on-surface-variant">Choose from your device</p>
            </div>
          </button>
          {error && (
            <p role="alert" className="text-sm text-error font-medium">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container-high">
            <img src={previewUrl} alt="Shop preview" className="w-full h-full object-cover" />
          </div>
          {error && (
            <p role="alert" className="text-sm text-error font-medium">{error}</p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRetake} disabled={isSaving} className="flex-1">
              Retake / Change
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ShopImageUploadModal;
