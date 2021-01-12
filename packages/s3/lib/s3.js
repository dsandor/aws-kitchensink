'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1', signatureVersion: 'v4' });

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
      newList = newList.concat(
        await S3.listBucket(bucketName, prefix, results.NextContinuationToken)
      );
    }

    return newList;
  }

  /**
   * Gets the object metadata as a JSON object.
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   */
  static async getMetadata(bucketName, key) {
    try {
      const head = await S3.headObject(bucketName, key);

      return head.Metadata;
    } catch (e) {
      throw new Error(`Failed getting metadata from S3: ${e.message}`);
    }
  }

  /**
   * Gets the HEAD data about an S3 object.
   * See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   */
  static async headObject(bucketName, key, additionalParams = {}) {
    const params = {
      Key: key,
      Bucket: bucketName,
      ...additionalParams,
    };

    try {
      return await s3.headObject(params).promise();
    } catch (e) {
      throw new Error(`Failed heading object from S3: ${e.message}`);
    }
  }

  /**
   * Gets a S3 object without modification. Pass through to sdk.
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   */
  static async getObject(bucketName, key, additionalParams = {}) {
    const params = {
      Key: key,
      Bucket: bucketName,
      ...additionalParams,
    };

    try {
      const file = await s3.getObject(params).promise();

      return file;
    } catch (e) {
      throw new Error(`Failed getting object from S3: ${e.message}`);
    }
  }

  /**
   * Gets a JSON object from S3 and parses it to a JSON object.
   * @param {string} bucketName the S3 bucket name.
   * @param {string} key - the Key name in S3
   * @param {string} encoding - default 'utf8'
   */
  static async getJSONObject(bucketName, key, encoding = 'utf8', additionalParams = {}) {
    const params = {
      Key: key,
      Bucket: bucketName,
      ...additionalParams,
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
   * Generates a presigned url for an object in S3. Defaults to getObject permission and 5 minute expiration.
   * @param {string} bucketName - the name of the s3 bucket
   * @param {string} key - the key name or file path to the object in s3
   * @param {string} permissions - the rights to grant.
   * @param {number} expirationInSeconds - time the url is good for.
   * @param {object} metadata - key value pair of required metadata to be passed with the request.
   */
  static async getSignedUrl(
    bucketName,
    key,
    permissions = 'getObject',
    expirationInSeconds = 60 * 5,
    metadata = {},
    additionalParams = {}
  ) {
    return await s3.getSignedUrlPromise(permissions, {
      Bucket: bucketName,
      Key: key,
      Expires: expirationInSeconds,
      Metadata: metadata,
      ...additionalParams,
    });
  }

  /**
   * Writes a JSON object to S3 bucket.
   * @param {string} bucketName - The name of the S3 bucket.
   * @param {string} key - The key of the object (aka: filename)
   * @param {object} metadata - The metadata of the object
   * @param {*} dataObject - A Javascript object that will be stringified / minified and written to S3.
   */
  static async putJSONObject(bucketName, key, dataObject, metadata, additionalParams = {}) {
    return S3.putStringObject(
      bucketName,
      key,
      JSON.stringify(dataObject, null, 0),
      metadata,
      ...additionalParams,
    );
  }

  /**
   * Writes string data to an S3 bucket.
   * @param {string} bucketName - The name of the S3 bucket.
   * @param {string} key - The key of the object (aka: filename)
   * @param {object} metadata - The metadata of the object
   * @param {string} dataString - The data to be written in string format.
   */
  static async putStringObject(bucketName, key, dataString, metadata, additionalParams = {}) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: dataString,
      Metadata: metadata,
      ...additionalParams,
    };

    return s3.putObject(params).promise();
  }

  /**
   * Writes string data to an S3 bucket.
   * @param {string} bucketName - The name of the S3 bucket.
   * @param {string} key - The key of the object (aka: filename)
   * @param {object} metadata - The metadata of the object
   * @param {any} data - The data to be written. Any supported object (see aws docs). String | Buffer ...etc
   */
  static async putObject(bucketName, key, data, metadata, additionalParams = {}) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: data,
      Metadata: metadata,
      ...additionalParams,
    };

    return s3.putObject(params).promise();
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

  /**
   * Returns the underlying AWS S3 object to allow direct use.
   */
  static getS3Instance() {
    return s3;
  }
}

module.exports = S3;
