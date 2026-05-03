import { useState, useRef, useCallback } from 'react';
import ReactCrop, { makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

function ImageCropper({ imageSrc, onCropComplete }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    // Start with a centered crop covering 80% of the image, no forced aspect ratio
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, width / height, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }, []);

  const getCroppedCanvas = useCallback(() => {
    if (!completedCrop || !imgRef.current) return null;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return canvas;
  }, [completedCrop]);

  const handleApplyCrop = useCallback(() => {
    const canvas = getCroppedCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      onCropComplete(url, blob);
    }, 'image/png');
  }, [getCroppedCanvas, onCropComplete]);

  const handleDownload = useCallback(() => {
    const canvas = getCroppedCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped-image.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [getCroppedCanvas]);

  return (
    <div className="image-cropper">
      <div className="cropper-label">Crop Image</div>
      <p className="cropper-hint">Drag to reposition · Resize handles for freeform crop</p>
      <div className="crop-canvas-wrapper">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          ruleOfThirds
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop source"
            onLoad={onImageLoad}
            style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
          />
        </ReactCrop>
      </div>
      <div className="cropper-actions">
        <button
          className="crop-apply-btn"
          onClick={handleApplyCrop}
          disabled={!completedCrop?.width || !completedCrop?.height}
        >
          ✂ Use Cropped as Input
        </button>
        <button
          className="crop-download-btn"
          onClick={handleDownload}
          disabled={!completedCrop?.width || !completedCrop?.height}
        >
          ⬇ Download Cropped
        </button>
      </div>
    </div>
  );
}

export default ImageCropper;
