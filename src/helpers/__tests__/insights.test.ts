import insights, {
  writeDataAttributes,
  readDataAttributes,
  hasDataAttributes,
} from '../insights';

const makeDomElement = (html: string): HTMLElement => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.firstElementChild as HTMLElement) || div;
};

describe('insights', () => {
  test('default behaviour', () => {
    expect(
      insights('clickedRecordIDsAfterSearch', {
        ids: ['3'],
        eventName: 'Add to Cart',
      })
    ).toMatchSnapshot();
  });
});

describe('writeDataAttributes', () => {
  it('should output a string containing data-insights-* attributes', () => {
    expect(
      writeDataAttributes({
        method: 'clickedRecordIDsAfterSearch',
        payload: {
          ids: ['3'],
          eventName: 'Add to Cart',
        },
      })
    ).toMatchSnapshot();
  });
  it('should reject undefined payloads', () => {
    expect(() =>
      // @ts-ignore
      writeDataAttributes({
        method: 'clickedRecordIDsAfterSearch',
      })
    ).toThrowErrorMatchingSnapshot();
  });
  it('should reject non object payloads', () => {
    expect(() =>
      writeDataAttributes({
        method: 'clickedRecordIDsAfterSearch',
        // @ts-ignore
        payload: 2,
      })
    ).toThrowErrorMatchingSnapshot();
  });
  it('should reject non JSON serializable payloads', () => {
    const circularObject: any = { a: {} };
    circularObject.a.circle = circularObject;
    expect(() =>
      writeDataAttributes({
        method: 'clickedRecordIDsAfterSearch',
        payload: circularObject,
      })
    ).toThrowErrorMatchingSnapshot();
  });
});

describe('hasDataAttributes', () => {
  it('should return true when there is a data-insights-method attribute', () => {
    const domElement = makeDomElement(
      `<button
        data-insights-method="clickedRecordIDsAfterSearch"
        data-insights-payload='{"ids":["3"],"eventName":"Add to Cart"}'
        > Add to Cart </button>`
    );

    expect(hasDataAttributes(domElement)).toBe(true);
  });
  it("should return false when there isn't a data-insights-method attribute", () => {
    const domElement = makeDomElement(
      `<button
        data-insights-payload='{"ids":["3"],"eventName":"Add to Cart"}'
        > Add to Cart </button>`
    );

    expect(hasDataAttributes(domElement)).toBe(false);
  });
});

describe('readDataAttributes', () => {
  describe('on handwritten data-insights-* attributes', () => {
    let domElement: HTMLElement;

    beforeEach(() => {
      const payload = btoa(
        JSON.stringify({ ids: ['3'], eventName: 'Add to Cart' })
      );
      domElement = makeDomElement(
        `<button
        data-insights-method="clickedRecordIDsAfterSearch"
        data-insights-payload="${payload}"
        > Add to Cart </button>`
      );
    });

    it('should extract the method name', () => {
      expect(readDataAttributes(domElement).method).toEqual(
        'clickedRecordIDsAfterSearch'
      );
    });

    it('should extract the payload and parse it as a json object', () => {
      expect(readDataAttributes(domElement).payload).toEqual({
        ids: ['3'],
        eventName: 'Add to Cart',
      });
    });

    it('should reject invalid payload', () => {
      domElement = makeDomElement(
        `<button
        data-insights-method="clickedRecordIDsAfterSearch"
        data-insights-payload='xxx'
        > Add to Cart </button>`
      );
      expect(() =>
        readDataAttributes(domElement)
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe('on data-insights-* attributes generated with insights helper', () => {
    let domElement: HTMLElement;

    beforeEach(() => {
      domElement = makeDomElement(
        `<button
          ${insights('clickedRecordIDsAfterSearch', {
            ids: ['3'],
            eventName: 'Add to Cart',
          })}> Add to Cart </button>`
      );
    });

    it('should extract the method name', () => {
      expect(readDataAttributes(domElement).method).toEqual(
        'clickedRecordIDsAfterSearch'
      );
    });

    it('should extract the payload and parse it as a json object', () => {
      expect(readDataAttributes(domElement).payload).toEqual({
        ids: ['3'],
        eventName: 'Add to Cart',
      });
    });
  });
});
