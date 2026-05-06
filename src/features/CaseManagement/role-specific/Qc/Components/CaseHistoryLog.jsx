import React from 'react';
import CustomLoader from '@/components/common/CustomLoader';

const dummyCaseLogs = [
  {
    id: 'log-001',
    categoryName: 'General Validation',
    subcategoryName: 'General Details',
    keyName: 'Full Name',
    stage: 'Backend Review',
    action: 'Rejected by Backend',
    status: 'Rejected',
    actorRole: 'Backend',
    actorName: 'Riya Sharma',
    assignedToRole: 'Agent',
    assignedToName: 'Amit Verma',
    remark: 'Backend rejected the key because customer name did not match.',
    createdAt: '2026-05-01T10:28:00Z',
    files: [{ name: 'backend-proof.pdf', type: 'PDF' }],
  },
  {
    id: 'log-002',
    categoryName: 'General Validation',
    subcategoryName: 'General Details',
    keyName: 'Full Name',
    stage: 'Physical Verification',
    action: 'Verified by Agent',
    status: 'Verified',
    actorRole: 'Agent',
    actorName: 'Amit Verma',
    assignedToRole: 'QC',
    assignedToName: 'Sanjay Kumar',
    remark: 'Agent completed visit and verified the customer name.',
    createdAt: '2026-05-02T14:30:00Z',
    files: [
      { name: 'visit-photo.jpg', type: 'Image' },
      { name: 'verification-form.pdf', type: 'PDF' },
    ],
  },
  {
    id: 'log-003',
    categoryName: 'General Validation',
    subcategoryName: 'General Details',
    keyName: 'Address',
    stage: 'QC Review',
    action: 'Sent for Reverification',
    status: 'Reverification',
    actorRole: 'QC',
    actorName: 'Sanjay Kumar',
    assignedToRole: 'Agent',
    assignedToName: 'Amit Verma',
    remark: 'QC found address proof unclear and sent it for reverification.',
    createdAt: '2026-05-03T11:20:00Z',
    files: [],
  },
  {
    id: 'log-004',
    categoryName: 'General Validation',
    subcategoryName: 'General Details',
    keyName: 'Address',
    stage: 'Reverification',
    action: 'Reverified by Agent',
    status: 'Verified',
    actorRole: 'Agent',
    actorName: 'Amit Verma',
    assignedToRole: 'QC',
    assignedToName: 'Sanjay Kumar',
    remark: 'Agent checked QC remark and uploaded corrected address proof.',
    createdAt: '2026-05-04T10:15:00Z',
    files: [{ name: 'corrected-proof.pdf', type: 'PDF' }],
  },
  {
    id: 'log-005',
    categoryName: 'General Validation',
    subcategoryName: 'General Details',
    keyName: 'Address',
    stage: 'Final QC',
    action: 'Approved by QC',
    status: 'Approved',
    actorRole: 'QC',
    actorName: 'Sanjay Kumar',
    assignedToRole: null,
    assignedToName: null,
    remark: 'QC approved the subcategory.',
    createdAt: '2026-05-04T15:30:00Z',
    files: [],
  },
];

const statusColorMap = {
  rejected: 'bg-red-100 text-red-700 border-red-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  reverification: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

const roleColorMap = {
  Backend: 'bg-purple-100 text-purple-700',
  Agent: 'bg-orange-100 text-orange-700',
  QC: 'bg-indigo-100 text-indigo-700',
  default: 'bg-slate-100 text-slate-700',
};

const getStatusColor = status =>
  statusColorMap[status?.toLowerCase()] || statusColorMap.default;

const getRoleColor = role => roleColorMap[role] || roleColorMap.default;

const formatDate = value => {
  if (!value) return { date: '-', time: '' };

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: value, time: '' };
  }

  return {
    date: date.toLocaleDateString('en-IN'),
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const CaseHistoryLog = ({
  caseData,
  loading = false,
  selectedSubcategoryName = 'General Details',
}) => {
  const logs = React.useMemo(() => {
    const sourceLogs = caseData?.logs?.length ? caseData.logs : dummyCaseLogs;

    return sourceLogs
      .filter(log => log.subcategoryName === selectedSubcategoryName)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [caseData, selectedSubcategoryName]);

  const latestStatus = logs[logs.length - 1]?.status || '-';
  const categoryName = logs[0]?.categoryName || 'Category';

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {categoryName}
            </p>

            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {selectedSubcategoryName} Logs
            </h3>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
              latestStatus
            )}`}
          >
            {latestStatus}
          </span>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <CustomLoader />
          </div>
        ) : logs.length ? (
          <div className="space-y-4 overflow-auto h-[450px] ">
            {logs.map(log => {
              const date = formatDate(log.createdAt);

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleColor(
                            log.actorRole
                          )}`}
                        >
                          {log.actorRole}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {log.stage}
                        </span>

                        {log.keyName && (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                            Key: {log.keyName}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900">
                        {log.action}
                      </h4>

                      {log.remark && (
                        <p className="text-sm text-slate-600">{log.remark}</p>
                      )}

                      {log.assignedToName && (
                        <p className="text-sm text-slate-500">
                          Assigned to:{' '}
                          <span className="font-medium text-slate-700">
                            {log.assignedToRole} - {log.assignedToName}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 sm:text-right">
                      <p>{date.date}</p>
                      <p>{date.time}</p>
                      <p className="mt-1 font-medium text-slate-700">
                        {log.actorName}
                      </p>
                    </div>
                  </div>

                  {log.files?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {log.files.map((file, index) => (
                        <span
                          key={`${file.name}-${index}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-sm text-slate-500">
              No logs available for this subcategory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseHistoryLog;