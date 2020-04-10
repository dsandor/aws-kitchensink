'use strict';

const SNS = require('..');
const exampleSnsEvent = require('../lib/example-sns-event.json');

describe('aws-kitchensink-sns', () => {
  it('should get a list of record bodies', () => {
    const bodies = SNS.getRecordBodies(exampleSnsEvent);

    expect(bodies).toBeDefined();
    expect(Array.isArray(bodies)).toBe(true);
    expect(bodies.length).toBeGreaterThan(0);
  });

  it('should get the first body in an sns event', () => {
    const body = SNS.getFirstRecordBody(exampleSnsEvent);

    expect(body).toBeDefined();
    expect(body.test).toEqual(1);
    expect(body.test2).toEqual("2");
  });
});
