// app/dashboard/campaign-creator/AbToggle.tsx
// PRD v1.3, Section 7: A/B toggle and split form

"use client";

import { useFormContext } from "react-hook-form";

export default function AbToggle() {
  const { register, watch } = useFormContext();
  const isAbTest = watch("isAbTest");

  return (
    <div>
      <label>
        <input type="checkbox" {...register("isAbTest")} />
        Enable A/B Test
      </label>

      {isAbTest && (
        <div>
          <label>Script A</label>
          <select {...register("script_a_id")}>{/* Options for scripts */}</select>

          <label>Script B</label>
          <select {...register("script_b_id")}>{/* Options for scripts */}</select>

          <label>Split Percentage</label>
          <input type="number" defaultValue={50} {...register("split_percentage")} />
        </div>
      )}
    </div>
  );
}
