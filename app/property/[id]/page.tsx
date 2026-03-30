"use client";
// @ts-nocheck

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PropertyIndexPage() {
  const router = useRouter();
  const { id } = useParams();
  useEffect(() => {
    router.replace(`/property/${id}/accruals`);
  }, [id]);
  return null;
}
