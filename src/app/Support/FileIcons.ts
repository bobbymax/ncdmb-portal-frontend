import claimLogo from "resources/assets/images/modules/claim.png";
import paymentBatch from "resources/assets/images/modules/paymentBatch.png";

interface FileImageProps {
  [key: string]: string;
}

const fileIcons: FileImageProps = {
  claim: claimLogo,
  paymentBatch,
};

export default fileIcons;
