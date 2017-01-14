const test = require('tape');

test('demo test', (t) => {
  t.pass();
});

test.onFinish(() => {
  window.close();
});