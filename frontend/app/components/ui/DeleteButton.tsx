"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(
      `http://localhost:8000/api/admin/blog/destroy/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      className="py-2 px-5 bg-red-500 hover:bg-red-600 transition rounded-lg"
      onClick={handleDelete}
    >
      Delete
    </button>
  );
}
