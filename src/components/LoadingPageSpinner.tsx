import LoadingSpinner from "./LoadingSpinner";

const LoadingPageSpinner = ({ size }: { size?: number }) => {
  return (
    <div className="mt-14 flex items-center justify-center">
      <LoadingSpinner size={size ?? 60} />
    </div>
  );
};

export default LoadingPageSpinner;
