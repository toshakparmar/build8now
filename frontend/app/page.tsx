import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-extrabold text-blue-700 tracking-tight">Build8Now</div>
          <div className="space-x-6 font-medium text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/" className="hover:text-blue-600 transition-colors">Categories</Link>
            <Link href="/" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900">
            Professional Grade <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Construction Materials</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Direct from manufacturers to your site. Explore our highly curated selection of premium building supplies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sample Product Card */}
          <Link href="/products/ultratech-premium-cement-50kg" className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium tracking-widest bg-gradient-to-br from-gray-100 to-gray-200">
                PRODUCT IMAGE
              </div>
            </div>
            <div className="p-6">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">UltraTech</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">UltraTech Premium Cement 50kg</h2>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-black text-gray-900">₹450</span>
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">In Stock</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}