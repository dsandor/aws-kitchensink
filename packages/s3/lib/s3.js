'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

/**
 * S3 Helper toolkit.
 */
class S3 {
  /**
   * gets all the bucket objects recursively.
   * @param bucketName - the bucket to list
   * @param prefix - a prefix to filter the results.
   * @param nextToken - a continuation token if available
   * @return {Promise<any[]|string>}
   */
  static async listBucket(bucketName, prefix, nextToken) {
    let newList = [];
    const params = {
        Bucket: bucketName,
        MaxKeys: 1000,
        ContinuationToken: nextToken,
        Prefix: prefix,
      };
      const results = await s3.listObjectsV2(params).promise();

      if (results.Contents) {
      newList = newList.concat(results.Contents);
    }

    if (results.NextContinuationToken) {
      newList = newList.concat(await S3.listBucket(bucketName, prefix, results.NextContinuationToken));
    }

    return newList;
  }

  /**
   * Gets a JSON object from S3 and parses it to a JSON object.
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   * @param {string} encoding - default 'utf8'
   */
  static async getJSONObject(bucketName, key, encoding = 'utf8') {
    const params = {
      Key: key,
      Bucket: bucketName,
    };

    try {
      const file = await s3.getObject(params).promise();

      if (file && file.Body) {
        return JSON.parse(file.Body.toString(encoding));
      }
    } catch (e) {
      throw new Error(`Failed getting object from S3: ${e.message}`);
    }

    throw new Error('No content.');
  }

  /**
   * Gets a file as string from S3.
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   * @param {string} encoding - default 'utf8'
   */
  static async getString(bucketName, key, encoding = 'utf8') {
    const params = {
      Key: key,
      Bucket: bucketName,
    };

    try {
      const file = await s3.getObject(params).promise();

      if (file && file.Body) {
        return file.Body.toString(encoding);
      }
    } catch (e) {
      throw new Error(`Failed getting object from S3: ${e.message}`);
    }

    throw new Error('No content.');
  }


  /**
  * Gets a read stream from S3 object.
  * @param {string} bucketName the S3 bucket name.
  * @param {string} key - the Key name in S3
  * @param {string} encoding - default 'utf8'
  */
  static getJSONStream(bucketName, key, encoding = 'utf8') {
    const params = {
      Key: key,
      Bucket: bucketName,
    };

    try {
      return s3.getObject(params).createReadStream();
    } catch (e) {
      throw new Error(`Failed getting object from S3: ${e.message}`);
    }
  }
}

module.exports = S3;
