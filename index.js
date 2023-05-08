const S3 = require('aws-sdk/clients/s3');
const response = require('cfn-response')
exports.handler = (event, context) => {
  if (event.RequestType == "Delete") {
    const bucketName = event.ResourceProperties.BucketName;
    try {
      var s3 = new S3({
        //TODO: get region from stack
        region: "eu-north-1"
      });
    } catch (e) {
      return response.send(event, context, response.FAILED, { body: e })
    }
    s3.listObjects({
      Bucket: bucketName,
    }, (err, data) => {
      if (err) {
        console.log(err)

      }
      else {
        //console.log(data.Contents)
        const arrayOfKeys = data.Contents.map(obj => {
          return { Key: obj.Key };
        });

        //console.log(arrayOfKeys);

        s3.deleteObjects({
          Bucket: bucketName,
          Delete: {
            Objects: arrayOfKeys
          }
        }, (err, data) => {
          if (err) {
            return response.send(event, context, response.FAILED, { body: "Deletion failed: " + err })
          }
          else {
            return response.send(event, context, response.SUCCESS, { body: "Deletion completed" })
          }

        })
      }
    })

  } else if (event.RequestType == "Update") {
    return response.send(event, context, response.SUCCESS, {
      body: "update"
    })
  } else if (event.RequestType == "Create") {
    return response.send(event, context, response.SUCCESS, {
      body: "create"
    })
  }
}

