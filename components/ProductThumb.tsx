import Image from "next/image";

type ThumbSource = {
  name: string;
  photo?: string;
  gradient: [string, string];
};

export default function ProductThumb({
  product,
  className,
  sizes = "320px",
}: {
  product: ThumbSource;
  className: string;
  sizes?: string;
}) {
  if (product.photo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={product.photo} alt={product.name} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center text-3xl text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${product.gradient[0]}, ${product.gradient[1]})` }}
    >
      <span className="absolute right-2.5 top-2 text-base text-white/85">♥</span>
      <span>🧁</span>
    </div>
  );
}
