import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const generateQRImage = async (
  qrData: string,
  filename: string
): Promise<string> => {
  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    "qrs",
    `${filename}.png`
  );

  await QRCode.toFile(filePath, qrData, {
    color: { dark: "#000000", light: "#ffffff" },
    width: 300,
  });

  return filePath;
};
