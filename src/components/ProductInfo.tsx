import { SaveSvg } from "@/assets/svgs/Svg";

interface ProductInfoProps {
  name: string;
  price: number;
  description?: string;
  isSaved: boolean;
  onSave: () => void;
}

export const ProductInfo = ({ name, price, description, isSaved, onSave }: ProductInfoProps) => (
  <div className="flex items-center justify-between px-3 pt-7">
    <div className="-space-y-2">
      <p>
        <span className="text-bsutheme font-medium">₱</span>
        <span className="text-[1.7rem] font-semibold text-bsutheme">
          {Number(price).toLocaleString("fil-PH", { maximumFractionDigits: 0 })}
        </span>
      </p>
      <h2 className="text-[1.4rem] font-medium">{name}</h2>
      {description && <p>{description}</p>}
    </div>
    <div className="cursor-pointer" onClick={onSave}>
      <SaveSvg isSaved={isSaved} />
    </div>
  </div>
);
