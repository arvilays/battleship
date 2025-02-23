const Ship = require('./ship');

describe('ship', () => {
  const ship = new Ship();
  
  test('test ship', () => {
    expect(ship.test()).toBe('test');
  });
});