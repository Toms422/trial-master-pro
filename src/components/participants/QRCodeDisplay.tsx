import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface QRCodeDisplayProps {
  qrId: string;
}

export default function QRCodeDisplay({ qrId }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const checkInUrl = `${window.location.origin}/check-in/${qrId}`;

  const handleDownload = () => {
    const element = qrRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (element) {
      const link = document.createElement("a");
      link.href = element.toDataURL("image/png");
      link.download = `qrcode-${qrId}.png`;
      link.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div ref={qrRef} className="flex justify-center p-8 bg-white">
        <QRCodeSVG value={checkInUrl} size={256} level="H" includeMargin={true} />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg break-all">
        <p className="text-sm font-semibold mb-2">קישור לסריקה:</p>
        <p className="text-sm font-mono text-blue-600 mb-4">{checkInUrl}</p>
        <p className="text-xs text-gray-600">העתק את הקישור לשליחה ב-SMS או דוא"ל</p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 ml-2" />
          הורד תמונה
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="w-4 h-4 ml-2" />
          הדפס
        </Button>
      </div>
    </div>
  );
}
