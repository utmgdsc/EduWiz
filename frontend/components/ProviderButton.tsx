import type { AuthProvider } from "firebase/auth";
import type { ProviderData } from "@/lib/context/auth";

import clsx from "clsx";

import { type ButtonProps, Button } from "@/components/ui/button";

type ProviderButtonProps = ButtonProps & {
  provider: ProviderData;
  onClick: (provider: AuthProvider) => void;
};

const ProviderButton = ({
  provider,
  onClick,
  ...props
}: ProviderButtonProps) => (
  <Button
    className={clsx("font-semibold space-x-1", props.className)}
    onClick={() => onClick(provider.provider)}
  >
    {provider.icon} <span>{props.children}</span>
  </Button>
);

export default ProviderButton;
export type { ProviderButtonProps };
