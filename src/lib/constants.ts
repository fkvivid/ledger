export const TYPE_META: Record<string, { label: string; color: string }> = {
  essential: { label: "Essential", color: "#1f6b57" },
  extra: { label: "Extra", color: "#b8863b" },
  transport: { label: "Transport", color: "#4c7a9c" },
  food: { label: "Food", color: "#c8722f" },
  luxury: { label: "Luxury", color: "#9a5b76" },
  custom: { label: "Custom", color: "#6b7873" },
};

export function typeMeta(type: string | null | undefined) {
  return TYPE_META[type ?? "custom"] ?? TYPE_META.custom;
}
