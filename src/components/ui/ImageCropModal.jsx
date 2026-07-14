import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { createCroppedImageFile } from "../../services/storageImages.js";
import { Button } from "./Button.jsx";
import { Modal } from "./Modal.jsx";

export function ImageCropModal({ request, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
    setProcessing(false);
    setError("");
  }, [request?.sourceUrl]);

  const handleCropComplete = useCallback((_area, pixels) => {
    setCropPixels(pixels);
  }, []);

  async function confirmCrop() {
    if (!request || !cropPixels || processing) return;
    setProcessing(true);
    setError("");
    try {
      const file = await createCroppedImageFile(request.file, cropPixels, request.output);
      onConfirm(file);
    } catch (cropError) {
      setError(cropError.message || "Nao foi possivel recortar a imagem.");
      setProcessing(false);
    }
  }

  return (
    <Modal open={Boolean(request)} title={request?.title || "Recortar imagem"} size="lg" onClose={processing ? undefined : onCancel}>
      {request ? (
        <div className="image-crop-editor">
          <p className="muted">Arraste e ajuste o zoom para escolher o enquadramento.</p>
          <div className={`image-crop-stage ${request.kind === "banner" ? "image-crop-stage-banner" : ""}`}>
            <Cropper
              image={request.sourceUrl}
              crop={crop}
              zoom={zoom}
              minZoom={1}
              maxZoom={3}
              zoomSpeed={0.15}
              aspect={request.aspect}
              showGrid
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <label className="image-crop-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              disabled={processing}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <div className="modal-actions image-crop-actions">
            <Button variant="ghost" disabled={processing} onClick={onCancel}>Cancelar</Button>
            <Button variant="primary" disabled={processing || !cropPixels} onClick={confirmCrop}>
              {processing ? "Gerando imagem..." : "Confirmar recorte"}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
