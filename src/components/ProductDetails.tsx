interface ProductDetailsProps {
    location: string;
    condition: string;
  }
  
  export const ProductDetails = ({ location, condition }: ProductDetailsProps) => (
    <div className="px-3 pt-5">
      <h1 className="font-semibold text-[1.5rem]">Details</h1>
      <p>
        <span className="font-medium">Location: </span>
        {location}
      </p>
      <p>
        <span className="font-medium">Condition: </span>
        {condition}
      </p>
    </div>
  );