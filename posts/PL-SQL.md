---
cssclasses: ltr
description:
header: Devop notes 
layout: layouts/post.njk
tags: [documents, plsql, queries, scripts]  
created: 2021-06-06 16:56
modified: 2021-06-06 16:57
type: Document
title: PL-SQL
---
[[2021-06-06]]
# PL-SQL
[[index | דף הבית]]/[[אחר]] 

## Grant and Synonym
```sql  
-- Synonym
CREATE OR REPLACE SYNONYM apexrest.OP_APEX_BAKASHA_TRANSPORT  FOR apps.op_bakasha_transport;
-- Grant
GRANT ALL ON OP_APEX_BAKASHA_TRANSPORT TO apexrest;


select * from dba_objects
where object_name = 'OP_APEX_BAKASHA_TRANSPORT';

```


#plsql
#professional