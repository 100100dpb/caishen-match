import { GODS, GOD_LIST } from '../constants/gods';

describe('gods database', () => {
  it('has at least 10 gods', () => {
    expect(GOD_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('every god has required fields', () => {
    GOD_LIST.forEach(god => {
      expect(god.id).toBeTruthy();
      expect(god.name).toBeTruthy();
      expect(god.title).toBeTruthy();
      expect(god.description).toBeTruthy();
      expect(god.element).toMatch(/^(fire|water|wood|earth|metal)$/);
      expect(god.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(god.bgColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Array.isArray(god.tags)).toBe(true);
      expect(god.tags.length).toBeGreaterThan(0);
      expect(Array.isArray(god.affinity)).toBe(true);
      expect(god.blessing.length).toBeGreaterThanOrEqual(3);
      god.blessing.forEach(b => expect(b.length).toBeGreaterThan(0));
      expect(god.accessories.length).toBeGreaterThanOrEqual(3);
      god.accessories.forEach(a => expect(a.length).toBeGreaterThan(0));
    });
  });

  it('every element has at least one god', () => {
    const elements = new Set(GOD_LIST.map(g => g.element));
    expect(elements).toEqual(new Set(['fire', 'water', 'wood', 'earth', 'metal']));
  });

  it('god id in GODS record matches the id field', () => {
    Object.entries(GODS).forEach(([key, god]) => {
      expect(god.id).toBe(key);
    });
  });

  it('core gods exist: zhao, guan, bigan, liuhai, fanli', () => {
    const required = ['zhao', 'guan', 'bigan', 'liuhai', 'fanli'] as const;
    required.forEach(id => {
      expect(GODS[id]).toBeDefined();
    });
  });
});
