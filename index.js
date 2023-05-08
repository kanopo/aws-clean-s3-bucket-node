const response = require("cfn-response")
const { S3Client, ListObjectsCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const send = (event, context, responseStatus, responseData, physicalResourceId) => {
  return new Promise((resolve) => {
    const done = context.done
    context.done = (event, context, responseStatus, responseData, physicalResourceId) => {
      resolve(done(event, context, responseStatus, responseData, physicalResourceId))
    }
    response.send(event, context, responseStatus, responseData, physicalResourceId)
  })
}

exports.handler = async (event, context) => {
  setTimeout(async (event, context) => {
    console.log("TIMEOUT")
    return await send(event, context, "FAILED", {
      body: "Lambda timeouted"
    })
  }, 1000 * 60) // the value is in milliseconds

  if (event.RequestType == "Delete") {
    const bucketName = event.ResourceProperties.BucketName;
    const region = event.ResourceProperties.Region;

    try {
      var s3 = new S3Client({
        region: region
      })
    } catch (e) {
      console.log(e)
    }

    const listResponse = await s3.send(new ListObjectsCommand({
      Bucket: bucketName,
    }))

    try {

      var keys = listResponse.Contents.map(obj => {
        return { Key: obj.Key }
      })
    } catch (e) {

      return await send(event, context, response.SUCCESS, {
        body: "Nothing to delete"
      })
    }
    const deleteResponse = await s3.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys
      }
    }))

    return await send(event, context, response.SUCCESS, {
      body: "Deletion completed " + deleteResponse
    })


  } else if (event.RequestType == "Update") {
    return await send(event, context, response.SUCCESS, {
      body: "Update completed"
    })
  } else if (event.RequestType == "Create") {
    return await send(event, context, response.SUCCESS, {
      body: "Create completed"
    })
  }
}
