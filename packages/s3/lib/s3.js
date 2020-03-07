'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

module.exports = S3;

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
    newList = newList.concat(await listBucket(bucketName, prefix, results.NextContinuationToken));
  }

  return newList;
  }
}
