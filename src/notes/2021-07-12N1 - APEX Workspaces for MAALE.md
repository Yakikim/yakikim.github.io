---
layout: mynote
tags: [notes, memo, op, apex, infrastructures ] 
created: 2021-07-12 18:00
modified: 2021-07-12 18:00
type: Document
title: תזכיר  2021-07-12
---
Week Of: [[2021-07-11]]
[[2021-07-12]]

#  תזכיר בנושא הגדרת WS ל-מעלה
[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
### בסביבת השירותים
הוגדר Workspace חדש:

|                 |             |
| --------------- | ----------- |
| Workspace Name  | MAALE       |
| db_scheme name  | APX_MAALE   |
| USER            | RONITZI     |
| PASSWORD        | Ronit1234   |
| RestEnabled SQL | TESTA-MAALE |
| LINK            |[[http://owldev1:7003/test/f?p=4000]]|

בנוסף,
- קונפגה הגישה של הWorkspace  מול REST_MAALE@TESTA בתצורת RestEnabled SQL 
- ביצעתי ייצוא וייבוא של אפליקציית ה-Sample של ה[[   2021-06-21N3 - AOP Requirements | AOP]]- [ApexOfficePrint](http://owldev1:7003/test/maale/r/aop_202/home) 
- העתקתי את השירותים שכבר יצרתי לאפליקציות אחרות אל האפליקציה הזו, כך שניתן להקים אפליקציה נוספת ולבצע Copy And Subscribe.
### בסביבת TESTA
הוגדר Workspace חדש (בגדול, אין צורך אבל הוא נוצר בעיקר לטובת ה-UI של ה-REST)

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| Workspace Name | REST_MAALE                                                       |
| db_scheme name | REST_MAALE                                                       |
| USER           | RONITZI                                                          |
| Enabled Scheme | ma                                                               |
| LINK           | [ TESTA](https://apex-ora-devtest.openu.ac.il:8443/oratesta/f?p=4850) |



## מסקנות ופעולות

- [x] #task מה המצב עם יצירת השירותים עבור רונית #שגיב 📅 2021-07-14 ✅ 2021-07-25
 
#op/apex/infrastructures 
#memo 
#op/memo