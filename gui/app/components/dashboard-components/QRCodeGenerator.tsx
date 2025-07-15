"use client";

import { useState, useEffect } from "react";
import { ErrorModal } from "@/app/components/ErrorModal";
import Image from "next/image";
import { Button } from "@/app/components/button";

// Helper function to format date
const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return "Invalid Date";
  }
};

export default function QRCodeGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // State for QR code reading
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [decodedData, setDecodedData] = useState<any | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [showAddContactButton, setShowAddContactButton] = useState(false);
  const [contactEmailToAdd, setContactEmailToAdd] = useState<string | null>(null);
  const [contactPublicKeyToAdd, setContactPublicKeyToAdd] = useState<string | null>(null);

  useEffect(() => {
    const generateQrCode = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("Authentication token not found. Please sign in again.");
        setLoading(false);
        return;
      }

      // Decode the JWT to get the user's email
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        setCurrentUserEmail(decodedToken.email);
      } catch (e) {
        console.error("Error decoding JWT:", e);
        setError("Failed to decode user information from token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/qrcode/generate",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate QR code.");
        }

        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    generateQrCode();
  }, []);

  const handleDownloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = "qrcode_public_key.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setDecodedData(null); // Clear previous data
      setDecodeError(null); // Clear previous error
    }
  };

  const handleDecodeQrCode = async () => {
    if (!selectedFile) {
      setDecodeError("Please select a QR code image to decode.");
      return;
    }

    setDecoding(true);
    setDecodeError(null);
    setDecodedData(null);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setDecodeError("Authentication token not found. Please sign in again.");
      setDecoding(false);
      return;
    }

    const formData = new FormData();
    formData.append("qrCodeImage", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/qrcode/decode", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to decode QR code.");
      }

      const data = await response.json();
      // Format createdAt if it exists
      if (data.decodedData && data.decodedData.createdAt) {
        data.decodedData.createdAt = formatDate(data.decodedData.createdAt);
      }
      setDecodedData(data.decodedData);

      // Logic để hiển thị nút "Add to Contacts"
      if (data.decodedData && data.decodedData.email && data.decodedData.publicKey) {
        if (currentUserEmail && data.decodedData.email !== currentUserEmail) {
          // Check if contact already exists in the current user's contacts
          // This would require fetching current user's contacts, which is not done here.
          // For simplicity, we'll assume it's not a duplicate for now, or handle it in backend.
          setShowAddContactButton(true);
          setContactEmailToAdd(data.decodedData.email);
          setContactPublicKeyToAdd(data.decodedData.publicKey);
        } else {
          setShowAddContactButton(false);
          setContactEmailToAdd(null);
          setContactPublicKeyToAdd(null);
        }
      } else {
        setShowAddContactButton(false);
        setContactEmailToAdd(null);
        setContactPublicKeyToAdd(null);
      }

    } catch (err: any) {
      setDecodeError(err.message || "An unexpected error occurred.");
    } finally {
      setDecoding(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactEmailToAdd || !contactPublicKeyToAdd) return;

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Authentication token not found. Please sign in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: contactEmailToAdd, publicKey: contactPublicKeyToAdd }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Contact added successfully!");
        setShowAddContactButton(false); // Hide button after adding
        setContactEmailToAdd(null);
        setContactPublicKeyToAdd(null);
      } else {
        alert(data.message || "Failed to add contact.");
      }
    } catch (err) {
      alert("An error occurred while adding contact.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md flex-1">
        <h2 className="text-2xl font-bold text-[#001C44] mb-4">
          QR Code Public Key
        </h2>

        {loading && <p>Loading QR Code...</p>}

        {qrCodeUrl && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold text-[#001C44] mb-4">
              Your QR Code:
            </h3>
            <div className="p-4 border rounded-lg inline-block">
              <Image src={qrCodeUrl} alt="QR Code" width={256} height={256} />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Scan this QR code to get the public key.
            </p>
            <button
              onClick={handleDownloadQrCode}
              className="mt-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Download QR Code
            </button>
          </div>
        )}

        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          errorMessage={error || ""}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-96 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[#001C44] mb-4">
          Decode QR Code
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a QR code image to decode its content.
        </p>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 active:file:bg-blue-200"
          />
        </div>

        <Button
          onClick={handleDecodeQrCode}
          disabled={!selectedFile || decoding}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {decoding ? "Decoding..." : "Decode QR Code"}
        </Button>

        {decodedData && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold text-[#001C44] mb-4">
              Decoded Information:
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg text-sm text-blue-800 overflow-x-auto overflow-y-auto max-h-60">
              {decodedData &&
                Object.entries(decodedData).map(([key, value]) => (
                  <p key={key} className="mb-1">
                    <strong className="capitalize">{key}:</strong> {String(value)}
                  </p>
                ))}
            </div>
          </div>
        )}

        {decodedData && showAddContactButton && (
          <div className="mt-4">
            <Button
              onClick={handleAddContact}
              className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Add to Contacts
            </Button>
          </div>
        )}

        <ErrorModal
          isOpen={!!decodeError}
          onClose={() => setDecodeError(null)}
          errorMessage={decodeError || ""}
        />
      </div>
    </div>
  );
}