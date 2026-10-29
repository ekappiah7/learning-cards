// The two guides. Each has a recorded voice (see scripts/voice) and hosts
// some areas; the other one cheers. Rename them here.

export type CharacterId = 'jabari' | 'jamila';

export const CHARACTERS: Record<CharacterId, { name: string; animal: 'lion' | 'owl'; voice: 'lewis' | 'alice'; gender: 'male' | 'female' }> = {
  jabari: { name: 'Jabari', animal: 'lion', voice: 'lewis', gender: 'male' },
  jamila: { name: 'Jamila', animal: 'owl', voice: 'alice', gender: 'female' },
};

// Who hosts each area. Screens outside an area are hosted by Jabari.
export const AREA_HOST: Record<string, CharacterId> = {
  reading: 'jamila',
  numbers: 'jabari',
  logic: 'jamila',
  play: 'jabari',
};

export const otherCharacter = (id: CharacterId): CharacterId => (id === 'jabari' ? 'jamila' : 'jabari');
