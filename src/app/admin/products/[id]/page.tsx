import ProductEditor from "@/components/ProductEditor";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductEditor params={params} />;
}
