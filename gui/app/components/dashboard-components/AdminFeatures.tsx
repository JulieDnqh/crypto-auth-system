const AdminFeatures = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#001C44] mb-4">Admin Features</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Account Permissions</h3>
        <p className="text-gray-700">Content for managing account permissions.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Security Logs</h3>
        <p className="text-gray-700">Content for viewing security logs.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Key Status Check</h3>
        <p className="text-gray-700">Content for checking key status.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-[#001C44] mb-3">Login Limits</h3>
        <p className="text-gray-700">Content for setting login limits.</p>
      </div>
    </div>
  );
};

export default AdminFeatures;