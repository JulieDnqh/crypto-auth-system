import { useState, useEffect } from "react";
import QRCode from "qrcode.react";

const QRCodePublicKey = () => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPublicKey, setInputPublicKey] = useState("");
  const [generatedQrData, setGeneratedQrData] = useState("");
  const [generatedCreationDate, setGeneratedCreationDate] = useState("");

  const handleGenerateQrCode = () => {
    if (!inputEmail || !inputPublicKey) {
      alert("Please enter both email and public key.");
      return;
    }

    const today = new Date();
    const dateString = today.toLocaleDateString();
    setGeneratedCreationDate(dateString);

    const dataToEncode = JSON.stringify({
      email: inputEmail,
      date: dateString,
      publicKey: inputPublicKey,
    });
    setGeneratedQrData(dataToEncode);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#001C44] mb-4">
        QR Code Public Key
      </h2>
      <p className="text-gray-700 mb-4">
        Enter your email and public key to generate a QR code.
      </p>

      <div className="mb-4">
        <label
          htmlFor="emailInput"
          className="block text-sm font-medium text-gray-700"
        >
          Email:
        </label>
        <input
          type="email"
          id="emailInput"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="publicKeyInput"
          className="block text-sm font-medium text-gray-700"
        >
          Public Key:
        </label>
        <textarea
          id="publicKeyInput"
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={inputPublicKey}
          onChange={(e) => setInputPublicKey(e.target.value)}
          placeholder="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
        ></textarea>
      </div>

      <button
        onClick={handleGenerateQrCode}
        className="px-4 py-2 bg-[#2D99AE] text-white rounded-md hover:bg-[#0C5776] focus:outline-none focus:ring-2 focus:ring-[#2D99AE] focus:ring-offset-2"
      >
        Generate QR Code
      </button>

      {generatedQrData && (
        <div className="mt-6 flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md bg-gray-50">
          <QRCode
            value={generatedQrData}
            size={256}
            level="H"
            includeMargin={true}
          />
          <p className="mt-4 text-sm text-gray-600">
            Scan this QR code to share your public key.
          </p>
          <div className="mt-4 text-sm text-gray-700">
            <p>
              <strong>Email:</strong> {inputEmail}
            </p>
            <p>
              <strong>Creation Date:</strong> {generatedCreationDate}
            </p>
            <p>
              <strong>Public Key:</strong> {inputPublicKey.substring(0, 50)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodePublicKey;