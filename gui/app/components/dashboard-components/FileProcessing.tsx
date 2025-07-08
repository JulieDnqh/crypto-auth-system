const FileProcessing = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#001C44] mb-4">File Processing</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Encrypt File for Others</h3>
        <p className="text-gray-700">Content for encrypting files for others.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Decrypt File</h3>
        <p className="text-gray-700">Content for decrypting files.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Sign File</h3>
        <p className="text-gray-700">Content for signing files.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Verify Signature</h3>
        <p className="text-gray-700">Content for verifying signatures.</p>
      </div>
    </div>
  );
};

export default FileProcessing;