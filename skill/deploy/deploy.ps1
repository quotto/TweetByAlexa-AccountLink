$releasefile = "./deploy/skill.zip"

if(Test-Path $releasefile) {
   rm $releasefile
}
Compress-Archive -Path ./src/*,./node_modules -DestinationPath $releasefile
$conf = Get-Content ./deploy/deploy.properties -Raw | ConvertFrom-StringData
aws lambda update-function-code --region $conf.region --function-name $conf.function --zip-file fileb://deploy/skill.zip
