"use client";

import { Provider } from "react-redux";
import { store } from "./index";

type Props = {
  children: React.ReactNode;
};

export function StoreProvider({ children }: Props) {
  return <Provider store={store}>{children}</Provider>;
}
