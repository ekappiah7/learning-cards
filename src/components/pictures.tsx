import {
  Apple, Bed, BookOpen, Bus, Cake, Car, Cat, Cloud, CookingPot, Dog, Drum, Egg, Fan, Fish, Flower, Gift,
  Guitar, Ham, Heart, House, Key, Lamp, Leaf, Lock, Map, Moon, Mouse, Nut, Pen, Piano, Pin, Pizza, Rabbit,
  Rat, Rocket, Star, Sun, Table, Tent, TrainFront, Umbrella, Van, Watch, Worm, Bug,
  type LucideProps,
} from 'lucide-react';

// Line pictures for words, drawn with Lucide icons (no photos or emoji).
// Add an entry here to use a new picture name in the data files.
const PICTURES = {
  apple: Apple, bed: Bed, book: BookOpen, bug: Bug, bus: Bus, cake: Cake, car: Car, cat: Cat, cloud: Cloud,
  dog: Dog, drum: Drum, egg: Egg, fan: Fan, fish: Fish, flower: Flower, gift: Gift, guitar: Guitar, ham: Ham,
  heart: Heart, house: House, key: Key, lamp: Lamp, leaf: Leaf, lock: Lock, map: Map, moon: Moon, mouse: Mouse,
  nut: Nut, pen: Pen, piano: Piano, pin: Pin, pizza: Pizza, pot: CookingPot, rabbit: Rabbit, rat: Rat,
  rocket: Rocket, star: Star, sun: Sun, table: Table, tent: Tent, train: TrainFront, umbrella: Umbrella,
  van: Van, watch: Watch, worm: Worm,
};

export type PictureName = keyof typeof PICTURES;

export function Picture({ name, size = 120, ...rest }: { name: PictureName } & LucideProps) {
  const C = PICTURES[name];
  return <C size={size} strokeWidth={1.5} aria-hidden {...rest} />;
}
