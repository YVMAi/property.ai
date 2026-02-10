export interface PropertyGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  tags: string[];
  createdAt: string;
}

export const GROUP_COLOR_PRESETS = [
  { label: 'Soft Blue', value: 'hsl(210,60%,82%)' },
  { label: 'Sage Green', value: 'hsl(120,30%,77%)' },
  { label: 'Warm Beige', value: 'hsl(40,40%,88%)' },
  { label: 'Lavender', value: 'hsl(280,40%,82%)' },
  { label: 'Peach', value: 'hsl(20,70%,85%)' },
  { label: 'Mint', value: 'hsl(160,40%,80%)' },
  { label: 'Rose', value: 'hsl(350,50%,85%)' },
  { label: 'Sand', value: 'hsl(45,30%,82%)' },
];
