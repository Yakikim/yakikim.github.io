git log -1;
pulltext=$(git pull);
uptodate="Already up to date.";
ppwd=$(pwd);
if [[ "$pulltext" == *"$uptodate"* ]]; then 
 if [[ "$ppwd" == *"c/Users/yakik/MySite"* ]];#is my private computer
 then
  echo "$(tput setaf 2)$(tput setab 7)Done!$(tput sgr 0)";
 "C:\Users\yakik\AppData\Local\Obsidian\Obsidian.exe";
 else #The other computer
  echo "$(tput setaf 2)$(tput setab 7)Done!$(tput sgr 0)";
 "C:\Users\yakiki\AppData\Local\Obsidian\Obsidian.exe";
 fi
 else echo " $(tput setaf 1)Please re-run CustomStartObsitian.sh again,  because there was unmerged changes $(tput sgr 0) ";
 fi;
git add .;
git commit -m "auto commit before close";
git push;
read -n 1 -s -r -p "Press any key to continue";
