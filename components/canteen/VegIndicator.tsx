export default function VegIndicator({ isVeg }: { isVeg: boolean }) {
  return (
    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${isVeg ? "border-green-600" : "border-red-600"}`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
    </div>
  );
}
