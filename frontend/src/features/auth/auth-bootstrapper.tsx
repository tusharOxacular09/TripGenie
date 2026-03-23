"use client";

import { useEffect } from "react";
import { bootstrapAuth } from "./auth.thunks";
import { useAppDispatch } from "../../store/hooks";

export function AuthBootstrapper() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  return null;
}
