 

const Compliance = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Compliance Statement</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-gray-700">
          This system records cooperative-approved Allowance (Elaun) via Invoice Allowance (Invois Elaun).
        </p>
        <p className="text-gray-700">
          No employment-based remuneration structure is used anywhere in the system; only cooperative-approved Allowance (Elaun) is recorded.
        </p>
        <p className="text-gray-700">
          All allowance records are versioned per period, subject to approval, and maintained for audit purposes for a minimum of seven (7) years.
        </p>
        <p className="text-gray-700">
          Audit logs are immutable and record changes to financial and allowance data, including who made the change, their role, old and new values, date and time, and any provided reason.
        </p>
      </div>
    </div>
  );
};

export default Compliance;
