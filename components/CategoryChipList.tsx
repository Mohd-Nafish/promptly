import { CategoryChip } from "./CategoryChip";
import { ScrollView } from "react-native";

type CategoryChipListProps = {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
};

export function CategoryChipList({
  categories,
  selected,
  onSelect,
}: CategoryChipListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="pr-2"
    >
      {categories.map((category) => (
        <CategoryChip
          key={category}
          label={category}
          active={selected === category}
          onPress={() => onSelect(category)}
        />
      ))}
    </ScrollView>
  );
}
