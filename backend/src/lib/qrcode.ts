import QRCode from "qrcode";

export async function generateQrCode(url: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
    color: {
      dark: "#1e3a5f",
      light: "#ffffff",
    },
  });
  return dataUrl;
}
