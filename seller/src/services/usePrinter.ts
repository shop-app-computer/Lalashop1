import { useEffect, useState } from "react";

interface UsePrinterResult {
  available: boolean;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface USBDevice {
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  open: () => Promise<void>;
  close: () => Promise<void>;
}

interface USB {
  getDevices: () => Promise<USBDevice[]>;
  requestDevice: (options: { filters: unknown[] }) => Promise<USBDevice>;
}

interface NavigatorWithUSB extends Navigator {
  usb?: USB;
}

// Hook: detects whether the browser supports Web USB and tracks whether the
// user has paired a printer. Sticker/label printers usually expose a USB
// interface; a successful `requestDevice()` is treated as "connected" so the
// Print button can light up. Browsers without WebUSB (Firefox/Safari) keep
// the Print button disabled.
export const usePrinter = (): UsePrinterResult => {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as NavigatorWithUSB;
    if (!nav.usb) {
      setAvailable(false);
      return;
    }
    setAvailable(true);
    nav.usb
      .getDevices()
      .then((devices) => setConnected(devices.length > 0))
      .catch(() => setConnected(false));
  }, []);

  const connect = async (): Promise<void> => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as NavigatorWithUSB;
    if (!nav.usb) {
      setError("Web USB is not supported by this browser. Use Chrome or Edge desktop.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      // No filter — let the user pick any USB device. Sticker printers use
      // many different vendor IDs (Zebra, Brother, Munbyn, Xprinter, etc).
      const device = await nav.usb.requestDevice({ filters: [] });
      if (device) {
        try {
          await device.open();
          await device.close();
        } catch {
          /* some devices reject open() but the pairing still succeeds */
        }
        setConnected(true);
      }
    } catch (err) {
      // User cancelled the picker → silent. Real failure → record.
      const msg = err instanceof Error ? err.message : "Failed to connect printer";
      if (!msg.toLowerCase().includes("no device selected")) {
        setError(msg);
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    setConnected(false);
  };

  return { available, connected, connecting, error, connect, disconnect };
};
