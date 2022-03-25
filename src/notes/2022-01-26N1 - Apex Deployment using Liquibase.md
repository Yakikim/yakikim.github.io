---
layout: mynote
cssclasses: rtl
tags: [notes, memo, apex, liquibase, sqlcl, deploy,linux, find, printf, sed, bash,shell, management, infrastractures, devops, op] 
created: 2022-01-26 21:38
modified: 2022-01-26 21:38
type: Document
title:  Apex Deployment using Liquibase 
---
Week Of: [[2022-01-23]]
[[2022-01-26]]


#  תזכיר בנושא  Apex Deployment using Liquibase


[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
לאחר שראיתי כמה
[CI/CD & DEVOPS for the Oracle Database & Application Express (thatjeffsmith.com)](https://www.thatjeffsmith.com/archive/2021/04/ci-cd-with-oracle-database-and-apex/)
<script async class="speakerdeck-embed" data-id="3907387cd19546b3b534c62d8168872a" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

![](https://speakerdeck.com/thatjeffsmith/cd-with-oracle-database-and-apex)

## תהליך תקין לכאורה
1. הורדת האפליקציה בפקודה הבאה בלבד:
```plsql
 lb genobject -type apex -applicationid 1000 -skipExportDate -expOriginalIds -expPubReports -expSavedReports -expIRNotif -expTranslations
```
(לא בדקתי, אבל ניתן להשתמש בפרמטר -expComponents לייצא קומפוננטה באופן ספציפי)
> ניסיון טוב לייצא את כל האפליקציה כגיבוי:
>``` 
>set APEX_BASE=D:\OP\GitREPOS\APEXRepositories\APEX-MAIN
set CLASSPATH=%APEX_BASE%\utilities\ojdbc8.jar;%APEX_BASE%\utilities
>```
>ואז להריץ את זה
>``` 
 "C:/java8/bin/java" oracle.apex.APEXExport -db "//apexapp-devtest.openu.ac.il:1521/apexqa" -user APX_ADMIN -password YADMIN -workspaceid 200000 -applicationid 9999 -expOriginalIds -split
> ```
> אחרי זה חובה לבצע בsqlcl לפני ה-Import אם לא, זה יפול על שגיאת קידוד
> ```sql
set encoding windows-1252
>```
>```sql
install.sql@ 
>```

3. הורדת קובץ Controller.xml
```plsql
lb gencontrolfile
```

5. החלפת הסטרינג הבסיסי בזה של האפליקציה
```bash
sed -i 's+{filename.xml}+f1000.xml+g' controller.xml

```
6. החלפת UTF-8  ב - Windows-1255 
```bash
for i in $(find . -type f -maxdepth 7 -mindepth 1 -printf "%p\n"); do 
sed -i '1 s/UTF-8/Windows-1255/g' $i; 
done;
```

8. הגדרת פלט DBMS 
```plsql
set serveroutput on  
```

10 . התחברות ל-Workspace
```plsql
 declare
    l_workspace_id number;
    begin
    l_workspace_id := apex_util.find_security_group_id (p_workspace => 'GENERAL');
    apex_util.set_security_group_id (p_security_group_id => l_workspace_id);
    APEX_UTIL.PAUSE(2);
    dbms_output.put_line(l_workspace_id);
    dbms_output.put_line('ok');
    end;
  /
```

12. בדיקת סטטוס
```plsql
lb status -changelog controller.xml

```

14. ייבוא לאפליקציה
```plsql
lb update -changelog controller.xml -debug -log

```
## תהליך ייצוא וייבוא ORDS Scheme
באמצעות sqlcl (אחרי חיבור לסביבה):
```sql
SPOOL <FILENAME.SQL> 
REST export
echo /
SPOOL OFF
```
התחברות לסביבת היעד
```sql
set encoding Windows-1255
@<FILENAME.SQL>
```

## משתתפים
- [x] #task להשלים 📅 2022-01-27 ✅ 2022-02-27
## מסקנות ופעולות
- [x] #task לבדוק הרצה של פקודה דומה 📅 2022-01-27 ✅ 2022-02-27
```
Lb genobject -type apex -applicationid {id} -skipExportDate -expOriginalIds -split -dir {dir}
```

- [x] #task לנסות להריץ באופן שמתאר שי שמלצר 📅 2022-01-27 ✅ 2022-02-27
 
[CI/CD Automation for Oracle APEX Apps](https://blogs.oracle.com/shay/post/cicd-automation-for-oracle-apex-apps)


## פונקציית החלפת סטרינג
```bash
for i in $(find . -type f -maxdepth 7 -mindepth 1 -printf "%p\n"); do     sed -i '1 s/UTF-8/Windows-1255/g' $i; done;

```

#memo #op/memo
