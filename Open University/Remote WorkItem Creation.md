---
tags: apex, op, service , testing, infrastracture, tfs
type: Document
title: Remote TFS WorkItem Creation
---
[[2021-06-06]]
# Remote TFS WorkItem Creation
[[index]]/[[Professional]]

POST URL:
``` 
http://tfs1:8080/tfs/Codesafe/{{Project}}/_apis/wit/workitems/${{type}}?api-version=4.1
``` 

(For example, for BUG in Project called “Oracle APEX” the URL will be:  
```
  http://tfs1:8080/tfs/Codesafe/Oracle APEX/_apis/wit/workitems/$Bug?api-version=4.1
```
)  

Content-Type: application/json-patch+json
Minimal request’s Body for example:    
```
[
      {
        "op": "add",
        "path": "/fields/System.Title",
        "value": "הכפתור שלך לא עובד!"
      }
    ] 
```
Other Worktime’s attributes can be found in the GET-Request here: 
```
http://tfs1:8080/tfs/Codesafe/{{Project}}/_apis/wit/fields?api-version=4.1 
```  


  #op/notes 
  #professional 
  #tfs

