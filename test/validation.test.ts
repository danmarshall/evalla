import { evalla } from '../src/index';

describe('Input Validation', () => {
  test('non-array input', async () => {
    await expect(
      evalla({} as any)
    ).rejects.toThrow(/Input must be an array/);
  });

  test('missing name', async () => {
    await expect(
      evalla([{ name: '', expr: '1' }])
    ).rejects.toThrow(/non-empty string "name"/);
  });

  test('duplicate names', async () => {
    await expect(
      evalla([
        { name: 'a', expr: '1' },
        { name: 'a', expr: '2' }
      ])
    ).rejects.toThrow(/Duplicate name: a/);
  });

  test('variable names cannot start with $', async () => {
    await expect(
      evalla([
        { name: '$myvar', expr: '1' }
      ])
    ).rejects.toThrow(/Variable names cannot start with \$/);
  });

  test('variable names cannot contain dots', async () => {
    await expect(
      evalla([
        { name: 'point.x', expr: '10' }
      ])
    ).rejects.toThrow(/Variable names cannot contain dots/);
  });

  test('must provide either expr or value', async () => {
    await expect(
      evalla([
        { name: 'test' }
      ])
    ).rejects.toThrow(/must have either "expr" or "value"/);
  });
});
