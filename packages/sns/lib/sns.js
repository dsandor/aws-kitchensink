'use strict';

class SNS {
  /**
   * Gets an array of JSON Parsed message bodies from an SNS event.
   * @param snsEvent - SNS Event object as sent to a Lambda subscription.
   * @return {any[]} - An array of JSON parsed objects.
   */
  static getRecordBodies(snsEvent) {
    try {
      SNS.validateLambdaSnsEventMessageFormat(snsEvent);
    } catch (err) {
      throw err;
    }

    return snsEvent.Records.map(r => JSON.parse(r.Sns.Message));
  }

  /**
   * Gets first record body from an SNS event.
   * @param snsEvent - SNS Event object as sent to a Lambda subscription.
   * @return {any} - The first JSON parsed objects.
   */
  static getFirstRecordBody(snsEvent) {
    const bodies = SNS.getRecordBodies(snsEvent);
    if (bodies.length > 0) return bodies[0];
  }

  /**
   * Validates an Sns Event object is correct. If the object is bad an error message is thrown, otherwise it is correct.
   * @param snsEvent - SNS Event object as sent to a Lambda subscription.
   * @throws Error - with meaningful validation error message if the object format is incorrect.
   */
  static validateLambdaSnsEventMessageFormat(snsEvent) {
    if (!snsEvent) throw new Error('No event.');
    if (!snsEvent.Records) throw new Error('No Records array found, malformed sns event message.');
    if (!Array.isArray(snsEvent.Records)) throw new Error('Records property is not an array.');
    if (snsEvent.Records.length < 1) throw new Error('Records array is empty.');
  }
}

module.exports = SNS;
