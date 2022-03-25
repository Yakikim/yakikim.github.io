---
layout: mynote
tags: [notes, APEX , devops, rest, op] 
created: 2021-11-15 13:15
modified: 2021-11-15 13:15
type: Document
title: Statuses returns from the REST and their meaning 
---
Week Of: [[2021-11-14]]
[[2021-11-15]]


#   REST Statuses

[[home]]/[[Professional]]
../[[APEX]]


## Status Codes

When you call any of the Database REST API endpoints, the Response header returns one of the standard HTTP status codes defined in the following table:

HTTP Status Code

Description

`200 OK`

The request was successfully completed. A 200 status is returned for a successful `GET` or `POST` method.

`201 Created`

The request has been fulfilled and resulted in a new resource being created. The response includes a Location header containing the canonical URI for the newly created resource.

A 201 status is returned from a synchronous resource creation or an asynchronous resource creation that completed before the response was returned.

`202 Accepted`

The request has been accepted for processing, but the processing has not been completed. The request may or may not eventually be acted upon, as it may be disallowed at the time processing actually takes place.

When specifying an asynchronous (`__detached=true`) resource creation (for example, when deploying an application), or update (for example, when redeploying an application), a 202 is returned if the operation is still in progress. If `__detached=false`, a 202 may be returned if the underlying operation does not complete in a reasonable amount of time.

The response contains a Location header of a job resource that the client should poll to determine when the job has finished. Also, returns an entity that contains the current state of the job.

`400 Bad Request`

The request could not be processed because it contains missing or invalid information (such as, a validation error on an input field, a missing required value, and so on).

`401 Unauthorized`

The request is not authorized. The authentication credentials included with this request are missing or invalid.

`403 Forbidden`

The user cannot be authenticated. The user does not have authorization to perform this request.

`404 Not Found`

The request includes a resource URI that does not exist.

`405 Method Not Allowed`

The HTTP verb specified in the request (`DELETE`, `GET`, `POST`, `PUT`) is not supported for this request URI.

`406 Not Acceptable`

The resource identified by this request is not capable of generating a representation corresponding to one of the media types in the Accept header of the request. For example, the client's Accept header request XML be returned, but the resource can only return JSON.

`415 Not Acceptable`

The client's ContentType header is not correct (for example, the client attempts to send the request in XML, but the resource can only accept JSON).

`500 Internal Server Error`

The server encountered an unexpected condition that prevented it from fulfilling the request.

`503 Service Unavailable`

The server is unable to handle the request due to temporary overloading or maintenance of the server. The `<ProductName>` REST web application is not currently running.