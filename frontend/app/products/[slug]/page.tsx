import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import Link from 'next/link';

const productDB: Record<string, any> = {
  'ultratech-premium-cement-50kg': {
    name: 'UltraTech Premium Cement 50kg',
    description: 'High-quality Portland cement engineered for superior strength and durability. Ideal for all heavy-duty construction needs including foundations, pillars, and roofing. Its advanced formula ensures quick setting and long-lasting structural integrity.',
    price: 450,
    sku: 'UTC-50',
    brand: 'UltraTech',
    inStock: true,
    details: {
      weight: '50 kg',
      grade: 'OPC 53',
      packaging: 'HDPE Bag',
      type: 'Ordinary Portland Cement'
    }
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (resolvedParams.slug === 'ultratech-cement') {
    redirect('/products/ultratech-premium-cement-50kg');
  }

  const product = productDB[resolvedParams.slug];
  if (!product) return {};

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${resolvedParams.slug}`;

  return {
    title: `${product.name} | Build8Now`,
    description: product.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      images: [{ url: '/placeholder-cement.png', width: 800, height: 600 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (resolvedParams.slug === 'ultratech-cement') {
    redirect('/products/ultratech-premium-cement-50kg');
  }

  const product = productDB[resolvedParams.slug];
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${resolvedParams.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Building Materials' },
      { '@type': 'ListItem', position: 3, name: 'Cement' },
      { '@type': 'ListItem', position: 4, name: product.name }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      
      <nav className="bg-white shadow-sm sticky top-0 z-50 mb-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">Build8Now</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Building Materials</span>
          <span>/</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Cement</span>
          <span>/</span>
          <span className="font-semibold text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 flex items-center justify-center relative">
               <div className="w-full aspect-square bg-white shadow-xl rounded-2xl flex items-center justify-center relative overflow-hidden transform transition-transform hover:scale-105 duration-500">
                  <div className="text-gray-300 text-xl font-bold tracking-widest absolute">PRODUCT IMAGE</div>
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wide">Premium</div>
               </div>
            </div>

            {/* Product Details Section */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="mb-2 text-blue-600 font-bold uppercase tracking-widest text-sm">{product.brand}</div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-8">
                <div className="text-5xl font-black text-gray-900">₹{product.price}</div>
                <div className="text-gray-500 mb-2 font-medium">per bag (incl. taxes)</div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">In Stock & Ready to Ship</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-10 text-lg">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Weight</div>
                  <div className="font-semibold text-gray-900">{product.details.weight}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Grade</div>
                  <div className="font-semibold text-gray-900">{product.details.grade}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Type</div>
                  <div className="font-semibold text-gray-900">{product.details.type}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Packaging</div>
                  <div className="font-semibold text-gray-900">{product.details.packaging}</div>
                </div>
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl w-full font-bold text-lg tracking-wide transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0">
                Add to Cart
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}