import BackButton from "@/components/BackButton";
import ProductDetail from "@/modules/products/product-detail";

export default function ProductDetailPage() {
  return (
    <div className="container py-10">
      <BackButton />
      <ProductDetail />
    </div>
  );
}
