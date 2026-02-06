import { evalla } from '../src/index';
import Decimal from 'decimal.js';

describe('Value Property', () => {
  test('direct object value', async () => {
    const result = await evalla([
      { name: 'point', value: { x: 10, y: 20 } },
      { name: 'sum', expr: 'point.x + point.y' }
    ]);
    
    expect((result.values.sum as Decimal).toString()).toBe('30');
  });

  test('direct number value', async () => {
    const result = await evalla([
      { name: 'a', value: 10 },
      { name: 'b', value: 20 },
      { name: 'c', expr: 'a + b' }
    ]);
    
    expect((result.values.c as Decimal).toString()).toBe('30');
  });

  test('mixed with expr', async () => {
    const result = await evalla([
      { name: 'width', value: 100 },
      { name: 'height', expr: '50' },
      { name: 'area', expr: 'width * height' }
    ]);
    
    expect((result.values.area as Decimal).toString()).toBe('5000');
  });

  test('complex object without stringification', async () => {
    const complexObj = {
      dimensions: {
        width: 100,
        height: 50
      },
      scale: 2
    };
    
    const result = await evalla([
      { name: 'box', value: complexObj },
      { name: 'scaledWidth', expr: 'box.dimensions.width * box.scale' },
      { name: 'scaledHeight', expr: 'box.dimensions.height * box.scale' }
    ]);
    
    expect((result.values.scaledWidth as Decimal).toString()).toBe('200');
    expect((result.values.scaledHeight as Decimal).toString()).toBe('100');
  });
});
