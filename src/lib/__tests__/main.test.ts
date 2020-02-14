import vision from '../main';

describe('vision()', () => {
  it('includes a version', () => {
    expect(vision.version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/);
  });

  it('includes the widget functions', () => {
    Object.values(vision.widgets).forEach(widget => {
      expect(widget).toBeInstanceOf(Function);
    });
  });

  it('includes the connectors functions', () => {
    Object.values(vision.connectors).forEach(connector => {
      expect(connector).toBeInstanceOf(Function);
    });
  });
});
