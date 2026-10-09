interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = 'No data available for the selected filters.' }: EmptyStateProps) => (
  <div className="flex flex-col justify-center items-center h-full w-full p-8 text-gray-500">
    <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
    </svg>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default EmptyState;
