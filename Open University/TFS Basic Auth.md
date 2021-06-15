---
tags: [documents, tfs, auth, security]  
created: 2021-05-09 15:54
modified: 2021-05-31 14:47
type: Document
title: TFS Basic Auth
---
[[2021-05-30]]
# TFS Basic Auth
[[HOME]]/[[Open University]]





# Basic auth for REST APIs
This page shows you how REST clients can authenticate themselves using **[basic authentication](http://en.wikipedia.org/wiki/Basic_access_authentication)** with an TFS user's email address and [API token](http://tfs1:8080/tfs/Codesafe/_details/security/tokens)




## Get an API token

Basic auth requires API tokens. You generate an API token for your TFS account and use it to authenticate anywhere where you would have used a password. This enhances security because:

-   you're not saving your primary account password outside of where you authenticate
-   you can quickly revoke individual API tokens on a per-use basis
-   API tokens will allow you to authenticate even if your TFS Cloud organization has two-factor authentication or SAML enabled.



## Simple example

Most client software provides a simple mechanism for supplying a user name (in our case, the email address) and API token that the client uses to build the required authentication headers. For example, you can specify the `-u` argument in cURL as follows:

Copy

```bash
curl -D- \
-u yakiki@openu.ac.il:<yakis_api_token> \
-X GET \
-H "Content-Type: application/json" \
"http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/wit/fields"
```

## Supply basic auth headers

You can construct and send basic auth headers. To do this you perform the following steps:

1.  Generate an API token for TFS using your [API token](http://tfs1:8080/tfs/Codesafe/_details/security/tokens)

-   .
-   Build a string of the form `yakiki@openu.ac.il:<yakis_api_token>`.
-   BASE64 encode the string.
    -   Linux/Unix/MacOS:
        

Copy

  ```bash  
  echo -n user@example.com:api_token_string | base64
 ```
    
-   Windows 7 and later:
    

Copy

```ps 
$Text = ‘user@example.com:api_token_string’ $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Text) $EncodedText = [Convert]::ToBase64String($Bytes) $EncodedText
```

2.  Supply an `Authorization` header with content `Basic` followed by the encoded string. For example, the string `fred:fred` encodes to `ZnJlZDpmcmVk` in base64, so you would make the request as follows:

Copy

```bash
curl -D- \ 
-X GET \ 
-H "Authorization: Basic ZnJlZDpmcmVk" \ 
-H "Content-Type: application/json" \
"http://tfs1:8080/tfs/Codesafe/Oracle%20APEX/_apis/wit/fields"
```

### Advanced topics

#### Authentication challenges

Because TFS permits a default level of access to anonymous users, it does not supply an authentication challenge. Some HTTP clients expect to receive an authentication challenge before they send an authorization header. This means that a client may not behave as expected. In this case, configure the client to supply the authorization header, as described above, rather than relying on its default mechanism.



#op/infrastractures/tfs
#tfs