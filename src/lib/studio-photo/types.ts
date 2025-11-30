export type ImageKey = "productOnly" | "full" | "closeup";

export type ProductType = "clothing" | "shoes" | "leather";

export type ModelGender = "male" | "female";

export type ModelEthnicity = "Maghrebi" | "African" | "Latin" | "Asian" | "European";

export type ModelBeard = "beard" | "no_beard" | null;

export type Style = {
  name: string;
  description: string;
};

export type GeneratedImages = {
  productOnly?: string;
  full?: string;
  closeup?: string;
};
