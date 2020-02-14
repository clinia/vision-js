import { createSingleSearchResponse } from '../createAPIResponse';

describe('createSingleSearchResponse', () => {
  it('calculates total from records', () => {
    expect(
      createSingleSearchResponse({
        records: Array.from({ length: 100 }),
      })
    ).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({
          total: 100,
        }),
      })
    );
  });

  it('calculates numPages from total & perPage', () => {
    expect(
      createSingleSearchResponse({
        meta: {
          total: 100,
          perPage: 20,
        },
      })
    ).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({
          numPages: 5,
        }),
      })
    );
  });

  it('calculates numPages from default total & perPage', () => {
    expect(createSingleSearchResponse({})).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({
          numPages: 0,
        }),
      })
    );
  });
});
