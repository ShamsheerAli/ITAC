import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios'; // Make sure this path is correct

const StaffClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>(); // Grabs the ID from the URL
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        // Assuming your backend uses the same endpoint we used for the client update page
        const res = await api.get(`/profile/${clientId}`);
        setClientData(res.data);
      } catch (err) {
        console.error("Failed to fetch client details", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientDetails();
    } else {
      setLoading(false);
    }
  }, [clientId]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500 font-bold">Loading client details...</div>;
  }

  if (!clientData) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl text-red-500 font-bold">Client Not Found</h2>
        <p>We couldn't find details for this client.</p>
        <Link to="/staff-dashboard" className="text-blue-500 underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb / Header Area */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/staff-dashboard" className="hover:text-[#FE5C00] flex items-center transition">
           <span className="mr-2">&larr;</span> Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-gray-800">Client Details</span>
      </div>

      <div className="bg-white rounded shadow p-8">
        {/* Profile Header */}
        <div className="flex items-center border-b border-gray-200 pb-6 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 mr-4 border-2 border-white shadow-sm">
            {clientData.companyName?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {clientData.companyName || 'Unknown Company'}
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold uppercase tracking-wide">
                ID: {clientId ? clientId.substring(clientId.length - 6) : 'N/A'}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">Contact: <span className="font-medium text-gray-700">{clientData.contactName || 'N/A'}</span></p>
          </div>
        </div>

        {/* Details Grid */}
        <h2 className="text-xl font-bold mb-6 text-black">Application Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#FE5C00] uppercase tracking-wider border-b border-gray-200 pb-2">Contact Information</h3>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Email</p>
              <p className="font-medium text-gray-800">{clientData.contactEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Phone</p>
              <p className="font-medium text-gray-800">{clientData.contactPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Address</p>
              <p className="font-medium text-gray-800">{clientData.streetAddress || 'N/A'}</p>
              <p className="font-medium text-gray-800">
                {clientData.city ? `${clientData.city}, ` : ''} 
                {clientData.state || ''} {clientData.zipCode || ''}
              </p>
            </div>

            <h3 className="text-sm font-bold text-[#FE5C00] uppercase tracking-wider border-b border-gray-200 pb-2 mt-8">Energy & Financials</h3>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Annual Utility Exp.</p>
              <p className="font-medium text-gray-800">{clientData.utilityExpenses ? `$${clientData.utilityExpenses}` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Annual Energy Cons.</p>
              <p className="font-medium text-gray-800">{clientData.energyConsumption || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Gross Sales &lt; $250M?</p>
              <p className="font-medium text-gray-800">{clientData.isGrossSalesLessThan250M ? clientData.isGrossSalesLessThan250M.toUpperCase() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Annual Gross Sales</p>
              <p className="font-medium text-gray-800">{clientData.grossSales ? `$${clientData.grossSales}` : 'N/A'}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#FE5C00] uppercase tracking-wider border-b border-gray-200 pb-2">Building & Operations</h3>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Building Size (Sq Ft)</p>
              <p className="font-medium text-gray-800">{clientData.buildingSize || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Business Description</p>
              <p className="font-medium text-gray-800">{clientData.businessDescription || clientData.sicCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">NAICS Code</p>
              <p className="font-medium text-gray-800">{clientData.naics || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Referred By</p>
              <p className="font-medium text-gray-800">{clientData.referredBy || 'None'}</p>
            </div>

            <h3 className="text-sm font-bold text-[#FE5C00] uppercase tracking-wider border-b border-gray-200 pb-2 mt-8">Utility Providers</h3>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Electricity Provider</p>
              <p className="font-medium text-gray-800">{clientData.electricityProvider || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Natural Gas Provider</p>
              <p className="font-medium text-gray-800">{clientData.naturalGasProvider || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Natural Gas Transporter</p>
              <p className="font-medium text-gray-800">{clientData.naturalGasTransporter || 'N/A'}</p>
            </div>

            <h3 className="text-sm font-bold text-[#FE5C00] uppercase tracking-wider border-b border-gray-200 pb-2 mt-8">Additional Notes</h3>
            <div>
              <div className="bg-gray-50 p-4 rounded-md text-gray-600 text-sm italic border border-gray-200 whitespace-pre-wrap">
                {clientData.description || 'No additional notes provided by the client.'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffClientDetails;