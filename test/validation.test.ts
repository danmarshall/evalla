import { evalla, ValidationError } from '../src/index';

describe('Input Validation', () => {
  test('non-array input', async () => {
    await expect(
      evalla({} as any)
    ).rejects.toThrow(ValidationError);
  });

  test('missing name', async () => {
    await expect(
      evalla([{ name: '', expr: '1' }])
    ).rejects.toThrow(ValidationError);
  });

  test('duplicate names', async () => {
    await expect(
      evalla([
        { name: 'a', expr: '1' },
        { name: 'a', expr: '2' }
      ])
    ).rejects.toThrow(ValidationError);
  });

  test('variable names cannot start with $', async () => {
    await expect(
      evalla([
        { name: '$myvar', expr: '1' }
      ])
    ).rejects.toThrow(ValidationError);
  });

  test('variable names cannot contain dots', async () => {
    await expect(
      evalla([
        { name: 'point.x', expr: '10' }
      ])
    ).rejects.toThrow(ValidationError);
  });

  test('must provide either expr or value', async () => {
    await expect(
      evalla([
        { name: 'test' }
      ])
    ).rejects.toThrow(ValidationError);
  });
});
