import PageContainer from "ecfr-analyzer/components/PageContainer";

export default function UpdatesPage() {
  // Sample data for updates - in a real app this would come from an API
  const updates = [
    {
      id: 1,
      date: "May 15, 2025",
      title: "EPA Revised Environmental Standards",
      summary: "Environmental Protection Agency updates to air quality regulations",
      agency: "Environmental Protection Agency",
      changeType: "Addition"
    },
    {
      id: 2,
      date: "May 12, 2025",
      title: "DOT Transportation Safety Requirements",
      summary: "Department of Transportation updates to commercial vehicle safety regulations",
      agency: "Department of Transportation",
      changeType: "Modification"
    },
    {
      id: 3,
      date: "May 10, 2025",
      title: "FDA Food Safety Guidelines",
      summary: "Food and Drug Administration updates to food processing requirements",
      agency: "Food and Drug Administration",
      changeType: "Modification"
    },
    {
      id: 4,
      date: "May 8, 2025",
      title: "HHS Healthcare Provider Requirements",
      summary: "Health and Human Services updates to healthcare provider regulations",
      agency: "Department of Health and Human Services",
      changeType: "Removal"
    },
    {
      id: 5,
      date: "May 5, 2025",
      title: "SEC Financial Reporting Standards",
      summary: "Securities and Exchange Commission updates to financial reporting requirements",
      agency: "Securities and Exchange Commission",
      changeType: "Addition"
    }
  ];

  return (
    <PageContainer title="Recent Updates">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recent Regulation Updates</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Changes to Federal Regulations
          </h2>
          <p className="text-sm text-gray-600 mb-6">Recent additions, modifications, and removals from the Code of Federal Regulations</p>
          
          <div className="divide-y divide-gray-200">
            {updates.map((update) => (
              <div key={update.id} className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{update.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{update.summary}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-gray-500">{update.agency}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{update.date}</span>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getChangeTypeColor(update.changeType)}`}>
                    {update.changeType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function getChangeTypeColor(type) {
  switch (type) {
    case "Addition":
      return "bg-green-100 text-green-800";
    case "Modification":
      return "bg-blue-100 text-blue-800";
    case "Removal":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
} 