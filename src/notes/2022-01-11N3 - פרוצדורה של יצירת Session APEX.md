---
layout: mynote
tags: [notes, apex, development, session, op] 
created: 2022-01-11 16:00
modified: 2022-01-11 16:00
type: Document
title:  פרוצדורה של יצירת Session APEX 
---
Week Of: [[2022-01-09]]
[[2022-01-11]]


#  תזכיר בנושא  פרוצדורה של יצירת Session APEX

[[home]]/[[Open University]]/[[Memos]]
../[[APEX]]
## רקע\תיאור

פרוצדורה שיוצרת Session כך ששליפות ופעולות שדורשות חיבור ל-APEX מסוגלות לרוץ גם דרך ה-TOAD או ה-Pl-SQL Developer.
````ad-code
title: plsql-code
```sql
DECLARE
V_RET NUMBER;
BEGIN
    
    apex_session.create_session (
    p_app_id   => 999,
    p_page_id  => 1,
    p_username => 'RONITZI' );
    --sys.dbms_output.put_line ('App is '||v('APP_ID)||', session is '||v('APP_SESSION'));

  V_RET:=APX_DEVOP.APEX_GENERAL_PKG.GET_AUTH('022500185','Maale.Reports');
  dbms_output.put_line('v_ret: '||v_ret);
END;



```
```` 
#memo #op/memo
