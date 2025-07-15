import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { LoaderCircle, Search, Copy } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

interface SearchResult {
  found: boolean;
  message?: string;
  email: string;
  firstName: string;
  publicKey: string;
  createdAt: string;
  expiresAt: string;
  expiresInDays: number;
}

export default function SearchPublicKey() {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setIsLoading(true);
    setSearchResult(null);
    const token = localStorage.getItem('jwtToken');

    try {
      const response = await fetch(`http://localhost:5000/api/users/key?email=${encodeURIComponent(searchEmail)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data: SearchResult = await response.json();
      setSearchResult(data);
    } catch (err) {
        setSearchResult({ 
            found: false, 
            message: "Failed to connect to the server.",
            // Add remaining fields with null or undefined values
            // Can keep the searched email
            firstName: "",
            publicKey: "",
            createdAt: "",
            expiresAt: "",
            expiresInDays: 0
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Public key copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-[#001C44] mb-4">Search for a User's Public Key</h3>
        <form onSubmit={handleSearch} className="flex items-end gap-4">
          <div className="flex-grow">
            <Label htmlFor="search-email" className="text-sm font-medium text-[#001C44]">User Email</Label>
            <Input 
              id="search-email"
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1 bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] pr-10"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin text-[#001C44]" />
            ) : (
                <Search className="w-4 h-4 text-[#001C44]" />
            )}
            <span className="text-[#001C44]">Search</span>
          </Button>
        </form>
      </div>

      {/* {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>} */}

      {searchResult && (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            {searchResult.found ? (
            // --- WHEN USER IS FOUND (using Fragment <> to group elements) ---
            <>
                <h4 className="text-lg font-bold text-[#001C44] mb-4">
                Search Result for: {searchResult.email}
                </h4>
                
                {searchResult.publicKey ? (
                // --- If user HAS a public key ---
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                    <div>
                        <Label className="font-semibold text-[#001C44]">Public Key</Label>
                        <div className="relative mt-1">
                        <pre className="bg-gray-100 p-3 rounded text-xs text-[#001C44] overflow-x-auto pr-10">
                            {searchResult.publicKey}
                        </pre>
                        <button onClick={() => copyToClipboard(searchResult.publicKey!)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-black">
                            <Copy size={16}/>
                        </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-[#001C44]">
                        <p><strong>Created:</strong> {searchResult.createdAt ? new Date(searchResult.createdAt).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Expires:</strong> {searchResult.expiresAt ? new Date(searchResult.expiresAt).toLocaleDateString() : 'N/A'} ({searchResult.expiresInDays} days left)</p>
                    </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                    <Label className="font-semibold text-[#001C44]">QR Code</Label>
                    <div className="p-2 border border-2 border-[#001C44] rounded-lg mt-1">
                        <QRCodeSVG value={searchResult.publicKey} size={160} />
                    </div>
                    </div>
                </div>
                ) : (
                // --- If user DOES NOT HAVE a public key ---
                <div className="text-center text-gray-500 p-4 border-t mt-4">
                    This user exists but does not have a registered public key.
                </div>
                )}
            </>
            ) : (
            // --- WHEN USER IS NOT FOUND ---
            <p className="text-center text-red-600 font-semibold py-4">
                {searchResult.message}
            </p>
            )}
        </div>
      )}
    </div>
  );
}