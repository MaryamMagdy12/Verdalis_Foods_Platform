import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function QrScanner({ onScan, paused = false }) {
  const reactId = useId();
  const regionId = `sp-qr-reader-${reactId.replace(/:/g, "")}`;
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState("");

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      /* ignore cleanup errors */
    }
    scannerRef.current = null;
  }, []);

  const handleScan = useCallback(
    (text) => {
      const value = String(text || "").trim();
      if (!value || scannedRef.current || paused) return;
      scannedRef.current = true;
      onScan?.(value);
      const scanner = scannerRef.current;
      if (scanner?.isScanning) scanner.pause(true);
      setStatus("scanned");
    },
    [onScan, paused]
  );

  useEffect(() => {
    if (paused) return undefined;

    let cancelled = false;
    scannedRef.current = false;
    setStatus("starting");
    setError("");

    const scanner = new Html5Qrcode(regionId, { verbose: false });
    scannerRef.current = scanner;

    const config = {
      fps: 12,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.68;
        return { width: edge, height: edge };
      },
      aspectRatio: 1,
      disableFlip: false,
    };

    (async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;

        if (!cameras?.length) {
          setError("No camera found on this device.");
          setStatus("error");
          return;
        }

        const preferred =
          cameras.find((c) => /back|rear|environment/i.test(c.label)) ||
          cameras[cameras.length - 1];

        await scanner.start(preferred.id, config, handleScan, () => {});
        if (!cancelled) setStatus("scanning");
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || "Could not access camera.";
        setError(
          /secure|https|permission|notallowed/i.test(msg)
            ? "Allow camera access. HTTPS or localhost is required."
            : msg
        );
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [paused, regionId, handleScan, stopScanner]);

  return (
    <div className="sp-scan__camera">
      <div id={regionId} className="sp-scan__reader" />

      <div className="sp-scan__overlay" aria-hidden>
        <div className="sp-scan__frame" />
      </div>

      {status === "scanning" && (
        <p className="sp-scan__hint">Align the warehouse QR code inside the frame</p>
      )}

      {status === "scanned" && (
        <div className="sp-scan__scanned">
          <i className="fa-solid fa-circle-check" aria-hidden />
          <span>QR code captured</span>
        </div>
      )}

      {status === "error" && (
        <div className="sp-scan__error">
          <i className="fa-solid fa-camera" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      {status === "starting" && (
        <p className="sp-scan__hint sp-scan__hint--loading">Starting camera…</p>
      )}
    </div>
  );
}
